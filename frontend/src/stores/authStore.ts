import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../lib/auth';
import { setTokens, clearTokens } from '../lib/api';

function mapAuthUser(authUser: Record<string, unknown>): User {
  const employee = authUser.employee as Record<string, unknown> | null;
  return {
    id: authUser.id as string,
    employeeId: employee?.id as string | undefined,
    roleId: authUser.roleId as string,
    roleCode: authUser.roleCode as string | undefined,
    role: authUser.role as string | undefined,
    displayName: authUser.displayName as string | undefined,
    username: authUser.username as string,
    email: authUser.email as string,
    status: authUser.status as User['status'],
    createdAt: '',
    employee: employee || null,
  };
}

interface AuthStore {
  currentUser: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (fullName: string, email: string, password: string, securityQuestion: string, securityAnswer: string) => Promise<User>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: null,
  loading: true,

  login: async (username, password) => {
    const response = await authApi.login({ username, password });
    setTokens(response.accessToken, response.refreshToken);
    const user = mapAuthUser(response.user as unknown as Record<string, unknown>);
    set({ currentUser: user });
    return user;
  },

  register: async (fullName, email, password, securityQuestion, securityAnswer) => {
    const response = await authApi.register({ fullName, email, password, securityQuestion, securityAnswer });
    setTokens(response.accessToken, response.refreshToken);
    const user = mapAuthUser(response.user as unknown as Record<string, unknown>);
    set({ currentUser: user });
    return user;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    clearTokens();
    set({ currentUser: null });
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Silently fail — logout is best-effort
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),
  setLoading: (loading) => set({ loading }),
}));

// Initialize auth state from token
export async function initializeAuth() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    useAuthStore.setState({ loading: false });
    return;
  }

  try {
    const authUser = await authApi.getMe();
    useAuthStore.setState({
      currentUser: mapAuthUser(authUser as unknown as Record<string, unknown>),
      loading: false,
    });
  } catch {
    clearTokens();
    useAuthStore.setState({ loading: false });
  }
}

// Listen for forced logout events
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.setState({ currentUser: null });
  });
}
