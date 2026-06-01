const cron = require('node-cron');
const Test = require('../models/Test');
const { sendTestNotification } = require('../services/telegramBot');

const startTestReminder = () => {
    // Har daqiqada tekshirish (* * * * *)
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Faol eslatmalari to'liq yuborib bo'linmagan testlarni qidirish
            const activeTests = await Test.find({
                $or: [
                    { 'sentNotifications.oneDayBefore': false },
                    { 'sentNotifications.oneHourBefore': false },
                    { 'sentNotifications.tenMinutesBefore': false },
                    { 'sentNotifications.started': false },
                    { 'sentNotifications.ended': false }
                ]
            });

            for (const test of activeTests) {
                const startDiffMs = new Date(test.boshlanishVaqti) - now;
                const endDiffMs = new Date(test.tugashVaqti) - now;
                let updated = false;

                // 1. Bir kun (24 soat) oldin eslatma
                // Test boshlanishiga 24 soatdan kam va 23 soatdan ko'p vaqt qolganda
                if (startDiffMs > 0 && startDiffMs <= 24 * 60 * 60 * 1000 && !test.sentNotifications.oneDayBefore) {
                    await sendTestNotification(test._id, 'oneDayBefore');
                    test.sentNotifications.oneDayBefore = true;
                    updated = true;
                }

                // 2. Bir soat (60 daqiqa) oldin eslatma
                // Test boshlanishiga 1 soatdan kam va 50 daqiqa ko'p vaqt qolganda
                if (startDiffMs > 0 && startDiffMs <= 60 * 60 * 1000 && !test.sentNotifications.oneHourBefore) {
                    await sendTestNotification(test._id, 'oneHourBefore');
                    test.sentNotifications.oneHourBefore = true;
                    updated = true;
                }

                // 3. 10 daqiqa oldin eslatma
                // Test boshlanishiga 10 daqiqadan kam va 0 daqiqadan ko'p vaqt qolganda
                if (startDiffMs > 0 && startDiffMs <= 10 * 60 * 1000 && !test.sentNotifications.tenMinutesBefore) {
                    await sendTestNotification(test._id, 'tenMinutesBefore');
                    test.sentNotifications.tenMinutesBefore = true;
                    updated = true;
                }

                // 4. Test boshlanganda
                // Hozirgi vaqt boshlanish vaqti bilan tugash vaqti oralig'ida bo'lsa
                if (now >= new Date(test.boshlanishVaqti) && now < new Date(test.tugashVaqti) && !test.sentNotifications.started) {
                    await sendTestNotification(test._id, 'started');
                    test.sentNotifications.started = true;
                    updated = true;
                }

                // 5. Test tugaganda
                // Hozirgi vaqt tugash vaqtidan o'tgan bo'lsa
                if (now >= new Date(test.tugashVaqti) && !test.sentNotifications.ended) {
                    await sendTestNotification(test._id, 'ended');
                    test.sentNotifications.ended = true;
                    updated = true;
                }

                if (updated) {
                    await test.save();
                }
            }
        } catch (error) {
            console.error('❌ Test Reminder scheduler error:', error.message);
        }
    });

    console.log('⏰ Test eslatmalari cron job ishga tushirildi (har daqiqada tekshiradi)');
};

module.exports = startTestReminder;
