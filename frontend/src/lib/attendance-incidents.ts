import { api } from './api';
import type { AttendanceIncident, PaginatedResult } from '../types';

export interface AttendanceIncidentListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  recordId?: string;
  status?: string;
  severity?: string;
  type?: string;
  search?: string;
  sort?: string;
}

export const attendanceIncidentApi = {
  list: (params?: AttendanceIncidentListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AttendanceIncident>>('/attendance-incidents' + qs);
  },

  getById: (id: string) =>
    api.get<AttendanceIncident>(`/attendance-incidents/${id}`),

  create: (data: { recordId: string; type: string; severity?: string; description: string }) =>
    api.post<AttendanceIncident>('/attendance-incidents', data),

  update: (id: string, data: { severity?: string; description?: string }) =>
    api.patch<AttendanceIncident>(`/attendance-incidents/${id}`, data),

  resolve: (id: string, data: { resolutionNotes: string }) =>
    api.post<void>(`/attendance-incidents/${id}/resolve`, data),

  reject: (id: string, data: { reason: string }) =>
    api.post<void>(`/attendance-incidents/${id}/reject`, data),

  cancel: (id: string) =>
    api.delete<void>(`/attendance-incidents/${id}`),
};
