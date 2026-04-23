const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Foydalanuvchi nomi kiritilishi shart'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Parol kiritilishi shart'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['superadmin', 'admin', 'teacher', 'accountant'],
        default: 'admin'
    },

    fullName: {
        type: String,
        default: 'Administrator'
    },
    profileImage: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

// Parolni hash qilish
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Parolni tekshirish
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
