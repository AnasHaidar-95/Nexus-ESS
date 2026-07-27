import { api } from './api';
import type { SalaryComponent, PaginatedResult } from '../types';

export interface SalaryComponentListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  status?: string;
  sort?: string;
}

export const salaryComponentApi = {
  list: (params?: SalaryComponentListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<SalaryComponent>>('/salary-components' + qs);
  },

  getById: (id: string) =>
    api.get<SalaryComponent>(`/salary-components/${id}`),

  create: (data: { code: string; name: string; type: string; calculationMethod: string; defaultValue?: number; formula?: string; isTaxable?: boolean; isPensionable?: boolean }) =>
    api.post<SalaryComponent>('/salary-components', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<SalaryComponent>(`/salary-components/${id}`, data),

  activate: (id: string) =>
    api.patch<void>(`/salary-components/${id}/activate`),

  delete: (id: string) =>
    api.delete<void>(`/salary-components/${id}`),

  hardDelete: (id: string) =>
    api.delete<void>(`/salary-components/${id}/hard`),
};
