import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testDepartmentId, testPositionId } from './setup.js';

describe('Users API', () => {
  let createdUserId = '';
  let createdEmployeeId = '';
  let testRoleId = '';

  beforeAll(async () => {
    // 1. Fetch a role to assign
  const rolesRes = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${adminToken}`);
const rolesItems = Array.isArray(rolesRes.body.data) ? rolesRes.body.data : rolesRes.body.data?.items;
if (rolesItems?.length > 0) {
  testRoleId = rolesItems.find(r => r.code === 'EMPLOYEE')?.id || rolesItems[0].id;
}

    // 2. Create a dedicated employee for this user
    const empRes = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeNumber: `EMP-USR-${Date.now()}`,
        firstName: 'User',
        lastName: 'Test',
        email: `usertest.${Date.now()}@company.com`,
        gender: 'FEMALE',
        hireDate: '2024-01-01',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        departmentId: testDepartmentId,
        positionId: testPositionId
      });
    createdEmployeeId = empRes.body.data.id;
  });

  it('should create a new user account', async () => {
    if (!createdEmployeeId || !testRoleId) return;
    
    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: createdEmployeeId,
        username: `testuser_${Date.now()}`,
        email: `testuser_${Date.now()}@company.com`,
        roleId: testRoleId,
        temporaryPassword: 'TempPass@123',
        forcePasswordChange: true
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdUserId = res.body.data.id;
  });

  it('should list users', async () => {
    const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should deactivate a user', async () => {
    if (!createdUserId) return;
    const res = await request(app)
      .patch(`/api/v1/users/${createdUserId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INACTIVE');
  });
});
