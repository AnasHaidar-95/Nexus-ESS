import { Router } from 'express';
import * as c from './performance-review.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listPerformanceReviewsSchema,
  createPerformanceReviewSchema,
  updatePerformanceReviewSchema,
  performanceReviewIdParamSchema,
} from './performance-review.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /performance-reviews:
 *   get:
 *     tags: [Performance Reviews]
 *     summary: List all performance reviews
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
 *         name: cycle
 *         schema:
 *           type: string
 *         description: Filter by review cycle
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SUBMITTED, ACKNOWLEDGED, COMPLETED]
 *         description: Filter by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: Performance reviews retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.READ),
  validate(listPerformanceReviewsSchema),
  c.listPerformanceReviews,
);

/**
 * @swagger
 * /performance-reviews/{id}:
 *   get:
 *     tags: [Performance Reviews]
 *     summary: Get a performance review by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review UUID
 *     responses:
 *       200:
 *         description: Performance review retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Performance review not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.READ),
  validate(performanceReviewIdParamSchema),
  c.getPerformanceReview,
);

/**
 * @swagger
 * /performance-reviews:
 *   post:
 *     tags: [Performance Reviews]
 *     summary: Create a new performance review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, cycle]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: Employee UUID
 *               reviewerId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional reviewer UUID
 *               cycle:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Review cycle name
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 nullable: true
 *                 description: Rating from 1 to 5
 *               goals:
 *                 type: object
 *                 description: Any JSON structure for goals
 *               comments:
 *                 type: string
 *                 maxLength: 5000
 *                 nullable: true
 *                 description: Review comments
 *     responses:
 *       201:
 *         description: Performance review created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.CREATE),
  validate(createPerformanceReviewSchema),
  c.createPerformanceReview,
);

/**
 * @swagger
 * /performance-reviews/{id}:
 *   patch:
 *     tags: [Performance Reviews]
 *     summary: Update a performance review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 nullable: true
 *                 description: Rating from 1 to 5
 *               goals:
 *                 type: object
 *                 description: Any JSON structure for goals
 *               comments:
 *                 type: string
 *                 maxLength: 5000
 *                 nullable: true
 *                 description: Review comments
 *     responses:
 *       200:
 *         description: Performance review updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Performance review not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.UPDATE),
  validate(updatePerformanceReviewSchema),
  c.updatePerformanceReview,
);

/**
 * @swagger
 * /performance-reviews/{id}/submit:
 *   post:
 *     tags: [Performance Reviews]
 *     summary: Submit a performance review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review UUID
 *     responses:
 *       200:
 *         description: Performance review submitted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Performance review not found
 */
router.post(
  '/:id/submit',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.SUBMIT),
  validate(performanceReviewIdParamSchema),
  c.submitPerformanceReview,
);

/**
 * @swagger
 * /performance-reviews/{id}/acknowledge:
 *   post:
 *     tags: [Performance Reviews]
 *     summary: Acknowledge a performance review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review UUID
 *     responses:
 *       200:
 *         description: Performance review acknowledged successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Performance review not found
 */
router.post(
  '/:id/acknowledge',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.ACKNOWLEDGE),
  validate(performanceReviewIdParamSchema),
  c.acknowledgePerformanceReview,
);

/**
 * @swagger
 * /performance-reviews/{id}/complete:
 *   post:
 *     tags: [Performance Reviews]
 *     summary: Complete a performance review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Performance review UUID
 *     responses:
 *       200:
 *         description: Performance review completed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Performance review not found
 */
router.post(
  '/:id/complete',
  authorize(PERMISSIONS.PERFORMANCE_REVIEWS.COMPLETE),
  validate(performanceReviewIdParamSchema),
  c.completePerformanceReview,
);

export default router;
