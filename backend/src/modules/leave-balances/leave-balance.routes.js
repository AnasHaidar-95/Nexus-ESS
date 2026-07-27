import { Router } from 'express';
import * as c from './leave-balance.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listLeaveBalancesSchema,
  createLeaveBalanceSchema,
  updateLeaveBalanceSchema,
  leaveBalanceIdParamSchema,
  employeeIdParamSchema,
} from './leave-balance.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/leave-balances:
 *   get:
 *     tags: [Leave Balances]
 *     summary: List all leave balances
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
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee UUID
 *       - in: query
 *         name: leaveTypeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by leave type UUID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         description: Filter by year
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: year
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of leave balances
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.LEAVE_BALANCES.READ),
  validate(listLeaveBalancesSchema),
  c.listLeaveBalances,
);

/**
 * @swagger
 * /api/leave-balances/employee/{employeeId}:
 *   get:
 *     tags: [Leave Balances]
 *     summary: Get leave balances by employee ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee UUID
 *     responses:
 *       200:
 *         description: Leave balances for the employee
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/employee/:employeeId',
  authorize(PERMISSIONS.LEAVE_BALANCES.READ),
  validate(employeeIdParamSchema),
  c.getLeaveBalancesByEmployee,
);

/**
 * @swagger
 * /api/leave-balances/{id}:
 *   get:
 *     tags: [Leave Balances]
 *     summary: Get a leave balance by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave balance UUID
 *     responses:
 *       200:
 *         description: Leave balance found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave balance not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.LEAVE_BALANCES.READ),
  validate(leaveBalanceIdParamSchema),
  c.getLeaveBalance,
);

/**
 * @swagger
 * /api/leave-balances:
 *   post:
 *     tags: [Leave Balances]
 *     summary: Create a new leave balance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, leaveTypeId, year, entitledDays]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               leaveTypeId:
 *                 type: string
 *                 format: uuid
 *               year:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2100
 *               entitledDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *               usedDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *                 default: 0
 *               carriedOverDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *                 default: 0
 *     responses:
 *       201:
 *         description: Leave balance created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.LEAVE_BALANCES.CREATE),
  validate(createLeaveBalanceSchema),
  c.createLeaveBalance,
);

/**
 * @swagger
 * /api/leave-balances/{id}:
 *   patch:
 *     tags: [Leave Balances]
 *     summary: Update a leave balance
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave balance UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entitledDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *               usedDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *               carriedOverDays:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999
 *     responses:
 *       200:
 *         description: Leave balance updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave balance not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.LEAVE_BALANCES.UPDATE),
  validate(updateLeaveBalanceSchema),
  c.updateLeaveBalance,
);

export default router;
