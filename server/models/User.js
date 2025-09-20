const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// This is the blueprint for a single user
const userSchema = new Schema({
    // We require a name, which must be a String
    name: {
        type: String,
        required: true
    },
    // We require an email, which must be a unique String
    email: {
        type: String,
        required: true,
        unique: true
    },
    // We require a password, which must be a String
    password: {
        type: String,
        required: true
    }
}, {
    // This automatically adds "createdAt" and "updatedAt" timestamps
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;