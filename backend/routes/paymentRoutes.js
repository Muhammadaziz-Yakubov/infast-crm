const express = require('express');
const router = express.Router();
const {
    getPayments, createPayment, getDashboard, exportDebtors
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/export/debtors', exportDebtors);
router.route('/').get(getPayments).post(createPayment);

module.exports = router;
