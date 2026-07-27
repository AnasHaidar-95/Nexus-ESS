import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from '../errors/app-error.js';
import { config } from '../../config/index.js';

const uploadDir = config.uploads.dir;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const sanitizePath = (filePath) => {
  const normalized = path.normalize(filePath);
  const resolved = path.resolve(uploadDir, normalized);
  if (!resolved.startsWith(uploadDir)) {
    throw new AppError('Invalid file path detected.', 400, 'INVALID_PATH');
  }
  return resolved;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Invalid file type. Only PDF, JPG, PNG, and DOC/DOCX are allowed.',
        400,
        'INVALID_FILE_TYPE',
      ),
      false,
    );
  }
};

export const validateStoragePath = (storagePath) => {
  const normalized = path.normalize(storagePath);
  const resolved = path.resolve(uploadDir, normalized);
  if (!resolved.startsWith(uploadDir)) {
    throw new AppError('Invalid storage path.', 400, 'INVALID_STORAGE_PATH');
  }
  if (!fs.existsSync(resolved)) {
    throw new AppError('File not found.', 404, 'FILE_NOT_FOUND');
  }
  return resolved;
};

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.uploads.maxFileSizeBytes,
    files: 1,
  },
});
