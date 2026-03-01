const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, 'Vazifa tanlanishi shart']
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'O\'quvchi tanlanishi shart']
    },
    images: [{
        type: String,
        required: true
    }],
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    score: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'graded'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
