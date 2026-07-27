import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('ATTENDANCE', 'shifts');

export const listShifts = async (query) => {
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

  const [shifts, totalItems] = await Promise.all([
    prisma.shift.findMany({
      ...prismaArgs,
      where,
      // FIX: Changed to 'shiftAssignments' to match standard Prisma relation naming
      include: { _count: { select: { shiftAssignments: true } } },
    }),
    prisma.shift.count({ where }),
  ]);

  const data = shifts.map((shift) => {
    const { _count, ...rest } = shift;
    return { ...rest, assignedEmployeeCount: _count.shiftAssignments };
  });

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getShiftById = async (id) => {
  const shift = await prisma.shift.findUnique({
    where: { id },
    include: { _count: { select: { shiftAssignments: true } } },
  });

  if (!shift) throw new NotFoundError('Shift');

  const { _count, ...rest } = shift;
  return { ...rest, assignedEmployeeCount: _count.shiftAssignments };
};

export const createShift = async (data, actorId) => {
  const existing = await prisma.shift.findFirst({
    where: { OR: [{ name: data.name }, { code: data.code }] },
  });

  if (existing) {
    if (existing.name === data.name) throw new ConflictError('Shift name already exists.');
    if (existing.code === data.code) throw new ConflictError('Shift code already exists.');
  }

  const newShift = await prisma.shift.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId }, // FIX: Use status enum
  });

  audit.create(actorId, newShift.id, `Created shift ${newShift.name}`);

  return newShift;
};

export const updateShift = async (id, data, actorId) => {
  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift) throw new NotFoundError('Shift');

  if (data.name || data.code) {
    const existing = await prisma.shift.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(data.name ? [{ name: data.name }] : []),
              ...(data.code ? [{ code: data.code }] : []),
            ],
          },
        ],
      },
    });
    if (existing) throw new ConflictError('Shift name or code already in use.');
  }

  const updated = await prisma.shift.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated shift ${shift.name}`);

  return updated;
};

export const toggleShiftStatus = async (id, activate, actorId) => {
  const shift = await prisma.shift.findUnique({ where: { id } });
  if (!shift) throw new NotFoundError('Shift');

  // BUSINESS RULE: Cannot deactivate if active employees are currently assigned
  if (!activate) {
    const activeAssignments = await prisma.employeeShiftAssignment.count({
      where: {
        shiftId: id,
        effectiveTo: null, // Null means currently active
      },
    });

    if (activeAssignments > 0) {
      throw new AppError(
        'Cannot deactivate shift with active employee assignments.',
        409,
        'SHIFT_IN_USE',
      );
    }
  }

  const newStatus = activate ? 'ACTIVE' : 'INACTIVE'; // FIX: Use status enum

  const updated = await prisma.shift.update({
    where: { id },
    data: { status: newStatus, updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](
    actorId,
    id,
    `Shift ${shift.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updated;
};
