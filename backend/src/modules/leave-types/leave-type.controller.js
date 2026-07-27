import * as leaveTypeService from './leave-type.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listLeaveTypes = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.listLeaveTypes(req.query),
    'Leave types retrieved successfully.',
  );
export const getLeaveType = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.getLeaveTypeById(req.params.id),
    'Leave type retrieved successfully.',
  );
export const createLeaveType = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.createLeaveType(req.body, req.user.id),
    'Leave type created successfully.',
    201,
  );
export const updateLeaveType = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.updateLeaveType(req.params.id, req.body, req.user.id),
    'Leave type updated successfully.',
  );
export const activateLeaveType = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.toggleLeaveTypeStatus(req.params.id, true, req.user.id),
    'Leave type activated successfully.',
  );
export const deactivateLeaveType = async (req, res) =>
  sendSuccess(
    res,
    await leaveTypeService.toggleLeaveTypeStatus(req.params.id, false, req.user.id),
    'Leave type deactivated successfully.',
  );
