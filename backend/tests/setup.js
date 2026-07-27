import { vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/core/utils/prisma.js';
import { loadPermissionsCache } from '../src/core/utils/permission-cache.js';


// ==========================================
// 🚀 API REQUEST LOGGER (Intercepts all Supertest requests)
// ==========================================
// FIX: Prevent wrapping app.handle multiple times across test files
if (!app.__requestLoggerAttached) {
  const originalHandle = app.handle.bind(app);
  app.handle = function (req, res, callback) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const success = status >= 200 && status < 400 ? 'SUCCESS' : 'FAILED';
      
      const method = req.method.padEnd(6);
      const url = `http://localhost:3000${req.originalUrl}`.padEnd(65);
      
      const color = success === 'SUCCESS' ? '\x1b[32m' : '\x1b[31m'; 
      const reset = '\x1b[0m';
      
      console.log(`${color}${method} ${url} ${success.padEnd(7)} ${status}  ${duration}ms${reset}`);
    });
    
    originalHandle(req, res, callback);
  };
  app.__requestLoggerAttached = true; // 👈 Mark as attached
}
// ==========================================


// Mock logger to keep test output clean
vi.mock('../src/core/utils/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn(), http: vi.fn(), stream: { write: vi.fn() } },
  morganStream: { write: vi.fn() }
}));

export let adminToken = '';
export let adminUserId = '';
export let testDepartmentId = '';
export let testPositionId = '';
export let testEmployeeId = '';
export let testCategoryId = '';
export let testRoleId = '';

beforeAll(async () => {
  await prisma.$connect();
  await loadPermissionsCache();

  // 1. Login as Admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ username: 'admin', password: 'Admin@12345' });

  if (adminRes.status !== 200) throw new Error(`Admin login failed: ${adminRes.body?.message}`);
  
  adminToken = adminRes.body.data.accessToken;
  adminUserId = adminRes.body.data.user.id;

  // 2. Fetch seed data for foreign keys
 const deptRes = await request(app).get('/api/v1/departments').set('Authorization', `Bearer ${adminToken}`);
const deptItems = Array.isArray(deptRes.body.data) ? deptRes.body.data : deptRes.body.data?.items;
if (deptRes.status === 200 && deptItems?.length > 0) {
  testDepartmentId = deptItems[0].id;
}
const posRes = await request(app).get('/api/v1/positions').set('Authorization', `Bearer ${adminToken}`);
const posItems = Array.isArray(posRes.body.data) ? posRes.body.data : posRes.body.data?.items;
if (posRes.status === 200 && posItems?.length > 0) {
  testPositionId = posItems[0].id;
}
const empRes = await request(app).get('/api/v1/employees?pageSize=1').set('Authorization', `Bearer ${adminToken}`);
const empItems = Array.isArray(empRes.body.data) ? empRes.body.data : empRes.body.data?.items;
if (empRes.status === 200 && empItems?.length > 0) {
  testEmployeeId = empItems[0].id;
}
  const catRes = await request(app).get('/api/v1/document-categories?pageSize=1').set('Authorization', `Bearer ${adminToken}`);
  if (catRes.status === 200 && catRes.body.data?.items?.length > 0) testCategoryId = catRes.body.data.items[0].id;

  const roleRes = await request(app).get('/api/v1/roles?pageSize=1').set('Authorization', `Bearer ${adminToken}`);
  if (roleRes.status === 200 && roleRes.body.data?.items?.length > 0) testRoleId = roleRes.body.data.items[0].id;
});

afterAll(async () => {
  await prisma.$disconnect();
});