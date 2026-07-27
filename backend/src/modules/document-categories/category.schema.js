import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(500),
    code: z.string().min(1).max(30),
    description: z.string().max(500).optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(500).optional(),
      description: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const categoryIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
