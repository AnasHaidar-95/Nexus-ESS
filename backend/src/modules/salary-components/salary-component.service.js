import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { BaseRepository } from '../../core/repositories/base.repository.js';
import { prisma } from '../../core/utils/prisma.js';

const audit = createAuditLogger('PAYROLL', 'salary_components');
const repo = new BaseRepository(prisma.salaryComponent);

export const listSalaryComponents = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, type, status } = query;

  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const { items: components, totalItems } = await repo.listWithCount(where, prismaArgs);
  return formatPaginatedResponse(components, totalItems, pagination);
};

export const getSalaryComponentById = async (id) => {
  const component = await repo.findByIdOrThrow(id, {}, 'Salary Component');
  return component;
};

export const createSalaryComponent = async (data, actorId) => {
  const existing = await repo.findOne({
    OR: [{ name: data.name }, { code: data.code }],
  });
  if (existing) throw new ConflictError('Salary component name or code already exists.');

  const component = await repo.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, component.id);
  return component;
};

export const updateSalaryComponent = async (id, data, actorId) => {
  await repo.findByIdOrThrow(id, {}, 'Salary Component');

  if (data.name) {
    const exists = await repo.findOne({ name: data.name, id: { not: id } });
    if (exists) throw new ConflictError('Salary component name already exists.');
  }

  if (data.code) {
    const exists = await repo.findOne({ code: data.code, id: { not: id } });
    if (exists) throw new ConflictError('Salary component code already exists.');
  }

  const updated = await repo.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });
  audit.update(actorId, id);
  return updated;
};

export const toggleSalaryComponentStatus = async (id, activate, actorId) => {
  await repo.findByIdOrThrow(id, {}, 'Salary Component');

  const updated = await repo.update({
    where: { id },
    data: { status: activate ? 'ACTIVE' : 'INACTIVE', updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](actorId, id);
  return updated;
};

export const deleteSalaryComponent = async (id, actorId) => {
  const component = await repo.findByIdOrThrow(id, {}, 'Salary Component');

  const profileRepo = new BaseRepository(prisma.employeeSalaryProfile);
  const payslipRepo = new BaseRepository(prisma.payslipItem);

  const [profileCount, payslipCount] = await Promise.all([
    profileRepo.count({ salaryComponentId: id }),
    payslipRepo.count({ salaryComponentId: id }),
  ]);

  if (profileCount > 0 || payslipCount > 0) {
    throw new ConflictError(
      `Cannot delete: component is referenced by ${profileCount} salary profile(s) and ${payslipCount} payslip item(s). Deactivate it instead.`,
    );
  }

  await repo.delete({ where: { id } });

  audit.delete(actorId, id, `Permanently deleted salary component ${component.code}`);
  return component;
};
