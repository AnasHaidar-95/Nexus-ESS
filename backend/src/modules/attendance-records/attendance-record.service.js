import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, ConflictError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('ATTENDANCE', 'attendance_records');

// --- Time Calculation Engine ---
const calculateMetrics = (checkIn, checkOut, shift) => {
  if (!checkIn && !checkOut)
    return {
      workedMinutes: 0,
      lateMinutes: 0,
      earlyMinutes: 0,
      overtimeMinutes: 0,
      status: 'ABSENT',
    };
  if (!checkIn || !checkOut)
    return {
      workedMinutes: 0,
      lateMinutes: 0,
      earlyMinutes: 0,
      overtimeMinutes: 0,
      status: 'INCOMPLETE',
    };

  const startMinutesTotal = shift.startTimeMinutes;
  const endMinutesTotal = shift.endTimeMinutes;

  const shiftStart = new Date(checkIn);
  shiftStart.setHours(Math.floor(startMinutesTotal / 60), startMinutesTotal % 60, 0, 0);

  const shiftEnd = new Date(checkOut);
  shiftEnd.setHours(Math.floor(endMinutesTotal / 60), endMinutesTotal % 60, 0, 0);

  // Handle overnight shifts (e.g., 22:00 to 06:00)
  const isOvernight = endMinutesTotal < startMinutesTotal;
  if (isOvernight && shiftEnd <= shiftStart) {
    shiftEnd.setDate(shiftEnd.getDate() + 1);
  }

  // Calculate Late Minutes (incorporating grace period)
  const graceLimit = new Date(shiftStart.getTime() + shift.graceMinutes * 60000);
  const lateMinutes = checkIn > graceLimit ? Math.round((checkIn - graceLimit) / 60000) : 0;

  // Calculate Early Departure Minutes
  const earlyMinutes = checkOut < shiftEnd ? Math.round((shiftEnd - checkOut) / 60000) : 0;

  // Calculate Total Worked Minutes (deducting unpaid breaks)
  let workedMs = checkOut - checkIn - shift.breakMinutes * 60000;
  if (workedMs < 0) workedMs = 0;
  const workedMinutes = Math.round(workedMs / 60000);

  // Calculate Overtime Minutes
  const overtimeMs = checkOut > shiftEnd ? checkOut - shiftEnd : 0;
  const overtimeMinutes = Math.round(overtimeMs / 60000);

  // Determine Final Attendance Status
  let status = 'PRESENT';
  if (lateMinutes > 0) status = 'LATE';

  const expectedWorkingMs = shiftEnd - shiftStart - shift.breakMinutes * 60000;
  const expectedWorkingMinutes = Math.round(expectedWorkingMs / 60000);

  if (workedMinutes < expectedWorkingMinutes / 2) {
    status = 'HALF_DAY';
  }

  return { workedMinutes, lateMinutes, earlyMinutes, overtimeMinutes, status };
};

// --- Core Business Logic ---
export const listRecords = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, departmentId, fromDate, toDate, status, search } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;
  if (fromDate) where.date = { ...where.date, gte: new Date(fromDate) };
  if (toDate) where.date = { ...where.date, lte: new Date(toDate) };
  if (departmentId) where.employee = { departmentId };
  if (search) {
    where.employee = {
      ...(where.employee || {}),
      OR: [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeNumber: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [records, totalItems] = await Promise.all([
    prisma.attendanceRecord.findMany({
      ...prismaArgs,
      where,
      include: {
        // FIX: Include status to let frontend know if the employee/shift became inactive later
        employee: {
          select: { id: true, employeeNumber: true, firstName: true, lastName: true, status: true },
        },
        shift: {
          select: {
            id: true,
            name: true,
            startTimeMinutes: true,
            endTimeMinutes: true,
            status: true,
          },
        },
      },
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return formatPaginatedResponse(records, totalItems, pagination);
};

export const getRecordById = async (id) => {
  const record = await prisma.attendanceRecord.findUnique({
    where: { id },
    include: {
      employee: true,
      shift: true,
      incidents: true,
    },
  });
  if (!record) throw new NotFoundError('Attendance Record');
  return record;
};

export const createRecord = async (data, actorId) => {
  const { employeeId, date, checkInTime, checkOutTime, notes, correctionReason, isManualEntry } = data;
  const attendanceDate = new Date(date);

  // Normalize date to UTC midnight to prevent timezone off-by-one issues.
  // The frontend sends "YYYY-MM-DD" and we must store the same calendar date.
  const normalizedDate = new Date(
    Date.UTC(
      attendanceDate.getUTCFullYear(),
      attendanceDate.getUTCMonth(),
      attendanceDate.getUTCDate(),
    ),
  );

  const checkIn = checkInTime ? new Date(checkInTime) : null;
  const checkOut = checkOutTime ? new Date(checkOutTime) : null;

  // Prevent duplicate daily records
  const existing = await prisma.attendanceRecord.findFirst({
    where: { employeeId, date: normalizedDate },
  });
  if (existing) throw new ConflictError('Attendance record for this date already exists.');

  // 1. Fetch effective shift for this specific date
  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: {
      employeeId,
      effectiveFrom: { lte: normalizedDate },
      OR: [{ effectiveTo: { gte: normalizedDate } }, { effectiveTo: null }],
    },
    include: { shift: true },
  });

  // 2. Calculate metrics
  const shift = assignment?.shift;
  const metrics = shift
    ? calculateMetrics(checkIn, checkOut, shift)
    : {
        workedMinutes: 0,
        lateMinutes: 0,
        earlyMinutes: 0,
        overtimeMinutes: 0,
        status: 'INCOMPLETE',
      };

  // 3. Persist Record
  const newRecord = await prisma.attendanceRecord.create({
    data: {
      employeeId,
      date: normalizedDate,
      shiftId: shift?.id || null,
      checkInTime: checkIn,
      checkOutTime: checkOut,
      workedMinutes: metrics.workedMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
      status: metrics.status,
      notes: notes || null,
      correctionReason: correctionReason || null,
      isManualEntry: isManualEntry || false,
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  // 4. Auto-generate Incidents if anomalies detected
  if (metrics.lateMinutes > 0) {
    await prisma.attendanceIncident.create({
      data: {
        recordId: newRecord.id,
        type: 'LATE_ARRIVAL',
        description: `Arrived ${metrics.lateMinutes} minutes late.`,
        severity: 'LOW',
        status: 'OPEN',
        createdBy: actorId,
      },
    });
  }
  if (!checkIn) {
    await prisma.attendanceIncident.create({
      data: {
        recordId: newRecord.id,
        type: 'MISSING_CHECK_IN',
        description: 'Missing check-in punch.',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdBy: actorId,
      },
    });
  }
  // FIX: Added missing check-out incident generation
  if (checkIn && !checkOut) {
    await prisma.attendanceIncident.create({
      data: {
        recordId: newRecord.id,
        type: 'MISSING_CHECK_OUT',
        description: 'Missing check-out punch.',
        severity: 'MEDIUM',
        status: 'OPEN',
        createdBy: actorId,
      },
    });
  }

  audit.log(actorId, 'CREATE', newRecord.id, undefined, { employeeId });
  return newRecord;
};

export const updateRecord = async (id, data, actorId) => {
  const record = await getRecordById(id);

  // Recalculate with new times
  const newCheckIn = data.checkInTime !== undefined ? data.checkInTime : record.checkInTime;
  const newCheckOut = data.checkOutTime !== undefined ? data.checkOutTime : record.checkOutTime;

  const metrics = record.shiftId
    ? calculateMetrics(newCheckIn, newCheckOut, record.shift)
    : {
        workedMinutes: record.workedMinutes,
        lateMinutes: 0,
        earlyMinutes: 0,
        overtimeMinutes: 0,
        status: 'INCOMPLETE',
      };

  const updated = await prisma.attendanceRecord.update({
    where: { id },
    data: {
      checkInTime: newCheckIn,
      checkOutTime: newCheckOut,
      workedMinutes: metrics.workedMinutes,
      overtimeMinutes: metrics.overtimeMinutes,
      status: metrics.status,
      correctionReason: data.correctionReason,
      correctedBy: actorId,
      correctedAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'CORRECT', id, data.correctionReason, { employeeId: record.employeeId });
  return updated;
};
