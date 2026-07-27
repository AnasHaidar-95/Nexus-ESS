import { Router } from 'express';
import * as c from './payroll-period.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listPayrollPeriodsSchema,
  createPayrollPeriodSchema,
  updatePayrollPeriodSchema,
  payrollPeriodIdParamSchema,
} from './payroll-period.schema.js';

const router = Router();
router.use(authenticate);

// Standard CRUD

/**
 * @swagger
 * /api/payroll-periods:
 *   get:
 *     tags: [Payroll Periods]
 *     summary: List all payroll periods
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
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         description: Filter by year
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, OPEN, PROCESSING, CLOSED, LOCKED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -startDate
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of payroll periods
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PAYROLL_PERIODS.READ),
  validate(listPayrollPeriodsSchema),
  c.listPayrollPeriods,
);

/**
 * @swagger
 * /api/payroll-periods/{id}:
 *   get:
 *     tags: [Payroll Periods]
 *     summary: Get a payroll period by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_PERIODS.READ),
  validate(payrollPeriodIdParamSchema),
  c.getPayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Create a new payroll period
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate, endDate]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Must be on or after startDate
 *               payDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Payroll period created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.PAYROLL_PERIODS.CREATE),
  validate(createPayrollPeriodSchema),
  c.createPayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}:
 *   patch:
 *     tags: [Payroll Periods]
 *     summary: Update a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
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
 *               payDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Payroll period updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_PERIODS.UPDATE),
  validate(updatePayrollPeriodSchema),
  c.updatePayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}:
 *   delete:
 *     tags: [Payroll Periods]
 *     summary: Cancel a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_PERIODS.DELETE),
  validate(payrollPeriodIdParamSchema),
  c.cancelPayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/hard:
 *   delete:
 *     tags: [Payroll Periods]
 *     summary: Permanently delete a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.delete(
  '/:id/hard',
  authorize(PERMISSIONS.PAYROLL_PERIODS.DELETE),
  validate(payrollPeriodIdParamSchema),
  c.deletePayrollPeriod,
);

// Lifecycle Actions

/**
 * @swagger
 * /api/payroll-periods/{id}/open:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Open a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period opened
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/open',
  authorize(PERMISSIONS.PAYROLL_PERIODS.OPEN),
  validate(payrollPeriodIdParamSchema),
  c.openPayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/close:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Close a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period closed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/close',
  authorize(PERMISSIONS.PAYROLL_PERIODS.CLOSE),
  validate(payrollPeriodIdParamSchema),
  c.closePayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/lock:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Lock a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period locked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/lock',
  authorize(PERMISSIONS.PAYROLL_PERIODS.LOCK),
  validate(payrollPeriodIdParamSchema),
  c.lockPayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/unlock:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Unlock a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period unlocked
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/unlock',
  authorize(PERMISSIONS.PAYROLL_PERIODS.UNLOCK),
  validate(payrollPeriodIdParamSchema),
  c.unlockPayrollPeriod,
);

// Bulk Period Actions

/**
 * @swagger
 * /api/payroll-periods/{id}/approve:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Approve a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period approved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.PAYROLL_PERIODS.UPDATE),
  validate(payrollPeriodIdParamSchema),
  c.approvePayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/finalize:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Finalize a payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period finalized
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/finalize',
  authorize(PERMISSIONS.PAYROLL_PERIODS.UPDATE),
  validate(payrollPeriodIdParamSchema),
  c.finalizePayrollPeriod,
);

/**
 * @swagger
 * /api/payroll-periods/{id}/reopen:
 *   post:
 *     tags: [Payroll Periods]
 *     summary: Reopen a finalized payroll period
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll period ID
 *     responses:
 *       200:
 *         description: Payroll period reopened
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll period not found
 */
router.post(
  '/:id/reopen',
  authorize(PERMISSIONS.PAYROLL_PERIODS.UPDATE),
  validate(payrollPeriodIdParamSchema),
  c.reopenPayrollPeriod,
);

export default router;
