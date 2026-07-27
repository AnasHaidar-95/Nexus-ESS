import * as positionService from './position.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listPositions = async (req, res) =>
  sendSuccess(
    res,
    await positionService.listPositions(req.query),
    'Positions retrieved successfully.',
  );
export const getPosition = async (req, res) =>
  sendSuccess(
    res,
    await positionService.getPositionById(req.params.id),
    'Position retrieved successfully.',
  );
export const createPosition = async (req, res) =>
  sendSuccess(
    res,
    await positionService.createPosition(req.body, req.user.id),
    'Position created successfully.',
    201,
  );
export const updatePosition = async (req, res) =>
  sendSuccess(
    res,
    await positionService.updatePosition(req.params.id, req.body, req.user.id),
    'Position updated successfully.',
  );
export const activatePosition = async (req, res) =>
  sendSuccess(
    res,
    await positionService.togglePositionStatus(req.params.id, true, req.user.id),
    'Position activated successfully.',
  );
export const deactivatePosition = async (req, res) =>
  sendSuccess(
    res,
    await positionService.togglePositionStatus(req.params.id, false, req.user.id),
    'Position deactivated successfully.',
  );
export const listPositionEmployees = async (req, res) =>
  sendSuccess(
    res,
    await positionService.listPositionEmployees(req.params.id, req.query),
    'Position employees retrieved successfully.',
  );
