/// <reference types="node" />
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

// Import route files
import userRoutes from './routes/userRoutes.js';
import disagreementRoutes from './routes/disagreementRoutes.js';
import contactRoutes from './routes/contactRoutes.js'; // --- (Step 1: Import the new contact routes) ---

// Load environment variables from project root, then local, then fallback to services/.env if needed
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Root-level .env (always resolve relative to this file)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Local server/.env (if present)
dotenv.config({ path: path.resolve(__dirname, '.env') });
// services/.env (for Docker or alternate setups)
dotenv.config({ path: path.resolve(__dirname, '../services/.env') });

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);

// Allow dynamic origin to reduce CORS-related login failures (can be tightened via CLIENT_URL env)
const CLIENT_ORIGIN = process.env.CLIENT_URL || true; // true reflects request origin
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

// Universal Request Logger (helps debug proxy/route issues)
app.use((req, res, next) => {
    const path = req.originalUrl || req.url || '<unknown>';
    console.log(`Incoming Request: ${req.method} ${path}`);
    next();
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/disagreements', disagreementRoutes);
app.use('/api', contactRoutes); // Primary: mount contact routes from router

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