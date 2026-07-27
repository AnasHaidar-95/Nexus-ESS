import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Leave Types API', () => {
  let createdLeaveTypeId = '';
  const leaveTypeCode = `LT-${Date.now()}`;

  it('should create a new leave type', async () => {
    const res = await request(app)
      .post('/api/v1/leave-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Leave Type ${Date.now()}`,
        code: leaveTypeCode,
        description: 'Test leave type',
        isPaid: true,
        carryForward: true,
        maxDaysPerYear: 30
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdLeaveTypeId = res.body.data.id;
  });

  it('should list leave types', async () => {
    const res = await request(app)
      .get('/api/v1/leave-types?sort=-createdAt')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.items.some(lt => lt.id === createdLeaveTypeId)).toBe(!!createdLeaveTypeId);
  });

  it('should get leave type by ID', async () => {
    if (!createdLeaveTypeId) return;
    const res = await request(app)
      .get(`/api/v1/leave-types/${createdLeaveTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdLeaveTypeId);
  });

  it('should update leave type', async () => {
    if (!createdLeaveTypeId) return;
    const res = await request(app)
      .patch(`/api/v1/leave-types/${createdLeaveTypeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
  });

  it('should deactivate leave type', async () => {
    if (!createdLeaveTypeId) return;
    const res = await request(app)
      .patch(`/api/v1/leave-types/${createdLeaveTypeId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INACTIVE');
  });

  it('should activate leave type', async () => {
    if (!createdLeaveTypeId) return;
    const res = await request(app)
      .patch(`/api/v1/leave-types/${createdLeaveTypeId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });
});
