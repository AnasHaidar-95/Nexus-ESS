import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { performanceReviewApi } from '../../lib/performance-reviews';

export const REVIEW_KEYS = {
  all: ['reviews'] as const,
  list: (params?: Record<string, unknown>) => [...REVIEW_KEYS.all, 'list', params] as const,
};

export function usePerformanceReviews(params?: { page?: number; pageSize?: number; employeeId?: string; sort?: string }) {
  return useQuery({
    queryKey: REVIEW_KEYS.list(params),
    queryFn: () => performanceReviewApi.list(params),
    placeholderData: keepPreviousData,
  });
}
