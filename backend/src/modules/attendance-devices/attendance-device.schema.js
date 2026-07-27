import { z } from 'zod';

const uuid = z.string().uuid('Invalid UUID format');

export const listDevicesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    pageSize: z.coerce.number().int().min(1).max(9999).optional().default(25),
    search: z.string().max(500).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    connectionStatus: z
      .enum(['ONLINE', 'OFFLINE', 'SYNCHRONIZING', 'ERROR', 'MAINTENANCE'])
      .optional(),
    location: z.string().optional(),
    manufacturer: z.string().optional(),
    sort: z.string().optional().default('-createdAt'),
  }),
});

export const createDeviceSchema = z.object({
  body: z.object({
    deviceCode: z
      .string()
      .min(1)
      .max(50)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric'),
    deviceName: z.string().min(1).max(150),
    deviceType: z.enum(['FINGERPRINT', 'FACE_RECOGNITION', 'RFID', 'QR_CODE', 'MOBILE']),
    manufacturer: z.string().min(1).max(500),
    model: z.string().max(500).optional().nullable(),
    serialNumber: z.string().min(1).max(500),
    ipAddress: z.string().min(7).max(45, 'Invalid IP address format'),
    port: z.coerce.number().int().min(1).max(65535),
    location: z.string().min(1).max(255),
  }),
});

export const updateDeviceSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      deviceName: z.string().min(1).max(150).optional(),
      location: z.string().min(1).max(255).optional(),
      ipAddress: z.string().min(7).max(45).optional(),
      port: z.coerce.number().int().min(1).max(65535).optional(),
      manufacturer: z.string().min(1).max(500).optional(),
      model: z.string().max(500).optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const deviceIdParamSchema = z.object({
  params: z.object({ id: uuid }),
});
