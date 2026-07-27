import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { permissionApi } from '../../lib/permissions';

export const PERMISSION_KEYS = {
  all: ['permissions'] as const,
  list: (params?: Record<string, unknown>) => [...PERMISSION_KEYS.all, 'list', params] as const,
};

export function usePermissions(params?: { page?: number; pageSize?: number; search?: string; module?: string }) {
  return useQuery({
    queryKey: PERMISSION_KEYS.list(params),
    queryFn: () => permissionApi.list(params),
    placeholderData: keepPreviousData,
  });
}
