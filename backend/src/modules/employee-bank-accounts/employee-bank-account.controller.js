import * as employeeBankAccountService from './employee-bank-account.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listEmployeeBankAccounts = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.listEmployeeBankAccounts(req.query),
    'Bank accounts retrieved successfully.',
  );
export const getEmployeeBankAccount = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.getEmployeeBankAccountById(req.params.id),
    'Bank account retrieved successfully.',
  );
export const getEmployeeBankAccounts = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.getEmployeeBankAccountsByEmployee(req.params.employeeId),
    'Employee bank accounts retrieved successfully.',
  );
export const createEmployeeBankAccount = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.createEmployeeBankAccount(req.body, req.user.id),
    'Bank account created successfully.',
    201,
  );
export const updateEmployeeBankAccount = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.updateEmployeeBankAccount(
      req.params.id,
      req.body,
      req.user.id,
    ),
    'Bank account updated successfully.',
  );
export const setDefaultBankAccount = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.setDefaultBankAccount(req.params.id, req.user.id),
    'Default bank account set successfully.',
  );
export const deleteEmployeeBankAccount = async (req, res) =>
  sendSuccess(
    res,
    await employeeBankAccountService.deleteEmployeeBankAccount(req.params.id, req.user.id),
    'Bank account deleted successfully.',
  );
