const express = require('express');
const router = express.Router();
const {
    getLeads,
    getLeadStats,
    createLead,
    updateLead,
    deleteLead
} = require('../controllers/leadController');
const { protect, authorize, checkBranchAccess } = require('../middleware/auth');

// Ommaviy yo'nalish (Marketing formasi uchun)
router.post('/public', createLead);

// Himoyalangan yo'nalishlar
router.use(protect);
router.use(checkBranchAccess);
router.use(authorize('superadmin', 'admin'));

router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;
