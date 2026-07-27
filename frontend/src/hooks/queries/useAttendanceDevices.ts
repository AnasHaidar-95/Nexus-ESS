import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceDeviceApi } from '../../lib/attendance-devices';

export const ATTENDANCE_DEVICE_KEYS = {
  all: ['attendanceDevices'] as const,
  list: (params?: Record<string, unknown>) => [...ATTENDANCE_DEVICE_KEYS.all, 'list', params] as const,
};

export function useAttendanceDevices(params?: { page?: number; pageSize?: number; search?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: ATTENDANCE_DEVICE_KEYS.list(params),
    queryFn: () => attendanceDeviceApi.list(params),
    placeholderData: keepPreviousData,
  });
}
