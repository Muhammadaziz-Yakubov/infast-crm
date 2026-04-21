const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    player1Score: {
        type: Number,
        default: 0
    },
    player2Score: {
        type: Number,
        default: 0
    },
    player1Completed: {
        type: Boolean,
        default: false
    },
    player2Completed: {
        type: Boolean,
        default: false
    },
    betAmount: {
        type: Number,
        enum: [200, 400, 600],
        required: true
    },
    inviteCode: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['waiting', 'ongoing', 'completed', 'cancelled'],
        default: 'waiting'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizQuestion'
    }],
    isRandom: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Battle', battleSchema);
