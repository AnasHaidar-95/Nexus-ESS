import { api, getAccessToken } from './api';
import type { PaginatedResult, ApplicantProfile } from '../types';

export interface UpdateProfileData {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
  preferredName?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationalId?: string | null;
  passportNumber?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
}

export interface ApplicantDocument {
  id: string;
  category: string;
  originalFilename: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

const BASE_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

function downloadViaFetch(url: string, filename: string) {
  const token = getAccessToken();
  if (!token) return;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(res => {
      if (!res.ok) throw new Error('Download failed');
      return res.blob();
    })
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    });
}

export const applicantApi = {
  getProfile: () =>
    api.get<Record<string, unknown>>('/applicants/profile'),

  updateProfile: (data: UpdateProfileData) =>
    api.patch<Record<string, unknown>>('/applicants/profile', data),

  submit: () =>
    api.post<Record<string, unknown>>('/applicants/submit'),

  uploadDocument: (file: File, category: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return api.post<ApplicantDocument>('/applicants/documents', formData);
  },

  deleteDocument: (id: string) =>
    api.delete<void>(`/applicants/documents/${id}`),

  downloadDocument: (id: string, filename: string) =>
    downloadViaFetch(`${BASE_URL}/applicants/documents/${id}/download`, filename),

  list: (params?: { page?: number; pageSize?: number; search?: string; sort?: string }) => {
    const qs = params ? '?' + new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString() : '';
    return api.get<PaginatedResult<ApplicantProfile>>('/applicants' + qs);
  },

  approve: (applicantId: string, data: { employeeNumber: string; departmentId: string; positionId: string; shiftId?: string; hireDate: string; employmentType?: string; basicSalary?: number; housingAllowance?: number; transportAllowance?: number }) =>
    api.post<Record<string, unknown>>(`/applicants/${applicantId}/approve`, data),

  reject: (applicantId: string, data: { reason: string }) =>
    api.post<void>(`/applicants/${applicantId}/reject`, data),
};
