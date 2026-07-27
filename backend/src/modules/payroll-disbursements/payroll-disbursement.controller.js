import * as disbursementService from './payroll-disbursement.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listDisbursements = async (req, res) =>
  sendSuccess(
    res,
    await disbursementService.listDisbursements(req.query),
    'Disbursements retrieved successfully.',
  );
export const getDisbursement = async (req, res) =>
  sendSuccess(
    res,
    await disbursementService.getDisbursementById(req.params.id),
    'Disbursement retrieved successfully.',
  );
export const updateDisbursement = async (req, res) =>
  sendSuccess(
    res,
    await disbursementService.updateDisbursement(req.params.id, req.body, req.user.id),
    'Disbursement updated successfully.',
  );
export const markAsPaid = async (req, res) =>
  sendSuccess(
    res,
    await disbursementService.markAsPaid(req.params.id, req.body, req.user.id),
    'Disbursement marked as paid successfully.',
  );
export const deleteDisbursement = async (req, res) =>
  sendSuccess(
    res,
    await disbursementService.deleteDisbursement(req.params.id, req.user.id),
    'Disbursement permanently deleted.',
  );
