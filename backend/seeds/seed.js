require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Group = require('../models/Group');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB ulandi');

        // Admin foydalanuvchini yaratish
        const existingUser = await User.findOne({ username: 'Muhammadaziz' });
        if (!existingUser) {
            await User.create({
                username: 'Muhammadaziz',
                password: 'Mirzajonovna',
                role: 'superadmin',
                fullName: 'Muhammadaziz (Superadmin)'
            });
            console.log('✅ Superadmin foydalanuvchi yaratildi');
            console.log('   Login: Muhammadaziz');
            console.log('   Parol: Mirzajonovna');
        } else {
            // Update existing user to superadmin just in case
            existingUser.role = 'superadmin';
            existingUser.fullName = 'Muhammadaziz (Superadmin)';
            await existingUser.save();
            console.log('ℹ️ Admin foydalanuvchi superadmin roliga o\'tkazildi');
        }


        console.log('\n🎉 Seed muvaffaqiyatli yakunlandi!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed xatosi:', error.message);
        process.exit(1);
    }
};

seedData();
