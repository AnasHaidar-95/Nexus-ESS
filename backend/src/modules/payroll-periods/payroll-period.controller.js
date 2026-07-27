import * as periodService from './payroll-period.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listPayrollPeriods = async (req, res) =>
  sendSuccess(res, await periodService.listPayrollPeriods(req.query), 'Payroll periods retrieved.');
export const getPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.getPayrollPeriodById(req.params.id),
    'Payroll period retrieved.',
  );
export const createPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.createPayrollPeriod(req.body, req.user.id),
    'Payroll period created.',
    201,
  );
export const updatePayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.updatePayrollPeriod(req.params.id, req.body, req.user.id),
    'Payroll period updated.',
  );
export const cancelPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.cancelPayrollPeriod(req.params.id, req.user.id),
    'Payroll period cancelled.',
  );
export const deletePayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.deletePayrollPeriod(req.params.id, req.user.id),
    'Payroll period deleted.',
  );

export const openPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.openPayrollPeriod(req.params.id, req.user.id),
    'Payroll period opened.',
  );
export const closePayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.closePayrollPeriod(req.params.id, req.user.id),
    'Payroll period closed.',
  );
export const lockPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.lockPayrollPeriod(req.params.id, req.user.id),
    'Payroll period locked.',
  );
export const unlockPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.unlockPayrollPeriod(req.params.id, req.user.id),
    'Payroll period unlocked.',
  );

export const approvePayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.approvePayrollPeriod(req.params.id, req.user.id),
    'Payroll period approved.',
  );
export const finalizePayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.finalizePayrollPeriod(req.params.id, req.user.id),
    'Payroll period finalized.',
  );
export const reopenPayrollPeriod = async (req, res) =>
  sendSuccess(
    res,
    await periodService.reopenPayrollPeriod(req.params.id, req.user.id),
    'Payroll period reopened.',
  );
