import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authLimiter, standardLimiter } from '../../core/middleware/rate-limiter.js';
import {
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifySecurityAnswerSchema,
} from './auth.schema.js';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with username/email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email address
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password, securityQuestion, securityAnswer]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               securityQuestion:
 *                 type: string
 *               securityAnswer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       409:
 *         description: Email already exists
 */
router.post('/register', standardLimiter, validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent
 *       404:
 *         description: Email not found
 */
router.post(
  '/forgot-password',
  standardLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

/**
 * @swagger
 * /auth/verify-security-answer:
 *   post:
 *     tags: [Auth]
 *     summary: Verify security answer to get reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, answer]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification successful, reset token issued
 *       401:
 *         description: Incorrect answer
 */
router.post(
  '/verify-security-answer',
  standardLimiter,
  validate(verifySecurityAnswerSchema),
  authController.verifySecurityAnswer,
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post(
  '/reset-password',
  standardLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', standardLimiter, validate(refreshSchema), authController.refresh);

// --- Protected Routes ---

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, validate(refreshSchema), authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout all sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions invalidated
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user details
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password (authenticated)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password changed
 *       401:
 *         description: Current password incorrect
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

export default router;
