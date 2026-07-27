import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listEmployeeSalaryProfilesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    salaryComponentId: uuid.optional(),
    sort: z.string().optional().default('-effectiveFrom'),
  }),
});

export const createEmployeeSalaryProfileSchema = z.object({
  body: z.object({
    employeeId: uuid,
    salaryComponentId: uuid,
    effectiveFrom: z.coerce.date(),
    effectiveTo: z.coerce.date().optional().nullable(),
    customValue: z.coerce.number().min(0).optional().nullable(),
  }),
});

export const updateEmployeeSalaryProfileSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      employeeId: uuid.optional(),
      salaryComponentId: uuid.optional(),
      customValue: z.coerce.number().min(0).optional().nullable(),
      effectiveFrom: z.coerce.date().optional(),
      effectiveTo: z.coerce.date().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const employeeSalaryProfileIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const employeeIdParamSchema = z.object({
  params: z.object({ employeeId: uuid }),
});
