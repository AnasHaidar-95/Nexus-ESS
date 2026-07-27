import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { BaseRepository } from '../../core/repositories/base.repository.js';
import { prisma } from '../../core/utils/prisma.js';

const audit = createAuditLogger('SYSTEM_CONFIGURATION', 'holidays');
const repo = new BaseRepository(prisma.holiday);

// --- Logical Duplicate Engine ---
const checkDuplicate = async (date, isRecurring, excludeId = null) => {
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  const where = { status: 'ACTIVE' };
  if (excludeId) where.id = { not: excludeId };

  const { items: activeHolidays } = await repo.listWithCount(where);

  for (const h of activeHolidays) {
    const hDate = new Date(h.date);

    // 1. Exact date match
    if (hDate.getTime() === date.getTime()) return true;

    // 2. Recurring month/day overlap
    if (hDate.getUTCMonth() === month && hDate.getUTCDate() === day) {
      if (isRecurring && h.isRecurring) return true;
      if (!isRecurring && h.isRecurring) return true;
      if (isRecurring && !h.isRecurring) return true;
    }
  }
  return false;
};

// --- Core Business Logic ---
export const listHolidays = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { year, type, isRecurring, status, search } = query;

  const where = {};

  if (status) {
    where.status = status;
  } else {
    where.status = 'ACTIVE'; // Default to active
  }

  if (type) where.type = type;
  if (typeof isRecurring === 'boolean') where.isRecurring = isRecurring;

  if (year) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
    where.date = { gte: startDate, lte: endDate };
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const { items: holidays, totalItems } = await repo.listWithCount(where, prismaArgs);
  return formatPaginatedResponse(holidays, totalItems, pagination);
};

export const getHolidayById = async (id) => {
  const holiday = await repo.findByIdOrThrow(id, {}, 'Holiday');
  return holiday;
};

export const createHoliday = async (data, actorId) => {
  const holidayDate = new Date(data.date);

  const isDuplicate = await checkDuplicate(holidayDate, data.isRecurring);
  if (isDuplicate) {
    throw new ConflictError(
      'A holiday already exists on this date, or a recurring holiday overlaps with this date.',
    );
  }

  const newHoliday = await repo.create({
    data: {
      ...data,
      date: holidayDate,
      status: 'ACTIVE',
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.create(actorId, newHoliday.id, `Created holiday: ${newHoliday.name}`);

  return newHoliday;
};

export const updateHoliday = async (id, data, actorId) => {
  const holiday = await getHolidayById(id);

  const newDate = data.date ? new Date(data.date) : new Date(holiday.date);
  const newRecurring = data.isRecurring !== undefined ? data.isRecurring : holiday.isRecurring;

  if (data.date || data.isRecurring !== undefined) {
    const isDuplicate = await checkDuplicate(newDate, newRecurring, id);
    if (isDuplicate) {
      throw new ConflictError(
        'Update failed: the new date conflicts with an existing active holiday.',
      );
    }
  }

  const updated = await repo.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? newDate : undefined,
      updatedBy: actorId,
    },
  });

  audit.update(actorId, id, `Updated holiday: ${holiday.name}`);

  return updated;
};

export const toggleHolidayStatus = async (id, activate, actorId) => {
  const holiday = await getHolidayById(id);

  // If activating, ensure it doesn't conflict with currently active holidays
  if (activate) {
    const isDuplicate = await checkDuplicate(new Date(holiday.date), holiday.isRecurring, id);
    if (isDuplicate) {
      throw new ConflictError(
        'Cannot activate holiday: it conflicts with an existing active holiday.',
      );
    }
  }

  const newStatus = activate ? 'ACTIVE' : 'INACTIVE';

  const updated = await repo.update({
    where: { id },
    data: { status: newStatus, updatedBy: actorId },
  });

  audit[activate ? 'activate' : 'deactivate'](
    actorId,
    id,
    `Holiday ${holiday.name} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updated;
};

export const getCalendarByYear = async (year) => {
  const holidays = await repo.findMany({
    where: {
      status: 'ACTIVE',
      OR: [
        {
          date: {
            gte: new Date(`${year}-01-01T00:00:00.000Z`),
            lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
        { isRecurring: true },
      ],
    },
    orderBy: { date: 'asc' },
  });

  return holidays.map((h) => {
    const originalDate = new Date(h.date);
    const month = originalDate.getUTCMonth();
    const day = originalDate.getUTCDate();

    const displayDate = new Date(Date.UTC(year, month, day));

    return {
      id: h.id,
      name: h.name,
      date: displayDate.toISOString().split('T')[0],
      type: h.type,
      isPaid: h.isPaid,
      isRecurring: h.isRecurring,
      description: h.description,
    };
  });
};
