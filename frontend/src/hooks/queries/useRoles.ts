import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { roleApi } from '../../lib/roles';

export const ROLE_KEYS = {
  all: ['roles'] as const,
  list: (params?: Record<string, unknown>) => [...ROLE_KEYS.all, 'list', params] as const,
  permissions: (roleId: string) => [...ROLE_KEYS.all, 'permissions', roleId] as const,
};

export function useRoles(params?: { page?: number; pageSize?: number; search?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: ROLE_KEYS.list(params),
    queryFn: () => roleApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ROLE_KEYS.permissions(roleId),
    queryFn: () => roleApi.getPermissions(roleId),
    enabled: !!roleId,
    placeholderData: keepPreviousData,
  });
}
