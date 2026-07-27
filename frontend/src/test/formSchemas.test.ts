import { describe, it, expect } from 'vitest';
import { departmentSchema, positionSchema, shiftSchema, leaveTypeSchema, holidaySchema, payrollPeriodSchema, salaryComponentSchema } from '@/lib/formSchemas';

describe('formSchemas', () => {
  describe('departmentSchema', () => {
    it('should validate a valid department', () => {
      const result = departmentSchema.safeParse({ name: 'Engineering', code: 'ENG', description: 'Software engineering' });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = departmentSchema.safeParse({ name: '', code: 'ENG' });
      expect(result.success).toBe(false);
    });

    it('should reject empty code', () => {
      const result = departmentSchema.safeParse({ name: 'Engineering', code: '' });
      expect(result.success).toBe(false);
    });

    it('should allow optional description', () => {
      const result = departmentSchema.safeParse({ name: 'Engineering', code: 'ENG' });
      expect(result.success).toBe(true);
    });
  });

  describe('positionSchema', () => {
    it('should validate a valid position', () => {
      const result = positionSchema.safeParse({ name: 'Senior Developer', code: 'SD', grade: 5 });
      expect(result.success).toBe(true);
    });

    it('should reject grade below 1', () => {
      const result = positionSchema.safeParse({ name: 'Developer', code: 'DEV', grade: 0 });
      expect(result.success).toBe(false);
    });

    it('should require grade', () => {
      const result = positionSchema.safeParse({ name: 'Developer', code: 'DEV' });
      expect(result.success).toBe(false);
    });
  });

  describe('shiftSchema', () => {
    it('should validate a valid shift', () => {
      const result = shiftSchema.safeParse({ name: 'Morning', code: 'MOR', startTime: '09:00', endTime: '17:00' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid time format', () => {
      const result = shiftSchema.safeParse({ name: 'Morning', code: 'MOR', startTime: '9:00', endTime: '17:00' });
      expect(result.success).toBe(false);
    });
  });

  describe('leaveTypeSchema', () => {
    it('should validate a complete leave type', () => {
      const result = leaveTypeSchema.safeParse({ name: 'Annual', code: 'ANNUAL', isPaid: false, carryForward: false, maxDaysPerYear: 20 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isPaid).toBe(false);
        expect(result.data.carryForward).toBe(false);
        expect(result.data.maxDaysPerYear).toBe(20);
      }
    });
  });

  describe('holidaySchema', () => {
    it('should validate a complete holiday', () => {
      const result = holidaySchema.safeParse({ name: 'Christmas', date: '2025-12-25', type: 'PUBLIC', isPaid: true, isRecurring: true, status: 'ACTIVE' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('PUBLIC');
        expect(result.data.isPaid).toBe(true);
      }
    });

    it('should reject invalid holiday type', () => {
      const result = holidaySchema.safeParse({ name: 'Test', date: '2025-01-01', type: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });

  describe('payrollPeriodSchema', () => {
    it('should validate a valid period', () => {
      const result = payrollPeriodSchema.safeParse({
        name: 'January 2025',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        payDate: '2025-02-05',
      });
      expect(result.success).toBe(true);
    });

    it('should reject missing fields', () => {
      const result = payrollPeriodSchema.safeParse({ name: 'January' });
      expect(result.success).toBe(false);
    });
  });

  describe('salaryComponentSchema', () => {
    it('should validate a complete salary component', () => {
      const result = salaryComponentSchema.safeParse({ code: 'BASIC', name: 'Basic Salary', type: 'EARNING', calculationMethod: 'FIXED', isTaxable: false, isPensionable: false });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('EARNING');
        expect(result.data.calculationMethod).toBe('FIXED');
        expect(result.data.isTaxable).toBe(false);
      }
    });
  });
});
