import { api } from './api';
import type { EmployeeShiftAssignment, PaginatedResult } from '../types';

export interface ShiftAssignmentListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  shiftId?: string;
  currentOnly?: boolean;
  sort?: string;
}

export const shiftAssignmentApi = {
  list: (params?: ShiftAssignmentListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<EmployeeShiftAssignment>>('/shift-assignments' + qs);
  },

  create: (data: { employeeId: string; shiftId: string; effectiveFrom: string; effectiveTo?: string; daysOfWeek?: string[]; notes?: string }) =>
    api.post<EmployeeShiftAssignment>('/shift-assignments', data),

  bulkCreate: (data: { employeeIds: string[]; shiftId: string; effectiveFrom: string; daysOfWeek?: string[]; notes?: string }) =>
    api.post<EmployeeShiftAssignment[]>('/shift-assignments/bulk', data),

  end: (id: string, data: { effectiveTo: string }) =>
    api.patch<void>(`/shift-assignments/${id}/end`, data),
};
