import { api } from './api';
import type { PayrollDisbursement, PaginatedResult } from '../types';

export interface PayrollDisbursementListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  periodId?: string;
  year?: number;
  month?: number;
  status?: string;
  sort?: string;
}

export const payrollDisbursementApi = {
  list: (params?: PayrollDisbursementListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<PayrollDisbursement>>('/payroll-disbursements' + qs);
  },

  getById: (id: string) =>
    api.get<PayrollDisbursement>(`/payroll-disbursements/${id}`),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<PayrollDisbursement>(`/payroll-disbursements/${id}`, data),

  markPaid: (id: string, data?: { paymentReference?: string; payDate?: string }) =>
    api.post<void>(`/payroll-disbursements/${id}/mark-paid`, data),

  hardDelete: (id: string) =>
    api.delete<void>(`/payroll-disbursements/${id}`),
};
