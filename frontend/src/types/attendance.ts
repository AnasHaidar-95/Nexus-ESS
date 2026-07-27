import type {
  AttendanceStatus,
  AttendanceIncidentType,
  IncidentSeverity,
  IncidentStatus,
  DeviceType,
  DeviceConnectionStatus,
} from './enums';

export interface Shift {
  id: string;
  name: string;
  code: string;
  description?: string;
  startTimeMinutes: number;
  endTimeMinutes: number;
  breakMinutes: number;
  graceMinutes: number;
  status: string;
  createdAt: string;
}

export interface EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  daysOfWeek?: string[];
  notes?: string;
  createdAt: string;
}

export interface AttendanceDevice {
  id: string;
  deviceCode: string;
  deviceName: string;
  deviceType: DeviceType;
  manufacturer: string;
  model?: string;
  serialNumber: string;
  ipAddress: string;
  port: number;
  location: string;
  status: string;
  connectionStatus: DeviceConnectionStatus;
  lastPingAt?: string;
  lastSyncAt?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  shiftId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  workedMinutes?: number;
  overtimeMinutes?: number;
  status: AttendanceStatus;
  notes?: string;
  deviceId?: string;
  isManualEntry: boolean;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  correctionReason?: string;
  correctedBy?: string;
  correctedAt?: string;
  createdAt: string;
}

export interface AttendanceIncident {
  id: string;
  recordId: string;
  type: AttendanceIncidentType;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
  record?: {
    id: string;
    date: string;
    status: string;
    employee?: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
      status: string;
    };
  };
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  type: string;
  description?: string;
  region?: string;
  isPaid: boolean;
  isRecurring: boolean;
  status: string;
  createdAt: string;
}
