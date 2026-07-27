import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listAttendanceSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    employeeId: uuid.optional(),
    departmentId: uuid.optional(),
    fromDate: z.coerce.date().optional(),
    toDate: z.coerce.date().optional(),
    status: z
      .enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'WEEKEND', 'INCOMPLETE'])
      .optional(),
    search: z.string().max(500).optional(),
    sort: z.string().optional().default('-date'), // FIX: Prisma field is 'date', not 'attendanceDate'
  }),
});

export const createAttendanceSchema = z.object({
  body: z
    .object({
      employeeId: uuid,
      date: z.coerce.date({ required_error: 'Date is required' }),
      checkInTime: z.coerce.date().optional().nullable(),
      checkOutTime: z.coerce.date().optional().nullable(),
      notes: z.string().max(500).optional().nullable(),
      correctionReason: z.string().max(500).optional().nullable(),
      isManualEntry: z.boolean().optional().default(true),
    })
    .refine(
      (data) => !data.checkOutTime || !data.checkInTime || data.checkOutTime >= data.checkInTime,
      {
        message: 'Check-out time must be after check-in time',
      },
    ),
});

export const updateAttendanceSchema = z.object({
  params: z.object({ id: uuid }),
  body: z.object({
    checkInTime: z.coerce.date().optional().nullable(),
    checkOutTime: z.coerce.date().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    correctionReason: z.string().min(5, 'Correction reason is required for updates'),
  }),
});

export const recordIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
