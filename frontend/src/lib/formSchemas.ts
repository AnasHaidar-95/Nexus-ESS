import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  description: z.string().optional(),
});

export const positionSchema = z.object({
  name: z.string().min(1, 'Position name is required'),
  code: z.string().min(1, 'Position code is required'),
  description: z.string().optional(),
  grade: z.number().min(1),
});

export const shiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required'),
  code: z.string().min(1, 'Shift code is required'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
});

export const shiftAssignmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  shiftId: z.string().min(1, 'Shift is required'),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  daysOfWeek: z.array(z.string()).min(1, 'Select at least one working day'),
  notes: z.string().optional(),
});

export const leaveTypeSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  code: z.string().min(1, 'Leave type code is required'),
  description: z.string().optional(),
  isPaid: z.boolean(),
  carryForward: z.boolean(),
  maxDaysPerYear: z.number().min(1),
});

export const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
});

export const leaveBalanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  entitledDays: z.number().min(0),
  carriedOverDays: z.number().min(0),
  year: z.number().min(2000),
});

export const holidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['PUBLIC', 'COMPANY', 'REGIONAL', 'RELIGIOUS', 'SPECIAL']),
  description: z.string().optional(),
  isPaid: z.boolean(),
  isRecurring: z.boolean(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const payrollPeriodSchema = z.object({
  name: z.string().min(1, 'Period name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  payDate: z.string().min(1, 'Pay date is required'),
});

export const payrollPeriodEditSchema = z.object({
  name: z.string().min(1, 'Period name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  payDate: z.string().min(1, 'Pay date is required'),
  status: z.enum(['DRAFT', 'OPEN', 'PROCESSING', 'CLOSED', 'LOCKED', 'CANCELLED']),
});

export const salaryComponentSchema = z.object({
  code: z.string().min(1, 'Component code is required'),
  name: z.string().min(1, 'Component name is required'),
  type: z.enum(['EARNING', 'DEDUCTION']),
  calculationMethod: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA', 'MANUAL']),
  defaultValue: z.number().optional(),
  formula: z.string().optional(),
  isTaxable: z.boolean(),
  isPensionable: z.boolean(),
});

export const bankAccountSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  branchCode: z.string().optional(),
  swiftCode: z.string().optional(),
  isDefault: z.boolean(),
});

export const salaryProfileSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  salaryComponentId: z.string().min(1, 'Salary component is required'),
  effectiveFrom: z.string().min(1, 'Effective from is required'),
  effectiveTo: z.string().optional(),
  customValue: z.number().optional(),
});

export const bulkSalaryProfileSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  salaryComponentId: z.string().min(1, 'Salary component is required'),
  customValue: z.number().optional(),
  effectiveFrom: z.string().min(1, 'Effective from is required'),
  effectiveTo: z.string().optional(),
});

export const disbursementEditSchema = z.object({
  allowanceAmount: z.number().min(0),
  overtimeAmount: z.number().min(0),
  bonusAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  deductionAmount: z.number().min(0),
});

export const applicantApprovalSchema = z.object({
  employeeNumber: z.string().min(1, 'Employee number is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY']),
  departmentId: z.string().min(1, 'Department is required'),
  positionId: z.string().min(1, 'Position is required'),
  shiftId: z.string().optional(),
  basicSalary: z.number().min(0),
  housingAllowance: z.number().min(0),
  transportAllowance: z.number().min(0),
});

export const reviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  cycle: z.string().min(1, 'Review cycle is required'),
  rating: z.number().min(1).max(5).optional(),
  goals: z.string().optional(),
  comments: z.string().optional(),
});

export const leaveBalanceEditSchema = z.object({
  entitledDays: z.number().min(0),
  carriedOverDays: z.number().min(0),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
export type PositionFormData = z.infer<typeof positionSchema>;
export type ShiftFormData = z.infer<typeof shiftSchema>;
export type ShiftAssignmentFormData = z.infer<typeof shiftAssignmentSchema>;
export type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;
export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
export type LeaveBalanceFormData = z.infer<typeof leaveBalanceSchema>;
export type LeaveBalanceEditFormData = z.infer<typeof leaveBalanceEditSchema>;
export type HolidayFormData = z.infer<typeof holidaySchema>;
export type PayrollPeriodFormData = z.infer<typeof payrollPeriodSchema>;
export type PayrollPeriodEditFormData = z.infer<typeof payrollPeriodEditSchema>;
export type SalaryComponentFormData = z.infer<typeof salaryComponentSchema>;
export type BankAccountFormData = z.infer<typeof bankAccountSchema>;
export type SalaryProfileFormData = z.infer<typeof salaryProfileSchema>;
export type BulkSalaryProfileFormData = z.infer<typeof bulkSalaryProfileSchema>;
export type DisbursementEditFormData = z.infer<typeof disbursementEditSchema>;
export type ApplicantApprovalFormData = z.infer<typeof applicantApprovalSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
