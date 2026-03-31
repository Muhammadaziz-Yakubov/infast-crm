const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    ism: {
        type: String,
        required: [true, 'F.I.O kiritilishi shart'],
        trim: true
    },
    telefon: {
        type: String,
        required: [true, 'Telefon raqam kiritilishi shart'],
        trim: true
    },
    username: {
        type: String,
        required: [true, 'Foydalanuvchi nomi kiritilishi shart'],
        unique: true,
        trim: true,
        sparse: true // Allows nulls to be unique if needed, but we'll require it for new students
    },
    password: {
        type: String,
        required: [true, 'Parol kiritilishi shart'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student'],
        default: 'student'
    },
    kurs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Kurs tanlanishi shart']
    },
    guruh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Guruh tanlanishi shart']
    },
    tolovKuni: {
        type: Number,
        required: [true, "To'lov kuni kiritilishi shart"],
        min: 1,
        max: 31
    },
    tolovHolati: {
        type: String,
        enum: ['tolangan', 'tolanmagan', 'qarzdor'],
        default: 'tolanmagan'
    },
    oylikTolov: {
        type: Number,
        default: 0
    },
    maxsusNarx: {
        type: Boolean,
        default: false
    },
    eslatmalar: {
        type: String,
        trim: true,
        default: ''
    },
    holati: {
        type: String,
        enum: ['faol', 'nofaol'],
        default: 'faol'
    },

    coins: {
        type: Number,
        default: 0,
        min: 0
    },
    profileImage: {
        type: String,
        default: ''
    },
    qoshilganSana: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Parolni hash qilish
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Parolni tekshirish
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Index for payment day queries
studentSchema.index({ tolovKuni: 1, tolovHolati: 1 });
studentSchema.index({ guruh: 1 });
studentSchema.index({ kurs: 1 });
studentSchema.index({ coins: -1 });

module.exports = mongoose.model('Student', studentSchema);

