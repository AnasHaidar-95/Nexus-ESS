import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError, ForbiddenError } from '../../core/errors/app-error.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('SYSTEM_CONFIGURATION', 'settings');
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';

// --- Dynamic Type Engine ---
const parseValueForClient = (value, valueType) => {
  if (value === null || value === undefined) return null;
  switch (valueType) {
    case 'INTEGER':
      return parseInt(value, 10);
    case 'DECIMAL':
      return parseFloat(value);
    case 'BOOLEAN':
      return value === 'true' || value === true;
    case 'JSON':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    case 'STRING':
    default:
      return String(value);
  }
};

const validateAndStringifyForDb = (value, valueType) => {
  switch (valueType) {
    case 'INTEGER':
      if (isNaN(parseInt(value, 10)))
        throw new AppError('Value must be a valid integer.', 400, 'INVALID_SETTING_TYPE');
      return String(parseInt(value, 10));
    case 'DECIMAL':
      if (isNaN(parseFloat(value)))
        throw new AppError('Value must be a valid decimal.', 400, 'INVALID_SETTING_TYPE');
      return String(parseFloat(value));
    case 'BOOLEAN':
      if (typeof value !== 'boolean' && value !== 'true' && value !== 'false')
        throw new AppError('Value must be a boolean.', 400, 'INVALID_SETTING_TYPE');
      return String(value).toLowerCase();
    case 'JSON':
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return JSON.stringify(parsed);
      } catch {
        throw new AppError('Value must be valid JSON.', 400, 'INVALID_SETTING_TYPE');
      }
    case 'STRING':
    default:
      return String(value);
  }
};

// --- Core Business Logic ---
export const listSettings = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { category, editable, search, status } = query;

  const where = {};

  // Default to ACTIVE unless specifically requesting INACTIVE or ALL
  if (status) {
    where.status = status;
  } else {
    where.status = 'ACTIVE';
  }

  if (category) where.category = category;
  if (typeof editable === 'boolean') where.isEditable = editable;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { key: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [settings, totalItems] = await Promise.all([
    prisma.systemSetting.findMany({
      ...prismaArgs,
      where,
    }),
    prisma.systemSetting.count({ where }),
  ]);

  // Parse values to native JS types before sending to client
  const data = settings.map((s) => ({
    ...s,
    value: parseValueForClient(s.value, s.valueType),
  }));

  return formatPaginatedResponse(data, totalItems, pagination);
};

export const getSettingByKey = async (key) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  if (!setting) throw new NotFoundError('System Setting');

  // SECURITY: Mask encrypted values
  if (setting.isEncrypted) {
    return {
      ...setting,
      value: '********',
      valueType: 'STRING',
    };
  }

  return {
    ...setting,
    value: parseValueForClient(setting.value, setting.valueType),
  };
};

export const updateSetting = async (key, data, actorId) => {
  const setting = await prisma.systemSetting.findUnique({ where: { key } });
  if (!setting) throw new NotFoundError('System Setting');

  if (!setting.isEditable) {
    throw new ForbiddenError(
      'This setting is read-only and cannot be modified.',
      'SETTING_READ_ONLY',
    );
  }

  // SECURITY: Prevent updating encrypted settings via standard API
  if (setting.isEncrypted) {
    throw new ForbiddenError(
      'Encrypted settings cannot be modified through this endpoint.',
      'ENCRYPTED_SETTING_PROTECTED',
    );
  }

  if (data.value === undefined) {
    throw new AppError('Value is required.', 400, 'MISSING_VALUE');
  }

  // Validate and convert to string for DB storage
  const dbValue = validateAndStringifyForDb(data.value, setting.valueType);
  const oldValue = setting.value;

  if (oldValue === dbValue) {
    return parseValueForClient(dbValue, setting.valueType); // No change
  }

  const updated = await prisma.systemSetting.update({
    where: { key },
    data: { value: dbValue, updatedBy: actorId },
  });

  audit.log(actorId, 'UPDATE', updated.id, `Updated setting ${key}`, {
    oldValues: { value: oldValue },
    newValues: { value: dbValue },
  });

  return parseValueForClient(updated.value, updated.valueType);
};

export const getCategories = async () => {
  const categories = await prisma.systemSetting.groupBy({
    by: ['category'],
    where: { status: 'ACTIVE' },
    orderBy: { category: 'asc' },
  });
  return categories.map((c) => c.category);
};
