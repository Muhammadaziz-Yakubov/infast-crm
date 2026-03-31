const mongoose = require('mongoose');

const eventAttendanceLogSchema = new mongoose.Schema({
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
    action: {
        type: String,
        enum: ['REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED'],
        required: true
    },
    coinChange: {
        type: Number,
        required: true
    },
    note: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EventAttendanceLog', eventAttendanceLogSchema);
