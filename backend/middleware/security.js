const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

const setupSecurity = (app) => {
    // Set security headers
    app.use(helmet());

    // Sanitize data
    app.use(mongoSanitize());

    // Prevent XSS attacks
    app.use(xss());

    // Prevent http param pollution
    app.use(hpp());

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 2000, // limit each IP to 2000 requests per windowMs (to support classroom labs with single IP)
        message: 'Juda ko\'p so\'rov. Iltimos 15 daqiqadan keyin urinib ko\'ring.'
    });

    // Apply limiter to all requests under /api
    app.use('/api', limiter);

    // Specific limiters for login
    const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 300, // limit login attempts
        message: 'Siz juda ko\'p urinishlar qildingiz. Iltimos birozdan keyin qayta urinib ko\'ring.'
    });
    app.use('/api/auth/login', authLimiter);
};

module.exports = setupSecurity;
