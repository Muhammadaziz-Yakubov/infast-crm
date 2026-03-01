const { Telegraf } = require('telegraf');
const cron = require('node-cron');
const Group = require('../models/Group');
const Student = require('../models/Student');
const config = require('../config/config');

const bot = new Telegraf(config.telegram.botToken);

// Kunlarni o'zbek tilida xaritasi
const dayMap = {
    0: 'Yakshanba',
    1: 'Dushanba',
    2: 'Seshanba',
    3: 'Chorshanba',
    4: 'Payshanba',
    5: 'Juma',
    6: 'Shanba'
};

// Har kuni 7:00 da dars haqida eslatma yuborish
const initScheduler = () => {
    cron.schedule('0 7 * * *', async () => {
        try {
            const today = new Date().getDay();
            const todayName = dayMap[today];

            // Bugun darsi bor guruhlarni qidirish
            // Jadval formati: "Dush-Chor-Jum" yoki shunga o'xshash bo'lishi mumkin
            // Biz jadvaldagi kunlarni tekshiramiz
            const groups = await Group.find({ holati: 'faol', telegramChatId: { $ne: '' } });

            for (const group of groups) {
                const lessonDays = group.jadval.kunlar;
                // Juda sodda tekshiruv (jadvalda bugungi kun nomi yoki uning qisqartmasi borligini ko'radi)
                const isLessonToday = lessonDays.toLowerCase().includes(todayName.toLowerCase().substring(0, 3));

                if (isLessonToday) {
                    const message = `🌅 Assalomu alaykum! \n\n📚 Bugun ${group.nomi} guruhida darsimiz bor. \n\n⏰ Vaqt: ${group.jadval.vaqt}\n\nO'z vaqtida kelishingizni kutib qolamiz! 😊`;
                    await bot.telegram.sendMessage(group.telegramChatId, message);
                }
            }
        } catch (error) {
            console.error('Bot scheduler error:', error);
        }
    });
};

// Guruh ballari hisobotini yuborish
const sendGroupBallReport = async (groupId) => {
    try {
        const group = await Group.findById(groupId);
        if (!group || !group.telegramChatId) return { success: false, message: 'Guruh yoki Telegram Chat ID topilmadi' };

        const students = await Student.find({ guruh: groupId, holati: 'faol' }).sort({ ball: -1 });

        let message = `🏆 *${group.nomi} guruhi bo'yicha ballar reytingi:* \n\n`;

        students.forEach((s, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            message += `${medal} ${s.ism} — *${s.ball}* ball\n`;
        });

        message += `\n📊 Doimiy darslarda qatnashing va ballaringizni oshiring!`;

        await bot.telegram.sendMessage(group.telegramChatId, message, { parse_mode: 'Markdown' });
        return { success: true };
    } catch (error) {
        console.error('Send report error:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    bot,
    initScheduler,
    sendGroupBallReport
};
