const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'O\'quvchi tanlanishi shart']
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        default: 5
    },
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'QuizQuestion'
        },
        selectedOption: Number,
        isCorrect: Boolean
    }],
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QuizResult', quizResultSchema);
