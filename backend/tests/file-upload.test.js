import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId, testCategoryId } from './setup.js';

describe('File Upload (Multer)', () => {
  it('should successfully upload a valid PDF document', async () => {
    if (!testEmployeeId || !testCategoryId) {
      console.warn('⚠️ Skipping file upload: Missing employee or category seed data.');
      return;
    }

    const pdfBuffer = Buffer.from('%PDF-1.4 dummy pdf content');
    const res = await request(app)
      .post('/api/v1/employee-documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('employeeId', testEmployeeId)
      .field('categoryId', testCategoryId) 
      .attach('file', pdfBuffer, 'test-contract.pdf');

    expect([200, 201]).toContain(res.status); 
    expect(res.body.data).toHaveProperty('id');
  });

  it('should reject invalid file types (e.g., .exe)', async () => {
    if (!testEmployeeId || !testCategoryId) return;

    const exeBuffer = Buffer.from('MZ executable');
    const res = await request(app)
      .post('/api/v1/employee-documents')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('employeeId', testEmployeeId)
      .field('categoryId', testCategoryId)
      .attach('file', exeBuffer, 'virus.exe');

    expect(res.status).toBe(400); // Or 422 depending on your Multer error handler
  });
});