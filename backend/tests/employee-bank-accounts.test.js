import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { adminToken, testEmployeeId } from './setup.js';

describe('Employee Bank Accounts API', () => {
  let createdAccountId = '';

  it('should create a bank account', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .post('/api/v1/employee-bank-accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        employeeId: testEmployeeId,
        accountName: 'John Doe',
        accountNumber: `ACC-${Date.now()}`,
        bankName: 'Test Bank',
        branchCode: 'BR001',
        swiftCode: 'TESTBAAA',
        isDefault: true
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.success).toBe(true);
    createdAccountId = res.body.data.id;
  });

  it('should list bank accounts', async () => {
    const res = await request(app)
      .get('/api/v1/employee-bank-accounts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
  });

  it('should get bank accounts by employee', async () => {
    if (!testEmployeeId) return;
    const res = await request(app)
      .get(`/api/v1/employee-bank-accounts/employee/${testEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should get bank account by ID', async () => {
    if (!createdAccountId) return;
    const res = await request(app)
      .get(`/api/v1/employee-bank-accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdAccountId);
  });

  it('should update bank account', async () => {
    if (!createdAccountId) return;
    const res = await request(app)
      .patch(`/api/v1/employee-bank-accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ accountName: 'Jane Doe' });

    expect(res.status).toBe(200);
  });

  it('should set bank account as default', async () => {
    if (!createdAccountId) return;
    const res = await request(app)
      .patch(`/api/v1/employee-bank-accounts/${createdAccountId}/default`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isDefault).toBe(true);
  });

  it('should delete bank account', async () => {
    if (!createdAccountId) return;
    const res = await request(app)
      .delete(`/api/v1/employee-bank-accounts/${createdAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
