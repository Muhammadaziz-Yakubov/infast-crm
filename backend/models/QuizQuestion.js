const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Savol matni kiritilishi shart'],
        trim: true
    },
    options: [{
        type: String,
        required: [true, 'Variantlar kiritilishi shart']
    }],
    correctOption: {
        type: Number,
        required: [true, 'To\'g\'ri javob indeksi kiritilishi shart']
    },
    category: {
        type: String,
        enum: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
        required: [true, 'Kategoriya kiritilishi shart']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
