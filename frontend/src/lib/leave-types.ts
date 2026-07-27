import { api } from './api';
import type { LeaveType, PaginatedResult } from '../types';

export interface LeaveTypeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const leaveTypeApi = {
  list: (params?: LeaveTypeListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<LeaveType>>('/leave-types' + qs);
  },

  getById: (id: string) =>
    api.get<LeaveType>(`/leave-types/${id}`),

  create: (data: { name: string; code: string; description?: string; isPaid?: boolean; carryForward?: boolean; maxDaysPerYear?: number }) =>
    api.post<LeaveType>('/leave-types', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<LeaveType>(`/leave-types/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/leave-types/${id}/activate`),

  deactivate: (id: string) =>
    api.patch<void>(`/leave-types/${id}/deactivate`),
};
