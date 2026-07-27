import { Router } from 'express';
import * as c from './category.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import {
  listCategoriesSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from './category.schema.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /document-categories:
 *   get:
 *     tags: [Document Categories]
 *     summary: List all document categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
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
 *           maxLength: 500
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
 *           default: 'name'
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of document categories
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.DOCUMENTS.READ),
  validate(listCategoriesSchema),
  c.listCategories,
);

/**
 * @swagger
 * /document-categories/{id}:
 *   get:
 *     tags: [Document Categories]
 *     summary: Get a document category by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Document category details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.DOCUMENTS.READ),
  validate(categoryIdParamSchema),
  c.getCategory,
);

/**
 * @swagger
 * /document-categories:
 *   post:
 *     tags: [Document Categories]
 *     summary: Create a new document category
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.DOCUMENTS.UPLOAD),
  validate(createCategorySchema),
  c.createCategory,
);

/**
 * @swagger
 * /document-categories/{id}:
 *   patch:
 *     tags: [Document Categories]
 *     summary: Update a document category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
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
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.DOCUMENTS.UPLOAD),
  validate(updateCategorySchema),
  c.updateCategory,
);

/**
 * @swagger
 * /document-categories/{id}/activate:
 *   patch:
 *     tags: [Document Categories]
 *     summary: Activate a document category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category activated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.patch(
  '/:id/activate',
  authorize(PERMISSIONS.DOCUMENTS.UPLOAD),
  validate(categoryIdParamSchema),
  c.activateCategory,
);

/**
 * @swagger
 * /document-categories/{id}/deactivate:
 *   patch:
 *     tags: [Document Categories]
 *     summary: Deactivate a document category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deactivated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Category not found
 */
router.patch(
  '/:id/deactivate',
  authorize(PERMISSIONS.DOCUMENTS.UPLOAD),
  validate(categoryIdParamSchema),
  c.deactivateCategory,
);

export default router;
