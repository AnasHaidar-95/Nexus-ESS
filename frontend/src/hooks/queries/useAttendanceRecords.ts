import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceRecordApi } from '../../lib/attendance-records';

export const ATTENDANCE_KEYS = {
  all: ['attendance'] as const,
  list: (params?: Record<string, unknown>) => [...ATTENDANCE_KEYS.all, 'list', params] as const,
};

export function useAttendanceRecords(params?: { page?: number; pageSize?: number; employeeId?: string; fromDate?: string; toDate?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: ATTENDANCE_KEYS.list(params),
    queryFn: () => attendanceRecordApi.list(params),
    placeholderData: keepPreviousData,
  });
}
