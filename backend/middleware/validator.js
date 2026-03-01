const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errorResponse');

const validateIncoming = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => err.msg);
        return next(new ErrorResponse(extractedErrors.join(', '), 400));
    }
    next();
};

module.exports = {
    validateIncoming
};
