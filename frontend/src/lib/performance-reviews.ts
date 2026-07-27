import { api } from './api';
import type { PerformanceReview, PaginatedResult } from '../types';

export interface ReviewListParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  cycle?: string;
  status?: string;
  sort?: string;
}

export const performanceReviewApi = {
  list: (params?: ReviewListParams) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<PerformanceReview>>('/performance-reviews' + qs);
  },

  getById: (id: string) =>
    api.get<PerformanceReview>(`/performance-reviews/${id}`),

  create: (data: { employeeId: string; reviewerId?: string; cycle: string; rating?: string; goals?: string; comments?: string }) =>
    api.post<PerformanceReview>('/performance-reviews', data),

  update: (id: string, data: { rating?: string; goals?: string; comments?: string }) =>
    api.patch<PerformanceReview>(`/performance-reviews/${id}`, data),

  submit: (id: string) =>
    api.post<void>(`/performance-reviews/${id}/submit`),
};
