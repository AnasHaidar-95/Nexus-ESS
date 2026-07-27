import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { systemSettingApi } from '../../lib/system-settings';

export const SYSTEM_SETTING_KEYS = {
  all: ['systemSettings'] as const,
  list: (params?: Record<string, unknown>) => [...SYSTEM_SETTING_KEYS.all, 'list', params] as const,
};

export function useSystemSettings(params?: { page?: number; pageSize?: number; category?: string; editable?: boolean; status?: string; search?: string; sort?: string }) {
  return useQuery({
    queryKey: SYSTEM_SETTING_KEYS.list(params),
    queryFn: () => systemSettingApi.list(params),
    placeholderData: keepPreviousData,
  });
}
