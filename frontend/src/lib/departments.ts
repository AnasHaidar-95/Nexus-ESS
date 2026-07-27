import { api } from './api';
import type { Department, PaginatedResult } from '../types';

export interface DepartmentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const departmentApi = {
  list: (params?: DepartmentListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Department>>('/departments' + qs);
  },

  getById: (id: string) =>
    api.get<Department>(`/departments/${id}`),

  create: (data: { name: string; code: string; description?: string; managerId?: string; parentId?: string }) =>
    api.post<Department>('/departments', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<Department>(`/departments/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/departments/${id}/activate`),

  deactivate: (id: string) =>
    api.patch<void>(`/departments/${id}/deactivate`),
};
