const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ism kiritilishi shart'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Telefon raqam kiritilishi shart'],
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Kurs nomi kiritilishi shart']
    },
    source: {
        type: String,
        enum: ['Instagram', 'Telegram', 'YouTube', 'TikTok', 'Referral', 'Website'],
        required: [true, 'Manba tanlanishi shart']
    },
    status: {
        type: String,
        enum: ['Yangi Lead', 'Bog\'lanildi', 'Qiziqdi', 'Sinov darsi', 'O\'quvchi bo\'ldi', 'Yo\'qotildi'],
        default: 'Yangi Lead'
    },
    assignedManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    followUpDate: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
