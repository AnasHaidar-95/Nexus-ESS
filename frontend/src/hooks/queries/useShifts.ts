import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { shiftApi } from '../../lib/shifts';

export const SHIFT_KEYS = {
  all: ['shifts'] as const,
  list: (params?: Record<string, unknown>) => [...SHIFT_KEYS.all, 'list', params] as const,
  byId: (id: string) => [...SHIFT_KEYS.all, 'detail', id] as const,
};

export function useShifts(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: SHIFT_KEYS.list(params),
    queryFn: () => shiftApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useShift(id: string | null | undefined) {
  return useQuery({
    queryKey: SHIFT_KEYS.byId(id ?? ''),
    queryFn: () => shiftApi.getById(id!),
    enabled: !!id,
  });
}
