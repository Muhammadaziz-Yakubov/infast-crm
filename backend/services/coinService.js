const Student = require('../models/Student');
const CoinLog = require('../models/CoinLog');

/**
 * O'quvchiga coin qo'shish yoki ayirish
 * @param {string} studentId - O'quvchi ID
 * @param {number} amount - Miqdor (musbat qo'shadi, manfiy ayiradi)
 * @param {string} reason - Sabab (vazifa, davomat va h.k.)
 */
const updateCoins = async (studentId, amount, reason) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) return null;

        const type = amount >= 0 ? 'plus' : 'minus';

        // Yangi balansni hisoblash (manfiyga tushib ketmasligi kerak)
        let newBalance = (student.coins || 0) + amount;
        if (newBalance < 0) newBalance = 0;

        // O'quvchini yangilash
        student.coins = newBalance;
        await student.save();



        // Log yozish
        await CoinLog.create({
            student: studentId,
            amount: Math.abs(amount),
            type,
            reason
        });

        return student.coins;
    } catch (error) {
        console.error('CoinService Error:', error.message);
        throw error;
    }
};

module.exports = {
    updateCoins
};
