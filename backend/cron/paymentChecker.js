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
                if (currentDay < tolovKuni) continue;

                const joinDate = new Date(student.qoshilganSana || student.createdAt);
                const isBeforeJoin = currentYear < joinDate.getFullYear() || 
                  (currentYear === joinDate.getFullYear() && currentMonth < joinDate.getMonth() + 1);
                if (isBeforeJoin) continue;

                const hasPaid = await Payment.findOne({
                  oquvchi: student._id,
                  oy: currentMonth,
                  yil: currentYear
                });

                const newStatus = hasPaid ? 'tolanmagan' : 'qarzdor';

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
 