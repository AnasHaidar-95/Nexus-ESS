import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Permissions API', () => {
  it('should list all permissions', async () => {
    const res = await request(app).get('/api/v1/permissions').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('should list permission modules', async () => {
    const res = await request(app).get('/api/v1/permissions/modules').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});