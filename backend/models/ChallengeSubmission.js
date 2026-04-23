const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema({
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userType: {
        type: String,
        enum: ['Student', 'User'],
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userImage: {
        type: String
    },
    dayNumber: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
