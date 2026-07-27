import { Router } from 'express';
import * as c from './position.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listPositionsSchema,
  createPositionSchema,
  updatePositionSchema,
  positionIdParamSchema,
  listPositionEmployeesSchema,
} from './position.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/positions:
 *   get:
 *     tags: [Positions]
 *     summary: List all positions
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
 *         description: Items per page
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
 *         description: Filter by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: name
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of positions
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.POSITIONS.READ),
  validate(listPositionsSchema),
  c.listPositions,
);
/**
 * @swagger
 * /api/positions/{id}:
 *   get:
 *     tags: [Positions]
 *     summary: Get position by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Position not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.POSITIONS.READ),
  validate(positionIdParamSchema),
  c.getPosition,
);
/**
 * @swagger
 * /api/positions:
 *   post:
 *     tags: [Positions]
 *     summary: Create a new position
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 150
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               grade:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Position created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.POSITIONS.CREATE),
  validate(createPositionSchema),
  c.createPosition,
);
/**
 * @swagger
 * /api/positions/{id}:
 *   patch:
 *     tags: [Positions]
 *     summary: Update a position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Position ID
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
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               grade:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *               parentId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Position updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Position not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.POSITIONS.UPDATE),
  validate(updatePositionSchema),
  c.updatePosition,
);
/**
 * @swagger
 * /api/positions/{id}/activate:
 *   patch:
 *     tags: [Positions]
 *     summary: Activate a position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Position not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.POSITIONS.MANAGE),
  validate(positionIdParamSchema),
  c.activatePosition,
);
/**
 * @swagger
 * /api/positions/{id}/deactivate:
 *   patch:
 *     tags: [Positions]
 *     summary: Deactivate a position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Position ID
 *     responses:
 *       200:
 *         description: Position deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Position not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.POSITIONS.MANAGE),
  validate(positionIdParamSchema),
  c.deactivatePosition,
);
/**
 * @swagger
 * /api/positions/{id}/employees:
 *   get:
 *     tags: [Positions]
 *     summary: List employees in a position
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Position ID
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
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: includeArchived
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include archived employees
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: employeeNumber
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: List of position employees
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Position not found
 */
router.get(
  '/:id/employees',
  authorize(PERMISSIONS.POSITIONS.READ),
  validate(listPositionEmployeesSchema),
  c.listPositionEmployees,
);

export default router;
