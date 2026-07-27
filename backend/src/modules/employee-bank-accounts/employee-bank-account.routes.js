import { Router } from 'express';
import * as c from './employee-bank-account.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listEmployeeBankAccountsSchema,
  createEmployeeBankAccountSchema,
  updateEmployeeBankAccountSchema,
  employeeBankAccountIdParamSchema,
  employeeIdParamSchema,
} from './employee-bank-account.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /employee-bank-accounts:
 *   get:
 *     tags: [Employee Bank Accounts]
 *     summary: List all employee bank accounts
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
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: 'bankName'
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of employee bank accounts
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.READ),
  validate(listEmployeeBankAccountsSchema),
  c.listEmployeeBankAccounts,
);

/**
 * @swagger
 * /employee-bank-accounts/employee/{employeeId}:
 *   get:
 *     tags: [Employee Bank Accounts]
 *     summary: Get bank accounts for a specific employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Bank accounts for the employee
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/employee/:employeeId',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.READ),
  validate(employeeIdParamSchema),
  c.getEmployeeBankAccounts,
);

/**
 * @swagger
 * /employee-bank-accounts/{id}:
 *   get:
 *     tags: [Employee Bank Accounts]
 *     summary: Get an employee bank account by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Employee bank account details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.READ),
  validate(employeeBankAccountIdParamSchema),
  c.getEmployeeBankAccount,
);

/**
 * @swagger
 * /employee-bank-accounts:
 *   post:
 *     tags: [Employee Bank Accounts]
 *     summary: Create a new employee bank account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - accountName
 *               - accountNumber
 *               - bankName
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               accountName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               accountNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               bankName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               branchCode:
 *                 type: string
 *                 maxLength: 30
 *                 nullable: true
 *               swiftCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *               isDefault:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Bank account created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.CREATE),
  validate(createEmployeeBankAccountSchema),
  c.createEmployeeBankAccount,
);

/**
 * @swagger
 * /employee-bank-accounts/{id}:
 *   patch:
 *     tags: [Employee Bank Accounts]
 *     summary: Update an employee bank account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               accountNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *               bankName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               branchCode:
 *                 type: string
 *                 maxLength: 30
 *                 nullable: true
 *               swiftCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Bank account updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.UPDATE),
  validate(updateEmployeeBankAccountSchema),
  c.updateEmployeeBankAccount,
);

/**
 * @swagger
 * /employee-bank-accounts/{id}/default:
 *   patch:
 *     tags: [Employee Bank Accounts]
 *     summary: Set a bank account as the default
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Default bank account updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 */
router.patch(
  '/:id/default',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.SET_DEFAULT),
  validate(employeeBankAccountIdParamSchema),
  c.setDefaultBankAccount,
);

/**
 * @swagger
 * /employee-bank-accounts/{id}:
 *   delete:
 *     tags: [Employee Bank Accounts]
 *     summary: Delete an employee bank account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_BANK_ACCOUNTS.DELETE),
  validate(employeeBankAccountIdParamSchema),
  c.deleteEmployeeBankAccount,
);

export default router;
