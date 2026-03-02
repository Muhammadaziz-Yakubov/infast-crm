const express = require('express');
const router = express.Router();
const { manualCoinUpdate, getGlobalLogs } = require('../controllers/coinController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin')); // Faqat adminlar uchun

router.post('/update', manualCoinUpdate);
router.get('/logs', getGlobalLogs);

module.exports = router;
