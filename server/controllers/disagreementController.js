import asyncHandler from 'express-async-handler';
import Disagreement from '../models/disagreementModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Helper function to check if a user is an active participant
const isUserActiveParticipant = (disagreement, userId) => {
    return disagreement.participants.some(p => p.user.equals(userId) && p.status === 'active');
};

// @desc    Get all disagreements for the logged-in user
// @route   GET /api/disagreements
// @access  Private
const getDisagreements = asyncHandler(async (req, res) => {
    // Find disagreements where the user is listed as an active participant
    const disagreements = await Disagreement.find({
        participants: { $elemMatch: { user: req.user.id, status: 'active' } }
    }).populate('creator', 'name').sort({ createdAt: -1 });
    res.status(200).json(disagreements);
});

// @desc    Create a new disagreement
// @route   POST /api/disagreements
// @access  Private
const createDisagreement = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) {
        res.status(400);
        throw new Error('Please provide both a title and a description');
    }
    const disagreement = await Disagreement.create({
        title,
        description,
        creator: req.user.id,
    });
    res.status(201).json(disagreement);
});

// @desc    Get a single disagreement by ID
// @route   GET /api/disagreements/:id
// @access  Private
const getDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id)
        .populate('creator', 'name')
        .populate('participants.user', 'name');

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: User must be an active participant to view
    if (!isUserActiveParticipant(disagreement, req.user.id)) {
        res.status(401);
        throw new Error('Not Authorized');
    }

    res.status(200).json(disagreement);
});

// @desc    Get the public details of an invitation before a user accepts
// @route   GET /api/disagreements/invite/:token
// @access  Public
const getInviteDetails = asyncHandler(async (req, res) => {
    const { token } = req.params;
    
    // Find the disagreement by either the public token or a direct invite token
    const disagreement = await Disagreement.findOne({
        $or: [
            { 'publicInviteToken.token': token },
            { 'directInvites.token': token }
        ]
    }).populate('creator', 'name');

    if (!disagreement) {
        res.status(404);
        throw new Error('Invitation not found or has expired.');
    }

    // Find the specific direct invite to get the custom message, if it exists
    const directInvite = disagreement.directInvites.find(inv => inv.token === token);

    res.status(200).json({
        title: disagreement.title,
        description: disagreement.description,
        creatorName: disagreement.creator.name,
        customMessage: directInvite ? directInvite.customMessage : null,
    });
});

// @desc    Accept an invitation (both public and direct)
// @route   POST /api/disagreements/invite/:token
// @access  Private (user must be logged in to accept)
const acceptInvite = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const userToJoin = req.user;

    const disagreement = await Disagreement.findOne({
        $or: [
            { 'publicInviteToken.token': token, 'publicInviteToken.enabled': true },
            { 'directInvites.token': token, 'directInvites.status': 'pending' }
        ]
    });

    if (!disagreement) {
        res.status(404);
        throw new Error('Invitation not found, has expired, or has already been accepted.');
    }

    // Check if user is already a participant
    if (disagreement.participants.some(p => p.user.equals(userToJoin.id))) {
        res.status(400);
        throw new Error('You are already a participant in this disagreement.');
    }

    const directInvite = disagreement.directInvites.find(inv => inv.token === token);
    
    // SCENARIO 1: Direct Invite (Trusted, Auto-Approved)
    if (directInvite) {
        if (directInvite.email.toLowerCase() !== userToJoin.email.toLowerCase()) {
            res.status(401);
            throw new Error('This invitation is intended for a different user.');
        }
        // Add user as active and mark invite as accepted
        disagreement.participants.push({ user: userToJoin.id, status: 'active' });
        directInvite.status = 'accepted';
    } 
    // SCENARIO 2: Public Invite (Untrusted, Requires Approval)
    else {
        // Add user as pending
        disagreement.participants.push({ user: userToJoin.id, status: 'pending' });
    }

    await disagreement.save();
    res.status(200).json({ message: 'Invitation accepted successfully.', disagreementId: disagreement._id });
});

// @desc    Create and send direct email invitations
// @route   POST /api/disagreements/:id/invite
// @access  Private
const createDirectInvite = asyncHandler(async (req, res) => {
    const { invites, customMessage } = req.body; // invites is an array of { email, name }
    if (!invites || !Array.isArray(invites) || invites.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one email to invite.');
    }

    const disagreement = await Disagreement.findById(req.params.id).populate('creator', 'name');

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: Only the creator can send direct invites
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to send invites');
    }

    // Check for SMTP configuration
    const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, EMAIL_FROM, CLIENT_URL } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        res.status(500);
        throw new Error('Email service is not configured on the server.');
    }
    
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const inviterName = disagreement.creator.name;
    const sentInvites = [];

    for (const invite of invites) {
        const token = crypto.randomBytes(20).toString('hex');
        disagreement.directInvites.push({
            email: invite.email,
            token: token,
            customMessage: customMessage
        });

        const joinLink = `${CLIENT_URL || 'http://localhost:5173'}/invite/${token}`;
        const subject = `${inviterName} has invited you to a disagreement`;
        
        // Simple but effective email template
        const htmlBody = `
            <p>Hi ${invite.name || ''},</p>
            <p>${inviterName} has invited you to join a disagreement titled: "${disagreement.title}".</p>
            ${customMessage ? `<p>They added the following message:</p><blockquote>${customMessage}</blockquote>` : ''}
            <p><a href="${joinLink}">Click here to view the invitation</a></p>
        `;

        await transporter.sendMail({
            from: EMAIL_FROM,
            to: invite.email,
            subject: subject,
            html: htmlBody,
        });
        sentInvites.push(invite.email);
    }

    await disagreement.save();
    res.status(200).json({ message: `Successfully sent invites to: ${sentInvites.join(', ')}` });
});

// @desc    Manage a participant (approve/deny/remove)
// @route   PUT /api/disagreements/:id/participants
// @access  Private
const manageParticipant = asyncHandler(async (req, res) => {
    const { participantUserId, action } = req.body; // action can be 'approve' or 'remove'
    if (!participantUserId || !action) {
        res.status(400);
        throw new Error('Participant user ID and action are required.');
    }
    
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: Only creator can manage participants
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to manage participants');
    }

    const participant = disagreement.participants.find(p => p.user.equals(participantUserId));
    if (!participant) {
        res.status(404);
        throw new Error('Participant not found in this disagreement.');
    }

    if (action === 'approve') {
        participant.status = 'active';
    } else if (action === 'remove') {
        disagreement.participants = disagreement.participants.filter(p => !p.user.equals(participantUserId));
    } else {
        res.status(400);
        throw new Error("Invalid action. Must be 'approve' or 'remove'.");
    }

    await disagreement.save();
    const updatedDisagreement = await Disagreement.findById(req.params.id).populate('participants.user', 'name');
    res.status(200).json(updatedDisagreement);
});


// (We will keep the processDisagreement and deleteDisagreement functions, but they may need updates later)
// For now, let's export the core functions needed for the invite system.
// NOTE: The old `inviteUser` function is now replaced by `createDirectInvite`.

export {
    getDisagreements,
    createDisagreement,
    getDisagreement,
    createDirectInvite,
    getInviteDetails,
    acceptInvite,
    manageParticipant,
    // Keep existing functions, but ensure they are exported if still used.
    // updateDisagreement, deleteDisagreement, processDisagreement
};