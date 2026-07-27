import { z } from 'zod';
const uuid = z.string().uuid('Invalid UUID format');

export const listSalaryComponentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    type: z.enum(['EARNING', 'DEDUCTION']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createSalaryComponentSchema = z.object({
  body: z
    .object({
      code: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
      name: z.string().min(1).max(150),
      type: z.enum(['EARNING', 'DEDUCTION']),
      calculationMethod: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA', 'MANUAL']),
      defaultValue: z.coerce.number().min(0).optional().default(0),
      formula: z.string().optional().nullable(),
      isTaxable: z.boolean().optional().default(false),
      isPensionable: z.boolean().optional().default(false),
    })
    .refine(
      (data) => {
        if (data.calculationMethod === 'FORMULA' && !data.formula) return false;
        return true;
      },
      { message: 'Formula is required when calculation method is FORMULA', path: ['formula'] },
    ),
});

export const updateSalaryComponentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      code: z
        .string()
        .min(1)
        .max(50)
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores')
        .optional(),
      name: z.string().min(1).max(150).optional(),
      type: z.enum(['EARNING', 'DEDUCTION']).optional(),
      calculationMethod: z.enum(['FIXED', 'PERCENTAGE', 'FORMULA', 'MANUAL']).optional(),
      defaultValue: z.coerce.number().min(0).optional(),
      formula: z.string().optional().nullable(),
      isTaxable: z.boolean().optional(),
      isPensionable: z.boolean().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const salaryComponentIdParamSchema = z.object({ params: z.object({ id: uuid }) });
