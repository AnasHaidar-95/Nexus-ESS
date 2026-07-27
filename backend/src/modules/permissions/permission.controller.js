import * as permissionService from './permission.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listPermissions = async (req, res) =>
  sendSuccess(res, await permissionService.listPermissions(req.query), 'Permissions retrieved.');
export const listModules = async (req, res) =>
  sendSuccess(res, await permissionService.listModules(), 'Permission modules retrieved.');
export const listPermissionsByModule = async (req, res) =>
  sendSuccess(
    res,
    await permissionService.listPermissionsByModule(req.params.module),
    'Module permissions retrieved.',
  );
