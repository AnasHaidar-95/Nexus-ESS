import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('ATTENDANCE', 'shift_assignments');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listAssignments = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const { employeeId, shiftId, currentOnly } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (shiftId) where.shiftId = shiftId;
  if (currentOnly) where.effectiveTo = null;

  const [assignments, totalItems] = await Promise.all([
    prisma.employeeShiftAssignment.findMany({
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
            code: true,
            startTimeMinutes: true,
            endTimeMinutes: true,
            status: true,
          },
        },
      },
    }),
    prisma.employeeShiftAssignment.count({ where }),
  ]);

  return formatPaginatedResponse(assignments, totalItems, pagination);
};

export const assignShift = async (data, actorId) => {
  const { employeeId, shiftId, effectiveFrom, effectiveTo, daysOfWeek, notes } = data;

  // 1. Validate Employee and Shift
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  // FIX: Check new status enum and soft-delete flag instead of isActive
  if (!employee || employee.status !== 'ACTIVE' || employee.deletedAt !== null) {
    throw new AppError('Invalid or inactive employee.', 400, 'INVALID_EMPLOYEE');
  }

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });

  if (!shift || shift.status !== 'ACTIVE') {
    throw new AppError('Invalid or inactive shift.', 400, 'INVALID_SHIFT');
  }

  // 2. Transaction: Auto-close overlapping active assignments & Create new one
  const newAssignment = await prisma.$transaction(async (tx) => {
    // Find any active assignment that overlaps with the new effectiveFrom date
    const overlappingAssignment = await tx.employeeShiftAssignment.findFirst({
      where: {
        employeeId,
        effectiveTo: null, // Currently active
        effectiveFrom: { lte: effectiveFrom },
      },
    });

    // If an active assignment exists, close it the day before the new assignment starts
    if (overlappingAssignment) {
      const closingDate = new Date(effectiveFrom);
      closingDate.setDate(closingDate.getDate() - 1);
      await tx.employeeShiftAssignment.update({
        where: { id: overlappingAssignment.id },
        data: { effectiveTo: closingDate },
      });
    }

    // Create the new assignment
    return tx.employeeShiftAssignment.create({
      data: {
        employeeId,
        shiftId,
        effectiveFrom,
        effectiveTo: effectiveTo || null,
        daysOfWeek: daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        notes: notes || null,
        createdBy: actorId,
      },
      include: {
        shift: { select: { name: true } },
      },
    });
  });

  audit.log(
    actorId,
    'ASSIGN_SHIFT',
    newAssignment.id,
    `Assigned shift ${newAssignment.shift.name} effective ${new Date(effectiveFrom).toISOString().split('T')[0]}`,
    { employeeId },
  );

  const userId = await getUserIdFromEmployeeId(employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Shift Assigned',
      message: `You have been assigned to shift "${newAssignment.shift.name}" effective ${new Date(effectiveFrom).toISOString().split('T')[0]}.`,
      type: 'INFO',
      metadata: { assignmentId: newAssignment.id, shiftId, effectiveFrom },
    });
  }

  return newAssignment;
};

export const bulkAssignShift = async (data, actorId) => {
  const { employeeIds, shiftId, effectiveFrom, daysOfWeek, notes } = data;

  const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
  // FIX: Check new status enum instead of isActive
  if (!shift || shift.status !== 'ACTIVE')
    throw new AppError('Invalid or inactive shift.', 400, 'INVALID_SHIFT');

  let successful = 0;
  let failed = 0;
  const errors = [];

  for (const employeeId of employeeIds) {
    try {
      await prisma.$transaction(async (tx) => {
        const employee = await tx.employee.findUnique({ where: { id: employeeId } });
        // FIX: Check new status enum and soft-delete flag instead of isActive
        if (!employee || employee.status !== 'ACTIVE' || employee.deletedAt !== null) {
          throw new Error('Inactive or missing employee');
        }

        const overlapping = await tx.employeeShiftAssignment.findFirst({
          where: { employeeId, effectiveTo: null, effectiveFrom: { lte: effectiveFrom } },
        });

        if (overlapping) {
          const closingDate = new Date(effectiveFrom);
          closingDate.setDate(closingDate.getDate() - 1);
          await tx.employeeShiftAssignment.update({
            where: { id: overlapping.id },
            data: { effectiveTo: closingDate },
          });
        }

        await tx.employeeShiftAssignment.create({
          data: {
            employeeId,
            shiftId,
            effectiveFrom,
            effectiveTo: null,
            daysOfWeek: daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            notes: notes || null,
            createdBy: actorId,
          },
        });
      });
      successful++;
    } catch (error) {
      failed++;
      errors.push({ employeeId, message: error.message });
    }
  }

  audit.log(
    actorId,
    'BULK_ASSIGN_SHIFT',
    shiftId,
    `Bulk assigned shift ${shift.name} to ${successful} employees effective ${new Date(effectiveFrom).toISOString().split('T')[0]}`,
  );

  for (const empId of employeeIds) {
    const userId = await getUserIdFromEmployeeId(empId);
    if (userId) {
      createNotification({
        userId,
        title: 'Shift Assigned',
        message: `You have been assigned to shift "${shift.name}" effective ${new Date(effectiveFrom).toISOString().split('T')[0]}.`,
        type: 'INFO',
        metadata: { shiftId, effectiveFrom },
      });
    }
  }

  return { processed: employeeIds.length, successful, failed, errors };
};

export const endAssignment = async (id, effectiveTo, actorId) => {
  const assignment = await prisma.employeeShiftAssignment.findUnique({
    where: { id },
    include: { employee: true, shift: true },
  });

  if (!assignment) throw new NotFoundError('Shift Assignment');
  if (assignment.effectiveTo)
    throw new AppError('Assignment is already closed.', 400, 'ALREADY_CLOSED');
  if (effectiveTo < assignment.effectiveFrom)
    throw new AppError('End date cannot precede start date.', 400, 'INVALID_DATE');

  const updated = await prisma.employeeShiftAssignment.update({
    where: { id },
    data: { effectiveTo },
  });

  audit.log(
    actorId,
    'END_SHIFT_ASSIGNMENT',
    id,
    `Ended shift assignment for ${assignment.employee.employeeNumber}`,
    { employeeId: assignment.employeeId },
  );

  return updated;
};
