import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('RBAC & Authorization', () => {
  let employeeToken = '';

  beforeAll(async () => {
    // To properly test RBAC, we need a token for a user with limited permissions.
    // If your seed script creates a standard 'employee' user, login here:
    const empRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'employee', password: 'Employee@12345' }); // Adjust credentials based on your seed
    
    if (empRes.status === 200) {
      employeeToken = empRes.body.data.accessToken;
    }
  });

  it('should allow Admin to access system settings', async () => {
    const res = await request(app)
      .get('/api/v1/system-settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject unauthenticated requests (401)', async () => {
    const res = await request(app).get('/api/v1/employees');
    
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('should reject requests with invalid JWT (401)', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('should reject requests with missing Bearer prefix (401)', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Authorization', adminToken); // Missing "Bearer "

    expect(res.status).toBe(401);
  });

  it('should prevent standard employees from accessing admin routes (403)', async () => {
    if (!employeeToken) {
      console.warn('⚠️ Skipping RBAC employee test: No standard employee user seeded.');
      return;
    }

    const res = await request(app)
      .get('/api/v1/system-settings') // Admin-only route
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
  });
});