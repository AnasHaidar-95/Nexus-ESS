import { api } from './api';
import type { EmployeeSalaryProfile, PaginatedResult } from '../types';

export const employeeSalaryProfileApi = {
  list: (params?: { page?: number; pageSize?: number; employeeId?: string; salaryComponentId?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<EmployeeSalaryProfile>>('/employee-salary-profiles' + qs);
  },

  getByEmployee: (employeeId: string) =>
    api.get<EmployeeSalaryProfile[]>(`/employee-salary-profiles/employee/${employeeId}`),

  getById: (id: string) =>
    api.get<EmployeeSalaryProfile>(`/employee-salary-profiles/${id}`),

  create: (data: { employeeId: string; salaryComponentId: string; effectiveFrom: string; effectiveTo?: string; customValue?: number }) =>
    api.post<EmployeeSalaryProfile>('/employee-salary-profiles', data),

  update: (id: string, data: { employeeId?: string; salaryComponentId?: string; customValue?: number | null; effectiveFrom?: string; effectiveTo?: string }) =>
    api.patch<EmployeeSalaryProfile>(`/employee-salary-profiles/${id}`, data),

  end: (id: string) =>
    api.patch<void>(`/employee-salary-profiles/${id}/end`),

  delete: (id: string) =>
    api.delete<void>(`/employee-salary-profiles/${id}`),
};
