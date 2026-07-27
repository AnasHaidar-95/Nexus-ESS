export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED' | 'PENDING_APPROVAL';

export type ApplicantDocCategory = 'CV' | 'CERTIFICATE';

export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export type SalaryComponentType = 'EARNING' | 'DEDUCTION';

export type CalculationMethod = 'FIXED' | 'PERCENTAGE' | 'FORMULA' | 'MANUAL';

export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export type PositionStatus = 'ACTIVE' | 'INACTIVE';

export type StandardStatus = 'ACTIVE' | 'INACTIVE';

export type EmployeeRecordStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type EmploymentStatus = 'ACTIVE' | 'PROBATION' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED' | 'RETIRED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY';

export type Gender = 'MALE' | 'FEMALE';

export type ShiftStatus = 'ACTIVE' | 'INACTIVE';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND' | 'INCOMPLETE';

export type AttendanceIncidentType =
  | 'LATE_ARRIVAL'
  | 'EARLY_DEPARTURE'
  | 'MISSING_CHECK_IN'
  | 'MISSING_CHECK_OUT'
  | 'UNAUTHORIZED_ABSENCE'
  | 'DEVICE_ERROR'
  | 'MANUAL_CORRECTION';

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RESOLVED' | 'CANCELLED';

export type DeviceType = 'FINGERPRINT' | 'FACE_RECOGNITION' | 'RFID' | 'QR_CODE' | 'MOBILE';

export type DeviceConnectionStatus = 'ONLINE' | 'OFFLINE' | 'SYNCHRONIZING' | 'ERROR' | 'MAINTENANCE';

export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'SUCCESS'
  | 'ERROR'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PAYROLL_READY'
  | 'DOCUMENT_REQUEST'
  | 'ANNOUNCEMENT';

export type ChangeRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ReviewStatus = 'DRAFT' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'COMPLETED';

export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type PayrollStatus = 'DRAFT' | 'APPROVED' | 'PAID' | 'CANCELLED';

export type PayrollPeriodStatus = 'DRAFT' | 'OPEN' | 'PROCESSING' | 'CLOSED' | 'LOCKED' | 'CANCELLED';

export type CategoryStatus = 'ACTIVE' | 'INACTIVE';

export type DocumentStatus = 'ACTIVE' | 'ARCHIVED';

export type HolidayType = 'PUBLIC' | 'COMPANY' | 'REGIONAL' | 'RELIGIOUS' | 'SPECIAL';

export type HolidayStatus = 'ACTIVE' | 'INACTIVE';

export type SettingValueType = 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'JSON';

export type SettingStatus = 'ACTIVE' | 'INACTIVE';

export type AuditEventType =
  | 'AUTHENTICATION'
  | 'SECURITY'
  | 'USER_MANAGEMENT'
  | 'EMPLOYEE'
  | 'ATTENDANCE'
  | 'PAYROLL'
  | 'DOCUMENT'
  | 'SYSTEM_CONFIGURATION'
  | 'ROLE_PERMISSION'
  | 'ORGANIZATION'
  | 'OTHER';
