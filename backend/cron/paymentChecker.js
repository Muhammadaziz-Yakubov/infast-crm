const cron = require('node-cron');
const Student = require('../models/Student');

// Har kuni soat 00:01 da avtomatik tekshirish
const startPaymentChecker = () => {
    // Har kuni tekshirish: '1 0 * * *' = har kuni 00:01
    cron.schedule('1 0 * * *', async () => {
        try {
            const today = new Date();
            const currentDay = today.getDate();

            console.log(`🔄 [${today.toISOString()}] To'lov tekshiruvi boshlandi...`);

            // Bugungi kuni to'lov kuni bo'lgan va to'lov qilinmagan o'quvchilarni topish
            const result = await Student.updateMany(
                {
                    tolovKuni: currentDay,
                    tolovHolati: { $ne: 'tolangan' },
                    holati: 'faol'
                },
                {
                    $set: { tolovHolati: 'qarzdor' }
                }
            );

            console.log(`✅ ${result.modifiedCount} ta o'quvchi qarzdorlar ro'yxatiga qo'shildi`);

            // Har oyning 1-kunida barcha o'quvchilarni "to'lanmagan" holatiga o'tkazish
            if (currentDay === 1) {
                const resetResult = await Student.updateMany(
                    {
                        tolovHolati: 'tolangan',
                        holati: 'faol'
                    },
                    {
                        $set: { tolovHolati: 'tolanmagan' }
                    }
                );
                console.log(`🔄 ${resetResult.modifiedCount} ta o'quvchi holati yangilandi (yangi oy)`);
            }

        } catch (error) {
            console.error('❌ Cron job xatosi:', error.message);
        }
    });

    console.log('⏰ To\'lov tekshirish cron job ishga tushirildi (har kuni 00:01)');
};

module.exports = startPaymentChecker;
