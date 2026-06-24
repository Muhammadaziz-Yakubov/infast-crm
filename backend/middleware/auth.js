const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const config = require('../config/config');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorResponse('Ushbu marshrutga kirish uchun tizimga kiring', 401));
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);

        let user = await User.findById(decoded.id).select('-password');
        if (!user) {
            user = await Student.findById(decoded.id).select('-password');
        }

        if (!user) {
            return next(new ErrorResponse('Foydalanuvchi topilmadi', 401));
        }

        req.user = user;

        // Block students if they are manually blocked
        const isAuthMe = req.originalUrl === '/api/auth/me' || req.originalUrl.includes('/auth/me');
        if (user.role === 'student' && user.isBlocked && !isAuthMe) {
            return next(new ErrorResponse("Sizning hisobingiz bloklangan! Iltimos admin bilan bog'laning.", 403));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('Ushbu marshrutga kirish ruxsat etilmagan', 401));
    }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `Foydalanuvchi roli (${req.user.role}) ushbu amalni bajarishga ruxsat bermaydi`,
                    403
                )
            );
        }
        next();
    };
};

// Filiallarga kirish huquqini tekshirish va filtrlash middleware
exports.checkBranchAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Ushbu amalni bajarish uchun tizimga kiring' });
    }

    const role = req.user.role;
    
    // Header, query yoki bodydan tanlangan filial ID sini olish
    let selectedBranchId = req.headers['x-branch-id'] || req.query.branchId || req.body.branchId;

    // Tanlangan filial 'all' yoki bo'sh bo'lishi mumkin (faqat superadmin uchun)
    if (selectedBranchId === 'undefined' || selectedBranchId === 'null') {
        selectedBranchId = undefined;
    }

    if (role === 'superadmin') {
        if (selectedBranchId && selectedBranchId !== 'all') {
            req.branchId = selectedBranchId;
            req.branchFilter = { branchId: selectedBranchId };
        } else {
            req.branchId = null;
            req.branchFilter = {}; // Hammasini ko'rish ruxsati
        }
    } else if (role === 'admin') {
        // Admin faqat o'z filialiga tegishli ma'lumotlarni ko'ra oladi
        req.branchId = req.user.branchId;
        req.branchFilter = { branchId: req.user.branchId };

        if (selectedBranchId && selectedBranchId.toString() !== req.user.branchId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Ushbu filial ma\'lumotlariga kirish huquqiga ega emassiz'
            });
        }
    } else if (role === 'student') {
        // O'quvchi faqat o'z filialini ko'ra oladi
        req.branchId = req.user.branchId;
        req.branchFilter = { branchId: req.user.branchId };

        if (selectedBranchId && selectedBranchId.toString() !== req.user.branchId?.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Ushbu filial ma\'lumotlariga kirish huquqiga ega emassiz'
            });
        }
    } else {
        // Boshqa har qanday rol
        req.branchId = req.user.branchId || null;
        req.branchFilter = req.user.branchId ? { branchId: req.user.branchId } : {};
    }

    next();
};



