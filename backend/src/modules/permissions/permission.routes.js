import { Router } from 'express';
import * as c from './permission.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import { listPermissionsSchema, permissionModuleParamSchema } from './permission.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /permissions:
 *   get:
 *     tags: [Permissions]
 *     summary: List all permissions with pagination and filters
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
 *           default: 100
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *         description: Filter by module
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: module
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of permissions
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PERMISSIONS.READ),
  validate(listPermissionsSchema),
  c.listPermissions,
);

/**
 * @swagger
 * /permissions/modules:
 *   get:
 *     tags: [Permissions]
 *     summary: List all permission modules
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permission modules
 *       401:
 *         description: Unauthorized
 */
router.get('/modules', authorize(PERMISSIONS.PERMISSIONS.READ), c.listModules);

/**
 * @swagger
 * /permissions/module/{module}:
 *   get:
 *     tags: [Permissions]
 *     summary: List permissions by module
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Module name
 *     responses:
 *       200:
 *         description: List of permissions for the module
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Module not found
 */
router.get(
  '/module/:module',
  authorize(PERMISSIONS.PERMISSIONS.READ),
  validate(permissionModuleParamSchema),
  c.listPermissionsByModule,
);

export default router;
