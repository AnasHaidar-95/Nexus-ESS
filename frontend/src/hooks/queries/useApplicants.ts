import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { applicantApi } from '../../lib/applicants';

export const APPLICANT_KEYS = {
  all: ['applicants'] as const,
  list: (params?: Record<string, unknown>) => [...APPLICANT_KEYS.all, 'list', params] as const,
};

export function useApplicants(params?: { page?: number; pageSize?: number; sort?: string }) {
  return useQuery({
    queryKey: APPLICANT_KEYS.list(params),
    queryFn: () => applicantApi.list(params),
    placeholderData: keepPreviousData,
  });
}
