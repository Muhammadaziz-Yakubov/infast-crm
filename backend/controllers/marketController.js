const Product = require('../models/Product');
const Order = require('../models/Order');
const Student = require('../models/Student');
const CoinLog = require('../models/CoinLog');
const { updateCoins } = require('../services/coinService');

// --- ADMIN CONTROLLERS ---

exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort('-createdAt');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Mahsulot o\'chirildi' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- STUDENT CONTROLLERS ---

exports.buyProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const studentId = req.user._id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        if (product.soni <= 0) return res.status(400).json({ success: false, message: 'Mahsulot tugagan' });

        const student = await Student.findById(studentId);
        if (student.coins < product.narxi) {
            return res.status(400).json({ success: false, message: 'Coinlar yetarli emas' });
        }

        // Transaction o'rniga oddiyroq ketma-ketlik
        // 1. Coin ayirish
        await updateCoins(studentId, -product.narxi, `Market: ${product.nomi} sotib olindi`);

        // 2. Mahsulot sonini kamaytirish
        product.soni -= 1;
        await product.save();

        // 3. Order yaratish
        const order = await Order.create({
            student: studentId,
            product: productId,
            narxi: product.narxi,
            status: 'completed'
        });

        res.json({ success: true, message: 'Mahsulot muvaffaqiyatli sotib olindi', data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCoinLogs = async (req, res) => {
    try {
        const logs = await CoinLog.find({ student: req.user._id }).sort('-sana');
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
