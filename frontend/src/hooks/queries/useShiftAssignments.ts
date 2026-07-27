import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { shiftAssignmentApi } from '../../lib/shift-assignments';

export const SHIFT_ASSIGN_KEYS = {
  all: ['shiftAssignments'] as const,
  list: (params?: Record<string, unknown>) => [...SHIFT_ASSIGN_KEYS.all, 'list', params] as const,
};

export function useShiftAssignments(params?: { page?: number; pageSize?: number; employeeId?: string; shiftId?: string; currentOnly?: boolean; sort?: string }) {
  return useQuery({
    queryKey: SHIFT_ASSIGN_KEYS.list(params),
    queryFn: () => shiftAssignmentApi.list(params),
    placeholderData: keepPreviousData,
  });
}
