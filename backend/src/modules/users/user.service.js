import bcrypt from 'bcrypt';
import { prisma } from '../../core/utils/prisma.js';
import { config } from '../../config/index.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('USER_MANAGEMENT', 'users');
const securityAudit = createAuditLogger('SECURITY', 'users');

// Use centralized config for bcrypt salt rounds (defaults to 12 for enterprise security)
const SALT_ROUNDS = config.bcrypt?.saltRounds || 12;

export const listUsers = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, status, roleId } = query;

  const where = {};
  if (status) where.status = status;
  if (roleId) where.roleId = roleId;

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { employee: { firstName: { contains: search, mode: 'insensitive' } } },
      { employee: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      ...prismaArgs,
      where,
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        employeeId: true,
        lastLoginAt: true,
        createdAt: true,
        role: { select: { id: true, name: true, code: true, status: true } },
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return formatPaginatedResponse(users, totalItems, pagination);
};

export const getUserById = async (id) => {
  // FIX: Use 'select' instead of 'include' + destructuring to prevent the DB
  // from ever fetching the passwordHash over the wire.
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      status: true,
      lastLoginAt: true,
      failedLoginAttempts: true,
      passwordChangedAt: true,
      createdAt: true,
      createdBy: true,
      updatedAt: true,
      updatedBy: true,
      role: true,
      employee: true,
    },
  });

  if (!user) throw new NotFoundError('User');
  return user;
};

export const createUser = async (data, actorId) => {
  const { employeeId, username, email, roleId, temporaryPassword, forcePasswordChange } = data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }, { employeeId }] },
  });

  if (existingUser) {
    if (existingUser.username === username) throw new ConflictError('Username already exists.');
    if (existingUser.email === email) throw new ConflictError('Email already exists.');
    if (existingUser.employeeId === employeeId)
      throw new ConflictError('Employee already has a user account.');
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      employeeId,
      username,
      email,
      roleId,
      passwordHash,
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      // If forcePasswordChange is true, set to null so auth middleware forces a change on next login
      passwordChangedAt: forcePasswordChange ? null : new Date(),
      createdBy: actorId,
      updatedBy: actorId,
    },
    select: { id: true, username: true, email: true, status: true },
  });

  audit.create(actorId, newUser.id, `Created user account for ${username}`);

  return newUser;
};

export const updateUser = async (id, data, actorId) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  if (data.username || data.email) {
    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(data.username ? [{ username: data.username }] : []),
              ...(data.email ? [{ email: data.email }] : []),
            ],
          },
        ],
      },
    });
    if (existing) throw new ConflictError('Username or Email already in use.');
  }

  // Prevent status changes via this endpoint
  if (data.status) delete data.status;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
    select: { id: true, username: true, email: true, roleId: true, status: true },
  });

  // SECURITY FIX: If the user's role changed, revoke all active sessions
  // to force them to get a new JWT with the updated permissions.
  if (data.roleId && data.roleId !== user.roleId) {
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  audit.update(actorId, id, `Updated user ${user.username}`);

  return updatedUser;
};

export const toggleUserStatus = async (id, action, actorId) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  const updateData = { updatedBy: actorId };

  switch (action) {
    case 'activate':
      updateData.status = 'ACTIVE';
      updateData.failedLoginAttempts = 0;
      break;
    case 'deactivate':
      updateData.status = 'INACTIVE';
      break;
    case 'lock':
      updateData.status = 'LOCKED';
      break;
    case 'unlock':
      updateData.status = 'ACTIVE';
      updateData.failedLoginAttempts = 0;
      break;
    case 'suspend':
      updateData.status = 'SUSPENDED';
      break;
    default:
      throw new AppError(`Invalid status action: ${action}`, 400, 'INVALID_ACTION');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, username: true, status: true },
  });

  // SECURITY: Revoke all active sessions when account is no longer ACTIVE
  if (updatedUser.status !== 'ACTIVE') {
    await prisma.refreshToken.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  audit.log(actorId, action.toUpperCase(), id, `User ${action}d: ${user.username}`);

  return updatedUser;
};

export const resetUserPassword = async (id, data, actorId) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('User');

  const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      passwordChangedAt: data.forcePasswordChange ? null : new Date(),
      failedLoginAttempts: 0,
      updatedBy: actorId,
    },
  });

  // SECURITY: Revoke ALL active refresh tokens (Force global logout)
  await prisma.refreshToken.updateMany({
    where: { userId: id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  securityAudit.log(
    actorId,
    'PASSWORD_RESET',
    id,
    `Administrator reset password for ${user.username}`,
    {
      employeeId: user.employeeId,
    },
  );

  return {
    message: 'Password reset successfully. All active sessions for this user have been terminated.',
  };
};
