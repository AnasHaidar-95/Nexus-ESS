import { Router } from 'express';
import * as c from './payroll-disbursement.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listDisbursementsSchema,
  updateDisbursementSchema,
  markPaidSchema,
  disbursementIdParamSchema,
} from './payroll-disbursement.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/payroll-disbursements:
 *   get:
 *     tags: [Payroll Disbursements]
 *     summary: List all disbursements
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
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of disbursements
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PAYROLL_DISBURSEMENTS.READ),
  validate(listDisbursementsSchema),
  c.listDisbursements,
);

/**
 * @swagger
 * /api/payroll-disbursements/{id}:
 *   get:
 *     tags: [Payroll Disbursements]
 *     summary: Get a disbursement by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Disbursement ID
 *     responses:
 *       200:
 *         description: Disbursement found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Disbursement not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_DISBURSEMENTS.READ),
  validate(disbursementIdParamSchema),
  c.getDisbursement,
);

/**
 * @swagger
 * /api/payroll-disbursements/{id}:
 *   patch:
 *     tags: [Payroll Disbursements]
 *     summary: Update a disbursement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Disbursement ID
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
 *         description: Disbursement updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Disbursement not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_DISBURSEMENTS.UPDATE),
  validate(updateDisbursementSchema),
  c.updateDisbursement,
);

/**
 * @swagger
 * /api/payroll-disbursements/{id}:
 *   delete:
 *     tags: [Payroll Disbursements]
 *     summary: Delete a disbursement
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Disbursement ID
 *     responses:
 *       200:
 *         description: Disbursement deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Disbursement not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.PAYROLL_DISBURSEMENTS.DELETE),
  validate(disbursementIdParamSchema),
  c.deleteDisbursement,
);

/**
 * @swagger
 * /api/payroll-disbursements/{id}/mark-paid:
 *   post:
 *     tags: [Payroll Disbursements]
 *     summary: Mark a disbursement as paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Disbursement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentReference:
 *                 type: string
 *                 maxLength: 500
 *               payDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Disbursement marked as paid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Disbursement not found
 */
router.post(
  '/:id/mark-paid',
  authorize(PERMISSIONS.PAYROLL_DISBURSEMENTS.MARK_PAID),
  validate(markPaidSchema),
  c.markAsPaid,
);

export default router;
