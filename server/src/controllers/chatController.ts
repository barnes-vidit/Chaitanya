import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import { Chat } from '../models/Chat.js';
import { generateAIResponse } from '../services/aiService.js';

// @desc    Get all chats for a user
// @route   GET /api/chat
// @access  Private
export const getChats = async (req: AuthRequest, res: Response) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        }).sort({ lastMessageAt: -1 });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get specific chat history
// @route   GET /api/chat/:id
// @access  Private
export const getChatById = async (req: AuthRequest, res: Response) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            participants: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Create a new chat or returning existing one
// @route   POST /api/chat
// @access  Private
export const createChat = async (req: AuthRequest, res: Response) => {
    try {
        const { type } = req.body;

        // Simple logic: Create new chat for now
        const chat = await Chat.create({
            participants: [req.user.id], // + AI id implicitly
            type,
            messages: []
        });

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Send a message to a chat
// @route   POST /api/chat/:id/message
// @access  Private
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { content, type, metadata } = req.body;
        const chatId = req.params.id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // 1. Add User Message
        const userMessage = {
            senderId: req.user.id,
            senderRole: 'user',
            content,
            type: type || 'text',
            metadata,
            timestamp: new Date()
        };
        chat.messages.push(userMessage as any);

        // 2. Generate AI Response
        // In a real app, we'd pass recent history as context
        const aiResponseText = await generateAIResponse(content);

        // 3. Add AI Message
        const aiMessage = {
            senderId: req.user.id, // Using user ID for now as AI doesn't have a DB user. Or we can use a null/special ID. 
            // Better: 'senderRole' distinguishes it. db schema expects valid ObjectId for senderId?
            // Checking model... senderId is required and ref 'User'.
            // Workaround: Use the user's ID but role='ai'. Or create a system user.
            // Using user's ID for simplicity as schema enforces it.
            senderRole: 'ai',
            content: aiResponseText,
            timestamp: new Date()
        };
        chat.messages.push(aiMessage as any);

        chat.lastMessageAt = new Date();
        await chat.save();

        // Return the NEW messages (or the whole chat, or just the new ones)
        // Returning the last two messages (User + AI)
        const newMessages = chat.messages.slice(-2);

        res.json(newMessages);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Delete a chat
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req: AuthRequest, res: Response) => {
    try {
        const result = await Chat.findOneAndDelete({
            _id: req.params.id,
            participants: req.user.id
        });

        if (!result) {
            return res.status(404).json({ message: 'Chat not found or unauthorized' });
        }

        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ message: 'Failed to delete chat' });
    }
};

// @desc    Update a chat (e.g. rename)
// @route   PATCH /api/chat/:id
// @access  Private
export const updateChat = async (req: AuthRequest, res: Response) => {
    try {
        const { title } = req.body;
        const chat = await Chat.findOneAndUpdate(
            { _id: req.params.id, participants: req.user.id },
            { title },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or unauthorized' });
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error('Error updating chat:', error);
        res.status(500).json({ message: 'Failed to update chat' });
    }
};
