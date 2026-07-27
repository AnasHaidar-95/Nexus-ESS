import { Router } from 'express';
import * as c from './attendance-incident.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listIncidentsSchema,
  incidentIdParamSchema,
  createIncidentSchema,
  updateIncidentSchema,
  resolveIncidentSchema,
  rejectIncidentSchema,
  addCommentSchema,
} from './attendance-incident.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /attendance-incidents:
 *   get:
 *     tags: [Attendance Incidents]
 *     summary: List all attendance incidents
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
 *         name: recordId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by attendance record ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, APPROVED, REJECTED, RESOLVED, CANCELLED]
 *         description: Filter by incident status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *         description: Filter by incident severity
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [LATE_ARRIVAL, EARLY_DEPARTURE, MISSING_CHECK_IN, MISSING_CHECK_OUT, UNAUTHORIZED_ABSENCE, DEVICE_ERROR, MANUAL_CORRECTION]
 *         description: Filter by incident type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (default '-createdAt')
 *     responses:
 *       200:
 *         description: List of attendance incidents retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.READ),
  validate(listIncidentsSchema),
  c.listIncidents,
);

/**
 * @swagger
 * /attendance-incidents/{id}:
 *   get:
 *     tags: [Attendance Incidents]
 *     summary: Get an attendance incident by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     responses:
 *       200:
 *         description: Attendance incident retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.READ),
  validate(incidentIdParamSchema),
  c.getIncident,
);

/**
 * @swagger
 * /attendance-incidents:
 *   post:
 *     tags: [Attendance Incidents]
 *     summary: Create a new attendance incident
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recordId, type, description]
 *             properties:
 *               recordId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [LATE_ARRIVAL, EARLY_DEPARTURE, MISSING_CHECK_IN, MISSING_CHECK_OUT, UNAUTHORIZED_ABSENCE, DEVICE_ERROR, MANUAL_CORRECTION]
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *                 default: LOW
 *               description:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       201:
 *         description: Attendance incident created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.CREATE),
  validate(createIncidentSchema),
  c.createIncident,
);

/**
 * @swagger
 * /attendance-incidents/{id}:
 *   patch:
 *     tags: [Attendance Incidents]
 *     summary: Update an attendance incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *               description:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Attendance incident updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.UPDATE),
  validate(updateIncidentSchema),
  c.updateIncident,
);

/**
 * @swagger
 * /attendance-incidents/{id}:
 *   delete:
 *     tags: [Attendance Incidents]
 *     summary: Cancel an attendance incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     responses:
 *       200:
 *         description: Attendance incident cancelled successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.DELETE),
  validate(incidentIdParamSchema),
  c.cancelIncident,
);

/**
 * @swagger
 * /attendance-incidents/{id}/resolve:
 *   post:
 *     tags: [Attendance Incidents]
 *     summary: Resolve an attendance incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolutionNotes]
 *             properties:
 *               resolutionNotes:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Attendance incident resolved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.post(
  '/:id/resolve',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.RESOLVE),
  validate(resolveIncidentSchema),
  c.resolveIncident,
);

/**
 * @swagger
 * /attendance-incidents/{id}/reject:
 *   post:
 *     tags: [Attendance Incidents]
 *     summary: Reject an attendance incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Attendance incident rejected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.post(
  '/:id/reject',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.RESOLVE),
  validate(rejectIncidentSchema),
  c.rejectIncident,
);

/**
 * @swagger
 * /attendance-incidents/{id}/comments:
 *   post:
 *     tags: [Attendance Incidents]
 *     summary: Add a comment to an attendance incident
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Incident ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [comment]
 *             properties:
 *               comment:
 *                 type: string
 *                 minLength: 3
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Incident not found
 */
router.post(
  '/:id/comments',
  authorize(PERMISSIONS.ATTENDANCE_INCIDENTS.COMMENT),
  validate(addCommentSchema),
  c.addComment,
);

export default router;
