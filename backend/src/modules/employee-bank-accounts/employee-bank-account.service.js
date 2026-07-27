import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'employee_bank_accounts');

export const listEmployeeBankAccounts = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;

  const [accounts, totalItems] = await Promise.all([
    prisma.employeeBankAccount.findMany({ ...prismaArgs, where }),
    prisma.employeeBankAccount.count({ where }),
  ]);

  return formatPaginatedResponse(accounts, totalItems, pagination);
};

export const getEmployeeBankAccountById = async (id) => {
  const account = await prisma.employeeBankAccount.findUnique({ where: { id } });
  if (!account) throw new NotFoundError('EmployeeBankAccount');
  return account;
};

export const getEmployeeBankAccountsByEmployee = async (employeeId) => {
  return prisma.employeeBankAccount.findMany({
    where: { employeeId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
};

export const createEmployeeBankAccount = async (data, actorId) => {
  if (data.isDefault) {
    await prisma.employeeBankAccount.updateMany({
      where: { employeeId: data.employeeId, isDefault: true },
      data: { isDefault: false },
    });
  }

  const account = await prisma.employeeBankAccount.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, account.id, `Added bank account for ${data.bankName}`);

  return account;
};

export const updateEmployeeBankAccount = async (id, data, actorId) => {
  await getEmployeeBankAccountById(id);

  const updated = await prisma.employeeBankAccount.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.update(actorId, id, `Updated bank account`);

  return updated;
};

export const setDefaultBankAccount = async (id, actorId) => {
  const account = await getEmployeeBankAccountById(id);

  await prisma.employeeBankAccount.updateMany({
    where: { employeeId: account.employeeId, isDefault: true },
    data: { isDefault: false },
  });

  const updated = await prisma.employeeBankAccount.update({
    where: { id },
    data: { isDefault: true, updatedBy: actorId },
  });

  audit.update(actorId, id, `Set bank account as default`);

  return updated;
};

export const deleteEmployeeBankAccount = async (id, actorId) => {
  await getEmployeeBankAccountById(id);

  await prisma.employeeBankAccount.delete({ where: { id } });

  audit.delete(actorId, id, `Deleted bank account`);

  return { deleted: true };
};
