import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { Assessment } from '../models/Assessment.js';

// @desc    Start new assessment
// @route   POST /api/assessment/start
// @access  Private
export const startAssessment = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.body;

        const assessment = await Assessment.create({
            patientId: req.user.id,
            type,
            responses: [],
            status: 'in-progress'
        });

        res.status(201).json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Save progress (partial answers)
// @route   POST /api/assessment/:id/save
// @access  Private
export const saveProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { responses } = req.body;

        const assessment = await Assessment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        // Merge logic (simplified)
        assessment.responses = responses; // In prod, append/update by questionId
        await assessment.save();

        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Submit final assessment
// @route   POST /api/assessment/:id/submit
// @access  Private
export const submitAssessment = async (req: AuthRequest, res: Response) => {
    try {
        const assessment = await Assessment.findOne({
            _id: req.params.id,
            patientId: req.user.id
        });

        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        assessment.status = 'completed';
        assessment.completedAt = new Date();
        // Calculate score logic here based on type
        await assessment.save();

        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get user assessments
// @route   GET /api/assessment/history
// @access  Private
export const getAssessmentHistory = async (req: AuthRequest, res: Response) => {
    try {
        const assessments = await Assessment.find({
            patientId: req.user.id,
            type: { $nin: ['MMSE', 'GDS'] }
        }).sort({ createdAt: -1 });

        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
