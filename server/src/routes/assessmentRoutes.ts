import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    startAssessment,
    saveProgress,
    submitAssessment,
    getAssessmentHistory
} from '../controllers/assessmentController.js';

const router = express.Router();

router.use(protect);

router.post('/start', startAssessment);
router.get('/history', getAssessmentHistory);

router.route('/:id/save').post(saveProgress);
router.route('/:id/submit').post(submitAssessment);

export default router;
