const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tadbir nomi kiritilishi shart'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Tadbir tavsifi kiritilishi shart']
    },
    bannerUrl: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: [true, 'Tadbir manzili kiritilishi shart']
    },
    startDate: {
        type: Date,
        required: [true, 'Boshlanish sanasi kiritilishi shart']
    },
    endDate: {
        type: Date
    },
    maxParticipants: {
        type: Number,
        default: null
    },
    coinReward: {
        type: Number,
        default: 500
    },
    coinPenalty: {
        type: Number,
        default: 500
    },
    status: {
        type: String,
        enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
        default: 'UPCOMING'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for registration count
eventSchema.virtual('registrationsCount', {
    ref: 'EventRegistration',
    localField: '_id',
    foreignField: 'event',
    count: true
});

module.exports = mongoose.model('Event', eventSchema);
