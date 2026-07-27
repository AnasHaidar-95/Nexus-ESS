import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listDisbursementsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    year: z.coerce.number().int().min(2000).max(2100).optional(),
    month: z.coerce.number().int().min(1).max(12).optional(),
    status: z.enum(['DRAFT', 'APPROVED', 'PAID', 'CANCELLED']).optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const updateDisbursementSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      basicSalary: z.coerce.number().min(0).optional(),
      overtimeAmount: z.coerce.number().min(0).optional(),
      allowanceAmount: z.coerce.number().min(0).optional(),
      bonusAmount: z.coerce.number().min(0).optional(),
      deductionAmount: z.coerce.number().min(0).optional(),
      taxAmount: z.coerce.number().min(0).optional(),
      remarks: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const markPaidSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    paymentReference: z.string().max(500).optional(),
    payDate: z.coerce.date().optional(),
  }),
});

export const disbursementIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
