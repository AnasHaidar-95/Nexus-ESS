import { Router } from 'express';
import * as c from './leave-request.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listLeaveRequestsSchema,
  createLeaveRequestSchema,
  updateLeaveRequestSchema,
  leaveRequestIdParamSchema,
  approveSchema,
  rejectSchema,
  cancelLeaveRequestSchema,
} from './leave-request.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/leave-requests:
 *   get:
 *     tags: [Leave Requests]
 *     summary: List all leave requests
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
 *         description: Items per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee UUID
 *       - in: query
 *         name: leaveTypeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by leave type UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *         description: Filter by status
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (inclusive)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (inclusive)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of leave requests
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.LEAVE_REQUESTS.READ),
  validate(listLeaveRequestsSchema),
  c.listLeaveRequests,
);

/**
 * @swagger
 * /api/leave-requests/my:
 *   get:
 *     tags: [Leave Requests]
 *     summary: Get current user's leave requests
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's leave requests
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authorize(PERMISSIONS.LEAVE_REQUESTS.READ), c.getMyLeaveRequests);

/**
 * @swagger
 * /api/leave-requests/{id}/approval-steps:
 *   get:
 *     tags: [Leave Requests]
 *     summary: Get approval steps for a leave request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     responses:
 *       200:
 *         description: Approval steps list
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.get(
  '/:id/approval-steps',
  authorize(PERMISSIONS.LEAVE_REQUESTS.READ),
  validate(leaveRequestIdParamSchema),
  c.getApprovalSteps,
);

/**
 * @swagger
 * /api/leave-requests/{id}:
 *   get:
 *     tags: [Leave Requests]
 *     summary: Get a leave request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     responses:
 *       200:
 *         description: Leave request found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.LEAVE_REQUESTS.READ),
  validate(leaveRequestIdParamSchema),
  c.getLeaveRequest,
);

/**
 * @swagger
 * /api/leave-requests:
 *   post:
 *     tags: [Leave Requests]
 *     summary: Create a new leave request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, leaveTypeId, startDate, endDate, totalDays, reason]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               leaveTypeId:
 *                 type: string
 *                 format: uuid
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Must be on or after startDate
 *               totalDays:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 365
 *               reason:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Leave request created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.LEAVE_REQUESTS.CREATE),
  validate(createLeaveRequestSchema),
  c.createLeaveRequest,
);

/**
 * @swagger
 * /api/leave-requests/{id}:
 *   patch:
 *     tags: [Leave Requests]
 *     summary: Update a leave request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               totalDays:
 *                 type: number
 *                 minimum: 0.5
 *                 maximum: 365
 *               reason:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: Leave request updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.LEAVE_REQUESTS.UPDATE),
  validate(updateLeaveRequestSchema),
  c.updateLeaveRequest,
);

/**
 * @swagger
 * /api/leave-requests/{id}/cancel:
 *   post:
 *     tags: [Leave Requests]
 *     summary: Cancel a leave request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     responses:
 *       200:
 *         description: Leave request cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.post(
  '/:id/cancel',
  authorize(PERMISSIONS.LEAVE_REQUESTS.CANCEL),
  validate(cancelLeaveRequestSchema),
  c.cancelLeaveRequest,
);

/**
 * @swagger
 * /api/leave-requests/{id}/approve:
 *   post:
 *     tags: [Leave Requests]
 *     summary: Approve a leave request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     responses:
 *       200:
 *         description: Leave request approved
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.LEAVE_REQUESTS.APPROVE),
  validate(approveSchema),
  c.approveLeaveRequest,
);

/**
 * @swagger
 * /api/leave-requests/{id}/reject:
 *   post:
 *     tags: [Leave Requests]
 *     summary: Reject a leave request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Leave request UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 2000
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Leave request rejected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Leave request not found
 */
router.post(
  '/:id/reject',
  authorize(PERMISSIONS.LEAVE_REQUESTS.REJECT),
  validate(rejectSchema),
  c.rejectLeaveRequest,
);

export default router;
