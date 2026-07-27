import { api } from './api';
import type { User, PaginatedResult } from '../types';

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  roleId?: string;
  sort?: string;
}

export const userApi = {
  list: (params?: UserListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<User>>('/users' + qs);
  },

  getById: (id: string) =>
    api.get<User>(`/users/${id}`),

  create: (data: { employeeId: string; username: string; email: string; roleId: string; temporaryPassword: string; forcePasswordChange?: boolean }) =>
    api.post<User>('/users', data),

  update: (id: string, data: { username?: string; email?: string; roleId?: string }) =>
    api.patch<User>(`/users/${id}`, data),

  activate: (id: string) => api.patch<void>(`/users/${id}/activate`),
  deactivate: (id: string) => api.patch<void>(`/users/${id}/deactivate`),
  lock: (id: string) => api.patch<void>(`/users/${id}/lock`),
  unlock: (id: string) => api.patch<void>(`/users/${id}/unlock`),
  suspend: (id: string) => api.patch<void>(`/users/${id}/suspend`),

  resetPassword: (id: string, data: { newPassword: string; forcePasswordChange?: boolean }) =>
    api.patch<void>(`/users/${id}/reset-password`, data),
};
