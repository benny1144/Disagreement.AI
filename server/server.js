// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// We need to import the built-in http module and the Server class from socket.io
const http = require('http');
const { Server } = require('socket.io');

// Initialize the Express application
const app = express();
// Create an HTTP server from our Express app
const server = http.createServer(app);

// Initialize Socket.IO and attach it to the HTTP server
// We configure CORS to allow our frontend to connect
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // This will be our React client's address
    methods: ["GET", "POST"]
  }
});

// Middleware Setup
app.use(cors());
app.use(express.json());

// Define the Port
const PORT = process.env.PORT || 5001;

// --- Routes ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/disagreements', require('./routes/disagreementRoutes'));

// --- Basic Test Route ---
app.get('/', (req, res) => {
  res.send('Disagreement.AI server is running!');
});

// --- Socket.IO Connection Logic ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Listen for a user joining a specific disagreement room
  socket.on('joinRoom', (disagreementId) => {
    socket.join(disagreementId);
    console.log(`User ${socket.id} joined room ${disagreementId}`);
  });

  // We will add logic here later to handle sending/receiving messages

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id);
  });
});


// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    // We now tell the 'server' (with Socket.IO) to listen, not the 'app'
    server.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed.', err);
    process.exit(1);
  });