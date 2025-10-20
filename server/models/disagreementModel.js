import mongoose from 'mongoose';
import crypto from 'crypto';

const messageSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    isAIMessage: { type: Boolean, default: false },
    isProposal: { type: Boolean, default: false },
    agreements: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            agreedAt: { type: Date, default: Date.now }
        }
    ],
    timestamp: { type: Date, default: Date.now }
});

// A sub-document for participants who have joined
const participantSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        required: true,
        enum: ['active', 'pending'], // 'active' can see chat, 'pending' is waiting for approval
        default: 'pending'
    }
}, { _id: false });

// A sub-document for direct, trusted email invitations
const directInviteSchema = mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted'],
        default: 'pending'
    },
    customMessage: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now, expires: '7d' } // Invites expire after 7 days
});

const disagreementSchema = mongoose.Schema({
    caseId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    title: { // Formerly 'text'
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
    },
    description: { // NEW: For the invite landing page context
        type: String,
        required: [true, 'Please add a brief description'],
        trim: true,
    },
    creator: { // Formerly 'user'
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    // Active participants with status
    participants: [participantSchema],
    // Users who joined via public link and await creator approval
    pendingInvitations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Direct email invites (token-based)
    // Direct email invites (token-based). Default undefined to avoid creating empty arrays which can trigger unique index nulls
    directInvites: { type: [directInviteSchema], default: undefined },
    publicInviteToken: { // The single, shareable link token
        token: { type: String, unique: true, sparse: true },
        enabled: { type: Boolean, default: true }
    },
    messages: [messageSchema],
    aiOnboardingMessageSent: {
        type: Boolean,
        default: false,
    },
    hasAiMediatorJoined: {
        type: Boolean,
        default: false,
    },
    // Agreement Engine (v4.0): track resolution status
    status: { type: String, default: 'open' }, // 'open' | 'resolved'
    resolvedAt: { type: Date },
    resolution: {
        type: String,
    },
    archivedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true,
});

// Sanitize directInvites before validation to avoid null tokens and empty arrays

disagreementSchema.pre('validate', function(next) {
    if (Array.isArray(this.directInvites)) {
        this.directInvites = this.directInvites.filter(inv => inv && typeof inv.token === 'string' && inv.token.trim() && inv.email)
        if (this.directInvites.length === 0) {
            this.directInvites = undefined
        }
    }
    next()
})

// Before saving a new disagreement, add the creator as the first active participant
// and generate the initial public invite token.
disagreementSchema.pre('save', function(next) {
    if (this.isNew) {
        // Add creator to participants list with 'active' status
        this.participants.push({ user: this.creator, status: 'active' });

        // Generate a unique public invite token
        this.publicInviteToken = {
            token: crypto.randomBytes(20).toString('hex'),
            enabled: true
        };
    }
    next();
});

// Ensure sparse unique index on directInvites.token to avoid null collisions
// NOTE: We rely on a startup migration to drop any existing non-sparse index.
disagreementSchema.index({ 'directInvites.token': 1 }, { unique: true, sparse: true });

const Disagreement = mongoose.model('Disagreement', disagreementSchema);

export default Disagreement;