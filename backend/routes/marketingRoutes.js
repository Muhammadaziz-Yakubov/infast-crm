const express = require('express');
const router = express.Router();
const {
    getCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getTemplates,
    createTemplate,
    deleteTemplate,
    getBroadcastLogs,
    createBroadcastLog
} = require('../controllers/marketingController');
const { protect, authorize } = require('../middleware/auth');

// Faqat admin ruxsati uchun himoyalangan yo'nalishlar
router.use(protect);
router.use(authorize('admin'));

// Campaigns
router.get('/campaigns', getCampaigns);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);

// Templates
router.get('/templates', getTemplates);
router.post('/templates', createTemplate);
router.delete('/templates/:id', deleteTemplate);

// Broadcast Logs
router.get('/broadcast-logs', getBroadcastLogs);
router.post('/broadcast-logs', createBroadcastLog);

module.exports = router;
