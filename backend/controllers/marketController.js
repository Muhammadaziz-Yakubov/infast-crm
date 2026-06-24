const Product = require('../models/Product');
const Order = require('../models/Order');
const Student = require('../models/Student');
const CoinLog = require('../models/CoinLog');
const { updateCoins } = require('../services/coinService');

// --- ADMIN CONTROLLERS ---

exports.createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            branchId: req.branchId || req.body.branchId || req.user.branchId
        };
        const product = await Product.create(productData);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const query = { ...(req.branchFilter || {}) };
        const products = await Product.find(query).sort('-createdAt');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const product = await Product.findOneAndUpdate(query, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const query = { _id: req.params.id, ...(req.branchFilter || {}) };
        const product = await Product.findOneAndDelete(query);
        if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        res.json({ success: true, message: 'Mahsulot o\'chirildi' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const query = { ...(req.branchFilter || {}) };

        const orders = await Order.find(query)
            .populate('student', 'ism telefon')
            .populate('product', 'nomi rasm')
            .sort('-createdAt');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- STUDENT CONTROLLERS ---

exports.buyProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const studentId = req.user._id;

        const product = await Product.findOne({ _id: productId, ...(req.branchFilter || {}) });
        if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
        if (product.soni <= 0) return res.status(400).json({ success: false, message: 'Mahsulot tugagan' });

        const student = await Student.findById(studentId);
        if (student.coins < product.narxi) {
            return res.status(400).json({ success: false, message: 'Coinlar yetarli emas' });
        }

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
            status: 'completed',
            branchId: req.branchId || student.branchId
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
