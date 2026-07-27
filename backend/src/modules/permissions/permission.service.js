import { prisma } from '../../core/utils/prisma.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';

export const listPermissions = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, module } = query;

  const where = {};
  if (module) where.module = module;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [permissions, totalItems] = await Promise.all([
    prisma.permission.findMany({ ...prismaArgs, where }),
    prisma.permission.count({ where }),
  ]);

  return formatPaginatedResponse(permissions, totalItems, pagination);
};

export const listModules = async () => {
  const results = await prisma.permission.groupBy({ by: ['module'], orderBy: { module: 'asc' } });
  return results.map((r) => r.module);
};

export const listPermissionsByModule = async (moduleName) => {
  return prisma.permission.findMany({ where: { module: moduleName }, orderBy: { name: 'asc' } });
};
