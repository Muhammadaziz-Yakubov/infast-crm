const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    guruh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: [true, 'Guruh tanlanishi shart']
    },
    sana: {
        type: Date,
        required: [true, 'Sana kiritilishi shart'],
        default: Date.now
    },
    oquvchilar: [{
        oquvchi: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        keldi: {
            type: Boolean,
            default: false
        }
    }],
    izoh: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Bir guruh uchun bir kunda faqat bitta davomat bo'lishi mumkin
attendanceSchema.index({ guruh: 1, sana: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
