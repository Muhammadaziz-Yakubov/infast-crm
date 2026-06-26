const mongoose = require('mongoose');
require('dotenv').config({ path: 'c:/Users/Muhammadaziz/Desktop/infast-crm/backend/.env' });

const uri = process.env.MONGODB_URI;

async function inspect() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");
        
        const Test = mongoose.model('Test', new mongoose.Schema({
            nomi: String,
            boshlanishVaqti: Date,
            tugashVaqti: Date,
            createdAt: Date
        }), 'tests');

        const latestTests = await Test.find().sort({ createdAt: -1 }).limit(5);
        console.log("\nLatest 5 Tests:");
        latestTests.forEach(test => {
            console.log(`- Nomi: ${test.nomi}`);
            console.log(`  Boshlanish (DB stored UTC): ${test.boshlanishVaqti ? test.boshlanishVaqti.toISOString() : 'undefined'}`);
            console.log(`  Tugash (DB stored UTC): ${test.tugashVaqti ? test.tugashVaqti.toISOString() : 'undefined'}`);
            console.log(`  Created At: ${test.createdAt ? test.createdAt.toISOString() : 'undefined'}`);
            console.log(`  Current Time on execution: ${new Date().toISOString()}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

inspect();
