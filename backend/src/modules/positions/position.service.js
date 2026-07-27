import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { BaseRepository } from '../../core/repositories/base.repository.js';
import { prisma } from '../../core/utils/prisma.js';

const audit = createAuditLogger('SYSTEM_CONFIGURATION', 'positions');
const positionRepo = new BaseRepository(prisma.position);
const employeeRepo = new BaseRepository(prisma.employee);

export const listPositions = async (query) => {
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

  const { items: positions, totalItems } = await positionRepo.listWithCount(where, {
    ...prismaArgs,
    include: { _count: { select: { employees: true } } },
  });

  const data = positions.map((pos) => {
    const { _count, ...rest } = pos;
    return { ...rest, employeeCount: _count.employees };
  });

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getPositionById = async (id) => {
  const position = await positionRepo.findById(id, {
    include: { _count: { select: { employees: true } } },
  });
  if (!position) throw new NotFoundError('Position');

  const { _count, ...rest } = position;
  return { ...rest, employeeCount: _count.employees };
};

export const createPosition = async (data, actorId) => {
  const existing = await positionRepo.findOne({
    OR: [{ name: data.name }, { code: data.code }],
  });
  if (existing) throw new ConflictError('Position name or code already exists.');

  const newPosition = await positionRepo.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, newPosition.id, `Created position ${newPosition.name}`);

  return newPosition;
};

export const updatePosition = async (id, data, actorId) => {
  const position = await positionRepo.findByIdOrThrow(id, {}, 'Position');

  if (data.name || data.code) {
    const existing = await positionRepo.findOne({
      AND: [
        { id: { not: id } },
        {
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.code ? [{ code: data.code }] : []),
          ],
        },
      ],
    });
    if (existing) throw new ConflictError('Position name or code already in use.');
  }

  const updatedPosition = await positionRepo.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated position ${position.name}`);

  return updatedPosition;
};

export const togglePositionStatus = async (id, activate, actorId) => {
  const position = await positionRepo.findByIdOrThrow(id, {}, 'Position');

  // BUSINESS RULE: Cannot deactivate if active employees are assigned
  if (!activate) {
    const employeeCount = await employeeRepo.count({
      positionId: id,
      status: 'ACTIVE',
      deletedAt: null,
    });

    if (employeeCount > 0) {
      throw new AppError(
        'Cannot deactivate position with active employees assigned.',
        409,
        'POSITION_IN_USE',
      );
    }
  }

  const newStatus = activate ? 'ACTIVE' : 'INACTIVE';

  const updatedPosition = await positionRepo.update({
    where: { id },
    data: { status: newStatus, updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](
    actorId,
    id,
    `Position ${position.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updatedPosition;
};

export const listPositionEmployees = async (id, query) => {
  await positionRepo.findByIdOrThrow(id, {}, 'Position');

  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const where = { positionId: id };
  if (!query.includeArchived) {
    where.deletedAt = null;
  }

  if (query.search) {
    where.OR = [
      { employeeNumber: { contains: query.search, mode: 'insensitive' } },
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const { items: employees, totalItems } = await employeeRepo.listWithCount(where, {
    ...prismaArgs,
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      lastName: true,
      employmentStatus: true,
      status: true,
      deletedAt: true,
      department: { select: { id: true, name: true } },
    },
  });

  return formatPaginatedResponse(employees, totalItems, pagination);
};
