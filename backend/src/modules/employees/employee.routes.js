import { Router } from 'express';
import * as c from './employee.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listEmployeesSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdParamSchema,
  terminateEmployeeSchema,
  changeManagerSchema,
  changeDepartmentSchema,
  changePositionSchema,
  activateEmployeeSchema,
} from './employee.schema.js';

const router = Router();

// All employee routes require authentication
router.use(authenticate);

// Standard CRUD
/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: List all employees
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
 *         name: departmentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by department ID
 *       - in: query
 *         name: positionId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by position ID
 *       - in: query
 *         name: managerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by manager ID
 *       - in: query
 *         name: employmentStatus
 *         schema:
 *           type: string
 *           enum: [ACTIVE, PROBATION, ON_LEAVE, RESIGNED, TERMINATED, RETIRED]
 *         description: Filter by employment status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *         description: Filter by status
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
 *           default: -hireDate
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of employees
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.EMPLOYEES.READ),
  validate(listEmployeesSchema),
  c.listEmployees,
);
/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEES.READ),
  validate(employeeIdParamSchema),
  c.getEmployee,
);
/**
 * @swagger
 * /api/employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create a new employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeNumber, firstName, lastName, email, departmentId, positionId, hireDate, employmentType, employmentStatus]
 *             properties:
 *               employeeNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               middleName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               preferredName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, NON_BINARY, OTHER, PREFER_NOT_TO_SAY]
 *                 nullable: true
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               nationalId:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               passportNumber:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               phone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               alternatePhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               addressLine1:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               addressLine2:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               city:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               state:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *               country:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               positionId:
 *                 type: string
 *                 format: uuid
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               hireDate:
 *                 type: string
 *                 format: date
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, TEMPORARY]
 *                 default: FULL_TIME
 *               employmentStatus:
 *                 type: string
 *                 enum: [ACTIVE, PROBATION, ON_LEAVE, RESIGNED, TERMINATED, RETIRED]
 *                 default: ACTIVE
 *               emergencyContactName:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *               emergencyContactPhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               emergencyContactRelationship:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Employee created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.EMPLOYEES.CREATE),
  validate(createEmployeeSchema),
  c.createEmployee,
);
/**
 * @swagger
 * /api/employees/{id}:
 *   patch:
 *     tags: [Employees]
 *     summary: Update an employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               middleName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               preferredName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, NON_BINARY, OTHER, PREFER_NOT_TO_SAY]
 *                 nullable: true
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               nationalId:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               passportNumber:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               phone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               alternatePhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               addressLine1:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               addressLine2:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *               city:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               state:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *               country:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *               positionId:
 *                 type: string
 *                 format: uuid
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *               hireDate:
 *                 type: string
 *                 format: date
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, TEMPORARY]
 *                 default: FULL_TIME
 *               employmentStatus:
 *                 type: string
 *                 enum: [ACTIVE, PROBATION, ON_LEAVE, RESIGNED, TERMINATED, RETIRED]
 *                 default: ACTIVE
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *               terminationDate:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *               emergencyContactName:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *               emergencyContactPhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *               emergencyContactRelationship:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Employee updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEES.UPDATE),
  validate(updateEmployeeSchema),
  c.updateEmployee,
);
/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Archive an employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee archived
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.EMPLOYEES.DELETE),
  validate(employeeIdParamSchema),
  c.archiveEmployee,
);

// Lifecycle & Organizational Actions
/**
 * @swagger
 * /api/employees/{id}/activate:
 *   patch:
 *     tags: [Employees]
 *     summary: Activate an employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.EMPLOYEES.ACTIVATE),
  validate(activateEmployeeSchema),
  c.activateEmployee,
);
/**
 * @swagger
 * /api/employees/{id}/terminate:
 *   patch:
 *     tags: [Employees]
 *     summary: Terminate an employee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [terminationDate]
 *             properties:
 *               terminationDate:
 *                 type: string
 *                 format: date
 *               terminationReason:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Employee terminated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id/terminate',
  authorize(PERMISSIONS.EMPLOYEES.TERMINATE),
  validate(terminateEmployeeSchema),
  c.terminateEmployee,
);
/**
 * @swagger
 * /api/employees/{id}/department:
 *   patch:
 *     tags: [Employees]
 *     summary: Change an employee's department
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [departmentId]
 *             properties:
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Department changed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id/department',
  authorize(PERMISSIONS.EMPLOYEES.CHANGE_DEPARTMENT),
  validate(changeDepartmentSchema),
  c.changeDepartment,
);
/**
 * @swagger
 * /api/employees/{id}/position:
 *   patch:
 *     tags: [Employees]
 *     summary: Change an employee's position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [positionId]
 *             properties:
 *               positionId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Position changed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id/position',
  authorize(PERMISSIONS.EMPLOYEES.CHANGE_POSITION),
  validate(changePositionSchema),
  c.changePosition,
);
/**
 * @swagger
 * /api/employees/{id}/manager:
 *   patch:
 *     tags: [Employees]
 *     summary: Change an employee's manager
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               managerId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Manager changed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.patch(
  '/:id/manager',
  authorize(PERMISSIONS.EMPLOYEES.CHANGE_MANAGER),
  validate(changeManagerSchema),
  c.changeManager,
);

export default router;
