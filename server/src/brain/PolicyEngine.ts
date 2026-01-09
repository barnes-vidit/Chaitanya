import type { ConversationState, PolicyOutput } from './types.js';

export class PolicyEngine {
    static decide(state: ConversationState): PolicyOutput {
        const { stage, tasksDoneToday } = state;

        let output: PolicyOutput = {
            allowed_action: 'CHAT_ONLY',
            task_type: null,
            difficulty: null,
            next_stage: undefined
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

                // Which task?
                if (tasksDoneToday === 0) {
                    output.task_type = 'CLOCK_DRAWING';
                    output.difficulty = 'EASY';
                } else if (tasksDoneToday === 1) {
                    output.task_type = 'MEMORY_RECALL';
                    output.difficulty = 'EASY';
                } else if (tasksDoneToday === 2) {
                    output.task_type = 'ATTENTION';
                    output.difficulty = 'EASY';
                } else {
                    // All tasks done
                    output.allowed_action = 'CHAT_ONLY';
                    output.next_stage = 'CLOSING';
                }

                // State should automatically transition to TASK_ACTIVE after suggestion handled by Orchestrator
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
