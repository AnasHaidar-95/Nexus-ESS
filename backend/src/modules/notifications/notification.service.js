import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';

export const listMyNotifications = async (userId, query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query, { createdAt: 'desc' });
  const { isRead, type } = query;

  const where = { userId };
  if (typeof isRead === 'boolean') where.isRead = isRead;
  if (type) where.type = type;

  const [notifications, totalItems] = await Promise.all([
    prisma.notification.findMany({ ...prismaArgs, where }),
    prisma.notification.count({ where }),
  ]);

  return formatPaginatedResponse(notifications, totalItems, pagination);
};

export const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return { unreadCount: count };
};

export const getNotificationById = async (id, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { id, userId },
  });
  if (!notification) throw new NotFoundError('Notification');
  return notification;
};

export const markAsRead = async (id, userId) => {
  await getNotificationById(id, userId);

  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

  return { success: true };
};

export const deleteNotification = async (id, userId) => {
  await getNotificationById(id, userId);

  await prisma.notification.delete({ where: { id } });

  return { deleted: true };
};

export const createNotification = async (data) => {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'INFO',
      metadata: data.metadata || undefined,
    },
  });
};
