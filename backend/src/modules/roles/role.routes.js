import { Router } from 'express';
import * as c from './role.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listRolesSchema,
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
  assignPermissionsSchema,
} from './role.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /roles:
 *   get:
 *     tags: [Roles]
 *     summary: List all roles with pagination and filters
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: name
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.ROLES.READ), validate(listRolesSchema), c.listRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get a role by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.get('/:id', authorize(PERMISSIONS.ROLES.READ), validate(roleIdParamSchema), c.getRole);

/**
 * @swagger
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: "^[A-Z0-9_]+$"
 *                 description: Uppercase alphanumeric with underscores
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Role created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize(PERMISSIONS.ROLES.CREATE), validate(createRoleSchema), c.createRole);

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     tags: [Roles]
 *     summary: Update a role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Role updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.patch('/:id', authorize(PERMISSIONS.ROLES.UPDATE), validate(updateRoleSchema), c.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     tags: [Roles]
 *     summary: Delete a role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.ROLES.DELETE),
  validate(roleIdParamSchema),
  c.deleteRole,
);

/**
 * @swagger
 * /roles/{id}/permissions:
 *   get:
 *     tags: [Roles]
 *     summary: Get permissions assigned to a role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of assigned permissions
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.get(
  '/:id/permissions',
  authorize(PERMISSIONS.ROLES.READ),
  validate(roleIdParamSchema),
  c.getRolePermissions,
);

/**
 * @swagger
 * /roles/{id}/permissions:
 *   put:
 *     tags: [Roles]
 *     summary: Replace all permissions for a role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [permissionIds]
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 description: Array of permission IDs (at least one required)
 *     responses:
 *       200:
 *         description: Permissions replaced
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.put(
  '/:id/permissions',
  authorize(PERMISSIONS.ROLES.ASSIGN_PERMISSIONS),
  validate(assignPermissionsSchema),
  c.replaceRolePermissions,
);

/**
 * @swagger
 * /roles/{id}/users:
 *   get:
 *     tags: [Roles]
 *     summary: Get users assigned to a role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: List of users with this role
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 */
router.get(
  '/:id/users',
  authorize(PERMISSIONS.ROLES.READ),
  validate(roleIdParamSchema),
  c.getRoleUsers,
);

export default router;
