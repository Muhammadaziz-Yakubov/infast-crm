const axios = require('axios');
const token = "c52f710bb7c2ef41add67aadbbe15cb705a0257308d5b49e3d50efb51839288e";

async function testSend() {
    try {
        const ism = "Azizbek";
        const summa = "500000";
        const message = `Hurmatli ${ism}! Sizning qarzingiz ${summa} so'm. To'lov qiling bo'lmasa darsga kiritilmaysiz. InFast IT-Academy`;
        
        console.log('Sending real template test SMS WITHOUT from...');
        const res1 = await axios.post('https://devsms.uz/api/send_sms.php', {
            phone: '998902710027',
            message: message
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Result WITHOUT from:', JSON.stringify(res1.data, null, 2));
    } catch (e) {
        console.error('Error WITHOUT from:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}
testSend();
