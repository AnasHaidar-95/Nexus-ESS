import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('DOCUMENT', 'employee_documents');

export const listDocuments = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, categoryId, isConfidential, search, status } = query;

  const where = { deletedAt: null }; // Enforce soft-delete filter

  // FIX: Use new status enum instead of boolean
  if (status) {
    where.status = status;
  } else {
    where.status = 'ACTIVE'; // Default to active documents
  }

  if (employeeId) where.employeeId = employeeId;
  if (categoryId) where.categoryId = categoryId;
  if (typeof isConfidential === 'boolean') where.isConfidential = isConfidential;

  if (search) {
    where.originalFilename = { contains: search, mode: 'insensitive' };
  }

  const [documents, totalItems] = await Promise.all([
    prisma.employeeDocument.findMany({
      ...prismaArgs,
      where,
      include: {
        // FIX: Include new status enums for frontend warnings
        employee: {
          select: { id: true, employeeNumber: true, firstName: true, lastName: true, status: true },
        },
        category: { select: { id: true, name: true, code: true, status: true } },
        // REMOVED: uploadedByUser (Relation does not exist in Prisma schema)
      },
    }),
    prisma.employeeDocument.count({ where }),
  ]);

  return formatPaginatedResponse(documents, totalItems, pagination);
};

export const getDocumentById = async (id) => {
  const document = await prisma.employeeDocument.findUnique({
    where: { id, deletedAt: null },
    include: {
      employee: {
        select: { id: true, employeeNumber: true, firstName: true, lastName: true, status: true },
      },
      category: true,
      // REMOVED: uploadedByUser
    },
  });

  if (!document) throw new NotFoundError('Document');
  return document;
};

export const createDocument = async (file, metadata, actorId) => {
  const { employeeId, categoryId, notes, isConfidential, expiresAt } = metadata;

  // Validate Foreign Keys
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  // FIX: Check new status enum and soft-delete flag instead of isActive
  if (!employee || employee.status !== 'ACTIVE' || employee.deletedAt !== null) {
    throw new AppError('Invalid or archived employee.', 400, 'INVALID_EMPLOYEE');
  }

  // FIX: Check new CategoryStatus enum instead of isActive
  const category = await prisma.documentCategory.findUnique({ where: { id: categoryId } });
  if (!category || category.status !== 'ACTIVE') {
    throw new AppError('Invalid or inactive document category.', 400, 'INVALID_CATEGORY');
  }

  const newDocument = await prisma.employeeDocument.create({
    data: {
      employeeId,
      categoryId,
      originalFilename: file.originalname,
      storedFilename: file.filename,
      storagePath: file.path,
      mimeType: file.mimetype,
      fileSizeBytes: file.size,
      uploadedBy: actorId,
      notes,
      isConfidential: isConfidential || false,
      expiresAt: expiresAt || null,
      status: 'ACTIVE', // Set initial status
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'UPLOAD', newDocument.id, `Uploaded document: ${file.originalname}`, {
    employeeId,
  });

  return newDocument;
};

export const updateDocumentMetadata = async (id, data, actorId) => {
  const document = await prisma.employeeDocument.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, employeeId: true, originalFilename: true, status: true },
  });
  if (!document) throw new NotFoundError('Document');

  if (document.status === 'ARCHIVED') {
    throw new AppError('Cannot update metadata of an archived document.', 400, 'DOCUMENT_ARCHIVED');
  }

  const updated = await prisma.employeeDocument.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.log(
    actorId,
    'UPDATE_METADATA',
    id,
    `Updated metadata for document: ${document.originalFilename}`,
    { employeeId: document.employeeId },
  );

  return updated;
};

export const archiveDocument = async (id, actorId) => {
  const document = await prisma.employeeDocument.findUnique({
    where: { id, deletedAt: null },
    select: { id: true, employeeId: true, originalFilename: true },
  });
  if (!document) throw new NotFoundError('Document');

  await prisma.employeeDocument.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: actorId,
      status: 'ARCHIVED',
    },
  });

  audit.log(actorId, 'ARCHIVE', id, `Archived document: ${document.originalFilename}`, {
    employeeId: document.employeeId,
  });
};
