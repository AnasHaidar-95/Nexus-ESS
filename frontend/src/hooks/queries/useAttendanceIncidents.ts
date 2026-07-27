import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceIncidentApi } from '../../lib/attendance-incidents';

export const INCIDENT_KEYS = {
  all: ['incidents'] as const,
  list: (params?: Record<string, unknown>) => [...INCIDENT_KEYS.all, 'list', params] as const,
};

export function useAttendanceIncidents(params?: { page?: number; pageSize?: number; sort?: string }) {
  return useQuery({
    queryKey: INCIDENT_KEYS.list(params),
    queryFn: () => attendanceIncidentApi.list(params),
    placeholderData: keepPreviousData,
  });
}
