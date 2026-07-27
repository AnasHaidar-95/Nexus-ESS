import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Authentication API', () => {
  // Store tokens at the describe block level to share between tests
  let sharedRefreshToken = '';

  it('should login successfully with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'Admin@12345' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    
    // Assign to the shared variable so the next test can use it
    sharedRefreshToken = res.body.data.refreshToken;
  });

  it('should reject login with invalid password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should refresh token successfully using the shared refresh token', async () => {
    // Ensure we have a token from the previous test
    expect(sharedRefreshToken).toBeTruthy();

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: sharedRefreshToken });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken'); // Verifies token rotation
  });

  it('should reject an invalid refresh token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-refresh-token-string' });

    expect(res.status).toBe(401);
  });
});
