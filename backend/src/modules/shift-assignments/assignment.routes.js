import { Router } from 'express';
import * as c from './assignment.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listAssignmentsSchema,
  assignShiftSchema,
  bulkAssignSchema,
  endAssignmentSchema,
} from './assignment.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /shift-assignments:
 *   get:
 *     tags: [Shift Assignments]
 *     summary: List all shift assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Items per page (default 25)
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by shift ID
 *       - in: query
 *         name: currentOnly
 *         schema:
 *           type: boolean
 *         description: Filter to current assignments only
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -effectiveFrom
 *         description: Sort field (default '-effectiveFrom')
 *     responses:
 *       200:
 *         description: List of shift assignments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.SHIFT_ASSIGNMENTS.READ),
  validate(listAssignmentsSchema),
  c.listAssignments,
);

/**
 * @swagger
 * /shift-assignments:
 *   post:
 *     tags: [Shift Assignments]
 *     summary: Assign a shift to an employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, shiftId, effectiveFrom]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *               effectiveTo:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Must be on or after effectiveFrom
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 default: [Mon, Tue, Wed, Thu, Fri]
 *                 minItems: 1
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Shift assigned successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.SHIFT_ASSIGNMENTS.CREATE),
  validate(assignShiftSchema),
  c.assignShift,
);

/**
 * @swagger
 * /shift-assignments/bulk:
 *   post:
 *     tags: [Shift Assignments]
 *     summary: Bulk assign shifts to multiple employees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeIds, shiftId, effectiveFrom]
 *             properties:
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *               daysOfWeek:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 *                 default: [Mon, Tue, Wed, Thu, Fri]
 *                 minItems: 1
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Shifts assigned successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/bulk',
  authorize(PERMISSIONS.SHIFT_ASSIGNMENTS.BULK_ASSIGN),
  validate(bulkAssignSchema),
  c.bulkAssignShift,
);

/**
 * @swagger
 * /shift-assignments/{id}/end:
 *   patch:
 *     tags: [Shift Assignments]
 *     summary: End a shift assignment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [effectiveTo]
 *             properties:
 *               effectiveTo:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Shift assignment ended successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 */
router.patch(
  '/:id/end',
  authorize(PERMISSIONS.SHIFT_ASSIGNMENTS.UPDATE),
  validate(endAssignmentSchema),
  c.endAssignment,
);

export default router;
