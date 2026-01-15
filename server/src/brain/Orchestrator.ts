import { StateManager } from './StateManager.js';
import { PolicyEngine } from './PolicyEngine.js';
import { LLMInterface } from './LLMInterface.js';
import type { BrainResponse, Stage } from './types.js';
import { VectorMemory } from './VectorMemory.js';
import { ProfileManager } from './ProfileManager.js';
import { QuestionManager } from './QuestionManager.js';

export class Orchestrator {
    private llm: LLMInterface;
    private memory: VectorMemory;
    private profile: ProfileManager;
    private questionManager: QuestionManager;

    constructor() {
        this.llm = new LLMInterface();
        this.memory = new VectorMemory();
        this.profile = new ProfileManager();
        this.questionManager = new QuestionManager();
    }

    async processMessage(userId: string, sessionId: string, message: string, language: string = 'English'): Promise<BrainResponse> {
        // 1. Load State & Profile & Memory (Parallel)
        const [state, userProfile, ragContext] = await Promise.all([
            StateManager.getState(sessionId, userId),
            this.profile.getProfile(userId),
            this.memory.retrieveContext(userId, message)
        ]);

        // FIX: Reset stale turn count on new session
        if (!state.history || state.history.length === 0) {
            state.turnsSinceLastTask = 0;
            console.log("🆕 New Session Detected: Resetting Turn Count.");
        }

        // FIX: If user chats while in TASK_ACTIVE, they abandoned the task. Reset stage to allow new tasks.
        if (state.stage === 'TASK_ACTIVE') {
            console.log("⚠️ User chatted during TASK_ACTIVE. Assuming task abandoned. Resetting stage.");
            state.stage = 'RAPPORT_BUILDING';
            // Note: We don't save to DB immediately; the final updateState will handle the new stage if we propagate it.
            // Actually, we must ensure 'updates' at the end includes this change if we depend on it.
            // Let's force an immediate DB update to be safe? 
            // No, just ensure the logic below sees the new stage.
            await StateManager.updateState(sessionId, { stage: 'RAPPORT_BUILDING' });
        }

        // --- GATEKEEPER: STRATEGIC QUESTION INJECTION ---
        let strategicDirective: string | undefined = undefined;
        let selectedQuestion: any = null; // Store for marking later

        // Only inject if allowed action is CHAT_ONLY (don't interrupt tasks)
        const currentPolicy = PolicyEngine.decide(state);
        const turns = state.turnsSinceLastTask || 0;
        const isTaskImminent = turns >= 4; // Block injection if task is due soon (User wants tasks every ~5 turns)

        console.log(`🔍 ORCHESTRATOR DEBUG: Session=${sessionId}, Turns=${turns}, Stage=${state.stage}, History=${state.history?.length}, TaskImminent=${isTaskImminent}`);


        if (currentPolicy.allowed_action === 'CHAT_ONLY' && !isTaskImminent) {
            const lastInjection = userProfile?.last_injection_timestamp ? new Date(userProfile.last_injection_timestamp).getTime() : 0;
            const timeSinceInjection = Date.now() - lastInjection;

            // COOLDOWN: Don't inject if last one was < 3 mins ago, even if stalling.
            const cooldownPassed = timeSinceInjection > 3 * 60 * 1000;
            console.log(`❄️ COOLDOWN DEBUG: Last=${lastInjection}, Diff=${timeSinceInjection / 1000}s, Passed=${cooldownPassed}`);

            // TRIGGERS
            const isColdOpener = (state.history || []).length === 0;
            const isStalling = message.trim().split(/\s+/).length < 3; // "Yes", "Okay"
            const isBored = message.toLowerCase().includes("bored") || message.toLowerCase().includes("boring");

            const isTimeForInjection = timeSinceInjection > 5 * 60 * 1000; // 5 mins silence logic

            // Logic:
            // 1. Cold Opener: Always fire.
            // 2. Boredom: Fire if > 60s cooldown (Urgent pivot).
            // 3. Stalling: Fire ONLY if > 3m cooldown passed.
            // 4. Time: Fire if > 5m silence.
            const shouldInject = isColdOpener || (isBored && timeSinceInjection > 60 * 1000) || (isStalling && cooldownPassed) || isTimeForInjection;

            if (shouldInject) {
                console.log(`🎯 Trigger Active: Cold=${isColdOpener}, Stalling=${isStalling} (Cooldown=${cooldownPassed}), Time=${isTimeForInjection}`);
                const question = await this.questionManager.getStrategicQuestion(userId);

                if (question) {
                    selectedQuestion = question;
                    strategicDirective = `Your goal from now is to ASK the user: "${question.text}". Bridge to it naturally (e.g., "That makes me think of..."). Do NOT answer it yourself.`;
                    console.log(`🧩 Injecting Strategy: [${question.category}] ${question.id}`);
                }
            }
        }
        // -----------------------------------------------

        // --- STATE MACHINE PROGRESSION (Simple Heuristic for Prototype) ---
        let nextStageString: Stage | undefined = undefined;

        // If Greeting/Rapport, and message is long enough or we've had a few turns, try to move to task
        // Ideally this would be stored in DB (turnCount), for now we simulate flow:
        if (state.stage === 'GREETING' && message.length > 2) {
            nextStageString = 'RAPPORT_BUILDING';
        }

        if (nextStageString) {
            await StateManager.updateState(sessionId, { stage: nextStageString });
            state.stage = nextStageString;
        }

        // 2. Policy Check & Forced Injection logic
        let policy = currentPolicy; // Use the one decided earlier or re-decide

        // Apply State Transitions from Policy
        if (policy.next_stage) {
            console.log(`🔄 State Transition: ${state.stage} -> ${policy.next_stage}`);
            await StateManager.updateState(sessionId, { stage: policy.next_stage });
            state.stage = policy.next_stage;
            policy = PolicyEngine.decide(state);
        }

        // Force Task every 5 turns logic (kept same as before)
        let forcedTaskType: string | null = null;
        // RELAXED CONSTRAINT: Inject task regardless of stage (unless already doing one)
        if (turns >= 5 && state.stage !== 'TASK_ACTIVE') {
            console.log("⚡ Forced Task Injection Triggered (Turn " + turns + ")");
            const tasks = ['CLOCK_DRAWING', 'MEMORY_RECALL', 'ATTENTION'];
            const randomTask = tasks[Math.floor(Math.random() * tasks.length)];

            forcedTaskType = randomTask;
            policy = {
                allowed_action: 'SUGGEST_TASK',
                task_type: randomTask,
                difficulty: 'EASY'
            };
        }

        // Debug Overrides (kept same)
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes("/debug-task")) {
            console.log("🛠️ DEBUG COMMAND: FORCING TASK");
            policy = { allowed_action: 'SUGGEST_TASK', task_type: 'MEMORY_RECALL', difficulty: 'EASY' };
            forcedTaskType = 'MEMORY_RECALL';
        }
        else if (lowerMsg.includes("/clock")) policy = { allowed_action: 'SUGGEST_TASK', task_type: 'CLOCK_DRAWING', difficulty: 'EASY' };
        else if (lowerMsg.includes("/memory")) policy = { allowed_action: 'SUGGEST_TASK', task_type: 'MEMORY_RECALL', difficulty: 'EASY' };
        else if (lowerMsg.includes("/attention")) policy = { allowed_action: 'SUGGEST_TASK', task_type: 'ATTENTION', difficulty: 'EASY' };

        // 3. Update History 
        const currentHistory = state.history || [];
        currentHistory.push({ role: 'user', content: message, timestamp: new Date() });

        // 4. LLM Generation
        const llmOutput = await this.llm.generateResponse({
            user_message: message,
            language,
            state: { ...state, history: currentHistory },
            policy,
            tone: "supportive, warm, grandchild-like.",
            ragContext,
            userProfile,
            strategicDirective // <--- INJECT DIRECTIVE
        });

        // FAILSAFE: If we forced a task, ensures it happens even if LLM ignores or fails
        if (forcedTaskType) {
            // 1. Mask Connection Errors if Task is Forced
            if (llmOutput.reply.includes("(Connection Issue)")) {
                console.log("⚠️ LLM Failed (Connection), but Task Forced. Masking error message.");
                llmOutput.reply = "I'm having a bit of trouble connection-wise, but we can still play this game together!";
            }

            // 2. Enforce Action & Add BRIDGE TEXT
            // If LLM didn't return an action, OR returned the WRONG action, we overwrite it.
            const llmActionType = llmOutput.action?.type;
            if (!llmActionType || llmActionType === 'null' || llmActionType !== forcedTaskType) {
                console.log(`⚠️ LLM ignored/mismatched Task Policy. Enforcing: ${forcedTaskType}`);
                llmOutput.action = { type: forcedTaskType, difficulty: 'EASY' };

                // 3. Add Specific Bridge Text (Only if we didn't just mask the error)
                // This ensures the intro matches the ACTUAL task we are launching.
                if (!llmOutput.reply.includes("trouble connection-wise")) {
                    let specificBridge = "";
                    switch (forcedTaskType) {
                        case 'CLOCK_DRAWING':
                            specificBridge = " Speaking of time, I was wondering if you could help me draw a clock?";
                            break;
                        case 'MEMORY_RECALL':
                            specificBridge = " By the way, I wanted to show you a fun word game!";
                            break;
                        case 'ATTENTION':
                            specificBridge = " Speaking of focusing, let's try a quick reaction challenge!";
                            break;
                        default:
                            specificBridge = " By the way, could you help me with a quick activity?";
                    }
                    llmOutput.reply += specificBridge;
                }
            }
        }

        // 5. SANITY CHECK: Enforce Policy (Prevent Hallucinations)
        // If we want CHAT_ONLY, but LLM returned an action anyway (and we didn't force it), KILL IT.
        if (!forcedTaskType && policy.allowed_action === 'CHAT_ONLY') {
            if (llmOutput.action && llmOutput.action.type && llmOutput.action.type !== 'null') {
                console.log(`⚠️ LLM Hallucinated Task (${llmOutput.action.type}) despite CHAT_ONLY policy. Stripping.`);
                llmOutput.action = null;
            }
        }

        // 6. Update State
        const updates: any = {};
        const newHistory = [...currentHistory, { role: 'assistant', content: llmOutput.reply, timestamp: new Date() } as any];
        if (newHistory.length > 20) updates.history = newHistory.slice(newHistory.length - 20);
        else updates.history = newHistory;

        if (llmOutput.action && llmOutput.action.type && llmOutput.action.type !== 'null') {
            updates.lastTaskType = llmOutput.action.type;
            updates.lastTaskTimestamp = new Date();
            updates.stage = 'TASK_ACTIVE';
            updates.turnsSinceLastTask = 0;
        } else {
            updates.turnsSinceLastTask = turns + 1;
        }

        await StateManager.updateState(sessionId, updates);

        // 6. Memory Storage (RAG)
        await this.memory.storeTurn(userId, message, llmOutput.reply);

        // 7. Record Question Injection (If successful)
        if (selectedQuestion) {
            // We assume if we passed the directive, the LLM used it.
            // Ideally we check if llmOutput.reply contains relevance, but trust for now.
            await this.questionManager.markQuestionAsDiscussed(userId, selectedQuestion);
        }

        return {
            reply: llmOutput.reply,
            metadata: {
                phase: state.conversationPhase,
                suggestedTask: (llmOutput.action && llmOutput.action.type && llmOutput.action.type !== 'null') ? {
                    type: llmOutput.action.type as string,
                    difficulty: llmOutput.action.difficulty || "EASY"
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

        const feedbackPrompt = `[SYSTEM MESSAGE]: The user has JUST COMPLETED the ${taskName} activity.
        Performance Sentiment: ${sentiment}.
        
        Your Goal: Debrief and Transition back to chat.
        
        CRITICAL RULES:
        1. DO NOT suggest the task again. The user just finished it. Do not say "Let's try drawing a clock" or "Can you imagine...".
        2. DO NOT mention specific scores, numbers, or streaks. Keep praise general ("You did great!").
        3. DO NOT force a connection to previous topics if it doesn't make sense.
        
        Structure:
        1. Warm praise.
        2. A gentle follow-up question to resume the conversation.
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

        // OUTPUT FILTER: Catch hallucinated task intros in the Debrief
        // If the LLM repeats the intro ("Let's try a task"), we catch it here and force a clean transition.
        const forbiddenPhrases = [
            "let's try", "let's play", "can you focus", "can you imagine",
            "start activity", "how about we try", "would you like to try"
        ];
        const lowerReply = llmOutput.reply.toLowerCase();

        if (forbiddenPhrases.some(phrase => lowerReply.includes(phrase))) {
            console.log("⚠️ LLM hallucinated a Task Suggestion in POST_TASK. Overwriting with safe debrief.");
            llmOutput.reply = "That was wonderful, Ji! It's always good to exercise the mind a little. Now, returning to what we were discussing...";
        }

        return {
            reply: llmOutput.reply,
            metadata: {
                phase: state.conversationPhase
            }
        };
    }
}
