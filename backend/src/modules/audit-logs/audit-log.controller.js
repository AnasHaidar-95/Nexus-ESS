import * as service from './audit-log.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listAuditLogs = async (req, res) =>
  sendSuccess(res, await service.listAuditLogs(req.query), 'Audit logs retrieved.');
export const getAuditLogsByUser = async (req, res) =>
  sendSuccess(
    res,
    await service.getAuditLogsByUser(req.params.userId, req.query),
    'User audit logs retrieved.',
  );
export const getAuditLogsByEntity = async (req, res) =>
  sendSuccess(
    res,
    await service.getAuditLogsByEntity(req.params.entity, req.query),
    'Entity audit logs retrieved.',
  );
export const createAuditLog = async (req, res) =>
  sendSuccess(res, await service.createAuditLog(req.body), 'Audit log created.');
