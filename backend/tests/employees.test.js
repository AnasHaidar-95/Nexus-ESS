import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testDepartmentId, testPositionId } from './setup.js';

describe('Employees API', () => {
  let createdEmployeeId = '';
  const employeeNumber = `EMP-TEST-${Date.now()}`;

  it('should create a new employee', async () => {
    const res = await request(app)
      .post('/api/v1/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeNumber,
        firstName: 'Test',
        lastName: 'User',
        email: `test.${Date.now()}@company.com`,
        gender: 'MALE',
        hireDate: '2024-01-01',
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        departmentId: testDepartmentId,
        positionId: testPositionId
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    createdEmployeeId = res.body.data.id;
  });

  it('should list employees with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/employees?page=1&pageSize=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toHaveProperty('totalItems');
  });

  it('should get employee by ID', async () => {
    if (!createdEmployeeId) return;
    const res = await request(app)
      .get(`/api/v1/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.employeeNumber).toBe(employeeNumber);
  });

  it('should update employee details', async () => {
    if (!createdEmployeeId) return;
    const res = await request(app)
      .patch(`/api/v1/employees/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe('Updated');
  });

  it('should terminate an employee', async () => {
    if (!createdEmployeeId) return;
    const res = await request(app)
      .patch(`/api/v1/employees/${createdEmployeeId}/terminate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ terminationDate: '2026-12-31', terminationReason: 'Test' });

    expect(res.status).toBe(200);
    expect(res.body.data.employmentStatus).toBe('TERMINATED');
  });

  it('should return 404 for non-existent employee', async () => {
    const res = await request(app)
      .get('/api/v1/employees/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
