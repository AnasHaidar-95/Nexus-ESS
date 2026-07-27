import { prisma } from './prisma.js';
import { logger } from './logger.js';
import { isRedisConnected, getRedisClient } from '../cache/redis.js';

const rolePermissionsCache = new Map();
const allPermissionsCache = new Map();
let isLoaded = false;

const REDIS_KEY_PREFIX = 'ess:perms:';
const REDIS_TTL_SECONDS = 3600; // 1 hour

export const loadPermissionsCache = async () => {
  try {
    // 1. Load all permissions once (static data, only changes via sync-permissions.js)
    const permissions = await prisma.permission.findMany();
    allPermissionsCache.clear();
    for (const perm of permissions) {
      allPermissionsCache.set(perm.id, perm.code);
    }

    // 2. Load role-permission mappings without including full permission objects
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: { status: 'ACTIVE' } },
      select: { roleId: true, permissionId: true },
    });

    rolePermissionsCache.clear();

    // 3. Build role -> Set<permissionCode> from local cache (no extra DB query)
    for (const rp of rolePermissions) {
      const code = allPermissionsCache.get(rp.permissionId);
      if (!code) continue;

      let perms = rolePermissionsCache.get(rp.roleId);
      if (!perms) {
        perms = new Set();
        rolePermissionsCache.set(rp.roleId, perms);
      }
      perms.add(code);
    }

    isLoaded = true;
    logger.info(
      `Permission cache loaded: ${rolePermissionsCache.size} roles, ${allPermissionsCache.size} permissions.`,
    );

    // 4. Write to Redis L2 cache (non-blocking)
    syncToRedis();
  } catch (error) {
    logger.error('Failed to load permission cache:', error);
  }
};

export const getRolePermissions = (roleId) => {
  if (!isLoaded) return new Set();
  return rolePermissionsCache.get(roleId) || new Set();
};

export const invalidatePermissionsCache = async () => {
  logger.info('Reloading permission cache...');

  // Clear Redis keys first
  if (isRedisConnected()) {
    try {
      const redis = getRedisClient();
      const keys = await redis.keys(`${REDIS_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      logger.warn('Failed to clear Redis permission cache:', err.message);
    }
  }

  await loadPermissionsCache();
};

async function syncToRedis() {
  if (!isRedisConnected()) return;

  try {
    const redis = getRedisClient();
    const pipeline = redis.pipeline();

    for (const [roleId, perms] of rolePermissionsCache) {
      pipeline.set(
        `${REDIS_KEY_PREFIX}${roleId}`,
        JSON.stringify([...perms]),
        'EX',
        REDIS_TTL_SECONDS,
      );
    }

    await pipeline.exec();
  } catch (err) {
    logger.warn('Failed to sync permission cache to Redis:', err.message);
  }
}
