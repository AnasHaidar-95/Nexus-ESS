import { api } from './api';
import type { EmployeeDocument, PaginatedResult } from '../types';

export interface DocumentListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  categoryId?: string;
  isConfidential?: boolean;
  status?: string;
  search?: string;
  sort?: string;
}

export const employeeDocumentApi = {
  list: (params?: DocumentListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<EmployeeDocument>>('/employee-documents' + qs);
  },

  getById: (id: string) => api.get<EmployeeDocument>(`/employee-documents/${id}`),

  download: async (id: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`/api/v1/employee-documents/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch?.[1] || 'document';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  upload: (file: File, data: { employeeId: string; categoryId: string; notes?: string; isConfidential?: boolean; expiresAt?: string }) => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([k, v]) => { if (v != null && v !== false) formData.append(k, String(v)); });
    return api.post<EmployeeDocument>('/employee-documents', formData);
  },

  update: (id: string, data: { notes?: string; isConfidential?: boolean; expiresAt?: string }) =>
    api.patch<EmployeeDocument>(`/employee-documents/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/employee-documents/${id}`),
};
