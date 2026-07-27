import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listLeaveTypesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createLeaveTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(500),
    code: z.string().min(1, 'Code is required').max(30),
    description: z.string().max(500).optional().nullable(),
    isPaid: z.boolean().default(true),
    carryForward: z.boolean().default(false),
    maxDaysPerYear: z.coerce.number().int().min(0).default(0),
  }),
});

export const updateLeaveTypeSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(500).optional(),
      code: z.string().min(1).max(30).optional(),
      description: z.string().max(500).optional().nullable(),
      isPaid: z.boolean().optional(),
      carryForward: z.boolean().optional(),
      maxDaysPerYear: z.coerce.number().int().min(0).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const leaveTypeIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
