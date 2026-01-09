import { StateManager } from './StateManager.js';
import { PolicyEngine } from './PolicyEngine.js';
import { LLMInterface } from './LLMInterface.js';
import type { BrainResponse, Stage } from './types.js';

export class Orchestrator {
    private llm: LLMInterface;

    constructor() {
        this.llm = new LLMInterface();
    }

    async processMessage(userId: string, sessionId: string, message: string, language: string = 'English'): Promise<BrainResponse> {
        // 1. Load State
        const state = await StateManager.getState(sessionId, userId);

        // --- STATE MACHINE PROGRESSION (Simple Heuristic for Prototype) ---
        let nextStageString: Stage | undefined = undefined;

        // If Greeting/Rapport, and message is long enough or we've had a few turns, try to move to task
        // Ideally this would be stored in DB (turnCount), for now we simulate flow:
        if (state.stage === 'GREETING' && message.length > 5) {
            nextStageString = 'RAPPORT_BUILDING';
        } else if (state.stage === 'RAPPORT_BUILDING' && Math.random() > 0.3) {
            // 70% chance to move to task after first rapport message
            nextStageString = 'PRE_TASK';
        }

        if (nextStageString) {
            await StateManager.updateState(sessionId, { stage: nextStageString });
            state.stage = nextStageString; // Local update for this run
        }
        // -------------------------------------------------------------

        // 2. Policy Check & Forced Injection logic
        let policy = PolicyEngine.decide(state);

        // Force Task every 3 turns if not already in a task mode
        const turns = state.turnsSinceLastTask || 0;

        // Only force if we are in a conversational stage where tasks belong
        if (turns >= 3 && !policy.task_type && (state.stage === 'RAPPORT_BUILDING' || state.stage === 'PRE_TASK' || state.stage === 'POST_TASK')) {
            console.log("⚡ Forced Task Injection Triggered (Turn " + turns + ")");

            // Randomly pick a task not recently used? For now, just rotate or pick random.
            const tasks = ['CLOCK_DRAWING', 'MEMORY_RECALL', 'ATTENTION'];
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

            policy = {
                allowed_action: 'SUGGEST_TASK',
                task_type: randomTask,
                difficulty: 'EASY'
            };
        }

        // --- DEBUG OVERRIDES (Kept for testing) ---
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("/clock")) {
            policy = { allowed_action: 'SUGGEST_TASK', task_type: 'CLOCK_DRAWING', difficulty: 'EASY' };
        } else if (lowerMsg.includes("/memory")) {
            policy = { allowed_action: 'SUGGEST_TASK', task_type: 'MEMORY_RECALL', difficulty: 'EASY' };
        } else if (lowerMsg.includes("/attention")) {
            policy = { allowed_action: 'SUGGEST_TASK', task_type: 'ATTENTION', difficulty: 'EASY' };
        }
        // -----------------------

        // 3. LLM Generation
        const llmOutput = await this.llm.generateResponse({
            user_message: message,
            language,
            state,
            policy,
            tone: "supportive, warm, grandchild-like." // Tone is handled in system prompt now, but we pass simple fallback
        });

        // 4. Update State (Side Effects)
        const updates: any = {};

        // If we suggested a task, move to TASK_ACTIVE and RESET counter
        if (llmOutput.action && llmOutput.action.type) {
            updates.lastTaskType = llmOutput.action.type ?? null;
            updates.lastTaskTimestamp = new Date();
            updates.stage = 'TASK_ACTIVE';
            updates.turnsSinceLastTask = 0; // RESET
        } else {
            // Otherwise increment
            updates.turnsSinceLastTask = turns + 1;
        }

        await StateManager.updateState(sessionId, updates);

        // 5. Construct Final Response
        return {
            reply: llmOutput.reply,
            metadata: {
                phase: state.conversationPhase,
                suggestedTask: (llmOutput.action && llmOutput.action.type && llmOutput.action.type !== 'null') ? {
                    type: llmOutput.action.type as string,
                    difficulty: (llmOutput.action.difficulty && llmOutput.action.difficulty !== 'null') ? llmOutput.action.difficulty : "EASY"
                } : undefined
            }
        };
    }

    async handleTaskCompletion(userId: string, sessionId: string, taskType: string, score: number, resultData: any): Promise<BrainResponse> {
        // 1. Update State
        const state = await StateManager.getState(sessionId, userId);

        const updates: any = {
            tasksDoneToday: state.tasksDoneToday + 1,
            stage: 'POST_TASK',
            // Add to history
            taskResults: [...state.taskResults, {
                taskType,
                score,
                metadata: resultData,
                timestamp: new Date()
            }]
        };
        await StateManager.updateState(sessionId, updates);

        // 2. Generate Follow-up Response
        const taskName = taskType === 'MEMORY_RECALL' ? 'Word Spark' :
            taskType === 'ATTENTION' ? 'Reaction Challenge' :
                taskType.replace('_', ' ').toLowerCase();

        // Detailed Performance Context for LLM
        let details = "";
        let isGoodPerformance = false;

        // Normalize Score & Extract Pattern
        if (taskType === 'ATTENTION') {
            const streak = resultData.streak || 0;
            const maxStreak = resultData.maxStreak || streak;
            isGoodPerformance = maxStreak > 5;
            details = `User had a max streak of ${maxStreak}.`;
        } else if (taskType === 'MEMORY_RECALL') {
            // Memory task sends 0-100
            isGoodPerformance = score >= 80;
            details = `User scored ${score}%.`;
        } else if (taskType === 'CLOCK_DRAWING') {
            // Clock sends 0.0 or 1.0, or sometimes distance
            isGoodPerformance = score > 0.8;
            details = isGoodPerformance ? "Drawn correctly." : "needed some help.";
        } else {
            isGoodPerformance = score > 0.7; // Fallback
        }

        const sentiment = isGoodPerformance ? "SUCCESS" : "EFFORT";

        const feedbackPrompt = `[SYSTEM MESSAGE]: The user just completed the ${taskName} activity.
        Result Context: ${details}
        Performance Level: ${sentiment}.
        
        Please respond with two distinct parts:
        1. Specific praise based on the result (e.g. "Wow, a streak of ${resultData.maxStreak}!" or "You got them all!").
        2. A gentle follow-up question to transition back to chat. 
        
        CRITICAL: If the task (e.g., Clock Drawing) has nothing to do with the previous conversation topic (e.g., Diwali), DO NOT force a connection. "Do you remember clocks at Diwali?" is nonsensical. Instead, just praise the task, then purely ask about the topic again.
        `;

        // Force policy to chat only
        const policy = { allowed_action: 'CHAT_ONLY', task_type: null, difficulty: null } as any;

        const llmOutput = await this.llm.generateResponse({
            user_message: feedbackPrompt,
            language: 'English',
            state: { ...state, stage: 'POST_TASK' },
            policy,
            tone: "celebratory, warm. DO NOT sound robotic. Be specific about their achievement if possible."
        });

        return {
            reply: llmOutput.reply,
            metadata: {
                phase: state.conversationPhase
            }
        };
    }
}
