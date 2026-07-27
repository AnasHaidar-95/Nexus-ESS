const PERMISSIONS = {
  USERS: {
    READ: 'users.read',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE: 'users.manage',
    RESET_PASSWORD: 'users.resetPassword',
    ASSIGN_ROLE: 'users.assignRole',
    ACTIVATE: 'users.activate',
    DEACTIVATE: 'users.deactivate',
    LOCK: 'users.lock',
    UNLOCK: 'users.unlock',
  },
  ROLES: {
    READ: 'roles.read',
    CREATE: 'roles.create',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete',
    ASSIGN_PERMISSIONS: 'roles.assignPermissions',
  },
  PERMISSIONS: {
    READ: 'permissions.read',
  },

  LEAVE_TYPES: {
    READ: 'leaveTypes.read',
    CREATE: 'leaveTypes.create',
    UPDATE: 'leaveTypes.update',
    DELETE: 'leaveTypes.delete',
    ACTIVATE: 'leaveTypes.activate',
    DEACTIVATE: 'leaveTypes.deactivate',
  },
  LEAVE_BALANCES: {
    READ: 'leaveBalances.read',
    CREATE: 'leaveBalances.create',
    UPDATE: 'leaveBalances.update',
  },
  LEAVE_REQUESTS: {
    READ: 'leaveRequests.read',
    CREATE: 'leaveRequests.create',
    UPDATE: 'leaveRequests.update',
    APPROVE: 'leaveRequests.approve',
    REJECT: 'leaveRequests.reject',
    CANCEL: 'leaveRequests.cancel',
  },
  EMPLOYEE_BANK_ACCOUNTS: {
    READ: 'employeeBankAccounts.read',
    CREATE: 'employeeBankAccounts.create',
    UPDATE: 'employeeBankAccounts.update',
    DELETE: 'employeeBankAccounts.delete',
    SET_DEFAULT: 'employeeBankAccounts.setDefault',
  },
  EMPLOYEE_SALARY_PROFILES: {
    READ: 'employeeSalaryProfiles.read',
    CREATE: 'employeeSalaryProfiles.create',
    UPDATE: 'employeeSalaryProfiles.update',
    END: 'employeeSalaryProfiles.end',
    DELETE: 'employeeSalaryProfiles.delete',
  },
  PERFORMANCE_REVIEWS: {
    READ: 'performanceReviews.read',
    CREATE: 'performanceReviews.create',
    UPDATE: 'performanceReviews.update',
    SUBMIT: 'performanceReviews.submit',
    ACKNOWLEDGE: 'performanceReviews.acknowledge',
    COMPLETE: 'performanceReviews.complete',
  },
  NOTIFICATIONS: {
    READ: 'notifications.read',
    CREATE: 'notifications.create',
    UPDATE: 'notifications.update',
    DELETE: 'notifications.delete',
    MARK_READ: 'notifications.markRead',
    MARK_ALL_READ: 'notifications.markAllRead',
  },
  PROFILE_CHANGE_REQUESTS: {
    READ: 'profileChangeRequests.read',
    CREATE: 'profileChangeRequests.create',
    APPROVE: 'profileChangeRequests.approve',
    REJECT: 'profileChangeRequests.reject',
    DELETE: 'profileChangeRequests.delete',
  },
  PAYROLL_DISBURSEMENTS: {
    READ: 'payrollDisbursements.read',
    UPDATE: 'payrollDisbursements.update',
    MARK_PAID: 'payrollDisbursements.markPaid',
    DELETE: 'payrollDisbursements.delete',
  },
  PAYSLIP_ITEMS: {
    READ: 'payslipItems.read',
  },

  EMPLOYEES: {
    READ: 'employees.read',
    CREATE: 'employees.create',
    UPDATE: 'employees.update',
    DELETE: 'employees.delete',
    ACTIVATE: 'employees.activate',
    TERMINATE: 'employees.terminate',
    CHANGE_DEPARTMENT: 'employees.changeDepartment',
    CHANGE_POSITION: 'employees.changePosition',
    CHANGE_MANAGER: 'employees.changeManager',
  },
  DEPARTMENTS: {
    READ: 'departments.read',
    CREATE: 'departments.create',
    UPDATE: 'departments.update',
    DELETE: 'departments.delete',
    MANAGE: 'departments.manage',
    ASSIGN_MANAGER: 'departments.assignManager',
    ACTIVATE: 'departments.activate',
    DEACTIVATE: 'departments.deactivate',
  },
  POSITIONS: {
    READ: 'positions.read',
    CREATE: 'positions.create',
    UPDATE: 'positions.update',
    DELETE: 'positions.delete',
    MANAGE: 'positions.manage',
    ACTIVATE: 'positions.activate',
    DEACTIVATE: 'positions.deactivate',
  },
  SHIFTS: {
    READ: 'shifts.read',
    CREATE: 'shifts.create',
    UPDATE: 'shifts.update',
    DELETE: 'shifts.delete',
    MANAGE: 'shifts.manage',
    ACTIVATE: 'shifts.activate',
    DEACTIVATE: 'shifts.deactivate',
  },
  SHIFT_ASSIGNMENTS: {
    READ: 'shiftAssignments.read',
    CREATE: 'shiftAssignments.create',
    UPDATE: 'shiftAssignments.update',
    DELETE: 'shiftAssignments.delete',
    BULK_ASSIGN: 'shiftAssignments.bulkAssign',
  },
  ATTENDANCE: {
    READ: 'attendance.read',
    CREATE: 'attendance.create',
    UPDATE: 'attendance.update',
    DELETE: 'attendance.delete',
    CORRECT: 'attendance.correct',
    APPROVE: 'attendance.approve',
    RECALCULATE: 'attendance.recalculate',
  },
  ATTENDANCE_INCIDENTS: {
    READ: 'attendanceIncidents.read',
    CREATE: 'attendanceIncidents.create',
    UPDATE: 'attendanceIncidents.update',
    DELETE: 'attendanceIncidents.delete',
    APPROVE: 'attendanceIncidents.approve',
    REJECT: 'attendanceIncidents.reject',
    RESOLVE: 'attendanceIncidents.resolve',
    REOPEN: 'attendanceIncidents.reopen',
    COMMENT: 'attendanceIncidents.comment',
  },
  ATTENDANCE_DEVICES: {
    READ: 'attendanceDevices.read',
    CREATE: 'attendanceDevices.create',
    UPDATE: 'attendanceDevices.update',
    DELETE: 'attendanceDevices.delete',
    SYNC: 'attendanceDevices.sync',
    TEST: 'attendanceDevices.test',
    ACTIVATE: 'attendanceDevices.activate',
    DEACTIVATE: 'attendanceDevices.deactivate',
  },
  HOLIDAYS: {
    READ: 'holidays.read',
    CREATE: 'holidays.create',
    UPDATE: 'holidays.update',
    DELETE: 'holidays.delete',
    MANAGE: 'holidays.manage',
    ACTIVATE: 'holidays.activate',
    DEACTIVATE: 'holidays.deactivate',
  },
  PAYROLL: {
    READ: 'payroll.read',
    GENERATE: 'payroll.generate',
    UPDATE: 'payroll.update',
    APPROVE: 'payroll.approve',
    FINALIZE: 'payroll.finalize',
    REOPEN: 'payroll.reopen',
    RECALCULATE: 'payroll.recalculate',
    CANCEL: 'payroll.cancel',
  },
  PAYROLL_PERIODS: {
    READ: 'payrollPeriods.read',
    CREATE: 'payrollPeriods.create',
    UPDATE: 'payrollPeriods.update',
    DELETE: 'payrollPeriods.delete',
    OPEN: 'payrollPeriods.open',
    CLOSE: 'payrollPeriods.close',
    LOCK: 'payrollPeriods.lock',
    UNLOCK: 'payrollPeriods.unlock',
  },
  SALARY_COMPONENTS: {
    READ: 'salaryComponents.read',
    CREATE: 'salaryComponents.create',
    UPDATE: 'salaryComponents.update',
    DELETE: 'salaryComponents.delete',
    ACTIVATE: 'salaryComponents.activate',
  },
  DOCUMENTS: {
    READ: 'documents.read',
    UPLOAD: 'documents.upload',
    UPDATE: 'documents.update',
    DELETE: 'documents.delete',
    DOWNLOAD: 'documents.download',
    RESTORE: 'documents.restore',
  },
  DOCUMENT_CATEGORIES: {
    READ: 'documentCategories.read',
    CREATE: 'documentCategories.create',
    UPDATE: 'documentCategories.update',
    DELETE: 'documentCategories.delete',
    ACTIVATE: 'documentCategories.activate',
    DEACTIVATE: 'documentCategories.deactivate',
  },

  SETTINGS: {
    READ: 'settings.read',
    UPDATE: 'settings.update',
    RESET: 'settings.reset',
  },
  DASHBOARD: {
    READ: 'dashboard.read',
    ADMIN: 'dashboard.admin',
    HR: 'dashboard.hr',
    PAYROLL: 'dashboard.payroll',
    ATTENDANCE: 'dashboard.attendance',
  },
  STATISTICS: {
    ORGANIZATION: 'statistics.organization',
    ATTENDANCE: 'statistics.attendance',
    PAYROLL: 'statistics.payroll',
    EMPLOYEES: 'statistics.employees',
  },
  AUDIT: {
    READ: 'audit.read',
    CREATE: 'audit.create',
    EXPORT: 'audit.export',
  },
  APPLICANTS: {
    READ: 'applicants.read',
    APPROVE: 'applicants.approve',
    REJECT: 'applicants.reject',
  },
};

// --- Deep Freeze Utility ---
const deepFreeze = (obj) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return Object.freeze(obj);
};

deepFreeze(PERMISSIONS);

// --- Helper for Database Seeding ---

export const getFlatPermissions = () => {
  const flatList = [];
  for (const category of Object.values(PERMISSIONS)) {
    for (const permission of Object.values(category)) {
      flatList.push(permission);
    }
  }
  return flatList;
};

export { PERMISSIONS };
