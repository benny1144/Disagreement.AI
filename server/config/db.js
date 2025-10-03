import mongoose from 'mongoose';

let isConnecting = false;
let hasConnected = false;

const RETRY_MS = Number(process.env.MONGO_RETRY_MS || 5000);

const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/disagreement_ai';
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
        console.warn('MONGO_URI not set. Falling back to local MongoDB at mongodb://127.0.0.1:27017/disagreement_ai');
    }

    // Suppress strictQuery deprecation warning (prepare for Mongoose 7)
    mongoose.set('strictQuery', true);

    const attempt = async () => {
        if (isConnecting || hasConnected) return;
        isConnecting = true;
        try {
            const conn = await mongoose.connect(uri);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            hasConnected = true;
        } catch (error) {
            console.error(`MongoDB connection error: ${error.message}`);
            console.log(`Retrying MongoDB connection in ${RETRY_MS}ms...`);
            setTimeout(() => {
                isConnecting = false;
                attempt();
            }, RETRY_MS);
            return;
        } finally {
            isConnecting = false;
        }
    };

    attempt();
};

export default connectDB;