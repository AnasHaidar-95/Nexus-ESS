import type { EmployeeRecordStatus, EmploymentStatus, EmploymentType, Gender } from './enums';

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  managerId?: string;
  parentId?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string;
  grade?: number;
  status: string;
  parentId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender?: Gender;
  dateOfBirth?: string;
  nationalId?: string;
  passportNumber?: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  departmentId?: string;
  positionId?: string;
  department?: { id: string; name: string; code: string };
  position?: { id: string; name: string; code: string };
  managerId?: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: string;
  terminationDate?: string;
  status: EmployeeRecordStatus;
  notes?: string;
  createdAt: string;
}

export interface EmployeeRef {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
}

export interface EmployeeBankAccount {
  id: string;
  employeeId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchCode?: string;
  swiftCode?: string;
  isDefault: boolean;
  status: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  cycle: string;
  rating?: number;
  goals?: unknown;
  comments?: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
}
