import { api } from './api';
import type { PayslipItem, PaginatedResult } from '../types';

export const payslipItemApi = {
  list: (params: { disbursementId?: string; page?: number; pageSize?: number; sort?: string }) => {
    const qs = '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString();
    return api.get<PaginatedResult<PayslipItem>>('/payslip-items' + qs);
  },

  getById: (id: string) =>
    api.get<PayslipItem>(`/payslip-items/${id}`),
};
