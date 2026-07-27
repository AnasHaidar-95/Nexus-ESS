import { Router } from 'express';
import * as c from './setting.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import { listSettingsSchema, getSettingSchema, updateSettingSchema } from './setting.schema.js';

const router = Router();

// All settings routes require authentication
router.use(authenticate);

// Note: /categories must be defined BEFORE /:key to prevent "categories" from being treated as a key parameter

/**
 * @swagger
 * /settings/categories:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of setting categories
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', authorize(PERMISSIONS.SETTINGS.READ), c.getCategories);

/**
 * @swagger
 * /settings:
 *   get:
 *     tags: [Settings]
 *     summary: List all settings
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
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: editable
 *         schema:
 *           type: boolean
 *         description: Filter by editability
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 500
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: 'category'
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of settings
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.SETTINGS.READ), validate(listSettingsSchema), c.listSettings);

/**
 * @swagger
 * /settings/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get a setting by key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setting not found
 */
router.get('/:key', authorize(PERMISSIONS.SETTINGS.READ), validate(getSettingSchema), c.getSetting);

/**
 * @swagger
 * /settings/{key}:
 *   patch:
 *     tags: [Settings]
 *     summary: Update a setting by key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Setting key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 description: New value for the setting
 *     responses:
 *       200:
 *         description: Setting updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Setting not found
 */
router.patch(
  '/:key',
  authorize(PERMISSIONS.SETTINGS.UPDATE),
  validate(updateSettingSchema),
  c.updateSetting,
);

export default router;
