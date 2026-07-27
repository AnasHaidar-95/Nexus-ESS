import { api } from './api';
import type { Shift, PaginatedResult } from '../types';

export interface ShiftListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const shiftApi = {
  list: (params?: ShiftListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Shift>>('/shifts' + qs);
  },

  getById: (id: string) =>
    api.get<Shift>(`/shifts/${id}`),

  create: (data: { name: string; code: string; startTimeMinutes: number; endTimeMinutes: number; breakMinutes?: number; graceMinutes?: number }) =>
    api.post<Shift>('/shifts', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Shift>(`/shifts/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/shifts/${id}/activate`),

  deactivate: (id: string) =>
    api.patch<void>(`/shifts/${id}/deactivate`),
};
