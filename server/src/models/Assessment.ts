import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    answer: mongoose.Schema.Types.Mixed,
    score: Number,
    timeTakenSeconds: Number,
    timestamp: { type: Date, default: Date.now }
});

const AssessmentSchema = new mongoose.Schema({
    patientId: { type: String, ref: 'User', required: true },
    type: { type: String, enum: ['MMSE', 'MoCA', 'GDS', 'Custom'], required: true },
    status: { type: String, enum: ['in-progress', 'completed', 'reviewed'], default: 'in-progress' },
    responses: [ResponseSchema],
    totalScore: Number,
    maxScore: Number,
    clinicianNotes: String,
    startedAt: { type: Date, default: Date.now },
    completedAt: Date
}, { timestamps: true });

export const Assessment = mongoose.model('Assessment', AssessmentSchema);
