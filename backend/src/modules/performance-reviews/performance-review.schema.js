import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listPerformanceReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    cycle: z.string().optional(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED']).optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const createPerformanceReviewSchema = z.object({
  body: z.object({
    employeeId: uuid,
    reviewerId: uuid.optional(),
    cycle: z.string().min(1, 'Cycle is required').max(50),
    rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
    goals: z.any().optional(),
    comments: z.string().max(5000).optional().nullable(),
  }),
});

export const updatePerformanceReviewSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
      goals: z.any().optional(),
      comments: z.string().max(5000).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const performanceReviewIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
