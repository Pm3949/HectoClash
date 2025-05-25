import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http'; // Needed to attach socket.io
import connectDB from './config/database.js';

import userRoutes from './routes/userRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import trainingRoutes from './routes/tarinigRoutes.js';
import { initSocket } from './socket/socket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: 'https://hectoclash-frontend.onrender.com', // Frontend URL
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/training", trainingRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB and start server
connectDB();
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
