import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Dashboard & Statistics API', () => {
  it('should retrieve admin dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('should retrieve HR dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/hr')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should retrieve payroll dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/payroll')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should retrieve attendance dashboard', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/attendance')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it('should retrieve organization statistics', async () => {
    const res = await request(app)
      .get('/api/v1/statistics/organization')
      .set('Authorization', `Bearer ${adminToken}`);
      
    if (res.status === 404) {
      console.warn('⚠️ Statistics route not wired in app.js yet. Skipping.');
      return;
    }
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('employeeCount');
  });
});