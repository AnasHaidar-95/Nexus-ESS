import { api } from './api';
import type { PayrollPeriod, PaginatedResult } from '../types';

export interface PayrollPeriodListParams {
  page?: number;
  pageSize?: number;
  year?: number;
  status?: string;
  search?: string;
  sort?: string;
}

export const payrollPeriodApi = {
  list: (params?: PayrollPeriodListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<PayrollPeriod>>('/payroll-periods' + qs);
  },

  getById: (id: string) =>
    api.get<PayrollPeriod>(`/payroll-periods/${id}`),

  create: (data: { name: string; startDate: string; endDate: string; payDate: string }) =>
    api.post<PayrollPeriod>('/payroll-periods', data),

  update: (id: string, data: { name?: string; payDate?: string }) =>
    api.patch<PayrollPeriod>(`/payroll-periods/${id}`, data),

  open: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/open`),

  close: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/close`),

  lock: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/lock`),

  unlock: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/unlock`),

  approve: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/approve`),

  finalize: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/finalize`),

  reopen: (id: string) =>
    api.post<void>(`/payroll-periods/${id}/reopen`),

  cancel: (id: string) =>
    api.delete<void>(`/payroll-periods/${id}`),

  hardDelete: (id: string) =>
    api.delete<void>(`/payroll-periods/${id}/hard`),
};
