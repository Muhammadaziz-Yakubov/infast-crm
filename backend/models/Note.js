const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Kontent kiritilishi shart'],
        trim: true,
        maxlength: [1000, 'Eslatma 1000 belgidan oshmasligi kerak']
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'authorType'
    },
    authorType: {
        type: String,
        required: true,
        enum: ['Student', 'User']
    },
    category: {
        type: String,
        enum: ['vazifa', 'fikr', 'imtihon', 'imtihon_siri', 'dars_materiali', 'general'],
        default: 'general'
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        userType: {
            type: String,
            required: true,
            enum: ['Student', 'User']
        }
    }],
    isPinned: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
