const axios = require('axios');

const DEVSMS_TOKEN = process.env.DEVSMS_TOKEN || "c52f710bb7c2ef41add67aadbbe15cb705a0257308d5b49e3d50efb51839288e";
const DEVSMS_BASE_URL = "https://devsms.uz/api";

/**
 * Send SMS using DevSMS API
 * @param {string} phone - Recipient phone number (e.g., 998901234567)
 * @param {string} message - SMS content
 * @returns {Promise<Object>} - API response
 */
exports.sendSMS = async (phone, message) => {
    try {
        // Remove any non-digit characters from phone number
        const cleanPhone = phone.replace(/\D/g, '');
        
        const response = await axios.post(`${DEVSMS_BASE_URL}/send_sms.php`, {
            phone: cleanPhone,
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${DEVSMS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('DevSMS API Error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'SMS yuborishda xatolik yuz berdi');
    }
};

/**
 * Get DevSMS balance
 * @returns {Promise<Object>} - Balance info
 */
exports.getBalance = async () => {
    try {
        const response = await axios.get(`${DEVSMS_BASE_URL}/get_balance.php`, {
            headers: {
                'Authorization': `Bearer ${DEVSMS_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('DevSMS Balance Error:', error.response?.data || error.message);
        throw new Error('Balansni olishda xatolik yuz berdi');
    }
};
