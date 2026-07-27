import { User, Employee, AttendanceRecord, Holiday } from '../../types';
import { Shift } from '../../types/attendance';
import { PerformanceReview } from '../../types/employee';
import { PayrollDisbursement, EmployeeSalaryProfile } from '../../types/payroll';

export type ShiftData = Shift;
export type PerformanceReviewData = PerformanceReview;
export type PayrollDisbursementData = PayrollDisbursement;
export type SalaryProfileData = EmployeeSalaryProfile;

export interface LeaveBalanceData {
  id: string;
  leaveTypeId: string;
  entitledDays: number;
  usedDays: number;
}

export interface LeaveTypeData {
  id: string;
  name: string;
}

export interface LeaveRequestData {
  id: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
}

export interface BankAccountData {
  id: string;
  bankName?: string;
  accountNumber?: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ShiftTimerState {
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
  mode: 'remaining' | 'toStart' | 'overtime';
}

export type { User, Employee, AttendanceRecord, Holiday };
