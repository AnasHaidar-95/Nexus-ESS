import { create } from 'zustand';
import { NotificationType } from '../types';
import { notificationApi } from '../lib/notifications';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'sparkle';
  duration?: number;
}

interface NotificationStore {
  toasts: Toast[];
  currentUserId: string | null;
  showToast: (title: string, message: string, type?: Toast['type'], duration?: number) => void;
  dismissToast: (id: string) => void;
  sendNotification: (userId: string, title: string, message: string, type: NotificationType, metadata?: any) => void;
  setCurrentUserId: (id: string | null) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  toasts: [],
  currentUserId: null,
  showToast: (title, message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, title, message, type, duration }] }));
  },
  dismissToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  sendNotification: async (userId, title, message, type, metadata) => {
    try {
      await notificationApi.send({ userId, title, message, type, metadata });
    } catch {
      // Silently fail — notification creation is non-critical
    }
    // Show local toast if sending to self
    if (get().currentUserId === userId) {
      let toastType: Toast['type'] = 'info';
      if (type === 'SUCCESS' || type === 'LEAVE_APPROVED') toastType = 'success';
      if (type === 'WARNING') toastType = 'warning';
      if (type === 'ERROR' || type === 'LEAVE_REJECTED') toastType = 'error';
      if (type === 'PAYROLL_READY') toastType = 'sparkle';
      get().showToast(title, message, toastType);
    }
  },
  setCurrentUserId: (id) => set({ currentUserId: id }),
}));
