import mongoose from 'mongoose';

const messageSchema = mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const disagreementSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        text: {
            type: String,
            required: [true, 'Please add a text value'],
        },
        messages: [messageSchema],
        resolution: {
            type: String,
        }
    },
    {
        timestamps: true,
    }
);

const Disagreement = mongoose.model('Disagreement', disagreementSchema);

export default Disagreement;