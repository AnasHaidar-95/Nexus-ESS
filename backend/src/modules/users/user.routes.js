import { Router } from 'express';
import * as userController from './user.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  resetPasswordSchema,
} from './user.schema.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Standard CRUD

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *           minimum: 1
 *           maximum: 9999
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 500
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, LOCKED, SUSPENDED]
 *         description: Filter by status
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by role ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.USERS.READ),
  validate(listUsersSchema),
  userController.listUsers,
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get a user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.USERS.READ),
  validate(userIdParamSchema),
  userController.getUser,
);

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, username, email, roleId, temporaryPassword]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the employee to link
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: string
 *                 format: uuid
 *               temporaryPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Must be at least 8 characters
 *               forcePasswordChange:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.USERS.CREATE),
  validate(createUserSchema),
  userController.createUser,
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 500
 *               email:
 *                 type: string
 *                 format: email
 *               roleId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.USERS.UPDATE),
  validate(updateUserSchema),
  userController.updateUser,
);

// Status lifecycle actions

/**
 * @swagger
 * /users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activate a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.USERS.MANAGE),
  validate(userIdParamSchema),
  userController.activateUser,
);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Deactivate a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.USERS.MANAGE),
  validate(userIdParamSchema),
  userController.deactivateUser,
);

/**
 * @swagger
 * /users/{id}/lock:
 *   patch:
 *     tags: [Users]
 *     summary: Lock a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User locked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/lock',
  authorize(PERMISSIONS.USERS.MANAGE),
  validate(userIdParamSchema),
  userController.lockUser,
);

/**
 * @swagger
 * /users/{id}/unlock:
 *   patch:
 *     tags: [Users]
 *     summary: Unlock a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User unlocked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/unlock',
  authorize(PERMISSIONS.USERS.MANAGE),
  validate(userIdParamSchema),
  userController.unlockUser,
);

/**
 * @swagger
 * /users/{id}/suspend:
 *   patch:
 *     tags: [Users]
 *     summary: Suspend a user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User suspended
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/suspend',
  authorize(PERMISSIONS.USERS.MANAGE),
  validate(userIdParamSchema),
  userController.suspendUser,
);

// Password reset

/**
 * @swagger
 * /users/{id}/reset-password:
 *   patch:
 *     tags: [Users]
 *     summary: Reset a user's password
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newPassword]
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: "Must contain: uppercase, lowercase, number, special character"
 *               forcePasswordChange:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Password reset
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch(
  '/:id/reset-password',
  authorize(PERMISSIONS.USERS.RESET_PASSWORD),
  validate(resetPasswordSchema),
  userController.resetPassword,
);

export default router;
