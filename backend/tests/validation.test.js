import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Zod Validation & Error Handling', () => {
  let adminToken = '';

  beforeAll(async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ username: 'admin', password: 'Admin@12345' });
    adminToken = res.body.data.accessToken;
  });

  it('should return 422 for missing required fields (Create Department)', async () => {
    const res = await request(app)
      .post('/api/v1/departments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Missing name and code' }); // Missing name & code

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toBeInstanceOf(Array);
    expect(res.body.error.fields.length).toBeGreaterThan(0);
  });

it('should return 400 or 422 for invalid UUID format', async () => {
  const res = await request(app)
    .get('/api/v1/employees/not-a-valid-uuid')
    .set('Authorization', `Bearer ${adminToken}`);
  expect([400, 422]).toContain(res.status); 
});

  it('should return 404 for non-existent resources', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/api/v1/departments/${fakeUuid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});