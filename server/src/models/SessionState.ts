import mongoose from 'mongoose';

const SessionStateSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true }, // Changed back to String to match Chat _id handling
    userId: { type: String, required: true },

    // Conversation Flow Control
    stage: {
        type: String,
        enum: ['GREETING', 'RAPPORT_BUILDING', 'PRE_TASK', 'TASK_ACTIVE', 'POST_TASK', 'CLOSING'],
        default: 'GREETING'
    },

    // Legacy metrics (still useful for LLM context)
    conversationPhase: {
        type: String,
        enum: ['warmup', 'free_chat', 'light_assessment', 'cooldown'],
        default: 'warmup'
    },
    fatigueScore: { type: Number, default: 0.0, min: 0.0, max: 1.0 },
    engagementScore: { type: Number, default: 0.5, min: 0.0, max: 1.0 },

    // Task Tracking
    tasksDoneToday: { type: Number, default: 0 },
    lastTaskType: { type: String, default: null },
    lastTaskTimestamp: { type: Date, default: null },
    turnsSinceLastTask: { type: Number, default: 0 },

    // Detailed Task History
    taskResults: [{
        taskType: String,
        score: Number,
        metadata: { type: mongoose.Schema.Types.Mixed }, // Flexible result data
        timestamp: { type: Date, default: Date.now }
    }],

    lastInteraction: { type: Date, default: Date.now }
}, { timestamps: true });

export const SessionState = mongoose.model('SessionState', SessionStateSchema);
