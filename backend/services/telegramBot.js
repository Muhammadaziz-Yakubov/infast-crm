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

        let message = `📊 *${group.nomi} guruhi bo'yicha davomat va reyting:* \n\n`;

        students.forEach((s, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👤';
            message += `${medal} ${s.ism}\n`;
        });

        message += `\n📊 Doimiy darslarda qatnashing va faol bo'ling!`;

        await bot.telegram.sendMessage(group.telegramChatId, message, { parse_mode: 'Markdown' });
        return { success: true };
    } catch (error) {
        console.error('Send report error:', error);
        return { success: false, message: error.message };
    }
};

// Guruhga yangi vazifa haqida xabar yuborish
const sendTaskNotification = async (groupId, taskData) => {
    try {
        const group = await Group.findById(groupId);
        if (!group || !group.telegramChatId) {
            console.log('⚠️ Guruh yoki Telegram Chat ID topilmadi, xabar yuborilmadi');
            return { success: false, message: 'Guruh yoki Telegram Chat ID topilmadi' };
        }

        const deadlineDate = new Date(taskData.deadline);
        const formattedDeadline = deadlineDate.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `📋 *YANGI VAZIFA BERILDI!*\n\n` +
            `📌 *Sarlavha:* ${taskData.title}\n` +
            `📅 *Deadline:* ${formattedDeadline}\n` +
            `🏆 *Maksimal ball:* ${taskData.maxScore}\n\n` +
            `⚠️ *ESLATMA:* Agar 2 ta vazifani bajarmasangiz, guruhdan chiqarilasiz!\n\n` +
            `💪 Vazifani o'z vaqtida bajaring va yuqori ball to'plang!`;

        await bot.telegram.sendMessage(group.telegramChatId, message, { parse_mode: 'Markdown' });
        console.log(`✅ Telegram xabar yuborildi: ${group.nomi} guruhiga`);
        return { success: true };
    } catch (error) {
        console.error('❌ Telegram vazifa xabari xatosi:', error.message);
        return { success: false, message: error.message };
    }
};

// Guruhga dars davomati hisobotini yuborish
const sendAttendanceNotification = async (groupId, date, attendanceData) => {
    try {
        const group = await Group.findById(groupId);
        if (!group || !group.telegramChatId) return { success: false, message: 'Guruh yoki Telegram Chat ID topilmadi' };

        const formattedDate = new Date(date).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const present = attendanceData.oquvchilar.filter(o => o.keldi);
        const absent = attendanceData.oquvchilar.filter(o => !o.keldi);

        let message = `📝 *DAVOMAT HISOBOTI*\n` +
            `📅 *Sana:* ${formattedDate}\n` +
            `📚 *Guruh:* ${group.nomi}\n\n`;

        if (present.length > 0) {
            message += `✅ *Kelganlar (${present.length}):*\n`;
            present.forEach(p => {
                message += `• ${p.oquvchi.ism}\n`;
            });
        }

        if (absent.length > 0) {
            message += `\n❌ *Kelmaganlar (${absent.length}):*\n`;
            absent.forEach(a => {
                message += `• ${a.oquvchi.ism}\n`;
            });
        }

        message += `\n📊 O'z vaqtida darslarga qatnashganlarga rahmat!`;

        await bot.telegram.sendMessage(group.telegramChatId, message, { parse_mode: 'Markdown' });
        return { success: true };
    } catch (error) {
        console.error('Send attendance report error:', error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    bot,
    initScheduler,
    sendGroupBallReport,
    sendTaskNotification,
    sendAttendanceNotification
};
