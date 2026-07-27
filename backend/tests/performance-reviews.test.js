import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Performance Reviews API', () => {
  let createdReviewId = '';

  it('should create a performance review', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/performance-reviews')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        reviewerId: testEmployeeId,
        cycle: '2026-Q3',
        rating: 4,
        goals: { goal1: 'Improve delivery', goal2: 'Mentor juniors' },
        comments: 'Good performance'
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdReviewId = res.body.data.id;
  });

  it('should list performance reviews', async () => {
    const res = await request(app)
      .get('/api/v1/performance-reviews')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get performance review by ID', async () => {
    if (!createdReviewId) return;
    const res = await request(app)
      .get(`/api/v1/performance-reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdReviewId);
  });

  it('should update performance review', async () => {
    if (!createdReviewId) return;
    const res = await request(app)
      .patch(`/api/v1/performance-reviews/${createdReviewId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ comments: 'Updated comments' });

    expect(res.status).toBe(200);
  });

  it('should submit performance review', async () => {
    if (!createdReviewId) return;
    const res = await request(app)
      .post(`/api/v1/performance-reviews/${createdReviewId}/submit`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SUBMITTED');
  });

  it('should acknowledge performance review', async () => {
    if (!createdReviewId) return;
    const res = await request(app)
      .post(`/api/v1/performance-reviews/${createdReviewId}/acknowledge`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACKNOWLEDGED');
  });

  it('should complete performance review', async () => {
    if (!createdReviewId) return;
    const res = await request(app)
      .post(`/api/v1/performance-reviews/${createdReviewId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});
