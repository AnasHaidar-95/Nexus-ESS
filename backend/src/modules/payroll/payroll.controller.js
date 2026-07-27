import * as payrollService from './payroll.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const getPayroll = async (req, res) =>
  sendSuccess(res, await payrollService.getPayrollById(req.params.id), 'Payroll retrieved.');
export const listPayrolls = async (req, res) =>
  sendSuccess(res, await payrollService.listPayrolls(req.query), 'Payrolls retrieved.');
export const generatePayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.generatePayroll(req.body, req.user.id),
    'Payroll generation completed.',
    201,
  );
export const updatePayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.updatePayroll(req.params.id, req.body, req.user.id),
    'Payroll updated.',
  );
export const cancelPayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.cancelPayroll(req.params.id, req.user.id),
    'Payroll cancelled.',
  );
export const reopenPayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.reopenPayroll(req.params.id, req.user.id),
    'Payroll reopened.',
  );
export const approvePayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.approvePayroll(req.params.id, req.user.id),
    'Payroll approved successfully.',
  );
export const finalizePayroll = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.finalizePayroll(req.params.id, req.user.id),
    'Payroll finalized and locked for payment.',
  );
export const getPayslip = async (req, res) =>
  sendSuccess(
    res,
    await payrollService.getPayslip(req.params.id),
    'Payslip retrieved successfully.',
  );
