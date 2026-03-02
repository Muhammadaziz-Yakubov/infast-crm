const Student = require('../models/Student');
const SpinLog = require('../models/SpinLog');
const { updateCoins } = require('../services/coinService');

// @desc    G'ildirakni aylantirish va mukofot berish
// @route   POST /api/coins/spin
exports.spinWheel = async (req, res) => {
    try {
        const studentId = req.user._id;

        // Bugun o'ynaganmi yo'qmi tekshirish
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alreadySpun = await SpinLog.findOne({
            student: studentId,
            sana: { $gte: today }
        });

        if (alreadySpun) {
            return res.status(400).json({
                success: false,
                message: "Siz bugun o'z omadingizni sinab ko'rgansiz. Ertaga yana urinib ko'ring! 🍀"
            });
        }

        // Mukofotlar ehtimolligi (probabilistlik)
        const prizes = [
            { amount: 0, label: "Omadingiz kelmadi", weight: 35 },
            { amount: 19, label: "19 Coin", weight: 20 },
            { amount: 25, label: "25 Coin", weight: 15 },
            { amount: 100, label: "100 Coin", weight: 12 },
            { amount: 200, label: "200 Coin", weight: 8 },
            { amount: 300, label: "300 Coin", weight: 7 },
            { amount: 500, label: "500 Coin (JACKPOT!)", weight: 3 },
        ];

        // Tasodifiy mukofot tanlash
        const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedPrize = prizes[0];
        for (const prize of prizes) {
            if (random < prize.weight) {
                selectedPrize = prize;
                break;
            }
            random -= prize.weight;
        }

        // Coinlarni qo'shish
        await updateCoins(studentId, selectedPrize.amount, `Omad G'ildiragi: ${selectedPrize.label}`);

        // Logga yozish
        await SpinLog.create({
            student: studentId,
            prize: selectedPrize.amount,
            prizeLabel: selectedPrize.label,
            sana: new Date()
        });

        res.json({
            success: true,
            message: `Tabriklaymiz! Siz ${selectedPrize.label} yutib oldingiz! 🎁`,
            prize: selectedPrize
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Oxirgi yutuqlarni olish (global)
// @route   GET /api/coins/spin-logs
exports.getSpinLogs = async (req, res) => {
    try {
        const logs = await SpinLog.find()
            .populate('student', 'ism')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
