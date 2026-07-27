import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED']).optional(),
    roleId: uuid.optional(),
    sort: z.string().optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const createUserSchema = z.object({
  body: z.object({
    employeeId: uuid,
    username: z.string().min(3).max(500),
    email: z.string().email(),
    roleId: uuid,
    temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
    forcePasswordChange: z.boolean().optional().default(true),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      username: z.string().min(3).max(500).optional(),
      email: z.string().email().optional(),
      roleId: uuid.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid User ID format'),
  }),
  body: z.object({
    newPassword: z
      .string({ required_error: 'New password is required' })
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    forcePasswordChange: z.boolean().optional().default(true),
  }),
});
