import { Router } from 'express';
import * as c from './employee-salary-profile.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listEmployeeSalaryProfilesSchema,
  createEmployeeSalaryProfileSchema,
  updateEmployeeSalaryProfileSchema,
  employeeSalaryProfileIdParamSchema,
  employeeIdParamSchema,
} from './employee-salary-profile.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /employee-salary-profiles:
 *   get:
 *     tags: [Employee Salary Profiles]
 *     summary: List all employee salary profiles
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
 *         name: salaryComponentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by salary component ID
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-effectiveFrom'
 *         description: Sort field (prefix '-' for descending)
 *     responses:
 *       200:
 *         description: List of employee salary profiles
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.READ),
  validate(listEmployeeSalaryProfilesSchema),
  c.listEmployeeSalaryProfiles,
);

/**
 * @swagger
 * /employee-salary-profiles/employee/{employeeId}:
 *   get:
 *     tags: [Employee Salary Profiles]
 *     summary: Get salary profiles for a specific employee
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
 *         description: Salary profiles for the employee
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/employee/:employeeId',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.READ),
  validate(employeeIdParamSchema),
  c.getEmployeeSalaryProfiles,
);

/**
 * @swagger
 * /employee-salary-profiles/{id}:
 *   get:
 *     tags: [Employee Salary Profiles]
 *     summary: Get an employee salary profile by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary profile ID
 *     responses:
 *       200:
 *         description: Employee salary profile details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary profile not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.READ),
  validate(employeeSalaryProfileIdParamSchema),
  c.getEmployeeSalaryProfile,
);

/**
 * @swagger
 * /employee-salary-profiles:
 *   post:
 *     tags: [Employee Salary Profiles]
 *     summary: Create a new employee salary profile
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
 *               - salaryComponentId
 *               - effectiveFrom
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               salaryComponentId:
 *                 type: string
 *                 format: uuid
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *               effectiveTo:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               customValue:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Salary profile created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.CREATE),
  validate(createEmployeeSalaryProfileSchema),
  c.createEmployeeSalaryProfile,
);

/**
 * @swagger
 * /employee-salary-profiles/{id}:
 *   patch:
 *     tags: [Employee Salary Profiles]
 *     summary: Update an employee salary profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               salaryComponentId:
 *                 type: string
 *                 format: uuid
 *               customValue:
 *                 type: number
 *                 minimum: 0
 *                 nullable: true
 *               effectiveFrom:
 *                 type: string
 *                 format: date
 *               effectiveTo:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Salary profile updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary profile not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.UPDATE),
  validate(updateEmployeeSalaryProfileSchema),
  c.updateEmployeeSalaryProfile,
);

/**
 * @swagger
 * /employee-salary-profiles/{id}/end:
 *   patch:
 *     tags: [Employee Salary Profiles]
 *     summary: End an employee salary profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary profile ID
 *     responses:
 *       200:
 *         description: Salary profile ended
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary profile not found
 */
router.patch(
  '/:id/end',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.END),
  validate(employeeSalaryProfileIdParamSchema),
  c.endEmployeeSalaryProfile,
);

/**
 * @swagger
 * /employee-salary-profiles/{id}:
 *   delete:
 *     tags: [Employee Salary Profiles]
 *     summary: Delete an employee salary profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Salary profile ID
 *     responses:
 *       200:
 *         description: Salary profile deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Salary profile not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEE_SALARY_PROFILES.DELETE),
  validate(employeeSalaryProfileIdParamSchema),
  c.deleteEmployeeSalaryProfile,
);

export default router;
