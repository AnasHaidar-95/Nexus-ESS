import * as authService from './auth.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const login = async (req, res) => {
  const { username, password } = req.body;
  const result = await authService.loginUser(username, password, req.ip, req.get('user-agent'));
  return sendSuccess(res, result, 'Login successful.', 200);
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshUserToken(refreshToken, req.ip, req.get('user-agent'));
  return sendSuccess(res, result, 'Token refreshed successfully.', 200);
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(refreshToken, req.user.id);
  return res.status(204).send(); // Standard REST practice for Logout
};

export const getMe = async (req, res) => {
  const result = await authService.getCurrentUser(req.user.id);
  return sendSuccess(res, result, 'Current user retrieved successfully.', 200);
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
  return sendSuccess(res, result, 'Password changed successfully.', 200);
};

export const logoutAll = async (req, res) => {
  // req.user.id is injected by your `authenticate` middleware
  const result = await authService.logoutAllDevices(req.user.id);
  sendSuccess(res, result, 'Logged out from all devices successfully.');
};

export const register = async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendSuccess(res, result, 'Account created successfully.', 201);
};

export const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  return sendSuccess(res, result, 'OK');
};

export const verifySecurityAnswer = async (req, res) => {
  const { email, answer } = req.body;
  const result = await authService.verifySecurityAnswer(email, answer);
  return sendSuccess(res, result, 'Answer verified.');
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const result = await authService.resetPassword(token, password);
  return sendSuccess(res, result, 'Password reset successful.');
};
