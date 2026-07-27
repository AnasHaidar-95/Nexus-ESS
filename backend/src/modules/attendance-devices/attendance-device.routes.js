import { Router } from 'express';
import * as c from './attendance-device.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listDevicesSchema,
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdParamSchema,
} from './attendance-device.schema.js';

const router = Router();
router.use(authenticate);

/**
 * @swagger
 * /attendance-devices:
 *   get:
 *     tags: [Attendance Devices]
 *     summary: List all attendance devices
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by device status
 *       - in: query
 *         name: connectionStatus
 *         schema:
 *           type: string
 *           enum: [ONLINE, OFFLINE, SYNCHRONIZING, ERROR, MAINTENANCE]
 *         description: Filter by connection status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: string
 *         description: Filter by manufacturer
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (default '-createdAt')
 *     responses:
 *       200:
 *         description: List of attendance devices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.READ),
  validate(listDevicesSchema),
  c.listDevices,
);

/**
 * @swagger
 * /attendance-devices/{id}:
 *   get:
 *     tags: [Attendance Devices]
 *     summary: Get an attendance device by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Attendance device retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.READ),
  validate(deviceIdParamSchema),
  c.getDevice,
);

/**
 * @swagger
 * /attendance-devices:
 *   post:
 *     tags: [Attendance Devices]
 *     summary: Create a new attendance device
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [deviceCode, deviceName, deviceType, manufacturer, serialNumber, ipAddress, port, location]
 *             properties:
 *               deviceCode:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 pattern: "^[A-Z0-9_-]+$"
 *               deviceName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               deviceType:
 *                 type: string
 *                 enum: [FINGERPRINT, FACE_RECOGNITION, RFID, QR_CODE, MOBILE]
 *               manufacturer:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               model:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               serialNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               ipAddress:
 *                 type: string
 *                 minLength: 7
 *                 maxLength: 45
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *               location:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *     responses:
 *       201:
 *         description: Attendance device created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.CREATE),
  validate(createDeviceSchema),
  c.createDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}:
 *   patch:
 *     tags: [Attendance Devices]
 *     summary: Update an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               location:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *               ipAddress:
 *                 type: string
 *                 minLength: 7
 *                 maxLength: 45
 *               port:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 65535
 *               manufacturer:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               model:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Attendance device updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.UPDATE),
  validate(updateDeviceSchema),
  c.updateDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}:
 *   delete:
 *     tags: [Attendance Devices]
 *     summary: Deactivate an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Attendance device deactivated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.DELETE),
  validate(deviceIdParamSchema),
  c.deactivateDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}/activate:
 *   patch:
 *     tags: [Attendance Devices]
 *     summary: Activate an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Attendance device activated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.ACTIVATE),
  validate(deviceIdParamSchema),
  c.activateDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}/test:
 *   post:
 *     tags: [Attendance Devices]
 *     summary: Test connection to an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device test completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.post(
  '/:id/test',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.TEST),
  validate(deviceIdParamSchema),
  c.testDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}/sync:
 *   post:
 *     tags: [Attendance Devices]
 *     summary: Sync data from an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device synced successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.post(
  '/:id/sync',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.SYNC),
  validate(deviceIdParamSchema),
  c.syncDevice,
);

/**
 * @swagger
 * /attendance-devices/{id}/logs:
 *   get:
 *     tags: [Attendance Devices]
 *     summary: Get logs for an attendance device
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Device not found
 */
router.get(
  '/:id/logs',
  authorize(PERMISSIONS.ATTENDANCE_DEVICES.READ),
  validate(deviceIdParamSchema),
  c.getDeviceLogs,
);

export default router;
