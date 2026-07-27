import { api } from './api';
import type { PaginatedResult, AttendanceDevice } from '../types';

export type { AttendanceDevice };

export const attendanceDeviceApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; status?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AttendanceDevice>>('/attendance-devices' + qs);
  },

  getById: (id: string) => api.get<AttendanceDevice>(`/attendance-devices/${id}`),

  create: (data: { name: string; serialNumber: string; deviceType?: string; ipAddress?: string; port?: number; location?: string }) =>
    api.post<AttendanceDevice>('/attendance-devices', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<AttendanceDevice>(`/attendance-devices/${id}`, data),

  delete: (id: string) => api.delete<void>(`/attendance-devices/${id}`),

  activate: (id: string) => api.patch<void>(`/attendance-devices/${id}/activate`),

  test: (id: string) => api.post<{ success: boolean; message: string }>(`/attendance-devices/${id}/test`),

  sync: (id: string) => api.post<{ success: boolean; recordsImported: number }>(`/attendance-devices/${id}/sync`),
};
