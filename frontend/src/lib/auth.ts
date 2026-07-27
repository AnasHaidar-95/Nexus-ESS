import { api } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
  roleCode: string;
  roleId: string;
  status: string;
  employee: Record<string, unknown> | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data),

  logout: (refreshToken: string) =>
    fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).then(() => {}),

  getMe: () =>
    api.get<AuthUser>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifySecurityAnswer: (email: string, answer: string) =>
    api.post<{ resetToken: string }>('/auth/verify-security-answer', { email, answer }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};
