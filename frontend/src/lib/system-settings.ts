import { api } from './api';
import type { PaginatedResult, SystemSetting } from '../types';

export type { SystemSetting };

export const systemSettingApi = {
  list: (params?: { page?: number; pageSize?: number; category?: string; editable?: boolean; status?: string; search?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<SystemSetting>>('/system-settings' + qs);
  },

  getCategories: () =>
    api.get<string[]>('/system-settings/categories'),

  getByKey: (key: string) =>
    api.get<SystemSetting>(`/system-settings/${key}`),

  update: (key: string, data: { value: unknown }) =>
    api.patch<SystemSetting>(`/system-settings/${key}`, data),
};
