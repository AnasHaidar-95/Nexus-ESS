import * as roleService from './role.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listRoles = async (req, res) =>
  sendSuccess(res, await roleService.listRoles(req.query), 'Roles retrieved.');
export const getRole = async (req, res) =>
  sendSuccess(res, await roleService.getRoleById(req.params.id), 'Role retrieved.');
export const createRole = async (req, res) =>
  sendSuccess(res, await roleService.createRole(req.body, req.user.id), 'Role created.', 201);
export const updateRole = async (req, res) =>
  sendSuccess(
    res,
    await roleService.updateRole(req.params.id, req.body, req.user.id),
    'Role updated.',
  );
export const deleteRole = async (req, res) => {
  await roleService.deleteRole(req.params.id, req.user.id);
  sendSuccess(res, null, 'Role deleted.', 204);
};
export const getRolePermissions = async (req, res) =>
  sendSuccess(
    res,
    await roleService.getRolePermissions(req.params.id),
    'Role permissions retrieved.',
  );
export const replaceRolePermissions = async (req, res) =>
  sendSuccess(
    res,
    await roleService.replaceRolePermissions(req.params.id, req.body.permissionIds, req.user.id),
    'Role permissions replaced.',
  );
export const getRoleUsers = async (req, res) =>
  sendSuccess(
    res,
    await roleService.getRoleUsers(req.params.id, req.query),
    'Role users retrieved.',
  );
