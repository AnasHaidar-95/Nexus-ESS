import { Router } from 'express';
import * as c from './notification.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listNotificationsSchema,
  updateNotificationSchema,
  notificationIdParamSchema,
  createNotificationSchema,
} from './notification.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: List current user's notifications
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
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INFO, WARNING, SUCCESS, ERROR, LEAVE_APPROVED, LEAVE_REJECTED, PAYROLL_READY, DOCUMENT_REQUEST, ANNOUNCEMENT]
 *         description: Filter by notification type
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.NOTIFICATIONS.READ),
  validate(listNotificationsSchema),
  c.listMyNotifications,
);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', authorize(PERMISSIONS.NOTIFICATIONS.READ), c.getUnreadCount);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     tags: [Notifications]
 *     summary: Create a notification
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *               message:
 *                 type: string
 *                 minLength: 1
 *               type:
 *                 type: string
 *                 enum: [INFO, WARNING, SUCCESS, ERROR, LEAVE_APPROVED, LEAVE_REJECTED, PAYROLL_READY, DOCUMENT_REQUEST, ANNOUNCEMENT]
 *                 default: INFO
 *               metadata:
 *                 type: object
 *                 description: Any additional data
 *     responses:
 *       201:
 *         description: Notification created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.NOTIFICATIONS.CREATE),
  validate(createNotificationSchema),
  c.createNotification,
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   post:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 */
router.post('/read-all', authorize(PERMISSIONS.NOTIFICATIONS.MARK_ALL_READ), c.markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification UUID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/:id/read',
  authorize(PERMISSIONS.NOTIFICATIONS.MARK_READ),
  validate(notificationIdParamSchema),
  c.markAsRead,
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     tags: [Notifications]
 *     summary: Update a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.NOTIFICATIONS.UPDATE),
  validate(updateNotificationSchema),
  c.markAsRead,
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Notification UUID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.NOTIFICATIONS.DELETE),
  validate(notificationIdParamSchema),
  c.deleteNotification,
);

export default router;
