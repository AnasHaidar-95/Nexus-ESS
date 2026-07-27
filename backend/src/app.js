import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/index.js';
import { morganStream } from './core/utils/logger.js';
import { globalErrorHandler } from './core/middleware/error-handler.js';
import { standardLimiter } from './core/middleware/rate-limiter.js';
import { sendSuccess, sendError } from './core/utils/api-response.js';
import { isRedisConnected } from './core/cache/redis.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';

// --- Module Routes ---
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import employeeRoutes from './modules/employees/employee.routes.js';
import departmentRoutes from './modules/departments/department.routes.js';
import positionRoutes from './modules/positions/position.routes.js';
import shiftRoutes from './modules/shifts/shift.routes.js';
import assignmentRoutes from './modules/shift-assignments/assignment.routes.js';
import attendanceRecordRoutes from './modules/attendance-records/attendance-record.routes.js';
import attendanceIncidentRoutes from './modules/attendance-incidents/attendance-incident.routes.js';
import holidayRoutes from './modules/holidays/holiday.routes.js';
import categoryRoutes from './modules/document-categories/category.routes.js';
import documentRoutes from './modules/documents/document.routes.js';
import settingRoutes from './modules/settings/setting.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import payrollPeriodRoutes from './modules/payroll-periods/payroll-period.routes.js';
import payrollRoutes from './modules/payroll/payroll.routes.js';
import payrollDisbursementRoutes from './modules/payroll-disbursements/payroll-disbursement.routes.js';
import payslipItemRoutes from './modules/payslip-items/payslip-item.routes.js';
import auditLogRoutes from './modules/audit-logs/audit-log.routes.js';
import attendanceDeviceRoutes from './modules/attendance-devices/attendance-device.routes.js';
import roleRoutes from './modules/roles/role.routes.js';
import permissionRoutes from './modules/permissions/permission.routes.js';
import salaryComponentRoutes from './modules/salary-components/salary-component.routes.js';
import leaveTypeRoutes from './modules/leave-types/leave-type.routes.js';
import leaveBalanceRoutes from './modules/leave-balances/leave-balance.routes.js';
import leaveRequestRoutes from './modules/leave-requests/leave-request.routes.js';
import employeeBankAccountRoutes from './modules/employee-bank-accounts/employee-bank-account.routes.js';
import employeeSalaryProfileRoutes from './modules/employee-salary-profiles/employee-salary-profile.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import performanceReviewRoutes from './modules/performance-reviews/performance-review.routes.js';
import profileChangeRequestRoutes from './modules/profile-change-requests/profile-change-request.routes.js';
import applicantRoutes from './modules/applicants/applicant.routes.js';

const app = express();

// --- 1. Global Security & Infrastructure Middleware ---
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
    },
  }),
);

app.use(cors({ origin: config.cors?.origins || '*', credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(standardLimiter);

// --- 4. Centralized HTTP Request Logging ---
if (config.isDev) {
  // In development, use standard colored console output
  app.use(morgan('dev'));
} else {
  // In production, pipe HTTP logs directly into Winston's JSON files
  app.use(morgan('combined', { stream: morganStream }));
}

// --- 5. Health Check Endpoint ---
app.get('/api/v1/health', (req, res) => {
  sendSuccess(res, {
    status: 'UP',
    environment: config.env,
    redis: isRedisConnected() ? 'connected' : 'unavailable',
  }, 'API is healthy', 200);
});

// --- 6. Swagger Documentation ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// --- 7. API Routes Registration ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/positions', positionRoutes);
app.use('/api/v1/shifts', shiftRoutes);
app.use('/api/v1/shift-assignments', assignmentRoutes);
app.use('/api/v1/attendance-records', attendanceRecordRoutes);
app.use('/api/v1/attendance-incidents', attendanceIncidentRoutes);
app.use('/api/v1/holidays', holidayRoutes);
app.use('/api/v1/document-categories', categoryRoutes);
app.use('/api/v1/employee-documents', documentRoutes);
app.use('/api/v1/system-settings', settingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payroll-periods', payrollPeriodRoutes);
app.use('/api/v1/payrolls', payrollRoutes);
app.use('/api/v1/payroll-disbursements', payrollDisbursementRoutes);
app.use('/api/v1/payslip-items', payslipItemRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/attendance-devices', attendanceDeviceRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);
app.use('/api/v1/salary-components', salaryComponentRoutes);
app.use('/api/v1/leave-types', leaveTypeRoutes);
app.use('/api/v1/leave-balances', leaveBalanceRoutes);
app.use('/api/v1/leave-requests', leaveRequestRoutes);
app.use('/api/v1/employee-bank-accounts', employeeBankAccountRoutes);
app.use('/api/v1/employee-salary-profiles', employeeSalaryProfileRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/performance-reviews', performanceReviewRoutes);
app.use('/api/v1/profile-change-requests', profileChangeRequestRoutes);
app.use('/api/v1/applicants', applicantRoutes);

// --- 8. Global 404 Handler ---
app.use((req, res) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
});

// --- 9. Global Error Handler (Must be last) ---
app.use(globalErrorHandler);

export default app;
