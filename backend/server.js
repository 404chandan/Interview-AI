import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Create uploads folder if not exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/api', apiRouter);

// Fallback status
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log(`🔌 Real-time client connected: ${socket.id}`);
  
  socket.on('join-session', (interviewId) => {
    socket.join(interviewId);
    console.log(`👤 Client joined interview session: ${interviewId}`);
  });

  socket.on('voice-data', ({ interviewId, text }) => {
    // Broadcast text or processing indicator to specific session room
    io.to(interviewId).emit('voice-processing', { text });
  });

  socket.on('camera-telemetry', ({ interviewId, metrics }) => {
    // Process real-time camera telemetry (e.g. eye-contact %, confidence %)
    // Normally, this would run computer vision evaluation. 
    // In our live React panel, we simulate updates and sync via sockets.
    io.to(interviewId).emit('metrics-realtime', metrics);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Connect DB & Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Interview AI Server running on port ${PORT}`);
  });
});
