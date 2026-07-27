import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, adminUserId } from './setup.js';

describe('Audit Logs API', () => {
it('should return 404 for non-existent routes', async () => {
  const res = await request(app)
    .get('/api/v1/non-existent-route')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(404);
});
    it('should filter audit logs by user', async () => {
        if (!adminUserId) return;
        const res = await request(app)
            .get(`/api/v1/audit-logs/user/${adminUserId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });

    it('should filter audit logs by entity', async () => {
        const res = await request(app)
            .get('/api/v1/audit-logs/entity/employees')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });
});