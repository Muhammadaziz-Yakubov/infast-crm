const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log the error
    logger.error(`${err.name || 'Error'}: ${err.message} \n ${err.stack}`);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resurs topilmadi (ID: ${err.value})`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Bu ${field} allaqachon mavjud`;
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message);
        error = new ErrorResponse(message.join(', '), 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Token noto\'g\'ri yoki muddati o\'tgan', 401);
    }

    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token muddati o\'tib ketgan', 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server xatosi',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = errorHandler;

