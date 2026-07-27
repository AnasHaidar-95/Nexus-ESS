import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listLeaveBalancesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    leaveTypeId: uuid.optional(),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    sort: z.string().optional().default('year'),
  }),
});

export const createLeaveBalanceSchema = z.object({
  body: z.object({
    employeeId: uuid,
    leaveTypeId: uuid,
    year: z.coerce.number().int().min(1900).max(2100),
    entitledDays: z.coerce.number().min(0).max(999),
    usedDays: z.coerce.number().min(0).max(999).optional().default(0),
    carriedOverDays: z.coerce.number().min(0).max(999).optional().default(0),
  }),
});

export const updateLeaveBalanceSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      entitledDays: z.coerce.number().min(0).max(999).optional(),
      usedDays: z.coerce.number().min(0).max(999).optional(),
      carriedOverDays: z.coerce.number().min(0).max(999).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const leaveBalanceIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({ employeeId: uuid }),
});
