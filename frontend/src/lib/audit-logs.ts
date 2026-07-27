import { api } from './api';
import type { AuditLog, PaginatedResult } from '../types';

export const auditLogApi = {
  list: (params?: { page?: number; pageSize?: number; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AuditLog>>('/audit-logs' + qs);
  },

  getByUser: (userId: string, params?: { page?: number; pageSize?: number; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AuditLog>>(`/audit-logs/user/${userId}` + qs);
  },

  getByEntity: (entity: string, params?: { page?: number; pageSize?: number; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AuditLog>>(`/audit-logs/entity/${entity}` + qs);
  },

  create: (data: { userId?: string; employeeId?: string; eventType: string; entityName: string; entityId?: string; action: string; description?: string; ipAddress?: string; userAgent?: string }) =>
    api.post<AuditLog>('/audit-logs', data),
};
