import { api } from './api';
import type { AttendanceRecord, PaginatedResult } from '../types';

export interface AttendanceRecordListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  departmentId?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  search?: string;
  sort?: string;
}

export interface CreateAttendanceRecordData {
  employeeId: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  correctionReason?: string;
  isManualEntry?: boolean;
}

export const attendanceRecordApi = {
  list: (params?: AttendanceRecordListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<AttendanceRecord>>('/attendance-records' + qs);
  },

  getById: (id: string) =>
    api.get<AttendanceRecord>(`/attendance-records/${id}`),

  create: (data: CreateAttendanceRecordData) =>
    api.post<AttendanceRecord>('/attendance-records', data),

  update: (id: string, data: { checkInTime?: string; checkOutTime?: string; notes?: string; correctionReason: string }) =>
    api.patch<AttendanceRecord>(`/attendance-records/${id}`, data),
};
