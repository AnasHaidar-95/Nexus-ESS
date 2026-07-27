import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listDocumentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    categoryId: uuid.optional(),
    isConfidential: z.coerce.boolean().optional(),
    status: z.enum(['ACTIVE', 'ARCHIVED']).optional(), // Added new status enum filter
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('-uploadedAt'),
  }),
});

// Note: File and core metadata are handled via Multer and req.body in the controller
export const uploadDocumentSchema = z.object({
  body: z.object({
    employeeId: uuid,
    categoryId: uuid,
    notes: z.string().max(500).optional().nullable(),
    isConfidential: z.coerce.boolean().optional().default(false),
    expiresAt: z.coerce.date().optional().nullable(),
  }),
});

export const updateDocumentSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      notes: z.string().max(500).optional().nullable(),
      isConfidential: z.boolean().optional(),
      expiresAt: z.coerce.date().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const documentIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
