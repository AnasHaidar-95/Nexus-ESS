import { prisma } from '../../core/utils/prisma.js';

// --- Helper: Normalize date to start of day ---
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// --- Dashboard Endpoints ---

export const getAdminDashboard = async () => {
  const today = getStartOfDay();

  const [totalEmployees, activeUsers, totalDepartments, pendingIncidents, todayAttendance] =
    await Promise.all([
      prisma.employee.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count({ where: { status: 'ACTIVE' } }),
      prisma.attendanceIncident.count({ where: { status: 'OPEN' } }),
      prisma.attendanceRecord.count({ where: { date: today } }),
    ]);

  return {
    totalEmployees,
    activeUsers,
    totalDepartments,
    pendingIncidents,
    todayAttendanceRecords: todayAttendance,
  };
};

export const getHrDashboard = async () => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [newHires, terminated, activeDocuments, expiringDocuments] = await Promise.all([
    prisma.employee.count({ where: { hireDate: { gte: startOfMonth }, deletedAt: null } }),
    prisma.employee.count({ where: { employmentStatus: 'TERMINATED', deletedAt: null } }),
    prisma.employeeDocument.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
    prisma.employeeDocument.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        expiresAt: { gte: new Date(), lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    newHiresThisMonth: newHires,
    terminatedEmployees: terminated,
    totalDocuments: activeDocuments,
    expiringDocuments,
  };
};

export const getAttendanceDashboard = async () => {
  const today = getStartOfDay();

  const todayRecords = await prisma.attendanceRecord.groupBy({
    by: ['status'],
    where: { date: today },
    _count: { _all: true },
  });

  const stats = {
    PRESENT: 0,
    LATE: 0,
    ABSENT: 0,
    INCOMPLETE: 0,
    HALF_DAY: 0,
    LEAVE: 0,
    HOLIDAY: 0,
  };
  todayRecords.forEach((r) => {
    if (stats[r.status] !== undefined) stats[r.status] = r._count._all;
  });

  const pendingIncidents = await prisma.attendanceIncident.count({
    where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
  });

  return { ...stats, pendingIncidents };
};

export const getPayrollDashboard = async () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const where = { month: currentMonth, year: currentYear };

  const [statusBreakdown, totalPayroll] = await Promise.all([
    prisma.payrollDisbursement.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.payrollDisbursement.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { netSalary: true },
    }),
  ]);

  const counts = { DRAFT: 0, APPROVED: 0, PAID: 0, CANCELLED: 0 };
  statusBreakdown.forEach((r) => {
    if (counts[r.status] !== undefined) counts[r.status] = r._count._all;
  });

  return {
    currentPeriod: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
    draft: counts.DRAFT,
    approved: counts.APPROVED,
    paid: counts.PAID,
    cancelled: counts.CANCELLED,
    totalNetPayroll: totalPayroll._sum.netSalary || 0,
  };
};

export const getEmployeeDashboard = async (employeeId) => {
  const today = getStartOfDay();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [employee, todayAttendance, monthlyAttendance, recentDocuments, currentShift] =
    await Promise.all([
      prisma.employee.findUnique({
        where: { id: employeeId },
        include: {
          department: { select: { name: true } },
          position: { select: { name: true } },
        },
      }),
      prisma.attendanceRecord.findFirst({
        where: { employeeId, date: today },
        include: { shift: { select: { name: true, startTime: true, endTime: true } } },
      }),
      prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { employeeId, date: { gte: startOfMonth } },
        _count: { _all: true },
      }),
      prisma.employeeDocument.findMany({
        where: { employeeId, deletedAt: null, status: 'ACTIVE' },
        orderBy: { uploadedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          originalFilename: true,
          uploadedAt: true,
          category: { select: { name: true } },
        },
      }),
      prisma.employeeShiftAssignment.findFirst({
        where: {
          employeeId,
          effectiveFrom: { lte: today },
          OR: [{ effectiveTo: { gte: today } }, { effectiveTo: null }],
        },
        include: { shift: { select: { name: true, startTime: true, endTime: true } } },
      }),
    ]);

  const monthlyStats = {};
  monthlyAttendance.forEach((r) => {
    monthlyStats[r.status] = r._count._all;
  });

  return {
    employee: employee
      ? {
          id: employee.id,
          employeeNumber: employee.employeeNumber,
          fullName: `${employee.firstName} ${employee.lastName}`,
          department: employee.department?.name,
          position: employee.position?.name,
          employmentStatus: employee.employmentStatus,
        }
      : null,
    todayAttendance,
    monthlyAttendance: monthlyStats,
    recentDocuments,
    currentShift: currentShift?.shift || null,
  };
};

// --- Statistics Endpoints ---

export const getOrganizationStatistics = async () => {
  const activeFilter = { status: 'ACTIVE', deletedAt: null };

  const [departmentStats, positionStats, statusStats, genderStats, typeStats] = await Promise.all([
    prisma.employee.groupBy({ by: ['departmentId'], where: activeFilter, _count: true }),
    prisma.employee.groupBy({ by: ['positionId'], where: activeFilter, _count: true }),
    prisma.employee.groupBy({ by: ['employmentStatus'], where: { deletedAt: null }, _count: true }),
    prisma.employee.groupBy({
      by: ['gender'],
      where: { deletedAt: null, gender: { not: null } },
      _count: true,
    }),
    prisma.employee.groupBy({ by: ['employmentType'], where: activeFilter, _count: true }),
  ]);

  return {
    employeesByDepartment: departmentStats.map((s) => ({
      departmentId: s.departmentId,
      count: s._count,
    })),
    employeesByPosition: positionStats.map((s) => ({ positionId: s.positionId, count: s._count })),
    employeesByStatus: statusStats.map((s) => ({ status: s.employmentStatus, count: s._count })),
    employeesByGender: genderStats.map((s) => ({ gender: s.gender, count: s._count })),
    employeesByType: typeStats.map((s) => ({ type: s.employmentType, count: s._count })),
  };
};

export const getAttendanceStatistics = async (query = {}) => {
  const { fromDate, toDate, departmentId } = query;
  const where = {};

  if (fromDate) where.date = { ...where.date, gte: getStartOfDay(new Date(fromDate)) };
  if (toDate) where.date = { ...where.date, lte: getStartOfDay(new Date(toDate)) };
  if (departmentId) where.employee = { departmentId };

  const [statusBreakdown, totalRecords] = await Promise.all([
    prisma.attendanceRecord.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.attendanceRecord.count({ where }),
  ]);

  const breakdown = {};
  statusBreakdown.forEach((r) => {
    breakdown[r.status] = r._count._all;
  });

  const attendanceRate =
    totalRecords > 0
      ? Math.round((((breakdown.PRESENT || 0) + (breakdown.LATE || 0)) / totalRecords) * 100)
      : 0;

  return {
    totalRecords,
    breakdown,
    attendanceRate,
  };
};

export const getPayrollStatistics = async (query = {}) => {
  const { year, month, departmentId } = query;
  const where = {};

  if (year) where.year = parseInt(year);
  if (month) where.month = parseInt(month);
  if (departmentId) where.employee = { departmentId };

  const [statusBreakdown, aggregates] = await Promise.all([
    prisma.payrollDisbursement.groupBy({ by: ['status'], where, _count: { _all: true } }),
    prisma.payrollDisbursement.aggregate({
      where,
      _sum: {
        grossSalary: true,
        netSalary: true,
        overtimeAmount: true,
        taxAmount: true,
        deductionAmount: true,
      },
      _avg: { netSalary: true },
    }),
  ]);

  const breakdown = {};
  statusBreakdown.forEach((r) => {
    breakdown[r.status] = r._count._all;
  });

  return {
    breakdown,
    totalGross: aggregates._sum.grossSalary || 0,
    totalNet: aggregates._sum.netSalary || 0,
    totalOvertime: aggregates._sum.overtimeAmount || 0,
    totalTax: aggregates._sum.taxAmount || 0,
    totalDeductions: aggregates._sum.deductionAmount || 0,
    averageNetSalary: aggregates._avg.netSalary || 0,
  };
};

export const getEmployeeStatistics = async () => {
  const activeFilter = { status: 'ACTIVE', deletedAt: null };

  const [totalActive, totalAll, newThisMonth, terminatedThisYear] = await Promise.all([
    prisma.employee.count({ where: activeFilter }),
    prisma.employee.count({ where: { deletedAt: null } }),
    prisma.employee.count({
      where: {
        ...activeFilter,
        hireDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
    prisma.employee.count({
      where: {
        employmentStatus: 'TERMINATED',
        terminationDate: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
    }),
  ]);

  return {
    totalActive,
    totalAll,
    newThisMonth,
    terminatedThisYear,
    turnoverRate: totalAll > 0 ? Math.round((terminatedThisYear / totalAll) * 100) : 0,
  };
};
