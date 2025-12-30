import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    role: { type: String, enum: ['patient', 'caregiver', 'clinician'], default: 'patient' },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    profile: {
        name: { type: String, required: true },
        age: Number,
        caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    settings: {
        voiceEnabled: { type: Boolean, default: true },
        theme: { type: String, default: 'light' }
    }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
