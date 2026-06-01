const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: [true, 'Test tanlanishi shart']
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'O\'quvchi tanlanishi shart']
    },
    guruh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Guruh tanlanishi shart']
    },
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: Number, // 0, 1, 2, 3, or -1 for unselected
        isCorrect: Boolean
    }],
    score: {
        type: Number,
        required: true
    },
    totalScore: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to quickly fetch results of a specific student or test
testResultSchema.index({ test: 1, student: 1 });
testResultSchema.index({ student: 1 });

module.exports = mongoose.model('TestResult', testResultSchema);
