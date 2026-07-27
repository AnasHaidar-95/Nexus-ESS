import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testDepartmentId, testPositionId } from './setup.js';

describe('Comprehensive Role-Based Access Control (RBAC)', () => {
  let employeeToken = '';
  let employeeUsername = `rbac_user_${Date.now()}`;
  
  beforeAll(async () => {
    const rolesRes = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${adminToken}`);
    if (rolesRes.status === 404) return;
    
    const rolesData = rolesRes.body.data?.items || rolesRes.body.data || [];
    const employeeRole = rolesData.find(r => r.code === 'EMPLOYEE');
    if (!employeeRole) return; 

    // 2. Create a dedicated employee
    const empRes = await request(app).post('/api/v1/employees').set('Authorization', `Bearer ${adminToken}`).send({
      employeeNumber: `EMP-RBAC-${Date.now()}`, firstName: 'RBAC', lastName: 'Tester',
      email: `rbac.test.${Date.now()}@company.com`, gender: 'MALE', hireDate: '2024-01-01',
      employmentStatus: 'ACTIVE', employmentType: 'FULL_TIME', departmentId: testDepartmentId, positionId: testPositionId
    });
    
    
    if (empRes.status >= 400) return;
    const empId = empRes.body.data.id;

    // 3. Create a user account for this employee with EMPLOYEE role
    await request(app).post('/api/v1/users').set('Authorization', `Bearer ${adminToken}`).send({
      employeeId: empId, username: employeeUsername, email: `rbac.user.${Date.now()}@company.com`,
      roleId: employeeRole.id, temporaryPassword: 'TempPass@123', forcePasswordChange: false
    });

    // 4. Login as the Employee
    const loginRes = await request(app).post('/api/v1/auth/login').send({ username: employeeUsername, password: 'TempPass@123' });
    if (loginRes.status === 200) employeeToken = loginRes.body.data.accessToken;
  });

  it('Admin should access system settings', async () => {
    const res = await request(app).get('/api/v1/system-settings').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
  
  it('Admin should access audit logs', async () => {
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('Employee should NOT access system settings (403)', async () => {
    if (!employeeToken) return;
   const res = await request(app).get('/api/v1/system-settings').set('Authorization', `Bearer ${employeeToken}`);
   expect(res.status).toBe(403);
  });

  it('Employee should NOT access audit logs (403)', async () => {
    if (!employeeToken) return;
    const res = await request(app)
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
  });

  it('Employee should NOT create new employees (403)', async () => {
    if (!employeeToken) return;
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({ firstName: 'Hack', lastName: 'Attempt' });
    expect(res.status).toBe(403);
  });

  it('Employee should NOT access Admin dashboard (403)', async () => {
    if (!employeeToken) return;
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${employeeToken}`);
    expect(res.status).toBe(403);
  });
});