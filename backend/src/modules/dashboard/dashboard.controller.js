import * as dashboardService from './dashboard.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

// --- Dashboard Endpoints ---
export const getAdminDashboard = async (req, res) => {
  const data = await dashboardService.getAdminDashboard();
  return sendSuccess(res, data, 'Admin dashboard retrieved successfully.');
};

export const getHrDashboard = async (req, res) => {
  const data = await dashboardService.getHrDashboard();
  return sendSuccess(res, data, 'HR dashboard retrieved successfully.');
};

export const getAttendanceDashboard = async (req, res) => {
  const data = await dashboardService.getAttendanceDashboard();
  return sendSuccess(res, data, 'Attendance dashboard retrieved successfully.');
};

export const getPayrollDashboard = async (req, res) => {
  const data = await dashboardService.getPayrollDashboard();
  return sendSuccess(res, data, 'Payroll dashboard retrieved successfully.');
};

export const getEmployeeDashboard = async (req, res) => {
  const data = await dashboardService.getEmployeeDashboard(req.params.id);
  return sendSuccess(res, data, 'Employee dashboard retrieved successfully.');
};

// --- Statistics Endpoints ---
export const getOrganizationStats = async (req, res) => {
  const data = await dashboardService.getOrganizationStatistics();
  return sendSuccess(res, data, 'Organization statistics retrieved successfully.');
};

export const getAttendanceStats = async (req, res) => {
  const data = await dashboardService.getAttendanceStatistics(req.query);
  return sendSuccess(res, data, 'Attendance statistics retrieved successfully.');
};

export const getPayrollStats = async (req, res) => {
  const data = await dashboardService.getPayrollStatistics(req.query);
  return sendSuccess(res, data, 'Payroll statistics retrieved successfully.');
};

export const getEmployeeStats = async (req, res) => {
  const data = await dashboardService.getEmployeeStatistics(req.query);
  return sendSuccess(res, data, 'Employee statistics retrieved successfully.');
};
