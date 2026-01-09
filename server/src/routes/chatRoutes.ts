import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getChats,
    createChat,
    getChatById,
    sendMessage,
    deleteChat,
    updateChat,
    handleTaskResult
} from '../controllers/chatController.js';

const router = express.Router();

router.get('/', protect, getChats);
router.post('/', protect, createChat);
router.get('/:id', protect, getChatById);
router.post('/:id/message', protect, sendMessage);
router.patch('/:id', protect, updateChat);
router.delete('/:id', protect, deleteChat);
router.post('/:id/task-result', protect, handleTaskResult);

export default router;
