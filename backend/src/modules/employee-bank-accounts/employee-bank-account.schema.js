import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listEmployeeBankAccountsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    sort: z.string().optional().default('bankName'),
  }),
});

export const createEmployeeBankAccountSchema = z.object({
  body: z.object({
    employeeId: uuid,
    accountName: z.string().min(1, 'Account name is required').max(150),
    accountNumber: z.string().min(1, 'Account number is required').max(50),
    bankName: z.string().min(1, 'Bank name is required').max(150),
    branchCode: z.string().max(30).optional().nullable(),
    swiftCode: z.string().max(20).optional().nullable(),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateEmployeeBankAccountSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      accountName: z.string().min(1).max(150).optional(),
      accountNumber: z.string().min(1).max(50).optional(),
      bankName: z.string().min(1).max(150).optional(),
      branchCode: z.string().max(30).optional().nullable(),
      swiftCode: z.string().max(20).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const employeeBankAccountIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({ employeeId: uuid }),
});
