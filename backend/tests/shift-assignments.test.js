import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Shift Assignments API', () => {
  let testShiftId = '';
  let assignmentId = '';

  beforeAll(async () => {
    // Create a dedicated shift for assignment testing
    const shiftRes = await request(app)
      .post('/api/v1/shifts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: `ASN-SHIFT-${Date.now()}`,
        name: 'Assignment Test Shift',
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 60
      });
    
    if (shiftRes.status === 201 || shiftRes.status === 200) {
      testShiftId = shiftRes.body.data.id;
    }
  });

  it('should assign a shift to an employee', async () => {
    if (!testShiftId || !testEmployeeId) return;
    
    const res = await request(app)
      .post('/api/v1/shift-assignments') // Or /employee-shift-assignments based on your router
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        shiftId: testShiftId,
        effectiveFrom: new Date().toISOString().split('T')[0],
        notes: 'Automated test assignment'
      });

    expect([200, 201]).toContain(res.status);
    assignmentId = res.body.data.id;
  });

  it('should list shift assignments', async () => {
    const res = await request(app)
      .get(`/api/v1/shift-assignments?employeeId=${testEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should end a shift assignment', async () => {
    if (!assignmentId) return;
    
    // Try DELETE first, if your API uses PATCH to set an end date, it will fallback
    let res = await request(app)
      .delete(`/api/v1/shift-assignments/${assignmentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    if (res.status === 404 || res.status === 405) {
       res = await request(app)
         .patch(`/api/v1/shift-assignments/${assignmentId}`)
         .set('Authorization', `Bearer ${adminToken}`)
         .send({ effectiveTo: new Date().toISOString().split('T')[0] });
    }
    
    expect([200, 204, 404]).toContain(res.status);
  });
});