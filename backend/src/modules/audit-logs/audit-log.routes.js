import { Router } from 'express';
import * as c from './audit-log.controller.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /audit-logs:
 *   get:
 *     tags: [Audit Logs]
 *     summary: List all audit logs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.AUDIT.READ), c.listAuditLogs);

/**
 * @swagger
 * /audit-logs/user/{userId}:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Get audit logs by user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/user/:userId', authorize(PERMISSIONS.AUDIT.READ), c.getAuditLogsByUser);

/**
 * @swagger
 * /audit-logs/entity/{entity}:
 *   get:
 *     tags: [Audit Logs]
 *     summary: Get audit logs by entity type
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entity
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity type
 *     responses:
 *       200:
 *         description: Entity audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/entity/:entity', authorize(PERMISSIONS.AUDIT.READ), c.getAuditLogsByEntity);

/**
 * @swagger
 * /audit-logs:
 *   post:
 *     tags: [Audit Logs]
 *     summary: Create an audit log entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Audit log created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize(PERMISSIONS.AUDIT.CREATE), c.createAuditLog);

export default router;
