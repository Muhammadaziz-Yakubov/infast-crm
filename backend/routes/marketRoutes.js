const express = require('express');
const router = express.Router();
const {
    createProduct, getProducts, updateProduct, deleteProduct, buyProduct, getCoinLogs
} = require('../controllers/marketController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// O'quvchi va Admin uchun umumiy
router.get('/products', getProducts);
router.get('/logs', getCoinLogs);
router.post('/buy', buyProduct);

// Admin uchun maxsus
router.post('/products', authorize('admin'), createProduct);
router.put('/products/:id', authorize('admin'), updateProduct);
router.delete('/products/:id', authorize('admin'), deleteProduct);

module.exports = router;
