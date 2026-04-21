const cron = require('node-cron');
const Student = require('../models/Student');
const Payment = require('../models/Payment');

// Har kuni soat 00:01 da avtomatik tekshirish
// TO'G'RI LOGIKA:
// - Hozir 15-kundan oldin bo'lsa => joriy oy tekshiriladi (tolanganmi yoki qarzdormi)
// - Hozir 15-kundan keyin bo'lsa => KEYINGI oy tekshiriladi (joriy oy to'langan bo'lishi kerak)
const startPaymentChecker = () => {
    cron.schedule('1 0 * * *', async () => {
        try {
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth() + 1;
            const currentYear = today.getFullYear();

            console.log(`🔄 [${today.toISOString()}] To'lov tekshiruvi boshlandi...`);

            const activeStudents = await Student.find({ holati: 'faol' });
            
            let updatedCount = 0;
            let debtorCount = 0;

            for (const student of activeStudents) {
                const tolovKuni = student.tolovKuni || 15;

                // TEKSHIRILAYOTGAN OY NI ANIQLASH
                let targetMonth = currentMonth;
                let targetYear = currentYear;

                // AGAR to'lov kuni o'tib ketgan bo'lsa (masalan, 15-kundan keyin)
                // DEMAK joriy oy uchun to'lov qilinish kerak edi, tekshirish KEYINGI oy uchun
                if (currentDay >= tolovKuni) {
                    targetMonth++;
                    if (targetMonth > 12) {
                        targetMonth = 1;
                        targetYear++;
                    }
                }
                // AGAR currentDay < tolovKuni => targetMonth = joriy oy (o'zgartirishsiz)

                // O'quvchi qo'shilgan sanani tekshirish
                const joinDate = new Date(student.qoshilganSana || student.createdAt);
                const joinMonth = joinDate.getMonth() + 1;
                const joinYear = joinDate.getFullYear();

                // Agar tekshirilayotgan oy o'quvchi kelishidan oldin bo'lsa, uni qarzdor qilmaslik
                const isBeforeJoin = targetYear < joinYear || (targetYear === joinYear && targetMonth < joinMonth);

                // JORIY oy uchun ham tekshirish (keyingi oy tekshirilayotgan bo'lsa)
                let currentMonthHasPayment = false;
                if (currentDay >= tolovKuni) {
                    // Hozir to'lov kuni o'tgan, joriy oy uchun to'lov tekshirilishi kerak
                    currentMonthHasPayment = await Payment.findOne({
                        oquvchi: student._id,
                        oy: currentMonth,
                        yil: currentYear
                    }) !== null;
                }

                // KEYINGI oy uchun to'lov tekshirish
                const existingPayment = await Payment.findOne({
                    oquvchi: student._id,
                    oy: targetMonth,
                    yil: targetYear
                });

                let newStatus = student.tolovHolati;

                if (currentMonthHasPayment) {
                    // Joriy oy uchun to'langan => to'lanmagan (keyingi oy kutmokda)
                    newStatus = 'tolanmagan';
                } else if (existingPayment) {
                    // Keyingi oy uchun to'langan => to'lanmagan (joriy oy kutmokda)
                    newStatus = 'tolanmagan';
                } else if (isBeforeJoin) {
                    // O'qishni boshlashidan oldingi oylar uchun qarzdor bo'lmaydi
                    newStatus = 'tolanmagan';
                } else {
                    // To'lov yo'q va o'qishni boshlagan - demak qarzdor
                    newStatus = 'qarzdor';
                }

                if (student.tolovHolati !== newStatus) {
                    student.tolovHolati = newStatus;
                    await student.save();
                    updatedCount++;
                    if (newStatus === 'qarzdor') debtorCount++;
                }
            }

            console.log(`✅ Tekshiruv yakunlandi: ${updatedCount} ta yangilandi, ${debtorCount} ta qarzdor.`);

        } catch (error) {
            console.error('❌ Cron job xatosi:', error.message);
        }
    });

    console.log('⏰ To\'lov tekshirish cron job ishga tushirildi (har kuni 00:01)');
};

module.exports = startPaymentChecker;
 