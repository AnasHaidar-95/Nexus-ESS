import { api } from './api';
import type { Holiday, PaginatedResult } from '../types';

export interface HolidayListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  type?: string;
  isRecurring?: boolean;
  status?: string;
  search?: string;
  sort?: string;
}

export const holidayApi = {
  list: (params?: HolidayListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Holiday>>('/holidays' + qs);
  },

  getCalendar: (year: number) =>
    api.get<Holiday[]>(`/holidays/calendar/${year}`),

  getById: (id: string) =>
    api.get<Holiday>(`/holidays/${id}`),

  create: (data: { name: string; date: string; type?: string; description?: string; region?: string; isPaid?: boolean; isRecurring?: boolean }) =>
    api.post<Holiday>('/holidays', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Holiday>(`/holidays/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/holidays/${id}/activate`),

  deactivate: (id: string) =>
    api.patch<void>(`/holidays/${id}/deactivate`),
};
