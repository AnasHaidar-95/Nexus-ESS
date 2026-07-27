import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listApplicantsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const applicantIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});

export const updateApplicantProfileSchema = z.object({
  body: z
    .object({
      firstName: z.string().min(1).max(500).optional(),
      middleName: z.string().max(500).optional().nullable(),
      lastName: z.string().min(1).max(500).optional(),
      preferredName: z.string().max(500).optional().nullable(),
      dateOfBirth: z.coerce.date().optional().nullable(),
      gender: z.string().max(20).optional().nullable(),
      nationalId: z.string().max(500).optional().nullable(),
      passportNumber: z.string().max(500).optional().nullable(),
      phone: z.string().max(50).optional().nullable(),
      alternatePhone: z.string().max(50).optional().nullable(),
      addressLine1: z.string().max(255).optional().nullable(),
      addressLine2: z.string().max(255).optional().nullable(),
      city: z.string().max(500).optional().nullable(),
      state: z.string().max(500).optional().nullable(),
      postalCode: z.string().max(20).optional().nullable(),
      country: z.string().max(500).optional().nullable(),
      emergencyContactName: z.string().max(150).optional().nullable(),
      emergencyContactPhone: z.string().max(50).optional().nullable(),
      emergencyContactRelationship: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const approveApplicantSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    employeeNumber: z.string().min(1).max(30),
    departmentId: uuid,
    positionId: uuid,
    shiftId: uuid.optional(),
    hireDate: z.coerce.date(),
    employmentType: z
      .enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'])
      .default('FULL_TIME'),
    basicSalary: z.coerce.number().min(0).optional(),
    housingAllowance: z.coerce.number().min(0).optional(),
    transportAllowance: z.coerce.number().min(0).optional(),
  }),
});

export const rejectApplicantSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    reason: z.string().min(5, 'Rejection reason must be at least 5 characters'),
  }),
});
