import type { UserStatus, RoleStatus } from './enums';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  status: RoleStatus;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  description?: string;
}

export interface User {
  id: string;
  employeeId?: string;
  roleId: string;
  roleCode?: string;
  role?: string;
  displayName?: string;
  username: string;
  email: string;
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
  employee?: Record<string, unknown> | null;
}

export interface SystemSetting {
  id: string;
  key: string;
  name: string;
  category: string;
  value: string;
  valueType: string;
  description?: string;
  isEditable: boolean;
  isEncrypted: boolean;
  status: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  employeeId?: string;
  eventType: string;
  entityName: string;
  entityId?: string;
  action: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { username: string };
}
