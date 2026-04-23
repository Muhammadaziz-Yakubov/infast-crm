const mongoose = require('mongoose');
const challengeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Sarlavha kiritilishi shart'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Tavsif kiritilishi shart']
    },
    duration: {
        type: Number,
        required: [true, 'Davomiyligi (kun) kiritilishi shart']
    },
    days: [{
        dayNumber: { type: Number, required: true },
        task: { type: String, required: true }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        participantType: {
            type: String,
            enum: ['Student', 'User'],
            required: true
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Challenge', challengeSchema);
