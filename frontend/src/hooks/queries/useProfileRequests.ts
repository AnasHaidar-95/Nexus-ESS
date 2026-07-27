import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { profileChangeRequestApi } from '../../lib/profile-change-requests';

export const PROFILE_REQ_KEYS = {
  all: ['profileRequests'] as const,
  list: (params?: Record<string, unknown>) => [...PROFILE_REQ_KEYS.all, 'list', params] as const,
};

export function useProfileRequests(params?: { page?: number; pageSize?: number; employeeId?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: PROFILE_REQ_KEYS.list(params),
    queryFn: () => profileChangeRequestApi.list(params),
    placeholderData: keepPreviousData,
  });
}
