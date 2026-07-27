import * as notificationService from './notification.service.js';
import { sendSuccess } from '../../core/utils/api-response.js';

export const listMyNotifications = async (req, res) =>
  sendSuccess(
    res,
    await notificationService.listMyNotifications(req.user.id, req.query),
    'Notifications retrieved successfully.',
  );
export const getUnreadCount = async (req, res) =>
  sendSuccess(
    res,
    await notificationService.getUnreadCount(req.user.id),
    'Unread count retrieved successfully.',
  );
export const markAsRead = async (req, res) =>
  sendSuccess(
    res,
    await notificationService.markAsRead(req.params.id, req.user.id),
    'Notification marked as read.',
  );
export const markAllAsRead = async (req, res) =>
  sendSuccess(
    res,
    await notificationService.markAllAsRead(req.user.id),
    'All notifications marked as read.',
  );
export const deleteNotification = async (req, res) =>
  sendSuccess(
    res,
    await notificationService.deleteNotification(req.params.id, req.user.id),
    'Notification deleted.',
  );
export const createNotification = async (req, res) =>
  sendSuccess(res, await notificationService.createNotification(req.body), 'Notification created.');
