import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '../../core/utils/prisma.js';
import { config } from '../../config/index.js';
import { UnauthorizedError, AppError } from '../../core/errors/app-error.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('AUTHENTICATION', 'auth');
const securityAudit = createAuditLogger('SECURITY', 'users');

const generateEmployeeNumber = () => {
  const suffix = randomBytes(4).toString('hex').toUpperCase();
  return `EMP-${suffix}`;
};

// --- Cryptographic Helpers ---
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

const generateAccessToken = (user) => {
  // PRODUCTION BEST PRACTICE: Lean JWT.
  return jwt.sign(
    {
      sub: user.id,
      employeeId: user.employeeId,
      username: user.username,
      roleId: user.roleId,
      roleCode: user.role?.code || 'UNKNOWN',
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );
};

const generateRefreshToken = () => randomBytes(40).toString('hex');

// --- Core Business Workflows ---
export const loginUser = async (username, password, ip, userAgent) => {
  const isEmail = username.includes('@');
  let user = await prisma.user.findUnique({
    where: isEmail ? { email: username } : { username },
    include: { role: true, employee: true },
  });

  // Fallback: if username failed and it looks like a short name,
  // try matching old-format usernames where the full email was stored
  if (!user && !isEmail) {
    user = await prisma.user.findFirst({
      where: { username: { startsWith: username + '@' } },
      orderBy: { createdAt: 'desc' },
      include: { role: true, employee: true },
    });
  }

  if (!user) throw new UnauthorizedError('Invalid credentials.', 'INVALID_CREDENTIALS');

  // 1. Validate User Status (ENUM CHECK)
  if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
    throw new UnauthorizedError('Account is disabled or suspended.', 'ACCOUNT_DISABLED');
  }
  if (user.status === 'LOCKED') {
    throw new UnauthorizedError('Account is locked.', 'ACCOUNT_LOCKED');
  }
  // PENDING_APPROVAL users can log in (frontend will redirect to onboarding)

  // 2. Validate Employment Status (Block terminated, resigned, or retired employees)
  if (
    user.employee &&
    ['TERMINATED', 'RESIGNED', 'RETIRED'].includes(user.employee.employmentStatus)
  ) {
    throw new UnauthorizedError('Employment is no longer active.', 'ACCOUNT_DISABLED');
  }

  // 3. Verify Password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // SECURITY: Increment failed attempts and auto-lock if threshold reached
    const newAttempts = user.failedLoginAttempts + 1;
    const maxAttempts = 5;

    const updateData = { failedLoginAttempts: newAttempts };
    let isLocked = false;

    if (newAttempts >= maxAttempts) {
      updateData.status = 'LOCKED';
      isLocked = true;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    audit.log(
      user.id,
      'LOGIN_FAILED',
      user.id,
      `Invalid password attempt (${newAttempts}/${maxAttempts})`,
      { ipAddress: ip, userAgent },
    );

    if (isLocked) {
      throw new UnauthorizedError(
        'Account locked due to too many failed attempts.',
        'ACCOUNT_LOCKED',
      );
    }
    throw new UnauthorizedError('Invalid credentials.', 'INVALID_CREDENTIALS');
  }

  // Success: Reset attempts & update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginAttempts: 0, lastLoginAt: new Date() },
  });

  const accessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 Days

  // Persist hashed refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRefreshToken,
      expiresAt,
      ipAddress: ip,
      userAgent,
    },
  });

  audit.log(user.id, 'LOGIN_SUCCESS', user.id, undefined, {
    employeeId: user.employeeId,
    ipAddress: ip,
    userAgent,
  });

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: 900,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.employee
        ? `${user.employee.firstName} ${user.employee.lastName}`
        : user.username,
      role: user.role?.name || 'Unknown',
      roleCode: user.role?.code || 'UNKNOWN',
      roleId: user.roleId,
      status: user.status,
      employee: user.employee,
    },
  };
};

export const refreshUserToken = async (oldRefreshToken, ip, userAgent) => {
  const hashedToken = hashToken(oldRefreshToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashedToken },
    include: { user: { include: { role: true, employee: true } } }, // Include employee to check employment status
  });

  if (!storedToken || storedToken.revokedAt)
    throw new UnauthorizedError('Invalid or revoked refresh token.', 'INVALID_REFRESH_TOKEN');
  if (new Date() > storedToken.expiresAt)
    throw new UnauthorizedError('Refresh token has expired.', 'REFRESH_TOKEN_EXPIRED');

  if (storedToken.user.status === 'INACTIVE')
    throw new UnauthorizedError('User account is disabled or locked.', 'ACCOUNT_DISABLED');

  // Check employment status on refresh as well
  if (
    storedToken.user.employee &&
    ['TERMINATED', 'RESIGNED', 'RETIRED'].includes(storedToken.user.employee.employmentStatus)
  ) {
    throw new UnauthorizedError('Employment is no longer active.', 'ACCOUNT_DISABLED');
  }

  // Token Rotation: Revoke old, issue new (Security Best Practice)
  const newAccessToken = generateAccessToken(storedToken.user);
  const newRawRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashToken(newRawRefreshToken);

  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + 7);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: newHashedRefreshToken,
        expiresAt: newExpiry,
        ipAddress: ip,
        userAgent,
      },
    }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
};

export const logoutUser = async (rawRefreshToken, userId) => {
  const hashedToken = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashedToken, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  audit.log(userId, 'LOGOUT', userId);
};

export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, employee: true },
  });

  if (!user) throw new AppError('User not found', 404, 'RESOURCE_NOT_FOUND');

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.employee
      ? `${user.employee.firstName} ${user.employee.lastName}`
      : user.username,
    role: user.role?.name || 'Unknown',
    roleCode: user.role?.code || 'UNKNOWN',
    roleId: user.roleId,
    status: user.status,
    employee: user.employee,
  };
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404, 'RESOURCE_NOT_FOUND');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Current password is incorrect.', 'INVALID_PASSWORD');

  const newHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0, // SECURITY: Reset attempts in case they were locked out
      },
    }),
    // SECURITY: Invalidate ALL active sessions on password change
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  securityAudit.log(userId, 'PASSWORD_CHANGE', userId);

  return { message: 'Password changed successfully. All other sessions have been logged out.' };
};

export const registerUser = async (data) => {
  const { fullName, email, password, securityQuestion, securityAnswer } = data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email already registered.', 409, 'DUPLICATE_RESOURCE');

  const employeeRole = await prisma.role.findFirst({
    where: { code: 'EMPLOYEE', status: 'ACTIVE' },
  });
  if (!employeeRole)
    throw new AppError('EMPLOYEE role not found. Seed roles first.', 500, 'SERVER_ERROR');

  const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const securityAnswerHash = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    config.bcrypt.saltRounds,
  );

  const names = fullName.trim().split(/\s+/);
  const firstName = names[0] || fullName;
  const lastName = names.slice(1).join(' ') || fullName;

  const emailPrefix = email.split('@')[0];
  let baseUsername =
    emailPrefix
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') || 'user';
  if (!baseUsername || baseUsername.length < 2) baseUsername = 'user';
  let username = baseUsername;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}_${suffix}`;
    suffix++;
  }

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        email,
        passwordHash,
        status: 'PENDING_APPROVAL',
        roleId: employeeRole.id,
        failedLoginAttempts: 0,
        securityQuestion,
        securityAnswerHash,
      },
      include: { role: true },
    });

    const employeeNumber = generateEmployeeNumber();
    const employee = await tx.employee.create({
      data: {
        employeeNumber,
        firstName,
        lastName,
        email,
        hireDate: new Date(),
        employmentStatus: 'PROBATION',
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { employeeId: employee.id },
      include: { role: true },
    });

    await tx.applicantProfile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
      },
    });

    return { user: updatedUser, employee };
  });

  const accessToken = generateAccessToken(result.user);
  const rawRefreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      tokenHash: hashedRefreshToken,
      expiresAt,
      ipAddress: null,
      userAgent: null,
    },
  });

  audit.log(result.user.id, 'REGISTER', result.user.id, `Self-registered account for ${email}`);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    expiresIn: config.jwt.expiresIn,
    user: {
      id: result.user.id,
      username: result.user.username,
      email: result.user.email,
      displayName: fullName,
      role: result.user.role?.name || 'Unknown',
      roleCode: result.user.role?.code || 'UNKNOWN',
      roleId: result.user.roleId,
      status: result.user.status,
      employee: result.employee,
    },
  };
};

export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== 'ACTIVE' || !user.securityQuestion) {
    throw new AppError(
      'If an account exists with that email, you can reset your password.',
      400,
      'GENERIC_MESSAGE',
    );
  }

  return { securityQuestion: user.securityQuestion };
};

export const verifySecurityAnswer = async (email, answer) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== 'ACTIVE' || !user.securityAnswerHash) {
    throw new AppError('Invalid email or answer.', 400, 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(answer.trim().toLowerCase(), user.securityAnswerHash);
  if (!isMatch) {
    throw new AppError('Invalid email or answer.', 400, 'INVALID_CREDENTIALS');
  }

  const rawToken = randomBytes(40).toString('hex');
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordResetTokenHash: hashedToken, passwordResetExpires: expiresAt },
  });

  return { resetToken: rawToken };
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = hashToken(token);

  const user = await prisma.user.findFirst({
    where: { passwordResetTokenHash: hashedToken, passwordResetExpires: { gt: new Date() } },
  });
  if (!user)
    throw new AppError('Invalid or expired reset token.', 400, 'INVALID_OR_EXPIRED_RESET_TOKEN');

  const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        passwordResetTokenHash: null,
        passwordResetExpires: null,
      },
    }),
    // Revoke all sessions — force re-login
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  securityAudit.log(user.id, 'PASSWORD_RESET', user.id, 'Self-service password reset completed.');

  return { message: 'Password reset successful. Please log in.' };
};

export const logoutAllDevices = async (userId) => {
  // Revoke ALL active refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  return { message: 'Successfully logged out from all devices.' };
};
