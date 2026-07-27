import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { employeeApi } from '../../lib/employees';

export const EMPLOYEE_KEYS = {
  all: ['employees'] as const,
  list: (params?: Record<string, unknown>) => [...EMPLOYEE_KEYS.all, 'list', params] as const,
};

export function useEmployees(params?: { page?: number; pageSize?: number; search?: string }) {
  return useQuery({
    queryKey: EMPLOYEE_KEYS.list(params),
    queryFn: () => employeeApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePrefetchEmployees() {
  const qc = useQueryClient();
  return (params?: Record<string, unknown>) =>
    qc.prefetchQuery({
      queryKey: EMPLOYEE_KEYS.list(params),
      queryFn: () => employeeApi.list(params),
    });
}
