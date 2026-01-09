import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderId: { type: String, required: true }, // Changed to String for Clerk ID
    senderRole: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['text', 'image', 'audio', 'file'], default: 'text' },
    metadata: {
        fileUrl: String,
        duration: Number, // for audio
        sentiment: String,
        suggestedTask: {
            type: { type: String },
            difficulty: String,
            completed: Boolean
        },
        isTaskSuggestion: Boolean,
        hidden: Boolean
    },
    timestamp: { type: Date, default: Date.now }
});

const ChatSchema = new mongoose.Schema({
    participants: [{ type: String }], // Changed to String for Clerk IDs
    title: { type: String, default: 'New Chat' },
    type: { type: String, enum: ['direct', 'group', 'assessment'], default: 'direct' },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Chat = mongoose.model('Chat', ChatSchema);
