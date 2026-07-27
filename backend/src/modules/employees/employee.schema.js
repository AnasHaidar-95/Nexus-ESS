import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listEmployeesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).optional().default(25), // MUST be camelCase
    search: z.string().max(500).optional(),
    departmentId: uuid.optional(),
    positionId: uuid.optional(),
    managerId: uuid.optional(),
    employmentStatus: z
      .enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'RETIRED'])
      .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    includeArchived: z.coerce.boolean().optional().default(false),
    sort: z.string().optional().default('-hireDate'),
  }),
});

const employeeBodyFields = {
  firstName: z.string().min(1).max(500),
  middleName: z.string().max(500).optional().nullable(),
  lastName: z.string().min(1).max(500),
  preferredName: z.string().max(500).optional().nullable(),
  gender: z
    .enum(['MALE', 'FEMALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY'])
    .optional()
    .nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  nationalId: z.string().max(500).optional().nullable(),
  passportNumber: z.string().max(500).optional().nullable(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().nullable(),
  alternatePhone: z.string().max(50).optional().nullable(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(500).optional().nullable(),
  state: z.string().max(500).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(500).optional().nullable(),
  departmentId: uuid,
  positionId: uuid,
  managerId: uuid.optional().nullable(),
  hireDate: z.coerce.date(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY']),
  employmentStatus: z.enum([
    'ACTIVE',
    'PROBATION',
    'ON_LEAVE',
    'RESIGNED',
    'TERMINATED',
    'RETIRED',
  ]),
  emergencyContactName: z.string().max(150).optional().nullable(),
  emergencyContactPhone: z.string().max(50).optional().nullable(),
  emergencyContactRelationship: z.string().max(500).optional().nullable(),
  notes: z.string().optional().nullable(),
};

const makeAllOptional = (fields) => {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = v.isOptional() ? v : v.optional();
  }
  return out;
};

export const createEmployeeSchema = z.object({
  body: z.object({
    employeeNumber: z.string().min(1).max(30),
    ...employeeBodyFields,
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'])
      .default('FULL_TIME'),
    employmentStatus: z
      .enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'RETIRED'])
      .default('ACTIVE'),
  }),
});

export const updateEmployeeSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object(makeAllOptional(employeeBodyFields))
    .extend({
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
      terminationDate: z.coerce.date().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const employeeIdParamSchema = z.object({ params: z.object({ id: uuid }) });

export const terminateEmployeeSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    terminationDate: z.coerce.date(),
    terminationReason: z.string().optional().nullable(),
  }),
});

export const changeManagerSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ managerId: uuid.optional().nullable() }),
});

export const changeDepartmentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ departmentId: uuid.nullable() }),
});

export const changePositionSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({ positionId: uuid.nullable() }),
});

export const activateEmployeeSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({}).optional(),
});
