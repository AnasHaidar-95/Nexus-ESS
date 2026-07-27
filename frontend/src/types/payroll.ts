import type { PayrollStatus, PayrollPeriodStatus, SalaryComponentType, CalculationMethod } from './enums';
import type { EmployeeRef } from './employee';

export interface SalaryComponent {
  id: string;
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationMethod: CalculationMethod;
  defaultValue?: number;
  formula?: string;
  isTaxable: boolean;
  isPensionable: boolean;
  status: string;
  createdAt: string;
}

export interface SalaryComponentRef {
  id: string;
  code: string;
  name: string;
  type: SalaryComponentType;
  calculationMethod: CalculationMethod;
  defaultValue?: number;
  isTaxable: boolean;
  isPensionable: boolean;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  payDate: string;
  status: PayrollPeriodStatus;
  createdAt: string;
}

export interface PayrollDisbursement {
  id: string;
  employeeId: string;
  payrollPeriodId: string;
  year: number;
  month: number;
  payDate: string;
  basicSalary: number;
  overtimeAmount: number;
  allowanceAmount: number;
  bonusAmount: number;
  taxAmount: number;
  deductionAmount: number;
  grossSalary: number;
  netSalary: number;
  status: PayrollStatus;
  remarks?: string;
  createdAt: string;
  employee?: EmployeeRef;
  payslipItems?: PayslipItem[];
}

export interface EmployeeSalaryProfile {
  id: string;
  employeeId: string;
  salaryComponentId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  customValue?: number;
  createdAt: string;
  employee?: EmployeeRef;
  salaryComponent?: SalaryComponentRef;
}

export interface PayslipItem {
  id: string;
  payrollDisbursementId: string;
  salaryComponentId: string;
  amount: number;
  calculationDetail?: string;
  createdAt: string;
  salaryComponent?: { id: string; code?: string; name: string; type: string };
  payrollDisbursement?: {
    id: string;
    employeeId: string;
    employee: { id: string; firstName: string; lastName: string };
  };
}
