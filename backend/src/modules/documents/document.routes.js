import { Router } from 'express';
import * as c from './document.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import { uploadDocument as multerUpload } from '../../core/utils/file-upload.js';
import {
  listDocumentsSchema,
  uploadDocumentSchema,
  updateDocumentSchema,
  documentIdParamSchema,
} from './document.schema.js';

const router = Router();

router.use(authenticate);

// Read Operations

/**
 * @swagger
 * /documents:
 *   get:
 *     tags: [Documents]
 *     summary: List all documents
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
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by employee ID
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by category ID
 *       - in: query
 *         name: isConfidential
 *         schema:
 *           type: boolean
 *         description: Filter by confidential status
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED]
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 500
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-uploadedAt'
 *         description: Sort field (prefix '-' for descending)
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authorize(PERMISSIONS.DOCUMENTS.READ),
  validate(listDocumentsSchema),
  c.listDocuments,
);

/**
 * @swagger
 * /documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get a document by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.get(
  '/:id',
  authorize(PERMISSIONS.DOCUMENTS.READ),
  validate(documentIdParamSchema),
  c.getDocument,
);

/**
 * @swagger
 * /documents/{id}/download:
 *   get:
 *     tags: [Documents]
 *     summary: Download a document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document file stream
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.get(
  '/:id/download',
  authorize(PERMISSIONS.DOCUMENTS.DOWNLOAD),
  validate(documentIdParamSchema),
  c.downloadDocument,
);

/**
 * @swagger
 * /documents:
 *   post:
 *     tags: [Documents]
 *     summary: Upload a new document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - employeeId
 *               - categoryId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Document file to upload
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isConfidential:
 *                 type: boolean
 *                 default: false
 *               expiresAt:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Document uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authorize(PERMISSIONS.DOCUMENTS.UPLOAD),
  multerUpload.single('file'),
  validate(uploadDocumentSchema),
  c.uploadDocument,
);

/**
 * @swagger
 * /documents/{id}:
 *   patch:
 *     tags: [Documents]
 *     summary: Update document metadata
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *               isConfidential:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Document updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.DOCUMENTS.UPDATE),
  validate(updateDocumentSchema),
  c.updateDocument,
);

// Lifecycle Operations

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Archive a document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document archived
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.DOCUMENTS.DELETE),
  validate(documentIdParamSchema),
  c.archiveDocument,
);

export default router;
