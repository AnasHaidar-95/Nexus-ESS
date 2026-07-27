import * as deviceService from './attendance-device.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listDevices = async (req, res) =>
  sendSuccess(res, await deviceService.listDevices(req.query), 'Attendance devices retrieved.');
export const getDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.getDeviceById(req.params.id),
    'Attendance device retrieved.',
  );
export const createDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.createDevice(req.body, req.user.id),
    'Attendance device registered.',
    201,
  );
export const updateDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.updateDevice(req.params.id, req.body, req.user.id),
    'Attendance device updated.',
  );
export const deactivateDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.toggleDeviceStatus(req.params.id, false, req.user.id),
    'Attendance device deactivated.',
  );
export const activateDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.toggleDeviceStatus(req.params.id, true, req.user.id),
    'Attendance device activated.',
  );
export const testDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.testDeviceConnection(req.params.id, req.user.id),
    'Device connectivity tested.',
  );
export const syncDevice = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.syncDevice(req.params.id, req.user.id),
    'Device synchronization initiated.',
    202,
  );
export const getDeviceLogs = async (req, res) =>
  sendSuccess(
    res,
    await deviceService.getDeviceLogs(req.params.id, req.query),
    'Device synchronization logs retrieved.',
  );
