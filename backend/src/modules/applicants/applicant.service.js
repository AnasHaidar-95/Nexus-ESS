import { prisma } from '../../core/utils/prisma.js';
import { AppError } from '../../core/errors/app-error.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const employeeAudit = createAuditLogger('HR', 'employees');
const applicantAudit = createAuditLogger('HR', 'applicant_profiles');
import { createNotification } from '../notifications/notification.service.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, '../../../uploads/applicant-docs');

export const getOwnApplicantProfile = async (userId) => {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
    include: { documents: { orderBy: { uploadedAt: 'desc' } } },
  });
  if (!profile) throw new AppError('Applicant profile not found.', 404, 'NOT_FOUND');
  return profile;
};

const buildUpdateData = (body) => {
  const fields = [
    'firstName',
    'middleName',
    'lastName',
    'preferredName',
    'dateOfBirth',
    'gender',
    'nationalId',
    'passportNumber',
    'phone',
    'alternatePhone',
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'postalCode',
    'country',
    'emergencyContactName',
    'emergencyContactPhone',
    'emergencyContactRelationship',
  ];
  const data = {};
  for (const f of fields) {
    if (f in body) data[f] = body[f] || null;
  }
  return data;
};

const EMPLOYEE_SYNC_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'preferredName',
  'dateOfBirth',
  'gender',
  'nationalId',
  'passportNumber',
  'phone',
  'alternatePhone',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelationship',
];

export const updateOwnApplicantProfile = async (userId, body) => {
  const profile = await prisma.applicantProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Applicant profile not found.', 404, 'NOT_FOUND');
  if (profile.submittedAt)
    throw new AppError('Profile already submitted for approval.', 400, 'ALREADY_SUBMITTED');

  const data = buildUpdateData(body);
  const updatedProfile = await prisma.applicantProfile.update({ where: { userId }, data });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { employeeId: true },
  });
  if (user?.employeeId) {
    const employeeData = {};
    for (const f of EMPLOYEE_SYNC_FIELDS) {
      if (f in body) employeeData[f] = body[f] || null;
    }
    if (Object.keys(employeeData).length > 0) {
      await prisma.employee.update({ where: { id: user.employeeId }, data: employeeData });
    }
  }

  return updatedProfile;
};

export const submitForApproval = async (userId) => {
  const profile = await prisma.applicantProfile.findUnique({
    where: { userId },
    include: { documents: true },
  });
  if (!profile) throw new AppError('Applicant profile not found.', 404, 'NOT_FOUND');
  if (profile.submittedAt)
    throw new AppError('Already submitted for approval.', 400, 'ALREADY_SUBMITTED');

  const requiredFields = ['firstName', 'lastName', 'phone'];
  for (const f of requiredFields) {
    if (!profile[f]) throw new AppError(`Missing required field: ${f}`, 400, 'VALIDATION_ERROR');
  }
  if (profile.documents.length === 0) {
    throw new AppError(
      'At least one document (CV or certificate) must be uploaded before submission.',
      400,
      'VALIDATION_ERROR',
    );
  }

  return prisma.applicantProfile.update({
    where: { userId },
    data: { submittedAt: new Date() },
  });
};

export const uploadDocument = async (userId, file) => {
  if (!file) throw new AppError('No file provided.', 400, 'VALIDATION_ERROR');

  const profile = await prisma.applicantProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Applicant profile not found.', 404, 'NOT_FOUND');
  if (profile.submittedAt)
    throw new AppError(
      'Profile already submitted. Cannot upload additional documents.',
      400,
      'ALREADY_SUBMITTED',
    );

  const ext = path.extname(file.originalname);
  const storedFilename = `${userId}-${Date.now()}${ext}`;
  const storagePath = path.join(UPLOAD_DIR, storedFilename);

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.rename(file.path, storagePath);

  try {
    const doc = await prisma.applicantDocument.create({
      data: {
        applicantId: profile.id,
        category: file.category || 'CV',
        originalFilename: file.originalname,
        storedFilename,
        storagePath,
        mimeType: file.mimetype,
        fileSizeBytes: file.size,
      },
    });
    return doc;
  } catch (err) {
    try {
      await fs.unlink(storagePath);
    } catch {
      /* ignore cleanup errors */
    }
    throw err;
  }
};

export const deleteDocument = async (userId, docId) => {
  const profile = await prisma.applicantProfile.findUnique({ where: { userId } });
  if (!profile) throw new AppError('Applicant profile not found.', 404, 'NOT_FOUND');

  const doc = await prisma.applicantDocument.findFirst({
    where: { id: docId, applicantId: profile.id },
  });
  if (!doc) throw new AppError('Document not found.', 404, 'NOT_FOUND');

  await prisma.applicantDocument.delete({ where: { id: docId } });
  try {
    await fs.unlink(doc.storagePath);
  } catch {
    /* ignore cleanup errors */
  }
};

export const getApplicantDocumentById = async (docId) => {
  const doc = await prisma.applicantDocument.findUnique({ where: { id: docId } });
  if (!doc) throw new AppError('Document not found.', 404, 'NOT_FOUND');
  return doc;
};

export const listApplicants = async ({ page, pageSize, search, sort }) => {
  const where = {};
  if (search) {
    where.OR = [
      { user: { email: { contains: search, mode: 'insensitive' } } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy = sort?.startsWith('-')
    ? { [sort.slice(1)]: 'desc' }
    : { [sort || 'createdAt']: 'asc' };

  const [rows, total] = await Promise.all([
    prisma.applicantProfile.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: { select: { id: true, email: true, status: true, createdAt: true } },
        documents: {
          select: {
            id: true,
            category: true,
            originalFilename: true,
            fileSizeBytes: true,
            uploadedAt: true,
          },
        },
      },
    }),
    prisma.applicantProfile.count({ where }),
  ]);

  return {
    data: rows,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
};

export const getApplicantDetail = async (id) => {
  const profile = await prisma.applicantProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, status: true, roleId: true, createdAt: true } },
      documents: { orderBy: { uploadedAt: 'desc' } },
    },
  });
  if (!profile) throw new AppError('Applicant not found.', 404, 'NOT_FOUND');
  return profile;
};

export const approveApplicant = async (
  applicantId,
  {
    employeeNumber,
    departmentId,
    positionId,
    shiftId,
    hireDate,
    employmentType,
    basicSalary,
    housingAllowance,
    transportAllowance,
  },
  reviewerId,
) => {
  const profile = await prisma.applicantProfile.findUnique({
    where: { id: applicantId },
    include: { documents: true, user: { include: { employee: true } } },
  });
  if (!profile) throw new AppError('Applicant not found.', 404, 'NOT_FOUND');
  if (profile.user.status !== 'PENDING_APPROVAL') {
    throw new AppError('User is not in pending approval status.', 400, 'INVALID_STATUS');
  }

  let targetEmployeeId = profile.user.employee?.id;

  return prisma.$transaction(async (tx) => {
    let employee;
    const profileFields = {
      preferredName: profile.preferredName || null,
      gender: profile.gender || null,
      dateOfBirth: profile.dateOfBirth || null,
      nationalId: profile.nationalId || null,
      passportNumber: profile.passportNumber || null,
      phone: profile.phone || null,
      alternatePhone: profile.alternatePhone || null,
      addressLine1: profile.addressLine1 || null,
      addressLine2: profile.addressLine2 || null,
      city: profile.city || null,
      state: profile.state || null,
      postalCode: profile.postalCode || null,
      country: profile.country || null,
      emergencyContactName: profile.emergencyContactName || null,
      emergencyContactPhone: profile.emergencyContactPhone || null,
      emergencyContactRelationship: profile.emergencyContactRelationship || null,
    };

    if (targetEmployeeId) {
      const existingByNumber = await tx.employee.findUnique({ where: { employeeNumber } });
      if (existingByNumber && existingByNumber.id !== targetEmployeeId) {
        throw new AppError('Employee number already exists.', 409, 'CONFLICT');
      }

      employee = await tx.employee.update({
        where: { id: targetEmployeeId },
        data: {
          ...profileFields,
          employeeNumber,
          hireDate,
          employmentType,
          employmentStatus: 'ACTIVE',
          department: departmentId ? { connect: { id: departmentId } } : undefined,
          position: positionId ? { connect: { id: positionId } } : undefined,
        },
      });
    } else {
      const existingByNumber = await tx.employee.findUnique({ where: { employeeNumber } });
      if (existingByNumber) throw new AppError('Employee number already exists.', 409, 'CONFLICT');

      let existingByEmail;
      try {
        existingByEmail = await tx.employee.findUnique({ where: { email: profile.user.email } });
      } catch {
        existingByEmail = null;
      }

      if (existingByEmail) {
        employee = await tx.employee.update({
          where: { id: existingByEmail.id },
          data: {
            ...profileFields,
            employeeNumber,
            firstName: profile.firstName,
            middleName: profile.middleName,
            lastName: profile.lastName,
            hireDate,
            employmentType,
            employmentStatus: 'ACTIVE',
            department: departmentId ? { connect: { id: departmentId } } : undefined,
            position: positionId ? { connect: { id: positionId } } : undefined,
          },
        });
      } else {
        employee = await tx.employee.create({
          data: {
            ...profileFields,
            employeeNumber,
            firstName: profile.firstName,
            middleName: profile.middleName,
            lastName: profile.lastName,
            email: profile.user.email,
            hireDate,
            employmentType,
            employmentStatus: 'ACTIVE',
            department: departmentId ? { connect: { id: departmentId } } : undefined,
            position: positionId ? { connect: { id: positionId } } : undefined,
          },
        });
      }
    }

    if (shiftId) {
      await tx.employeeShiftAssignment.create({
        data: {
          employeeId: employee.id,
          shiftId,
          effectiveFrom: new Date(),
        },
      });
    }

    // Create salary profiles if salary data was provided
    if (basicSalary || housingAllowance || transportAllowance) {
      const salaryComponents = await tx.salaryComponent.findMany({ where: { status: 'ACTIVE' } });
      const componentMap = new Map(salaryComponents.map((sc) => [sc.code, sc.id]));
      const effectiveFrom = new Date(hireDate);
      const salaryProfileEntries = [];

      if (basicSalary && componentMap.has('BASIC')) {
        salaryProfileEntries.push({
          employeeId: employee.id,
          salaryComponentId: componentMap.get('BASIC'),
          effectiveFrom,
          customValue: basicSalary,
        });
      }
      if (housingAllowance && componentMap.has('HOUSING')) {
        salaryProfileEntries.push({
          employeeId: employee.id,
          salaryComponentId: componentMap.get('HOUSING'),
          effectiveFrom,
          customValue: housingAllowance,
        });
      }
      if (transportAllowance && componentMap.has('TRANSPORT')) {
        salaryProfileEntries.push({
          employeeId: employee.id,
          salaryComponentId: componentMap.get('TRANSPORT'),
          effectiveFrom,
          customValue: transportAllowance,
        });
      }

      for (const entry of salaryProfileEntries) {
        await tx.employeeSalaryProfile.create({ data: entry });
      }
    }

    await tx.user.update({
      where: { id: profile.userId },
      data: { status: 'ACTIVE', employeeId: employee.id },
    });

    const categoryMap = {};
    const cats = await tx.documentCategory.findMany();
    for (const c of cats) {
      categoryMap[c.code] = c.id;
      categoryMap[c.name] = c.id;
    }
    const cvCategoryId =
      categoryMap['CV'] ||
      categoryMap['CONTRACT'] ||
      categoryMap['Education & Certifications'] ||
      Object.values(categoryMap)[0];
    const certCategoryId =
      categoryMap['CERTIFICATE'] ||
      categoryMap['LICENSE'] ||
      categoryMap['EDUCATION'] ||
      Object.values(categoryMap)[0];

    for (const doc of profile.documents) {
      const catId = doc.category === 'CV' ? cvCategoryId : certCategoryId;
      if (!catId) continue;
      await tx.employeeDocument.create({
        data: {
          employeeId: employee.id,
          categoryId: catId,
          originalFilename: doc.originalFilename,
          storedFilename: doc.storedFilename,
          storagePath: doc.storagePath,
          mimeType: doc.mimeType,
          fileSizeBytes: doc.fileSizeBytes,
        },
      });
    }

    await tx.applicantDocument.deleteMany({ where: { applicantId: profile.id } });
    await tx.applicantProfile.delete({ where: { id: applicantId } });

    employeeAudit.update(
      reviewerId,
      employee.id,
      `Approved applicant ${profile.firstName} ${profile.lastName} as employee ${employeeNumber}`,
    );

    createNotification({
      userId: profile.userId,
      title: 'Application Approved',
      message: `Congratulations! Your application has been approved. Welcome aboard as employee ${employeeNumber}.`,
      type: 'SUCCESS',
      metadata: { employeeId: employee.id, employeeNumber },
    });

    return employee;
  });
};

export const rejectApplicant = async (applicantId, { reason }, reviewerId) => {
  const profile = await prisma.applicantProfile.findUnique({
    where: { id: applicantId },
    include: { user: { include: { employee: true } } },
  });
  if (!profile) throw new AppError('Applicant not found.', 404, 'NOT_FOUND');
  if (profile.user.status !== 'PENDING_APPROVAL') {
    throw new AppError('User is not in pending approval status.', 400, 'INVALID_STATUS');
  }

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: profile.userId },
      data: { status: 'INACTIVE', employeeId: null },
    });

    if (profile.user.employee) {
      const disbursements = await tx.payrollDisbursement.findMany({
        where: { employeeId: profile.user.employee.id },
        select: { id: true },
      });
      if (disbursements.length) {
        const disbIds = disbursements.map(d => d.id);
        await tx.payslipItem.deleteMany({ where: { payrollDisbursementId: { in: disbIds } } });
        await tx.payrollDisbursement.deleteMany({ where: { id: { in: disbIds } } });
      }
      await tx.employee.delete({ where: { id: profile.user.employee.id } });
    }

    for (const doc of await tx.applicantDocument.findMany({ where: { applicantId: profile.id } })) {
      try {
        await fs.unlink(doc.storagePath);
      } catch {
        /* ignore */
      }
    }

    await tx.applicantDocument.deleteMany({ where: { applicantId: profile.id } });
    await tx.applicantProfile.delete({ where: { id: applicantId } });

    applicantAudit.update(
      reviewerId,
      applicantId,
      `Rejected applicant ${profile.firstName} ${profile.lastName}: ${reason}`,
    );

    createNotification({
      userId: profile.userId,
      title: 'Application Rejected',
      message: `We regret to inform you that your application has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'ERROR',
      metadata: { applicantId },
    });
  });
};
