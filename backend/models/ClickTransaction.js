const mongoose = require('mongoose');

const clickTransactionSchema = new mongoose.Schema({
    click_trans_id: { type: String, required: true, unique: true },
    service_id: { type: String },
    click_paydoc_id: { type: String },
    merchant_trans_id: { type: String }, // O'quvchi ID
    amount: { type: Number },
    action: { type: Number }, // 0 - Prepare, 1 - Complete
    status: { type: String, enum: ['waiting', 'confirmed', 'rejected', 'error'], default: 'waiting' },
    error_code: { type: Number },
    error_note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ClickTransaction', clickTransactionSchema);
