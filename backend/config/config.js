const validateEnv = require('./envValidator');
require('dotenv').config();

const env = validateEnv(process.env);

const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    service: {
        name: 'InFastCRM-API'
    },
    mongodb: {
        uri: env.MONGODB_URI,
        options: {
            authSource: 'admin'
        }
    },
    jwt: {
        secret: env.JWT_SECRET,
        expire: env.JWT_EXPIRE
    },
    r2: {
        accountId: env.R2_ACCOUNT_ID,
        endpoint: env.R2_ENDPOINT,
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        bucketName: env.R2_BUCKET_NAME,
        publicUrl: env.R2_PUBLIC_URL
    },
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD
    },
    telegram: {
        botToken: env.TELEGRAM_BOT_TOKEN
    },
    click: {
        serviceId: env.CLICK_SERVICE_ID,
        merchantId: env.CLICK_MERCHANT_ID,
        secretKey: env.CLICK_SECRET_KEY
    }
};

module.exports = config;
