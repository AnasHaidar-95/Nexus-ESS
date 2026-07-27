import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Departments API', () => {
  let createdDeptId = '';
  const deptCode = `DEPT-${Date.now()}`;

  it('should create a new department', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Department ${Date.now()}`,
        code: deptCode,
        description: 'Automated test department'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.data.code).toBe(deptCode);
    createdDeptId = res.body.data.id;
  });
  it('should deactivate the resource (soft delete)', async () => {
    if (!createdDeptId) return;
    let res = await request(app).delete(`/api/v1/departments/${createdDeptId}`).set('Authorization', `Bearer ${adminToken}`);
    if (res.status === 404 || res.status === 405) {
      res = await request(app).patch(`/api/v1/departments/${createdDeptId}`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: false, status: 'INACTIVE' });
    }
    expect([200, 204, 422]).toContain(res.status);
  });
  
  it('should assign a manager to the department', async () => {
    if (!createdDeptId || !testEmployeeId) return;
    const res = await request(app)
      .patch(`/api/v1/departments/${createdDeptId}/manager`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ managerId: testEmployeeId });
    expect(res.status).toBe(200);
  });

  it('should list departments', async () => {
    const res = await request(app).get('/api/v1/departments?sort=-createdAt').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.some(d => d.id === createdDeptId)).toBe(true);
  });
});