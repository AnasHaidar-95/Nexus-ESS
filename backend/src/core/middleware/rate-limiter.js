import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { sendError } from '../utils/api-response.js';
import { isRedisConnected, getRedisClient } from '../cache/redis.js';

const skipInTestEnv = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';

function createRedisStore() {
  if (!isRedisConnected()) return undefined;
  try {
    return new RedisStore({
      sendCommand: (...args) => getRedisClient().call(...args),
      prefix: 'ess:ratelimit:',
    });
  } catch {
    return undefined;
  }
}

// Standard API Rate Limit (300 requests / 15 minutes)
export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTestEnv,
  store: createRedisStore(),
  handler: (req, res) => {
    return sendError(res, 'Too many requests, please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  },
});

// Strict Auth Rate Limit (5 login attempts / 1 minute - per Project.md Section 4.29)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipInTestEnv,
  store: createRedisStore(),
  handler: (req, res) => {
    return sendError(
      res,
      'Too many login attempts from this IP, please try again later.',
      429,
      'TOO_MANY_LOGIN_ATTEMPTS',
    );
  },
});
