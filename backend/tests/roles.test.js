import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Roles & Permissions API', () => {
  let createdRoleId = '';
  let testPermissionCode = '';

  beforeAll(async () => {
    if (!adminToken) return;
    const res = await request(app)
      .get('/api/v1/permissions?pageSize=1')
      .set('Authorization', `Bearer ${adminToken}`);
    const perms = Array.isArray(res.body.data) ? res.body.data : res.body.data?.items;
    if (perms?.length > 0) {
      testPermissionCode = perms[0].code;
    }
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app)
      .get('/api/v1/non-existent-route')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('should create a new custom role', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Test Role ${Date.now()}`,
        code: `TEST_${Date.now()}`,
        description: 'Automated test role'
      });

    expect([200, 201]).toContain(res.status);
    createdRoleId = res.body.data.id;
  });

  it('should assign permissions to the role', async () => {
    if (!createdRoleId || !testPermissionCode) return;
    const res = await request(app)
      .put(`/api/v1/roles/${createdRoleId}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ permissionIds: [testPermissionCode] });

    expect(res.status).toBe(200);
  });

  it('should retrieve role permissions', async () => {
    if (!createdRoleId || !testPermissionCode) return;
    const res = await request(app)
      .get(`/api/v1/roles/${createdRoleId}/permissions`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const perms = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(perms.includes(testPermissionCode)).toBe(true);
  });
});