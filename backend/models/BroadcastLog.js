const mongoose = require('mongoose');

const broadcastLogSchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    channel: {
        type: String,
        required: [true, 'Kanal kiritilishi shart'] // SMS, Telegram, Email
    },
    audience: {
        type: String,
        required: [true, 'Auditoriya kiritilishi shart']
    },
    title: {
        type: String,
        required: [true, 'Sarlavha kiritilishi shart'],
        trim: true
    },
    sentCount: {
        type: Number,
        required: [true, 'Yuborilganlar soni kiritilishi shart']
    },
    status: {
        type: String,
        default: 'Muvaffaqiyatli'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BroadcastLog', broadcastLogSchema);
