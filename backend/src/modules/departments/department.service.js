import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { BaseRepository } from '../../core/repositories/base.repository.js';
import { prisma } from '../../core/utils/prisma.js';

const audit = createAuditLogger('SYSTEM_CONFIGURATION', 'departments');
const orgAudit = createAuditLogger('ORGANIZATION', 'departments');

const departmentRepo = new BaseRepository(prisma.department);
const employeeRepo = new BaseRepository(prisma.employee);

export const listDepartments = async (query) => {
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

  const { items: departments, totalItems } = await departmentRepo.listWithCount(where, {
    ...prismaArgs,
    include: {
      manager: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      _count: { select: { employees: true } },
    },
  });

  const data = departments.map((dept) => {
    const { _count, ...rest } = dept;
    return { ...rest, employeeCount: _count.employees };
  });

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getDepartmentById = async (id) => {
  const department = await departmentRepo.findById(id, {
    include: {
      manager: { select: { id: true, employeeNumber: true, firstName: true, lastName: true } },
      _count: { select: { employees: true } },
    },
  });

  if (!department) throw new NotFoundError('Department');

  const { _count, ...rest } = department;
  return { ...rest, employeeCount: _count.employees };
};

export const createDepartment = async (data, actorId) => {
  const existing = await departmentRepo.findOne({
    OR: [{ name: data.name }, { code: data.code }],
  });

  if (existing) {
    if (existing.name === data.name) throw new ConflictError('Department name already exists.');
    if (existing.code === data.code) throw new ConflictError('Department code already exists.');
  }

  if (data.managerId) {
    const manager = await employeeRepo.findById(data.managerId);
    if (!manager || manager.status !== 'ACTIVE' || manager.deletedAt !== null) {
      throw new AppError('Invalid or inactive manager.', 400, 'INVALID_MANAGER');
    }
  }

  const newDepartment = await departmentRepo.create({
    data: { ...data, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
    include: { manager: { select: { id: true, firstName: true, lastName: true } } },
  });

  audit.create(actorId, newDepartment.id, `Created department ${newDepartment.name}`);

  return newDepartment;
};

export const updateDepartment = async (id, data, actorId) => {
  const department = await departmentRepo.findByIdOrThrow(id, {}, 'Department');

  if (data.name || data.code) {
    const existing = await departmentRepo.findOne({
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
    if (existing) throw new ConflictError('Department name or code already in use.');
  }

  if (data.managerId) {
    const manager = await employeeRepo.findById(data.managerId);
    if (!manager || manager.status !== 'ACTIVE' || manager.deletedAt !== null) {
      throw new AppError('Invalid or inactive manager.', 400, 'INVALID_MANAGER');
    }
  }

  const updatedDepartment = await departmentRepo.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
    include: { manager: { select: { id: true, firstName: true, lastName: true } } },
  });

  audit.update(actorId, id, `Updated department ${department.name}`);

  return updatedDepartment;
};

export const toggleDepartmentStatus = async (id, activate, actorId) => {
  const department = await departmentRepo.findByIdOrThrow(id, {}, 'Department');

  if (!activate) {
    const employeeCount = await employeeRepo.count({
      departmentId: id,
      status: 'ACTIVE',
      deletedAt: null,
    });

    if (employeeCount > 0) {
      throw new AppError(
        'Cannot deactivate department with active employees assigned.',
        409,
        'DEPARTMENT_IN_USE',
      );
    }
  }

  const newStatus = activate ? 'ACTIVE' : 'INACTIVE';

  const updatedDepartment = await departmentRepo.update({
    where: { id },
    data: { status: newStatus, updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](
    actorId,
    id,
    `Department ${department.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updatedDepartment;
};

export const listDepartmentEmployees = async (id, query) => {
  const department = await departmentRepo.findByIdOrThrow(id, {}, 'Department');

  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const where = { departmentId: id };
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
      hireDate: true,
      deletedAt: true,
      position: { select: { id: true, name: true } },
    },
  });

  return formatPaginatedResponse(employees, totalItems, pagination);
};

export const assignManager = async (departmentId, managerId, actorId) => {
  const department = await departmentRepo.findByIdOrThrow(departmentId, {}, 'Department');

  if (managerId) {
    const manager = await employeeRepo.findById(managerId);
    if (!manager) throw new NotFoundError('Employee (Manager)');
  }

  const updatedDepartment = await departmentRepo.update({
    where: { id: departmentId },
    data: { managerId: managerId || null },
    include: {
      manager: {
        select: { id: true, employeeNumber: true, firstName: true, lastName: true },
      },
    },
  });

  orgAudit.update(actorId, departmentId, `Updated manager for department ${department.name}`);

  return updatedDepartment;
};
