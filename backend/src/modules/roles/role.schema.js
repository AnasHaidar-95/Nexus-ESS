import { z } from 'zod';
const uuid = z.string().uuid('Invalid UUID format');

export const listRolesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(500),
    code: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
    description: z.string().max(500).optional().nullable(),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(500).optional(),
      description: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const roleIdParamSchema = z.object({ params: z.object({ id: uuid }) });

export const assignPermissionsSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    permissionIds: z.array(z.string().min(1)).min(1, 'At least one permission is required'),
  }),
});
