export type ConversationPhase = 'warmup' | 'free_chat' | 'light_assessment' | 'cooldown';
export type Stage = 'GREETING' | 'RAPPORT_BUILDING' | 'PRE_TASK' | 'TASK_ACTIVE' | 'POST_TASK' | 'CLOSING';

export interface TaskResult {
    taskType: string;
    score: number;
    metadata?: any;
    timestamp: Date;
}

export interface ConversationState {
    sessionId: string;
    userId: string;
    stage: Stage; // New State Machine Driver
    conversationPhase: ConversationPhase; // Kept for legacy compatibility
    fatigueScore: number;
    engagementScore: number;
    tasksDoneToday: number;
    lastTaskType: string | null;
    turnsSinceLastTask: number;
    taskResults: TaskResult[];
    history: {
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp?: Date;
    }[];
}

export interface PolicyOutput {
    allowed_action: 'CHAT_ONLY' | 'SUGGEST_TASK';
    task_type: string | null;
    difficulty: string | null;
    next_stage?: Stage; // Instructions for state transition
}

export interface LLMInput {
    user_message: string;
    language: string;
    state: ConversationState;
    policy: PolicyOutput;
    tone: string;
    ragContext?: string[];
    userProfile?: any; // Keeping as any for flexibility, or we could import UserProfile interface
    strategicDirective?: string;
}

export interface LLMJsonOutput {
    reply: string;
    action: {
        type: string | null;
        difficulty: string | null;
    } | null;
}

export interface BrainResponse {
    reply: string;
    metadata: {
        phase: string;
        suggestedTask?: {
            type: string;
            difficulty: string;
        } | undefined;
    };
}
