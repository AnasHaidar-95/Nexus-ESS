const API_BASE = '/api/v1';

let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  return accessToken;
}

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const body = await res.json();
    setTokens(body.data.accessToken, body.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function sanitizeDecimals(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object' && typeof (obj as any).toString === 'function' && typeof (obj as any).toFixed === 'function' && obj.constructor?.name !== 'Object' && obj.constructor?.name !== 'Array') {
    const str = (obj as any).toString();
    if (/^-?\d+(\.\d+)?$/.test(str)) return Number(str);
  }
  if (Array.isArray(obj)) return obj.map(sanitizeDecimals);
  if (typeof obj === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = sanitizeDecimals(v);
    }
    return out;
  }
  return obj;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } else {
      clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new ApiError('Session expired. Please log in again.', 401, 'SESSION_EXPIRED');
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json();

  if (!res.ok) {
    throw new ApiError(
      body.message || 'Request failed',
      res.status,
      body.error?.code || 'UNKNOWN_ERROR',
    );
  }

  return sanitizeDecimals(body.data) as T;
}

function toBody(data?: unknown): BodyInit | undefined {
  if (data instanceof FormData) return data;
  return data ? JSON.stringify(data) : undefined;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: toBody(data) }),
  put: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PUT', body: toBody(data) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: toBody(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};


