const mongoose = require('mongoose');

const coinLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['plus', 'minus'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    sana: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CoinLog', coinLogSchema);
