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

    // Enable CORS
    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        credentials: true
    }));

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Juda ko\'p so\'rov. Iltimos 15 daqiqadan keyin urinib ko\'ring.'
    });

    // Apply limiter to all requests under /api
    app.use('/api', limiter);

    // Specific limiters for auth
    const authLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 20, // 20 requests per hour for login/register
        message: 'Siz juda ko\'p urinishlar qildingiz. Bir soatdan keyin urinib ko\'ring.'
    });
    app.use('/api/auth', authLimiter);
};

module.exports = setupSecurity;
