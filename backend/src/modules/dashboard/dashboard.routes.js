import { Router } from 'express';
import * as c from './dashboard.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// ==========================================
// DASHBOARD ENDPOINTS (Role-specific widgets)
// ==========================================
/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get admin dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/admin', authorize(PERMISSIONS.DASHBOARD.ADMIN), c.getAdminDashboard);
/**
 * @swagger
 * /dashboard/hr:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get HR dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HR dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/hr', authorize(PERMISSIONS.DASHBOARD.HR), c.getHrDashboard);
/**
 * @swagger
 * /dashboard/payroll:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get payroll dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/payroll', authorize(PERMISSIONS.DASHBOARD.PAYROLL), c.getPayrollDashboard);
/**
 * @swagger
 * /dashboard/attendance:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get attendance dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/attendance', authorize(PERMISSIONS.DASHBOARD.ATTENDANCE), c.getAttendanceDashboard);
/**
 * @swagger
 * /dashboard/employee/{id}:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get employee-specific dashboard data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */
router.get('/employee/:id', authorize(PERMISSIONS.DASHBOARD.READ), c.getEmployeeDashboard);

// ==========================================
// STATISTICS ENDPOINTS (Aggregated analytics)
// ==========================================
/**
 * @swagger
 * /dashboard/statistics/organization:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get organization statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Organization statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/statistics/organization',
  authorize(PERMISSIONS.DASHBOARD.ADMIN),
  c.getOrganizationStats,
);
/**
 * @swagger
 * /dashboard/statistics/attendance:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get attendance statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/statistics/attendance',
  authorize(PERMISSIONS.DASHBOARD.ATTENDANCE),
  c.getAttendanceStats,
);
/**
 * @swagger
 * /dashboard/statistics/payroll:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get payroll statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/statistics/payroll', authorize(PERMISSIONS.DASHBOARD.PAYROLL), c.getPayrollStats);
/**
 * @swagger
 * /dashboard/statistics/employees:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get employee statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/statistics/employees', authorize(PERMISSIONS.DASHBOARD.HR), c.getEmployeeStats);

export default router;
