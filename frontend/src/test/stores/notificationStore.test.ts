import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '@/stores/notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({ toasts: [], currentUserId: null });
  });

  it('should add a toast with showToast', () => {
    const { showToast } = useNotificationStore.getState();
    showToast('Test Title', 'Test Message', 'success');
    const { toasts } = useNotificationStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].title).toBe('Test Title');
    expect(toasts[0].message).toBe('Test Message');
    expect(toasts[0].type).toBe('success');
  });

  it('should remove a toast with dismissToast', () => {
    const { showToast } = useNotificationStore.getState();
    showToast('Title', 'Msg', 'info');
    const { toasts } = useNotificationStore.getState();
    const id = toasts[0].id;
    useNotificationStore.getState().dismissToast(id);
    expect(useNotificationStore.getState().toasts).toHaveLength(0);
  });

  it('should set currentUserId', () => {
    expect(useNotificationStore.getState().currentUserId).toBeNull();
    useNotificationStore.getState().setCurrentUserId('user-123');
    expect(useNotificationStore.getState().currentUserId).toBe('user-123');
  });
});
