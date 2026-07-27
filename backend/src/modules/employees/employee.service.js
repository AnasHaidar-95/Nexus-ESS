import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'employees');

// --- Helper: Circular Manager Check ---
const checkCircularManager = async (employeeId, proposedManagerId) => {
  if (!proposedManagerId) return false;
  if (employeeId === proposedManagerId) return true;

  let currentId = proposedManagerId;
  const visited = new Set();

  while (currentId) {
    if (visited.has(currentId)) return true;
    visited.add(currentId);

    const manager = await prisma.employee.findUnique({
      where: { id: currentId },
      select: { managerId: true },
    });

    if (!manager || !manager.managerId) break;
    currentId = manager.managerId;
  }

  return false;
};

// --- Helper: Archived Employee Guard ---
const checkNotArchived = (employee) => {
  if (employee.deletedAt) {
    throw new AppError('Cannot modify an archived employee.', 400, 'EMPLOYEE_ARCHIVED');
  }
};

// --- Core Business Logic ---
export const listEmployees = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, departmentId, positionId, managerId, employmentStatus, status, includeArchived } =
    query;

  const where = includeArchived ? {} : { deletedAt: null };

  if (departmentId) where.departmentId = departmentId;
  if (positionId) where.positionId = positionId;
  if (managerId) where.managerId = managerId;
  if (employmentStatus) where.employmentStatus = employmentStatus;
  if (status) where.status = status;

  if (search) {
    where.OR = [
      { employeeNumber: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { nationalId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [employees, totalItems] = await Promise.all([
    prisma.employee.findMany({
      ...prismaArgs,
      where,
      select: {
        id: true,
        employeeNumber: true,
        firstName: true,
        middleName: true,
        lastName: true,
        preferredName: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        nationalId: true,
        passportNumber: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        state: true,
        postalCode: true,
        country: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        emergencyContactRelationship: true,
        departmentId: true,
        positionId: true,
        employmentStatus: true,
        employmentType: true,
        hireDate: true,
        status: true,
        deletedAt: true,
        department: { select: { id: true, name: true, code: true } },
        position: { select: { id: true, name: true, code: true } },
        manager: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      },
    }),
    prisma.employee.count({ where }),
  ]);

  return formatPaginatedResponse(employees, totalItems, pagination);
};

export const getEmployeeById = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      position: true,
      manager: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
      user: { select: { id: true, username: true, email: true, status: true } },
    },
  });

  if (!employee) throw new NotFoundError('Employee');
  return employee;
};

export const createEmployee = async (data, actorId) => {
  const existing = await prisma.employee.findFirst({
    where: {
      OR: [
        { employeeNumber: data.employeeNumber },
        ...(data.email ? [{ email: data.email }] : []),
        ...(data.nationalId ? [{ nationalId: data.nationalId }] : []),
        ...(data.passportNumber ? [{ passportNumber: data.passportNumber }] : []),
      ],
      deletedAt: null,
    },
  });

  if (existing) {
    if (existing.employeeNumber === data.employeeNumber)
      throw new ConflictError('Employee number already exists.');
    if (existing.email === data.email) throw new ConflictError('Email already in use.');
    if (existing.nationalId === data.nationalId)
      throw new ConflictError('National ID already in use.');
    if (existing.passportNumber === data.passportNumber)
      throw new ConflictError('Passport number already in use.');
  }

  const [department, position] = await Promise.all([
    prisma.department.findUnique({ where: { id: data.departmentId } }),
    prisma.position.findUnique({ where: { id: data.positionId } }),
  ]);

  if (!department || department.status !== 'ACTIVE')
    throw new AppError('Invalid or inactive department.', 400, 'INVALID_DEPARTMENT');
  if (!position || position.status !== 'ACTIVE')
    throw new AppError('Invalid or inactive position.', 400, 'INVALID_POSITION');

  if (data.managerId) {
    if (await checkCircularManager('NEW', data.managerId)) {
      throw new AppError('Invalid manager assignment.', 400, 'CIRCULAR_MANAGEMENT');
    }
  }

  const newEmployee = await prisma.employee.create({
    data: { ...data, createdBy: actorId, updatedBy: actorId },
    include: { department: { select: { name: true } }, position: { select: { name: true } } },
  });

  audit.log(
    actorId,
    'CREATE',
    newEmployee.id,
    `Created employee record for ${newEmployee.firstName} ${newEmployee.lastName}`,
    {
      employeeId: newEmployee.id,
      newValues: {
        employeeNumber: newEmployee.employeeNumber,
        department: newEmployee.department.name,
        position: newEmployee.position.name,
      },
    },
  );

  return newEmployee;
};

export const updateEmployee = async (id, data, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  if (data.email || data.nationalId || data.passportNumber) {
    const existing = await prisma.employee.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          { deletedAt: null },
          {
            OR: [
              ...(data.email ? [{ email: data.email }] : []),
              ...(data.nationalId ? [{ nationalId: data.nationalId }] : []),
              ...(data.passportNumber ? [{ passportNumber: data.passportNumber }] : []),
            ],
          },
        ],
      },
    });
    if (existing)
      throw new ConflictError(
        'Email, National ID, or Passport already in use by another active employee.',
      );
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.log(
    actorId,
    'UPDATE',
    id,
    `Updated PII/Profile for ${employee.firstName} ${employee.lastName}`,
    {
      employeeId: id,
      oldValues: data,
      newValues: data,
    },
  );

  return updatedEmployee;
};

export const archiveEmployee = async (id, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  const activeUser = await prisma.user.findFirst({ where: { employeeId: id, status: 'ACTIVE' } });
  if (activeUser) {
    throw new AppError(
      'Cannot archive employee with an active user account. Deactivate the user first.',
      409,
      'ACTIVE_USER_EXISTS',
    );
  }

  if (employee.employmentStatus === 'TERMINATED') {
    throw new AppError(
      'Cannot archive a terminated employee. Use the termination workflow.',
      400,
      'INVALID_ARCHIVE_TARGET',
    );
  }

  await prisma.employee.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: actorId, status: 'INACTIVE' },
  });

  audit.log(
    actorId,
    'ARCHIVE',
    id,
    `Archived employee ${employee.employeeNumber} (${employee.firstName} ${employee.lastName})`,
    {
      employeeId: id,
      oldValues: { status: 'ACTIVE', deletedAt: null },
      newValues: { status: 'INACTIVE', deletedAt: new Date().toISOString() },
    },
  );
};

export const terminateEmployee = async (id, data, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  if (data.terminationDate < employee.hireDate) {
    throw new AppError(
      'Termination date cannot precede hire date.',
      400,
      'INVALID_TERMINATION_DATE',
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedEmployee = await tx.employee.update({
      where: { id },
      data: {
        employmentStatus: 'TERMINATED',
        terminationDate: data.terminationDate,
        status: 'INACTIVE',
        updatedBy: actorId,
      },
    });

    // Lock associated user account if it exists
    await tx.user.updateMany({
      where: { employeeId: id, status: 'ACTIVE' },
      data: { status: 'LOCKED', updatedBy: actorId },
    });

    // Revoke all active sessions
    await tx.refreshToken.updateMany({
      where: { user: { employeeId: id }, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return updatedEmployee;
  });

  audit.log(
    actorId,
    'TERMINATE',
    id,
    `Terminated employee ${employee.employeeNumber}. Reason: ${data.terminationReason || 'Not specified'}`,
    {
      employeeId: id,
      newValues: { terminationDate: data.terminationDate, reason: data.terminationReason },
    },
  );

  return result;
};

export const activateEmployee = async (id, data, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  if (employee.employmentStatus !== 'TERMINATED') {
    throw new AppError(
      'Only terminated employees can be activated.',
      400,
      'INVALID_ACTIVATE_TARGET',
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedEmployee = await tx.employee.update({
      where: { id },
      data: {
        employmentStatus: 'ACTIVE',
        terminationDate: null,
        status: 'ACTIVE',
        updatedBy: actorId,
      },
    });

    // Unlock associated user account if it was locked by termination
    await tx.user.updateMany({
      where: { employeeId: id, status: 'LOCKED' },
      data: { status: 'ACTIVE', updatedBy: actorId },
    });

    return updatedEmployee;
  });

  audit.log(
    actorId,
    'ACTIVATE',
    id,
    `Activated employee ${employee.employeeNumber} (${employee.firstName} ${employee.lastName})`,
    {
      employeeId: id,
      oldValues: { employmentStatus: 'TERMINATED', terminationDate: employee.terminationDate },
      newValues: { employmentStatus: 'ACTIVE', terminationDate: null },
    },
  );

  return result;
};

export const changeManager = async (id, managerId, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  if (managerId && managerId === id) {
    throw new AppError(
      'An employee cannot be assigned as their own manager.',
      400,
      'SELF_MANAGEMENT_NOT_ALLOWED',
    );
  }

  if (managerId && (await checkCircularManager(id, managerId))) {
    throw new AppError(
      'Cannot assign manager: circular reporting hierarchy detected.',
      400,
      'CIRCULAR_MANAGEMENT',
    );
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { managerId, updatedBy: actorId },
  });

  audit.log(actorId, 'CHANGE_MANAGER', id, `Changed manager for ${employee.employeeNumber}`, {
    employeeId: id,
    oldValues: { managerId: employee.managerId },
    newValues: { managerId: managerId },
  });

  return updated;
};

export const changeDepartment = async (id, departmentId, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  // If assigning to a department
  if (departmentId) {
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department || department.status !== 'ACTIVE')
      throw new AppError('Invalid or inactive department.', 400, 'INVALID_DEPARTMENT');

    audit.log(
      actorId,
      'TRANSFER',
      id,
      `Assigned ${employee.employeeNumber} to ${department.name}`,
      {
        employeeId: id,
      },
    );
  } else {
    audit.log(actorId, 'TRANSFER', id, `Removed ${employee.employeeNumber} from department`, {
      employeeId: id,
    });
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { departmentId: departmentId || null, updatedBy: actorId },
  });

  return updated;
};

export const changePosition = async (id, positionId, actorId) => {
  const employee = await getEmployeeById(id);
  checkNotArchived(employee);

  if (positionId) {
    const position = await prisma.position.findUnique({ where: { id: positionId } });
    if (!position || position.status !== 'ACTIVE')
      throw new AppError('Invalid or inactive position.', 400, 'INVALID_POSITION');

    audit.log(
      actorId,
      'CHANGE_POSITION',
      id,
      `Assigned ${employee.employeeNumber} to ${position.name}`,
      {
        employeeId: id,
      },
    );
  } else {
    audit.log(actorId, 'CHANGE_POSITION', id, `Removed ${employee.employeeNumber} from position`, {
      employeeId: id,
    });
  }

  const updated = await prisma.employee.update({
    where: { id },
    data: { positionId: positionId || null, updatedBy: actorId },
  });

  return updated;
};
