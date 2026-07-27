import type { NotificationType } from './enums';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  metadata?: unknown;
  createdAt: string;
}
