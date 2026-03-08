const express = require('express');
const router = express.Router();
const {
    getLeads,
    getLeadStats,
    createLead,
    updateLead,
    deleteLead
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

// Ommaviy yo'nalish (Marketing formasi uchun)
router.post('/public', createLead);

// Faqat admin ruxsati uchun himoyalangan yo'nalishlar
router.use(protect);
router.use(authorize('admin'));

router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
