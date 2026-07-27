import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('DOCUMENT', 'document_categories');

export const getCategoryById = async (id) => {
  const category = await prisma.documentCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Document Category');
  return category;
};

export const listCategories = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, status } = query;

  const where = {};
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [categories, totalItems] = await Promise.all([
    prisma.documentCategory.findMany({
      ...prismaArgs,
      where,
      include: {
        _count: {
          select: {
            documents: {
              where: { deletedAt: null, status: 'ACTIVE' },
            },
          },
        },
      },
    }),
    prisma.documentCategory.count({ where }),
  ]);

  const data = categories.map((cat) => {
    const { _count, ...rest } = cat;
    return { ...rest, documentCount: _count.documents };
  });

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const createCategory = async (data, actorId) => {
  const existing = await prisma.documentCategory.findFirst({
    where: { OR: [{ name: data.name }, { code: data.code }] },
  });

  if (existing) {
    if (existing.name === data.name) throw new ConflictError('Category name already exists.');
    if (existing.code === data.code) throw new ConflictError('Category code already exists.');
  }

  const newCategory = await prisma.documentCategory.create({
    data: {
      ...data,
      status: 'ACTIVE',
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.log(
    actorId,
    'CREATE_CATEGORY',
    newCategory.id,
    `Created document category: ${newCategory.name}`,
  );

  return newCategory;
};

export const updateCategory = async (id, data, actorId) => {
  const category = await prisma.documentCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Document Category');

  if (data.name) {
    const existing = await prisma.documentCategory.findFirst({
      where: {
        AND: [{ id: { not: id } }, { name: data.name }],
      },
    });
    if (existing) throw new ConflictError('Category name already in use.');
  }

  const updated = await prisma.documentCategory.update({
    where: { id },
    data: {
      ...data,
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'UPDATE_CATEGORY', id, `Updated document category: ${category.name}`);

  return updated;
};

export const toggleCategoryStatus = async (id, activate, actorId) => {
  const category = await prisma.documentCategory.findUnique({ where: { id } });
  if (!category) throw new NotFoundError('Document Category');

  // BUSINESS RULE: Cannot deactivate if active documents are assigned
  if (!activate) {
    const docCount = await prisma.employeeDocument.count({
      where: {
        categoryId: id,
        deletedAt: null,
        status: 'ACTIVE', // FIX: Check new DocumentStatus enum
      },
    });

    if (docCount > 0) {
      throw new AppError(
        'Cannot deactivate category with active documents assigned.',
        409,
        'CATEGORY_IN_USE',
      );
    }
  }

  const newStatus = activate ? 'ACTIVE' : 'INACTIVE';

  const updated = await prisma.documentCategory.update({
    where: { id },
    data: {
      status: newStatus,
      updatedBy: actorId,
    },
  });

  audit.log(
    actorId,
    activate ? 'ACTIVATE_CATEGORY' : 'DEACTIVATE_CATEGORY',
    id,
    `Category ${category.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updated;
};
