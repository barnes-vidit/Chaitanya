import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Load env vars
dotenv.config();

// Force restart for env update
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaitanya';

console.log("Attempting to connect to MongoDB...");
console.log("URI (masked):", MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Log masked URI

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error Details:');
        console.error(`Name: ${err.name}`);
        console.error(`Message: ${err.message}`);
        console.error(`Code: ${err.code}`);
        console.error(`Syscall: ${err.syscall}`);
        console.error(`Hostname: ${err.hostname}`);
    });

// Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

import chatRoutes from './routes/chatRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/assessment', assessmentRoutes);

app.get('/', (req, res) => {
    res.send('Chaitanya API is running');
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
