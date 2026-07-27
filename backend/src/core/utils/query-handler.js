export const buildPaginationAndSort = (query, defaultSort = { updatedAt: 'desc' }) => {
  // 1. Parse Pagination
  const page = Math.max(1, parseInt(query.page, 10) || 1);

  const parsedSize = parseInt(query.pageSize, 10);
  const pageSize = Math.min(9999, Math.max(1, isNaN(parsedSize) ? 25 : parsedSize));

  const skip = (page - 1) * pageSize;

  // 2. Parse Sorting
  let orderBy = defaultSort;

  if (query.sort && typeof query.sort === 'string') {
    const isDesc = query.sort.startsWith('-');
    const field = isDesc ? query.sort.substring(1) : query.sort;

    // SECURITY: Basic sanitization to prevent Prisma injection/errors
    if (/^[a-zA-Z0-9_]+$/.test(field)) {
      orderBy = { [field]: isDesc ? 'desc' : 'asc' };
    }
  }

  // 3. Return Prisma-compatible arguments
  return {
    pagination: { page, pageSize, skip },
    prismaArgs: {
      skip,
      take: pageSize,
      orderBy,
    },
  };
};

/**
 * Formats the standard paginated response envelope
 */
export const formatPaginatedResponse = (data, totalItems, pagination) => {
  return {
    items: data,
    pagination: {
      ...pagination,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
      hasNext: pagination.page * pagination.pageSize < totalItems,
      hasPrevious: pagination.page > 1,
    },
  };
};
