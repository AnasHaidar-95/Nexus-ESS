import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listShiftsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createShiftSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(500),
    code: z.string().min(1).max(30),
    startTimeMinutes: z.coerce.number().int().min(0).max(1439),
    endTimeMinutes: z.coerce.number().int().min(0).max(1439),
    breakMinutes: z.coerce.number().int().min(0).default(0),
    graceMinutes: z.coerce.number().int().min(0).default(0),
  }),
});

export const updateShiftSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(500).optional(),
      code: z.string().min(1).max(30).optional(),
      startTimeMinutes: z.coerce.number().int().min(0).max(1439).optional(),
      endTimeMinutes: z.coerce.number().int().min(0).max(1439).optional(),
      breakMinutes: z.coerce.number().int().min(0).optional(),
      graceMinutes: z.coerce.number().int().min(0).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const shiftIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
