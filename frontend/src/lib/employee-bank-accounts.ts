import { api } from './api';
import type { EmployeeBankAccount, PaginatedResult } from '../types';

export const employeeBankAccountApi = {
  list: (params?: { page?: number; pageSize?: number; employeeId?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<EmployeeBankAccount>>('/employee-bank-accounts' + qs);
  },

  getByEmployee: (employeeId: string) =>
    api.get<EmployeeBankAccount[]>(`/employee-bank-accounts/employee/${employeeId}`),

  getById: (id: string) =>
    api.get<EmployeeBankAccount>(`/employee-bank-accounts/${id}`),

  create: (data: { employeeId: string; accountName: string; accountNumber: string; bankName: string; branchCode?: string; swiftCode?: string; isDefault?: boolean }) =>
    api.post<EmployeeBankAccount>('/employee-bank-accounts', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<EmployeeBankAccount>(`/employee-bank-accounts/${id}`, data),

  setDefault: (id: string) =>
    api.patch<void>(`/employee-bank-accounts/${id}/default`),

  delete: (id: string) =>
    api.delete<void>(`/employee-bank-accounts/${id}`),
};
