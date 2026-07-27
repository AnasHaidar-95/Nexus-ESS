import { Router } from 'express';
import * as c from './holiday.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listHolidaysSchema,
  createHolidaySchema,
  updateHolidaySchema,
  holidayIdParamSchema,
  calendarYearParamSchema,
} from './holiday.schema.js';

const router = Router();

router.use(authenticate);

// Read Operations

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     tags: [Holidays]
 *     summary: List all holidays
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
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         description: Filter by year
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [PUBLIC, COMPANY, REGIONAL, RELIGIOUS, SPECIAL]
 *         description: Filter by holiday type
 *       - in: query
 *         name: isRecurring
 *         schema:
 *           type: boolean
 *         description: Filter by recurring flag
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: date
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of holidays
 *       401:
 *         description: Unauthorized
 */
router.get('/', authorize(PERMISSIONS.HOLIDAYS.READ), validate(listHolidaysSchema), c.listHolidays);

/**
 * @swagger
 * /api/holidays/calendar/{year}:
 *   get:
 *     tags: [Holidays]
 *     summary: Get holiday calendar for a given year
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *         description: Calendar year
 *     responses:
 *       200:
 *         description: Calendar year holidays
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/calendar/:year',
  authorize(PERMISSIONS.HOLIDAYS.READ),
  validate(calendarYearParamSchema),
  c.getCalendar,
);

/**
 * @swagger
 * /api/holidays/{id}:
 *   get:
 *     tags: [Holidays]
 *     summary: Get a holiday by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Holiday UUID
 *     responses:
 *       200:
 *         description: Holiday found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holiday not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.HOLIDAYS.READ),
  validate(holidayIdParamSchema),
  c.getHoliday,
);

// Write Operations

/**
 * @swagger
 * /api/holidays:
 *   post:
 *     tags: [Holidays]
 *     summary: Create a new holiday
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, date]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [PUBLIC, COMPANY, REGIONAL, RELIGIOUS, SPECIAL]
 *                 default: PUBLIC
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               region:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isPaid:
 *                 type: boolean
 *                 default: true
 *               isRecurring:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Holiday created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.HOLIDAYS.CREATE),
  validate(createHolidaySchema),
  c.createHoliday,
);

/**
 * @swagger
 * /api/holidays/{id}:
 *   patch:
 *     tags: [Holidays]
 *     summary: Update a holiday
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Holiday UUID
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
 *                 maxLength: 150
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [PUBLIC, COMPANY, REGIONAL, RELIGIOUS, SPECIAL]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               region:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isPaid:
 *                 type: boolean
 *               isRecurring:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Holiday updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holiday not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.HOLIDAYS.UPDATE),
  validate(updateHolidaySchema),
  c.updateHoliday,
);

// Lifecycle Operations

/**
 * @swagger
 * /api/holidays/{id}/activate:
 *   patch:
 *     tags: [Holidays]
 *     summary: Activate a holiday
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Holiday UUID
 *     responses:
 *       200:
 *         description: Holiday activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holiday not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.HOLIDAYS.MANAGE),
  validate(holidayIdParamSchema),
  c.activateHoliday,
);

/**
 * @swagger
 * /api/holidays/{id}/deactivate:
 *   patch:
 *     tags: [Holidays]
 *     summary: Deactivate a holiday
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Holiday UUID
 *     responses:
 *       200:
 *         description: Holiday deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Holiday not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.HOLIDAYS.MANAGE),
  validate(holidayIdParamSchema),
  c.deactivateHoliday,
);

export default router;
