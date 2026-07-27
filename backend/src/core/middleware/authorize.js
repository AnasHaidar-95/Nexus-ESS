import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';
import { getRolePermissions } from '../utils/permission-cache.js';

export const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.roleId) {
        return next(new UnauthorizedError('Authentication required.', 'AUTHENTICATION_REQUIRED'));
      }

      // 1. Fetch from Memory Cache (O(1) lookup)
      const userPermissions = getRolePermissions(req.user.roleId);

      // 2. Wildcard Check (Super Admin)
      if (userPermissions.has('*')) {
        return next();
      }

      // 3. Exact Match
      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.has(permission),
      );

      if (!hasPermission) {
        return next(new ForbiddenError('Insufficient permissions.', 'INSUFFICIENT_PERMISSIONS'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
