import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Profile Change Requests API', () => {
  let createdRequestId = '';

  it('should create a profile change request', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/profile-change-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        field: 'phone',
        newValue: '+971501234567'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdRequestId = res.body.data.id;
  });

  it('should list profile change requests', async () => {
    const res = await request(app)
      .get('/api/v1/profile-change-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get profile change request by ID', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .get(`/api/v1/profile-change-requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdRequestId);
  });

  it('should approve profile change request', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .post(`/api/v1/profile-change-requests/${createdRequestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should reject a non-existent request with 404', async () => {
    const res = await request(app)
      .post('/api/v1/profile-change-requests/00000000-0000-0000-0000-000000000000/reject')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Not valid' });

    expect(res.status).toBe(404);
  });
});
