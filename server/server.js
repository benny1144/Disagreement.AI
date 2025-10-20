// noinspection SpellCheckingInspection
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import Disagreement from './models/disagreementModel.js';
import User from './models/userModel.js';
import mongoose from 'mongoose';

// Import route files
import userRoutes from './routes/userRoutes.js';
import disagreementRoutes from './routes/disagreementRoutes.js';
import contactRoutes from './routes/contactRoutes.js'; // --- (Step 1: Import the new contact routes) ---
import aiRoutes from './routes/aiRoutes.js';
import { getAIClarifyingIntroduction } from './controllers/aiController.js';
import * as aiAnalysisService from './services/aiAnalysisService.js';

// Load environment variables from project root, then local, then fallback to services/.env if needed
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Root-level .env (always resolve relative to this file)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Local server/.env (if present)
dotenv.config({ path: path.resolve(__dirname, '.env') });
// services/.env (for Docker or alternate setups)
dotenv.config({ path: path.resolve(__dirname, '../services/.env') });

// Validate AI mediator configuration (non-fatal)
const AI_MEDIATOR_ID = process.env.AI_MEDIATOR_USER_ID;
const AI_MEDIATOR_ID_VALID = !!(AI_MEDIATOR_ID && (mongoose?.isValidObjectId ? mongoose.isValidObjectId(AI_MEDIATOR_ID) : mongoose.Types.ObjectId.isValid(AI_MEDIATOR_ID)));
if (!AI_MEDIATOR_ID) {
    console.warn('[config] AI_MEDIATOR_USER_ID is not set. DAI will not be able to post messages.');
    console.warn('[config] To fix: Create a "DAI" user in MongoDB (isAi: true), copy its _id, then set AI_MEDIATOR_USER_ID in Render (Dashboard -> Environment).');
} else if (!AI_MEDIATOR_ID_VALID) {
    console.warn(`[config] AI_MEDIATOR_USER_ID is set but not a valid MongoDB ObjectId: ${AI_MEDIATOR_ID}. Use the _id from the AI user document in MongoDB.`);
} else {
    console.log('[config] AI_MEDIATOR_USER_ID configured.');
}

// Connect to database
void connectDB();

// Hotfix v1.3: Ensure sparse unique index on directInvites.token
// Runs once after a successful MongoDB connection.
mongoose.connection.once('open', async () => {
    try {
        const coll = Disagreement.collection;
        // Drop existing faulty index if present
        try {
            await coll.dropIndex('directInvites.token_1');
            console.log('[Hotfix v1.3] Dropped index directInvites.token_1');
        } catch (e) {
            const msg = e?.message || String(e);
            if (e?.codeName === 'IndexNotFound' || /index not found|ns not found|name not found/i.test(msg)) {
                console.log('[Hotfix v1.3] Index directInvites.token_1 not found; skipping drop');
            } else {
                console.warn('[Hotfix v1.3] Drop index warning:', msg);
            }
        }
        // Create the correct sparse unique index
        try {
            await coll.createIndex({ 'directInvites.token': 1 }, { name: 'directInvites.token_1', unique: true, sparse: true });
            console.log('[Hotfix v1.3] Ensured sparse unique index on directInvites.token');
        } catch (e) {
            console.error('[Hotfix v1.3] Failed to create sparse unique index on directInvites.token:', e?.message || e);
        }
    } catch (err) {
        console.error('[Hotfix v1.3] Index migration error:', err?.message || err);
    }
});

const app = express();
const httpServer = createServer(app);

// CORS: Allow only our approved frontend origins (production and current Render client)
const ALLOWED_ORIGINS = [
    'https://disagreement.ai',
    'https://www.disagreement.ai',
    'https://disagreement-ai-client.onrender.com',
];

// Shared CORS options for Express
const CORS_OPTIONS = {
    origin: (origin, callback) => {
        // Allow requests with no Origin header (same-origin, curl, SSR, etc.)
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
};

const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true,
    }
});

// Expose Socket.IO instance to routes via app locals
app.set('io', io);

// Middleware
app.use(cors(CORS_OPTIONS));
// Ensure preflight requests are handled with correct CORS headers
app.options('*', cors({ origin: CORS_OPTIONS.origin, credentials: true, optionsSuccessStatus: 204 }));

// Security and caching headers for API responses
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((req, res, next) => {
    // Always send basic hardening headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Keep auth and API responses out of caches by default
    if ((req.originalUrl || req.url || '').startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-store');
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Universal Request Logger (helps debug proxy/route issues)
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
app.use((req, res, next) => {
    const reqPath = req.originalUrl || req.url || '<unknown>';
    console.log(`Incoming Request: ${req.method} ${reqPath}`);
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/disagreements', disagreementRoutes);
app.use('/api', contactRoutes); // Primary: mount contact routes from router
app.use('/api/ai', aiRoutes);

// Lightweight health check (for clients to auto-detect API availability)
app.get('/api/health', (req, res) => {
    const aiId = process.env.AI_MEDIATOR_USER_ID || '';
    const valid = !!(aiId && (mongoose?.isValidObjectId ? mongoose.isValidObjectId(aiId) : mongoose.Types.ObjectId.isValid(aiId)));
    res.status(200).json({ status: 'ok', aiMediatorConfigured: Boolean(aiId), aiMediatorUserIdValid: valid });
});

// Fallback: direct /api/contact endpoint (uses global fetch in Node 18+)
// This ensures the endpoint exists even if the router fails to load under some entrypoints
// Logging controls and strict mode for fallback endpoint
const CONTACT_STRICT = String(process.env.N8N_CONTACT_WEBHOOK_STRICT || '').toLowerCase() === 'true';
const CONTACT_AUTOFALLBACK = String(process.env.N8N_CONTACT_WEBHOOK_AUTOFALLBACK || 'true').toLowerCase() !== 'false';
const CONTACT_WARN_INTERVAL_MS = Number(process.env.CONTACT_WEBHOOK_WARN_INTERVAL_MS || 60000);
let lastContactWarnAt = 0;
const warnContactDebounced = (msg) => {
    const now = Date.now();
    if (now - lastContactWarnAt > CONTACT_WARN_INTERVAL_MS) {
        console.warn(msg);
        lastContactWarnAt = now;
    }
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.post('/api/contact', async (req, res) => {
    const { fullName, email, message } = req.body;
    const N8N_WEBHOOK_URL = process.env.N8N_CONTACT_WEBHOOK_URL || 'https://disagreementai.app.n8n.cloud/webhook/contact-form-submissions';
    const DEFAULT_MODE = String(process.env.N8N_CONTACT_DEFAULT_MODE || '').toLowerCase();
    const EFFECTIVE_URL = (DEFAULT_MODE === 'test' && N8N_WEBHOOK_URL.includes('/webhook/') && !N8N_WEBHOOK_URL.includes('/webhook-test/'))
        ? N8N_WEBHOOK_URL.replace('/webhook/', '/webhook-test/')
        : N8N_WEBHOOK_URL;

    // Helper to send JSON using Node's http.ServerResponse API
    const sendJson = (statusCode, payload) => {
        try {
            res.statusCode = statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
        } catch (e) {
            console.error('sendJson error:', e);
        }
    };

    if (!fullName || !email || !message) {
        return sendJson(400, { success: false, message: 'Missing form data.' });
    }

    try {
        const response = await fetch(EFFECTIVE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, message }),
        });

        // Success on primary URL
        if (response.ok) {
            return sendJson(200, { success: true, message: 'Form submitted successfully.' });
        }

        // If 404 on prod webhook, optionally retry test webhook(s)
        const is404 = response.status === 404;
        const isProdWebhook = typeof EFFECTIVE_URL === 'string' && EFFECTIVE_URL.includes('/webhook/') && !EFFECTIVE_URL.includes('/webhook-test/');
        const attempts = [`${EFFECTIVE_URL} -> ${response.status}`];
        if (!CONTACT_STRICT && CONTACT_AUTOFALLBACK && is404) {
            const explicitTestUrl = process.env.N8N_CONTACT_WEBHOOK_TEST_URL;
            const candidates = [];
            if (explicitTestUrl) candidates.push(explicitTestUrl);
            if (isProdWebhook) candidates.push(EFFECTIVE_URL.replace('/webhook/', '/webhook-test/'));

            for (const testUrl of candidates) {
                try {
                    const retry = await fetch(testUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fullName, email, message, _meta: { source: 'contact-form', mode: 'autofallback', attempted: testUrl } }),
                    });
                    if (retry.ok) {
                        warnContactDebounced(`[contact:fallback] Primary webhook 404 at ${EFFECTIVE_URL}. Retried fallback successfully at: ${testUrl}. Activate your workflow so /webhook works, or set N8N_CONTACT_WEBHOOK_URL to /webhook-test while testing (and click "Execute Workflow" in n8n).`);
                        return sendJson(200, { success: true, message: 'Form submitted successfully (fallback webhook).' });
                    } else {
                        attempts.push(`${testUrl} -> ${retry.status}`);
                    }
                } catch (e) {
                    attempts.push(`${testUrl} -> network_error`);
                }
            }
        }

        if (CONTACT_STRICT) {
            console.error(`[contact:fallback] n8n webhook responded ${response.status} (STRICT=true). Returning error to client.`);
            return sendJson(502, { success: false, message: 'Upstream contact webhook error.', status: response.status });
        }
        const tried = attempts.length ? ` Tried: ${attempts.join(' | ')}` : '';
        warnContactDebounced(`[contact:fallback] n8n webhook responded ${response.status}. Proceeding with 202 Accepted.${tried} Fix: Activate the workflow for /webhook, or use /webhook-test and press "Execute Workflow" in n8n before submitting. You can also set N8N_CONTACT_WEBHOOK_TEST_URL to override the fallback.`);
        return sendJson(202, { success: true, message: 'Form received. Thank you!' });
    } catch (error) {
        if (CONTACT_STRICT) {
            console.error('[contact:fallback] Error submitting contact form (STRICT=true):', error);
            return sendJson(502, { success: false, message: 'Upstream contact webhook error.' });
        }
        warnContactDebounced('[contact:fallback] Error submitting contact form to n8n. Proceeding with 202 Accepted.');
        return sendJson(202, { success: true, message: 'Form received. Thank you!' });
    }
});

// Centralized error handler to ensure JSON Content-Type and cache headers on errors
// Must be after routes
app.use((err, req, res, _next) => {
    try { console.error(err?.stack || err?.message || err); } catch(_) {}
    const status = (res.statusCode && res.statusCode !== 200) ? res.statusCode : 500;
    // Preserve headers set earlier
    res.status(status);
    // Ensure content type and caching headers are present
    res.setHeader('Content-Type', 'application/json');
    if ((req.originalUrl || req.url || '').startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');
    }
    const payload = { message: err?.message || 'Server Error' };
    if (process.env.NODE_ENV !== 'production' && err?.stack) {
        payload.stack = err.stack;
    }
    return res.end(JSON.stringify(payload));
});


// Socket.IO connection logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', async (data) => {
        try {
            const roomId = data?.roomId;
            if (!roomId) return;

            await socket.join(roomId);

            // Track joined room on the socket for cleanup on disconnect
            try {
                socket.data = socket.data || {};
                socket.data.roomId = roomId;
            } catch (_) {}

            const room = io.sockets.adapter.rooms.get(roomId);
            const numClients = room ? room.size : 0;
            console.log(`User ${socket.id} joined room ${roomId}. Room now has ${numClients} participants.`);

            const disagreement = await Disagreement.findById(roomId);
            if (!disagreement) return;

            // NEW TRIGGER LOGIC: Proactive AI joins when second human participant arrives
            if (numClients === 2 && !disagreement.hasAiMediatorJoined) {
                console.log(`[socket] AI introduction trigger met for room ${roomId}. Calling getAIClarifyingIntroduction.`);

                // 1. Mark joining to prevent race conditions/duplicates
                disagreement.hasAiMediatorJoined = true;
                await disagreement.save();

                // 2. Call the CORRECT AI service for the introductory message
                const aiIntroMessageText = await getAIClarifyingIntroduction();

                // 3-4. Save the AI's message to the embedded messages array
                const sender = process.env.AI_MEDIATOR_USER_ID;
                if (!sender) {
                    console.warn('[socket] AI_MEDIATOR_USER_ID not set; skipping AI intro message broadcast.');
                    return;
                }
                disagreement.messages.push({ sender, text: aiIntroMessageText, isAIMessage: true });
                await disagreement.save();

                // 5. Broadcast the AI's message to the room with populated sender info
                const saved = disagreement.messages[disagreement.messages.length - 1];
                let aiUserDoc = null;
                try {
                    aiUserDoc = await User.findById(sender).select('name');
                } catch (_) {}
                const populatedAiMessage = {
                    _id: saved?._id,
                    sender: aiUserDoc ? { _id: aiUserDoc._id, name: aiUserDoc.name } : { _id: sender, name: 'DAI' },
                    text: aiIntroMessageText,
                    isAIMessage: true
                };
                io.to(roomId).emit('receive_message', populatedAiMessage);
                console.log(`[socket] DAI's official introduction sent to room ${roomId}.`);
            } else if (numClients > 2) {
                console.log(`[socket] Subsequent user join trigger met for room ${roomId}.`);
                // Try to personalize the welcome using provided payload fields; fall back gracefully
                const joiningUserName = (
                    (data && (data.userName || data.username || data.name)) || ''
                ).toString().trim() || 'there';
                const welcomeText = `Welcome, ${joiningUserName}. Please take a moment to read the conversation history before commenting.`;
                // Emit ephemeral system message (not persisted)
                io.to(roomId).emit('systemMessage', { text: welcomeText });
                console.log(`[socket] Ephemeral welcome sent to room ${roomId}.`);
            }
        } catch (e) {
            console.error('[socket] Error in join_room handler:', e?.message || e);
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const { roomId, sender, text } = data || {}
            if (!roomId || !sender || !text || String(text).trim() === '') return

            const disagreement = await Disagreement.findById(roomId)
            if (!disagreement) {
                console.warn(`[socket] send_message: Disagreement not found for room ${roomId}`)
                return
            }

            const message = { sender, text }
            disagreement.messages.push(message)
            await disagreement.save()

            const saved = disagreement.messages[disagreement.messages.length - 1]
            console.log(`[socket] Message persisted in room ${roomId}:`, { _id: saved?._id, sender, len: disagreement.messages.length })

            // Broadcast the persisted message to the specific room with populated sender info
            let userDoc = null
            try {
                userDoc = await User.findById(sender).select('name')
            } catch (_) {}
            const populatedMessage = {
                _id: saved?._id,
                sender: userDoc ? { _id: userDoc._id, name: userDoc.name } : { _id: sender, name: 'Participant' },
                text
            }
            io.to(roomId).emit('receive_message', populatedMessage)

            // Reset inactivity timer on human message
            aiAnalysisService.resetRoomTimer(roomId, io)

            // Route the message through the AI analysis hub (non-blocking on failure)
            try {
                await aiAnalysisService.analyzeMessage(populatedMessage, roomId, io)
            } catch (anErr) {
                console.error('[AI Analysis] analyzeMessage error:', anErr?.message || anErr)
            }
        } catch (e) {
            console.error('[socket] Error handling send_message:', e?.message || e)
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        try {
            const roomId = socket?.data?.roomId;
            if (roomId) {
                const room = io.sockets.adapter.rooms.get(roomId);
                const numClients = room ? room.size : 0;
                if (numClients === 0) {
                    aiAnalysisService.cleanupRoomState(roomId);
                }
            }
        } catch (e) {
            console.error('[Timer] disconnect cleanup error:', e?.message || e);
        }
    });
});


const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));