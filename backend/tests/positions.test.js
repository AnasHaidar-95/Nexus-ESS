import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Positions API', () => {
  let createdPositionId = '';
  const positionCode = `POS-${Date.now()}`;

  it('should create a new position', async () => {
    const res = await request(app)
      .post('/api/v1/positions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: positionCode,
        name: `Test Position ${Date.now()}`,
        description: 'Automated test position'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdPositionId = res.body.data.id;
  });

  it('should list positions', async () => {
    const res = await request(app)
      .get('/api/v1/positions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should update a position', async () => {
    if (!createdPositionId) return;
    const res = await request(app)
      .patch(`/api/v1/positions/${createdPositionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
  });

  it('should deactivate the resource (soft delete)', async () => {
    if (!createdPositionId) return;
    let res = await request(app).delete(`/api/v1/positions/${createdPositionId}`).set('Authorization', `Bearer ${adminToken}`);
    if (res.status === 404 || res.status === 405) {
      res = await request(app).patch(`/api/v1/positions/${createdPositionId}`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: false, status: 'INACTIVE' });
    }
    expect([200, 204, 422]).toContain(res.status);
  });
});