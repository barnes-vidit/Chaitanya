import express from 'express';
import { protect } from '../middleware/auth.js';
import { getChats, getChatById, createChat, sendMessage, deleteChat, updateChat } from '../controllers/chatController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getChats)
    .post(createChat);

router.route('/:id')
    .get(getChatById);

router.post('/:id/message', protect, sendMessage);
router.patch('/:id', protect, updateChat);
router.delete('/:id', protect, deleteChat);

export default router;
