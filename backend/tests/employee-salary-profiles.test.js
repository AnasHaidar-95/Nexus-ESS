import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Employee Salary Profiles API', () => {
  let createdProfileId = '';
  let salaryComponentId = '';

  it('should fetch a salary component to use in profile creation', async () => {
    const res = await request(app)
      .get('/api/v1/salary-components?pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data?.items || [];
    if (items.length > 0) salaryComponentId = items[0].id;
  });

  it('should create a salary profile', async () => {
    if (!testEmployeeId || !salaryComponentId) return;
    const res = await request(app)
      .post('/api/v1/employee-salary-profiles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        salaryComponentId,
        effectiveFrom: new Date().toISOString().split('T')[0],
        customValue: 5000
      });

    if (res.status === 409) {
      console.warn('⚠️ Salary profile already exists. Skipping create.');
      createdProfileId = 'EXISTS';
      return;
    }
    expect([200, 201]).toContain(res.status);
    createdProfileId = res.body.data.id;
  });

  it('should list salary profiles', async () => {
    const res = await request(app)
      .get('/api/v1/employee-salary-profiles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get salary profiles by employee', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/api/v1/employee-salary-profiles/employee/${testEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get salary profile by ID', async () => {
    if (!createdProfileId || createdProfileId === 'EXISTS') return;
    const res = await request(app)
      .get(`/api/v1/employee-salary-profiles/${createdProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdProfileId);
  });

  it('should update salary profile', async () => {
    if (!createdProfileId || createdProfileId === 'EXISTS') return;
    const res = await request(app)
      .patch(`/api/v1/employee-salary-profiles/${createdProfileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ customValue: 6000 });

    expect(res.status).toBe(200);
  });

  it('should end salary profile', async () => {
    if (!createdProfileId || createdProfileId === 'EXISTS') return;
    const res = await request(app)
      .patch(`/api/v1/employee-salary-profiles/${createdProfileId}/end`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.effectiveTo).toBeTruthy();
  });
});
