import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Leave Balances API', () => {
  let createdBalanceId = '';
  let leaveTypeId = '';

  it('should fetch a leave type to use in balance creation', async () => {
    const res = await request(app)
      .get('/api/v1/leave-types?pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const items = res.body.data.items || [];
    if (items.length > 0) leaveTypeId = items[0].id;
  });

  it('should create a leave balance', async () => {
    if (!testEmployeeId || !leaveTypeId) return;
    const res = await request(app)
      .post('/api/v1/leave-balances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        leaveTypeId,
        year: new Date().getFullYear(),
        entitledDays: 30,
        usedDays: 5,
        carriedOverDays: 2
      });

    if (res.status === 409) {
      console.warn('⚠️ Leave balance already exists. Skipping create.');
      createdBalanceId = 'EXISTS';
      return;
    }
    expect([200, 201]).toContain(res.status);
    createdBalanceId = res.body.data.id;
  });

  it('should list leave balances', async () => {
    const res = await request(app)
      .get('/api/v1/leave-balances')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get leave balances by employee', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/api/v1/leave-balances/employee/${testEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get leave balance by ID', async () => {
    if (!createdBalanceId || createdBalanceId === 'EXISTS') return;
    const res = await request(app)
      .get(`/api/v1/leave-balances/${createdBalanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdBalanceId);
  });

  it('should update leave balance', async () => {
    if (!createdBalanceId || createdBalanceId === 'EXISTS') return;
    const res = await request(app)
      .patch(`/api/v1/leave-balances/${createdBalanceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ usedDays: 10 });

    expect(res.status).toBe(200);
  });
});
