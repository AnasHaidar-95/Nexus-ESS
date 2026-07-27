import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listPayslipItemsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    disbursementId: uuid.optional(),
    sort: z.string().optional().default('createdAt'),
  }),
});

export const payslipItemIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
