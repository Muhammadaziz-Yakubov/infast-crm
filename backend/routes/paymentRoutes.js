const express = require('express');
const router = express.Router();
const {
    getPayments, createPayment, getDashboard, exportDebtors, deletePayment, bulkCreatePayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/export/debtors', exportDebtors);
router.post('/bulk', bulkCreatePayment);
router.route('/').get(getPayments).post(createPayment);
router.route('/:id').delete(deletePayment);

module.exports = router;


