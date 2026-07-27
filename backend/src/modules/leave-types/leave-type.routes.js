import { Router } from 'express';
import * as c from './leave-type.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listLeaveTypesSchema,
  createLeaveTypeSchema,
  updateLeaveTypeSchema,
  leaveTypeIdParamSchema,
} from './leave-type.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/leave-types:
 *   get:
 *     tags: [Leave Types]
 *     summary: List all leave types
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *           minimum: 1
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
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
 *         description: List of leave types
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.LEAVE_TYPES.READ),
  validate(listLeaveTypesSchema),
  c.listLeaveTypes,
);

/**
 * @swagger
 * /api/leave-types/{id}:
 *   get:
 *     tags: [Leave Types]
 *     summary: Get a leave type by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave type UUID
 *     responses:
 *       200:
 *         description: Leave type found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.LEAVE_TYPES.READ),
  validate(leaveTypeIdParamSchema),
  c.getLeaveType,
);

/**
 * @swagger
 * /api/leave-types:
 *   post:
 *     tags: [Leave Types]
 *     summary: Create a new leave type
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
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isPaid:
 *                 type: boolean
 *                 default: true
 *               carryForward:
 *                 type: boolean
 *                 default: false
 *               maxDaysPerYear:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Leave type created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.LEAVE_TYPES.CREATE),
  validate(createLeaveTypeSchema),
  c.createLeaveType,
);

/**
 * @swagger
 * /api/leave-types/{id}:
 *   patch:
 *     tags: [Leave Types]
 *     summary: Update a leave type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave type UUID
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
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isPaid:
 *                 type: boolean
 *               carryForward:
 *                 type: boolean
 *               maxDaysPerYear:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Leave type updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.LEAVE_TYPES.UPDATE),
  validate(updateLeaveTypeSchema),
  c.updateLeaveType,
);

/**
 * @swagger
 * /api/leave-types/{id}/activate:
 *   patch:
 *     tags: [Leave Types]
 *     summary: Activate a leave type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave type UUID
 *     responses:
 *       200:
 *         description: Leave type activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.LEAVE_TYPES.ACTIVATE),
  validate(leaveTypeIdParamSchema),
  c.activateLeaveType,
);

/**
 * @swagger
 * /api/leave-types/{id}/deactivate:
 *   patch:
 *     tags: [Leave Types]
 *     summary: Deactivate a leave type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave type UUID
 *     responses:
 *       200:
 *         description: Leave type deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave type not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.LEAVE_TYPES.DEACTIVATE),
  validate(leaveTypeIdParamSchema),
  c.deactivateLeaveType,
);

export default router;
