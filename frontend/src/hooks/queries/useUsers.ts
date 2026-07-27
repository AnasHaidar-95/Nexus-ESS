import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { userApi } from '../../lib/users';

export const USER_KEYS = {
  all: ['users'] as const,
  list: (params?: Record<string, unknown>) => [...USER_KEYS.all, 'list', params] as const,
};

export function useUsers(params?: { page?: number; pageSize?: number; search?: string; status?: string; roleId?: string; sort?: string }) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => userApi.list(params),
    placeholderData: keepPreviousData,
  });
}
