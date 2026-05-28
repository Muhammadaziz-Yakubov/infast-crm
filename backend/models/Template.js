const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Shablon sarlavhasi kiritilishi shart'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Shablon matni kiritilishi shart'],
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Template', templateSchema);
