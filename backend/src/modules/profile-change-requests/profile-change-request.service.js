import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('EMPLOYEE', 'profile_change_requests');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listProfileChangeRequests = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, status } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  const [requests, totalItems] = await Promise.all([
    prisma.profileChangeRequest.findMany({ ...prismaArgs, where }),
    prisma.profileChangeRequest.count({ where }),
  ]);

  return formatPaginatedResponse(requests, totalItems, pagination);
};

export const getProfileChangeRequestById = async (id) => {
  const request = await prisma.profileChangeRequest.findUnique({ where: { id } });
  if (!request) throw new NotFoundError('ProfileChangeRequest');
  return request;
};

export const createProfileChangeRequest = async (data, actorId) => {
  const existingValue = await getCurrentFieldValue(data.employeeId, data.field);

  const request = await prisma.profileChangeRequest.create({
    data: {
      employeeId: data.employeeId,
      field: data.field,
      oldValue: existingValue,
      newValue: data.newValue,
      status: 'PENDING',
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.create(actorId, request.id, `Requested change to ${data.field}`);

  return request;
};

const getCurrentFieldValue = async (employeeId, field) => {
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new NotFoundError('Employee');

  const fieldMap = {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    addressLine1: employee.addressLine1,
    city: employee.city,
    state: employee.state,
    postalCode: employee.postalCode,
    country: employee.country,
    emergencyContactName: employee.emergencyContactName,
    emergencyContactPhone: employee.emergencyContactPhone,
    nationalId: employee.nationalId,
    passportNumber: employee.passportNumber,
  };

  const value = fieldMap[field];
  return value !== undefined && value !== null ? String(value) : null;
};

export const approveProfileChangeRequest = async (id, actorId) => {
  const request = await getProfileChangeRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be approved.', 400, 'REQUEST_NOT_PENDING');
  }

  await applyFieldChange(request.employeeId, request.field, request.newValue);

  const updated = await prisma.profileChangeRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      reviewedBy: actorId,
      reviewedAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'APPROVE', id, `Approved change to ${request.field}`);

  const userId = await getUserIdFromEmployeeId(request.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Profile Change Approved',
      message: `Your request to change ${request.field} has been approved.`,
      type: 'SUCCESS',
      metadata: { profileChangeRequestId: id, field: request.field },
    });
  }

  return updated;
};

export const rejectProfileChangeRequest = async (id, reason, actorId) => {
  const request = await getProfileChangeRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be rejected.', 400, 'REQUEST_NOT_PENDING');
  }

  const updated = await prisma.profileChangeRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectionReason: reason || null,
      reviewedBy: actorId,
      reviewedAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'REJECT', id, `Rejected change to ${request.field}`);

  const userId = await getUserIdFromEmployeeId(request.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Profile Change Rejected',
      message: `Your request to change ${request.field} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'ERROR',
      metadata: { profileChangeRequestId: id, field: request.field, reason },
    });
  }

  return updated;
};

const applyFieldChange = async (employeeId, field, newValue) => {
  const fieldMap = {
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    addressLine1: 'addressLine1',
    city: 'city',
    state: 'state',
    postalCode: 'postalCode',
    country: 'country',
    emergencyContactName: 'emergencyContactName',
    emergencyContactPhone: 'emergencyContactPhone',
    nationalId: 'nationalId',
    passportNumber: 'passportNumber',
  };

  const prismaField = fieldMap[field];
  if (!prismaField) {
    throw new AppError(
      `Field '${field}' cannot be changed via profile change request.`,
      400,
      'INVALID_FIELD',
    );
  }

  await prisma.employee.update({
    where: { id: employeeId },
    data: { [prismaField]: newValue },
  });
};

export const deleteProfileChangeRequest = async (id, actorId) => {
  const request = await getProfileChangeRequestById(id);
  if (request.status !== 'PENDING') {
    throw new AppError('Only pending requests can be cancelled.', 400, 'REQUEST_NOT_PENDING');
  }

  await prisma.profileChangeRequest.delete({ where: { id } });

  audit.delete(actorId, id, `Cancelled change request for ${request.field}`);

  return { deleted: true };
};
