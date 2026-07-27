import * as recordService from './attendance-record.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listRecords = async (req, res) =>
  sendSuccess(
    res,
    await recordService.listRecords(req.query),
    'Attendance records retrieved successfully.',
  );
export const getRecord = async (req, res) =>
  sendSuccess(
    res,
    await recordService.getRecordById(req.params.id),
    'Attendance record retrieved successfully.',
  );
export const createRecord = async (req, res) =>
  sendSuccess(
    res,
    await recordService.createRecord(req.body, req.user.id),
    'Attendance record created successfully.',
    201,
  );
export const updateRecord = async (req, res) =>
  sendSuccess(
    res,
    await recordService.updateRecord(req.params.id, req.body, req.user.id),
    'Attendance record corrected successfully.',
  );
