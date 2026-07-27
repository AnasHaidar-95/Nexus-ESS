import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { payrollPeriodApi } from '../../lib/payroll-periods';
import { payrollDisbursementApi } from '../../lib/payroll-disbursements';
import { salaryComponentApi } from '../../lib/salary-components';
import { employeeBankAccountApi } from '../../lib/employee-bank-accounts';
import { employeeSalaryProfileApi } from '../../lib/employee-salary-profiles';
import { payslipItemApi } from '../../lib/payslip-items';

export const PAYROLL_KEYS = {
  all: ['payroll'] as const,
  periods: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'periods', params] as const,
  disbursements: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'disbursements', params] as const,
  components: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'components', params] as const,
  bankAccounts: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'bankAccounts', params] as const,
  salaryProfiles: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'salaryProfiles', params] as const,
  payslipItems: (params?: Record<string, unknown>) => [...PAYROLL_KEYS.all, 'payslipItems', params] as const,
};

export function usePayrollPeriods(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.periods(params),
    queryFn: () => payrollPeriodApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePayrollDisbursements(params?: { page?: number; pageSize?: number; employeeId?: string; sort?: string }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.disbursements(params),
    queryFn: () => payrollDisbursementApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSalaryComponents(params?: { page?: number; pageSize?: number; status?: string; sort?: string }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.components(params),
    queryFn: () => salaryComponentApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useBankAccounts(params?: { page?: number; pageSize?: number; employeeId?: string; sort?: string }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.bankAccounts(params),
    queryFn: () => employeeBankAccountApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useSalaryProfiles(params?: { page?: number; pageSize?: number; employeeId?: string; sort?: string }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.salaryProfiles(params),
    queryFn: () => employeeSalaryProfileApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePayslipItems(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: PAYROLL_KEYS.payslipItems(params),
    queryFn: () => payslipItemApi.list(params),
    placeholderData: keepPreviousData,
  });
}
