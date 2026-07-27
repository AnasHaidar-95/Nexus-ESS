import { api } from './api';
import type { Notification, PaginatedResult } from '../types';

export const notificationApi = {
  list: (params?: { page?: number; pageSize?: number; isRead?: boolean; type?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<Notification>>('/notifications' + qs);
  },

  getUnreadCount: () =>
    api.get<{ unreadCount: number }>('/notifications/unread-count'),

  markRead: (id: string) =>
    api.patch<void>(`/notifications/${id}/read`),

  markAllRead: () =>
    api.post<void>('/notifications/read-all'),

  update: (id: string, data: { isRead?: boolean }) =>
    api.patch<void>(`/notifications/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/notifications/${id}`),

  send: (data: { userId: string; title: string; message: string; type?: string; metadata?: any }) =>
    api.post<Notification>('/notifications', data),
};
