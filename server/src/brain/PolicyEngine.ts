import type { ConversationState, PolicyOutput } from './types.js';

export class PolicyEngine {
    static decide(state: ConversationState): PolicyOutput {
        const { stage, tasksDoneToday } = state;

        let output: PolicyOutput = {
            allowed_action: 'CHAT_ONLY',
            task_type: null,
            difficulty: null
        };

        // --- STATE MACHINE LOGIC ---
        switch (stage) {
            case 'GREETING':
            case 'RAPPORT_BUILDING':
                // Check if ready for first task
                // Heuristic: If we have at least 1 task result, OR enough messages passed?
                // For now, let's keep it simple: Start rapport, after 2-3 exchanges, move to PRE_TASK
                // We'll rely on Orchestrator to bump the state based on message count (simulated here)
                output.allowed_action = 'CHAT_ONLY';
                break;

            case 'PRE_TASK':
                // It's time to suggest a task!
                output.allowed_action = 'SUGGEST_TASK';

                // Available Tasks
                const allTasks = ['CLOCK_DRAWING', 'MEMORY_RECALL', 'ATTENTION'];

                // Filter out tasks already done in this session
                const doneTypes = new Set(state.taskResults.map(r => r.taskType));
                const available = allTasks.filter(t => !doneTypes.has(t));

                if (available.length > 0) {
                    // Pick random from available
                    output.task_type = available[Math.floor(Math.random() * available.length)] || null;
                    output.difficulty = 'EASY';
                } else {
                    // All done? Reset or pick random from all (Repeats allowed)
                    output.task_type = allTasks[Math.floor(Math.random() * allTasks.length)] || null;
                    output.difficulty = 'EASY';
                }

                // If we have saturated tasks, maybe close?
                if (state.tasksDoneToday >= 5) {
                    output.allowed_action = 'CHAT_ONLY';
                    output.next_stage = 'CLOSING';
                }
                break;

            case 'TASK_ACTIVE':
                // User is supposed to be doing a task.
                // We shouldn't interrupt, but if they chat, we just chat back comfortably.
                // We do NOT suggest another task yet.
                output.allowed_action = 'CHAT_ONLY';
                break;

            case 'POST_TASK':
                // Task recently finished.
                // We want to bridge to the next topic or task.
                // For now, let's just chat for a bit.
                output.allowed_action = 'CHAT_ONLY';
                output.next_stage = 'RAPPORT_BUILDING'; // Go back to rapport loop
                break;

            case 'CLOSING':
                output.allowed_action = 'CHAT_ONLY';
                break;

            default:
                output.allowed_action = 'CHAT_ONLY';
        }

        return output;
    }
}
