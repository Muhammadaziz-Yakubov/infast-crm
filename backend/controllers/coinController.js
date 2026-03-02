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

        if (targetType === 'all') {
            students = await Student.find({ role: 'student' });
        } else if (targetType === 'group') {
            students = await Student.find({ guruh: targetId, role: 'student' });
        } else if (targetType === 'students') {
            students = await Student.find({ _id: { $in: targetId }, role: 'student' });
        }

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'O\'quvchilar topilmadi' });
        }

        // Barcha tanlangan o'quvchilarga coinlarni yangilash
        // Logika: ketma-ket bajarish (promise all ishlatsa bo'ladi, lekin bazani urib qo'ymaslik uchun ehtiyotkorlik bilan)
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
        const logs = await CoinLog.find()
            .populate('student', 'ism familya phone')
            .sort('-sana')
            .limit(100);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
