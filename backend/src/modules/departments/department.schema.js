import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listDepartmentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    sort: z.string().optional().default('name'),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150),
    code: z.string().min(1).max(30),
    description: z.string().max(500).optional().nullable(),
    managerId: uuid.optional().nullable(),
    parentId: uuid.optional().nullable(),
  }),
});

export const updateDepartmentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(150).optional(),
      code: z.string().min(1).max(30).optional(),
      description: z.string().max(500).optional().nullable(),
      managerId: uuid.optional().nullable(),
      parentId: uuid.optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const departmentIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const listDepartmentEmployeesSchema = z.object({
  params: z.object({ id: uuid }),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    includeArchived: z.coerce.boolean().optional().default(false),
    sort: z.string().optional().default('employeeNumber'),
  }),
});

export const assignManagerSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid department ID format'),
  }),
  body: z.object({
    // .nullable() allows you to pass `null` to unassign/remove a manager
    managerId: z.string().uuid('Invalid employee ID format').nullable(),
  }),
});
