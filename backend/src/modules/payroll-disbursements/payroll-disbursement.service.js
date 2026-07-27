import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('PAYROLL', 'payroll_disbursements');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listDisbursements = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, year, month, status, periodId } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;
  if (periodId) where.payrollPeriodId = periodId;

  const [disbursements, totalItems] = await Promise.all([
    prisma.payrollDisbursement.findMany({
      ...prismaArgs,
      where,
      include: {
        employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      },
    }),
    prisma.payrollDisbursement.count({ where }),
  ]);

  return formatPaginatedResponse(disbursements, totalItems, pagination);
};

export const getDisbursementById = async (id) => {
  const disbursement = await prisma.payrollDisbursement.findUnique({
    where: { id },
    include: {
      employee: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      payslipItems: {
        include: { salaryComponent: { select: { id: true, name: true, type: true } } },
      },
    },
  });
  if (!disbursement) throw new NotFoundError('Payroll disbursement');
  return disbursement;
};

export const updateDisbursement = async (id, data, actorId) => {
  const existing = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Payroll disbursement');
  if (existing.status === 'PAID') throw new ConflictError('Cannot modify a paid disbursement.');
  if (existing.status === 'CANCELLED')
    throw new ConflictError('Cannot modify a cancelled disbursement.');

  const {
    basicSalary,
    overtimeAmount,
    allowanceAmount,
    bonusAmount,
    deductionAmount,
    taxAmount,
    remarks,
  } = data;

  const updateData = {};
  if (basicSalary !== undefined) updateData.basicSalary = basicSalary;
  if (overtimeAmount !== undefined) updateData.overtimeAmount = overtimeAmount;
  if (allowanceAmount !== undefined) updateData.allowanceAmount = allowanceAmount;
  if (bonusAmount !== undefined) updateData.bonusAmount = bonusAmount;
  if (deductionAmount !== undefined) updateData.deductionAmount = deductionAmount;
  if (taxAmount !== undefined) updateData.taxAmount = taxAmount;
  if (remarks !== undefined) updateData.remarks = remarks;

  const grossSalary =
    (updateData.basicSalary ?? Number(existing.basicSalary)) +
    (updateData.overtimeAmount ?? Number(existing.overtimeAmount)) +
    (updateData.allowanceAmount ?? Number(existing.allowanceAmount)) +
    (updateData.bonusAmount ?? Number(existing.bonusAmount));
  const netSalary =
    grossSalary -
    (updateData.deductionAmount ?? Number(existing.deductionAmount)) -
    (updateData.taxAmount ?? Number(existing.taxAmount));

  updateData.grossSalary = grossSalary;
  updateData.netSalary = netSalary;
  if (actorId) updateData.updatedBy = actorId;

  const updated = await prisma.payrollDisbursement.update({ where: { id }, data: updateData });

  if (actorId) {
    audit.log(actorId, 'UPDATE', id, 'Updated disbursement amounts', {
      employeeId: existing.employeeId,
    });
  }

  return updated;
};

export const markAsPaid = async (id, data, actorId) => {
  const existing = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Payroll disbursement');
  if (existing.status !== 'APPROVED')
    throw new ConflictError('Only APPROVED disbursements can be marked as paid.');

  const updateData = { status: 'PAID', remarks: data.paymentReference || existing.remarks };
  if (data.payDate) updateData.payDate = new Date(data.payDate);
  if (actorId) updateData.updatedBy = actorId;

  const updated = await prisma.payrollDisbursement.update({ where: { id }, data: updateData });

  const userId = await getUserIdFromEmployeeId(existing.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Salary Disbursed',
      message: `Your salary for ${existing.month}/${existing.year} has been disbursed.`,
      type: 'SUCCESS',
      metadata: { payrollId: id, year: existing.year, month: existing.month },
    }).catch(() => {});
  }

  if (actorId) {
    audit.log(actorId, 'MARK_PAID', id, 'Marked disbursement as paid', {
      employeeId: existing.employeeId,
    });
  }

  return updated;
};

export const deleteDisbursement = async (id, actorId) => {
  const existing = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError('Payroll disbursement');
  if (existing.status === 'PAID') throw new ConflictError('Cannot delete a paid disbursement.');

  await prisma.payrollDisbursement.delete({ where: { id } });

  audit.log(
    actorId,
    'DELETE',
    id,
    `Permanently deleted disbursement for ${existing.month}/${existing.year}`,
    { employeeId: existing.employeeId },
  );

  return existing;
};
