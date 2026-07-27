import * as profileChangeRequestService from './profile-change-request.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listProfileChangeRequests = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.listProfileChangeRequests(req.query),
    'Change requests retrieved successfully.',
  );
export const getProfileChangeRequest = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.getProfileChangeRequestById(req.params.id),
    'Change request retrieved successfully.',
  );
export const createProfileChangeRequest = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.createProfileChangeRequest(req.body, req.user.id),
    'Change request submitted successfully.',
    201,
  );
export const approveProfileChangeRequest = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.approveProfileChangeRequest(req.params.id, req.user.id),
    'Change request approved successfully.',
  );
export const rejectProfileChangeRequest = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.rejectProfileChangeRequest(
      req.params.id,
      req.body?.reason,
      req.user.id,
    ),
    'Change request rejected successfully.',
  );
export const deleteProfileChangeRequest = async (req, res) =>
  sendSuccess(
    res,
    await profileChangeRequestService.deleteProfileChangeRequest(req.params.id, req.user.id),
    'Change request cancelled successfully.',
  );
