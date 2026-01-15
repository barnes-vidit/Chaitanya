import { SessionState } from '../models/SessionState.js';
import type { ConversationState } from './types.js';

export class StateManager {
    static async getState(sessionId: string, userId: string): Promise<ConversationState> {
        try {
            let state = await SessionState.findOne({ sessionId });

            if (!state) {
                // Initialize default state
                const newState = new SessionState({
                    sessionId,
                    userId,
                    stage: 'GREETING',
                    conversationPhase: 'warmup',
                    taskResults: []
                });
                await newState.save();
                return {
                    sessionId,
                    userId,
                    stage: 'GREETING',
                    conversationPhase: 'warmup',
                    fatigueScore: 0.0,
                    engagementScore: 0.5,
                    tasksDoneToday: 0,
                    lastTaskType: null,
                    lastTaskTimestamp: null,
                    turnsSinceLastTask: 0,
                    history: [],
                    taskResults: []
                };
            }

            return {
                sessionId: state.sessionId,
                userId: state.userId,
                stage: (state as any).stage || 'GREETING',
                conversationPhase: (state as any).conversationPhase,
                fatigueScore: state.fatigueScore,
                engagementScore: state.engagementScore,
                tasksDoneToday: state.tasksDoneToday,
                lastTaskType: state.lastTaskType,
                lastTaskTimestamp: state.lastTaskTimestamp,
                turnsSinceLastTask: (state as any).turnsSinceLastTask || 0,
                history: (state as any).history || [],
                taskResults: (state as any).taskResults || []
            };
        } catch (error) {
            console.error("State Manager Error:", error);
            throw error;
        }
    }

    static async updateState(sessionId: string, updates: Partial<ConversationState>) {
        try {
            await SessionState.findOneAndUpdate({ sessionId }, updates);
        } catch (error) {
            console.error("State Update Error:", error);
        }
    }
}
