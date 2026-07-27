import { api } from './api';
import type { Position, PaginatedResult } from '../types';

export interface PositionListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const positionApi = {
  list: (params?: PositionListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Position>>('/positions' + qs);
  },

  getById: (id: string) =>
    api.get<Position>(`/positions/${id}`),

  create: (data: { name: string; code: string; description?: string; grade?: string }) =>
    api.post<Position>('/positions', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Position>(`/positions/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/positions/${id}/activate`),

  deactivate: (id: string) =>
    api.patch<void>(`/positions/${id}/deactivate`),
};
