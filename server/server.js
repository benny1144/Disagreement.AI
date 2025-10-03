import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Import route files
import userRoutes from './routes/userRoutes.js';
import disagreementRoutes from './routes/disagreementRoutes.js';

// Load environment variables (default .env), then fallback to services/.env if needed
dotenv.config();
dotenv.config({ path: '../services/.env' });

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';
const io = new Server(httpServer, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Middleware
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/disagreements', disagreementRoutes);

// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (data) => {
        socket.join(data.roomId);
        console.log(`User ${socket.id} joined room ${data.roomId}`);
    });

    socket.on('send_message', (data) => {
        // Broadcast the message to the specific room
        io.to(data.roomId).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));