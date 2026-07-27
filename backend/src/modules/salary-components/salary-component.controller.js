import * as salaryComponentService from './salary-component.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listSalaryComponents = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.listSalaryComponents(req.query),
    'Salary components retrieved.',
  );
export const getSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.getSalaryComponentById(req.params.id),
    'Salary component retrieved.',
  );
export const createSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.createSalaryComponent(req.body, req.user.id),
    'Salary component created.',
    201,
  );
export const updateSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.updateSalaryComponent(req.params.id, req.body, req.user.id),
    'Salary component updated.',
  );
export const deactivateSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.toggleSalaryComponentStatus(req.params.id, false, req.user.id),
    'Salary component deactivated.',
  );
export const activateSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.toggleSalaryComponentStatus(req.params.id, true, req.user.id),
    'Salary component activated.',
  );
export const deleteSalaryComponent = async (req, res) =>
  sendSuccess(
    res,
    await salaryComponentService.deleteSalaryComponent(req.params.id, req.user.id),
    'Salary component permanently deleted.',
  );
