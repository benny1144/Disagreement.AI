const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the blueprint for a single message in the chat
const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId, // Links to the User who sent it
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    files: [{ type: String }], // A list of URLs for any files
    timestamp: {
        type: Date,
        default: Date.now // Automatically sets the time
    }
});

// This is the main blueprint for a single disagreement
const disagreementSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    participants: [{
        type: Schema.Types.ObjectId, // A list of User IDs
        ref: 'User',
        required: true
    }],
    messages: [messageSchema], // A list of messages using the blueprint above
    status: {
        type: String,
        default: 'open' // The disagreement is 'open' by default
    },
    ai_mode: {
        type: String,
        required: true
    }
}, {
    // This automatically adds "createdAt" and "updatedAt" timestamps
    timestamps: true
});

const Disagreement = mongoose.model('Disagreement', disagreementSchema);

module.exports = Disagreement;