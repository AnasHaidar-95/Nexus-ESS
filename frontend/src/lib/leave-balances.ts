import { api } from './api';
import type { LeaveBalance, PaginatedResult } from '../types';

export interface LeaveBalanceListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  leaveTypeId?: string;
  year?: number;
  sort?: string;
}

export const leaveBalanceApi = {
  list: (params?: LeaveBalanceListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<LeaveBalance>>('/leave-balances' + qs);
  },

  getByEmployee: (employeeId: string) =>
    api.get<LeaveBalance[]>(`/leave-balances/employee/${employeeId}`),

  getById: (id: string) =>
    api.get<LeaveBalance>(`/leave-balances/${id}`),

  create: (data: { employeeId: string; leaveTypeId: string; year: number; entitledDays: number; usedDays?: number; carriedOverDays?: number }) =>
    api.post<LeaveBalance>('/leave-balances', data),

  update: (id: string, data: { entitledDays?: number; usedDays?: number; carriedOverDays?: number }) =>
    api.patch<LeaveBalance>(`/leave-balances/${id}`, data),
};
