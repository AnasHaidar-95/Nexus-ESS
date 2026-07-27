import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../stores/notificationStore';
import { fmtDT } from '../lib/utils';
import { departmentApi } from '../lib/departments';
import { positionApi } from '../lib/positions';
import { attendanceRecordApi } from '../lib/attendance-records';
import { employeeDocumentApi } from '../lib/employee-documents';
import { notificationApi } from '../lib/notifications';
import { useEmployees } from '../hooks/queries/useEmployees';
import { useDepartments } from '../hooks/queries/useDepartments';
import { usePositions } from '../hooks/queries/usePositions';
import { useShifts } from '../hooks/queries/useShifts';
import { useApplicants } from '../hooks/queries/useApplicants';
import { useLeaveRequests } from '../hooks/queries/useLeaves';
import { useProfileRequests } from '../hooks/queries/useProfileRequests';
import { usePayrollPeriods, useSalaryComponents, useBankAccounts } from '../hooks/queries/usePayroll';
import { usePerformanceReviews } from '../hooks/queries/useReviews';
import { useNotificationList } from '../hooks/queries/useNotifications';
import { useDocumentCategories, useEmployeeDocuments } from '../hooks/queries/useDocuments';
import type { DepartmentFormData, PositionFormData } from '../lib/formSchemas';
import HRNavbar from './hr/HRNavbar';
import HRSidebar from './hr/HRSidebar';
import ApplicantsTab from './hr/ApplicantsTab';
import EmployeesTab from './hr/EmployeesTab';
import OrgTab from './hr/OrgTab';
import ShiftsTab from './hr/ShiftsTab';
import AttendanceTab from './hr/AttendanceTab';
import LeavesTab from './hr/LeavesTab';
import PayrollTab from './hr/PayrollTab';
import ProfileRequestsTab from './hr/ProfileRequestsTab';
import ReviewsTab from './hr/ReviewsTab';
import EmployeeFileModal from './hr/EmployeeFileModal';
import PayslipModal from './hr/PayslipModal';
import DeptModal from './hr/DeptModal';
import PositionModal from './hr/PositionModal';

const ITEMS_PER_PAGE = 5;
const PAYROLL_PROFILES_PER_PAGE = 2;

interface HRDashboardProps {
  currentUser: any;
  onLogout: () => void;
  isAdminMode?: boolean;
}

export default function HRDashboard({ currentUser, onLogout, isAdminMode = false }: HRDashboardProps) {
  const showToast = useNotificationStore((s) => s.showToast);
  const queryClient = useQueryClient();

  // UI state
  const [activeTab, setActiveTab] = useState('applicants');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [leavesSubTab, setLeavesSubTab] = useState('requests');
  const [payrollSubTab, setPayrollSubTab] = useState('periods');

  // Modal state
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [modalTab, setModalTab] = useState<string>('dossier');
  const [modalSalaryProfiles, setModalSalaryProfiles] = useState<any[]>([]);
  const [viewingDept, setViewingDept] = useState<any>(null);
  const [viewingPosition, setViewingPosition] = useState<any>(null);
  const [viewPayslipDisb, setViewPayslipDisb] = useState<any>(null);

  // Employee file modal form state
  const [newDeptPosition, setNewDeptPosition] = useState<string | null>(null);
  const [newReassignDept, setNewReassignDept] = useState<string | null>(null);
  const [newReassignMgr, setNewReassignMgr] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocConfidential, setNewDocConfidential] = useState(false);

  // Pagination state
  const [applicantsPage, setApplicantsPage] = useState(1);
  const [employeesPage, setEmployeesPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [incidentsPage, setIncidentsPage] = useState(1);
  const [payrollPage, setPayrollPage] = useState(1);
  const [profileRequestsPage, setProfileRequestsPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(1);
  const [leaveBalancesPage, setLeaveBalancesPage] = useState(1);
  const [leaveTypesPage, setLeaveTypesPage] = useState(1);
  const [holidaysPage, setHolidaysPage] = useState(1);
  const [componentsPage, setComponentsPage] = useState(1);
  const [bankAccountsPage, setBankAccountsPage] = useState(1);
  const [salaryProfilesPage, setSalaryProfilesPage] = useState(1);
  const [disbursementsPage, setDisbursementsPage] = useState(1);
  const [payslipsPage, setPayslipsPage] = useState(1);
  const [runsDisbPage, setRunsDisbPage] = useState(1);
  const [selectedPeriodId, setSelectedPeriodId] = useState('');

  // Data via query hooks
  const { data: empRes } = useEmployees({ pageSize: 100 });
  const employees = empRes?.items || [];
  const { data: deptRes } = useDepartments({ pageSize: 100 });
  const departments = deptRes?.items || [];
  const { data: posRes } = usePositions({ pageSize: 100 });
  const positions = posRes?.items || [];
  const { data: shiftRes } = useShifts({ pageSize: 100 });
  const shifts = shiftRes?.items || [];
  const { data: appRes } = useApplicants({ pageSize: 20, sort: '-createdAt' });
  const applicants = (appRes?.items || []).filter((a: any) => !!a.submittedAt);
  const { data: lrRes } = useLeaveRequests({ pageSize: 20 });
  const leaveRequests = lrRes?.items || [];
  const { data: prRes } = useProfileRequests({ pageSize: 20 });
  const profileRequests = prRes?.items || [];
  const { data: notifRes } = useNotificationList({ pageSize: 50 });
  const notifications = notifRes?.items || [];
  const { data: periodRes } = usePayrollPeriods({ pageSize: 10 });
  const periods = periodRes?.items || [];
  const { data: revRes } = usePerformanceReviews({ pageSize: 100 });
  const reviews = revRes?.items || [];
  const { data: docCatRes } = useDocumentCategories({ pageSize: 100 });
  const documentCategories = docCatRes?.items || [];
  const { data: empDocRes } = useEmployeeDocuments({ pageSize: 100 });
  const employeeDocuments = empDocRes?.items || [];
  const { data: scRes } = useSalaryComponents({ pageSize: 100 });
  const salaryComponents = scRes?.items || [];
  const { data: baRes } = useBankAccounts({ pageSize: 100 });
  const bankAccounts = baRes?.items || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  // Handlers
  const handleMarkNotificationRead = useCallback(async (notId: string) => {
    try {
      await notificationApi.markRead(notId);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch { showToast('Error', 'Failed to mark notification as read.', 'error'); }
  }, [showToast, queryClient]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await notificationApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch { showToast('Error', 'Failed to mark notifications as read.', 'error'); }
  }, [showToast, queryClient]);

  const handleCreateDeptForm = useCallback(async (data: DepartmentFormData) => {
    try { await departmentApi.create({ name: data.name, code: data.code.toUpperCase(), description: data.description }); }
    catch (err: any) { showToast('Error', err?.message || 'Failed to create department.', 'error'); return; }
    showToast('Department Created', `Successfully created department "${data.name}".`, 'success');
    queryClient.invalidateQueries({ queryKey: ['departments'] });
  }, [showToast, queryClient]);

  const handleCreatePosForm = useCallback(async (data: PositionFormData) => {
    try { await positionApi.create({ name: data.name, code: data.code.toUpperCase(), description: data.description, grade: String(data.grade) }); }
    catch (err: any) { showToast('Error', err?.message || 'Failed to create position.', 'error'); return; }
    showToast('Position Created', `Successfully created position "${data.name}".`, 'success');
    queryClient.invalidateQueries({ queryKey: ['positions'] });
  }, [showToast, queryClient]);

  const handleManualAttendance = useCallback(async (employeeId: string, date: string, checkIn: string, checkOut: string, notes: string, correctionReason: string) => {
    if (!employeeId || !date || !checkIn) { showToast('Validation Error', 'Required details missing.', 'warning'); return; }
    const checkInTime = `${date}T${checkIn}:00Z`;
    const checkOutTime = checkOut ? `${date}T${checkOut}:00Z` : undefined;
    try { await attendanceRecordApi.create({ employeeId, date, checkInTime, checkOutTime, notes, correctionReason: correctionReason || undefined, isManualEntry: true }); }
    catch (err: any) { if (err?.status === 409) { showToast('Record Exists', 'An attendance record already exists for this employee on this date.', 'warning'); return; } showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Attendance Corrected', 'Attendance entry successfully corrected.', 'success');
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
  }, [showToast, queryClient]);

  const handleAddEmployeeDoc = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    if (!newDocFile) { showToast('Error', 'Please select a file to upload.', 'error'); return; }
    if (!newDocCategory) { showToast('Error', 'Please select a document category.', 'error'); return; }
    const docName = newDocName || newDocFile.name || 'Untitled_Document.pdf';
    try { await employeeDocumentApi.upload(newDocFile, { employeeId: selectedEmployee.id, categoryId: newDocCategory, isConfidential: newDocConfidential, notes: newDocNotes || 'Uploaded by HR Manager' }); }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    setNewDocName(''); setNewDocConfidential(false); setNewDocNotes(''); setNewDocFile(null);
    showToast('Document Uploaded', `${docName} has been uploaded to employee dossier.`, 'success');
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  }, [selectedEmployee, newDocName, newDocCategory, newDocConfidential, newDocNotes, newDocFile, showToast, queryClient]);

  const addAuditLog = useCallback(async (userId: string | undefined, employeeId: string | undefined, eventType: string, entityName: string, entityId: string, action: string, description: string) => {
    try {
      const { auditLogApi } = await import('../lib/audit-logs');
      await auditLogApi.create({ userId, employeeId, eventType, entityName, entityId: entityId || undefined, action, description });
    } catch { /* audit logging is non-critical */ }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-950 dark:text-slate-50 transition-colors duration-200">
      <HRNavbar
        isAdminMode={isAdminMode}
        showNotificationsDropdown={showNotificationsDropdown}
        setShowNotificationsDropdown={setShowNotificationsDropdown}
        unreadCount={unreadCount}
        notifications={notifications}
        handleMarkNotificationRead={handleMarkNotificationRead}
        handleMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onLogout={onLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <HRSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applicants={applicants}
          leaveRequests={leaveRequests}
          profileRequests={profileRequests}
          mobileSidebarOpen={mobileSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'applicants' && (
            <ApplicantsTab
              applicantsPage={applicantsPage} setApplicantsPage={setApplicantsPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              departments={departments} positions={positions}
              shifts={shifts} isAdminMode={isAdminMode}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesTab
              employeesPage={employeesPage} setEmployeesPage={setEmployeesPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE} setSelectedEmployee={setSelectedEmployee}
              setModalSalaryProfiles={setModalSalaryProfiles}
              setModalTab={setModalTab}
            />
          )}

          {activeTab === 'org' && (
            <OrgTab
              departments={departments} positions={positions}
              onSubmitDept={handleCreateDeptForm} onSubmitPos={handleCreatePosForm}
              setViewingDept={setViewingDept} setViewingPosition={setViewingPosition}
            />
          )}

          {activeTab === 'shifts' && (
            <ShiftsTab
              shifts={shifts} employees={employees} fmtDT={fmtDT}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              attendancePage={attendancePage} setAttendancePage={setAttendancePage}
              incidentsPage={incidentsPage} setIncidentsPage={setIncidentsPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE} handleManualAttendance={handleManualAttendance}
            />
          )}

          {activeTab === 'leaves' && (
            <LeavesTab
              leavesSubTab={leavesSubTab} setLeavesSubTab={setLeavesSubTab}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE} fmtDT={fmtDT}
              leaveRequestsPage={leaveRequestsPage} setLeaveRequestsPage={setLeaveRequestsPage}
              leaveBalancesPage={leaveBalancesPage} setLeaveBalancesPage={setLeaveBalancesPage}
              leaveTypesPage={leaveTypesPage} setLeaveTypesPage={setLeaveTypesPage}
              holidaysPage={holidaysPage} setHolidaysPage={setHolidaysPage}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollTab
              payrollSubTab={payrollSubTab} setPayrollSubTab={setPayrollSubTab}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE} PAYROLL_PROFILES_PER_PAGE={PAYROLL_PROFILES_PER_PAGE} fmtDT={fmtDT}
              departments={departments}
              payrollPage={payrollPage} setPayrollPage={setPayrollPage}
              selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId}
              runsDisbPage={runsDisbPage} setRunsDisbPage={setRunsDisbPage}
              componentsPage={componentsPage} setComponentsPage={setComponentsPage}
              bankAccountsPage={bankAccountsPage} setBankAccountsPage={setBankAccountsPage}
              salaryProfilesPage={salaryProfilesPage} setSalaryProfilesPage={setSalaryProfilesPage}
              disbursementsPage={disbursementsPage} setDisbursementsPage={setDisbursementsPage}
              payslipsPage={payslipsPage} setPayslipsPage={setPayslipsPage}
              setViewPayslipDisb={setViewPayslipDisb}
            />
          )}

          {activeTab === 'profileRequests' && (
            <ProfileRequestsTab
              profileRequestsPage={profileRequestsPage} setProfileRequestsPage={setProfileRequestsPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviewsPage={reviewsPage} setReviewsPage={setReviewsPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            />
          )}

          {selectedEmployee && (
            <EmployeeFileModal
              selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee}
              positions={positions} departments={departments} employees={employees}
              bankAccounts={bankAccounts} salaryComponents={salaryComponents}
              modalSalaryProfiles={modalSalaryProfiles} reviews={reviews}
              employeeDocuments={employeeDocuments} documentCategories={documentCategories}
              modalTab={modalTab} setModalTab={setModalTab} fmtDT={fmtDT}
              currentUser={currentUser} showToast={showToast}
              addAuditLog={addAuditLog} refreshCurrentTab={() => {}}
              newDeptPosition={newDeptPosition} setNewDeptPosition={setNewDeptPosition}
              newReassignDept={newReassignDept} setNewReassignDept={setNewReassignDept}
              newReassignMgr={newReassignMgr} setNewReassignMgr={setNewReassignMgr}
              newDocName={newDocName} setNewDocName={setNewDocName}
              newDocCategory={newDocCategory} setNewDocCategory={setNewDocCategory}
              newDocNotes={newDocNotes} setNewDocNotes={setNewDocNotes}
              newDocFile={newDocFile} setNewDocFile={setNewDocFile}
              newDocConfidential={newDocConfidential} setNewDocConfidential={setNewDocConfidential}
              handleAddEmployeeDoc={handleAddEmployeeDoc}
            />
          )}
        </main>
      </div>

      {viewPayslipDisb && (
        <PayslipModal viewPayslipDisb={viewPayslipDisb} setViewPayslipDisb={setViewPayslipDisb} employees={employees} periods={periods} fmtDT={fmtDT} />
      )}

      {viewingDept && (
        <DeptModal viewingDept={viewingDept} setViewingDept={setViewingDept} employees={employees} positions={positions} />
      )}

      {viewingPosition && (
        <PositionModal viewingPosition={viewingPosition} setViewingPosition={setViewingPosition} employees={employees} departments={departments} />
      )}
    </div>
  );
}
