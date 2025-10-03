import asyncHandler from 'express-async-handler';
import Disagreement from '../models/disagreementModel.js';
import axios from 'axios';

// @desc    Get all disagreements for a user
// @route   GET /api/disagreements
// @access  Private
const getDisagreements = asyncHandler(async (req, res) => {
    const disagreements = await Disagreement.find({ user: req.user.id });
    res.status(200).json(disagreements);
});

// @desc    Create a new disagreement
// @route   POST /api/disagreements
// @access  Private
const createDisagreement = asyncHandler(async (req, res) => {
    if (!req.body.text) {
        res.status(400);
        throw new Error('Please add a text field');
    }
    const disagreement = await Disagreement.create({
        text: req.body.text,
        user: req.user.id,
    });
    res.status(201).json(disagreement);
});

// @desc    Get a single disagreement by ID
// @route   GET /api/disagreements/:id
// @access  Private
const getDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    if (disagreement.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not Authorized');
    }

    res.status(200).json(disagreement);
});

// @desc    Update a disagreement
// @route   PUT /api/disagreements/:id
// @access  Private
const updateDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    if (disagreement.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not Authorized');
    }

    const updatedDisagreement = await Disagreement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedDisagreement);
});

// @desc    Delete a disagreement
// @route   DELETE /api/disagreements/:id
// @access  Private
const deleteDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    if (disagreement.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await disagreement.deleteOne();
    res.status(200).json({ id: req.params.id });
});


// @desc    Process a disagreement with the AI crew
// @route   POST /api/disagreements/:id/process
// @access  Private
const processDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    if (disagreement.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not Authorized');
    }

    // --- START: NEW & IMPROVED LOGIC ---

    // 1. Populate sender names to provide full context to the AI
    await disagreement.populate('messages.sender', 'name');

    let disputeText;
    if (disagreement.messages && disagreement.messages.length > 0) {
        // 2. Build context from messages, safely handling missing sender info
        disputeText = disagreement.messages
            .map(msg => `${msg.sender ? msg.sender.name : 'A User'}: ${msg.text}`)
            .join('\n');
    } else {
        // 3. Fallback to the initial disagreement text if no messages exist
        disputeText = disagreement.text;
    }

    // 4. Final check to prevent sending empty requests
    if (!disputeText || disputeText.trim() === '') {
        return res.status(400).json({ message: 'No disagreement content available to process.' });
    }

    // 5. Use environment variables for flexibility
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:5001/process_disagreement';

    try {
        const response = await axios.post(
            aiServiceUrl,
            { dispute_text: disputeText },
            { timeout: 15000 } // Set a 15-second timeout
        );

        const resolution = response.data.resolution;

        disagreement.resolution = resolution;
        await disagreement.save();

        res.status(200).json({ resolution });

    } catch (error) {
        // 6. Intelligent error handling for when the AI service fails
        console.error('Error communicating with AI service:', error.message);

        // Check for specific network/timeout errors
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            res.status(504).json({ message: 'The AI service took too long to respond. Please try again later.' });
        } else if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ message: 'The AI service is currently unavailable. Please try again later.' });
        } else {
            res.status(502).json({ message: 'An error occurred while communicating with the AI service.' });
        }
    }
    // --- END: NEW & IMPROVED LOGIC ---
});

// @desc    Invite a user to a disagreement
// @route   POST /api/disagreements/:id/invite
// @access  Private
const inviteUser = asyncHandler(async (req, res) => {
    const { email } = req.body || {};

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(String(email))) {
        res.status(400);
        throw new Error('Valid email is required');
    }

    const disagreement = await Disagreement.findById(req.params.id).populate('user', 'name');

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // Ensure the inviter is the owner of the disagreement
    if (disagreement.user._id.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to invite');
    }

    // Prepare email transport
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@disagreement.ai';
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

    // If SMTP not configured, fail clearly so invites don't appear "sent" without delivery
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        res.status(500);
        throw new Error('Email service not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM.');
    }

    // Lazy import nodemailer to avoid cost if not used elsewhere
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const inviterName = disagreement.user?.name || 'A Disagreement.AI user';
    const subject = `${inviterName} invited you to a Disagreement`;
    const joinLink = `${CLIENT_URL}/disagreement/${String(disagreement._id)}?invite=1`;

    const textBody = [
        `${inviterName} invited you to collaborate on a disagreement:`,
        `\n"${disagreement.text}"`,
        `\nOpen the discussion: ${joinLink}`,
        `\n— Disagreement.AI`
    ].join('\n');

    const htmlBody = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#111">
        <h2 style="margin:0 0 12px 0;color:#111">You're invited to a Disagreement</h2>
        <p><strong>${inviterName}</strong> invited you to collaborate on:</p>
        <blockquote style="margin:12px 0;padding:12px 16px;background:#f8f9fb;border-radius:8px;border:1px solid #eee">${
          (disagreement.text || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }</blockquote>
        <p>
          <a href="${joinLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px">Open the discussion</a>
        </p>
        <p style="color:#555">If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${joinLink}">${joinLink}</a></p>
        <p style="color:#777;font-size:12px">This invite was sent via Disagreement.AI</p>
      </div>`;

    // Send the email
    let info;
    try {
        info = await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject,
            text: textBody,
            html: htmlBody,
        });
    } catch (err) {
        console.error('Invite email send failed:', err?.message);
        res.status(500);
        throw new Error('Failed to send invitation email.');
    }

    // Fire-and-forget webhook (optional), but its failure should not break success response
    const webhookUrl = process.env.INVITE_WEBHOOK_URL;
    const timeoutMs = Number(process.env.INVITE_TIMEOUT_MS || 5000);
    if (webhookUrl) {
        axios.post(
            webhookUrl,
            {
                invitedEmail: email,
                disagreementId: String(disagreement._id),
                disagreementTitle: disagreement.text,
                inviterName,
                inviterId: req.user.id,
                messageId: info?.messageId || null,
            },
            { timeout: timeoutMs }
        ).catch((e) => {
            console.warn('Invite webhook failed (non-blocking):', e?.message);
        });
    }

    return res.status(200).json({ message: 'Invitation email sent.', messageId: info?.messageId || undefined });
});


// Export all functions
export {
    getDisagreements,
    createDisagreement,
    getDisagreement,
    updateDisagreement,
    deleteDisagreement,
    processDisagreement,
    inviteUser
};