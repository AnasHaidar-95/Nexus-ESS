import { z } from 'zod';
const uuid = z.string().uuid('Invalid UUID format');

export const listPermissionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(100),
    search: z.string().max(500).optional(),
    module: z.string().optional(),
    sort: z.string().optional().default('module'),
  }),
});

export const permissionIdParamSchema = z.object({ params: z.object({ id: uuid }) });
export const permissionModuleParamSchema = z.object({
  params: z.object({ module: z.string().min(1) }),
});
