const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Savol matni kiritilishi shart'],
        trim: true
    },
    options: {
        type: [String],
        required: [true, 'Variantlar kiritilishi shart'],
        validate: {
            validator: function(v) {
                return v.length === 4;
            },
            message: 'Variantlar soni aynan 4 ta bo\'lishi shart'
        }
    },
    correctOption: {
        type: Number,
        required: [true, 'To\'g\'ri javob indeksi kiritilishi shart'],
        min: 0,
        max: 3
    },
    score: {
        type: Number,
        required: [true, 'Savol balli kiritilishi shart'],
        default: 1
    }
});

const testSchema = new mongoose.Schema({
    nomi: {
        type: String,
        required: [true, 'Test nomi kiritilishi shart'],
        trim: true
    },
    kurs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Kurs tanlanishi shart']
    },
    guruhlar: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Guruh(lar) tanlanishi shart']
    }],
    vaqtLimiti: {
        type: Number,
        required: [true, 'Vaqt limiti kiritilishi shart (daqiqa)']
    },
    boshlanishVaqti: {
        type: Date,
        required: [true, 'Boshlanish vaqti kiritilishi shart']
    },
    tugashVaqti: {
        type: Date,
        required: [true, 'Tugash vaqti kiritilishi shart']
    },
    savollar: [questionSchema],
    urinishlarSoni: {
        type: Number,
        default: 1
    },
    yaratuvchi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sentNotifications: {
        oneDayBefore: { type: Boolean, default: false },
        oneHourBefore: { type: Boolean, default: false },
        tenMinutesBefore: { type: Boolean, default: false },
        started: { type: Boolean, default: false },
        ended: { type: Boolean, default: false }
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        default: null,
        index: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Test', testSchema);
