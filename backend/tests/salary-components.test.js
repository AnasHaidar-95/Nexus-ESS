import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Salary Components API', () => {
  let componentId = '';
  const code = `BONUS_${Date.now()}`;

  it('should create a new salary component', async () => {
    const res = await request(app)
      .post('/api/v1/salary-components')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code,
        name: `Performance Bonus ${Date.now()}`,
        type: 'EARNING',
        calculationMethod: 'FIXED',
        defaultValue: 500,
        isTaxable: true,
        isPensionable: false
      });
    expect([200, 201]).toContain(res.status);
    componentId = res.body.data.id;
  });

  it('should list salary components', async () => {
    const res = await request(app).get('/api/v1/salary-components').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.some(c => c.id === componentId)).toBe(true);
  });

  it('should update a salary component', async () => {
    const res = await request(app)
      .patch(`/api/v1/salary-components/${componentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ defaultValue: 750 });
    expect(res.status).toBe(200);
  });

  it('should deactivate a salary component (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/v1/salary-components/${componentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.status);
  });
});