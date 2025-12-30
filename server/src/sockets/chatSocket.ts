import { Server, Socket } from 'socket.io';
import { Chat } from '../models/Chat.js';
import { User } from '../models/User.js';

export const setupChatSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join_chat', async ({ chatId, userId }) => {
            socket.join(chatId);
            console.log(`User ${userId} joined chat ${chatId}`);
        });

        socket.on('send_message', async (data) => {
            const { chatId, senderId, content, type } = data;

            try {
                // Determine sender role
                // In production, fetch User to get role, for now assume 'user'
                const message = {
                    senderId,
                    senderRole: 'user', // simplifed for MVC
                    content,
                    type,
                    timestamp: new Date()
                };

                // Persist to DB
                await Chat.findByIdAndUpdate(chatId, {
                    $push: { messages: message },
                    lastMessageAt: new Date()
                });

                // Emit to room
                io.to(chatId).emit('new_message', message);

                // Mock AI Response (for demo purposes if needed backend-side)
                // In real app, this would trigger an LLM service

            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
