import { Router } from 'express';
import * as c from './payroll.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listPayrollsSchema,
  generatePayrollSchema,
  updatePayrollSchema,
  payrollIdParamSchema,
} from './payroll.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/payrolls:
 *   get:
 *     tags: [Payroll]
 *     summary: List all payrolls
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
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         description: Filter by year
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter by month
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, APPROVED, PAID, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by employee name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of payrolls
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.PAYROLL.READ), validate(listPayrollsSchema), c.listPayrolls);

/**
 * @swagger
 * /api/payrolls/{id}:
 *   get:
 *     tags: [Payroll]
 *     summary: Get a payroll by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payroll found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PAYROLL.READ),
  validate(payrollIdParamSchema),
  c.getPayroll,
);

/**
 * @swagger
 * /api/payrolls/generate:
 *   post:
 *     tags: [Payroll]
 *     summary: Generate a payroll
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [payrollPeriodId]
 *             properties:
 *               payrollPeriodId:
 *                 type: string
 *                 format: uuid
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Payroll generated
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/generate',
  authorize(PERMISSIONS.PAYROLL.GENERATE),
  validate(generatePayrollSchema),
  c.generatePayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}:
 *   patch:
 *     tags: [Payroll]
 *     summary: Update a payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *               overtimeAmount:
 *                 type: number
 *                 minimum: 0
 *               allowanceAmount:
 *                 type: number
 *                 minimum: 0
 *               bonusAmount:
 *                 type: number
 *                 minimum: 0
 *               deductionAmount:
 *                 type: number
 *                 minimum: 0
 *               taxAmount:
 *                 type: number
 *                 minimum: 0
 *               remarks:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Payroll updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.PAYROLL.UPDATE),
  validate(updatePayrollSchema),
  c.updatePayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}/approve:
 *   post:
 *     tags: [Payroll]
 *     summary: Approve a payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payroll approved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.PAYROLL.APPROVE),
  validate(payrollIdParamSchema),
  c.approvePayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}/finalize:
 *   post:
 *     tags: [Payroll]
 *     summary: Finalize a payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payroll finalized
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.post(
  '/:id/finalize',
  authorize(PERMISSIONS.PAYROLL.FINALIZE),
  validate(payrollIdParamSchema),
  c.finalizePayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}/cancel:
 *   post:
 *     tags: [Payroll]
 *     summary: Cancel a payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payroll cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.post(
  '/:id/cancel',
  authorize(PERMISSIONS.PAYROLL.UPDATE),
  validate(payrollIdParamSchema),
  c.cancelPayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}/reopen:
 *   post:
 *     tags: [Payroll]
 *     summary: Reopen a finalized payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payroll reopened
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.post(
  '/:id/reopen',
  authorize(PERMISSIONS.PAYROLL.REOPEN),
  validate(payrollIdParamSchema),
  c.reopenPayroll,
);

/**
 * @swagger
 * /api/payrolls/{id}/payslip:
 *   get:
 *     tags: [Payroll]
 *     summary: Get payslip for a payroll
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payroll ID
 *     responses:
 *       200:
 *         description: Payslip data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payroll not found
 */
router.get(
  '/:id/payslip',
  authorize(PERMISSIONS.PAYROLL.READ),
  validate(payrollIdParamSchema),
  c.getPayslip,
);

export default router;
