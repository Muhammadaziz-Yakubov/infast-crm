const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const config = require('./config/config');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const setupSecurity = require('./middleware/security');
const logger = require('./utils/logger');
const startPaymentChecker = require('./cron/paymentChecker');

const cors = require('cors');

// MongoDB Connection
connectDB();

const app = express();

// Trust proxy for Render/Vercel (required for rate limiter to use real IP)
app.set('trust proxy', 1);

// Performance Optimization
app.use(compression());

// Request logging
if (config.env === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));
}

// Enable CORS early!
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://infasteducrm.vercel.app'
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(...process.env.FRONTEND_URL.split(',').map(u => u.trim()));
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        return callback(null, true); // Verceldan kelgan so'rovlarga ulanishga ruxsat
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body Parsing - MUST BE BEFORE SANITIZERS!
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Security Middlewares
setupSecurity(app);

// Static folder (for uploaded files if any)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));
app.use('/api/coins', require('./routes/coinRoutes'));
app.use('/api/wheels', require('./routes/wheelRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'InFast CRM API is healthy! 🚀',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Marshrut topilmadi: ${req.originalUrl}`
    });
});

// Central Error Handler
app.use(errorHandler);

// Global unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    // Close server & exit process if needed, usually just log it in prod
});

const PORT = config.port || 5000;
const server = app.listen(PORT, () => {
    logger.info(`🚀 InFast CRM Server ${config.env} rejimida ${PORT}-portda ishga tushdi`);

    // Start Cron jobs
    try {
        startPaymentChecker();
        logger.info('⏰ To\'lov kuzatuvchisi (Cron) ishga tushdi');
    } catch (err) {
        logger.error(`Cron job error: ${err.message}`);
    }

    // Telegram Bot
    const { bot, initScheduler } = require('./services/telegramBot');
    bot.launch().then(() => {
        logger.info('🤖 Telegram Bot muvaffaqiyatli ishga tushdi');
        initScheduler();
    }).catch(err => {
        logger.error(`Telegram Bot xatosi: ${err.message}`);
    });
});

