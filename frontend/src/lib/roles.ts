import { api } from './api';
import type { Role, PaginatedResult } from '../types';
import type { User } from '../types';

export interface RoleListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const roleApi = {
  list: (params?: RoleListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Role>>('/roles' + qs);
  },

  getById: (id: string) => api.get<Role>(`/roles/${id}`),

  create: (data: { name: string; code: string; description?: string }) =>
    api.post<Role>('/roles', data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.patch<Role>(`/roles/${id}`, data),

  delete: (id: string) => api.delete<void>(`/roles/${id}`),

  getPermissions: (id: string) =>
    api.get<string[]>(`/roles/${id}/permissions`),

  setPermissions: (id: string, data: { permissionIds: string[] }) =>
    api.put<void>(`/roles/${id}/permissions`, data),

  getUsers: (id: string) => api.get<User[]>(`/roles/${id}/users`),
};
