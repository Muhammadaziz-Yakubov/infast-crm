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
    },
    // Curriculum tizimi uchun yangi maydonlar
    curriculumKalit: {
        type: String,
        trim: true,
        default: 'frontend'
    },
    daraja: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    darsProgress: {
        type: Number,
        default: 0,
        min: 0
    },
    boshlanganSana: {
        type: Date,
        default: null
    },
    darsKunlari: {
        type: [Number],
        default: [1, 3, 5] // 0=Yakshanba, 1=Dushanba, 2=Seshanba, 3=Chorshanba, 4=Payshanba, 5=Juma, 6=Shanba
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
