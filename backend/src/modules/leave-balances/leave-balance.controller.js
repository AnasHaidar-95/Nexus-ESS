import * as leaveBalanceService from './leave-balance.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listLeaveBalances = async (req, res) =>
  sendSuccess(
    res,
    await leaveBalanceService.listLeaveBalances(req.query),
    'Leave balances retrieved successfully.',
  );
export const getLeaveBalance = async (req, res) =>
  sendSuccess(
    res,
    await leaveBalanceService.getLeaveBalanceById(req.params.id),
    'Leave balance retrieved successfully.',
  );
export const getLeaveBalancesByEmployee = async (req, res) =>
  sendSuccess(
    res,
    await leaveBalanceService.getLeaveBalancesByEmployee(req.params.employeeId),
    'Employee leave balances retrieved successfully.',
  );
export const createLeaveBalance = async (req, res) =>
  sendSuccess(
    res,
    await leaveBalanceService.createLeaveBalance(req.body, req.user.id),
    'Leave balance created successfully.',
    201,
  );
export const updateLeaveBalance = async (req, res) =>
  sendSuccess(
    res,
    await leaveBalanceService.updateLeaveBalance(req.params.id, req.body, req.user.id),
    'Leave balance updated successfully.',
  );
