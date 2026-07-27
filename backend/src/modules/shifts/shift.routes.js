import { Router } from 'express';
import * as c from './shift.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listShiftsSchema,
  createShiftSchema,
  updateShiftSchema,
  shiftIdParamSchema,
} from './shift.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /shifts:
 *   get:
 *     tags: [Shifts]
 *     summary: List all shifts
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
 *         description: Search term to filter shifts by name or code
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by shift status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: name
 *         description: Sort field (default 'name')
 *     responses:
 *       200:
 *         description: List of shifts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.SHIFTS.READ), validate(listShiftsSchema), c.listShifts);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     tags: [Shifts]
 *     summary: Get a shift by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift not found
 */
router.get('/:id', authorize(PERMISSIONS.SHIFTS.READ), validate(shiftIdParamSchema), c.getShift);

/**
 * @swagger
 * /shifts:
 *   post:
 *     tags: [Shifts]
 *     summary: Create a new shift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, startTimeMinutes, endTimeMinutes]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               startTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1439
 *                 description: Minutes from midnight (0-1439)
 *               endTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1439
 *                 description: Minutes from midnight (0-1439)
 *               breakMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *               graceMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *     responses:
 *       201:
 *         description: Shift created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authorize(PERMISSIONS.SHIFTS.CREATE), validate(createShiftSchema), c.createShift);

/**
 * @swagger
 * /shifts/{id}:
 *   patch:
 *     tags: [Shifts]
 *     summary: Update a shift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
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
 *                 maxLength: 500
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               startTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1439
 *                 description: Minutes from midnight (0-1439)
 *               endTimeMinutes:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 1439
 *                 description: Minutes from midnight (0-1439)
 *               breakMinutes:
 *                 type: integer
 *                 minimum: 0
 *               graceMinutes:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.SHIFTS.UPDATE),
  validate(updateShiftSchema),
  c.updateShift,
);

/**
 * @swagger
 * /shifts/{id}/activate:
 *   patch:
 *     tags: [Shifts]
 *     summary: Activate a shift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift activated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.SHIFTS.MANAGE),
  validate(shiftIdParamSchema),
  c.activateShift,
);

/**
 * @swagger
 * /shifts/{id}/deactivate:
 *   patch:
 *     tags: [Shifts]
 *     summary: Deactivate a shift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deactivated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.SHIFTS.MANAGE),
  validate(shiftIdParamSchema),
  c.deactivateShift,
);

/**
 * @swagger
 * /shifts/{id}:
 *   delete:
 *     tags: [Shifts]
 *     summary: Delete a shift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shift not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.SHIFTS.DELETE),
  validate(shiftIdParamSchema),
  c.deactivateShift,
);

export default router;
