import { api } from './api';
import type { Permission } from '../types';

export const permissionApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string; module?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<{ items: Permission[]; total: number; page: number; pageSize: number }>('/permissions' + qs);
  },

  getModules: () => api.get<string[]>('/permissions/modules'),

  getByModule: (moduleName: string) => api.get<Permission[]>(`/permissions/module/${moduleName}`),
};
