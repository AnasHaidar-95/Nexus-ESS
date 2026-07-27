import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Pagination & Query Handling', () => {
  let localAdminToken = '';

  beforeAll(async () => {
    // Use the token from setup.js, or fallback if it wasn't exported correctly
    localAdminToken = adminToken;
    
    if (!localAdminToken) {
      const res = await request(app).post('/api/v1/auth/login').send({ username: 'admin', password: 'Admin@12345' });
      localAdminToken = res.body.data.accessToken;
    }
  });

  it('should return paginated response with correct metadata', async () => {
    const res = await request(app)
      .get('/api/v1/employees?page=1&pageSize=5') // Ensure camelCase 'pageSize'
      .set('Authorization', `Bearer ${localAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('items');
    expect(res.body.data).toHaveProperty('pagination');
    
    const { pagination } = res.body.data;
    expect(pagination.page).toBe(1);
    expect(pagination.pageSize).toBe(5); // This will now pass
    expect(pagination).toHaveProperty('totalItems');
    expect(pagination).toHaveProperty('totalPages');
  });

  it('should enforce maximum page size limit (100)', async () => {
    const res = await request(app)
      .get('/api/v1/employees?pageSize=500') // Exceeds limit
      .set('Authorization', `Bearer ${localAdminToken}`);

    expect(res.status).toBe(200);
    // The query-handler.js caps pageSize at 100
    expect(res.body.data.pagination.pageSize).toBeLessThanOrEqual(100); 
  });
});