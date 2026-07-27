import { Router } from 'express';
import { authenticate } from '../../core/middleware/authenticate.js';
import { authorize } from '../../core/middleware/authorize.js';
import { validate } from '../../core/middleware/validate.js';
import { PERMISSIONS } from '../../core/constants/permissions.js';
import multer from 'multer';
import * as schema from './applicant.schema.js';
import * as controller from './applicant.controller.js';

const router = Router();
const upload = multer({
  dest: 'uploads/tmp/',
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    cb(null, allowed.includes(ext));
  },
});

// Applicant self-service

/**
 * @swagger
 * /applicants/profile:
 *   get:
 *     tags: [Applicants]
 *     summary: Get applicant profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Applicant profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, controller.getProfile);

/**
 * @swagger
 * /applicants/profile:
 *   patch:
 *     tags: [Applicants]
 *     summary: Update applicant profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: First name
 *               middleName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Middle name
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 500
 *                 description: Last name
 *               preferredName:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Preferred name
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Date of birth (YYYY-MM-DD)
 *               gender:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 description: Gender
 *               nationalId:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: National ID number
 *               passportNumber:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Passport number
 *               phone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 description: Phone number
 *               alternatePhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 description: Alternate phone number
 *               addressLine1:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 description: Address line 1
 *               addressLine2:
 *                 type: string
 *                 maxLength: 255
 *                 nullable: true
 *                 description: Address line 2
 *               city:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: City
 *               state:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: State or province
 *               postalCode:
 *                 type: string
 *                 maxLength: 20
 *                 nullable: true
 *                 description: Postal code
 *               country:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Country
 *               emergencyContactName:
 *                 type: string
 *                 maxLength: 150
 *                 nullable: true
 *                 description: Emergency contact name
 *               emergencyContactPhone:
 *                 type: string
 *                 maxLength: 50
 *                 nullable: true
 *                 description: Emergency contact phone
 *               emergencyContactRelationship:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Emergency contact relationship
 *     responses:
 *       200:
 *         description: Applicant profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/profile',
  authenticate,
  validate(schema.updateApplicantProfileSchema),
  controller.updateProfile,
);

/**
 * @swagger
 * /applicants/submit:
 *   post:
 *     tags: [Applicants]
 *     summary: Submit applicant application
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/submit', authenticate, controller.submit);

/**
 * @swagger
 * /applicants/documents:
 *   post:
 *     tags: [Applicants]
 *     summary: Upload applicant document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Accepted: pdf, doc, docx, png, jpg, jpeg. Max 10MB."
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/documents', authenticate, upload.single('file'), controller.uploadDoc);

/**
 * @swagger
 * /applicants/documents/{id}:
 *   delete:
 *     tags: [Applicants]
 *     summary: Delete applicant document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document UUID
 *     responses:
 *       200:
 *         description: Document deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.delete('/documents/:id', authenticate, controller.deleteDoc);

/**
 * @swagger
 * /applicants/documents/{id}/download:
 *   get:
 *     tags: [Applicants]
 *     summary: Download applicant document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Document UUID
 *     responses:
 *       200:
 *         description: Document downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Document not found
 */
router.get('/documents/:id/download', authenticate, controller.downloadApplicantDocument);

// HR Manager endpoints

/**
 * @swagger
 * /applicants:
 *   get:
 *     tags: [Applicants]
 *     summary: List all applicants
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field (prefix with - for descending)
 *     responses:
 *       200:
 *         description: Applicants retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  authorize(PERMISSIONS.APPLICANTS.READ),
  validate(schema.listApplicantsSchema),
  controller.list,
);

/**
 * @swagger
 * /applicants/{id}:
 *   get:
 *     tags: [Applicants]
 *     summary: Get applicant detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Applicant UUID
 *     responses:
 *       200:
 *         description: Applicant detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.get('/:id', authenticate, authorize(PERMISSIONS.APPLICANTS.READ), controller.getDetail);

/**
 * @swagger
 * /applicants/{id}/approve:
 *   post:
 *     tags: [Applicants]
 *     summary: Approve an applicant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Applicant UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeNumber, departmentId, positionId, hireDate]
 *             properties:
 *               employeeNumber:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 30
 *                 description: Employee number
 *               departmentId:
 *                 type: string
 *                 format: uuid
 *                 description: Department UUID
 *               positionId:
 *                 type: string
 *                 format: uuid
 *                 description: Position UUID
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional shift UUID
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: Hire date (YYYY-MM-DD)
 *               employmentType:
 *                 type: string
 *                 enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN, TEMPORARY]
 *                 default: FULL_TIME
 *                 description: Employment type
 *               basicSalary:
 *                 type: number
 *                 minimum: 0
 *                 description: Basic salary amount
 *               housingAllowance:
 *                 type: number
 *                 minimum: 0
 *                 description: Housing allowance amount
 *               transportAllowance:
 *                 type: number
 *                 minimum: 0
 *                 description: Transport allowance amount
 *     responses:
 *       200:
 *         description: Applicant approved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.post(
  '/:id/approve',
  authenticate,
  authorize(PERMISSIONS.APPLICANTS.APPROVE),
  validate(schema.approveApplicantSchema),
  controller.approve,
);

/**
 * @swagger
 * /applicants/{id}/reject:
 *   post:
 *     tags: [Applicants]
 *     summary: Reject an applicant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Applicant UUID
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
 *                 description: Rejection reason (at least 5 characters)
 *     responses:
 *       200:
 *         description: Applicant rejected successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Applicant not found
 */
router.post(
  '/:id/reject',
  authenticate,
  authorize(PERMISSIONS.APPLICANTS.REJECT),
  validate(schema.rejectApplicantSchema),
  controller.reject,
);

export default router;
