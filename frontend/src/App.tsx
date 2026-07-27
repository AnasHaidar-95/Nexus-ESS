import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useNotificationStore } from './stores/notificationStore';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { useRTL } from './i18n/useRTL';

const Auth = lazy(() => import('./components/Auth'));
const OnboardingWizard = lazy(() => import('./components/OnboardingWizard'));
const EmployeeDashboard = lazy(() => import('./components/EmployeeDashboard'));
const HRDashboard = lazy(() => import('./components/HRDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));

function DashboardSpinner() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center transition-colors">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-4">Loading...</p>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <DashboardSpinner />;
  if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(currentUser.roleCode || '')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <DashboardSpinner />;
  if (currentUser) {
    const roleCode = currentUser.roleCode || '';
    if (roleCode === 'ADMIN') return <Navigate to="/admin" replace />;
    if (roleCode === 'HR_MANAGER' || roleCode === 'HR_OFF') return <Navigate to="/hr" replace />;
    if (!currentUser.employeeId || currentUser.status === 'PENDING_APPROVAL') return <Navigate to="/onboarding" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <ToastContainer />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function SyncNotificationUser() {
  const { currentUser } = useAuth();
  const setCurrentUserId = useNotificationStore((s) => s.setCurrentUserId);

  useEffect(() => {
    setCurrentUserId(currentUser?.id ?? null);
    return () => setCurrentUserId(null);
  }, [currentUser, setCurrentUserId]);

  return null;
}

function AppRoutes() {
  useRTL();
  return (
    <>
      <SyncNotificationUser />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Suspense fallback={<DashboardSpinner />}>
              <Auth onLoginSuccess={() => {}} />
            </Suspense>
          </PublicRoute>
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingWizardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/hr" element={
          <ProtectedRoute allowedRoles={['HR_MANAGER', 'HR_OFF']}>
            <HRDashboardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <EmployeeDashboardWrapper />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

function AdminDashboardWrapper() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSpinner />}>
        <AdminDashboard currentUser={currentUser} onLogout={logout} />
      </Suspense>
    </ErrorBoundary>
  );
}

function HRDashboardWrapper() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSpinner />}>
        <HRDashboard currentUser={currentUser} onLogout={logout} />
      </Suspense>
    </ErrorBoundary>
  );
}

function EmployeeDashboardWrapper() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSpinner />}>
        <EmployeeDashboard currentUser={currentUser} onLogout={logout} />
      </Suspense>
    </ErrorBoundary>
  );
}

function OnboardingWizardWrapper() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSpinner />}>
        <OnboardingWizard currentUser={currentUser} onLogout={logout} />
      </Suspense>
    </ErrorBoundary>
  );
}
