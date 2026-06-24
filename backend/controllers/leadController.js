const Lead = require('../models/Lead');
const mongoose = require('mongoose');

// @desc    Barcha leadlarni olish (filtr va qidiruv bilan)
// @route   GET /api/leads
exports.getLeads = async (req, res) => {
    try {
        const { status, source, date, search } = req.query;
        let query = { ...(req.branchFilter || {}) };

        if (status) query.status = status;
        if (source) query.source = source;

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Statistika va Analitika olish
// @route   GET /api/leads/stats
exports.getLeadStats = async (req, res) => {
    try {
        const filter = { ...(req.branchFilter || {}) };

        const totalLeads = await Lead.countDocuments(filter);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newLeadsToday = await Lead.countDocuments({
            createdAt: { $gte: today },
            ...filter
        });

        const contactedLeads = await Lead.countDocuments({ status: 'Bog\'lanildi', ...filter });
        const enrolledLeads = await Lead.countDocuments({ status: 'O\'quvchi bo\'ldi', ...filter });
        const conversionRate = totalLeads > 0 ? ((enrolledLeads / totalLeads) * 100).toFixed(1) : 0;

        // Manbalar bo'yicha taqsimot
        const aggregateMatch = {};
        if (req.branchFilter && req.branchFilter.branchId) {
            aggregateMatch.branchId = new mongoose.Types.ObjectId(req.branchFilter.branchId);
        }

        const sourceDistribution = await Lead.aggregate([
            { $match: aggregateMatch },
            { $group: { _id: '$source', count: { $sum: 1 } } }
        ]);

        // Kunlik leadlar (oxirgi 7 kun)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const dailyLeads = await Lead.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, ...aggregateMatch } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Follow-up bugun kerak bo'lganlar
        const followUpsTodayCount = await Lead.countDocuments({
            followUpDate: { $gte: today, $lte: new Date(today.getTime() + 86400000) },
            ...filter
        });

        // Funnel Data
        const funnelData = [
            { name: 'Lead', count: totalLeads },
            { name: 'Bog\'lanildi', count: await Lead.countDocuments({ status: 'Bog\'lanildi', ...filter }) },
            { name: 'Qiziqdi', count: await Lead.countDocuments({ status: 'Qiziqdi', ...filter }) },
            { name: 'Sinov darsi', count: await Lead.countDocuments({ status: 'Sinov darsi', ...filter }) },
            { name: 'O\'quvchi bo\'ldi', count: await Lead.countDocuments({ status: 'O\'quvchi bo\'ldi', ...filter }) }
        ];

        res.status(200).json({
            success: true,
            data: {
                totalLeads,
                newLeadsToday,
                contactedLeads,
                enrolledLeads,
                conversionRate,
                sourceDistribution,
                dailyLeads,
                followUpsTodayCount,
                funnelData
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server xatosi', error: error.message });
    }
};

// @desc    Yangi lead qo'shish
// @route   POST /api/leads
exports.createLead = async (req, res) => {
    try {
        const leadData = {
            ...req.body,
            branchId: req.branchId || req.body.branchId || req.user.branchId
        };
        const lead = await Lead.create(leadData);
        res.status(201).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Leadni tahrirlash
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const lead = await Lead.findOneAndUpdate(query, req.body, {
            new: true,
            runValidators: true
        });

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead topilmadi' });
        }

        res.status(200).json({ success: true, data: lead });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Leadni o'chirish
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const lead = await Lead.findOneAndDelete(query);

        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead topilmadi' });
        }

        res.status(200).json({ success: true, message: 'Lead muvaffaqiyatli o\'chirildi' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
