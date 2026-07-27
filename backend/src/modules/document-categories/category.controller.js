import * as categoryService from './category.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const getCategory = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.getCategoryById(req.params.id),
    'Category retrieved successfully.',
  );
export const listCategories = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.listCategories(req.query),
    'Categories retrieved successfully.',
  );
export const createCategory = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.createCategory(req.body, req.user.id),
    'Category created successfully.',
    201,
  );
export const updateCategory = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.updateCategory(req.params.id, req.body, req.user.id),
    'Category updated successfully.',
  );
export const activateCategory = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.toggleCategoryStatus(req.params.id, true, req.user.id),
    'Category activated successfully.',
  );
export const deactivateCategory = async (req, res) =>
  sendSuccess(
    res,
    await categoryService.toggleCategoryStatus(req.params.id, false, req.user.id),
    'Category deactivated successfully.',
  );
