const Student = require('../models/Student');
const SpinLog = require('../models/SpinLog');
const { updateCoins } = require('../services/coinService');

// @desc    G'ildirakni aylantirish va mukofot berish
// @route   POST /api/coins/spin
exports.spinWheel = async (req, res) => {
    try {
        const studentId = req.user._id;
        const spinCost = 300;

        // 1. O'quvchini hamda balansini tekshirish
        const student = await Student.findById(studentId);
        if (!student || (student.coins || 0) < spinCost) {
            return res.status(400).json({
                success: false,
                message: `Sizda yetarli coinlar yo'q! Bir marta aylantirish ${spinCost} coin turadi. 🪙`
            });
        }

        // 2. Bugun necha marta o'ynaganini tekshirish (limit 3)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const spinsToday = await SpinLog.countDocuments({
            student: studentId,
            createdAt: { $gte: today }
        });

        if (spinsToday >= 3) {
            return res.status(400).json({
                success: false,
                message: "Siz bugungi 3 ta imkoniyatdan foydalanib bo'ldingiz. Ertaga yana urinib ko'ring! 🍀"
            });
        }

        // 3. Coinlarni yechish (xarajat)
        await updateCoins(studentId, -spinCost, "Omad G'ildiragi: O'yin uchun to'lov");

        // 4. Mukofotlar ehtimolligi (probabilistlik)
        const prizes = [
            { amount: 0, label: "Omadingiz kelmadi", weight: 25 },
            { amount: 10, label: "10 Coin", weight: 20 },
            { amount: 50, label: "50 Coin", weight: 15 },
            { amount: 100, label: "100 Coin", weight: 10 },
            { amount: 150, label: "150 Coin (Tekin aylanish!)", weight: 10 },
            { amount: 300, label: "300 Coin", weight: 8 },
            { amount: 500, label: "500 Coin (MEGA!)", weight: 7 },
            { amount: 1000, label: "1000 Coin (JACKPOT! 🔥)", weight: 5 },
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

        // 5. Coinlarni qo'shish (agar bo'lsa)
        if (selectedPrize.amount > 0) {
            await updateCoins(studentId, selectedPrize.amount, `Omad G'ildiragi: ${selectedPrize.label}`);
        }

        // 6. Logga yozish
        await SpinLog.create({
            student: studentId,
            prize: selectedPrize.amount,
            prizeLabel: selectedPrize.label,
            sana: new Date()
        });

        res.json({
            success: true,
            message: `Tabriklaymiz! Siz ${selectedPrize.label} yutib oldingiz! 🎁`,
            prize: selectedPrize,
            remainingSpins: 3 - (spinsToday + 1)
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

