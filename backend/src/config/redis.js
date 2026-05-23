import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

let redis;

const createDummyRedis = () => ({
  async get() { return null; },
  async set() { return null; },
  async setex() { return null; },
  async del() { return null; },
  async keys() { return []; },
  async ping() { return null; },
});

export const getRedis = () => {
  if (!redis) {
    if (process.env.REDIS_URL) {
      redis = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
      redis.on('connect', () => console.log('[redis] connected (tcp)'));
      redis.on('error', (err) => console.error('[redis] error:', err.message));
    } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new UpstashRedis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      redis
        .ping()
        .then(() => console.log('[redis] connected (upstash REST)'))
        .catch((err) => console.error('[redis] error:', err.message));
    } else {
      console.warn('[redis] disabled: no Redis configuration found');
      redis = createDummyRedis();
    }
  }

  return redis;
};

const wrapRedisOp = (fn, name) => async (...args) => {
  try {
    return await fn(...args);
  } catch (err) {
    console.error(`[redis] ${name} failed:`, err?.message ?? err);
    return null;
  }
};

export const cacheGet = wrapRedisOp(async (key) => {
  const val = await getRedis().get(key);
  return val ? JSON.parse(val) : null;
}, 'cacheGet');

export const cacheSet = wrapRedisOp(async (key, value, ttlSeconds = 300) => {
  const redisClient = getRedis();
  if (redisClient.setex) {
    return await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
  }
  return await redisClient.set(key, JSON.stringify(value), { ex: ttlSeconds });
}, 'cacheSet');

export const cacheDel = wrapRedisOp(async (key) => {
  return await getRedis().del(key);
}, 'cacheDel');

export const cacheDelPattern = wrapRedisOp(async (pattern) => {
  const keys = await getRedis().keys(pattern);
  if (keys && keys.length) return await getRedis().del(...keys);
  return null;
}, 'cacheDelPattern');
