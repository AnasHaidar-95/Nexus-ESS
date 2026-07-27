import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/core/utils/prisma.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Leave Requests API', () => {
  let createdRequestId = '';
  let leaveTypeId = '';

  it('should fetch a leave type to use in request creation', async () => {
    const res = await request(app)
      .get('/api/v1/leave-types?pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const items = res.body.data.items || [];
    if (items.length > 0) leaveTypeId = items[0].id;
  });

  it('should create a leave request', async () => {
    if (!testEmployeeId || !leaveTypeId) return;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 4);

    const res = await request(app)
      .post('/api/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        leaveTypeId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays: 5,
        reason: 'Test leave request'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdRequestId = res.body.data.id;
  });

  it('should list leave requests', async () => {
    const res = await request(app)
      .get('/api/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get my leave requests', async () => {
    const res = await request(app)
      .get('/api/v1/leave-requests/my')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get leave request by ID', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .get(`/api/v1/leave-requests/${createdRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdRequestId);
  });

  it('should approve leave request', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .post(`/api/v1/leave-requests/${createdRequestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should get approval steps', async () => {
    if (!createdRequestId) return;
    const res = await request(app)
      .get(`/api/v1/leave-requests/${createdRequestId}/approval-steps`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should reject a non-existent request with 404', async () => {
    const res = await request(app)
      .post('/api/v1/leave-requests/00000000-0000-0000-0000-000000000000/reject')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Not valid' });

    expect(res.status).toBe(404);
  });

  it('should decrement LeaveBalance.usedDays when pending leave is rejected', async () => {
    if (!testEmployeeId || !leaveTypeId) return;

    const year = new Date().getFullYear();
    const totalDays = 2;

    let balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: testEmployeeId, leaveTypeId, year } }
    });
    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: { employeeId: testEmployeeId, leaveTypeId, year, entitledDays: 20, usedDays: 0 }
      });
    }
    const originalUsedDays = Number(balance.usedDays);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 60);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays - 1);

    const createRes = await request(app)
      .post('/api/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        leaveTypeId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays,
        reason: 'Rejection balance test'
      });

    expect([200, 201]).toContain(createRes.status);
    const requestId = createRes.body.data.id;

    const rejectRes = await request(app)
      .post(`/api/v1/leave-requests/${requestId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Testing rejection' });
    expect(rejectRes.status).toBe(200);

    const afterReject = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: testEmployeeId, leaveTypeId, year } }
    });
    expect(Number(afterReject.usedDays)).toBe(originalUsedDays);
  });

  it('should decrement LeaveBalance.usedDays when approved leave is cancelled', async () => {
    if (!testEmployeeId || !leaveTypeId) return;

    const year = new Date().getFullYear();
    const totalDays = 2;

    let balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: testEmployeeId, leaveTypeId, year } }
    });
    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: { employeeId: testEmployeeId, leaveTypeId, year, entitledDays: 20, usedDays: 0 }
      });
    }
    const originalUsedDays = Number(balance.usedDays);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 90);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalDays - 1);

    const createRes = await request(app)
      .post('/api/v1/leave-requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        leaveTypeId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        totalDays,
        reason: 'Cancel balance test'
      });

    expect([200, 201]).toContain(createRes.status);
    const requestId = createRes.body.data.id;

    const approveRes = await request(app)
      .post(`/api/v1/leave-requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(approveRes.status).toBe(200);

    const afterApprove = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: testEmployeeId, leaveTypeId, year } }
    });
    expect(Number(afterApprove.usedDays)).toBe(originalUsedDays + totalDays);

    const cancelRes = await request(app)
      .post(`/api/v1/leave-requests/${requestId}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(cancelRes.status).toBe(200);

    const afterCancel = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveTypeId_year: { employeeId: testEmployeeId, leaveTypeId, year } }
    });
    expect(Number(afterCancel.usedDays)).toBe(originalUsedDays);
  });
});
