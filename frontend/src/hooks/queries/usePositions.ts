import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { positionApi } from '../../lib/positions';

export const POS_KEYS = {
  all: ['positions'] as const,
  list: (params?: Record<string, unknown>) => [...POS_KEYS.all, 'list', params] as const,
};

export function usePositions(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: POS_KEYS.list(params),
    queryFn: () => positionApi.list(params),
    placeholderData: keepPreviousData,
  });
}
