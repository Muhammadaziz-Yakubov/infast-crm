const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Kampaniya nomi kiritilishi shart'],
        trim: true
    },
    platform: {
        type: String,
        required: [true, 'Platforma kiritilishi shart']
    },
    budget: {
        type: Number,
        required: [true, 'Budjet kiritilishi shart']
    },
    startDate: {
        type: Date,
        required: [true, 'Boshlanish sanasi kiritilishi shart']
    },
    endDate: {
        type: Date,
        required: [true, 'Tugash sanasi kiritilishi shart']
    },
    status: {
        type: String,
        enum: ['Faol', 'Yakunlangan', 'Rejalashtirilgan'],
        default: 'Rejalashtirilgan'
    },
    result: {
        type: String,
        default: '-'
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Campaign', campaignSchema);
