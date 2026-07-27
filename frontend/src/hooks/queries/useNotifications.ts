import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { notificationApi } from '../../lib/notifications';

export const NOTIFICATION_KEYS = {
  all: ['notifications'] as const,
  list: (params?: Record<string, unknown>) => [...NOTIFICATION_KEYS.all, 'list', params] as const,
};

export function useNotificationList(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: NOTIFICATION_KEYS.list(params),
    queryFn: () => notificationApi.list(params),
    placeholderData: keepPreviousData,
  });
}
