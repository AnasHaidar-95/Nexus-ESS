import { prisma } from '../../core/utils/prisma.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';

export const listAuditLogs = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ ...prismaArgs, include: { user: { select: { username: true } } } }),
    prisma.auditLog.count(),
  ]);
  return formatPaginatedResponse(logs, total, pagination);
};

export const getAuditLogsByUser = async (userId, query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ ...prismaArgs, where: { userId } }),
    prisma.auditLog.count({ where: { userId } }),
  ]);
  return formatPaginatedResponse(logs, total, pagination);
};

export const getAuditLogsByEntity = async (entity, query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ ...prismaArgs, where: { entityName: entity } }),
    prisma.auditLog.count({ where: { entityName: entity } }),
  ]);
  return formatPaginatedResponse(logs, total, pagination);
};

export const createAuditLog = async (data) => {
  return prisma.auditLog.create({
    data: {
      userId: data.userId,
      employeeId: data.employeeId,
      eventType: data.eventType,
      entityName: data.entityName,
      entityId: data.entityId,
      action: data.action,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    },
    include: { user: { select: { username: true } } },
  });
};
