const redis = require('redis');
const config = require('../config/config');
const logger = require('./logger');

let client;

if (process.env.NODE_ENV === 'production' || process.env.ENABLE_REDIS === 'true') {
    client = redis.createClient({
        url: `redis://${config.redis.host}:${config.redis.port}`,
        password: config.redis.password
    });

    client.on('error', (err) => logger.error(`Redis kontrollersi xatosi: ${err}`));
    client.on('connect', () => logger.info('✅ Redis-ga ulanish muvaffaqiyatli'));

    client.connect().catch(err => logger.error(`Redis ulanish xatosi: ${err}`));
}

const getCache = async (key) => {
    if (!client) return null;
    try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        logger.error(`Redis Get xatosi: ${err}`);
        return null;
    }
};

const setCache = async (key, value, duration = 3600) => {
    if (!client) return;
    try {
        await client.set(key, JSON.stringify(value), {
            EX: duration
        });
    } catch (err) {
        logger.error(`Redis Set xatosi: ${err}`);
    }
};

const deleteCache = async (key) => {
    if (!client) return;
    try {
        await client.del(key);
    } catch (err) {
        logger.error(`Redis Delete xatosi: ${err}`);
    }
};

module.exports = {
    getCache,
    setCache,
    deleteCache
};
