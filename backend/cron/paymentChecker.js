const cron = require('node-cron');
const Student = require('../models/Student');
const Payment = require('../models/Payment');

// Har kuni soat 00:01 da avtomatik tekshirish
const startPaymentChecker = () => {
    // Har kuni tekshirish: '1 0 * * *' = har kuni 00:01
    cron.schedule('1 0 * * *', async () => {
        try {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            console.log(`🔄 [${today.toISOString()}] To'lov tekshiruvi boshlandi...`);

            let qarzdorCount = 0;
            let resetCount = 0;

            // 1. To'lov kuni bugun bo'lgan o'quvchilar - yangi to'lov davri boshlandi
            // Agar shu oy uchun to'lov qilgan bo'lsa - "tolangan" holatda qoladi
            // Agar shu oy uchun to'lov qilmagan bo'lsa - "qarzdor" bo'ladi
            const todayStudents = await Student.find({
                tolovKuni: currentDay,
                holati: 'faol'
            });

            for (const student of todayStudents) {
                const existingPayment = await Payment.findOne({
                    oquvchi: student._id,
                    oy: currentMonth,
                    yil: currentYear
                });

                if (existingPayment) {
                    // Shu oy to'lov qilingan
                    if (student.tolovHolati !== 'tolangan') {
                        student.tolovHolati = 'tolangan';
                        await student.save();
                        resetCount++;
                    }
                } else {
                    // To'lov kuni keldi lekin to'lov qilinmagan - qarzdor
                    if (student.tolovHolati !== 'qarzdor') {
                        student.tolovHolati = 'qarzdor';
                        await student.save();
                        qarzdorCount++;
                    }
                }
            }

            // 2. To'lov kuni allaqachon o'tgan lekin hali "tolanmagan" holatda
            // turgan o'quvchilarni qarzdorga o'tkazish
            const overdueStudents = await Student.find({
                tolovKuni: { $lt: currentDay },
                tolovHolati: 'tolanmagan',
                holati: 'faol'
            });

            for (const student of overdueStudents) {
                const existingPayment = await Payment.findOne({
                    oquvchi: student._id,
                    oy: currentMonth,
                    yil: currentYear
                });

                if (!existingPayment) {
                    student.tolovHolati = 'qarzdor';
                    await student.save();
                    qarzdorCount++;
                } else {
                    // To'lov bor lekin holat yangilanmagan
                    student.tolovHolati = 'tolangan';
                    await student.save();
                }
            }

            // 3. To'lov kuni hali kelmagan o'quvchilar uchun:
            // Oldingi oyda "tolangan" bo'lsa - "tolanmagan" ga o'tkazish
            // chunki yangi oy davri uchun hali to'lov qilinmagan
            // Bu faqat oyning boshida to'lov kuni hali kelmagan o'quvchilar uchun
            const futurePaymentStudents = await Student.find({
                tolovKuni: { $gt: currentDay },
                tolovHolati: 'tolangan',
                holati: 'faol'
            });

            for (const student of futurePaymentStudents) {
                // Shu oy uchun to'lov bormi tekshirish
                // Agar bugun < to'lov kuni bo'lsa, demak o'quvchi hozir 
                // o'tgan oydagi 27-sana dan boshlangan siklda turibdi.
                // Shuning uchun o'tgan oy uchun to'lovni tekshiramiz.
                let checkMonth = currentMonth - 1;
                let checkYear = currentYear;
                if (checkMonth < 1) {
                    checkMonth = 12;
                    checkYear--;
                }

                const thisMonthPayment = await Payment.findOne({
                    oquvchi: student._id,
                    oy: checkMonth,
                    yil: checkYear
                });

                if (!thisMonthPayment) {
                    // Shu oy (oldingi sikl) to'lov yo'q - "tolanmagan" (hali to'lov kuni kelmagan)
                    student.tolovHolati = 'tolanmagan';
                    await student.save();
                    resetCount++;
                }
            }

            console.log(`✅ ${qarzdorCount} ta o'quvchi qarzdorlar ro'yxatiga qo'shildi`);
            console.log(`🔄 ${resetCount} ta o'quvchi holati yangilandi`);

        } catch (error) {
            console.error('❌ Cron job xatosi:', error.message);
        }
    });

    console.log('⏰ To\'lov tekshirish cron job ishga tushirildi (har kuni 00:01)');
};

module.exports = startPaymentChecker;
