import React, { useEffect } from 'react';
import { useAuthStore, initializeAuth } from '../stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <>{children}</>
  );
}

export function useAuth() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);

  return { currentUser, loading, login, register, logout };
}
