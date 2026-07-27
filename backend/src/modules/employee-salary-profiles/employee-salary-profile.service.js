import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('PAYROLL', 'employee_salary_profiles');

const INCLUDE = {
  salaryComponent: {
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      calculationMethod: true,
      defaultValue: true,
      isTaxable: true,
      isPensionable: true,
    },
  },
  employee: {
    select: {
      id: true,
      employeeNumber: true,
      firstName: true,
      lastName: true,
    },
  },
};

export const listEmployeeSalaryProfiles = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, salaryComponentId } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (salaryComponentId) where.salaryComponentId = salaryComponentId;

  const [profiles, totalItems] = await Promise.all([
    prisma.employeeSalaryProfile.findMany({ ...prismaArgs, where, include: INCLUDE }),
    prisma.employeeSalaryProfile.count({ where }),
  ]);

  return formatPaginatedResponse(profiles, totalItems, pagination);
};

export const getEmployeeSalaryProfileById = async (id) => {
  const profile = await prisma.employeeSalaryProfile.findUnique({
    where: { id },
    include: INCLUDE,
  });
  if (!profile) throw new NotFoundError('EmployeeSalaryProfile');
  return profile;
};

export const getEmployeeSalaryProfilesByEmployee = async (employeeId) => {
  return prisma.employeeSalaryProfile.findMany({
    where: { employeeId, effectiveTo: null },
    include: INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
};

export const createEmployeeSalaryProfile = async (data, actorId) => {
  const active = await prisma.employeeSalaryProfile.findFirst({
    where: {
      employeeId: data.employeeId,
      salaryComponentId: data.salaryComponentId,
      effectiveTo: null,
    },
  });
  if (active) {
    throw new ConflictError(
      'An active salary profile already exists for this employee and component. End the existing profile first.',
    );
  }

  const ended = await prisma.employeeSalaryProfile.findFirst({
    where: {
      employeeId: data.employeeId,
      salaryComponentId: data.salaryComponentId,
      effectiveFrom: data.effectiveFrom,
      effectiveTo: { not: null },
    },
  });

  let profile;
  if (ended) {
    profile = await prisma.employeeSalaryProfile.update({
      where: { id: ended.id },
      data: {
        customValue: data.customValue ?? ended.customValue,
        effectiveTo: null,
        updatedBy: actorId,
      },
      include: INCLUDE,
    });
  } else {
    profile = await prisma.employeeSalaryProfile.create({
      data: { ...data, createdBy: actorId, updatedBy: actorId },
      include: INCLUDE,
    });
  }

  audit.create(actorId, profile.id, `Assigned salary component to employee`);

  return profile;
};

export const updateEmployeeSalaryProfile = async (id, data, actorId) => {
  await getEmployeeSalaryProfileById(id);

  const updated = await prisma.employeeSalaryProfile.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
    include: INCLUDE,
  });

  audit.update(actorId, id, `Updated salary profile`);

  return updated;
};

export const endEmployeeSalaryProfile = async (id, actorId) => {
  await getEmployeeSalaryProfileById(id);

  const updated = await prisma.employeeSalaryProfile.update({
    where: { id },
    data: { effectiveTo: new Date(), updatedBy: actorId },
    include: INCLUDE,
  });

  audit.update(actorId, id, `Ended salary profile`);

  return updated;
};

export const deleteEmployeeSalaryProfile = async (id, actorId) => {
  const profile = await getEmployeeSalaryProfileById(id);

  await prisma.employeeSalaryProfile.delete({ where: { id } });

  audit.delete(actorId, id, `Deleted salary profile`);

  return profile;
};
