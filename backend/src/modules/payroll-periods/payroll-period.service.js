import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('PAYROLL', 'payroll_periods');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listPayrollPeriods = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { year, status, search } = query;

  const where = {};
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  if (year) {
    where.startDate = { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) };
  }

  const [periods, totalItems] = await Promise.all([
    prisma.payrollPeriod.findMany({
      ...prismaArgs,
      where,
      include: { _count: { select: { disbursements: true } } },
    }),
    prisma.payrollPeriod.count({ where }),
  ]);

  const data = periods.map((p) => {
    const { _count, ...rest } = p;
    return { ...rest, payrollCount: _count.disbursements };
  });

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getPayrollPeriodById = async (id) => {
  const period = await prisma.payrollPeriod.findUnique({
    where: { id },
    include: { _count: { select: { disbursements: true } } },
  });
  if (!period) throw new NotFoundError('Payroll Period');
  return period;
};

export const createPayrollPeriod = async (data, actorId) => {
  if (!data.payDate) data.payDate = data.endDate;

  // Prevent overlapping periods
  const overlapping = await prisma.payrollPeriod.findFirst({
    where: {
      status: { not: 'CANCELLED' },
      OR: [{ startDate: { lte: data.endDate }, endDate: { gte: data.startDate } }],
    },
  });

  if (overlapping)
    throw new ConflictError('Payroll period overlaps with an existing active period.');

  const newPeriod = await prisma.payrollPeriod.create({
    data: { ...data, status: 'DRAFT', createdBy: actorId, updatedBy: actorId },
  });

  audit.log(actorId, 'CREATE_PERIOD', newPeriod.id, `Created payroll period: ${newPeriod.name}`);

  return newPeriod;
};

export const updatePayrollPeriod = async (id, data, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (['CLOSED', 'CANCELLED'].includes(period.status)) {
    throw new AppError(
      'Cannot update a closed or cancelled period.',
      400,
      'INVALID_STATUS_TRANSITION',
    );
  }
  if (period.status === 'LOCKED') {
    throw new AppError('Cannot update a locked period.', 409, 'PERIOD_LOCKED');
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.log(actorId, 'UPDATE_PERIOD', id);
  return updated;
};

export const cancelPayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (['CLOSED', 'CANCELLED', 'LOCKED'].includes(period.status)) {
    throw new AppError(
      'Cannot cancel a period that is closed, locked, or already cancelled.',
      400,
      'INVALID_STATUS_TRANSITION',
    );
  }

  // Cancel all non-PAID disbursements for this period
  const disbursements = await prisma.payrollDisbursement.findMany({
    where: { payrollPeriodId: id, status: { not: 'PAID' } },
  });

  if (disbursements.length > 0) {
    await prisma.payrollDisbursement.updateMany({
      where: { payrollPeriodId: id, status: { not: 'PAID' } },
      data: { status: 'CANCELLED', updatedBy: actorId },
    });
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { status: 'CANCELLED', updatedBy: actorId },
  });

  audit.log(actorId, 'CANCEL_PERIOD', id);
  return updated;
};

export const deletePayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);

  await prisma.payrollDisbursement.deleteMany({ where: { payrollPeriodId: id } });

  await prisma.payrollPeriod.delete({ where: { id } });

  audit.log(actorId, 'DELETE_PERIOD', id, `Hard deleted payroll period: ${period.name}`);
  return period;
};

export const openPayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'DRAFT')
    throw new AppError('Only DRAFT periods can be opened.', 400, 'INVALID_STATUS_TRANSITION');

  // Enforce single active period rule
  const activePeriod = await prisma.payrollPeriod.findFirst({ where: { status: 'OPEN' } });
  if (activePeriod)
    throw new ConflictError(`Another payroll period (${activePeriod.name}) is currently OPEN.`);

  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { status: 'OPEN', updatedBy: actorId },
  });

  audit.log(actorId, 'OPEN_PERIOD', id);
  return updated;
};

export const closePayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (!['OPEN', 'PROCESSING'].includes(period.status)) {
    throw new AppError(
      'Only OPEN or PROCESSING periods can be closed.',
      400,
      'INVALID_STATUS_TRANSITION',
    );
  }

  // FIX: Ensure all payrolls are PAID or CANCELLED before closing the period
  const pendingPayrolls = await prisma.payrollDisbursement.count({
    where: { payrollPeriodId: id, status: { notIn: ['PAID', 'CANCELLED'] } },
  });

  if (pendingPayrolls > 0) {
    throw new AppError(
      'Cannot close period: all generated payrolls must be paid or cancelled first.',
      409,
      'PENDING_PAYROLLS_EXIST',
    );
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { status: 'CLOSED', updatedBy: actorId },
  });

  audit.log(actorId, 'CLOSE_PERIOD', id);
  return updated;
};

export const lockPayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'CLOSED') {
    throw new AppError('Only CLOSED periods can be locked.', 400, 'INVALID_STATUS_TRANSITION');
  }

  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { status: 'LOCKED', updatedBy: actorId },
  });

  audit.log(actorId, 'LOCK_PERIOD', id);
  return updated;
};

export const unlockPayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'LOCKED') {
    throw new AppError('Only LOCKED periods can be unlocked.', 400, 'INVALID_STATUS_TRANSITION');
  }
  const updated = await prisma.payrollPeriod.update({
    where: { id },
    data: { status: 'CLOSED', updatedBy: actorId },
  });

  audit.log(actorId, 'UNLOCK_PERIOD', id);
  return updated;
};

export const approvePayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'OPEN') {
    throw new AppError('Only OPEN periods can be approved.', 400, 'INVALID_STATUS_TRANSITION');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.payrollDisbursement.updateMany({
      where: { payrollPeriodId: id, status: 'DRAFT' },
      data: { status: 'APPROVED', updatedBy: actorId },
    });

    audit.log(
      actorId,
      'APPROVE_PERIOD',
      id,
      `Approved ${updated.count} disbursements for period ${period.name}`,
    );

    return { approvedCount: updated.count };
  });

  // Send notifications asynchronously
  const disbursements = await prisma.payrollDisbursement.findMany({
    where: { payrollPeriodId: id, status: 'APPROVED' },
    select: { employeeId: true, year: true, month: true },
  });
  for (const d of disbursements) {
    const userId = await getUserIdFromEmployeeId(d.employeeId);
    if (userId) {
      createNotification({
        userId,
        title: 'Payroll Approved',
        message: `Your payroll for ${d.month}/${d.year} has been approved.`,
        type: 'SUCCESS',
        metadata: { periodId: id, year: d.year, month: d.month },
      }).catch(() => {});
    }
  }

  return result;
};

export const finalizePayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'OPEN') {
    throw new AppError('Only OPEN periods can be finalized.', 400, 'INVALID_STATUS_TRANSITION');
  }

  const result = await prisma.$transaction(async (tx) => {
    // Finalize all non-CANCELLED disbursements
    const finalized = await tx.payrollDisbursement.updateMany({
      where: { payrollPeriodId: id, status: { notIn: ['CANCELLED', 'PAID'] } },
      data: { status: 'PAID', updatedBy: actorId },
    });

    // Lock the period
    await tx.payrollPeriod.update({
      where: { id },
      data: { status: 'LOCKED', updatedBy: actorId },
    });

    audit.log(
      actorId,
      'FINALIZE_PERIOD',
      id,
      `Finalized ${finalized.count} disbursements and locked period ${period.name}`,
    );

    return { finalizedCount: finalized.count };
  });

  // Send notifications asynchronously
  const disbursements = await prisma.payrollDisbursement.findMany({
    where: { payrollPeriodId: id, status: 'PAID' },
    select: { employeeId: true, year: true, month: true },
  });
  for (const d of disbursements) {
    const userId = await getUserIdFromEmployeeId(d.employeeId);
    if (userId) {
      createNotification({
        userId,
        title: 'Payroll Ready',
        message: `Your payroll for ${d.month}/${d.year} has been finalized and is ready for payment.`,
        type: 'PAYROLL_READY',
        metadata: { periodId: id, year: d.year, month: d.month },
      }).catch(() => {});
    }
  }

  return result;
};

export const reopenPayrollPeriod = async (id, actorId) => {
  const period = await getPayrollPeriodById(id);
  if (period.status !== 'LOCKED') {
    throw new AppError('Only LOCKED periods can be reopened.', 400, 'INVALID_STATUS_TRANSITION');
  }

  await prisma.$transaction(async (tx) => {
    // Reopen all non-PAID disbursements back to DRAFT
    await tx.payrollDisbursement.updateMany({
      where: { payrollPeriodId: id, status: { notIn: ['PAID', 'CANCELLED'] } },
      data: { status: 'DRAFT', updatedBy: actorId },
    });

    // Unlock period: LOCKED → OPEN
    await tx.payrollPeriod.update({
      where: { id },
      data: { status: 'OPEN', updatedBy: actorId },
    });
  });

  audit.log(actorId, 'REOPEN_PERIOD', id, `Reopened locked period ${period.name}`);

  return { reopened: true };
};
