import { Router } from 'express';
import * as c from './salary-component.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listSalaryComponentsSchema,
  createSalaryComponentSchema,
  updateSalaryComponentSchema,
  salaryComponentIdParamSchema,
} from './salary-component.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /api/salary-components:
 *   get:
 *     tags: [Salary Components]
 *     summary: List all salary components
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by code or name
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [EARNING, DEDUCTION]
 *         description: Filter by type
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
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of salary components
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.SALARY_COMPONENTS.READ),
  validate(listSalaryComponentsSchema),
  c.listSalaryComponents,
);

/**
 * @swagger
 * /api/salary-components/{id}:
 *   get:
 *     tags: [Salary Components]
 *     summary: Get a salary component by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary component ID
 *     responses:
 *       200:
 *         description: Salary component found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary component not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.SALARY_COMPONENTS.READ),
  validate(salaryComponentIdParamSchema),
  c.getSalaryComponent,
);

/**
 * @swagger
 * /api/salary-components:
 *   post:
 *     tags: [Salary Components]
 *     summary: Create a new salary component
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, type, calculationMethod]
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: "^[A-Z0-9_]+$"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               type:
 *                 type: string
 *                 enum: [EARNING, DEDUCTION]
 *               calculationMethod:
 *                 type: string
 *                 enum: [FIXED, PERCENTAGE, FORMULA, MANUAL]
 *               defaultValue:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               formula:
 *                 type: string
 *                 nullable: true
 *                 description: Required when calculationMethod is FORMULA
 *               isTaxable:
 *                 type: boolean
 *                 default: false
 *               isPensionable:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Salary component created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.SALARY_COMPONENTS.CREATE),
  validate(createSalaryComponentSchema),
  c.createSalaryComponent,
);

/**
 * @swagger
 * /api/salary-components/{id}:
 *   patch:
 *     tags: [Salary Components]
 *     summary: Update a salary component
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary component ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: "^[A-Z0-9_]+$"
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               type:
 *                 type: string
 *                 enum: [EARNING, DEDUCTION]
 *               calculationMethod:
 *                 type: string
 *                 enum: [FIXED, PERCENTAGE, FORMULA, MANUAL]
 *               defaultValue:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               formula:
 *                 type: string
 *                 nullable: true
 *                 description: Required when calculationMethod is FORMULA
 *               isTaxable:
 *                 type: boolean
 *                 default: false
 *               isPensionable:
 *                 type: boolean
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Salary component updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary component not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.SALARY_COMPONENTS.UPDATE),
  validate(updateSalaryComponentSchema),
  c.updateSalaryComponent,
);

/**
 * @swagger
 * /api/salary-components/{id}:
 *   delete:
 *     tags: [Salary Components]
 *     summary: Deactivate a salary component
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary component ID
 *     responses:
 *       200:
 *         description: Salary component deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary component not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.SALARY_COMPONENTS.DELETE),
  validate(salaryComponentIdParamSchema),
  c.deactivateSalaryComponent,
);

/**
 * @swagger
 * /api/salary-components/{id}/hard:
 *   delete:
 *     tags: [Salary Components]
 *     summary: Permanently delete a salary component
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary component ID
 *     responses:
 *       200:
 *         description: Salary component deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary component not found
 */
router.delete(
  '/:id/hard',
  authorize(PERMISSIONS.SALARY_COMPONENTS.DELETE),
  validate(salaryComponentIdParamSchema),
  c.deleteSalaryComponent,
);

/**
 * @swagger
 * /api/salary-components/{id}/activate:
 *   patch:
 *     tags: [Salary Components]
 *     summary: Activate a salary component
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary component ID
 *     responses:
 *       200:
 *         description: Salary component activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary component not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.SALARY_COMPONENTS.ACTIVATE),
  validate(salaryComponentIdParamSchema),
  c.activateSalaryComponent,
);

export default router;
