import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'leave_balances');

export const listLeaveBalances = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, leaveTypeId, year } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (leaveTypeId) where.leaveTypeId = leaveTypeId;
  if (year) where.year = year;

  const [balances, totalItems] = await Promise.all([
    prisma.leaveBalance.findMany({
      ...prismaArgs,
      where,
      include: {
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            isPaid: true,
            carryForward: true,
            maxDaysPerYear: true,
          },
        },
      },
    }),
    prisma.leaveBalance.count({ where }),
  ]);

  return formatPaginatedResponse(balances, totalItems, pagination);
};

export const getLeaveBalanceById = async (id) => {
  const balance = await prisma.leaveBalance.findUnique({
    where: { id },
    include: {
      leaveType: {
        select: {
          id: true,
          name: true,
          code: true,
          isPaid: true,
          carryForward: true,
          maxDaysPerYear: true,
        },
      },
    },
  });
  if (!balance) throw new NotFoundError('LeaveBalance');
  return balance;
};

export const getLeaveBalancesByEmployee = async (employeeId) => {
  const balances = await prisma.leaveBalance.findMany({
    where: { employeeId },
    include: {
      leaveType: {
        select: {
          id: true,
          name: true,
          code: true,
          isPaid: true,
          carryForward: true,
          maxDaysPerYear: true,
        },
      },
    },
    orderBy: { year: 'desc' },
  });
  return balances;
};

export const createLeaveBalance = async (data, actorId) => {
  const existing = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: data.employeeId,
        leaveTypeId: data.leaveTypeId,
        year: data.year,
      },
    },
  });
  if (existing) {
    throw new ConflictError(
      'Leave balance already exists for this employee, leave type, and year.',
    );
  }

  const newBalance = await prisma.leaveBalance.create({
    data: { ...data, createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, newBalance.id, `Created leave balance for year ${data.year}`);

  return newBalance;
};

export const updateLeaveBalance = async (id, data, actorId) => {
  const balance = await getLeaveBalanceById(id);

  const updated = await prisma.leaveBalance.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated leave balance for year ${balance.year}`);

  return updated;
};
