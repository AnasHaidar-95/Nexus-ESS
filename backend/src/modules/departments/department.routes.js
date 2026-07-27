import { Router } from 'express';
import * as c from './department.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listDepartmentsSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
  listDepartmentEmployeesSchema,
  assignManagerSchema,
} from './department.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/departments:
 *   get:
 *     tags: [Departments]
 *     summary: List all departments
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
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
 *         description: List of departments
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.DEPARTMENTS.READ),
  validate(listDepartmentsSchema),
  c.listDepartments,
);
/**
 * @swagger
 * /api/departments/{id}:
 *   get:
 *     tags: [Departments]
 *     summary: Get department by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.DEPARTMENTS.READ),
  validate(departmentIdParamSchema),
  c.getDepartment,
);
/**
 * @swagger
 * /api/departments:
 *   post:
 *     tags: [Departments]
 *     summary: Create a new department
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
 *                 maxLength: 150
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Department created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.DEPARTMENTS.CREATE),
  validate(createDepartmentSchema),
  c.createDepartment,
);
/**
 * @swagger
 * /api/departments/{id}:
 *   patch:
 *     tags: [Departments]
 *     summary: Update a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
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
 *                 maxLength: 150
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Department updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.DEPARTMENTS.UPDATE),
  validate(updateDepartmentSchema),
  c.updateDepartment,
);
/**
 * @swagger
 * /api/departments/{id}/activate:
 *   patch:
 *     tags: [Departments]
 *     summary: Activate a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.DEPARTMENTS.MANAGE),
  validate(departmentIdParamSchema),
  c.activateDepartment,
);
/**
 * @swagger
 * /api/departments/{id}/deactivate:
 *   patch:
 *     tags: [Departments]
 *     summary: Deactivate a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.DEPARTMENTS.MANAGE),
  validate(departmentIdParamSchema),
  c.deactivateDepartment,
);
/**
 * @swagger
 * /api/departments/{id}/employees:
 *   get:
 *     tags: [Departments]
 *     summary: List employees in a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include archived employees
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: employeeNumber
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of department employees
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.get(
  '/:id/employees',
  authorize(PERMISSIONS.DEPARTMENTS.READ),
  validate(listDepartmentEmployeesSchema),
  c.listDepartmentEmployees,
);
/**
 * @swagger
 * /api/departments/{id}/manager:
 *   patch:
 *     tags: [Departments]
 *     summary: Assign a manager to a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [managerId]
 *             properties:
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Manager assigned
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.patch(
  '/:id/manager',
  authorize(PERMISSIONS.DEPARTMENTS.ASSIGN_MANAGER),
  validate(assignManagerSchema),
  c.assignManager,
);
/**
 * @swagger
 * /api/departments/{id}:
 *   delete:
 *     tags: [Departments]
 *     summary: Deactivate a department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.DEPARTMENTS.DELETE),
  validate(departmentIdParamSchema),
  c.deactivateDepartment,
);

export default router;
