import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { leaveRequestApi } from '../../lib/leave-requests';
import { leaveTypeApi } from '../../lib/leave-types';
import { leaveBalanceApi } from '../../lib/leave-balances';
import { holidayApi } from '../../lib/holidays';

export const LEAVE_KEYS = {
  all: ['leaves'] as const,
  requests: (params?: Record<string, unknown>) => [...LEAVE_KEYS.all, 'requests', params] as const,
  types: (params?: Record<string, unknown>) => [...LEAVE_KEYS.all, 'types', params] as const,
  balances: (params?: Record<string, unknown>) => [...LEAVE_KEYS.all, 'balances', params] as const,
  holidays: (params?: Record<string, unknown>) => [...LEAVE_KEYS.all, 'holidays', params] as const,
};

export function useLeaveRequests(params?: { page?: number; pageSize?: number; employeeId?: string; status?: string; sort?: string }) {
  return useQuery({
    queryKey: LEAVE_KEYS.requests(params),
    queryFn: () => leaveRequestApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useLeaveTypes(params?: { page?: number; pageSize?: number; status?: string; sort?: string }) {
  return useQuery({
    queryKey: LEAVE_KEYS.types(params),
    queryFn: () => leaveTypeApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useLeaveBalances(params?: { page?: number; pageSize?: number; employeeId?: string }) {
  return useQuery({
    queryKey: LEAVE_KEYS.balances(params),
    queryFn: () => leaveBalanceApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useHolidays(params?: { page?: number; pageSize?: number; sort?: string; status?: string }) {
  return useQuery({
    queryKey: LEAVE_KEYS.holidays(params),
    queryFn: () => holidayApi.list(params),
    placeholderData: keepPreviousData,
  });
}
