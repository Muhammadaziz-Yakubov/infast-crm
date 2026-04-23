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


