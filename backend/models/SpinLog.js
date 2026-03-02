const mongoose = require('mongoose');

const spinLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    prize: {
        type: Number,
        required: true
    },
    prizeLabel: {
        type: String,
        required: true
    },
    sana: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SpinLog', spinLogSchema);
