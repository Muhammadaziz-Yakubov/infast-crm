const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    oquvchi: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, "O'quvchi tanlanishi shart"]
    },
    summa: {
        type: Number,
        required: [true, "To'lov summasi kiritilishi shart"],
        min: 0
    },
    sana: {
        type: Date,
        default: Date.now
    },
    oy: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    yil: {
        type: Number,
        required: true
    },
    tolovTuri: {
        type: String,
        enum: ['naqd', 'karta', 'online'],
        default: 'naqd'
    },
    izoh: {
        type: String,
        trim: true,
        default: ''
    },
    kurs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    guruh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }
}, {
    timestamps: true
});

// Index for monthly queries
paymentSchema.index({ oy: 1, yil: 1 });
paymentSchema.index({ oquvchi: 1, oy: 1, yil: 1 });
paymentSchema.index({ sana: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
