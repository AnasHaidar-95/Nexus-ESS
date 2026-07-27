import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditLogApi } from '../../lib/audit-logs';

export const AUDIT_LOG_KEYS = {
  all: ['auditLogs'] as const,
  list: (params?: Record<string, unknown>) => [...AUDIT_LOG_KEYS.all, 'list', params] as const,
};

export function useAuditLogs(params?: { page?: number; pageSize?: number; sort?: string }) {
  return useQuery({
    queryKey: AUDIT_LOG_KEYS.list(params),
    queryFn: () => auditLogApi.list(params),
    placeholderData: keepPreviousData,
  });
}
