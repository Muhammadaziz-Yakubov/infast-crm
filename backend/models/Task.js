const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vazifa sarlavhasi kiritilishi shart'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Vazifa tavsifi kiritilishi shart']
    },
    image: {
        type: String,
        default: ''
    },
    maxScore: {
        type: Number,
        required: [true, 'Maksimal ball kiritilishi shart'],
        default: 100
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline kiritilishi shart']
    },
    group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Guruh tanlanishi shart']
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Yaratuvchi tanlanishi shart']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
