import asyncHandler from 'express-async-handler';
import Disagreement from '../models/disagreementModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import emailService from '../../services/emailService.js';
const { sendDirectInviteEmail } = emailService;

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
        .populate('participants.user', 'name email')
        .populate('pendingInvitations', 'name email');

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
        // Public invite: queue for creator approval via pendingInvitations
        const alreadyPending = Array.isArray(disagreement.pendingInvitations) && disagreement.pendingInvitations.some(u => u.equals(userToJoin.id));
        const alreadyParticipant = disagreement.participants.some(p => p.user.equals(userToJoin.id));
        if (!alreadyPending && !alreadyParticipant) {
            if (!Array.isArray(disagreement.pendingInvitations)) disagreement.pendingInvitations = [];
            disagreement.pendingInvitations.push(userToJoin.id);
        }
    }

    await disagreement.save();
    res.status(200).json({ message: 'Invitation accepted successfully.', disagreementId: disagreement._id });
});

// @desc    Create and send direct email invitations
// @route   POST /api/disagreements/:id/invite
// @access  Private
const createDirectInvite = asyncHandler(async (req, res) => {
    const { invites, customMessage } = req.body || {}; // invites is an array of { email, name }
    if (!Array.isArray(invites) || invites.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one email to invite.');
    }

    const disagreement = await Disagreement.findById(req.params.id).populate('creator', 'name email');

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: Only the creator can send direct invites
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to send invites');
    }

    const { CLIENT_URL } = process.env;
    const inviterName = disagreement.creator.name;
    const baseClient = CLIENT_URL || 'http://localhost:5173';
    const sentInvites = [];

    for (const invite of invites) {
        const email = String(invite.email || '').toLowerCase().trim();
        const name = invite.name || (email ? email.split('@')[0] : '') || 'Invited User';
        if (!email) continue;

        // Find or create user stub
        let user = await User.findOne({ email });
        if (!user) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(crypto.randomBytes(12).toString('hex'), salt);
            user = await User.create({ name, email, password: hashedPassword });
        }

        // Add directly to participants as active (dedupe)
        if (!disagreement.participants.some(p => p.user.equals(user._id))) {
            disagreement.participants.push({ user: user._id, status: 'active' });
        }

        // Create a direct invite token for email convenience
        const token = crypto.randomBytes(20).toString('hex');
        disagreement.directInvites.push({ email, token, customMessage });

        const joinLink = `${baseClient}/invite/${token}`;
        try {
            await sendDirectInviteEmail(email, name, {
                creatorName: inviterName,
                disagreementTitle: disagreement.title,
                customMessage,
                inviteLink: joinLink,
            });
        } catch (e) {
            console.error('Failed to send direct invite email:', e?.message || e);
        }

        sentInvites.push(email);
    }

    await disagreement.save();


    res.status(200).json({ message: `Invites processed: ${sentInvites.join(', ')}` });
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

// New: Approve/Deny pending invitations
const approveInvitation = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) {
        res.status(400);
        throw new Error('userId is required');
    }

    const disagreement = await Disagreement.findById(req.params.id);
    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // Only creator can approve
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to approve invitations');
    }

    // Remove from pendingInvitations
    if (Array.isArray(disagreement.pendingInvitations)) {
        disagreement.pendingInvitations = disagreement.pendingInvitations.filter(u => !u.equals(userId));
    } else {
        disagreement.pendingInvitations = [];
    }

    // Add to participants as active if not already there
    if (!disagreement.participants.some(p => p.user.equals(userId))) {
        disagreement.participants.push({ user: userId, status: 'active' });
    }

    await disagreement.save();
    const updated = await Disagreement.findById(req.params.id)
        .populate('creator', 'name')
        .populate('participants.user', 'name email')
        .populate('pendingInvitations', 'name email');
    res.status(200).json(updated);
});

const denyInvitation = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};
    if (!userId) {
        res.status(400);
        throw new Error('userId is required');
    }

    const disagreement = await Disagreement.findById(req.params.id);
    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // Only creator can deny
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401);
        throw new Error('Not authorized to deny invitations');
    }

    if (Array.isArray(disagreement.pendingInvitations)) {
        disagreement.pendingInvitations = disagreement.pendingInvitations.filter(u => !u.equals(userId));
    } else {
        disagreement.pendingInvitations = [];
    }

    await disagreement.save();
    const updated = await Disagreement.findById(req.params.id)
        .populate('creator', 'name')
        .populate('participants.user', 'name email')
        .populate('pendingInvitations', 'name email');
    res.status(200).json(updated);
});

export {
    getDisagreements,
    createDisagreement,
    getDisagreement,
    createDirectInvite,
    getInviteDetails,
    acceptInvite,
    manageParticipant,
    approveInvitation,
    denyInvitation,
    // Keep existing functions, but ensure they are exported if still used.
    // updateDisagreement, deleteDisagreement, processDisagreement
};