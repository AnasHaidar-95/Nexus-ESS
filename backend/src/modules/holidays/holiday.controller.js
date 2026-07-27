import * as holidayService from './holiday.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listHolidays = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.listHolidays(req.query),
    'Holidays retrieved successfully.',
  );
export const getHoliday = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.getHolidayById(req.params.id),
    'Holiday retrieved successfully.',
  );
export const createHoliday = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.createHoliday(req.body, req.user.id),
    'Holiday created successfully.',
    201,
  );
export const updateHoliday = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.updateHoliday(req.params.id, req.body, req.user.id),
    'Holiday updated successfully.',
  );
export const activateHoliday = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.toggleHolidayStatus(req.params.id, true, req.user.id),
    'Holiday activated successfully.',
  );
export const deactivateHoliday = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.toggleHolidayStatus(req.params.id, false, req.user.id),
    'Holiday deactivated successfully.',
  );
export const getCalendar = async (req, res) =>
  sendSuccess(
    res,
    await holidayService.getCalendarByYear(req.params.year),
    'Holiday calendar retrieved successfully.',
  );
