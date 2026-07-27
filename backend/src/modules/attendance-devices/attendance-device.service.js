import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';
import { testConnection, fetchAttendanceLogs } from './zk-client.js';

const audit = createAuditLogger('ATTENDANCE', 'attendance_devices');

export const listDevices = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { search, status, connectionStatus, location, manufacturer } = query;

  const where = {};
  if (status) where.status = status;
  if (connectionStatus) where.connectionStatus = connectionStatus;
  if (location) where.location = { contains: location, mode: 'insensitive' };
  if (manufacturer) where.manufacturer = { contains: manufacturer, mode: 'insensitive' };

  if (search) {
    where.OR = [
      { deviceName: { contains: search, mode: 'insensitive' } },
      { deviceCode: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [devices, totalItems] = await Promise.all([
    prisma.attendanceDevice.findMany({ ...prismaArgs, where }),
    prisma.attendanceDevice.count({ where }),
  ]);

  return formatPaginatedResponse(devices, totalItems, pagination);
};

export const getDeviceById = async (id) => {
  const device = await prisma.attendanceDevice.findUnique({
    where: { id },
    include: { _count: { select: { attendanceRecords: true } } },
  });
  if (!device) throw new NotFoundError('Attendance Device');
  return device;
};

export const createDevice = async (data, actorId) => {
  const existing = await prisma.attendanceDevice.findFirst({
    where: { OR: [{ deviceCode: data.deviceCode }, { serialNumber: data.serialNumber }] },
  });

  if (existing) {
    if (existing.deviceCode === data.deviceCode)
      throw new ConflictError('Device code already exists.');
    if (existing.serialNumber === data.serialNumber)
      throw new ConflictError('Serial number already exists.');
  }

  const device = await prisma.attendanceDevice.create({
    data: {
      ...data,
      status: 'ACTIVE',
      connectionStatus: 'OFFLINE', // Devices start offline until first ping
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'CREATE', device.id, `Registered attendance device ${device.deviceName}`);

  return device;
};

export const updateDevice = async (id, data, actorId) => {
  const device = await prisma.attendanceDevice.findUnique({ where: { id } });
  if (!device) throw new NotFoundError('Attendance Device');

  const updated = await prisma.attendanceDevice.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.log(actorId, 'UPDATE', id, `Updated attendance device ${device.deviceName}`);

  return updated;
};

export const toggleDeviceStatus = async (id, activate, actorId) => {
  const device = await prisma.attendanceDevice.findUnique({ where: { id } });
  if (!device) throw new NotFoundError('Attendance Device');

  const updated = await prisma.attendanceDevice.update({
    where: { id },
    data: {
      status: activate ? 'ACTIVE' : 'INACTIVE',
      connectionStatus: activate ? device.connectionStatus : 'OFFLINE',
      updatedBy: actorId,
    },
  });

  audit.log(
    actorId,
    activate ? 'ACTIVATE' : 'DEACTIVATE',
    id,
    `Device ${device.deviceName} ${activate ? 'activated' : 'deactivated'}`,
  );

  return updated;
};

export const testDeviceConnection = async (id, actorId) => {
  const device = await prisma.attendanceDevice.findUnique({ where: { id } });
  if (!device) throw new NotFoundError('Attendance Device');
  if (device.status !== 'ACTIVE')
    throw new AppError('Cannot test an inactive device.', 400, 'DEVICE_INACTIVE');

  const { success } = await testConnection(device.ipAddress, device.port);

  const updated = await prisma.attendanceDevice.update({
    where: { id },
    data: {
      connectionStatus: success ? 'ONLINE' : 'OFFLINE',
      lastPingAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'TEST', id, `Tested connectivity for device ${device.deviceName}`);

  return { success, device: updated };
};

export const syncDevice = async (id, actorId) => {
  const device = await prisma.attendanceDevice.findUnique({ where: { id } });
  if (!device) throw new NotFoundError('Attendance Device');
  if (device.status !== 'ACTIVE')
    throw new AppError('Cannot sync an inactive device.', 400, 'DEVICE_INACTIVE');

  const updated = await prisma.attendanceDevice.update({
    where: { id },
    data: {
      connectionStatus: 'SYNCHRONIZING',
      lastSyncAt: new Date(),
      updatedBy: actorId,
    },
  });

  const logs = await fetchAttendanceLogs(device.ipAddress, device.port);

  const finalStatus = logs.length > 0 ? 'ONLINE' : 'ERROR';
  await prisma.attendanceDevice.update({
    where: { id },
    data: { connectionStatus: finalStatus, updatedBy: actorId },
  });

  audit.log(actorId, 'SYNC', id, `Synced ${logs.length} records from device ${device.deviceName}`);

  return { device: updated, records: logs };
};

export const getDeviceLogs = async (id, query) => {
  const device = await prisma.attendanceDevice.findUnique({ where: { id } });
  if (!device) throw new NotFoundError('Attendance Device');

  // If you have an `AttendanceDeviceLog` model for tracking raw sync payloads, query it here.
  // For now, returning an empty paginated response to satisfy the API contract safely.
  const { pagination } = buildPaginationAndSort(query);
  return formatPaginatedResponse([], 0, pagination);
};
