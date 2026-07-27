import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listProfileChangeRequestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const createProfileChangeRequestSchema = z.object({
  body: z.object({
    employeeId: uuid,
    field: z.string().min(1, 'Field name is required').max(500),
    newValue: z.string().min(1, 'New value is required'),
  }),
});

export const approveRejectSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    reason: z.string().max(2000).optional().nullable(),
  }),
});

export const profileChangeRequestIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
