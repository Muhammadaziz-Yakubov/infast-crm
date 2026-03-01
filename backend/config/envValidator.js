const Joi = require('joi');

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),
    MONGODB_URI: Joi.string().required().description('MongoDB connection URI'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_EXPIRE: Joi.string().default('7d'),

    // Cloudflare R2 / S3
    R2_ACCOUNT_ID: Joi.string().required(),
    R2_ENDPOINT: Joi.string().required(),
    R2_ACCESS_KEY_ID: Joi.string().required(),
    R2_SECRET_ACCESS_KEY: Joi.string().required(),
    R2_BUCKET_NAME: Joi.string().required(),
    R2_PUBLIC_URL: Joi.string().required(),

    // Redis
    REDIS_HOST: Joi.string().default('127.0.0.1'),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_PASSWORD: Joi.string().allow('').default(''),

    // Telegram
    TELEGRAM_BOT_TOKEN: Joi.string().required().description('Telegram bot API token')
}).unknown().required();

const validateEnv = (envVars) => {
    const { error, value: env } = envSchema.validate(envVars);
    if (error) {
        throw new Error(`Environment variables validation failed: ${error.message}`);
    }
    return env;
};

module.exports = validateEnv;
