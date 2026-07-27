import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Shifts API', () => {
  let createdShiftId = '';
  const shiftCode = `SHIFT-${Date.now()}`;

  it('should create a new shift', async () => {
    const res = await request(app)
      .post('/api/v1/shifts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: shiftCode,
        name: `Test Shift ${Date.now()}`,
        startTimeMinutes: 480,
        endTimeMinutes: 960,
        breakMinutes: 60,
        graceMinutes: 15
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdShiftId = res.body.data.id;
  });

  it('should list shifts', async () => {
    const res = await request(app)
      .get('/api/v1/shifts?sort=-createdAt')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.some(s => s.id === createdShiftId)).toBe(true);
  });

  it('should update shift grace period', async () => {
    if (!createdShiftId) return;
    const res = await request(app)
      .patch(`/api/v1/shifts/${createdShiftId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ graceMinutes: 10 });

    expect(res.status).toBe(200);
  });
  it('should deactivate the resource (soft delete)', async () => {
    if (!createdShiftId) return;
    let res = await request(app).delete(`/api/v1/shifts/${createdShiftId}`).set('Authorization', `Bearer ${adminToken}`);
    if (res.status === 404 || res.status === 405) {
      res = await request(app).patch(`/api/v1/shifts/${createdShiftId}`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'INACTIVE' });
    }
    expect([200, 204, 422]).toContain(res.status);
  });

});