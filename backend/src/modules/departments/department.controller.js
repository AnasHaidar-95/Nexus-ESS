import * as departmentService from './department.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listDepartments = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.listDepartments(req.query),
    'Departments retrieved successfully.',
  );
export const getDepartment = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.getDepartmentById(req.params.id),
    'Department retrieved successfully.',
  );
export const createDepartment = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.createDepartment(req.body, req.user.id),
    'Department created successfully.',
    201,
  );
export const updateDepartment = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.updateDepartment(req.params.id, req.body, req.user.id),
    'Department updated successfully.',
  );
export const activateDepartment = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.toggleDepartmentStatus(req.params.id, true, req.user.id),
    'Department activated successfully.',
  );
export const deactivateDepartment = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.toggleDepartmentStatus(req.params.id, false, req.user.id),
    'Department deactivated successfully.',
  );
export const listDepartmentEmployees = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.listDepartmentEmployees(req.params.id, req.query),
    'Department employees retrieved successfully.',
  );
export const assignManager = async (req, res) =>
  sendSuccess(
    res,
    await departmentService.assignManager(req.params.id, req.body.managerId, req.user.id),
    'Department manager assigned successfully.',
  );
