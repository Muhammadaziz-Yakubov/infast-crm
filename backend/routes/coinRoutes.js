const express = require('express');
const router = express.Router();
const { manualCoinUpdate, getGlobalLogs } = require('../controllers/coinController');
const { protect, authorize, checkBranchAccess } = require('../middleware/auth');

router.use(protect);
router.use(checkBranchAccess);
router.use(authorize('superadmin', 'admin')); // Faqat admin va superadminlar uchun

router.post('/update', manualCoinUpdate);
router.get('/logs', getGlobalLogs);

module.exports = router;
