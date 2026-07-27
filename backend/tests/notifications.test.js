import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, adminUserId } from './setup.js';

describe('Notifications API', () => {
  let createdNotificationId = '';

  beforeAll(async () => {
    // Create a notification directly via the user's relation
    if (!adminUserId) return;
    const { prisma } = await import('../src/core/utils/prisma.js');
    const notif = await prisma.notification.create({
      data: {
        userId: adminUserId,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'INFO'
      }
    });
    createdNotificationId = notif.id;
  });

  it('should list notifications', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('unreadCount');
  });

  it('should mark notification as read', async () => {
    if (!createdNotificationId) return;
    const res = await request(app)
      .patch(`/api/v1/notifications/${createdNotificationId}/read`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isRead).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('should delete notification', async () => {
    if (!createdNotificationId) return;
    const res = await request(app)
      .delete(`/api/v1/notifications/${createdNotificationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
