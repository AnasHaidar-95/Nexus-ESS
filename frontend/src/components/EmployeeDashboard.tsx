import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { User, Employee, AttendanceRecord } from '../types';
import { attendanceRecordApi } from '../lib/attendance-records';
import { leaveRequestApi } from '../lib/leave-requests';
import { profileChangeRequestApi } from '../lib/profile-change-requests';
import { notificationApi } from '../lib/notifications';
import { localDateStr, isSameLocalDate } from '../lib/utils';
import { AlertTriangle } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';
import { useEmployees } from '../hooks/queries/useEmployees';
import { useAttendanceRecords } from '../hooks/queries/useAttendanceRecords';
import { useShiftAssignments } from '../hooks/queries/useShiftAssignments';
import { useShift } from '../hooks/queries/useShifts';
import { useLeaveRequests, useLeaveBalances, useLeaveTypes, useHolidays } from '../hooks/queries/useLeaves';
import { usePerformanceReviews } from '../hooks/queries/useReviews';
import { useProfileRequests } from '../hooks/queries/useProfileRequests';
import { useNotificationList, NOTIFICATION_KEYS } from '../hooks/queries/useNotifications';
import { useUsers } from '../hooks/queries/useUsers';
import { useBankAccounts, useSalaryProfiles, useSalaryComponents, usePayrollDisbursements } from '../hooks/queries/usePayroll';
import { ATTENDANCE_KEYS } from '../hooks/queries/useAttendanceRecords';
import { LEAVE_KEYS } from '../hooks/queries/useLeaves';
import { PROFILE_REQ_KEYS } from '../hooks/queries/useProfileRequests';

import {
  EmployeeNavbar,
  EmployeeSidebar,
  EmployeeHomeTab,
  EmployeeProfileTab,
  EmployeeAttendanceTab,
  EmployeeLeaveTab,
  EmployeePayrollTab,
  EmployeePerformanceTab,
  EmployeeDetailModals,
  EmployeePayslipModal,
} from './employee-dashboard';
import type { ShiftTimerState, PayrollDisbursementData } from './employee-dashboard/types';

interface EmployeeDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ currentUser, onLogout }: EmployeeDashboardProps) {
  const { t } = useTranslation();
  const showToast = useNotificationStore((s) => s.showToast);
  const sendNotification = useNotificationStore((s) => s.sendNotification);
  const queryClient = useQueryClient();

  // --- Pagination state ---
  const [attendancePage, setAttendancePage] = useState(1);

  // --- Query Hooks ---
  const { data: employeesRes, isLoading: employeesLoading } = useEmployees({ pageSize: 100 });
  const allEmployees = employeesRes?.items || [];

  const employeeFromQuery = allEmployees.find(e => e.email === currentUser.email);
  const employee: Employee | null = employeeFromQuery || (currentUser.employee ? {
    id: (currentUser.employee as Record<string, unknown>).id as string,
    employeeNumber: (currentUser.employee as Record<string, unknown>).employeeNumber as string,
    firstName: (currentUser.employee as Record<string, unknown>).firstName as string,
    middleName: (currentUser.employee as Record<string, unknown>).middleName as string | undefined,
    lastName: (currentUser.employee as Record<string, unknown>).lastName as string,
    preferredName: (currentUser.employee as Record<string, unknown>).preferredName as string | undefined,
    gender: (currentUser.employee as Record<string, unknown>).gender as any,
    dateOfBirth: (currentUser.employee as Record<string, unknown>).dateOfBirth as string | undefined,
    nationalId: (currentUser.employee as Record<string, unknown>).nationalId as string | undefined,
    passportNumber: (currentUser.employee as Record<string, unknown>).passportNumber as string | undefined,
    email: (currentUser.employee as Record<string, unknown>).email as string,
    phone: (currentUser.employee as Record<string, unknown>).phone as string | undefined,
    alternatePhone: (currentUser.employee as Record<string, unknown>).alternatePhone as string | undefined,
    addressLine1: (currentUser.employee as Record<string, unknown>).addressLine1 as string | undefined,
    addressLine2: (currentUser.employee as Record<string, unknown>).addressLine2 as string | undefined,
    city: (currentUser.employee as Record<string, unknown>).city as string | undefined,
    state: (currentUser.employee as Record<string, unknown>).state as string | undefined,
    postalCode: (currentUser.employee as Record<string, unknown>).postalCode as string | undefined,
    country: (currentUser.employee as Record<string, unknown>).country as string | undefined,
    emergencyContactName: (currentUser.employee as Record<string, unknown>).emergencyContactName as string | undefined,
    emergencyContactPhone: (currentUser.employee as Record<string, unknown>).emergencyContactPhone as string | undefined,
    emergencyContactRelationship: (currentUser.employee as Record<string, unknown>).emergencyContactRelationship as string | undefined,
    departmentId: (currentUser.employee as Record<string, unknown>).departmentId as string | undefined,
    positionId: (currentUser.employee as Record<string, unknown>).positionId as string | undefined,
    managerId: (currentUser.employee as Record<string, unknown>).managerId as string | undefined,
    employmentStatus: (currentUser.employee as Record<string, unknown>).employmentStatus as any,
    employmentType: (currentUser.employee as Record<string, unknown>).employmentType as any,
    hireDate: (currentUser.employee as Record<string, unknown>).hireDate as string,
    terminationDate: (currentUser.employee as Record<string, unknown>).terminationDate as string | undefined,
    status: (currentUser.employee as Record<string, unknown>).status as any,
    notes: (currentUser.employee as Record<string, unknown>).notes as string | undefined,
    createdAt: (currentUser.employee as Record<string, unknown>).createdAt as string,
  } : null);

  const employeeId = employee?.id;

  const { data: attRes } = useAttendanceRecords({ employeeId, page: attendancePage, pageSize: 10 });
  const { data: saRes } = useShiftAssignments({ employeeId, currentOnly: true, pageSize: 10 });
  const { data: leavesRes } = useLeaveRequests({ employeeId, pageSize: 100 });
  const { data: balRes } = useLeaveBalances({ employeeId, pageSize: 100 });
  const { data: baRes } = useBankAccounts({ employeeId, pageSize: 10 });
  const { data: spRes } = useSalaryProfiles({ employeeId, pageSize: 50 });
  const { data: prRes } = usePerformanceReviews({ employeeId, pageSize: 50 });
  const { data: pcrRes } = useProfileRequests({ employeeId, pageSize: 50 });
  const { data: pdRes } = usePayrollDisbursements({ employeeId, pageSize: 50 });

  const { data: ltRes } = useLeaveTypes({ status: 'ACTIVE', pageSize: 100 });
  const { data: scRes } = useSalaryComponents({ status: 'ACTIVE', pageSize: 100 });
  const { data: holRes } = useHolidays({ status: 'ACTIVE', pageSize: 100 });
  const { data: usersRes } = useUsers({ pageSize: 100 });
  const { data: notifRes } = useNotificationList({ pageSize: 100 });

  // --- Derived data ---
  const attendance: AttendanceRecord[] = (attRes?.items || []).sort((a: any, b: any) => b.date.localeCompare(a.date));
  const leaves = (leavesRes?.items || []).sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  const leaveBalances = balRes?.items || [];
  const leaveTypes = ltRes?.items || [];
  const bankAccounts = baRes?.items || [];
  const salaryProfile = spRes?.items || [];
  const salaryComponents = scRes?.items || [];
  const performanceReviews = prRes?.items || [];
  const profileChangeRequests = pcrRes?.items || [];
  const holidays = holRes?.items || [];
  const payrollDisbursements = pdRes?.items || [];

  const notifications = (notifRes?.items || [])
    .filter((n: any) => n.userId === currentUser.id)
    .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

  const usersList = usersRes?.items || [];
  const hrUserId = usersList.find((u: any) => u.role?.code === 'HR_MANAGER' || u.role?.code === 'ADMIN')?.id || '';

  const myAssignment = saRes?.items?.[0] || null;
  const shiftAssignmentDaysOfWeek = myAssignment?.daysOfWeek || null;
  const shiftId = myAssignment?.shiftId || null;
  const { data: shift } = useShift(shiftId);

  const todayRecord: AttendanceRecord | null = attendance.find(a => isSameLocalDate(a.date)) || null;
  const isClockedIn = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime;

  // Real-time notifications listener
  useEffect(() => {
    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    };
    window.addEventListener('new-notification', handleNewNotification);
    return () => window.removeEventListener('new-notification', handleNewNotification);
  }, [queryClient]);

  // Tab and sidebar state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Shift countdown timer
  const [shiftTimer, setShiftTimer] = useState<ShiftTimerState>({ hours: 0, minutes: 0, seconds: 0, expired: false, mode: 'remaining' });

  // Modal states
  const [activeModal, setActiveModal] = useState<'leaves' | 'schedule' | 'holidays' | null>(null);
  const [viewPayslipDisb, setViewPayslipDisb] = useState<PayrollDisbursementData | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Shift countdown timer effect
  useEffect(() => {
    if (!isClockedIn || !shift || !todayRecord?.checkInTime) {
      setShiftTimer({ hours: 0, minutes: 0, seconds: 0, expired: true, mode: 'remaining' });
      return;
    }
    const calcRemaining = () => {
      const now = new Date();
      const shiftStartMinutes = shift.startTimeMinutes;
      const rawEnd = shift.endTimeMinutes < shift.startTimeMinutes ? shift.endTimeMinutes + 1440 : shift.endTimeMinutes;
      const nowMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

      if (nowMinutes < shiftStartMinutes) {
        const msToStart = (shiftStartMinutes - nowMinutes) * 60 * 1000;
        const totalSec = Math.floor(msToStart / 1000);
        setShiftTimer({ hours: Math.floor(totalSec / 3600), minutes: Math.floor((totalSec % 3600) / 60), seconds: totalSec % 60, expired: false, mode: 'toStart' });
        return;
      }
      if (nowMinutes >= rawEnd) {
        const overtimeMs = (nowMinutes - rawEnd) * 60 * 1000;
        const totalSec = Math.floor(overtimeMs / 1000);
        setShiftTimer({ hours: Math.floor(totalSec / 3600), minutes: Math.floor((totalSec % 3600) / 60), seconds: totalSec % 60, expired: true, mode: 'overtime' });
        return;
      }
      const msLeft = (rawEnd - nowMinutes) * 60 * 1000;
      const totalSec = Math.floor(msLeft / 1000);
      setShiftTimer({ hours: Math.floor(totalSec / 3600), minutes: Math.floor((totalSec % 3600) / 60), seconds: totalSec % 60, expired: false, mode: 'remaining' });
    };
    calcRemaining();
    const id = setInterval(calcRemaining, 1000);
    return () => clearInterval(id);
  }, [isClockedIn, shift, todayRecord?.checkInTime]);

  // --- Handlers ---
  const handleClockInOut = async () => {
    const todayStr = localDateStr();
    const currentTime = new Date();

    if (!isClockedIn) {
      let newRec: any = null;
      try {
        newRec = await attendanceRecordApi.create({ employeeId: employee!.id, date: todayStr, checkInTime: currentTime.toISOString() });
      } catch (err: any) {
        if (err?.status === 409) {
          try {
            const existing = await attendanceRecordApi.list({ employeeId: employee!.id, pageSize: 100 });
            const todayRec = (existing?.items || []).find((r: any) => isSameLocalDate(r.date));
            if (todayRec && todayRec.checkInTime && !todayRec.checkOutTime) {
              queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
              showToast(t('employee.alreadyClockedIn'), t('employee.alreadyClockedInMessage'), 'info');
              return;
            }
            if (todayRec && todayRec.checkInTime && todayRec.checkOutTime) {
              queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
              showToast(t('employee.shiftCompleted'), t('employee.shiftCompletedMessage'), 'info');
              return;
            }
          } catch { /* ignore secondary error */ }
        }
        showToast(t('employee.clockInFailed'), t('employee.clockInFailedMessage'), 'error');
        return;
      }
      if (newRec) queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
      showToast(t('employee.clockedInTitle'), t('employee.clockedInMessage', { time: currentTime.toLocaleTimeString() }), 'success');
    } else {
      if (!todayRecord) return;
      const checkInTimeDate = new Date(todayRecord.checkInTime!);
      const diffMs = currentTime.getTime() - checkInTimeDate.getTime();
      const workedMinutes = Math.round(diffMs / 60000);
      try {
        await attendanceRecordApi.update(todayRecord.id, { checkOutTime: currentTime.toISOString(), correctionReason: 'Clock out' });
        queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
      } catch (err) { console.error('Clock-out API error:', err); showToast(t('employee.clockOutFailed'), t('employee.clockOutFailedMessage'), 'error'); return; }
      showToast(t('employee.clockedOutTitle'), t('employee.clockedOutMessage', { time: currentTime.toLocaleTimeString(), hours: Math.floor(workedMinutes / 60), minutes: workedMinutes % 60 }), 'info');
    }
  };

  const handleSubmitLeave = async (data: { leaveTypeId: string; startDate: string; endDate: string; totalDays: number; reason: string }) => {
    if (!employee) return;
    const balance = leaveBalances.find(b => b.leaveTypeId === data.leaveTypeId);
    if (balance) {
      const remaining = Number(balance.entitledDays) - Number(balance.usedDays);
      if (data.totalDays > remaining) {
        showToast(t('employee.insufficientBalance'), t('employee.insufficientBalanceMessage', { requested: data.totalDays, available: remaining }), 'warning');
        return;
      }
    }
    try {
      await leaveRequestApi.create({ employeeId: employee.id, ...data });
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.requests() });
    } catch (err) { console.error('Leave submit error:', err); showToast(t('errors.somethingWentWrong'), t('employee.failedSubmitLeave'), 'error'); return; }
    if (hrUserId) {
      sendNotification(hrUserId, t('employee.newLeaveRequestSubmitted'), t('employee.leaveNotificationMessage', { name: `${employee.firstName} ${employee.lastName}`, days: data.totalDays, date: data.startDate }), 'INFO', { leaveRequestId: '' });
    }
    showToast(t('employee.requestSubmitted'), t('employee.leaveSubmittedSuccess'), 'success');
  };

  const handleCancelLeave = async (reqId: string) => {
    try {
      await leaveRequestApi.cancel(reqId);
      queryClient.invalidateQueries({ queryKey: LEAVE_KEYS.requests() });
    } catch (err) { console.error('Cancel leave error:', err); showToast(t('errors.somethingWentWrong'), t('employee.failedCancelLeave'), 'error'); return; }
    showToast(t('employee.leaveCancelled'), t('employee.leaveCancelledMessage'), 'info');
  };

  const handleSubmitProfileChange = async (field: string, value: string) => {
    if (!employee) return;
    try {
      await profileChangeRequestApi.create({ employeeId: employee.id, field, newValue: value });
      queryClient.invalidateQueries({ queryKey: PROFILE_REQ_KEYS.all });
    } catch (err) { console.error('Profile change error:', err); showToast(t('errors.somethingWentWrong'), t('employee.failedSubmitProfileChange'), 'error'); return; }
    if (hrUserId) {
      sendNotification(hrUserId, t('employee.profileChangeRequest'), t('employee.profileChangeNotificationMessage', { name: `${employee.firstName} ${employee.lastName}`, field }), 'INFO', { changeRequestId: '' });
    }
    showToast(t('employee.correctionSubmitted'), t('employee.profileChangeSubmitted'), 'success');
  };

  const handleMarkNotificationRead = async (notId: string) => {
    try {
      await notificationApi.markRead(notId);
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    } catch (err) { console.error('Mark read error:', err); showToast(t('employee.errorTitle'), t('employee.failedMarkRead'), 'error'); }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
    } catch (err) { console.error('Mark all read error:', err); showToast(t('employee.errorTitle'), t('employee.failedMarkAllRead'), 'error'); }
  };

  // --- Loading / Not-linked states ---
  if (employeesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">{t('employee.loading')}</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 max-w-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800">{t('employee.profileNotLinked')}</h2>
          <p className="text-sm text-slate-500 mt-2">{t('employee.profileNotLinkedMessage')}</p>
          <button onClick={onLogout} className="mt-6 w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">{t('auth.signOut')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-950 dark:text-slate-50 transition-colors duration-200">
      <EmployeeNavbar
        employee={employee}
        onLogout={onLogout}
        notifications={notifications}
        showNotificationsDropdown={showNotificationsDropdown}
        onToggleNotifications={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <EmployeeSidebar
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); if (tab === 'attendance') setAttendancePage(1); setShowNotificationsDropdown(false); }}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          mobileSidebarOpen={mobileSidebarOpen}
          onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
          shift={shift ?? null}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <EmployeeHomeTab
              employee={employee}
              shift={shift ?? null}
              shiftTimer={shiftTimer}
              isClockedIn={isClockedIn}
              onClockInOut={handleClockInOut}
              leaveBalances={leaveBalances}
              leaveTypes={leaveTypes}
              holidays={holidays}
              onOpenModal={setActiveModal}
            />
          )}

          {activeTab === 'profile' && (
            <EmployeeProfileTab
              employee={employee}
              profileChangeRequests={profileChangeRequests}
              onSubmitProfileChange={handleSubmitProfileChange}
            />
          )}

          {activeTab === 'attendance' && (
            <EmployeeAttendanceTab
              attendance={attendance}
              attendancePage={attendancePage}
              totalAttendance={attRes?.pagination?.totalItems ?? 0}
              onAttendancePageChange={setAttendancePage}
            />
          )}

          {activeTab === 'leaves' && (
            <EmployeeLeaveTab
              leaves={leaves}
              leaveBalances={leaveBalances}
              leaveTypes={leaveTypes}
              onSubmitLeave={handleSubmitLeave}
              onCancelLeave={handleCancelLeave}
            />
          )}

          {activeTab === 'payroll' && (
            <EmployeePayrollTab
              bankAccounts={bankAccounts}
              salaryProfile={salaryProfile}
              salaryComponents={salaryComponents}
              payrollDisbursements={payrollDisbursements}
              onViewPayslip={setViewPayslipDisb}
            />
          )}

          {activeTab === 'performance' && (
            <EmployeePerformanceTab performanceReviews={performanceReviews} />
          )}
        </main>
      </div>

      <EmployeeDetailModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        leaveBalances={leaveBalances}
        leaveTypes={leaveTypes}
        leaves={leaves}
        shift={shift ?? null}
        shiftAssignmentDaysOfWeek={shiftAssignmentDaysOfWeek}
        holidays={holidays}
      />

      {viewPayslipDisb && (
        <EmployeePayslipModal
          payslip={viewPayslipDisb}
          onClose={() => setViewPayslipDisb(null)}
        />
      )}
    </div>
  );
}
