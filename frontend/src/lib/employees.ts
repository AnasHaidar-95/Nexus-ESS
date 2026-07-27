import { api } from './api';
import type { Employee, PaginatedResult } from '../types';

export interface EmployeeListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  employmentStatus?: string;
  status?: string;
  includeArchived?: boolean;
  sort?: string;
}

export interface CreateEmployeeData {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  positionId: string;
  hireDate: string;
  middleName?: string | null;
  preferredName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  managerId?: string | null;
  employmentType?: string | null;
  employmentStatus?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

export interface UpdateEmployeeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  [key: string]: unknown;
}

export const employeeApi = {
  list: (params?: EmployeeListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Employee>>('/employees' + qs);
  },

  getById: (id: string) =>
    api.get<Employee>(`/employees/${id}`),

  create: (data: CreateEmployeeData) =>
    api.post<Employee>('/employees', data),

  update: (id: string, data: UpdateEmployeeData) =>
    api.patch<Employee>(`/employees/${id}`, data),

  archive: (id: string) =>
    api.delete<void>(`/employees/${id}`),

  activate: (id: string) =>
    api.patch<void>(`/employees/${id}/activate`),

  terminate: (id: string, data: { terminationDate: string; terminationReason?: string }) =>
    api.patch<void>(`/employees/${id}/terminate`, data),

  changeDepartment: (id: string, data: { departmentId: string | null }) =>
    api.patch<Employee>(`/employees/${id}/department`, data),

  changePosition: (id: string, data: { positionId: string | null }) =>
    api.patch<Employee>(`/employees/${id}/position`, data),

  changeManager: (id: string, data: { managerId: string | null }) =>
    api.patch<Employee>(`/employees/${id}/manager`, data),
};
