const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    status: {
        type: String,
        enum: ['REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED'],
        default: 'REGISTERED'
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    attendanceMarkedAt: {
        type: Date
    },
    coinProcessed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure a student can only register for an event once
eventRegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
