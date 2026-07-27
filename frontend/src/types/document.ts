import type { DocumentStatus, ApplicantDocCategory } from './enums';

export interface DocumentCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  sortOrder: number;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  categoryId: string;
  originalFilename: string;
  storedFilename: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  expiresAt?: string;
  isConfidential: boolean;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
}

export interface ApplicantDocument {
  id: string;
  applicantId: string;
  category: ApplicantDocCategory;
  originalFilename: string;
  storedFilename: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}
