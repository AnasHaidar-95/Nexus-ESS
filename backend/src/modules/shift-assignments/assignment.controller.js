import * as assignmentService from './assignment.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listAssignments = async (req, res) =>
  sendSuccess(
    res,
    await assignmentService.listAssignments(req.query),
    'Shift assignments retrieved successfully.',
  );

export const assignShift = async (req, res) =>
  sendSuccess(
    res,
    await assignmentService.assignShift(req.body, req.user.id),
    'Shift assigned successfully.',
    201,
  );

export const bulkAssignShift = async (req, res) => {
  const result = await assignmentService.bulkAssignShift(req.body, req.user.id);
  return sendSuccess(res, result, 'Bulk shift assignment completed.', 200);
};

export const endAssignment = async (req, res) => {
  const result = await assignmentService.endAssignment(
    req.params.id,
    req.body.effectiveTo,
    req.user.id,
  );
  return sendSuccess(res, result, 'Shift assignment ended successfully.');
};
