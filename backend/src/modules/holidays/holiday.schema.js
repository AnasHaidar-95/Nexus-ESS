import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listHolidaysSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    year: z.coerce.number().int().min(1900).max(2100).optional(),
    type: z.enum(['PUBLIC', 'COMPANY', 'REGIONAL', 'RELIGIOUS', 'SPECIAL']).optional(),
    isRecurring: z.coerce.boolean().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('date'),
  }),
});

export const createHolidaySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Holiday name is required').max(150),
    date: z.coerce.date({ required_error: 'Holiday date is required' }),
    type: z.enum(['PUBLIC', 'COMPANY', 'REGIONAL', 'RELIGIOUS', 'SPECIAL']).default('PUBLIC'),
    description: z.string().max(500).optional().nullable(),
    region: z.string().max(500).optional().nullable(),
    isPaid: z.boolean().default(true),
    isRecurring: z.boolean().default(false),
  }),
});

export const updateHolidaySchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().min(1).max(150).optional(),
      date: z.coerce.date().optional(),
      type: z.enum(['PUBLIC', 'COMPANY', 'REGIONAL', 'RELIGIOUS', 'SPECIAL']).optional(),
      description: z.string().max(500).optional().nullable(),
      region: z.string().max(500).optional().nullable(),
      isPaid: z.boolean().optional(),
      isRecurring: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const holidayIdParamSchema = z.object({ params: z.object({ id: uuid }) });
export const calendarYearParamSchema = z.object({
  params: z.object({ year: z.coerce.number().int().min(1900).max(2100) }),
});
