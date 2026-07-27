import { Router } from 'express';
import * as c from './profile-change-request.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listProfileChangeRequestsSchema,
  createProfileChangeRequestSchema,
  approveRejectSchema,
  profileChangeRequestIdParamSchema,
} from './profile-change-request.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /profile-change-requests:
 *   get:
 *     tags: [Profile Change Requests]
 *     summary: List all profile change requests
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
 *         description: Number of items per page
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee UUID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: Profile change requests retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.READ),
  validate(listProfileChangeRequestsSchema),
  c.listProfileChangeRequests,
);

/**
 * @swagger
 * /profile-change-requests/{id}:
 *   get:
 *     tags: [Profile Change Requests]
 *     summary: Get a profile change request by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile change request UUID
 *     responses:
 *       200:
 *         description: Profile change request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile change request not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.READ),
  validate(profileChangeRequestIdParamSchema),
  c.getProfileChangeRequest,
);

/**
 * @swagger
 * /profile-change-requests:
 *   post:
 *     tags: [Profile Change Requests]
 *     summary: Create a new profile change request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, field, newValue]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: Employee UUID
 *               field:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Name of the profile field to change
 *               newValue:
 *                 type: string
 *                 minLength: 1
 *                 description: Requested new value
 *     responses:
 *       201:
 *         description: Profile change request created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.CREATE),
  validate(createProfileChangeRequestSchema),
  c.createProfileChangeRequest,
);

/**
 * @swagger
 * /profile-change-requests/{id}/approve:
 *   post:
 *     tags: [Profile Change Requests]
 *     summary: Approve a profile change request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile change request UUID
 *     responses:
 *       200:
 *         description: Profile change request approved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile change request not found
 */
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.APPROVE),
  validate(profileChangeRequestIdParamSchema),
  c.approveProfileChangeRequest,
);

/**
 * @swagger
 * /profile-change-requests/{id}/reject:
 *   post:
 *     tags: [Profile Change Requests]
 *     summary: Reject a profile change request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile change request UUID
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
 *                 description: Rejection reason
 *     responses:
 *       200:
 *         description: Profile change request rejected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile change request not found
 */
router.post(
  '/:id/reject',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.REJECT),
  validate(approveRejectSchema),
  c.rejectProfileChangeRequest,
);

/**
 * @swagger
 * /profile-change-requests/{id}:
 *   delete:
 *     tags: [Profile Change Requests]
 *     summary: Delete a profile change request
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Profile change request UUID
 *     responses:
 *       200:
 *         description: Profile change request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile change request not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.PROFILE_CHANGE_REQUESTS.DELETE),
  validate(profileChangeRequestIdParamSchema),
  c.deleteProfileChangeRequest,
);

export default router;
