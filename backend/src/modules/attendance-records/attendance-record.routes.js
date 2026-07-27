import { Router } from 'express';
import * as c from './attendance-record.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listAttendanceSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  recordIdParamSchema,
} from './attendance-record.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /attendance-records:
 *   get:
 *     tags: [Attendance Records]
 *     summary: List all attendance records
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
 *         description: Items per page (default 25)
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
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, HALF_DAY, LEAVE, HOLIDAY, WEEKEND, INCOMPLETE]
 *         description: Filter by attendance status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -date
 *         description: Sort field (default '-date')
 *     responses:
 *       200:
 *         description: List of attendance records retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.ATTENDANCE.READ),
  validate(listAttendanceSchema),
  c.listRecords,
);

/**
 * @swagger
 * /attendance-records/{id}:
 *   get:
 *     tags: [Attendance Records]
 *     summary: Get an attendance record by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE.READ),
  validate(recordIdParamSchema),
  c.getRecord,
);

/**
 * @swagger
 * /attendance-records:
 *   post:
 *     tags: [Attendance Records]
 *     summary: Create a new attendance record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, date]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               checkOutTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Must be after checkInTime
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               correctionReason:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isManualEntry:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.ATTENDANCE.CREATE),
  validate(createAttendanceSchema),
  c.createRecord,
);

/**
 * @swagger
 * /attendance-records/{id}:
 *   patch:
 *     tags: [Attendance Records]
 *     summary: Update an attendance record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correctionReason]
 *             properties:
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               checkOutTime:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               correctionReason:
 *                 type: string
 *                 minLength: 5
 *                 description: Required for updates
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Attendance record not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE.CORRECT),
  validate(updateAttendanceSchema),
  c.updateRecord,
);

export default router;
