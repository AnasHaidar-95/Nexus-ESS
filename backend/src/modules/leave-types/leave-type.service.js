import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { BaseRepository } from '../../core/repositories/base.repository.js';
import { prisma } from '../../core/utils/prisma.js';

const audit = createAuditLogger('SYSTEM_CONFIGURATION', 'leave_types');
const repo = new BaseRepository(prisma.leaveType);

export const listLeaveTypes = async (query) => {
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

  const { items: leaveTypes, totalItems } = await repo.listWithCount(where, prismaArgs);
  return formatPaginatedResponse(leaveTypes, totalItems, pagination);
};

export const getLeaveTypeById = async (id) => {
  const leaveType = await repo.findByIdOrThrow(id, {}, 'LeaveType');
  return leaveType;
};

export const createLeaveType = async (data, actorId) => {
  const existing = await repo.findOne({
    OR: [{ name: data.name }, { code: data.code }],
  });
  if (existing) {
    if (existing.name === data.name) throw new ConflictError('Leave type name already exists.');
    if (existing.code === data.code) throw new ConflictError('Leave type code already exists.');
  }

  const newLeaveType = await repo.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, newLeaveType.id, `Created leave type: ${newLeaveType.name}`);

  return newLeaveType;
};

export const updateLeaveType = async (id, data, actorId) => {
  const leaveType = await getLeaveTypeById(id);

  if (data.name || data.code) {
    const existing = await repo.findOne({
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
    if (existing) throw new ConflictError('Leave type name or code already in use.');
  }

  const updated = await repo.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated leave type: ${leaveType.name}`);

  return updated;
};

export const toggleLeaveTypeStatus = async (id, activate, actorId) => {
  const leaveType = await getLeaveTypeById(id);
  const newStatus = activate ? 'ACTIVE' : 'INACTIVE';

  const updated = await repo.update({
    where: { id },
    data: { status: newStatus, updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](
    actorId,
    id,
    `Leave type ${leaveType.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updated;
};
