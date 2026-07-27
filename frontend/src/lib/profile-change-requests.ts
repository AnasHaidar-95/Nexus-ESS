import { api } from './api';
import type { ProfileChangeRequest, PaginatedResult } from '../types';

export interface PCRListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  status?: string;
  sort?: string;
}

export const profileChangeRequestApi = {
  list: (params?: PCRListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<ProfileChangeRequest>>('/profile-change-requests' + qs);
  },

  getById: (id: string) =>
    api.get<ProfileChangeRequest>(`/profile-change-requests/${id}`),

  create: (data: { employeeId: string; field: string; newValue: string }) =>
    api.post<ProfileChangeRequest>('/profile-change-requests', data),

  approve: (id: string) =>
    api.post<void>(`/profile-change-requests/${id}/approve`),

  reject: (id: string, data?: { reason?: string }) =>
    api.post<void>(`/profile-change-requests/${id}/reject`, data),

  cancel: (id: string) =>
    api.delete<void>(`/profile-change-requests/${id}`),
};
