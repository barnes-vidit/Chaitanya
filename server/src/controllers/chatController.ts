import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import mongoose from 'mongoose';
import { Chat } from '../models/Chat.js';
import { generateAIResponse } from '../services/aiService.js';
import { Orchestrator } from '../brain/Orchestrator.js';

let orchestratorInstance: Orchestrator | null = null;

const getOrchestrator = () => {
    if (!orchestratorInstance) {
        orchestratorInstance = new Orchestrator();
    }
    return orchestratorInstance;
};

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
        const { content, type, metadata, language } = req.body;
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

        // 2. Orchestrator Processing (The "Brain")
        const orchestrator = getOrchestrator();

        const brainResponse = await orchestrator.processMessage(
            req.user.id,
            chatId,
            content,
            language || 'English'
        );

        // 3. Add AI Message
        const aiMessage = {
            senderId: req.user.id, // Using user ID as anchor, role distinguishes
            senderRole: 'ai',
            content: brainResponse.reply,
            timestamp: new Date(),
            metadata: {
                ...brainResponse.metadata,
                isTaskSuggestion: !!brainResponse.metadata.suggestedTask
            }
        };
        chat.messages.push(aiMessage as any);

        chat.lastMessageAt = new Date();
        await chat.save();

        // Return the NEW messages
        const newMessages = chat.messages.slice(-2);
        res.json(newMessages);

    } catch (error: any) {
        console.error("Chat Controller Error:", error);
        // Handle API Key missing error specifically
        if (error.message && error.message.includes("GEMINI_API_KEY")) {
            return res.status(500).json({ message: "AI Configuration Error: Missing API Key" });
        }
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

// @desc    Handle Task Completion & Generate Follow-up
// @route   POST /api/chat/:id/task-result
// @access  Private
export const handleTaskResult = async (req: AuthRequest, res: Response) => {
    try {
        const { taskType, score, data, sourceMessageId } = req.body;
        const chatId = req.params.id;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // 0. Update original suggestion message if ID provided
        if (sourceMessageId) {
            try {
                // Determine if it's a valid ObjectId to prevent CastError
                const isValidId = mongoose.Types.ObjectId.isValid(sourceMessageId);
                if (isValidId) {
                    const suggestionMsg = chat.messages.id(sourceMessageId);
                    if (suggestionMsg && suggestionMsg.metadata && suggestionMsg.metadata.suggestedTask) {
                        suggestionMsg.metadata.suggestedTask.completed = true;
                    }
                } else {
                    console.warn(`Invalid sourceMessageId provided: ${sourceMessageId}. Skipping status update.`);
                }
            } catch (err) {
                console.warn("Failed to find/update source message:", err);
            }
        }

        // 1. Log the User's "Submission"
        const userMessage = {
            senderId: req.user.id,
            senderRole: 'user',
            content: `[Completed Activity]`,
            type: 'text',
            metadata: { hidden: true },
            timestamp: new Date()
        };
        chat.messages.push(userMessage as any);

        // 2. Orchestrator Processing
        const orchestrator = getOrchestrator();
        let brainResponse: any;

        try {
            brainResponse = await orchestrator.handleTaskCompletion(
                req.user.id,
                chatId,
                taskType,
                Number(score), // Ensure number
                data || {}
            );
        } catch (orchError) {
            console.error("Orchestrator Task Completion Error:", orchError);
            // Fallback response if Orchestrator fails
            brainResponse = {
                reply: "Great job completing the task! I've noted your results.",
                metadata: {}
            };
        }

        // 3. Add AI Follow-up
        const aiMessage = {
            senderId: req.user.id,
            senderRole: 'ai',
            content: brainResponse.reply,
            timestamp: new Date(),
            metadata: brainResponse.metadata
        };
        chat.messages.push(aiMessage as any);

        chat.lastMessageAt = new Date();
        await chat.save();

        res.json(chat.messages.slice(-2));

    } catch (error) {
        console.error("Task Result API Error:", error);
        res.status(500).json({ message: 'Server Error processing task result', error: String(error) });
    }
};
