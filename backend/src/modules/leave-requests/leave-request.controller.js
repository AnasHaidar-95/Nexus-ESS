import * as leaveRequestService from './leave-request.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listLeaveRequests = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.listLeaveRequests(req.query),
    'Leave requests retrieved successfully.',
  );
export const getMyLeaveRequests = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.getMyLeaveRequests(req.user.id),
    'My leave requests retrieved successfully.',
  );
export const getLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.getLeaveRequestById(req.params.id),
    'Leave request retrieved successfully.',
  );
export const createLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.createLeaveRequest(req.body, req.user.id),
    'Leave request created successfully.',
    201,
  );
export const updateLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.updateLeaveRequest(req.params.id, req.body, req.user.id),
    'Leave request updated successfully.',
  );
export const cancelLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.cancelLeaveRequest(req.params.id, req.user.id),
    'Leave request cancelled successfully.',
  );
export const approveLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.approveLeaveRequest(req.params.id, req.user.id),
    'Leave request approved successfully.',
  );
export const rejectLeaveRequest = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.rejectLeaveRequest(req.params.id, req.body?.reason, req.user.id),
    'Leave request rejected successfully.',
  );
export const getApprovalSteps = async (req, res) =>
  sendSuccess(
    res,
    await leaveRequestService.getApprovalSteps(req.params.id),
    'Approval steps retrieved successfully.',
  );
