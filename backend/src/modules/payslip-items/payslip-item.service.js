import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';

export const listPayslipItems = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const { disbursementId } = query;

  const where = disbursementId ? { payrollDisbursementId: disbursementId } : {};

  const [items, totalItems] = await Promise.all([
    prisma.payslipItem.findMany({
      ...prismaArgs,
      where,
      include: {
        salaryComponent: { select: { id: true, code: true, name: true, type: true } },
        payrollDisbursement: {
          select: {
            id: true,
            employeeId: true,
            employee: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.payslipItem.count({ where }),
  ]);

  return formatPaginatedResponse(items, totalItems, pagination);
};

export const getPayslipItemById = async (id) => {
  const item = await prisma.payslipItem.findUnique({
    where: { id },
    include: {
      salaryComponent: { select: { id: true, name: true, type: true } },
      payrollDisbursement: { select: { id: true, year: true, month: true, employeeId: true } },
    },
  });
  if (!item) throw new NotFoundError('Payslip item');
  return item;
};
