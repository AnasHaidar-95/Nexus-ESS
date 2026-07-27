import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { prisma } from '../utils/prisma.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new UnauthorizedError(
          'Authentication required. No token provided.',
          'AUTHENTICATION_REQUIRED',
        ),
      );
    }

    const token = authHeader.split(' ')[1];

    // 1. Verify JWT signature and expiration
    const decoded = jwt.verify(token, config.jwt.secret);

    // 2. Validate user status in database to prevent stale access
    // This ensures deactivated/locked users lose access immediately
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, status: true, lockedUntil: true },
    });

    if (!user) {
      return next(new UnauthorizedError('User not found.', 'USER_NOT_FOUND'));
    }

    if (user.status !== 'ACTIVE') {
      return next(
        new UnauthorizedError('User account is not active.', 'USER_INACTIVE'),
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return next(
        new UnauthorizedError('User account is temporarily locked.', 'USER_LOCKED'),
      );
    }

    req.user = {
      id: decoded.sub,
      employeeId: decoded.employeeId,
      username: decoded.username,
      roleId: decoded.roleId,
      roleCode: decoded.roleCode,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Access token has expired.', 'TOKEN_EXPIRED'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid access token.', 'INVALID_TOKEN'));
    }
    if (error instanceof UnauthorizedError) {
      return next(error);
    }
    return next(new UnauthorizedError('Authentication failed.', 'AUTHENTICATION_REQUIRED'));
  }
};
