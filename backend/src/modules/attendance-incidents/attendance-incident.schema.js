import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    recordId: uuid.optional(),
    status: z
      .enum(['OPEN', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RESOLVED', 'CANCELLED'])
      .optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    type: z
      .enum([
        'LATE_ARRIVAL',
        'EARLY_DEPARTURE',
        'MISSING_CHECK_IN',
        'MISSING_CHECK_OUT',
        'UNAUTHORIZED_ABSENCE',
        'DEVICE_ERROR',
        'MANUAL_CORRECTION',
      ])
      .optional(),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const incidentIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const createIncidentSchema = z.object({
  body: z.object({
    recordId: uuid,
    type: z.enum([
      'LATE_ARRIVAL',
      'EARLY_DEPARTURE',
      'MISSING_CHECK_IN',
      'MISSING_CHECK_OUT',
      'UNAUTHORIZED_ABSENCE',
      'DEVICE_ERROR',
      'MANUAL_CORRECTION',
    ]),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
  }),
});

export const updateIncidentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      description: z.string().min(5).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const resolveIncidentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    resolutionNotes: z.string().min(5, 'Resolution notes must be at least 5 characters'),
  }),
});

export const rejectIncidentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ reason: z.string().min(5, 'Rejection reason must be at least 5 characters') }),
});

export const addCommentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ comment: z.string().min(3, 'Comment must be at least 3 characters') }),
});
