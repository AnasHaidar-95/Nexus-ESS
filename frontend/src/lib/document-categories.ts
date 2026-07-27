import { api } from './api';
import type { DocumentCategory, PaginatedResult } from '../types';

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sort?: string;
}

export const documentCategoryApi = {
  list: (params?: CategoryListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<DocumentCategory>>('/document-categories' + qs);
  },

  getById: (id: string) => api.get<DocumentCategory>(`/document-categories/${id}`),

  create: (data: { name: string; code: string; description?: string }) =>
    api.post<DocumentCategory>('/document-categories', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch<DocumentCategory>(`/document-categories/${id}`, data),

  activate: (id: string) => api.patch<void>(`/document-categories/${id}/activate`),
  deactivate: (id: string) => api.patch<void>(`/document-categories/${id}/deactivate`),
};
