import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { departmentApi } from '../../lib/departments';

export const DEPT_KEYS = {
  all: ['departments'] as const,
  list: (params?: Record<string, unknown>) => [...DEPT_KEYS.all, 'list', params] as const,
};

export function useDepartments(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: DEPT_KEYS.list(params),
    queryFn: () => departmentApi.list(params),
    placeholderData: keepPreviousData,
  });
}
