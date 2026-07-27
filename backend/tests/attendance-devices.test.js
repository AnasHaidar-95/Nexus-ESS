import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Attendance Devices API', () => {
  let deviceId = '';
  const deviceCode = `DEV-TEST-${Date.now()}`;

  it('should register a new attendance device', async () => {
    const res = await request(app)
      .post('/api/v1/attendance-devices')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        deviceCode,
        deviceName: 'Test Biometric Terminal',
        deviceType: 'FINGERPRINT',
        manufacturer: 'ZKTeco',
        serialNumber: `SN-${Date.now()}`,
        ipAddress: '192.168.1.100',
        port: 8080,
        location: 'Main Entrance'
      });
    expect([200, 201]).toContain(res.status);
    deviceId = res.body.data.id;
  });

  it('should update device location', async () => {
    if (!deviceId) return;
    const res = await request(app)
      .patch(`/api/v1/attendance-devices/${deviceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ location: 'Back Entrance' });
    expect(res.status).toBe(200);
  });

  it('should deactivate device', async () => {
    if (!deviceId) return;
    const res = await request(app)
      .delete(`/api/v1/attendance-devices/${deviceId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 204]).toContain(res.status);
  });
it('should return 404 for non-existent routes', async () => {
  const res = await request(app)
    .get('/api/v1/non-existent-route')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(404);
});
});