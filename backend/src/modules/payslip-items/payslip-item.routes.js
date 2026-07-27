import { Router } from 'express';
import * as c from './payslip-item.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import { listPayslipItemsSchema, payslipItemIdParamSchema } from './payslip-item.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/payslip-items:
 *   get:
 *     tags: [Payslip Items]
 *     summary: List all payslip items
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
 *         name: disbursementId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by disbursement ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of payslip items
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PAYSLIP_ITEMS.READ),
  validate(listPayslipItemsSchema),
  c.listPayslipItems,
);

/**
 * @swagger
 * /api/payslip-items/{id}:
 *   get:
 *     tags: [Payslip Items]
 *     summary: Get a payslip item by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Payslip item ID
 *     responses:
 *       200:
 *         description: Payslip item found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payslip item not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PAYSLIP_ITEMS.READ),
  validate(payslipItemIdParamSchema),
  c.getPayslipItem,
);

export default router;
