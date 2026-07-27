import { api } from './api';

export const payrollApi = {
  generate: (data: { payrollPeriodId: string; employeeIds?: string[] }) =>
    api.post<{ processed: number; generated: number }>('/payrolls/generate', data),

  approve: (id: string) => api.post<void>(`/payrolls/${id}/approve`),

  finalize: (id: string) => api.post<void>(`/payrolls/${id}/finalize`),

  cancel: (id: string) => api.post<void>(`/payrolls/${id}/cancel`),

  reopen: (id: string) => api.post<void>(`/payrolls/${id}/reopen`),
};
