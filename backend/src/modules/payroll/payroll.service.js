import { prisma } from '../../core/utils/prisma.js';
import { NotFoundError, AppError } from '../../core/errors/app-error.js';
import { buildPaginationAndSort, formatPaginatedResponse } from '../../core/utils/query-handler.js';
import { createAuditLogger } from '../../core/utils/audit-logger.js';

const audit = createAuditLogger('PAYROLL', 'payrolls');
import { createNotification } from '../notifications/notification.service.js';
import { getUserIdFromEmployeeId } from '../../core/utils/helpers.js';

// Safe formula evaluator — supports basic arithmetic and named variables
// Uses recursive descent parser instead of Function constructor for security
class SafeMathParser {
  constructor(expression) {
    this.expression = expression;
    this.pos = 0;
  }

  parse() {
    const result = this.parseExpression();
    if (this.pos < this.expression.length) {
      throw new Error('Unexpected character');
    }
    return result;
  }

  parseExpression() {
    let result = this.parseTerm();
    while (this.pos < this.expression.length) {
      const op = this.peek();
      if (op === '+' || op === '-') {
        this.advance();
        const right = this.parseTerm();
        result = op === '+' ? result + right : result - right;
      } else {
        break;
      }
    }
    return result;
  }

  parseTerm() {
    let result = this.parseFactor();
    while (this.pos < this.expression.length) {
      const op = this.peek();
      if (op === '*' || op === '/') {
        this.advance();
        const right = this.parseFactor();
        result = op === '*' ? result * right : result / right;
      } else {
        break;
      }
    }
    return result;
  }

  parseFactor() {
    this.skipSpaces();
    if (this.pos >= this.expression.length) {
      throw new Error('Unexpected end of expression');
    }

    const ch = this.peek();

    if (ch === '(') {
      this.advance();
      const result = this.parseExpression();
      this.skipSpaces();
      if (this.peek() !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      this.advance();
      return result;
    }

    if (ch === '-' || ch === '+') {
      this.advance();
      const factor = this.parseFactor();
      return ch === '-' ? -factor : factor;
    }

    return this.parseNumber();
  }

  parseNumber() {
    this.skipSpaces();
    let start = this.pos;
    while (this.pos < this.expression.length && (this.expression[this.pos] >= '0' && this.expression[this.pos] <= '9' || this.expression[this.pos] === '.')) {
      this.pos++;
    }
    if (start === this.pos) {
      throw new Error('Expected number');
    }
    return parseFloat(this.expression.slice(start, this.pos));
  }

  peek() {
    return this.expression[this.pos];
  }

  advance() {
    this.pos++;
  }

  skipSpaces() {
    while (this.pos < this.expression.length && this.expression[this.pos] === ' ') {
      this.pos++;
    }
  }
}

const evaluateFormula = (formula, vars) => {
  if (!formula) return 0;
  try {
    let expr = formula;
    for (const [key, val] of Object.entries(vars)) {
      expr = expr.split(key).join(String(Number(val) || 0));
    }
    expr = expr.replace(/[a-zA-Z_]\w*/g, '0');
    if (!/^[\d+\-*/().\s]+$/.test(expr)) return 0;
    const parser = new SafeMathParser(expr);
    const result = parser.parse();
    return Number.isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
};

// Helper to calculate gross and net safely (Handles Prisma Decimal objects)
const calculateTotals = (data) => {
  const basic = Number(data.basicSalary || 0);
  const overtime = Number(data.overtimeAmount || 0);
  const allowance = Number(data.allowanceAmount || 0);
  const bonus = Number(data.bonusAmount || 0);
  const tax = Number(data.taxAmount || 0);
  const deduction = Number(data.deductionAmount || 0);

  const gross = basic + overtime + allowance + bonus;
  const net = gross - tax - deduction;

  return { grossSalary: gross, netSalary: net };
};

export const getPayrollById = async (id) => {
  const payroll = await prisma.payrollDisbursement.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, employeeNumber: true, firstName: true, lastName: true },
      },
      payrollPeriod: {
        select: { id: true, name: true },
      },
    },
  });
  if (!payroll) throw new NotFoundError('Payroll Record');
  return payroll;
};

export const listPayrolls = async (query) => {
  const { pagination, prismaArgs } = buildPaginationAndSort(query);
  const { employeeId, departmentId, year, month, status, search } = query;

  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;

  if (departmentId) where.employee = { departmentId };

  if (search) {
    where.employee = {
      ...(where.employee || {}),
      OR: [
        { employeeNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  const [payrolls, totalItems] = await Promise.all([
    prisma.payrollDisbursement.findMany({
      ...prismaArgs,
      where,
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payrollDisbursement.count({ where }),
  ]);

  return formatPaginatedResponse(payrolls, totalItems, pagination);
};

export const generatePayroll = async (data, actorId) => {
  const { departmentId, payrollPeriodId } = data;

  const period = await prisma.payrollPeriod.findUnique({ where: { id: payrollPeriodId } });
  if (!period) throw new NotFoundError('Payroll Period');

  if (period.status === 'LOCKED') {
    throw new AppError(
      'Cannot generate payroll for a locked period. Reopen it first.',
      400,
      'PERIOD_LOCKED',
    );
  }

  const year = period.startDate.getFullYear();
  const month = period.startDate.getMonth() + 1;

  const employeeWhere = {
    status: 'ACTIVE',
    deletedAt: null,
    employmentStatus: { notIn: ['TERMINATED', 'RETIRED', 'RESIGNED'] },
  };
  if (departmentId) employeeWhere.departmentId = departmentId;

  const employees = await prisma.employee.findMany({ where: employeeWhere });
  if (employees.length === 0) {
    throw new AppError(
      'No active employees found for payroll generation.',
      404,
      'NO_EMPLOYEES_FOUND',
    );
  }

  // Fetch all active salary components for code-based mapping
  const salaryComponents = await prisma.salaryComponent.findMany({ where: { status: 'ACTIVE' } });
  const componentMap = new Map(salaryComponents.map((sc) => [sc.id, sc]));

  const payDate = period.payDate || period.endDate;

  let generatedCount = 0;

  await prisma.$transaction(async (tx) => {
    // Identify employees with APPROVED or PAID disbursements (skip them during re-compile)
    const employeeIds = employees.map((e) => e.id);
    const protectedRows = await tx.payrollDisbursement.findMany({
      where: { employeeId: { in: employeeIds }, year, month, status: { in: ['APPROVED', 'PAID'] } },
      select: { employeeId: true },
    });
    const protectedEmpIds = new Set(protectedRows.map((r) => r.employeeId));

    // Delete only DRAFT/CANCELLED disbursements (cascade payslip items)
    await tx.payslipItem.deleteMany({
      where: {
        payrollDisbursement: {
          employeeId: { in: employeeIds },
          year,
          month,
          status: { notIn: ['APPROVED', 'PAID'] },
        },
      },
    });
    await tx.payrollDisbursement.deleteMany({
      where: {
        employeeId: { in: employeeIds },
        year,
        month,
        status: { notIn: ['APPROVED', 'PAID'] },
      },
    });

    // Transition period from DRAFT to OPEN after compiling
    if (period.status === 'DRAFT') {
      await tx.payrollPeriod.update({ where: { id: payrollPeriodId }, data: { status: 'OPEN' } });
    }
    const today = new Date(new Date().toDateString());

    // Batch fetch all salary profiles for all employees (avoids N+1 queries)
    const employeeIdsForProfiles = employees
      .filter((emp) => !protectedEmpIds.has(emp.id))
      .map((emp) => emp.id);

    const allProfiles = await tx.employeeSalaryProfile.findMany({
      where: {
        employeeId: { in: employeeIdsForProfiles },
        effectiveFrom: { lte: today },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: today } }],
      },
    });

    // Group profiles by employeeId for O(1) lookup
    const profilesByEmployee = new Map();
    for (const profile of allProfiles) {
      if (!profilesByEmployee.has(profile.employeeId)) {
        profilesByEmployee.set(profile.employeeId, []);
      }
      profilesByEmployee.get(profile.employeeId).push(profile);
    }

    for (const emp of employees) {
      // Skip employees with APPROVED or PAID disbursements
      if (protectedEmpIds.has(emp.id)) continue;

      // Get pre-fetched profiles for this employee
      const profiles = profilesByEmployee.get(emp.id) || [];

      // Aggregate amounts by component code
      let basicSalary = 0;
      let allowanceAmount = 0;
      let overtimeAmount = 0;
      let bonusAmount = 0;
      let taxAmount = 0;
      let deductionAmount = 0;

      const payslipItems = [];

      // --- Pass 1: Collect basicSalary first (needed for PERCENTAGE/FORMULA) ---
      for (const profile of profiles) {
        const comp = componentMap.get(profile.salaryComponentId);
        if (!comp) continue;
        const code = comp.code.toUpperCase();
        if (code.includes('BASIC')) {
          basicSalary += Number(profile.customValue ?? comp.defaultValue ?? 0);
        }
      }

      // --- Pass 2a: Calculate FIXED and PERCENTAGE amounts first ---

      for (const profile of profiles) {
        const comp = componentMap.get(profile.salaryComponentId);
        if (!comp || comp.calculationMethod === 'FORMULA') continue;

        const rawValue = Number(profile.customValue ?? comp.defaultValue ?? 0);

        let amount;
        switch (comp.calculationMethod) {
          case 'PERCENTAGE':
            amount = basicSalary * (rawValue / 100);
            break;
          case 'FIXED':
          default:
            amount = rawValue;
            break;
        }

        if (amount === 0) continue;

        const code = comp.code.toUpperCase();

        if (code.includes('BASIC')) {
          // Already counted in pass 1
        } else if (code.includes('OVERTIME')) {
          overtimeAmount += amount;
        } else if (code.includes('BONUS')) {
          bonusAmount += amount;
        } else if (code.includes('TAX') || code.includes('TAXES')) {
          taxAmount += amount;
        } else if (comp.type === 'DEDUCTION') {
          deductionAmount += amount;
        } else if (comp.type === 'EARNING') {
          allowanceAmount += amount;
        }

        const methodLabel =
          comp.calculationMethod === 'PERCENTAGE'
            ? `${rawValue}% of basic`
            : profile.customValue
              ? 'Custom'
              : 'Default';

        payslipItems.push({
          salaryComponentId: profile.salaryComponentId,
          amount,
          calculationDetail: `${comp.name} (${comp.code}) — ${methodLabel}`,
        });
      }

      // --- Pass 2b: Calculate FORMULA components using complete totals ---

      for (const profile of profiles) {
        const comp = componentMap.get(profile.salaryComponentId);
        if (!comp || comp.calculationMethod !== 'FORMULA') continue;

        const rawValue = Number(profile.customValue ?? comp.defaultValue ?? 0);

        const grossSalary = basicSalary + allowanceAmount + overtimeAmount + bonusAmount;

        const amount = evaluateFormula(comp.formula || '', {
          basicSalary,
          grossSalary,
          taxRate: rawValue / 100,
        });

        if (amount === 0) continue;

        const code = comp.code.toUpperCase();

        if (code.includes('BASIC')) {
          // Already counted in pass 1
        } else if (code.includes('OVERTIME')) {
          overtimeAmount += amount;
        } else if (code.includes('BONUS')) {
          bonusAmount += amount;
        } else if (code.includes('TAX') || code.includes('TAXES')) {
          taxAmount += amount;
        } else if (comp.type === 'DEDUCTION') {
          deductionAmount += amount;
        } else if (comp.type === 'EARNING') {
          allowanceAmount += amount;
        }

        payslipItems.push({
          salaryComponentId: profile.salaryComponentId,
          amount,
          calculationDetail: `${comp.name} (${comp.code}) — Formula: ${comp.formula}`,
        });
      }

      const totals = calculateTotals({
        basicSalary,
        overtimeAmount,
        allowanceAmount,
        bonusAmount,
        taxAmount,
        deductionAmount,
      });

      await tx.payrollDisbursement.create({
        data: {
          employeeId: emp.id,
          payrollPeriodId,
          year,
          month,
          payDate,
          basicSalary,
          overtimeAmount,
          allowanceAmount,
          bonusAmount,
          taxAmount,
          deductionAmount,
          grossSalary: totals.grossSalary,
          netSalary: totals.netSalary,
          status: 'DRAFT',
          createdBy: actorId,
          payslipItems: {
            create: payslipItems.map((pi) => ({
              salaryComponentId: pi.salaryComponentId,
              amount: pi.amount,
              calculationDetail: pi.calculationDetail,
              createdBy: actorId,
            })),
          },
        },
      });
      generatedCount++;
    }
  });

  audit.log(
    actorId,
    'GENERATE',
    null,
    `Generated payroll for ${year}-${month}. Records created: ${generatedCount}`,
  );

  return { processed: employees.length, generated: generatedCount };
};

export const updatePayroll = async (id, data, actorId) => {
  const payroll = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!payroll) throw new NotFoundError('Payroll Record');

  if (payroll.status !== 'DRAFT') {
    throw new AppError('Only DRAFT payrolls can be modified.', 400, 'PAYROLL_LOCKED');
  }

  const updatedData = { ...data, updatedBy: actorId };
  const totals = calculateTotals({ ...payroll, ...data });

  updatedData.grossSalary = totals.grossSalary;
  updatedData.netSalary = totals.netSalary;

  const updated = await prisma.payrollDisbursement.update({
    where: { id },
    data: updatedData,
  });

  audit.log(actorId, 'UPDATE', id, 'Updated payroll adjustments', {
    employeeId: payroll.employeeId,
  });

  return updated;
};

export const approvePayroll = async (id, actorId) => {
  const payroll = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!payroll) throw new NotFoundError('Payroll Record');

  if (payroll.status !== 'DRAFT')
    throw new AppError('Only DRAFT payrolls can be approved.', 400, 'INVALID_STATUS');

  const updated = await prisma.payrollDisbursement.update({
    where: { id },
    data: { status: 'APPROVED', updatedBy: actorId },
  });

  audit.log(actorId, 'APPROVE', id, '', { employeeId: payroll.employeeId });

  const userId = await getUserIdFromEmployeeId(payroll.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Payroll Approved',
      message: `Your payroll for ${payroll.month}/${payroll.year} has been approved.`,
      type: 'SUCCESS',
      metadata: { payrollId: id, year: payroll.year, month: payroll.month },
    });
  }

  return updated;
};

export const finalizePayroll = async (id, actorId) => {
  const payroll = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!payroll) throw new NotFoundError('Payroll Record');

  if (payroll.status !== 'APPROVED')
    throw new AppError('Only APPROVED payrolls can be finalized/paid.', 400, 'INVALID_STATUS');

  const updated = await prisma.payrollDisbursement.update({
    where: { id },
    data: { status: 'PAID', updatedBy: actorId },
  });

  audit.log(actorId, 'FINALIZE', id, '', { employeeId: payroll.employeeId });

  const userId = await getUserIdFromEmployeeId(payroll.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Payroll Ready',
      message: `Your payroll for ${payroll.month}/${payroll.year} has been finalized and is ready for payment.`,
      type: 'PAYROLL_READY',
      metadata: { payrollId: id, year: payroll.year, month: payroll.month },
    });
  }

  return updated;
};

export const cancelPayroll = async (id, actorId) => {
  const payroll = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!payroll) throw new NotFoundError('Payroll Record');

  if (payroll.status === 'PAID')
    throw new AppError('Cannot cancel a paid payroll.', 400, 'INVALID_STATUS');

  const updated = await prisma.payrollDisbursement.update({
    where: { id },
    data: { status: 'CANCELLED', updatedBy: actorId },
  });

  audit.log(actorId, 'CANCEL', id, '', { employeeId: payroll.employeeId });

  const userId = await getUserIdFromEmployeeId(payroll.employeeId);
  if (userId) {
    createNotification({
      userId,
      title: 'Payroll Cancelled',
      message: `Your payroll for ${payroll.month}/${payroll.year} has been cancelled.`,
      type: 'WARNING',
      metadata: { payrollId: id, year: payroll.year, month: payroll.month },
    }).catch(() => {});
  }

  return updated;
};

export const getPayslip = async (id) => {
  const disbursement = await prisma.payrollDisbursement.findUnique({
    where: { id },
    include: {
      employee: {
        select: { id: true, employeeNumber: true, firstName: true, lastName: true },
      },
      payrollPeriod: {
        select: { id: true, name: true, startDate: true, endDate: true, payDate: true },
      },
      payslipItems: {
        include: {
          salaryComponent: {
            select: { id: true, code: true, name: true, type: true },
          },
        },
      },
    },
  });
  if (!disbursement) throw new NotFoundError('Payroll Record');

  const earnings = disbursement.payslipItems
    .filter((pi) => pi.salaryComponent?.type === 'EARNING')
    .map((pi) => ({
      code: pi.salaryComponent.code,
      name: pi.salaryComponent.name,
      amount: Number(pi.amount),
    }));

  const deductions = disbursement.payslipItems
    .filter((pi) => pi.salaryComponent?.type === 'DEDUCTION')
    .map((pi) => ({
      code: pi.salaryComponent.code,
      name: pi.salaryComponent.name,
      amount: Number(pi.amount),
    }));

  return {
    id: disbursement.id,
    employee: disbursement.employee,
    period: disbursement.payrollPeriod,
    year: disbursement.year,
    month: disbursement.month,
    payDate: disbursement.payDate,
    basicSalary: Number(disbursement.basicSalary),
    overtimeAmount: Number(disbursement.overtimeAmount),
    allowanceAmount: Number(disbursement.allowanceAmount),
    bonusAmount: Number(disbursement.bonusAmount),
    taxAmount: Number(disbursement.taxAmount),
    deductionAmount: Number(disbursement.deductionAmount),
    grossSalary: Number(disbursement.grossSalary),
    netSalary: Number(disbursement.netSalary),
    status: disbursement.status,
    remarks: disbursement.remarks,
    earnings,
    deductions,
  };
};

export const reopenPayroll = async (id, actorId) => {
  const payroll = await prisma.payrollDisbursement.findUnique({ where: { id } });
  if (!payroll) throw new NotFoundError('Payroll Record');

  if (payroll.status === 'PAID')
    throw new AppError('Cannot reopen a paid payroll.', 400, 'INVALID_STATUS');
  if (payroll.status === 'DRAFT')
    throw new AppError('Payroll is already in DRAFT status.', 400, 'INVALID_STATUS');

  const updated = await prisma.payrollDisbursement.update({
    where: { id },
    data: { status: 'DRAFT', updatedBy: actorId },
  });

  audit.log(actorId, 'REOPEN', id, '', { employeeId: payroll.employeeId });

  return updated;
};
