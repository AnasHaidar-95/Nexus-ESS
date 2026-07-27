import * as employeeSalaryProfileService from './employee-salary-profile.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listEmployeeSalaryProfiles = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.listEmployeeSalaryProfiles(req.query),
    'Salary profiles retrieved successfully.',
  );
export const getEmployeeSalaryProfile = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.getEmployeeSalaryProfileById(req.params.id),
    'Salary profile retrieved successfully.',
  );
export const getEmployeeSalaryProfiles = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.getEmployeeSalaryProfilesByEmployee(req.params.employeeId),
    'Employee salary profiles retrieved successfully.',
  );
export const createEmployeeSalaryProfile = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.createEmployeeSalaryProfile(req.body, req.user.id),
    'Salary profile created successfully.',
    201,
  );
export const updateEmployeeSalaryProfile = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.updateEmployeeSalaryProfile(
      req.params.id,
      req.body,
      req.user.id,
    ),
    'Salary profile updated successfully.',
  );
export const endEmployeeSalaryProfile = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.endEmployeeSalaryProfile(req.params.id, req.user.id),
    'Salary profile ended successfully.',
  );
export const deleteEmployeeSalaryProfile = async (req, res) =>
  sendSuccess(
    res,
    await employeeSalaryProfileService.deleteEmployeeSalaryProfile(req.params.id, req.user.id),
    'Salary profile deleted successfully.',
  );
