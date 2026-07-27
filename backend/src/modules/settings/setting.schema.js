import { z } from 'zod';

export const listSettingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    category: z.string().optional(),
    editable: z.coerce.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('category'),
  }),
});

export const getSettingSchema = z.object({
  params: z.object({ key: z.string().min(1, 'Setting key is required') }),
});

export const updateSettingSchema = z.object({
  params: z.object({ key: z.string().min(1) }),
  body: z.object({
    value: z.any({ required_error: 'Value is required' }),
  }),
});
