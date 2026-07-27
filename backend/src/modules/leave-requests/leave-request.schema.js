import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listLeaveRequestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    leaveTypeId: uuid.optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const createLeaveRequestSchema = z.object({
  body: z
    .object({
      employeeId: uuid,
      leaveTypeId: uuid,
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      totalDays: z.coerce.number().min(0.5).max(365),
      reason: z.string().min(1, 'Reason is required').max(2000),
    })
    .refine((data) => data.endDate >= data.startDate, {
      message: 'End date must be on or after start date',
    }),
});

export const updateLeaveRequestSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      totalDays: z.coerce.number().min(0.5).max(365).optional(),
      reason: z.string().min(1).max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const leaveRequestIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const approveSchema = z.object({
  params: z.object({ id: uuid }),
});

export const rejectSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    reason: z.string().max(2000).optional().nullable(),
  }),
});

export const cancelLeaveRequestSchema = z.object({
  params: z.object({ id: uuid }),
});
