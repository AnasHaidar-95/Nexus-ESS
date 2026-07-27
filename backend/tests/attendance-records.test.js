import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Attendance Records API', () => {
  let attendanceId = '';

  it('should reject create without employeeId', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ date: '2026-07-20', isManualEntry: true });
    expect(res.status).toBe(422);
  });

  it('should reject create with non-UUID employeeId', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employeeId: 'not-a-uuid', date: '2026-07-20', isManualEntry: true });
    expect(res.status).toBe(422);
  });

  it('should reject create with check-out before check-in', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        date: '2026-07-20',
        checkInTime: '2026-07-20T17:00:00.000Z',
        checkOutTime: '2026-07-20T09:00:00.000Z',
        isManualEntry: true,
      });
    expect(res.status).toBe(422);
  });

  it('should create with minimal fields (employeeId + date)', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employeeId: testEmployeeId, date: '2026-07-20', isManualEntry: true });
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      attendanceId = res.body.data.id;
      expect(res.body.data.status).toBe('INCOMPLETE');
    }
  });

  it('should create with check-in/check-out times', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        date: '2026-07-21',
        checkInTime: '2026-07-21T09:00:00.000Z',
        checkOutTime: '2026-07-21T17:00:00.000Z',
        isManualEntry: true,
      });
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.data.checkInTime).toBeTruthy();
      expect(res.body.data.checkOutTime).toBeTruthy();
    }
  });

  it('should create with notes', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        date: '2026-07-22',
        isManualEntry: true,
        notes: 'Test manual entry',
      });
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.data.notes).toBe('Test manual entry');
    }
  });

  it('should create idempotently (allow 409 on duplicate)', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ employeeId: testEmployeeId, date: '2026-07-20', isManualEntry: true });
    expect(res.status).toBe(409);
  });

  it('should get attendance record by ID', async () => {
    if (!attendanceId) return;
    const res = await request(app)
      .get(`/api/v1/attendance-records/${attendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(attendanceId);
  });

  it('should list attendance records with pagination', async () => {
    const res = await request(app)
      .get('/api/v1/attendance-records?pageSize=5')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination.totalItems).toBeGreaterThanOrEqual(1);
  });

  it('should update (correct) an attendance record', async () => {
    if (!attendanceId) return;
    const res = await request(app)
      .patch(`/api/v1/attendance-records/${attendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ checkOutTime: '2026-07-20T17:00:00.000Z', correctionReason: 'Corrected checkout time' });
    expect(res.status).toBe(200);
    expect(res.body.data.checkOutTime).toBeTruthy();
  });

  it('should reject correction without reason', async () => {
    if (!attendanceId) return;
    const res = await request(app)
      .patch(`/api/v1/attendance-records/${attendanceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ checkOutTime: '2026-07-20T17:00:00.000Z' });
    expect(res.status).toBe(422);
  });

  it('should return 404 for non-existent route', async () => {
    const res = await request(app)
      .get('/api/v1/non-existent-route')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
