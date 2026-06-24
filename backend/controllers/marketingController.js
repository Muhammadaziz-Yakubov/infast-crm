const Campaign = require('../models/Campaign');
const Template = require('../models/Template');
const BroadcastLog = require('../models/BroadcastLog');

// ==================== CAMPAIGNS CONTROLLERS ====================

// @desc    Barcha kampaniyalarni olish
// @route   GET /api/marketing/campaigns
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find(req.branchFilter || {}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi kampaniya qo'shish
// @route   POST /api/marketing/campaigns
exports.createCampaign = async (req, res) => {
    try {
        const campaignData = { ...req.body, ...(req.branchFilter || {}) };
        const campaign = await Campaign.create(campaignData);
        res.status(201).json({ success: true, data: campaign });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kampaniyani yangilash
// @route   PUT /api/marketing/campaigns/:id
exports.updateCampaign = async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...(req.branchFilter || {}) };
        const campaign = await Campaign.findOneAndUpdate(filter, req.body, {
            new: true,
            runValidators: true
        });

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Kampaniya topilmadi yoki filial ruxsati yo\'q' });
        }

        res.status(200).json({ success: true, data: campaign });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Kampaniyani o'chirish
// @route   DELETE /api/marketing/campaigns/:id
exports.deleteCampaign = async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...(req.branchFilter || {}) };
        const campaign = await Campaign.findOneAndDelete(filter);

        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Kampaniya topilmadi yoki filial ruxsati yo\'q' });
        }

        res.status(200).json({ success: true, message: 'Kampaniya muvaffaqiyatli o\'chirildi' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// ==================== TEMPLATES CONTROLLERS ====================

// @desc    Barcha shablonlarni olish
// @route   GET /api/marketing/templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await Template.find(req.branchFilter || {}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: templates.length, data: templates });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi shablon qo'shish
// @route   POST /api/marketing/templates
exports.createTemplate = async (req, res) => {
    try {
        const templateData = { ...req.body, ...(req.branchFilter || {}) };
        const template = await Template.create(templateData);
        res.status(201).json({ success: true, data: template });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Shablonni o'chirish
// @route   DELETE /api/marketing/templates/:id
exports.deleteTemplate = async (req, res) => {
    try {
        const filter = { _id: req.params.id, ...(req.branchFilter || {}) };
        const template = await Template.findOneAndDelete(filter);

        if (!template) {
            return res.status(404).json({ success: false, message: 'Shablon topilmadi yoki filial ruxsati yo\'q' });
        }

        res.status(200).json({ success: true, message: 'Shablon o\'chirildi' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


// ==================== BROADCAST LOGS CONTROLLERS ====================

// @desc    Barcha broadcast jurnallarini olish
// @route   GET /api/marketing/broadcast-logs
exports.getBroadcastLogs = async (req, res) => {
    try {
        const logs = await BroadcastLog.find(req.branchFilter || {}).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi broadcast jurnalini qo'shish
// @route   POST /api/marketing/broadcast-logs
exports.createBroadcastLog = async (req, res) => {
    try {
        const logData = { ...req.body, ...(req.branchFilter || {}) };
        const log = await BroadcastLog.create(logData);
        res.status(201).json({ success: true, data: log });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
