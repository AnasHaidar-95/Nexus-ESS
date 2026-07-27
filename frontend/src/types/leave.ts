import type { LeaveRequestStatus, ChangeRequestStatus, ReviewStatus } from './enums';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  carryForward: boolean;
  maxDaysPerYear: number;
  status: string;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitledDays: number;
  usedDays: number;
  carriedOverDays: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approverId?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LeaveApprovalStep {
  id: string;
  leaveRequestId: string;
  approverId: string;
  approverOrder: number;
  status: LeaveRequestStatus;
  comments?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface ProfileChangeRequest {
  id: string;
  employeeId: string;
  field: string;
  oldValue?: string;
  newValue: string;
  status: ChangeRequestStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}
