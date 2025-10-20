import asyncHandler from 'express-async-handler';
import Disagreement from '../models/disagreementModel.js';
import User from '../models/userModel.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import emailService from '../services/emailService.js';
import { postOnboardingMessage } from '../services/aiService.js';
import { generateAgreementPDF } from '../services/pdfService.js';
const { sendDirectInviteEmail, sendApprovalRequestEmail, sendApprovalConfirmationEmail, sendAgreementEmail } = emailService;

// Helper: check if user is listed as a participant (any status)
const isUserAnyParticipant = (disagreement, userId) => {
    return disagreement.participants.some(p => p.user.equals(userId));
};

// Helper: check if user is in pendingInvitations queue
const isUserPendingInvite = (disagreement, userId) => {
    return Array.isArray(disagreement.pendingInvitations) && disagreement.pendingInvitations.some(u => u.equals(userId));
};

// @desc    Get all disagreements for the logged-in user
// @route   GET /api/disagreements
// @access  Private
const getDisagreements = asyncHandler(async (req, res) => {
    // Find disagreements where the user is listed as an active participant
    const disagreements = await Disagreement.find({
        participants: { $elemMatch: { user: req.user.id, status: 'active' } }
    })
      .populate('creator', 'name')
      .populate('participants.user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(disagreements);
});

// @desc    Create a new disagreement
// @route   POST /api/disagreements
// @access  Private
const createDisagreement = asyncHandler(async (req, res) => {
    const { title, description, invites } = req.body;
    if (!title || !description) {
        res.status(400);
        throw new Error('Please provide both a title and a description');
    }

    // Generate a unique Case ID with pattern DAI-YYYY-MM-XXX
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
    const prefix = `DAI-${yyyy}-${mm}-`;

    // Count existing disagreements for this year-month to generate sequence
    const monthRegex = new RegExp(`^${prefix}`);
    const countForMonth = await Disagreement.countDocuments({ caseId: { $regex: monthRegex } });
    const seq = String(countForMonth + 1).padStart(3, '0');
    const caseId = `${prefix}${seq}`;

    // ONLY process direct invites if provided and non-empty
    let directInvites = [];
    if (invites && Array.isArray(invites) && invites.length > 0) {
        directInvites = invites
            .map((invite) => {
                const email = String(invite?.email || '').trim().toLowerCase();
                if (!email) return null;
                return {
                    email,
                    token: crypto.randomBytes(20).toString('hex'),
                    // customMessage: invite?.customMessage, // optional
                };
            })
            .filter(Boolean);
    }

    const payload = {
        caseId,
        title,
        description,
        creator: req.user.id,
    };
    if (directInvites.length > 0) {
        payload.directInvites = directInvites;
    }

    const disagreement = await Disagreement.create(payload);
    res.status(201).json(disagreement);
});

// @desc    Get a single disagreement by ID
// @route   GET /api/disagreements/:id
// @access  Private
const getDisagreement = asyncHandler(async (req, res) => {
    const disagreement = await Disagreement.findById(req.params.id)
        .populate('creator', 'name')
        .populate('participants.user', 'name email')
        .populate('pendingInvitations', 'name email')
        .populate('messages.sender', 'name')
        .populate('messages.agreements.user', 'name');

    if (!disagreement) {
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: Allow any listed participant (any status) OR users awaiting approval
    if (!(isUserAnyParticipant(disagreement, req.user.id) || isUserPendingInvite(disagreement, req.user.id))) {
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
    console.log('[acceptInvite] START', { token, userId: userToJoin?.id, email: userToJoin?.email });

    console.log('[acceptInvite] Finding disagreement by token');
    const disagreement = await Disagreement.findOne({
        $or: [
            { 'publicInviteToken.token': token, 'publicInviteToken.enabled': true },
            { 'directInvites.token': token, 'directInvites.status': 'pending' }
        ]
    });

    if (!disagreement) {
        console.warn('[acceptInvite] No disagreement found for token');
        res.status(404);
        throw new Error('Invitation not found, has expired, or has already been accepted.');
    }

    const beforeActive = Array.isArray(disagreement.participants) ? disagreement.participants.filter(p => p.status === 'active').length : 0;
    console.log('[acceptInvite] Disagreement found', { id: disagreement._id?.toString(), beforeActive, aiSent: disagreement.aiOnboardingMessageSent });

    // Check if user is already a participant
    if (disagreement.participants.some(p => p.user.equals(userToJoin.id))) {
        console.warn('[acceptInvite] User already participant');
        res.status(400);
        throw new Error('You are already a participant in this disagreement.');
    }

    const directInvite = disagreement.directInvites.find(inv => inv.token === token);
    let pendingApproval = false;
    
    // SCENARIO 1: Direct Invite (Trusted, Auto-Approved)
    if (directInvite) {
        console.log('[acceptInvite] Direct invite found', { inviteEmail: directInvite.email });
        if (directInvite.email.toLowerCase() !== userToJoin.email.toLowerCase()) {
            console.warn('[acceptInvite] Direct invite email mismatch', { inviteEmail: directInvite.email, userEmail: userToJoin.email });
            res.status(401);
            throw new Error('This invitation is intended for a different user.');
        }
        // Add user as active and mark invite as accepted
        disagreement.participants.push({ user: userToJoin.id, status: 'active' });
        directInvite.status = 'accepted';
    } 
    // SCENARIO 2: Public Invite (Untrusted, Requires Approval)
    else {
        console.log('[acceptInvite] Public invite flow');
        // Public invite: queue for creator approval via pendingInvitations
        const alreadyPending = Array.isArray(disagreement.pendingInvitations) && disagreement.pendingInvitations.some(u => u.equals(userToJoin.id));
        const alreadyParticipant = disagreement.participants.some(p => p.user.equals(userToJoin.id));
        console.log('[acceptInvite] alreadyPending/alreadyParticipant', { alreadyPending, alreadyParticipant });
        if (!alreadyPending && !alreadyParticipant) {
            if (!Array.isArray(disagreement.pendingInvitations)) disagreement.pendingInvitations = [];
            disagreement.pendingInvitations.push(userToJoin.id);
        }
        pendingApproval = true;
    }

    console.log('[acceptInvite] Saving disagreement changes…');
    await disagreement.save();
    const afterActiveSaved = Array.isArray(disagreement.participants) ? disagreement.participants.filter(p => p.status === 'active').length : 0;
    console.log('[acceptInvite] Saved', { afterActiveSaved, pendingApproval });

    if (pendingApproval) {
        console.log('[acceptInvite] Pending approval path returning 202');
        // Notify the creator via email
        try {
            const creator = await User.findById(disagreement.creator).select('email name')
            if (creator?.email) {
                await sendApprovalRequestEmail(
                    creator.email,
                    userToJoin?.name || userToJoin?.email || 'A user',
                    disagreement.title
                )
            }
        } catch (e) {
            console.error('[acceptInvite] Failed to send approval request email:', e?.message || e)
        }
        return res.status(202).json({ code: 'PENDING_APPROVAL', message: 'Your request to join is pending creator approval.', disagreementId: disagreement._id });
    }

    // Trigger AI onboarding if we now have at least two active participants and it's not sent yet
    try {
        console.log('[acceptInvite] Re-fetching disagreement to evaluate onboarding trigger…');
        const updatedDisagreement = await Disagreement.findById(disagreement._id)
        const activeCount = Array.isArray(updatedDisagreement?.participants)
            ? updatedDisagreement.participants.filter(p => p.status === 'active').length
            : 0
        console.log(`[acceptInvite] Active participants after accept: ${activeCount}, flag sent=${updatedDisagreement?.aiOnboardingMessageSent}`)
        if (activeCount >= 2 && !updatedDisagreement.aiOnboardingMessageSent) {
            console.log('[acceptInvite] Triggering AI onboarding message…')
            await postOnboardingMessage(updatedDisagreement._id)
            console.log('[acceptInvite] postOnboardingMessage completed')
        } else {
            console.log('[acceptInvite] Onboarding condition not met or already sent')
        }
    } catch (e) {
        console.error('Error evaluating AI onboarding trigger (acceptInvite):', e?.message || e)
    } finally {
        console.log('[acceptInvite] END')
    }

    return res.status(200).json({ status: 'approved', message: 'Invitation accepted successfully.', disagreementId: disagreement._id });
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

    // Defensive: ensure array fields are initialized to avoid TypeError on legacy docs
    if (!Array.isArray(disagreement.participants)) disagreement.participants = [];
    if (!Array.isArray(disagreement.directInvites)) disagreement.directInvites = [];

    // AUTH CHECK: Any participant (any status) can send direct invites
    const isParticipant = disagreement.participants.some(p => p.user.equals(req.user.id));
    if (!isParticipant) {
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
    console.log('[manageParticipant] START', { action, participantUserId, byUser: req.user?.id, disagreementId: req.params?.id });
    if (!participantUserId || !action) {
        res.status(400);
        throw new Error('Participant user ID and action are required.');
    }
    
    const disagreement = await Disagreement.findById(req.params.id);

    if (!disagreement) {
        console.warn('[manageParticipant] Disagreement not found');
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // AUTH CHECK: Only creator can manage participants
    if (!disagreement.creator.equals(req.user.id)) {
        console.warn('[manageParticipant] Unauthorized user', { byUser: req.user?.id });
        res.status(401);
        throw new Error('Not authorized to manage participants');
    }

    const participant = disagreement.participants.find(p => p.user.equals(participantUserId));
    if (!participant) {
        res.status(404);
        throw new Error('Participant not found in this disagreement.');
    }

    const beforeActive = disagreement.participants.filter(p => p.status === 'active').length;

    if (action === 'approve') {
        console.log('[manageParticipant] Approving participant');
        participant.status = 'active';
    } else if (action === 'remove') {
        console.log('[manageParticipant] Removing participant');
        disagreement.participants = disagreement.participants.filter(p => !p.user.equals(participantUserId));
    } else {
        res.status(400);
        throw new Error("Invalid action. Must be 'approve' or 'remove'.");
    }

    console.log('[manageParticipant] Saving changes…');
    await disagreement.save();
    const afterActive = disagreement.participants.filter(p => p.status === 'active').length;
    console.log('[manageParticipant] Saved', { beforeActive, afterActive });

    const updatedDisagreement = await Disagreement.findById(req.params.id)
      .populate('participants.user', 'name email')
      .populate('messages.sender', 'name');
    console.log('[manageParticipant] END');
    res.status(200).json(updatedDisagreement);
});


// (We will keep the processDisagreement and deleteDisagreement functions, but they may need updates later)
// For now, let's export the core functions needed for the invite system.
// NOTE: The old `inviteUser` function is now replaced by `createDirectInvite`.

// New: Approve/Deny pending invitations
const approveInvitation = asyncHandler(async (req, res) => {
    const { userId } = req.body || {};
    console.log('[approveInvitation] START', { approverId: req.user?.id, targetUserId: userId, disagreementId: req.params?.id });
    if (!userId) {
        res.status(400);
        throw new Error('userId is required');
    }

    const disagreement = await Disagreement.findById(req.params.id);
    if (!disagreement) {
        console.warn('[approveInvitation] Disagreement not found');
        res.status(404);
        throw new Error('Disagreement not found');
    }

    // Only creator can approve
    if (!disagreement.creator.equals(req.user.id)) {
        console.warn('[approveInvitation] Unauthorized approver', { approverId: req.user?.id });
        res.status(401);
        throw new Error('Not authorized to approve invitations');
    }

    const beforeActive = Array.isArray(disagreement.participants) ? disagreement.participants.filter(p => p.status === 'active').length : 0;
    console.log('[approveInvitation] Before update', { beforeActive, pendingCount: (disagreement.pendingInvitations || []).length });

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

    console.log('[approveInvitation] Saving disagreement…');
    await disagreement.save();
    const updated = await Disagreement.findById(req.params.id)
        .populate('creator', 'name')
        .populate('participants.user', 'name email')
        .populate('pendingInvitations', 'name email')
        .populate('messages.sender', 'name');

    // Notify the approved user via email
    try {
        const approvedUser = await User.findById(userId).select('email')
        if (approvedUser?.email) {
            await sendApprovalConfirmationEmail(approvedUser.email, updated?.title)
        }
    } catch (e) {
        console.error('[approveInvitation] Failed to send approval confirmation email:', e?.message || e)
    }

    // Trigger AI onboarding if we now have at least two active participants and it's not sent yet
    try {
        const activeCount = Array.isArray(updated?.participants)
            ? updated.participants.filter(p => p.status === 'active').length
            : 0
        console.log(`[approveInvitation] Active participants after approve: ${activeCount}, flag sent=${updated?.aiOnboardingMessageSent}`)
        if (activeCount >= 2 && !updated.aiOnboardingMessageSent) {
            console.log('[approveInvitation] Triggering AI onboarding message…')
            await postOnboardingMessage(updated._id)
            console.log('[approveInvitation] postOnboardingMessage completed')
        } else {
            console.log('[approveInvitation] Onboarding condition not met or already sent')
        }
    } catch (e) {
        console.error('Error evaluating AI onboarding trigger (approveInvitation):', e?.message || e)
    } finally {
        console.log('[approveInvitation] END')
    }

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
        .populate('pendingInvitations', 'name email')
        .populate('messages.sender', 'name');
    res.status(200).json(updated);
});

// @desc    Finalize a disagreement: archive, generate PDF, email participants
// @route   POST /api/disagreements/:id/finalize
// @access  Private (creator only)
const finalizeAgreement = asyncHandler(async (req, res) => {
    const { id } = req.params
    const disagreement = await Disagreement.findById(id)
            .populate('participants.user', 'email name')
            .populate('messages.sender', 'name')
    if (!disagreement) {
        res.status(404)
        throw new Error('Disagreement not found')
    }
    if (!disagreement.creator.equals(req.user.id)) {
        res.status(401)
        throw new Error('Only the creator can finalize this disagreement')
    }

    const finalText = (req.body?.finalText || '').toString().trim() || disagreement.resolution || `Final agreement for "${disagreement.title}".`
    const now = new Date()
    disagreement.resolution = finalText
    disagreement.archivedAt = now
    disagreement.status = 'resolved'
    disagreement.resolvedAt = now
    await disagreement.save()

    let pdfBuffer
    try {
        pdfBuffer = await generateAgreementPDF(disagreement, finalText)
    } catch (e) {
        console.error('[finalizeAgreement] PDF generation failed:', e?.message || e)
        res.status(500)
        throw new Error('Failed to generate agreement PDF')
    }

    try {
        const toList = (Array.isArray(disagreement.participants) ? disagreement.participants : [])
            .map(p => p?.user?.email)
            .filter(Boolean)
        if (toList.length) {
            await sendAgreementEmail(toList, pdfBuffer, `agreement-${disagreement.caseId || disagreement._id}.pdf`)
        }
    } catch (e) {
        console.error('[finalizeAgreement] Failed to send agreement email:', e?.message || e)
        // continue; email failure shouldn’t block archiving
    }

    return res.status(200).json({ message: 'Agreement finalized', archivedAt: disagreement.archivedAt })
})

// @desc    Download finalized agreement PDF
// @route   GET /api/disagreements/:id/agreement
// @access  Private (participants only)
const downloadAgreement = asyncHandler(async (req, res) => {
    const { id } = req.params
    const disagreement = await Disagreement.findById(id)
        .populate('messages.sender', 'name')
    if (!disagreement) {
        res.status(404)
        throw new Error('Disagreement not found')
    }
    // auth: participant only
    if (!isUserAnyParticipant(disagreement, req.user.id)) {
        res.status(401)
        throw new Error('Not Authorized')
    }

    const finalText = disagreement.resolution || `Agreement for "${disagreement.title}" is not available.`
    let pdfBuffer
    try {
        pdfBuffer = await generateAgreementPDF(disagreement, finalText)
    } catch (e) {
        console.error('[downloadAgreement] PDF generation failed:', e?.message || e)
        res.status(500)
        throw new Error('Failed to generate agreement PDF')
    }

    const filename = `agreement-${disagreement.caseId || disagreement._id}.pdf`
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).end(pdfBuffer)
})

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
    finalizeAgreement,
    downloadAgreement,
    // Keep existing functions, but ensure they are exported if still used.
    // updateDisagreement, deleteDisagreement, processDisagreement
};