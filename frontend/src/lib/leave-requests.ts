import { api } from './api';
import type { LeaveRequest, PaginatedResult } from '../types';

export interface LeaveRequestListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  leaveTypeId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sort?: string;
}

export interface CreateLeaveRequestData {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
}

export const leaveRequestApi = {
  list: (params?: LeaveRequestListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<LeaveRequest>>('/leave-requests' + qs);
  },

  getMy: () =>
    api.get<LeaveRequest[]>('/leave-requests/my'),

  getById: (id: string) =>
    api.get<LeaveRequest>(`/leave-requests/${id}`),

  create: (data: CreateLeaveRequestData) =>
    api.post<LeaveRequest>('/leave-requests', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<LeaveRequest>(`/leave-requests/${id}`, data),

  cancel: (id: string) =>
    api.post<void>(`/leave-requests/${id}/cancel`),

  approve: (id: string) =>
    api.post<void>(`/leave-requests/${id}/approve`),

  reject: (id: string, data?: { reason?: string }) =>
    api.post<void>(`/leave-requests/${id}/reject`, data),
};
