import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import {
  getRolePermissions as getCachedRolePermissions,
  invalidatePermissionsCache,
} from '../../core/utils/permission-cache.js';

const audit = createAuditLogger('SECURITY', 'roles');
const permAudit = createAuditLogger('SECURITY', 'role_permissions');

export const listRoles = async (query) => {
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

  const [roles, totalItems] = await Promise.all([
    prisma.role.findMany({
      ...prismaArgs,
      where,
      include: {
        _count: { select: { users: true, rolePermissions: true } },
      },
    }),
    prisma.role.count({ where }),
  ]);

  const data = roles.map((r) => ({
    ...r,
    userCount: r._count.users,
    permissionCount: r._count.rolePermissions,
    _count: undefined,
  }));

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getRoleById = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: { select: { users: true, rolePermissions: true } },
    },
  });
  if (!role) throw new NotFoundError('Role');
  return {
    ...role,
    userCount: role._count.users,
    permissionCount: role._count.rolePermissions,
    _count: undefined,
  };
};

export const createRole = async (data, actorId) => {
  const existing = await prisma.role.findFirst({
    where: { OR: [{ name: data.name }, { code: data.code }] },
  });
  if (existing) throw new ConflictError('Role name or code already exists.');

  const role = await prisma.role.create({
    data: { ...data, isSystem: false, status: 'ACTIVE', createdBy: actorId, updatedBy: actorId },
  });

  audit.create(actorId, role.id);
  return role;
};

export const updateRole = async (id, data, actorId) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new NotFoundError('Role');
  if (role.isSystem)
    throw new AppError('System roles cannot be modified.', 403, 'SYSTEM_ROLE_PROTECTED');

  if (data.name) {
    const exists = await prisma.role.findFirst({ where: { name: data.name, id: { not: id } } });
    if (exists) throw new ConflictError('Role name already exists.');
  }

  const updated = await prisma.role.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });
  audit.update(actorId, id);
  return updated;
};

export const deleteRole = async (id, actorId) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) throw new NotFoundError('Role');
  if (role.isSystem)
    throw new AppError('System roles cannot be deleted.', 403, 'SYSTEM_ROLE_PROTECTED');
  if (role._count.users > 0)
    throw new AppError('Cannot delete role assigned to users.', 409, 'ROLE_IN_USE');

  // Hard delete is acceptable for unused, non-system roles, or use soft-delete (isActive: false)
  await prisma.role.delete({ where: { id } });
  audit.delete(actorId, id);
};

export const getRolePermissions = async (id) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new NotFoundError('Role');

  const permCodes = getCachedRolePermissions(id);
  return [...permCodes];
};

export const replaceRolePermissions = async (id, permissionCodes, actorId) => {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw new NotFoundError('Role');

  const permissions = await prisma.permission.findMany({
    where: { code: { in: permissionCodes } },
    select: { id: true },
  });
  const permissionIds = permissions.map((p) => p.id);

  await prisma.$transaction(async (tx) => {
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((pid) => ({ roleId: id, permissionId: pid, createdBy: actorId })),
      });
    }
  });

  permAudit.update(actorId, id, 'Replaced role permissions');

  // Invalidate in-memory cache so authorize middleware picks up the change
  await invalidatePermissionsCache();

  return { message: 'Permissions updated successfully' };
};

export const getRoleUsers = async (id, query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      ...prismaArgs,
      where: { roleId: id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        employee: { select: { firstName: true, lastName: true, employeeNumber: true } },
      },
    }),
    prisma.user.count({ where: { roleId: id } }),
  ]);
  return formatPaginatedResponse(users, totalItems, pagination);
};
