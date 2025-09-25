import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import disagreementRoutes from './routes/disagreementRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const port = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/disagreements', disagreementRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

console.log(`Server is running on port ${port}`);