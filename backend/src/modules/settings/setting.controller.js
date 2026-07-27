import * as settingService from './setting.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listSettings = async (req, res) => {
  const result = await settingService.listSettings(req.query);
  return sendSuccess(res, result, 'Settings retrieved successfully.');
};

export const getSetting = async (req, res) => {
  const setting = await settingService.getSettingByKey(req.params.key);
  return sendSuccess(res, setting, 'Setting retrieved successfully.');
};

export const updateSetting = async (req, res) => {
  const newValue = await settingService.updateSetting(req.params.key, req.body, req.user.id);
  return sendSuccess(res, { value: newValue }, 'Setting updated successfully.');
};

export const getCategories = async (req, res) => {
  const categories = await settingService.getCategories();
  return sendSuccess(res, categories, 'Categories retrieved successfully.');
};
