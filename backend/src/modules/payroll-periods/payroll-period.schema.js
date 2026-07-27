import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listPayrollPeriodsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    status: z.enum(['DRAFT', 'OPEN', 'PROCESSING', 'CLOSED', 'LOCKED', 'CANCELLED']).optional(),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('-startDate'),
  }),
});

export const createPayrollPeriodSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(500),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      payDate: z.coerce.date().optional(),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }),
});

export const updatePayrollPeriodSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(500).optional(),
      payDate: z.coerce.date().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const payrollPeriodIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
