import Redis from 'ioredis';
import { config } from '../../config/index.js';

let client = null;
let isConnected = false;
let redisEnabled = false;

export function createRedisClient() {
  if (client) return client;

  const opts = {
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
  };

  if (config.redis.password) {
    opts.password = config.redis.password;
  }

  client = new Redis(opts);

  client.on('connect', () => {
    console.log('[Redis] Connecting...');
  });

  client.on('ready', () => {
    isConnected = true;
    console.log('[Redis] Connected and ready');
  });

  client.on('error', (err) => {
    if (isConnected) {
      console.warn('[Redis] Connection lost:', err.message);
    }
    isConnected = false;
  });

  client.on('close', () => {
    isConnected = false;
  });

  return client;
}

export async function connectRedis() {
  try {
    const c = createRedisClient();
    await Promise.race([
      c.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    redisEnabled = true;
    return c;
  } catch {
    redisEnabled = false;
    console.log('[Redis] Not available — running without Redis cache');
    if (client) {
      client.removeAllListeners();
      client.disconnect();
      client = null;
    }
    return null;
  }
}

export async function disconnectRedis() {
  if (client) {
    try { await client.quit(); } catch { /* ignore */ }
    client = null;
    isConnected = false;
  }
}

export function getRedisClient() {
  return client;
}

export function isRedisConnected() {
  return redisEnabled && isConnected && client?.status === 'ready';
}
