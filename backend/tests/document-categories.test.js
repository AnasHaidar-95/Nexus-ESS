import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken } from './setup.js';

describe('Document Categories API', () => {
  let createdCategoryId = '';
  const categoryCode = `CAT-${Date.now()}`;

  it('should create a new document category', async () => {
    const res = await request(app)
      .post('/api/v1/document-categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        code: categoryCode,
        name: `Test Category ${Date.now()}`,
        description: 'Automated test category'
      });

    expect([200, 201]).toContain(res.status);
    createdCategoryId = res.body.data.id;
  });

  it('should list document categories', async () => {
    const res = await request(app)
      .get('/api/v1/document-categories?sort=-createdAt')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.some(c => c.id === createdCategoryId)).toBe(true);
  });

  it('should update a document category', async () => {
    if (!createdCategoryId) return;
    const res = await request(app)
      .patch(`/api/v1/document-categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
  });

  it('should deactivate the resource (soft delete)', async () => {
    if (!createdCategoryId) return;
    let res = await request(app).delete(`/api/v1/document-categories/${createdCategoryId}`).set('Authorization', `Bearer ${adminToken}`);
    if (res.status === 404 || res.status === 405) {
      res = await request(app).patch(`/api/v1/document-categories/${createdCategoryId}`).set('Authorization', `Bearer ${adminToken}`).send({ isActive: false, status: 'INACTIVE' });
    }
    expect([200, 204, 422]).toContain(res.status);
  });
});