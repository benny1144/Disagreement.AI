/// <reference types="node" />
/* eslint-env node */

// Import necessary packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables from .env files using absolute paths relative to this file
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../services/.env') });

// Import routes
const userRoutes = require('./routes/users');

// Initialize the Express app
const app = express();

// --- Universal Request Logger (add this right here) ---
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next(); // This passes the request to the next function in the chain
});

// Middleware to parse JSON bodies
app.use(express.json());

// ... the rest of your file

// Middleware to parse JSON bodies
// This allows our server to accept JSON data in requests (e.g., from the frontend)
app.use(express.json());

// --- Database Connection ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---
// Tell our app to use the user routes for any request that starts with /api/users
app.use('/api/users', userRoutes);

// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});