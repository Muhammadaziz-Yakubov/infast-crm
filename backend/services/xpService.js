const Student = require('../models/Student');

/**
 * O'quvchining XP (Experience Points) ballarini yangilash
 * @param {string} studentId - O'quvchi ID
 * @param {number} amount - Qo'shiladigan XP miqdori
 * @param {string} reason - Sabab (loyiha uchun loglarda ishlatish mumkin)
 */
const updateXP = async (studentId, amount, reason) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) return null;

        // Yangi ballni hisoblash (100,000 dan oshib ketmasligi va 0 dan kam bo'lmasligi kerak)
        let newXP = (student.xp || 0) + amount;
        if (newXP < 0) newXP = 0;
        if (newXP > 100000) newXP = 100000;

        student.xp = newXP;
        await student.save();

        console.log(`XP Updated: Student ${studentId}, Amount ${amount}, Reason: ${reason}, Total: ${newXP}`);
        return student.xp;
    } catch (error) {
        console.error('XPService Error:', error.message);
        throw error;
    }
};

module.exports = {
    updateXP
};
