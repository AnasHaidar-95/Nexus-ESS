import * as employeeService from './employee.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listEmployees = async (req, res) => {
  const result = await employeeService.listEmployees(req.query);
  return sendSuccess(res, result, 'Employees retrieved successfully.');
};

export const getEmployee = async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.params.id);
  return sendSuccess(res, employee, 'Employee retrieved successfully.');
};

export const createEmployee = async (req, res) => {
  const employee = await employeeService.createEmployee(req.body, req.user.id);
  return sendSuccess(res, employee, 'Employee created successfully.', 201);
};

export const updateEmployee = async (req, res) => {
  const employee = await employeeService.updateEmployee(req.params.id, req.body, req.user.id);
  return sendSuccess(res, employee, 'Employee updated successfully.');
};

export const terminateEmployee = async (req, res) => {
  const employee = await employeeService.terminateEmployee(req.params.id, req.body, req.user.id);
  return sendSuccess(res, employee, 'Employee terminated successfully.');
};

export const changeDepartment = async (req, res) => {
  const employee = await employeeService.changeDepartment(
    req.params.id,
    req.body.departmentId,
    req.user.id,
  );
  return sendSuccess(res, employee, 'Employee department updated successfully.');
};

export const changePosition = async (req, res) => {
  const employee = await employeeService.changePosition(
    req.params.id,
    req.body.positionId,
    req.user.id,
  );
  return sendSuccess(res, employee, 'Employee position updated successfully.');
};

export const changeManager = async (req, res) => {
  const employee = await employeeService.changeManager(
    req.params.id,
    req.body.managerId,
    req.user.id,
  );
  return sendSuccess(res, employee, 'Employee manager updated successfully.');
};

export const archiveEmployee = async (req, res) => {
  await employeeService.archiveEmployee(req.params.id, req.user.id);
  return res.status(204).send();
};

export const activateEmployee = async (req, res) => {
  const employee = await employeeService.activateEmployee(req.params.id, req.body, req.user.id);
  return sendSuccess(res, employee, 'Employee activate successfully.');
};
