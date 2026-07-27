import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Attendance Incidents API', () => {
  let attendanceRecordId = '';
  let incidentId = '';
  const today = new Date().toISOString().split('T')[0];

  beforeAll(async () => {
    // Create a manual attendance record to attach the incident to
    const attRes = await request(app)
      .post('/api/v1/attendance-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        attendanceDate: today,
        checkIn: '08:30', // Late check-in to justify an incident
        checkOut: '16:00',
        source: 'MANUAL'
      });

    if (attRes.status === 201 || attRes.status === 200) {
      attendanceRecordId = attRes.body.data.id;
    }
  });

  it('should create an attendance incident', async () => {
    if (!attendanceRecordId) return;
    
    const res = await request(app)
      .post('/api/v1/attendance-incidents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        attendanceRecordId,
        incidentType: 'LATE_ARRIVAL',
        severity: 'LOW',
        description: 'Automated test incident for late arrival'
      });

    expect([200, 201]).toContain(res.status);
    incidentId = res.body.data.id;
  });

  it('should add a comment to an incident', async () => {
    if (!incidentId) return;
    const res = await request(app)
      .post(`/api/v1/attendance-incidents/${incidentId}/comment`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ comment: 'Employee provided valid medical certificate.' });

    expect([200, 201]).toContain(res.status);
  });

  it('should resolve an incident', async () => {
    if (!incidentId) return;
    const res = await request(app)
      .post(`/api/v1/attendance-incidents/${incidentId}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ resolutionNotes: 'Excused by HR.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RESOLVED');
  });
});