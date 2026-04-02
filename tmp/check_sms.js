const axios = require('axios');
const token = "c52f710bb7c2ef41add67aadbbe15cb705a0257308d5b49e3d50efb51839288e";

async function check() {
    try {
        const res = await axios.get('https://devsms.uz/api/get_balance.php', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Balance info:', JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error('Error:', JSON.stringify(e.response?.data || e.message, null, 2));
    }
}
check();
