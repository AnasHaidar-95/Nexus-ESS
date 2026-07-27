import * as payslipItemService from './payslip-item.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listPayslipItems = async (req, res) =>
  sendSuccess(
    res,
    await payslipItemService.listPayslipItems(req.query),
    'Payslip items retrieved successfully.',
  );
export const getPayslipItem = async (req, res) =>
  sendSuccess(
    res,
    await payslipItemService.getPayslipItemById(req.params.id),
    'Payslip item retrieved successfully.',
  );
