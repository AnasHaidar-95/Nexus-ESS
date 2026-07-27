import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('ATTENDANCE', 'attendance_incidents');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

export const listIncidents = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, recordId, status, severity, type, search } = query;

  const where = {};
  if (status) where.status = status;
  if (severity) where.severity = severity;
  if (type) where.type = type;
  if (recordId) where.recordId = recordId;
  if (employeeId) where.record = { employeeId };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { resolutionNotes: { contains: search, mode: 'insensitive' } },
      { record: { employee: { firstName: { contains: search, mode: 'insensitive' } } } },
      { record: { employee: { lastName: { contains: search, mode: 'insensitive' } } } },
      { record: { employee: { employeeNumber: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  const [incidents, totalItems] = await Promise.all([
    prisma.attendanceIncident.findMany({
      ...prismaArgs,
      where,
      include: {
        record: {
          select: {
            id: true,
            date: true,
            status: true,
            employee: {
              select: {
                id: true,
                employeeNumber: true,
                firstName: true,
                lastName: true,
                status: true, // Include new status enum
              },
            },
          },
        },
      },
    }),
    prisma.attendanceIncident.count({ where }),
  ]);

  return formatPaginatedResponse(incidents, totalItems, pagination);
};

export const getIncidentById = async (id) => {
  const incident = await prisma.attendanceIncident.findUnique({
    where: { id },
    include: {
      record: {
        select: {
          id: true,
          date: true,
          status: true,
          checkInTime: true,
          checkOutTime: true,
          employee: {
            select: {
              id: true,
              employeeNumber: true,
              firstName: true,
              lastName: true,
              department: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!incident) throw new NotFoundError('Incident');
  return incident;
};

export const createIncident = async (data, actorId) => {
  const record = await prisma.attendanceRecord.findUnique({ where: { id: data.recordId } });
  if (!record) throw new AppError('Attendance record not found.', 404, 'RECORD_NOT_FOUND');

  // BUSINESS RULE: Prevent duplicate active incidents of the same type for the same record
  const existing = await prisma.attendanceIncident.findFirst({
    where: {
      recordId: data.recordId,
      type: data.type,
      status: { notIn: ['RESOLVED', 'CANCELLED', 'REJECTED'] },
    },
  });

  if (existing) {
    throw new AppError(
      'An active incident of this type already exists for this attendance record.',
      409,
      'DUPLICATE_INCIDENT',
    );
  }

  const incident = await prisma.attendanceIncident.create({
    data: {
      ...data,
      status: 'OPEN',
      createdBy: actorId,
      updatedBy: actorId,
    },
  });

  audit.log(
    actorId,
    'CREATE_INCIDENT',
    incident.id,
    `Created ${data.type} incident for record ${data.recordId}`,
  );

  const userId = await getUserIdFromEmployeeId(record.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Attendance Incident Created',
      message: `An attendance incident (${data.type}) has been created for your attendance record.`,
      type: 'WARNING',
      metadata: { incidentId: incident.id, recordId: data.recordId, type: data.type },
    });
  }

  return incident;
};

export const updateIncident = async (id, data, actorId) => {
  const incident = await getIncidentById(id);

  if (['RESOLVED', 'CANCELLED', 'REJECTED'].includes(incident.status)) {
    throw new AppError('Cannot update a closed incident.', 400, 'INCIDENT_CLOSED');
  }

  const updated = await prisma.attendanceIncident.update({
    where: { id },
    data: { ...data, updatedBy: actorId },
  });

  audit.log(actorId, 'UPDATE_INCIDENT', id, `Updated incident details`);

  return updated;
};

export const cancelIncident = async (id, actorId) => {
  const incident = await getIncidentById(id);

  if (['RESOLVED', 'CANCELLED', 'REJECTED'].includes(incident.status)) {
    throw new AppError('Incident is already closed.', 400, 'INCIDENT_CLOSED');
  }

  const updated = await prisma.attendanceIncident.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'CANCEL_INCIDENT', id, `Cancelled incident`);

  return updated;
};

export const resolveIncident = async (id, resolutionNotes, actorId) => {
  const incident = await getIncidentById(id);

  if (['RESOLVED', 'CANCELLED', 'REJECTED'].includes(incident.status)) {
    throw new AppError('Incident is already closed.', 400, 'INCIDENT_CLOSED');
  }

  const updated = await prisma.attendanceIncident.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      resolutionNotes,
      resolvedBy: actorId,
      resolvedAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'RESOLVE_INCIDENT', id, `Resolved incident with notes`);

  const userId = await getUserIdFromEmployeeId(incident.record.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Attendance Incident Resolved',
      message: `Your attendance incident has been resolved.${resolutionNotes ? ` Notes: ${resolutionNotes}` : ''}`,
      type: 'SUCCESS',
      metadata: { incidentId: id },
    });
  }

  return updated;
};

export const rejectIncident = async (id, reason, actorId) => {
  const incident = await getIncidentById(id);

  if (['RESOLVED', 'CANCELLED', 'REJECTED'].includes(incident.status)) {
    throw new AppError('Incident is already closed.', 400, 'INCIDENT_CLOSED');
  }

  const timestamp = new Date().toISOString();
  const rejectionNote = `\n\n[${timestamp}] REJECTED: ${reason}`;
  const currentNotes = incident.resolutionNotes || '';

  const updated = await prisma.attendanceIncident.update({
    where: { id },
    data: {
      status: 'REJECTED',
      resolutionNotes: currentNotes + rejectionNote,
      resolvedBy: actorId,
      resolvedAt: new Date(),
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'REJECT_INCIDENT', id, `Rejected incident. Reason: ${reason}`);

  const userId = await getUserIdFromEmployeeId(incident.record.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Attendance Incident Rejected',
      message: `Your attendance incident has been rejected. Reason: ${reason}`,
      type: 'ERROR',
      metadata: { incidentId: id, reason },
    });
  }

  return updated;
};

export const addComment = async (id, commentText, actorId) => {
  const incident = await getIncidentById(id);
  const timestamp = new Date().toISOString();
  const formattedComment = `\n\n[${timestamp}] Comment: ${commentText}`;

  // Append to description if open/in-progress, otherwise append to resolutionNotes
  const targetField = ['OPEN', 'IN_PROGRESS'].includes(incident.status)
    ? 'description'
    : 'resolutionNotes';
  const currentText = incident[targetField] || '';

  const updated = await prisma.attendanceIncident.update({
    where: { id },
    data: {
      [targetField]: currentText + formattedComment,
      updatedBy: actorId,
    },
  });

  audit.log(actorId, 'ADD_INCIDENT_COMMENT', id, `Added comment to incident`);

  return updated;
};
