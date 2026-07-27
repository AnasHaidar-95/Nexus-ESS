import * as userService from './user.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listUsers = async (req, res) => {
  const result = await userService.listUsers(req.query);
  return sendSuccess(res, result, 'Users retrieved successfully.');
};

export const getUser = async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, user, 'User retrieved successfully.');
};

export const createUser = async (req, res) => {
  const user = await userService.createUser(req.body, req.user.id);
  return sendSuccess(res, user, 'User created successfully.', 201);
};

export const updateUser = async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user.id);
  return sendSuccess(res, user, 'User updated successfully.');
};

export const activateUser = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, 'activate', req.user.id);
  return sendSuccess(res, user, 'User activated successfully.');
};

export const deactivateUser = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, 'deactivate', req.user.id);
  return sendSuccess(res, user, 'User deactivated successfully.');
};

export const lockUser = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, 'lock', req.user.id);
  return sendSuccess(res, user, 'User locked successfully.');
};

export const unlockUser = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, 'unlock', req.user.id);
  return sendSuccess(res, user, 'User unlocked successfully.');
};

export const suspendUser = async (req, res) => {
  const user = await userService.toggleUserStatus(req.params.id, 'suspend', req.user.id);
  return sendSuccess(res, user, 'User suspended successfully.');
};

export const resetPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword, forcePasswordChange } = req.body;
  const actorId = req.user.id;

  const result = await userService.resetUserPassword(
    id,
    { newPassword, forcePasswordChange },
    actorId,
  );
  return sendSuccess(res, result, 'Password reset successfully.', 200);
};
