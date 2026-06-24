const express = require('express');
const router = express.Router();
const {
    createProduct, getProducts, updateProduct, deleteProduct, buyProduct, getCoinLogs, getOrders
} = require('../controllers/marketController');
const { protect, authorize, checkBranchAccess } = require('../middleware/auth');

router.use(protect);
router.use(checkBranchAccess);

// O'quvchi va Admin uchun umumiy
router.get('/products', getProducts);
router.get('/logs', getCoinLogs);
router.post('/buy', buyProduct);

// Admin uchun maxsus
router.get('/orders', authorize('superadmin', 'admin'), getOrders);
router.post('/products', authorize('superadmin', 'admin'), createProduct);
router.put('/products/:id', authorize('superadmin', 'admin'), updateProduct);
router.delete('/products/:id', authorize('superadmin', 'admin'), deleteProduct);

module.exports = router;
