import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing in your .env file.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 12;

// ==========================================
// PERMISSIONS
// ==========================================
const PERMISSIONS_DATA = [
  { code: 'users.read', name: 'Read Users', module: 'Users', isSystem: true },
  { code: 'users.create', name: 'Create Users', module: 'Users', isSystem: true },
  { code: 'users.update', name: 'Update Users', module: 'Users', isSystem: true },
  { code: 'users.delete', name: 'Delete Users', module: 'Users', isSystem: true },
  { code: 'users.manage', name: 'Manage Users', module: 'Users', isSystem: true },
  { code: 'users.resetPassword', name: 'Reset User Password', module: 'Users', isSystem: true },
  { code: 'users.assignRole', name: 'Assign User Role', module: 'Users', isSystem: true },
  { code: 'users.activate', name: 'Activate Users', module: 'Users', isSystem: true },
  { code: 'users.deactivate', name: 'Deactivate Users', module: 'Users', isSystem: true },
  { code: 'users.lock', name: 'Lock Users', module: 'Users', isSystem: true },
  { code: 'users.unlock', name: 'Unlock Users', module: 'Users', isSystem: true },

  { code: 'roles.read', name: 'Read Roles', module: 'Roles', isSystem: true },
  { code: 'roles.create', name: 'Create Roles', module: 'Roles', isSystem: true },
  { code: 'roles.update', name: 'Update Roles', module: 'Roles', isSystem: true },
  { code: 'roles.delete', name: 'Delete Roles', module: 'Roles', isSystem: true },
  { code: 'roles.manage', name: 'Manage Roles', module: 'Roles', isSystem: true },
  { code: 'roles.assignPermissions', name: 'Assign Role Permissions', module: 'Roles', isSystem: true },

  { code: 'permissions.read', name: 'Read Permissions', module: 'Permissions', isSystem: true },

  { code: 'settings.read', name: 'Read Settings', module: 'Settings', isSystem: true },
  { code: 'settings.update', name: 'Update Settings', module: 'Settings', isSystem: true },
  { code: 'settings.reset', name: 'Reset Settings', module: 'Settings', isSystem: true },

  { code: 'audit.read', name: 'Read Audit Logs', module: 'Audit', isSystem: true },
  { code: 'audit.create', name: 'Create Audit Logs', module: 'Audit', isSystem: true },
  { code: 'audit.export', name: 'Export Audit Logs', module: 'Audit', isSystem: true },

  { code: 'departments.read', name: 'Read Departments', module: 'Departments', isSystem: true },
  { code: 'departments.create', name: 'Create Departments', module: 'Departments', isSystem: true },
  { code: 'departments.update', name: 'Update Departments', module: 'Departments', isSystem: true },
  { code: 'departments.delete', name: 'Delete Departments', module: 'Departments', isSystem: true },
  { code: 'departments.manage', name: 'Manage Departments', module: 'Departments', isSystem: true },
  { code: 'departments.assignManager', name: 'Assign Department Manager', module: 'Departments', isSystem: true },
  { code: 'departments.activate', name: 'Activate Departments', module: 'Departments', isSystem: true },
  { code: 'departments.deactivate', name: 'Deactivate Departments', module: 'Departments', isSystem: true },

  { code: 'positions.read', name: 'Read Positions', module: 'Positions', isSystem: true },
  { code: 'positions.create', name: 'Create Positions', module: 'Positions', isSystem: true },
  { code: 'positions.update', name: 'Update Positions', module: 'Positions', isSystem: true },
  { code: 'positions.delete', name: 'Delete Positions', module: 'Positions', isSystem: true },
  { code: 'positions.manage', name: 'Manage Positions', module: 'Positions', isSystem: true },
  { code: 'positions.activate', name: 'Activate Positions', module: 'Positions', isSystem: true },
  { code: 'positions.deactivate', name: 'Deactivate Positions', module: 'Positions', isSystem: true },

  { code: 'employees.read', name: 'Read Employees', module: 'Employees', isSystem: true },
  { code: 'employees.create', name: 'Create Employees', module: 'Employees', isSystem: true },
  { code: 'employees.update', name: 'Update Employees', module: 'Employees', isSystem: true },
  { code: 'employees.delete', name: 'Delete Employees', module: 'Employees', isSystem: true },
  { code: 'employees.activate', name: 'Activate Employees', module: 'Employees', isSystem: true },
  { code: 'employees.terminate', name: 'Terminate Employees', module: 'Employees', isSystem: true },
  { code: 'employees.changeDepartment', name: 'Change Employee Department', module: 'Employees', isSystem: true },
  { code: 'employees.changePosition', name: 'Change Employee Position', module: 'Employees', isSystem: true },
  { code: 'employees.changeManager', name: 'Change Employee Manager', module: 'Employees', isSystem: true },

  { code: 'shifts.read', name: 'Read Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.create', name: 'Create Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.update', name: 'Update Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.delete', name: 'Delete Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.manage', name: 'Manage Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.activate', name: 'Activate Shifts', module: 'Shifts', isSystem: true },
  { code: 'shifts.deactivate', name: 'Deactivate Shifts', module: 'Shifts', isSystem: true },

  { code: 'shiftAssignments.read', name: 'Read Shift Assignments', module: 'Shift Assignments', isSystem: true },
  { code: 'shiftAssignments.create', name: 'Create Shift Assignments', module: 'Shift Assignments', isSystem: true },
  { code: 'shiftAssignments.update', name: 'Update Shift Assignments', module: 'Shift Assignments', isSystem: true },
  { code: 'shiftAssignments.delete', name: 'Delete Shift Assignments', module: 'Shift Assignments', isSystem: true },
  { code: 'shiftAssignments.bulkAssign', name: 'Bulk Assign Shifts', module: 'Shift Assignments', isSystem: true },

  { code: 'attendance.read', name: 'Read Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.create', name: 'Create Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.update', name: 'Update Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.delete', name: 'Delete Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.correct', name: 'Correct Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.approve', name: 'Approve Attendance', module: 'Attendance', isSystem: true },
  { code: 'attendance.recalculate', name: 'Recalculate Attendance', module: 'Attendance', isSystem: true },

  { code: 'attendanceIncidents.read', name: 'Read Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.create', name: 'Create Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.update', name: 'Update Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.delete', name: 'Delete Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.approve', name: 'Approve Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.reject', name: 'Reject Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.resolve', name: 'Resolve Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.reopen', name: 'Reopen Attendance Incidents', module: 'Attendance Incidents', isSystem: true },
  { code: 'attendanceIncidents.comment', name: 'Comment on Attendance Incidents', module: 'Attendance Incidents', isSystem: true },

  { code: 'attendanceDevices.read', name: 'Read Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.create', name: 'Create Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.update', name: 'Update Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.delete', name: 'Delete Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.sync', name: 'Sync Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.test', name: 'Test Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.activate', name: 'Activate Attendance Devices', module: 'Attendance Devices', isSystem: true },
  { code: 'attendanceDevices.deactivate', name: 'Deactivate Attendance Devices', module: 'Attendance Devices', isSystem: true },

  { code: 'holidays.read', name: 'Read Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.create', name: 'Create Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.update', name: 'Update Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.delete', name: 'Delete Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.manage', name: 'Manage Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.activate', name: 'Activate Holidays', module: 'Holidays', isSystem: true },
  { code: 'holidays.deactivate', name: 'Deactivate Holidays', module: 'Holidays', isSystem: true },

  { code: 'documents.read', name: 'Read Documents', module: 'Documents', isSystem: true },
  { code: 'documents.upload', name: 'Upload Documents', module: 'Documents', isSystem: true },
  { code: 'documents.update', name: 'Update Documents', module: 'Documents', isSystem: true },
  { code: 'documents.delete', name: 'Delete Documents', module: 'Documents', isSystem: true },
  { code: 'documents.download', name: 'Download Documents', module: 'Documents', isSystem: true },
  { code: 'documents.restore', name: 'Restore Documents', module: 'Documents', isSystem: true },
  { code: 'documents.manageCategories', name: 'Manage Document Categories', module: 'Documents', isSystem: true },

  { code: 'documentCategories.read', name: 'Read Document Categories', module: 'Document Categories', isSystem: true },
  { code: 'documentCategories.create', name: 'Create Document Categories', module: 'Document Categories', isSystem: true },
  { code: 'documentCategories.update', name: 'Update Document Categories', module: 'Document Categories', isSystem: true },
  { code: 'documentCategories.delete', name: 'Delete Document Categories', module: 'Document Categories', isSystem: true },
  { code: 'documentCategories.activate', name: 'Activate Document Categories', module: 'Document Categories', isSystem: true },
  { code: 'documentCategories.deactivate', name: 'Deactivate Document Categories', module: 'Document Categories', isSystem: true },

  { code: 'payroll.read', name: 'Read Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.generate', name: 'Generate Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.update', name: 'Update Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.approve', name: 'Approve Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.finalize', name: 'Finalize Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.reopen', name: 'Reopen Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.recalculate', name: 'Recalculate Payroll', module: 'Payroll', isSystem: true },
  { code: 'payroll.cancel', name: 'Cancel Payroll', module: 'Payroll', isSystem: true },

  { code: 'payrollPeriods.read', name: 'Read Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.create', name: 'Create Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.update', name: 'Update Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.delete', name: 'Delete Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.open', name: 'Open Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.close', name: 'Close Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.lock', name: 'Lock Payroll Periods', module: 'Payroll Periods', isSystem: true },
  { code: 'payrollPeriods.unlock', name: 'Unlock Payroll Periods', module: 'Payroll Periods', isSystem: true },

  { code: 'salaryComponents.read', name: 'Read Salary Components', module: 'Salary Components', isSystem: true },
  { code: 'salaryComponents.create', name: 'Create Salary Components', module: 'Salary Components', isSystem: true },
  { code: 'salaryComponents.update', name: 'Update Salary Components', module: 'Salary Components', isSystem: true },
  { code: 'salaryComponents.delete', name: 'Delete Salary Components', module: 'Salary Components', isSystem: true },
  { code: 'salaryComponents.activate', name: 'Activate Salary Components', module: 'Salary Components', isSystem: true },
  { code: 'salaryComponents.deactivate', name: 'Deactivate Salary Components', module: 'Salary Components', isSystem: true },

  { code: 'dashboard.read', name: 'View General Dashboard', module: 'Dashboard', isSystem: true },
  { code: 'dashboard.admin', name: 'View Admin Dashboard', module: 'Dashboard', isSystem: true },
  { code: 'dashboard.hr', name: 'View HR Dashboard', module: 'Dashboard', isSystem: true },
  { code: 'dashboard.payroll', name: 'View Payroll Dashboard', module: 'Dashboard', isSystem: true },
  { code: 'dashboard.attendance', name: 'View Attendance Dashboard', module: 'Dashboard', isSystem: true },

  { code: 'statistics.organization', name: 'View Organization Statistics', module: 'Statistics', isSystem: true },
  { code: 'statistics.attendance', name: 'View Attendance Statistics', module: 'Statistics', isSystem: true },
  { code: 'statistics.payroll', name: 'View Payroll Statistics', module: 'Statistics', isSystem: true },
  { code: 'statistics.employees', name: 'View Employee Statistics', module: 'Statistics', isSystem: true },

  { code: 'leaveTypes.read', name: 'Read Leave Types', module: 'Leave Types', isSystem: true },
  { code: 'leaveTypes.create', name: 'Create Leave Types', module: 'Leave Types', isSystem: true },
  { code: 'leaveTypes.update', name: 'Update Leave Types', module: 'Leave Types', isSystem: true },
  { code: 'leaveTypes.delete', name: 'Delete Leave Types', module: 'Leave Types', isSystem: true },
  { code: 'leaveTypes.activate', name: 'Activate Leave Types', module: 'Leave Types', isSystem: true },
  { code: 'leaveTypes.deactivate', name: 'Deactivate Leave Types', module: 'Leave Types', isSystem: true },

  { code: 'leaveBalances.read', name: 'Read Leave Balances', module: 'Leave Balances', isSystem: true },
  { code: 'leaveBalances.create', name: 'Create Leave Balances', module: 'Leave Balances', isSystem: true },
  { code: 'leaveBalances.update', name: 'Update Leave Balances', module: 'Leave Balances', isSystem: true },

  { code: 'leaveRequests.read', name: 'Read Leave Requests', module: 'Leave Requests', isSystem: true },
  { code: 'leaveRequests.create', name: 'Create Leave Requests', module: 'Leave Requests', isSystem: true },
  { code: 'leaveRequests.update', name: 'Update Leave Requests', module: 'Leave Requests', isSystem: true },
  { code: 'leaveRequests.approve', name: 'Approve Leave Requests', module: 'Leave Requests', isSystem: true },
  { code: 'leaveRequests.reject', name: 'Reject Leave Requests', module: 'Leave Requests', isSystem: true },
  { code: 'leaveRequests.cancel', name: 'Cancel Leave Requests', module: 'Leave Requests', isSystem: true },

  { code: 'employeeBankAccounts.read', name: 'Read Employee Bank Accounts', module: 'Employee Bank Accounts', isSystem: true },
  { code: 'employeeBankAccounts.create', name: 'Create Employee Bank Accounts', module: 'Employee Bank Accounts', isSystem: true },
  { code: 'employeeBankAccounts.update', name: 'Update Employee Bank Accounts', module: 'Employee Bank Accounts', isSystem: true },
  { code: 'employeeBankAccounts.delete', name: 'Delete Employee Bank Accounts', module: 'Employee Bank Accounts', isSystem: true },
  { code: 'employeeBankAccounts.setDefault', name: 'Set Default Bank Account', module: 'Employee Bank Accounts', isSystem: true },

  { code: 'employeeSalaryProfiles.read', name: 'Read Employee Salary Profiles', module: 'Employee Salary Profiles', isSystem: true },
  { code: 'employeeSalaryProfiles.create', name: 'Create Employee Salary Profiles', module: 'Employee Salary Profiles', isSystem: true },
  { code: 'employeeSalaryProfiles.update', name: 'Update Employee Salary Profiles', module: 'Employee Salary Profiles', isSystem: true },
  { code: 'employeeSalaryProfiles.end', name: 'End Employee Salary Profile', module: 'Employee Salary Profiles', isSystem: true },
  { code: 'employeeSalaryProfiles.delete', name: 'Delete Employee Salary Profile', module: 'Employee Salary Profiles', isSystem: true },

  { code: 'performanceReviews.read', name: 'Read Performance Reviews', module: 'Performance Reviews', isSystem: true },
  { code: 'performanceReviews.create', name: 'Create Performance Reviews', module: 'Performance Reviews', isSystem: true },
  { code: 'performanceReviews.update', name: 'Update Performance Reviews', module: 'Performance Reviews', isSystem: true },
  { code: 'performanceReviews.submit', name: 'Submit Performance Reviews', module: 'Performance Reviews', isSystem: true },
  { code: 'performanceReviews.acknowledge', name: 'Acknowledge Performance Reviews', module: 'Performance Reviews', isSystem: true },
  { code: 'performanceReviews.complete', name: 'Complete Performance Reviews', module: 'Performance Reviews', isSystem: true },

  { code: 'notifications.read', name: 'Read Notifications', module: 'Notifications', isSystem: true },
  { code: 'notifications.update', name: 'Update Notifications', module: 'Notifications', isSystem: true },
  { code: 'notifications.delete', name: 'Delete Notifications', module: 'Notifications', isSystem: true },
  { code: 'notifications.markRead', name: 'Mark Notifications as Read', module: 'Notifications', isSystem: true },
  { code: 'notifications.markAllRead', name: 'Mark All Notifications as Read', module: 'Notifications', isSystem: true },
  { code: 'notifications.create', name: 'Create Notifications', module: 'Notifications', isSystem: true },

  { code: 'profileChangeRequests.read', name: 'Read Profile Change Requests', module: 'Profile Change Requests', isSystem: true },
  { code: 'profileChangeRequests.create', name: 'Create Profile Change Requests', module: 'Profile Change Requests', isSystem: true },
  { code: 'profileChangeRequests.approve', name: 'Approve Profile Change Requests', module: 'Profile Change Requests', isSystem: true },
  { code: 'profileChangeRequests.reject', name: 'Reject Profile Change Requests', module: 'Profile Change Requests', isSystem: true },
  { code: 'profileChangeRequests.delete', name: 'Delete Profile Change Requests', module: 'Profile Change Requests', isSystem: true },

  { code: 'payrollDisbursements.read', name: 'Read Payroll Disbursements', module: 'Payroll Disbursements', isSystem: true },
  { code: 'payrollDisbursements.update', name: 'Update Payroll Disbursements', module: 'Payroll Disbursements', isSystem: true },
  { code: 'payrollDisbursements.markPaid', name: 'Mark Payroll Disbursements as Paid', module: 'Payroll Disbursements', isSystem: true },
  { code: 'payrollDisbursements.delete', name: 'Delete Payroll Disbursements', module: 'Payroll Disbursements', isSystem: true },

  { code: 'payslipItems.read', name: 'Read Payslip Items', module: 'Payslip Items', isSystem: true },

  { code: 'applicants.read', name: 'Read Applicants', module: 'Applicants', isSystem: true },
  { code: 'applicants.approve', name: 'Approve Applicants', module: 'Applicants', isSystem: true },
  { code: 'applicants.reject', name: 'Reject Applicants', module: 'Applicants', isSystem: true },
];

// ==========================================
// ROLE PERMISSION MAPPING
// ==========================================
function buildRolePermissions(permMap, roleMap) {
  const rolePermissions = [];

  const adminRoleId = roleMap.get('ADMIN');
  for (const permId of permMap.values()) {
    rolePermissions.push({ roleId: adminRoleId, permissionId: permId });
  }

  const hrManagerRoleId = roleMap.get('HR_MANAGER');
  const hrManagerExclusions = ['settings.', 'roles.', 'permissions.', 'attendanceDevices.', 'statistics.', 'dashboard.admin'];
  for (const [code, permId] of permMap.entries()) {
    if (!hrManagerExclusions.some(ex => code.startsWith(ex) || code === ex)) {
      rolePermissions.push({ roleId: hrManagerRoleId, permissionId: permId });
    }
  }

  const hrOfficerRoleId = roleMap.get('HR_OFF');
  const hrOfficerExclusions = [
    'settings.', 'roles.', 'permissions.', 'attendanceDevices.', 'statistics.', 'dashboard.admin',
    'leaveRequests.approve', 'leaveRequests.reject',
    'profileChangeRequests.approve', 'profileChangeRequests.reject',
    'payroll.generate', 'payroll.approve', 'payroll.update', 'payroll.finalize', 'payroll.reopen', 'payroll.recalculate', 'payroll.cancel',
    'payrollPeriods.create', 'payrollPeriods.update', 'payrollPeriods.delete', 'payrollPeriods.open', 'payrollPeriods.close', 'payrollPeriods.lock', 'payrollPeriods.unlock',
    'salaryComponents.create', 'salaryComponents.update', 'salaryComponents.delete',
    'employeeSalaryProfiles.create', 'employeeSalaryProfiles.update', 'employeeSalaryProfiles.end', 'employeeSalaryProfiles.delete',
    'departments.create', 'departments.update', 'departments.delete', 'departments.manage', 'departments.assignManager', 'departments.activate', 'departments.deactivate',
    'positions.create', 'positions.update', 'positions.delete', 'positions.manage', 'positions.activate', 'positions.deactivate',
    'shifts.create', 'shifts.update', 'shifts.delete', 'shifts.manage', 'shifts.activate', 'shifts.deactivate',
    'shiftAssignments.create', 'shiftAssignments.update', 'shiftAssignments.delete', 'shiftAssignments.bulkAssign',
    'employees.terminate', 'employees.changeDepartment', 'employees.changePosition', 'employees.changeManager', 'employees.activate',
    'attendanceIncidents.approve', 'attendanceIncidents.reject', 'attendanceIncidents.resolve', 'attendanceIncidents.reopen',
    'applicants.approve', 'applicants.reject',
  ];
  for (const [code, permId] of permMap.entries()) {
    if (!hrOfficerExclusions.some(ex => code.startsWith(ex) || code === ex)) {
      rolePermissions.push({ roleId: hrOfficerRoleId, permissionId: permId });
    }
  }

  const employeeRoleId = roleMap.get('EMPLOYEE');
  const employeeInclusions = [
    'dashboard.read', 'employees.read', 'attendance.read', 'attendance.create', 'attendance.correct',
    'payroll.read', 'documents.read', 'documents.download',
    'holidays.read', 'shifts.read', 'shiftAssignments.read',
    'leaveTypes.read', 'leaveBalances.read',
    'leaveRequests.read', 'leaveRequests.create', 'leaveRequests.cancel',
    'notifications.read', 'notifications.markRead', 'notifications.markAllRead', 'notifications.create',
    'employeeBankAccounts.read', 'employeeSalaryProfiles.read',
    'performanceReviews.read',
    'profileChangeRequests.read', 'profileChangeRequests.create',
    'users.read', 'salaryComponents.read', 'payrollDisbursements.read',
  ];
  for (const [code, permId] of permMap.entries()) {
    if (employeeInclusions.includes(code)) {
      rolePermissions.push({ roleId: employeeRoleId, permissionId: permId });
    }
  }

  return rolePermissions;
}

// ==========================================
// EMPLOYEE DATA
// ==========================================
const EMPLOYEE_DATA = [
  // 1. System Administrator
  {
    firstName: 'System', middleName: 'J', lastName: 'Administrator', preferredName: 'Admin',
    gender: 'MALE', email: 'admin@nexus.com', phone: '+1-555-100-0001',
    hireDate: '2019-03-15', department: 'IT', position: 'SYS_ADMIN', role: 'ADMIN',
    username: 'admin', password: 'Admin@12345',
    salary: 9500, housing: 2500, transport: 800,
  },
  // 2-3. HR Managers
  {
    firstName: 'Victoria', middleName: 'A', lastName: 'Chen', preferredName: 'Victoria',
    gender: 'FEMALE', email: 'hrm1@nexus.com', phone: '+1-555-100-0002',
    hireDate: '2018-07-01', department: 'HR', position: 'HR_MGR', role: 'HR_MANAGER',
    username: 'hrm1', password: 'Hrm1@12345',
    salary: 8500, housing: 2200, transport: 700,
  },
  {
    firstName: 'Daniel', middleName: 'R', lastName: 'Okafor', preferredName: 'Daniel',
    gender: 'MALE', email: 'hrm2@nexus.com', phone: '+1-555-100-0003',
    hireDate: '2020-01-10', department: 'HR', position: 'HR_MGR', role: 'HR_MANAGER',
    username: 'hrm2', password: 'Hrm2@12345',
    salary: 8200, housing: 2100, transport: 700,
  },
  // 4-8. HR Officers
  {
    firstName: 'Sarah', middleName: 'L', lastName: 'Mitchell', preferredName: 'Sarah',
    gender: 'FEMALE', email: 'hro1@nexus.com', phone: '+1-555-100-0004',
    hireDate: '2021-02-15', department: 'HR', position: 'HR_OFF', role: 'HR_OFF',
    username: 'hro1', password: 'Hro1@12345',
    salary: 5500, housing: 1500, transport: 500,
  },
  {
    firstName: 'Ahmad', middleName: 'K', lastName: 'Hassan', preferredName: 'Ahmad',
    gender: 'MALE', email: 'hro2@nexus.com', phone: '+1-555-100-0005',
    hireDate: '2021-06-01', department: 'HR', position: 'HR_OFF', role: 'HR_OFF',
    username: 'hro2', password: 'Hro2@12345',
    salary: 5300, housing: 1400, transport: 500,
  },
  {
    firstName: 'Priya', middleName: 'S', lastName: 'Sharma', preferredName: 'Priya',
    gender: 'FEMALE', email: 'hro3@nexus.com', phone: '+1-555-100-0006',
    hireDate: '2022-01-10', department: 'HR', position: 'HR_OFF', role: 'HR_OFF',
    username: 'hro3', password: 'Hro3@12345',
    salary: 5200, housing: 1300, transport: 500,
  },
  {
    firstName: 'James', middleName: 'T', lastName: 'Morrison', preferredName: 'James',
    gender: 'MALE', email: 'hro4@nexus.com', phone: '+1-555-100-0007',
    hireDate: '2022-05-20', department: 'HR', position: 'HR_OFF', role: 'HR_OFF',
    username: 'hro4', password: 'Hro4@12345',
    salary: 5100, housing: 1300, transport: 500,
  },
  {
    firstName: 'Olivia', middleName: 'N', lastName: 'Bennett', preferredName: 'Olivia',
    gender: 'FEMALE', email: 'hro5@nexus.com', phone: '+1-555-100-0008',
    hireDate: '2023-03-01', department: 'HR', position: 'HR_OFF', role: 'HR_OFF',
    username: 'hro5', password: 'Hro5@12345',
    salary: 5000, housing: 1200, transport: 500,
  },
  // 9-11. IT Employees
  {
    firstName: 'Ethan', middleName: 'P', lastName: 'Nakamura', preferredName: 'Ethan',
    gender: 'MALE', email: 'em1@nexus.com', phone: '+1-555-100-0009',
    hireDate: '2020-04-01', department: 'IT', position: 'SWE', role: 'EMPLOYEE',
    username: 'em1', password: 'Em1@12345',
    salary: 7500, housing: 2000, transport: 600,
  },
  {
    firstName: 'Sophia', middleName: 'M', lastName: 'Petrov', preferredName: 'Sophia',
    gender: 'FEMALE', email: 'em2@nexus.com', phone: '+1-555-100-0010',
    hireDate: '2021-08-15', department: 'IT', position: 'SWE', role: 'EMPLOYEE',
    username: 'em2', password: 'Em2@12345',
    salary: 7200, housing: 1900, transport: 600,
  },
  {
    firstName: 'Liam', middleName: 'D', lastName: 'Johansson', preferredName: 'Liam',
    gender: 'MALE', email: 'em3@nexus.com', phone: '+1-555-100-0011',
    hireDate: '2021-11-01', department: 'IT', position: 'SWE', role: 'EMPLOYEE',
    username: 'em3', password: 'Em3@12345',
    salary: 6300, housing: 1500, transport: 550,
  },
  // 12-14. Finance Employees
  {
    firstName: 'Isabella', middleName: 'G', lastName: 'Moretti', preferredName: 'Isabella',
    gender: 'FEMALE', email: 'em4@nexus.com', phone: '+1-555-100-0012',
    hireDate: '2022-03-01', department: 'FIN', position: 'ACC', role: 'EMPLOYEE',
    username: 'em4', password: 'Em4@12345',
    salary: 6800, housing: 1800, transport: 600,
  },
  {
    firstName: 'Noah', middleName: 'W', lastName: 'Anderson', preferredName: 'Noah',
    gender: 'MALE', email: 'em5@nexus.com', phone: '+1-555-100-0013',
    hireDate: '2023-01-15', department: 'FIN', position: 'ACC', role: 'EMPLOYEE',
    username: 'em5', password: 'Em5@12345',
    salary: 6300, housing: 1600, transport: 550,
  },
  {
    firstName: 'Emma', middleName: 'C', lastName: 'Dubois', preferredName: 'Emma',
    gender: 'FEMALE', email: 'em6@nexus.com', phone: '+1-555-100-0014',
    hireDate: '2023-07-01', department: 'FIN', position: 'ACC', role: 'EMPLOYEE',
    username: 'em6', password: 'Em6@12345',
    salary: 5800, housing: 1400, transport: 500,
  },
  // 15-18. Operations Employees
  {
    firstName: 'Alexander', middleName: 'I', lastName: 'Volkov', preferredName: 'Alexander',
    gender: 'MALE', email: 'em7@nexus.com', phone: '+1-555-100-0015',
    hireDate: '2019-09-01', department: 'OPS', position: 'OPS_SPEC', role: 'EMPLOYEE',
    username: 'em7', password: 'Em7@12345',
    salary: 6000, housing: 1500, transport: 500,
  },
  {
    firstName: 'Charlotte', middleName: 'E', lastName: 'Watanabe', preferredName: 'Charlotte',
    gender: 'FEMALE', email: 'em8@nexus.com', phone: '+1-555-100-0016',
    hireDate: '2020-06-15', department: 'OPS', position: 'OPS_SPEC', role: 'EMPLOYEE',
    username: 'em8', password: 'Em8@12345',
    salary: 5750, housing: 1400, transport: 500,
  },
  {
    firstName: 'Benjamin', middleName: 'H', lastName: 'Kowalski', preferredName: 'Benjamin',
    gender: 'MALE', email: 'em9@nexus.com', phone: '+1-555-100-0017',
    hireDate: '2021-04-01', department: 'OPS', position: 'OPS_SPEC', role: 'EMPLOYEE',
    username: 'em9', password: 'Em9@12345',
    salary: 5500, housing: 1350, transport: 500,
  },
  {
    firstName: 'Amelia', middleName: 'F', lastName: 'Santos', preferredName: 'Amelia',
    gender: 'FEMALE', email: 'em10@nexus.com', phone: '+1-555-100-0018',
    hireDate: '2022-09-01', department: 'OPS', position: 'OPS_SPEC', role: 'EMPLOYEE',
    username: 'em10', password: 'Em10@12345',
    salary: 5000, housing: 1200, transport: 500,
  },
];

// ==========================================
// HELPER: Get N past working days (Mon-Fri)
// ==========================================
function getPastWorkingDays(count) {
  const dates = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (dates.length < count) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(new Date(d));
    }
  }
  return dates.reverse();
}

// ==========================================
// HELPER: Get N future working days starting from offset
// ==========================================
function getFutureWorkingDays(offsetDays, count) {
  const dates = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  while (dates.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// ==========================================
// HELPER: Get past working day dates for a month ago
// ==========================================
function getDatesLastMonth(count) {
  const dates = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 30);
  while (dates.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(new Date(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('🌱 Starting production database seed...\n');

  // 1. PERMISSIONS
  console.log('🔐 Seeding Permissions...');
  await prisma.permission.createMany({ data: PERMISSIONS_DATA, skipDuplicates: true });
  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map(p => [p.code, p.id]));
  console.log(`   ${permMap.size} permissions created.\n`);

  // 2. ROLES
  console.log('👥 Seeding Roles...');
  const rolesData = [
    { name: 'System Administrator', code: 'ADMIN', description: 'Full system access with unrestricted administrative privileges', isSystem: true, status: 'ACTIVE' },
    { name: 'HR Manager', code: 'HR_MANAGER', description: 'Senior HR authority with approval and department management rights', isSystem: true, status: 'ACTIVE' },
    { name: 'HR Officer', code: 'HR_OFF', description: 'HR operational support for day-to-day personnel management tasks', isSystem: true, status: 'ACTIVE' },
    { name: 'Employee', code: 'EMPLOYEE', description: 'Standard employee self-service portal access', isSystem: true, status: 'ACTIVE' },
  ];
  await prisma.role.createMany({ data: rolesData, skipDuplicates: true });
  const allRoles = await prisma.role.findMany();
  const roleMap = new Map(allRoles.map(r => [r.code, r.id]));
  console.log(`   ${allRoles.length} roles created.\n`);

  // 3. ROLE PERMISSIONS
  console.log('🔗 Seeding Role Permissions...');
  const rolePermissions = buildRolePermissions(permMap, roleMap);
  await prisma.rolePermission.createMany({ data: rolePermissions, skipDuplicates: true });
  console.log(`   ${rolePermissions.length} role-permission mappings created.\n`);

  // 4. DEPARTMENTS
  console.log('🏢 Seeding Departments...');
  const departmentsData = [
    { name: 'Information Technology', code: 'IT', description: 'Software development, infrastructure, and technical operations', status: 'ACTIVE' },
    { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee relations, and organizational development', status: 'ACTIVE' },
    { name: 'Finance & Accounting', code: 'FIN', description: 'Financial planning, accounting, budgeting, and fiscal compliance', status: 'ACTIVE' },
    { name: 'Operations', code: 'OPS', description: 'Business operations, logistics, and process optimization', status: 'ACTIVE' },
  ];
  await prisma.department.createMany({ data: departmentsData, skipDuplicates: true });
  const allDepts = await prisma.department.findMany();
  const deptMap = new Map(allDepts.map(d => [d.code, d.id]));
  console.log(`   ${allDepts.length} departments created.\n`);

  // 5. POSITIONS
  console.log('💼 Seeding Positions...');
  const positionsData = [
    { name: 'System Administrator', code: 'SYS_ADMIN', description: 'Manages and maintains enterprise IT infrastructure and systems', grade: 8, status: 'ACTIVE' },
    { name: 'HR Manager', code: 'HR_MGR', description: 'Leads HR department operations and strategic talent management', grade: 7, status: 'ACTIVE' },
    { name: 'HR Officer', code: 'HR_OFF', description: 'Handles employee lifecycle management and HR administrative tasks', grade: 5, status: 'ACTIVE' },
    { name: 'Software Engineer', code: 'SWE', description: 'Designs, develops, and maintains software applications', grade: 6, status: 'ACTIVE' },
    { name: 'Accountant', code: 'ACC', description: 'Manages financial records, reporting, and compliance', grade: 5, status: 'ACTIVE' },
    { name: 'Operations Specialist', code: 'OPS_SPEC', description: 'Coordinates daily operational activities and process workflows', grade: 4, status: 'ACTIVE' },
  ];
  await prisma.position.createMany({ data: positionsData, skipDuplicates: true });
  const allPos = await prisma.position.findMany();
  const posMap = new Map(allPos.map(p => [p.code, p.id]));
  console.log(`   ${allPos.length} positions created.\n`);

  // 6. SHIFTS
  console.log('⏱️  Seeding Shifts...');
  const shiftsData = [
    { name: 'Morning Shift', code: 'MORNING', description: 'Standard morning work shift', startTimeMinutes: 480, endTimeMinutes: 960, breakMinutes: 60, graceMinutes: 10, status: 'ACTIVE' },
    { name: 'Evening Shift', code: 'EVENING', description: 'Afternoon to evening work shift', startTimeMinutes: 960, endTimeMinutes: 1320, breakMinutes: 60, graceMinutes: 10, status: 'ACTIVE' },
    { name: 'Night Shift', code: 'NIGHT', description: 'Overnight support and operations shift', startTimeMinutes: 1320, endTimeMinutes: 480, breakMinutes: 60, graceMinutes: 15, status: 'ACTIVE' },
  ];
  await prisma.shift.createMany({ data: shiftsData, skipDuplicates: true });
  const allShifts = await prisma.shift.findMany();
  const shiftMap = new Map(allShifts.map(s => [s.code, s.id]));
  console.log(`   ${allShifts.length} shifts created.\n`);

  // 7. SYSTEM SETTINGS
  console.log('⚙️  Seeding System Settings...');
  const settingsData = [
    { key: 'attendance.grace_minutes', name: 'Grace Period (Minutes)', category: 'Attendance', value: '10', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'attendance.minimum_hours', name: 'Minimum Working Hours', category: 'Attendance', value: '8', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'authentication.max_login_attempts', name: 'Max Login Attempts', category: 'Security', value: '5', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'authentication.lockout_minutes', name: 'Lockout Duration (Minutes)', category: 'Security', value: '15', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'documents.max_upload_size_mb', name: 'Max File Size (MB)', category: 'Documents', value: '10', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'payroll.currency', name: 'Default Currency', category: 'Payroll', value: 'USD', valueType: 'STRING', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
    { key: 'password.minimum_length', name: 'Minimum Password Length', category: 'Security', value: '8', valueType: 'INTEGER', isEditable: true, isEncrypted: false, status: 'ACTIVE' },
  ];
  await prisma.systemSetting.createMany({ data: settingsData, skipDuplicates: true });
  console.log(`   ${settingsData.length} system settings created.\n`);

  // 8. HOLIDAYS
  console.log('📅 Seeding Holidays...');
  const cy = new Date().getFullYear();
  const holidaysData = [
    { name: "New Year's Day", date: new Date(`${cy}-01-01`), type: 'PUBLIC', isPaid: true, isRecurring: true, status: 'ACTIVE' },
    { name: 'Independence Day', date: new Date(`${cy}-07-04`), type: 'PUBLIC', isPaid: true, isRecurring: true, status: 'ACTIVE' },
    { name: 'Labor Day', date: new Date(`${cy}-09-01`), type: 'PUBLIC', isPaid: true, isRecurring: true, status: 'ACTIVE' },
    { name: 'Thanksgiving Day', date: new Date(`${cy}-11-27`), type: 'PUBLIC', isPaid: true, isRecurring: false, status: 'ACTIVE' },
    { name: 'Christmas Day', date: new Date(`${cy}-12-25`), type: 'PUBLIC', isPaid: true, isRecurring: true, status: 'ACTIVE' },
    { name: 'Year-End Shutdown', date: new Date(`${cy}-12-31`), type: 'COMPANY', isPaid: true, isRecurring: false, status: 'ACTIVE' },
  ];
  await prisma.holiday.createMany({ data: holidaysData, skipDuplicates: true });
  console.log(`   ${holidaysData.length} holidays created.\n`);

  // 9. DOCUMENT CATEGORIES
  console.log('📁 Seeding Document Categories...');
  const categoriesData = [
    { name: 'Employment Contract', code: 'CONTRACT', description: 'Employment agreements and offer letters', status: 'ACTIVE', sortOrder: 1 },
    { name: 'Government ID', code: 'ID', description: 'National ID, passport, and government-issued documents', status: 'ACTIVE', sortOrder: 2 },
    { name: 'Academic Certificate', code: 'EDUCATION', description: 'Degrees, diplomas, and educational qualifications', status: 'ACTIVE', sortOrder: 3 },
    { name: 'Medical Certificate', code: 'MEDICAL', description: 'Health records and medical leave documentation', status: 'ACTIVE', sortOrder: 4 },
    { name: 'Professional License', code: 'LICENSE', description: 'Professional certifications and industry licenses', status: 'ACTIVE', sortOrder: 5 },
    { name: 'Tax Document', code: 'TAX', description: 'Tax forms, W-2s, and fiscal documentation', status: 'ACTIVE', sortOrder: 6 },
  ];
  await prisma.documentCategory.createMany({ data: categoriesData, skipDuplicates: true });
  console.log(`   ${categoriesData.length} document categories created.\n`);

  // 10. LEAVE TYPES
  console.log('🏖️  Seeding Leave Types...');
  const leaveTypesData = [
    { name: 'Annual Leave', code: 'ANNUAL', description: 'Paid time off for rest and personal matters', isPaid: true, carryForward: true, maxDaysPerYear: 20, status: 'ACTIVE' },
    { name: 'Sick Leave', code: 'SICK', description: 'Leave for medical conditions and health recovery', isPaid: true, carryForward: false, maxDaysPerYear: 12, status: 'ACTIVE' },
    { name: 'Personal Leave', code: 'PERSONAL', description: 'Unpaid leave for personal commitments', isPaid: false, carryForward: false, maxDaysPerYear: 5, status: 'ACTIVE' },
    { name: 'Maternity Leave', code: 'MATERNITY', description: 'Paid leave for childbirth and postnatal care', isPaid: true, carryForward: false, maxDaysPerYear: 90, status: 'ACTIVE' },
    { name: 'Paternity Leave', code: 'PATERNITY', description: 'Paid leave for new fathers', isPaid: true, carryForward: false, maxDaysPerYear: 10, status: 'ACTIVE' },
    { name: 'Bereavement Leave', code: 'BEREAVEMENT', description: 'Leave for family bereavement', isPaid: true, carryForward: false, maxDaysPerYear: 5, status: 'ACTIVE' },
    { name: 'Unpaid Leave', code: 'UNPAID', description: 'Extended unpaid leave without salary', isPaid: false, carryForward: false, maxDaysPerYear: 30, status: 'ACTIVE' },
  ];
  await prisma.leaveType.createMany({ data: leaveTypesData, skipDuplicates: true });
  const allLeaveTypes = await prisma.leaveType.findMany();
  const ltMap = new Map(allLeaveTypes.map(lt => [lt.code, lt.id]));
  console.log(`   ${leaveTypesData.length} leave types created.\n`);

  // 11. SALARY COMPONENTS
  console.log('💰 Seeding Salary Components...');
  const salaryComponentsData = [
    { code: 'BASIC', name: 'Basic Salary', type: 'EARNING', calculationMethod: 'FIXED', defaultValue: 5000, isTaxable: true, isPensionable: true, status: 'ACTIVE' },
    { code: 'HOUSING', name: 'Housing Allowance', type: 'EARNING', calculationMethod: 'FIXED', defaultValue: 1500, isTaxable: true, isPensionable: false, status: 'ACTIVE' },
    { code: 'TRANSPORT', name: 'Transportation Allowance', type: 'EARNING', calculationMethod: 'FIXED', defaultValue: 500, isTaxable: false, isPensionable: false, status: 'ACTIVE' },
    { code: 'OVERTIME', name: 'Overtime Pay', type: 'EARNING', calculationMethod: 'FORMULA', formula: '(basicSalary / 30 / 8) * overtimeHours * 1.5', isTaxable: true, isPensionable: false, status: 'ACTIVE' },
    { code: 'TAX', name: 'Income Tax', type: 'DEDUCTION', calculationMethod: 'FORMULA', formula: 'grossSalary * taxRate', isTaxable: false, isPensionable: false, status: 'ACTIVE' },
    { code: 'SOCIAL_INS', name: 'Social Insurance', type: 'DEDUCTION', calculationMethod: 'PERCENTAGE', defaultValue: 7, isTaxable: false, isPensionable: false, status: 'ACTIVE' },
  ];
  await prisma.salaryComponent.createMany({ data: salaryComponentsData, skipDuplicates: true });
  const allComponents = await prisma.salaryComponent.findMany();
  const scMap = new Map(allComponents.map(sc => [sc.code, sc.id]));
  console.log(`   ${salaryComponentsData.length} salary components created.\n`);

  // 12. ATTENDANCE DEVICES
  console.log('📟 Seeding Attendance Devices...');
  const devicesData = [
    { deviceCode: 'ZK-MAIN-001', deviceName: 'Main Lobby Fingerprint Terminal', deviceType: 'FINGERPRINT', manufacturer: 'ZKTeco', model: 'ProFace X', serialNumber: 'ZKT-2024-001', ipAddress: '192.168.1.100', port: 4370, location: 'Main Building — Ground Floor Lobby', status: 'ACTIVE', connectionStatus: 'OFFLINE' },
    { deviceCode: 'ZK-BACK-002', deviceName: 'Rear Entrance Face Reader', deviceType: 'FACE_RECOGNITION', manufacturer: 'ZKTeco', model: 'FaceK40', serialNumber: 'ZKT-2024-002', ipAddress: '192.168.1.101', port: 4370, location: 'Main Building — Rear Entrance', status: 'ACTIVE', connectionStatus: 'OFFLINE' },
    { deviceCode: 'HID-F3-003', deviceName: 'Floor 3 RFID Card Reader', deviceType: 'RFID', manufacturer: 'HID Global', model: 'iCLASS SE R40', serialNumber: 'HID-2024-003', ipAddress: '192.168.1.102', port: 4370, location: 'Main Building — Floor 3 Reception', status: 'ACTIVE', connectionStatus: 'OFFLINE' },
  ];
  await prisma.attendanceDevice.createMany({ data: devicesData, skipDuplicates: true });
  console.log(`   ${devicesData.length} attendance devices created.\n`);

  // 13. EMPLOYEES & USERS
  console.log('👤 Seeding Employees & Users...');
  const employeeIds = [];
  let empNum = 1;

  for (const emp of EMPLOYEE_DATA) {
    const empNumber = `EMP-${String(empNum).padStart(6, '0')}`;
    const [hireYear, hireMonth, hireDay] = emp.hireDate.split('-').map(Number);
    const passwordHash = await bcrypt.hash(emp.password, SALT_ROUNDS);

    const created = await prisma.employee.create({
      data: {
        employeeNumber: empNumber,
        firstName: emp.firstName,
        middleName: emp.middleName,
        lastName: emp.lastName,
        preferredName: emp.preferredName,
        gender: emp.gender,
        email: emp.email,
        phone: emp.phone,
        hireDate: new Date(hireYear, hireMonth - 1, hireDay),
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        departmentId: deptMap.get(emp.department),
        positionId: posMap.get(emp.position),
      },
    });

    await prisma.user.create({
      data: {
        username: emp.username,
        email: emp.email,
        passwordHash,
        status: 'ACTIVE',
        employeeId: created.id,
        roleId: roleMap.get(emp.role),
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
      },
    });

    employeeIds.push({ id: created.id, emp });
    empNum++;
  }
  console.log(`   ${employeeIds.length} employees and user accounts created.\n`);

  // 14. ASSIGN DEPARTMENT MANAGERS
  console.log('📋 Assigning Department Managers...');
  const adminEmp = employeeIds.find(e => e.emp.username === 'admin');
  const victoriaEmp = employeeIds.find(e => e.emp.username === 'hrm1');
  const alexanderEmp = employeeIds.find(e => e.emp.username === 'em7');
  const charlotteEmp = employeeIds.find(e => e.emp.username === 'em8');

  await prisma.department.update({ where: { code: 'IT' }, data: { managerId: adminEmp.id } });
  await prisma.department.update({ where: { code: 'HR' }, data: { managerId: victoriaEmp.id } });
  await prisma.department.update({ where: { code: 'FIN' }, data: { managerId: alexanderEmp.id } });
  await prisma.department.update({ where: { code: 'OPS' }, data: { managerId: charlotteEmp.id } });
  console.log('   Department managers assigned.\n');

  // 15. ASSIGN EMPLOYEE MANAGERS
  console.log('🔗 Assigning Employee Managers...');
  for (const e of employeeIds) {
    if (e.emp.username === 'admin') continue;

    let managerUsername = null;
    switch (e.emp.department) {
      case 'IT':
        managerUsername = 'admin';
        break;
      case 'HR':
        managerUsername = 'hrm1';
        break;
      case 'FIN':
        managerUsername = 'em7';
        break;
      case 'OPS':
        managerUsername = 'em8';
        break;
    }

    if (managerUsername && e.emp.username !== managerUsername) {
      const mgr = employeeIds.find(m => m.emp.username === managerUsername);
      if (mgr) {
        await prisma.employee.update({ where: { id: e.id }, data: { managerId: mgr.id } });
      }
    }
  }
  console.log('   Employee managers assigned.\n');

  // 16. SHIFT ASSIGNMENTS
  console.log('🔄 Seeding Shift Assignments...');
  const morningShift = shiftMap.get('MORNING');
  const today = new Date();
  const shiftAssignmentData = employeeIds.map(e => ({
    employeeId: e.id,
    shiftId: morningShift,
    effectiveFrom: new Date(today.getFullYear(), today.getMonth(), 1),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  }));
  await prisma.employeeShiftAssignment.createMany({ data: shiftAssignmentData });
  console.log(`   ${shiftAssignmentData.length} shift assignments created.\n`);

  // 17. PAYROLL PERIOD
  console.log('📆 Seeding Payroll Period...');
  const now = new Date();
  const pYear = now.getFullYear();
  const pMonth = now.getMonth() + 1;
  const periodStart = new Date(pYear, pMonth - 1, 1);
  const periodEnd = new Date(pYear, pMonth, 0);
  const periodPayDate = new Date(pYear, pMonth, 5);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  await prisma.payrollPeriod.create({
    data: {
      name: `${monthNames[pMonth - 1]} ${pYear}`,
      startDate: periodStart,
      endDate: periodEnd,
      payDate: periodPayDate,
      status: 'OPEN',
    },
  });
  console.log(`   Payroll period: ${monthNames[pMonth - 1]} ${pYear}\n`);

  // 18. EMPLOYEE SALARY PROFILES
  console.log('📋 Seeding Employee Salary Profiles...');
  let salaryProfileCount = 0;
  for (const e of employeeIds) {
    const salaryComponents = [
      { salaryComponentId: scMap.get('BASIC'), customValue: e.emp.salary },
      { salaryComponentId: scMap.get('HOUSING'), customValue: e.emp.housing },
      { salaryComponentId: scMap.get('TRANSPORT'), customValue: e.emp.transport },
    ];
    for (const sc of salaryComponents) {
      await prisma.employeeSalaryProfile.create({
        data: {
          employeeId: e.id,
          salaryComponentId: sc.salaryComponentId,
          effectiveFrom: periodStart,
          customValue: sc.customValue,
        },
      });
      salaryProfileCount++;
    }
  }
  console.log(`   ${salaryProfileCount} salary profile records created.\n`);

  // 19. LEAVE BALANCES
  console.log('📊 Seeding Leave Balances...');
  const currentYear = new Date().getFullYear();
  let leaveBalanceCount = 0;

  const usedDaysMap = {
    'em1':  { ANNUAL: 3.0, SICK: 1.0 },
    'em2':   { ANNUAL: 5.0 },
    'em3':  { SICK: 2.0 },
    'em4': { ANNUAL: 2.0, PERSONAL: 1.0 },
    'hro1':  { ANNUAL: 4.0, SICK: 1.5 },
    'hro2':    { ANNUAL: 1.0 },
    'hrm1':   { ANNUAL: 6.0, SICK: 0.5 },
  };

  for (const e of employeeIds) {
    const entitlements = [
      { leaveTypeId: ltMap.get('ANNUAL'), entitled: 20, code: 'ANNUAL' },
      { leaveTypeId: ltMap.get('SICK'), entitled: 12, code: 'SICK' },
      { leaveTypeId: ltMap.get('PERSONAL'), entitled: 5, code: 'PERSONAL' },
    ];
    const usedMap = usedDaysMap[e.emp.username] || {};
    for (const ent of entitlements) {
      await prisma.leaveBalance.create({
        data: {
          employeeId: e.id,
          leaveTypeId: ent.leaveTypeId,
          year: currentYear,
          entitledDays: ent.entitled,
          usedDays: usedMap[ent.code] || 0,
          carriedOverDays: 0,
        },
      });
      leaveBalanceCount++;
    }
  }
  console.log(`   ${leaveBalanceCount} leave balance records created.\n`);

  // 20. BANK ACCOUNTS (ALL employees)
  console.log('🏦 Seeding Employee Bank Accounts...');
  const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'Citibank', 'U.S. Bank', 'Capital One', 'PNC Bank', 'TD Bank'];
  let bankAccountCount = 0;
  for (let i = 0; i < employeeIds.length; i++) {
    const e = employeeIds[i];
    await prisma.employeeBankAccount.create({
      data: {
        employeeId: e.id,
        accountName: `${e.emp.firstName} ${e.emp.lastName}`,
        accountNumber: `${1000000001 + i}`,
        bankName: banks[i % banks.length],
        branchCode: `${100 + i}`,
        swiftCode: `NXSS${String(i + 1).padStart(4, '0')}`,
        isDefault: true,
        status: 'ACTIVE',
      },
    });
    bankAccountCount++;
  }
  console.log(`   ${bankAccountCount} bank accounts created.\n`);

  // 21. ATTENDANCE RECORDS (past 15 working days)
  console.log('📝 Seeding Attendance Records...');
  const pastDays = getPastWorkingDays(15);
  const morningShiftId = shiftMap.get('MORNING');
  let attendanceCount = 0;

  for (let empIdx = 0; empIdx < employeeIds.length; empIdx++) {
    const e = employeeIds[empIdx];
    const attendanceData = [];

    for (let dayIdx = 0; dayIdx < pastDays.length; dayIdx++) {
      const dayDate = pastDays[dayIdx];
      let status = 'PRESENT';
      let checkInMinutes = 480 + Math.floor(Math.random() * 16); // 08:00-08:15
      let checkOutMinutes = 960 + Math.floor(Math.random() * 16); // 16:00-16:15
      let workedMinutes = 480;

      if (dayIdx === 4 || dayIdx === 11) {
        status = 'LATE';
        checkInMinutes = 500 + Math.floor(Math.random() * 26); // 08:20-08:45
      } else if (dayIdx === 9) {
        status = 'HALF_DAY';
        checkInMinutes = 480;
        checkOutMinutes = 720; // 12:00
        workedMinutes = 240;
      } else if (empIdx === 12 && dayIdx === 7) {
        status = 'ABSENT';
        checkInMinutes = null;
        checkOutMinutes = null;
        workedMinutes = 0;
      }

      const checkInTime = checkInMinutes !== null
        ? new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), Math.floor(checkInMinutes / 60), checkInMinutes % 60)
        : null;
      const checkOutTime = checkOutMinutes !== null
        ? new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), Math.floor(checkOutMinutes / 60), checkOutMinutes % 60)
        : null;

      attendanceData.push({
        employeeId: e.id,
        shiftId: morningShiftId,
        date: dayDate,
        checkInTime,
        checkOutTime,
        workedMinutes,
        status,
        isManualEntry: false,
      });
    }

    await prisma.attendanceRecord.createMany({ data: attendanceData, skipDuplicates: true });
    attendanceCount += attendanceData.length;
  }
  console.log(`   ${attendanceCount} attendance records created.\n`);

  // 22. PERFORMANCE REVIEWS
  console.log('⭐ Seeding Performance Reviews...');
  const reviewRatings = [5, 5, 4, 4, 3, 4, 3, 4, 5, 4, 3, 4, 3, 5, 4, 4, 3, 4];
  const reviewComments = [
    'Exceeds expectations in all areas. A true leader.',
    'Outgoing performance, consistently delivers high-quality work.',
    'Strong contributor with excellent technical skills.',
    'Reliable and dedicated. Meets all key objectives.',
    'Solid performance with room for growth in leadership.',
    'Demonstrates strong analytical abilities and attention to detail.',
    'Good team player, meets expectations consistently.',
    'Shows initiative and a willingness to learn new skills.',
    'Exceptional problem-solving skills and creativity.',
    'Dependable performer with strong domain knowledge.',
    'Meets expectations; should focus on cross-team collaboration.',
    'Consistently delivers quality work on time.',
    'Growing into the role; shows promise for advancement.',
    'Top performer with outstanding communication skills.',
    'Steady and reliable, always meets deadlines.',
    'Excellent attention to detail and quality standards.',
    'Solid work ethic; could benefit from mentoring opportunities.',
    'Positive attitude and strong collaboration skills.',
  ];
  let reviewCount = 0;

  for (let i = 0; i < employeeIds.length; i++) {
    const e = employeeIds[i];
    const reviewerId = adminEmp.id;

    await prisma.performanceReview.create({
      data: {
        employeeId: e.id,
        reviewerId,
        cycle: 'H1-2026',
        rating: reviewRatings[i],
        comments: reviewComments[i],
        status: 'COMPLETED',
        submittedAt: new Date(pYear, 5, 15),
      },
    });
    reviewCount++;
  }
  console.log(`   ${reviewCount} performance reviews created.\n`);

  // 23. LEAVE REQUESTS
  console.log('📝 Seeding Leave Requests...');
  const annualLt = ltMap.get('ANNUAL');
  const sickLt = ltMap.get('SICK');
  const personalLt = ltMap.get('PERSONAL');
  const em1 = employeeIds.find(e => e.emp.username === 'em1');
  const em2 = employeeIds.find(e => e.emp.username === 'em2');
  const hro3 = employeeIds.find(e => e.emp.username === 'hro3');
  const em7 = employeeIds.find(e => e.emp.username === 'em7');
  const victoriaId = victoriaEmp.id;

  // em1: ANNUAL, pending, 3 days starting 2 weeks from now
  const em1Dates = getFutureWorkingDays(14, 3);
  await prisma.leaveRequest.create({
    data: {
      employeeId: em1.id,
      leaveTypeId: annualLt,
      startDate: em1Dates[0],
      endDate: em1Dates[em1Dates.length - 1],
      totalDays: 3,
      reason: 'Family vacation — planning a short trip.',
      status: 'PENDING',
    },
  });

  // em2: SICK, approved, 1 day last week
  const em2Dates = getPastWorkingDays(5);
  await prisma.leaveRequest.create({
    data: {
      employeeId: em2.id,
      leaveTypeId: sickLt,
      startDate: em2Dates[0],
      endDate: em2Dates[0],
      totalDays: 1,
      reason: 'Feeling unwell — needed a day to recover.',
      status: 'APPROVED',
      approverId: victoriaId,
      approvedAt: new Date(),
    },
  });

  // hro3: ANNUAL, pending, 5 days starting 3 weeks from now
  const hro3Dates = getFutureWorkingDays(21, 5);
  await prisma.leaveRequest.create({
    data: {
      employeeId: hro3.id,
      leaveTypeId: annualLt,
      startDate: hro3Dates[0],
      endDate: hro3Dates[hro3Dates.length - 1],
      totalDays: 5,
      reason: 'Personal travel — visiting family abroad.',
      status: 'PENDING',
    },
  });

  // em7: PERSONAL, rejected, 2 days last month (with rejectionReason)
  const em7Dates = getDatesLastMonth(2);
  await prisma.leaveRequest.create({
    data: {
      employeeId: em7.id,
      leaveTypeId: personalLt,
      startDate: em7Dates[0],
      endDate: em7Dates[em7Dates.length - 1],
      totalDays: 2,
      reason: 'Personal appointment that requires two consecutive days.',
      status: 'REJECTED',
      approverId: victoriaId,
      rejectionReason: 'Insufficient notice provided. Please submit leave requests at least 30 days in advance for personal leave.',
    },
  });

  console.log('   4 leave requests created.\n');

  // ==========================================
  // SUMMARY
  // ==========================================
  const roleCounts = { ADMIN: 0, HR_MANAGER: 0, HR_OFF: 0, EMPLOYEE: 0 };
  for (const e of employeeIds) {
    roleCounts[e.emp.role]++;
  }

  console.log('✅ Production database seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   • ${roleCounts.ADMIN} System Administrator`);
  console.log(`   • ${roleCounts.HR_MANAGER} HR Managers`);
  console.log(`   • ${roleCounts.HR_OFF} HR Officers`);
  console.log(`   • ${roleCounts.EMPLOYEE} Employees (3 IT + 4 Finance + 4 Operations)`);
  console.log(`   • 4 Departments | 6 Positions | 3 Shifts`);
  console.log(`   • 7 Leave Types | 6 Salary Components | 3 Attendance Devices`);
  console.log(`   • ${salaryProfileCount} Salary Profiles | ${leaveBalanceCount} Leave Balances`);
  console.log(`   • ${bankAccountCount} Bank Accounts | ${attendanceCount} Attendance Records`);
  console.log(`   • ${reviewCount} Performance Reviews | 4 Leave Requests`);
  console.log('\n🔐 Login credentials:');
  console.log('   admin@nexus.com / Admin@12345 (ADMIN)');
  console.log('   hrm1@nexus.com / Hrm1@12345 (HR_MANAGER)');
  console.log('   em1@nexus.com / Em1@12345 (EMPLOYEE)');
  console.log('   (etc.)\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
