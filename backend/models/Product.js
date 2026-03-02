const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nomi: {
        type: String,
        required: [true, 'Mahsulot nomi kiritilishi shart'],
        trim: true
    },
    tavsif: {
        type: String,
        trim: true
    },
    narxi: {
        type: Number,
        required: [true, 'Mahsulot narxi kiritilishi shart'],
        min: 0
    },
    rasm: {
        type: String,
        required: [true, 'Mahsulot rasmi kiritilishi shart']
    },
    soni: {
        type: Number,
        default: 0,
        min: 0
    },
    holati: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
