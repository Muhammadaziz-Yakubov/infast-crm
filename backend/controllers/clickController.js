const crypto = require('crypto');
const ClickTransaction = require('../models/ClickTransaction');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const config = require('../config/config');

// Click error codes
const CLICK_ERRORS = {
    SUCCESS: 0,
    SIGN_CHECK_FAILED: -1,
    INVALID_AMOUNT: -2,
    ACTION_NOT_FOUND: -3,
    ALREADY_PAID: -4,
    USER_NOT_FOUND: -5,
    TRANSACTION_NOT_FOUND: -6,
    TRANSACTION_CANCELLED: -9,
    INTERNAL_ERROR: -7
};

/**
 * Click signature verification
 */
const verifySignature = (data) => {
    const {
        click_trans_id,
        service_id,
        click_paydoc_id,
        merchant_trans_id,
        amount,
        action,
        error,
        error_note,
        sign_time,
        sign_string,
        merchant_prepare_id
    } = data;

    const secretKey = config.click.secretKey;
    
    // Prepare signature string based on action
    let stringToHash = '';
    if (parseInt(action) === 0) {
        // Prepare action
        stringToHash = `${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${amount}${action}${sign_time}`;
    } else {
        // Complete action
        stringToHash = `${click_trans_id}${service_id}${secretKey}${merchant_trans_id}${merchant_prepare_id || ''}${amount}${action}${sign_time}`;
    }

    const hash = crypto.createHash('md5').update(stringToHash).digest('hex');
    return hash === sign_string;
};

/**
 * @desc    Click payment callback handler (Prepare & Complete)
 * @route   POST /api/click/callback
 */
exports.handleCallback = async (req, res) => {
    try {
        const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string
        } = req.body;

        // 1. Check signature
        if (!verifySignature(req.body)) {
            return res.json({
                error: CLICK_ERRORS.SIGN_CHECK_FAILED,
                error_note: 'Signature verification failed'
            });
        }

        // 2. Check Click error
        if (parseInt(error) < 0) {
            await ClickTransaction.findOneAndUpdate(
                { click_trans_id },
                { status: 'error', error_code: error, error_note },
                { upsert: true }
            );
            return res.json({
                error: CLICK_ERRORS.SUCCESS,
                error_note: 'Error logged'
            });
        }

        // 3. Handle Action
        if (parseInt(action) === 0) {
            // PREPARE ACTION
            const student = await Student.findById(merchant_trans_id);
            if (!student) {
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: 'Student not found'
                });
            }

            // Check if transaction already exists
            const existingTrans = await ClickTransaction.findOne({ click_trans_id });
            if (existingTrans && existingTrans.status === 'confirmed') {
                return res.json({
                    error: CLICK_ERRORS.ALREADY_PAID,
                    error_note: 'Already paid'
                });
            }

            // Create or update transaction record
            const trans = await ClickTransaction.findOneAndUpdate(
                { click_trans_id },
                {
                    service_id,
                    click_paydoc_id,
                    merchant_trans_id,
                    amount: parseFloat(amount),
                    action: 0,
                    status: 'waiting'
                },
                { upsert: true, new: true }
            );

            return res.json({
                click_trans_id,
                merchant_trans_id,
                merchant_prepare_id: trans._id.toString(),
                error: CLICK_ERRORS.SUCCESS,
                error_note: 'Success'
            });

        } else if (parseInt(action) === 1) {
            // COMPLETE ACTION
            const merchant_prepare_id = req.body.merchant_prepare_id;
            
            const trans = await ClickTransaction.findById(merchant_prepare_id);
            if (!trans) {
                return res.json({
                    error: CLICK_ERRORS.TRANSACTION_NOT_FOUND,
                    error_note: 'Prepare transaction not found'
                });
            }

            if (trans.status === 'confirmed') {
                return res.json({
                    error: CLICK_ERRORS.ALREADY_PAID,
                    error_note: 'Already paid'
                });
            }

            if (parseFloat(trans.amount) !== parseFloat(amount)) {
                return res.json({
                    error: CLICK_ERRORS.INVALID_AMOUNT,
                    error_note: 'Incorrect amount'
                });
            }

            // 4. Create Payment Record
            const student = await Student.findById(trans.merchant_trans_id).populate('kurs');
            if (!student) {
                return res.json({
                    error: CLICK_ERRORS.USER_NOT_FOUND,
                    error_note: 'Student not found'
                });
            }

            // Billing logic (reused from paymentController)
            const now = new Date();
            const currentDay = now.getDate();
            const tolovKuni = student.tolovKuni || 15;
            let billingMonth = now.getMonth() + 1;
            let billingYear = now.getFullYear();

            if (currentDay >= tolovKuni) {
                billingMonth++;
                if (billingMonth > 12) {
                    billingMonth = 1;
                    billingYear++;
                }
            }

            // Create payment
            await Payment.create({
                oquvchi: student._id,
                summa: parseFloat(amount),
                oy: billingMonth,
                yil: billingYear,
                tolovTuri: 'online',
                izoh: `Click orqali to'lov (Click ID: ${click_trans_id})`,
                kurs: student.kurs?._id || student.kurs,
                guruh: student.guruh
            });

            // Update student status
            student.tolovHolati = 'tolangan';
            student.isBlocked = false;
            await student.save();

            // Confirm transaction
            trans.status = 'confirmed';
            trans.action = 1;
            await trans.save();

            return res.json({
                click_trans_id,
                merchant_trans_id,
                merchant_confirm_id: trans._id.toString(),
                error: CLICK_ERRORS.SUCCESS,
                error_note: 'Success'
            });

        } else {
            return res.json({
                error: CLICK_ERRORS.ACTION_NOT_FOUND,
                error_note: 'Action not found'
            });
        }

    } catch (err) {
        console.error('Click Callback Error:', err);
        return res.json({
            error: CLICK_ERRORS.INTERNAL_ERROR,
            error_note: 'Internal server error'
        });
    }
};
