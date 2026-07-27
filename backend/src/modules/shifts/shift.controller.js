import * as shiftService from './shift.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listShifts = async (req, res) =>
  sendSuccess(res, await shiftService.listShifts(req.query), 'Shifts retrieved successfully.');
export const getShift = async (req, res) =>
  sendSuccess(res, await shiftService.getShiftById(req.params.id), 'Shift retrieved successfully.');
export const createShift = async (req, res) =>
  sendSuccess(
    res,
    await shiftService.createShift(req.body, req.user.id),
    'Shift created successfully.',
    201,
  );
export const updateShift = async (req, res) =>
  sendSuccess(
    res,
    await shiftService.updateShift(req.params.id, req.body, req.user.id),
    'Shift updated successfully.',
  );
export const activateShift = async (req, res) =>
  sendSuccess(
    res,
    await shiftService.toggleShiftStatus(req.params.id, true, req.user.id),
    'Shift activated successfully.',
  );
export const deactivateShift = async (req, res) =>
  sendSuccess(
    res,
    await shiftService.toggleShiftStatus(req.params.id, false, req.user.id),
    'Shift deactivated successfully.',
  );
