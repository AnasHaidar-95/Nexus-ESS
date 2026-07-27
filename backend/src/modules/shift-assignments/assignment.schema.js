import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listAssignmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    shiftId: uuid.optional(),
    currentOnly: z.coerce.boolean().optional(),
    sort: z.string().optional().default('-effectiveFrom'),
  }),
});

export const assignShiftSchema = z.object({
  body: z
    .object({
      employeeId: uuid,
      shiftId: uuid,
      effectiveFrom: z.coerce.date(),
      effectiveTo: z.coerce.date().optional().nullable(),
      daysOfWeek: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1, 'At least one day is required').default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      notes: z.string().max(500).optional().nullable(),
    })
    .refine((data) => !data.effectiveTo || data.effectiveTo >= data.effectiveFrom, {
      message: 'Effective To date must be after Effective From date',
    }),
});

export const bulkAssignSchema = z.object({
  body: z.object({
    employeeIds: z.array(uuid).min(1, 'At least one employee is required'),
    shiftId: uuid,
    effectiveFrom: z.coerce.date(),
    daysOfWeek: z.array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])).min(1, 'At least one day is required').default(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
    notes: z.string().max(500).optional().nullable(),
  }),
});

export const assignmentIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const endAssignmentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    effectiveTo: z.coerce.date(),
  }),
});
