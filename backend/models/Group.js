const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    nomi: {
        type: String,
        required: [true, 'Guruh nomi kiritilishi shart'],
        trim: true
    },
    kurs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Kurs tanlanishi shart']
    },
    oqituvchi: {
        type: String,
        trim: true,
        default: ''
    },
    jadval: {
        kunlar: {
            type: String,
            default: ''
        },
        vaqt: {
            type: String,
            default: ''
        }
    },
    holati: {
        type: String,
        enum: ['faol', 'nofaol'],
        default: 'faol'
    },
    maxOquvchilar: {
        type: Number,
        default: 20
    },
    telegramChatId: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual: guruh o'quvchilari soni
groupSchema.virtual('oquvchilarSoni', {
    ref: 'Student',
    localField: '_id',
    foreignField: 'guruh',
    count: true
});

module.exports = mongoose.model('Group', groupSchema);
