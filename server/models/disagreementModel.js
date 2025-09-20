const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    files: [{
        type: String, // Array of URLs to uploaded files
    }],
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const disagreementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A disagreement must have a title.'],
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    messages: [messageSchema],
    status: {
        type: String,
        enum: ['open', 'resolved', 'closed'],
        default: 'open',
    },
    ai_mode: {
        type: String,
        enum: ['Judge and Jury', 'Mediator', 'Debate Facilitator', 'Conversation', 'Fact-Finder', 'Relationship Counselor'],
        default: 'Fact-Finder',
    },
}, { timestamps: true });

const Disagreement = mongoose.model('Disagreement', disagreementSchema);

module.exports = Disagreement;