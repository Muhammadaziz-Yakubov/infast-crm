const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    nomi: {
        type: String,
        required: [true, 'Kurs nomi kiritilishi shart'],
        trim: true
    },
    narx: {
        type: Number,
        required: [true, 'Kurs narxi kiritilishi shart'],
        min: 0
    },
    davomiyligi: {
        type: String,
        required: [true, 'Kurs davomiyligi kiritilishi shart'],
        trim: true
    },
    tavsif: {
        type: String,
        trim: true,
        default: ''
    },
    holati: {
        type: String,
        enum: ['faol', 'nofaol'],
        default: 'faol'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
