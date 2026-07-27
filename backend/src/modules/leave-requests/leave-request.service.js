import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'leave_requests');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

const APPROVAL_INCLUDE = {
  leaveType: { select: { id: true, name: true, code: true, isPaid: true } },
  employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
  approvalSteps: { orderBy: { approverOrder: 'asc' } },
};

export const listLeaveRequests = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, leaveTypeId, status, fromDate, toDate } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (leaveTypeId) where.leaveTypeId = leaveTypeId;
  if (status) where.status = status;
  if (fromDate || toDate) {
    where.startDate = {};
    if (fromDate) where.startDate.gte = fromDate;
    if (toDate) where.startDate.lte = toDate;
  }

  const [requests, totalItems] = await Promise.all([
    prisma.leaveRequest.findMany({ ...prismaArgs, where, include: APPROVAL_INCLUDE }),
    prisma.leaveRequest.count({ where }),
  ]);

  return formatPaginatedResponse(requests, totalItems, pagination);
};

export const getMyLeaveRequests = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { employeeId: true },
  });
  if (!user) throw new NotFoundError('User');

  return prisma.leaveRequest.findMany({
    where: { employeeId: user.employeeId },
    include: APPROVAL_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
};

export const getLeaveRequestById = async (id) => {
  const request = await prisma.leaveRequest.findUnique({
    where: { id },
    include: APPROVAL_INCLUDE,
  });
  if (!request) throw new NotFoundError('LeaveRequest');
  return request;
};

export const createLeaveRequest = async (data, actorId) => {
  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: data.employeeId,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays: data.totalDays,
      reason: data.reason,
      status: 'PENDING',
      createdBy: actorId,
      updatedBy: actorId,
    },
    include: APPROVAL_INCLUDE,
  });

  audit.create(actorId, request.id, `Leave request created: ${data.totalDays} days`);

  return request;
};

export const updateLeaveRequest = async (id, data, actorId) => {
  const request = await getLeaveRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be updated.', 400, 'REQUEST_NOT_PENDING');
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
    include: APPROVAL_INCLUDE,
  });

  audit.update(actorId, id, `Leave request updated`);

  return updated;
};

export const cancelLeaveRequest = async (id, actorId) => {
  const request = await getLeaveRequestById(id);
  if (request.status !== 'PENDING' && request.status !== 'APPROVED') {
    throw new AppError(
      'Only pending or approved requests can be cancelled.',
      400,
      'REQUEST_NOT_CANCELLABLE',
    );
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'CANCELLED', updatedBy: actorId },
    include: APPROVAL_INCLUDE,
  });

  if (request.status === 'APPROVED') {
    const requestYear = new Date(request.startDate).getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          year: requestYear,
        },
      },
    });
    if (balance) {
      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: { usedDays: { decrement: Number(request.totalDays) }, updatedBy: actorId },
      });
    }
  }

  audit.update(actorId, id, `Leave request cancelled`);

  return updated;
};

export const approveLeaveRequest = async (id, actorId) => {
  const request = await getLeaveRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be approved.', 400, 'REQUEST_NOT_PENDING');
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'APPROVED', approverId: actorId, approvedAt: new Date(), updatedBy: actorId },
    include: APPROVAL_INCLUDE,
  });

  const requestYear = new Date(request.startDate).getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: request.employeeId,
        leaveTypeId: request.leaveTypeId,
        year: requestYear,
      },
    },
  });
  if (balance) {
    await prisma.leaveBalance.update({
      where: { id: balance.id },
      data: { usedDays: { increment: Number(request.totalDays) }, updatedBy: actorId },
    });
  }

  audit.log(actorId, 'APPROVE', id, `Leave request approved`);

  const userId = await getUserIdFromEmployeeId(request.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Leave Request Approved',
      message: `Your leave request for ${request.leaveType?.name || 'leave'} (${request.totalDays} days) has been approved.`,
      type: 'LEAVE_APPROVED',
      metadata: { leaveRequestId: id },
    });
  }

  return updated;
};

export const rejectLeaveRequest = async (id, reason, actorId) => {
  const request = await getLeaveRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be rejected.', 400, 'REQUEST_NOT_PENDING');
  }

  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason || null, updatedBy: actorId },
    include: APPROVAL_INCLUDE,
  });

  audit.log(actorId, 'REJECT', id, `Leave request rejected`);

  const userId = await getUserIdFromEmployeeId(request.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Leave Request Rejected',
      message: `Your leave request for ${request.leaveType?.name || 'leave'} (${request.totalDays} days) has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'LEAVE_REJECTED',
      metadata: { leaveRequestId: id, reason },
    });
  }

  return updated;
};

export const getApprovalSteps = async (requestId) => {
  const request = await prisma.leaveRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new NotFoundError('LeaveRequest');

  return prisma.leaveApprovalStep.findMany({
    where: { leaveRequestId: requestId },
    orderBy: { approverOrder: 'asc' },
  });
};
