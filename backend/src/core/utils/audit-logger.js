import { prisma } from './prisma.js';
import { logger } from './logger.js';

const writeLog = ({ action, entityName, ...data }) => {
  prisma.auditLog
    .create({ data: { ...data, action, entityName } })
    .catch((error) => {
      logger.error('Failed to write Audit Log:', { error: error.message, action, entityName });
    });
};

/**
 * Creates a domain-specific audit logger with pre-configured eventType and entityName.
 * Returns methods for common CRUD operations and a generic log() for custom actions.
 *
 * @param {string} eventType - The audit event type (e.g., 'SECURITY', 'SYSTEM_CONFIGURATION')
 * @param {string} entityName - The entity/table name (e.g., 'roles', 'departments')
 * @returns {Object} Object with create, update, delete, activate, deactivate, and log methods
 *
 * @example
 * const audit = createAuditLogger('SECURITY', 'roles');
 * audit.create(actorId, role.id, 'Created admin role');
 * audit.update(actorId, role.id);
 * audit.log(actorId, 'APPROVE', id, 'Approved leave', { employeeId });
 */
export const createAuditLogger = (eventType, entityName) => ({
  create: (userId, entityId, description = '', extra = {}) =>
    writeLog({ userId, eventType, action: 'CREATE', entityName, entityId, description, ...extra }),
  update: (userId, entityId, description = '', extra = {}) =>
    writeLog({ userId, eventType, action: 'UPDATE', entityName, entityId, description, ...extra }),
  delete: (userId, entityId, description = '', extra = {}) =>
    writeLog({ userId, eventType, action: 'DELETE', entityName, entityId, description, ...extra }),
  activate: (userId, entityId, description = '', extra = {}) =>
    writeLog({ userId, eventType, action: 'ACTIVATE', entityName, entityId, description, ...extra }),
  deactivate: (userId, entityId, description = '', extra = {}) =>
    writeLog({ userId, eventType, action: 'DEACTIVATE', entityName, entityId, description, ...extra }),
  log: (userId, action, entityId = null, description = '', extra = {}) =>
    writeLog({ userId, eventType, action, entityName, entityId, description, ...extra }),
});
