const Student = require('../models/Student');
const { updateCoins } = require('../services/coinService');

/**
 * Admin tomonidan manual coin boshqarish
 * Body: { targetType: 'all' | 'group' | 'students', targetId: string | string[], amount: number, reason: string }
 */
exports.manualCoinUpdate = async (req, res) => {
    try {
        const { targetType, targetId, amount, reason } = req.body;

        if (!targetType || !amount || !reason) {
            return res.status(400).json({ success: false, message: 'Barcha maydonlarni to\'ldiring' });
        }

        let students = [];

        let filter = { role: 'student', ...(req.branchFilter || {}) };

        if (targetType === 'all') {
            students = await Student.find(filter);
        } else if (targetType === 'group') {
            students = await Student.find({ guruh: targetId, ...filter });
        } else if (targetType === 'students') {
            students = await Student.find({ _id: { $in: targetId }, ...filter });
        }

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'O\'quvchilar topilmadi' });
        }

        // Barcha tanlangan o'quvchilarga coinlarni yangilash
        const updatePromises = students.map(s => updateCoins(s._id, parseInt(amount), reason));
        await Promise.all(updatePromises);

        res.json({
            success: true,
            message: `${students.length} ta o'quvchining coinlari muvaffaqiyatli yangilandi`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getGlobalLogs = async (req, res) => {
    try {
        const CoinLog = require('../models/CoinLog');
        let matchFilter = {};
        if (req.branchFilter && req.branchFilter.branchId) {
            const studentIds = await Student.find(req.branchFilter).distinct('_id');
            matchFilter.student = { $in: studentIds };
        }

        const logs = await CoinLog.find(matchFilter)
            .populate('student', 'ism familya phone')
            .sort('-sana')
            .limit(100);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
