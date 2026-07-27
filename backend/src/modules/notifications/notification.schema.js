import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    isRead: z.coerce.boolean().optional(),
    type: z
      .enum([
        'INFO',
        'WARNING',
        'SUCCESS',
        'ERROR',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'PAYROLL_READY',
        'DOCUMENT_REQUEST',
        'ANNOUNCEMENT',
      ])
      .optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const updateNotificationSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      isRead: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const createNotificationSchema = z.object({
  body: z.object({
    userId: uuid,
    title: z.string().min(1).max(200),
    message: z.string().min(1),
    type: z
      .enum([
        'INFO',
        'WARNING',
        'SUCCESS',
        'ERROR',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'PAYROLL_READY',
        'DOCUMENT_REQUEST',
        'ANNOUNCEMENT',
      ])
      .optional()
      .default('INFO'),
    metadata: z.any().optional(),
  }),
});
