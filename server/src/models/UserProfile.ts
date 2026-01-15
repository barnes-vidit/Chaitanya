import mongoose from 'mongoose';

const UserProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    mood_trend: { type: String, default: "Stable" }, // e.g., "Stable", "Declining", "Anxious"
    fav_topics: { type: [String], default: [] }, // e.g., ["Cricket", "Cooking"]
    confusion_triggers: { type: [String], default: [] }, // e.g., ["Money", "Dates"]
    social_connection_score: { type: Number, default: 5 }, // 1-10

    // Strategic Question Injection Tracking
    discussed_question_ids: { type: [String], default: [] },
    last_question_category: { type: String, default: "" },
    last_injection_timestamp: { type: Date, default: null },

    last_updated: { type: Date, default: Date.now },
    notes: { type: String, default: "" } // General clinical notes
});

export const UserProfile = mongoose.model('UserProfile', UserProfileSchema);
