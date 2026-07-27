import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Activity, Trash, Loader2, Download } from 'lucide-react';
import Pagination from './Pagination';
import { useNotificationStore } from '../../stores/notificationStore';
import { useEmployees } from '../../hooks/queries/useEmployees';
import { useLeaveRequests, useLeaveTypes, useLeaveBalances, useHolidays } from '../../hooks/queries/useLeaves';
import type { LeaveRequest, LeaveBalance, LeaveType, Holiday, HolidayType, HolidayStatus } from '../../types';
import { leaveTypeApi } from '../../lib/leave-types';
import { leaveBalanceApi } from '../../lib/leave-balances';
import { leaveRequestApi } from '../../lib/leave-requests';
import { holidayApi } from '../../lib/holidays';
import { dbDateStr } from '../../lib/utils';
import {
  leaveRequestSchema,
  leaveBalanceSchema,
  leaveBalanceEditSchema,
  leaveTypeSchema,
  holidaySchema,
  type LeaveRequestFormData,
  type LeaveBalanceFormData,
  type LeaveBalanceEditFormData,
  type LeaveTypeFormData,
  type HolidayFormData,
} from '../../lib/formSchemas';

interface LeavesTabProps {
  leavesSubTab: string;
  setLeavesSubTab: (v: string) => void;
  ITEMS_PER_PAGE: number;
  fmtDT: (v: string) => string;
  leaveRequestsPage: number; setLeaveRequestsPage: (v: number) => void;
  leaveBalancesPage: number; setLeaveBalancesPage: (v: number) => void;
  leaveTypesPage: number; setLeaveTypesPage: (v: number) => void;
  holidaysPage: number; setHolidaysPage: (v: number) => void;
}

export default function LeavesTab({
  leavesSubTab,
  setLeavesSubTab,
  ITEMS_PER_PAGE,
  fmtDT,
  leaveRequestsPage, setLeaveRequestsPage,
  leaveBalancesPage, setLeaveBalancesPage,
  leaveTypesPage, setLeaveTypesPage,
  holidaysPage, setHolidaysPage,
}: LeavesTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const invalidateLeaves = () => {
    queryClient.invalidateQueries({ queryKey: ['leaves'] });
  };

  // --- Editing state (moved from HRContext) ---
  const [editingLtId, setEditingLtId] = useState<string | null>(null);
  const [editLtName, setEditLtName] = useState('');
  const [editLtCode, setEditLtCode] = useState('');
  const [editLtDesc, setEditLtDesc] = useState('');
  const [editLtIsPaid, setEditLtIsPaid] = useState(true);
  const [editLtCarryForward, setEditLtCarryForward] = useState(false);
  const [editLtMaxDays, setEditLtMaxDays] = useState(20);
  const [editLtStatus, setEditLtStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayType, setHolidayType] = useState<HolidayType>('PUBLIC');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [holidayIsPaid, setHolidayIsPaid] = useState(true);
  const [holidayIsRecurring, setHolidayIsRecurring] = useState(true);
  const [holidayStatus, setHolidayStatus] = useState<HolidayStatus>('ACTIVE');

  const [editingLbId, setEditingLbId] = useState<string | null>(null);
  const [editLbEntitledDays, setEditLbEntitledDays] = useState(0);
  const [editLbCarriedOverDays, setEditLbCarriedOverDays] = useState(0);

  const [rejectReason, setRejectReason] = useState('');

  // Query hooks for data
  const { data: empRes } = useEmployees({ pageSize: 500 });
  const employees = empRes?.items || [];

  const { data: formLtRes } = useLeaveTypes({ pageSize: 500 });
  const formLeaveTypes = (formLtRes?.items || []) as LeaveType[];

  const { data: reqRes, isLoading: requestsLoading, isPlaceholderData: reqPlaceholder } = useLeaveRequests(leavesSubTab === 'requests' ? { page: leaveRequestsPage, pageSize: ITEMS_PER_PAGE } : undefined);
  const { data: balRes, isLoading: balancesLoading, isPlaceholderData: balPlaceholder } = useLeaveBalances(leavesSubTab === 'balances' ? { page: leaveBalancesPage, pageSize: ITEMS_PER_PAGE } : undefined);
  const { data: typeRes, isLoading: typesLoading, isPlaceholderData: typesPlaceholder } = useLeaveTypes(leavesSubTab === 'types' ? { page: leaveTypesPage, pageSize: ITEMS_PER_PAGE } : undefined);
  const { data: holRes, isLoading: holsLoading, isPlaceholderData: holsPlaceholder } = useHolidays(leavesSubTab === 'holidays' ? { page: holidaysPage, pageSize: ITEMS_PER_PAGE, sort: 'date' } : undefined);

  const { data: allReqRes } = useLeaveRequests({ pageSize: 500 });
  const allRequests = (allReqRes?.items || []) as LeaveRequest[];
  const { data: allBalRes } = useLeaveBalances({ pageSize: 500 });
  const allBalances = (allBalRes?.items || []) as LeaveBalance[];
  const { data: allTypeRes } = useLeaveTypes({ pageSize: 500 });
  const allTypes = (allTypeRes?.items || []) as LeaveType[];
  const { data: allHolRes } = useHolidays({ pageSize: 500, sort: 'date' });
  const allHolidays = (allHolRes?.items || []) as Holiday[];

  const requests = (reqRes?.items || []) as LeaveRequest[];
  const requestsTotal = reqRes?.pagination?.totalItems || 0;
  const balances = (balRes?.items || []) as LeaveBalance[];
  const balancesTotal = balRes?.pagination?.totalItems || 0;
  const types = (typeRes?.items || []) as LeaveType[];
  const typesTotal = typeRes?.pagination?.totalItems || 0;
  const hols = (holRes?.items || []) as Holiday[];
  const holsTotal = holRes?.pagination?.totalItems || 0;

  const loading = requestsLoading || balancesLoading || typesLoading || holsLoading;
  const placeholder = reqPlaceholder || balPlaceholder || typesPlaceholder || holsPlaceholder;

  // --- Handler functions (moved from HRContext) ---
  const handleLeaveDecision = async (reqId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      if (status === 'APPROVED') { await leaveRequestApi.approve(reqId); } else { await leaveRequestApi.reject(reqId, { reason: rejectReason.trim() || 'Rejected by HR' }); }
    } catch (err: any) { showToast('Error', err?.message || 'Failed to process leave request.', 'error'); return; }
    showToast(status === 'APPROVED' ? 'Request Approved' : 'Request Rejected', `Leave request was successfully ${status.toLowerCase()}.`, status === 'APPROVED' ? 'success' : 'info');
    setRejectReason('');
    invalidateLeaves();
  };

  const handleCreateLeaveTypeForm = async (data: LeaveTypeFormData) => {
    try { await leaveTypeApi.create({ name: data.name, code: data.code.toUpperCase(), description: data.description, isPaid: data.isPaid, carryForward: data.carryForward, maxDaysPerYear: Number(data.maxDaysPerYear) }); }
    catch (err: any) { showToast('Error', err?.message || 'Failed to create leave type.', 'error'); return; }
    showToast('Leave Type Created', `Successfully created ${data.name}.`, 'success');
    invalidateLeaves();
  };

  const handleUpdateLeaveTypeForm = async (data: LeaveTypeFormData & { status?: string }) => {
    if (!editingLtId) return;
    try { await leaveTypeApi.update(editingLtId, { name: data.name, code: data.code.toUpperCase(), description: data.description, isPaid: data.isPaid, carryForward: data.carryForward, maxDaysPerYear: Number(data.maxDaysPerYear), status: (data.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE' }); }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Leave Type Updated', 'Leave type settings saved successfully.', 'success');
    setEditingLtId(null);
    invalidateLeaves();
  };

  const handleToggleLeaveTypeStatus = async (id: string, currentStatus: 'ACTIVE' | 'INACTIVE') => {
    const next = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try { if (next === 'ACTIVE') { await leaveTypeApi.activate(id); } else { await leaveTypeApi.deactivate(id); } }
    catch (err: any) { showToast('Error', err?.message || 'Failed to toggle status.', 'error'); return; }
    showToast('Status Toggled', `Leave type is now ${next.toLowerCase()}.`, 'success');
    invalidateLeaves();
  };

  const handleDeleteLeaveType = async (id: string) => {
    try { await leaveTypeApi.deactivate(id); } catch (err: any) { showToast('Error', err?.message || 'Failed to delete leave type.', 'error'); return; }
    showToast('Leave Type Deleted', 'Leave type has been deleted.', 'success');
    invalidateLeaves();
  };

  const handleCreateHolidayForm = async (data: HolidayFormData) => {
    try { await holidayApi.create({ name: data.name, date: data.date, type: data.type, description: data.description, isPaid: data.isPaid, isRecurring: data.isRecurring }); }
    catch (err: any) { showToast('Error', err?.message || 'Failed to create holiday.', 'error'); return; }
    showToast('Holiday Created', `Holiday "${data.name}" created successfully.`, 'success');
    invalidateLeaves();
  };

  const handleUpdateHolidayForm = async (data: HolidayFormData) => {
    if (!editingHolidayId) return;
    try { await holidayApi.update(editingHolidayId, { name: data.name, date: data.date, type: data.type, description: data.description, isPaid: data.isPaid, isRecurring: data.isRecurring }); }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Holiday Updated', `Holiday "${data.name}" updated successfully.`, 'success');
    setEditingHolidayId(null);
    invalidateLeaves();
  };

  const handleToggleHolidayStatus = async (id: string, currentStatus: HolidayStatus) => {
    const next: HolidayStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try { if (next === 'ACTIVE') { await holidayApi.activate(id); } else { await holidayApi.deactivate(id); } }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Status Updated', `Holiday status set to ${next}.`, 'success');
    invalidateLeaves();
  };

  const handleDeleteHoliday = async (id: string) => {
    try { await holidayApi.deactivate(id); } catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Holiday Deleted', 'Holiday has been deleted.', 'success');
    invalidateLeaves();
  };

  const handleCreateLeaveBalanceForm = async (data: LeaveBalanceFormData) => {
    try { await leaveBalanceApi.create({ employeeId: data.employeeId, leaveTypeId: data.leaveTypeId, entitledDays: Number(data.entitledDays), carriedOverDays: Number(data.carriedOverDays), year: Number(data.year) }); }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Balance Created', 'Assigned leave balance successfully.', 'success');
    invalidateLeaves();
  };

  const handleUpdateLeaveBalanceForm = async (data: { entitledDays: number; carriedOverDays: number }) => {
    if (!editingLbId) return;
    try { await leaveBalanceApi.update(editingLbId, { entitledDays: Number(data.entitledDays), carriedOverDays: Number(data.carriedOverDays) }); }
    catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Balance Adjusted', 'Employee leave balance has been adjusted.', 'success');
    setEditingLbId(null);
    invalidateLeaves();
  };

  const handleCreateLeaveRequestForm = async (data: LeaveRequestFormData) => {
    const start = new Date(data.startDate); const end = new Date(data.endDate);
    if (end < start) { showToast('Invalid Dates', 'End date cannot be earlier than start date.', 'error'); return; }
    const totalDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const ltObj = formLeaveTypes.find(t => t.id === data.leaveTypeId);
    if (ltObj && ltObj.status === 'INACTIVE') { showToast('Inactive Leave Type', 'This leave type is currently deactivated and cannot be requested.', 'error'); return; }
    try { await leaveRequestApi.create({ employeeId: data.employeeId, leaveTypeId: data.leaveTypeId, startDate: data.startDate, endDate: data.endDate, totalDays, reason: data.reason }); }
    catch (err: any) { showToast('Error', err?.message || 'Failed to create leave request.', 'error'); return; }
    showToast('Leave Submitted', 'Leave request has been submitted and is pending approval.', 'success');
    invalidateLeaves();
  };

  const handleCancelLeaveRequest = async (id: string) => {
    try { await leaveRequestApi.cancel(id); } catch (err: any) { showToast('Error', err?.message || 'Operation failed', 'error'); return; }
    showToast('Request Cancelled', 'Leave request was cancelled.', 'info');
    invalidateLeaves();
  };

  // --- Forms ---
  const requestForm = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const balanceForm = useForm<LeaveBalanceFormData>({
    resolver: zodResolver(leaveBalanceSchema),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      entitledDays: 0,
      carriedOverDays: 0,
      year: new Date().getFullYear(),
    },
  });

  const typeForm = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      isPaid: false,
      carryForward: false,
      maxDaysPerYear: 20,
    },
  });

  const editTypeForm = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    values: editingLtId
      ? {
          name: editLtName || '',
          code: editLtCode || '',
          description: editLtDesc || '',
          isPaid: editLtIsPaid ?? false,
          carryForward: editLtCarryForward ?? false,
          maxDaysPerYear: editLtMaxDays || 1,
        }
      : { name: '', code: '', description: '', isPaid: false, carryForward: false, maxDaysPerYear: 1 },
  });

  const editBalanceForm = useForm<LeaveBalanceEditFormData>({
    resolver: zodResolver(leaveBalanceEditSchema),
    values: editingLbId
      ? { entitledDays: editLbEntitledDays || 0, carriedOverDays: editLbCarriedOverDays || 0 }
      : { entitledDays: 0, carriedOverDays: 0 },
  });

  const holidayForm = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: '',
      date: '',
      type: 'PUBLIC',
      description: '',
      isPaid: true,
      isRecurring: true,
      status: 'ACTIVE',
    },
  });

  const editHolidayForm = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    values: editingHolidayId
      ? {
          name: holidayName || '',
          date: holidayDate || '',
          type: (holidayType as any) || 'PUBLIC',
          description: holidayDescription || '',
          isPaid: holidayIsPaid ?? true,
          isRecurring: holidayIsRecurring ?? true,
          status: (holidayStatus as any) || 'ACTIVE',
        }
      : { name: '', date: '', type: 'PUBLIC', description: '', isPaid: true, isRecurring: false, status: 'ACTIVE' },
  });

  const renderEmpty = (msg: string, colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="py-8 px-6 text-center text-slate-400 italic">{msg}</td>
    </tr>
  );

  const renderLoading = (colSpan: number) => (
    <tr>
      <td colSpan={colSpan} className="py-12 px-6 text-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400 mx-auto" />
        <p className="text-slate-400 text-xs mt-2 italic">{t('common.loading')}</p>
      </td>
    </tr>
  );

  const generateLeaveRequestsCSV = () => {
    const headers = [t('hr.leaves.thEmployee'), t('hr.leaves.thLeaveType'), t('hr.leaves.thDuration'), t('hr.leaves.thReason'), t('hr.leaves.thStatus')];
    const rows = allRequests.map(req => {
      const emp = employees.find(e => e.id === req.employeeId);
      const lt = allTypes.find(l => l.id === req.leaveTypeId);
      return [
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        lt?.name || '',
        `${dbDateStr(req.startDate)} - ${dbDateStr(req.endDate)} (${req.totalDays} days)`,
        req.reason || '',
        req.status || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateLeaveBalancesCSV = () => {
    const headers = [t('hr.leaves.thEmployee'), t('hr.leaves.thLeaveType'), t('hr.leaves.thEntitled'), t('hr.leaves.thCarriedOver'), t('hr.leaves.thUsed'), t('hr.leaves.thRemaining'), t('hr.leaves.thYear')];
    const rows = allBalances.map(b => {
      const emp = employees.find(e => e.id === b.employeeId);
      const lt = allTypes.find(l => l.id === b.leaveTypeId);
      const remaining = b.entitledDays + b.carriedOverDays - b.usedDays;
      return [
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        lt?.name || '',
        b.entitledDays,
        b.carriedOverDays,
        b.usedDays,
        remaining,
        b.year,
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-balances-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateLeaveTypesCSV = () => {
    const headers = [t('hr.leaves.thLeaveTypeName'), t('hr.leaves.thCode'), t('hr.leaves.thMaxDaysPerYear'), t('hr.leaves.thCompensation'), t('hr.leaves.thCarryOver'), t('hr.leaves.thStatus')];
    const rows = allTypes.map(lt => [
      lt.name,
      lt.code,
      lt.maxDaysPerYear,
      lt.isPaid ? 'Paid' : 'Unpaid',
      lt.carryForward ? 'Yes' : 'No',
      lt.status,
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-types-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateHolidaysCSV = () => {
    const headers = [t('hr.leaves.holidayName'), t('hr.leaves.holidayDate'), t('hr.leaves.holidayType'), t('hr.leaves.paidHoliday'), t('hr.leaves.recurringYearly')];
    const rows = allHolidays.map(h => [
      h.name,
      h.date,
      h.type,
      h.isPaid ? 'Yes' : 'No',
      h.isRecurring ? 'Yes' : 'No',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holidays-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('hr.leaves.pageTitle')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.leaves.pageDesc')}</p>
        </div>
        {/* Tab Switchers */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setLeavesSubTab('requests')}
            className={`px-4 py-2 rounded-lg transition-colors ${leavesSubTab === 'requests' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t('hr.leaves.requestsTab')}
          </button>
          <button
            onClick={() => setLeavesSubTab('balances')}
            className={`px-4 py-2 rounded-lg transition-colors ${leavesSubTab === 'balances' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t('hr.leaves.balancesTab')}
          </button>
          <button
            onClick={() => setLeavesSubTab('types')}
            className={`px-4 py-2 rounded-lg transition-colors ${leavesSubTab === 'types' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t('hr.leaves.typesTab')}
          </button>
          <button
            onClick={() => setLeavesSubTab('holidays')}
            className={`px-4 py-2 rounded-lg transition-colors ${leavesSubTab === 'holidays' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {t('hr.leaves.holidaysTab')}
          </button>
        </div>

      </div>

      {/* SECTION 1: LEAVE REQUESTS */}
      {leavesSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Create Request & Rejection Notes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Submit on behalf */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.submitRequest')}</h3>
              <form onSubmit={requestForm.handleSubmit(handleCreateLeaveRequestForm)} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.employee')}</label>
                  <select
                    {...requestForm.register('employeeId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  >
                    <option value="">{t('hr.leaves.chooseEmployee')}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeNumber})</option>
                    ))}
                  </select>
                  {requestForm.formState.errors.employeeId && <p className="text-red-500">{requestForm.formState.errors.employeeId.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.leaveType')}</label>
                  <select
                    {...requestForm.register('leaveTypeId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  >
                    <option value="">{t('hr.leaves.chooseLeaveType')}</option>
                    {formLeaveTypes.filter(lt => lt.status === 'ACTIVE').map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                    ))}
                  </select>
                  {requestForm.formState.errors.leaveTypeId && <p className="text-red-500">{requestForm.formState.errors.leaveTypeId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.startDate')}</label>
                    <input
                      type="date"
                      {...requestForm.register('startDate')}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                    />
                    {requestForm.formState.errors.startDate && <p className="text-red-500">{requestForm.formState.errors.startDate.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.endDate')}</label>
                    <input
                      type="date"
                      {...requestForm.register('endDate')}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                    />
                    {requestForm.formState.errors.endDate && <p className="text-red-500">{requestForm.formState.errors.endDate.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.reasonNotes')}</label>
                  <textarea
                    {...requestForm.register('reason')}
                    placeholder={t('hr.leaves.reasonPlaceholder')}
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800"
                >
                  {t('hr.leaves.submitBtn')}
                </button>
              </form>
            </div>

            {/* Action Notes (Rejection notes) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.actionRejectionNotes')}</h3>
              <p className="text-slate-500 text-xs">{t('hr.leaves.rejectionHint')}</p>
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.rejectionReason')}</label>
                <input
                  type="text"
                  placeholder={t('hr.leaves.rejectionPlaceholder')}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-xs outline-none bg-slate-50 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${reqPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.requestsLog')}</h3>
                <p className="text-slate-500 text-xs mt-1">{t('hr.leaves.requestsLogDesc')}</p>
              </div>
              <button onClick={generateLeaveRequestsCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
                <Download className="h-3 w-3" />
                <span>{t('exportCSV')}</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">{t('hr.leaves.thEmployee')}</th>
                    <th className="p-4">{t('hr.leaves.thLeaveType')}</th>
                    <th className="p-4">{t('hr.leaves.thDuration')}</th>
                    <th className="p-4">{t('hr.leaves.thReason')}</th>
                    <th className="p-4">{t('hr.leaves.thStatus')}</th>
                    <th className="p-4">{t('hr.leaves.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {requestsLoading
                    ? renderLoading(6)
                    : requests.length === 0
                    ? renderEmpty(t('hr.leaves.noRequests'), 6)
                    : requests.map(req => {
                        const emp = employees.find(e => e.id === req.employeeId);
                        const lt = formLeaveTypes.find(t => t.id === req.leaveTypeId);
                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                            <td className="p-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                            <td className="p-4 font-bold">{lt ? lt.name : t('common.unknown')}</td>
                            <td className="p-4 whitespace-nowrap">{dbDateStr(req.startDate)} {t('hr.leaves.to')} {dbDateStr(req.endDate)} ({t('hr.leaves.daysUnit', { days: req.totalDays })})</td>
                            <td className="p-4 text-slate-500 truncate max-w-xs">{req.reason || '-'}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 dark:bg-amber-950/30 dark:text-amber-400' :
                                req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 dark:bg-green-950/30 dark:text-green-400' :
                                req.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 dark:bg-red-950/30 dark:text-red-400' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {t('hr.leaves.' + req.status.toLowerCase())}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                {req.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleLeaveDecision(req.id, 'APPROVED')}
                                      className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1 font-bold text-[10px]"
                                    >
                                      {t('hr.leaves.approve')}
                                    </button>
                                    <button
                                      onClick={() => handleLeaveDecision(req.id, 'REJECTED')}
                                      className="bg-rose-600 hover:bg-rose-500 text-white rounded px-2 py-1 font-bold text-[10px]"
                                    >
                                      {t('hr.leaves.reject')}
                                    </button>
                                  </>
                                )}
                                {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                                  <button
                                    onClick={() => handleCancelLeaveRequest(req.id)}
                                    className="text-slate-500 hover:text-slate-700 hover:underline text-[10px] font-bold px-1 py-1"
                                  >
                                    {t('common.cancel')}
                                  </button>
                                )}
                                {req.status !== 'PENDING' && req.status !== 'APPROVED' && (
                                  <span className="text-slate-400 font-semibold italic text-[11px]">{t('hr.leaves.resolved')}</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
            <Pagination currentPage={leaveRequestsPage} totalItems={requestsTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setLeaveRequestsPage} idPrefix="leave-reqs" />
          </div>
        </div>
      )}

      {/* SECTION 2: LEAVE BALANCES */}
      {leavesSubTab === 'balances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Balance Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.assignBalance')}</h3>
              <form onSubmit={balanceForm.handleSubmit(handleCreateLeaveBalanceForm)} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.employee')}</label>
                  <select
                    {...balanceForm.register('employeeId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  >
                    <option value="">{t('hr.leaves.selectEmployee')}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                    ))}
                  </select>
                  {balanceForm.formState.errors.employeeId && <p className="text-red-500">{balanceForm.formState.errors.employeeId.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.leaveType')}</label>
                  <select
                    {...balanceForm.register('leaveTypeId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  >
                    <option value="">{t('hr.leaves.selectLeaveType')}</option>
                    {formLeaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                    ))}
                  </select>
                  {balanceForm.formState.errors.leaveTypeId && <p className="text-red-500">{balanceForm.formState.errors.leaveTypeId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.entitledDays')}</label>
                    <input
                      type="number"
                      min="0"
                      {...balanceForm.register('entitledDays', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                    />
                    {balanceForm.formState.errors.entitledDays && <p className="text-red-500">{balanceForm.formState.errors.entitledDays.message}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.carriedOver')}</label>
                    <input
                      type="number"
                      min="0"
                      {...balanceForm.register('carriedOverDays', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                    />
                    {balanceForm.formState.errors.carriedOverDays && <p className="text-red-500">{balanceForm.formState.errors.carriedOverDays.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.calendarYear')}</label>
                  <input
                    type="number"
                    {...balanceForm.register('year', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  />
                  {balanceForm.formState.errors.year && <p className="text-red-500">{balanceForm.formState.errors.year.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800"
                >
                  {t('hr.leaves.createBalance')}
                </button>
              </form>
            </div>

            {/* Adjust / Edit Balance Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.adjustBalance')}</h3>
              {editingLbId ? (
                (() => {
                  const lb = balances.find(b => b.id === editingLbId);
                  const emp = lb ? employees.find(e => e.id === lb.employeeId) : null;
                  const ltObj = lb ? formLeaveTypes.find(t => t.id === lb.leaveTypeId) : null;

                  return (
                    <form onSubmit={editBalanceForm.handleSubmit(handleUpdateLeaveBalanceForm)} className="space-y-4 pt-2 text-xs">
                      <p className="font-bold text-slate-700 bg-slate-50 p-3 rounded-lg">
                        {t('hr.leaves.adjusting', { emp: emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown'), type: ltObj ? ltObj.name : t('common.unknown'), year: lb?.year })}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.newEntitledDays')}</label>
                          <input
                            type="number"
                            min="0"
                            {...editBalanceForm.register('entitledDays', { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.newCarriedOverDays')}</label>
                          <input
                            type="number"
                            min="0"
                            {...editBalanceForm.register('carriedOverDays', { valueAsNumber: true })}
                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          type="submit"
                          className="bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold px-4 py-2"
                        >
                          {t('hr.leaves.saveAdjustments')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingLbId(null)}
                          className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold px-4 py-2"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  );
                })()
              ) : (
                <div className="flex items-center justify-center h-48 border border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs">
                  {t('hr.leaves.selectAdjust')}
                </div>
              )}
            </div>
          </div>

          {/* Balances Table */}
          <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${balPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.activeBalances')}</h3>
                <p className="text-slate-500 text-xs mt-1">{t('hr.leaves.balancesDesc')}</p>
              </div>
              <button onClick={generateLeaveBalancesCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
                <Download className="h-3 w-3" />
                <span>{t('exportCSV')}</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">{t('hr.leaves.thEmployee')}</th>
                    <th className="p-4">{t('hr.leaves.thLeaveType')}</th>
                    <th className="p-4">{t('hr.leaves.thEntitled')}</th>
                    <th className="p-4">{t('hr.leaves.thCarriedOver')}</th>
                    <th className="p-4">{t('hr.leaves.thUsed')}</th>
                    <th className="p-4">{t('hr.leaves.thRemaining')}</th>
                    <th className="p-4">{t('hr.leaves.thYear')}</th>
                    <th className="p-4">{t('hr.leaves.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {balancesLoading
                    ? renderLoading(8)
                    : balances.length === 0
                    ? renderEmpty(t('hr.leaves.noBalances'), 8)
                    : balances.map(b => {
                        const emp = employees.find(e => e.id === b.employeeId);
                        const lt = formLeaveTypes.find(t => t.id === b.leaveTypeId);
                        const remaining = Math.max(0, Number(b.entitledDays) + Number(b.carriedOverDays) - Number(b.usedDays));
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                            <td className="p-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                            <td className="p-4 font-bold text-blue-600">{lt ? lt.name : t('common.unknown')}</td>
                            <td className="p-4 font-mono font-bold">{t('hr.leaves.daysUnit', { days: b.entitledDays })}</td>
                            <td className="p-4 font-mono">{t('hr.leaves.daysUnit', { days: b.carriedOverDays })}</td>
                            <td className="p-4 font-mono text-rose-600">{t('hr.leaves.daysUnit', { days: b.usedDays })}</td>
                            <td className="p-4 font-mono font-extrabold text-emerald-600 bg-emerald-50/20">{t('hr.leaves.daysUnit', { days: remaining })}</td>
                            <td className="p-4 font-semibold">{b.year}</td>
                            <td className="p-4">
                              <button
                                onClick={() => {
                                  setEditingLbId(b.id);
                                  setEditLbEntitledDays(b.entitledDays);
                                  setEditLbCarriedOverDays(b.carriedOverDays);
                                }}
                                className="text-sky-600 hover:text-sky-500 hover:underline font-bold text-xs"
                              >
                                {t('hr.leaves.adjustBtn')}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
            <Pagination currentPage={leaveBalancesPage} totalItems={balancesTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setLeaveBalancesPage} idPrefix="leave-bals" />
          </div>
        </div>
      )}

      {/* SECTION 3: LEAVE TYPES */}
      {leavesSubTab === 'types' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Leave Type Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.createLeaveType')}</h3>
              <form onSubmit={typeForm.handleSubmit(handleCreateLeaveTypeForm)} className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.leaveTypeName')}</label>
                  <input
                    type="text"
                    placeholder={t('hr.leaves.leaveTypeNamePlaceholder')}
                    {...typeForm.register('name')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  />
                  {typeForm.formState.errors.name && <p className="text-red-500">{typeForm.formState.errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.uniqueCode')}</label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder={t('hr.leaves.codePlaceholder')}
                    {...typeForm.register('code')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 uppercase"
                  />
                  {typeForm.formState.errors.code && <p className="text-red-500">{typeForm.formState.errors.code.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.maxDays')}</label>
                  <input
                    type="number"
                    min="1"
                    {...typeForm.register('maxDaysPerYear', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  />
                  {typeForm.formState.errors.maxDaysPerYear && <p className="text-red-500">{typeForm.formState.errors.maxDaysPerYear.message}</p>}
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.description')}</label>
                  <textarea
                    placeholder={t('hr.leaves.descPlaceholder')}
                    {...typeForm.register('description')}
                    rows={2}
                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                  />
                </div>

                <div className="flex flex-col space-y-2 pt-1">
                  <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      {...typeForm.register('isPaid')}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t('hr.leaves.paidLeaveType')}</span>
                  </label>

                  <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      {...typeForm.register('carryForward')}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t('hr.leaves.carryForward')}</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800"
                >
                  {t('hr.leaves.publishLeaveType')}
                </button>
              </form>
            </div>

            {/* Edit Leave Type Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.editLeaveType')}</h3>
              {editingLtId ? (
                <form onSubmit={editTypeForm.handleSubmit((data) => handleUpdateLeaveTypeForm({ ...data, status: editLtStatus }))} className="space-y-4 pt-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.leaveTypeName')}</label>
                      <input
                        type="text"
                        {...editTypeForm.register('name')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {editTypeForm.formState.errors.name && <p className="text-red-500">{editTypeForm.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.uniqueCode')}</label>
                      <input
                        type="text"
                        maxLength={3}
                        {...editTypeForm.register('code')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 uppercase"
                      />
                      {editTypeForm.formState.errors.code && <p className="text-red-500">{editTypeForm.formState.errors.code.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.maxDays')}</label>
                      <input
                        type="number"
                        min="1"
                        {...editTypeForm.register('maxDaysPerYear', { valueAsNumber: true })}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {editTypeForm.formState.errors.maxDaysPerYear && <p className="text-red-500">{editTypeForm.formState.errors.maxDaysPerYear.message}</p>}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.status')}</label>
                      <select
                        value={editLtStatus}
                        onChange={(e) => setEditLtStatus(e.target.value as any)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 font-bold text-slate-700"
                      >
                        <option value="ACTIVE">{t('hr.leaves.activeEnabled')}</option>
                        <option value="INACTIVE">{t('hr.leaves.inactiveDeactivated')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.description')}</label>
                    <textarea
                      {...editTypeForm.register('description')}
                      rows={2}
                      className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                    />
                  </div>

                  <div className="flex space-x-6 pt-1">
                    <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        {...editTypeForm.register('isPaid')}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{t('hr.leaves.paidLeaveType')}</span>
                    </label>

                    <label className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        {...editTypeForm.register('carryForward')}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{t('hr.leaves.carryForward')}</span>
                    </label>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold px-4 py-2"
                    >
                      {t('hr.leaves.saveChanges')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLtId(null)}
                      className="border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-semibold px-4 py-2"
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-center h-48 border border-dashed border-slate-200 rounded-2xl text-slate-400 italic text-xs">
                  {t('hr.leaves.selectEdit')}
                </div>
              )}
            </div>
          </div>

          {/* Types Table */}
          <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${typesPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.systemLeaveTypes')}</h3>
                <p className="text-slate-500 text-xs mt-1">{t('hr.leaves.typesDesc')}</p>
              </div>
              <button onClick={generateLeaveTypesCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
                <Download className="h-3 w-3" />
                <span>{t('exportCSV')}</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">{t('hr.leaves.thLeaveTypeName')}</th>
                    <th className="p-4">{t('hr.leaves.thCode')}</th>
                    <th className="p-4">{t('hr.leaves.thMaxDaysPerYear')}</th>
                    <th className="p-4">{t('hr.leaves.thCompensation')}</th>
                    <th className="p-4">{t('hr.leaves.thCarryOver')}</th>
                    <th className="p-4">{t('hr.leaves.thStatus')}</th>
                    <th className="p-4">{t('hr.leaves.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {typesLoading
                    ? renderLoading(7)
                    : types.length === 0
                    ? renderEmpty(t('hr.leaves.noTypes'), 7)
                    : types.map(lt => (
                        <tr key={lt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            {lt.name}
                            {lt.description && <p className="text-[10px] font-medium text-slate-400 mt-0.5">{lt.description}</p>}
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500">{lt.code}</td>
                          <td className="p-4 font-semibold font-mono">{t('hr.leaves.daysUnit', { days: lt.maxDaysPerYear })}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${lt.isPaid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 dark:bg-rose-950/30 dark:text-rose-400'}`}>
                              {lt.isPaid ? t('hr.leaves.paid') : t('hr.leaves.unpaid')}
                            </span>
                          </td>
                          <td className="p-4 font-semibold">
                            {lt.carryForward ? t('hr.leaves.allowed') : t('hr.leaves.no')}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${lt.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {lt.status === 'ACTIVE' ? t('hr.leaves.activeEnabled') : t('hr.leaves.inactiveDisabled')}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-3 items-center">
                              <button
                                onClick={() => {
                                  setEditingLtId(lt.id);
                                  setEditLtName(lt.name);
                                  setEditLtCode(lt.code);
                                  setEditLtDesc(lt.description || '');
                                  setEditLtIsPaid(lt.isPaid);
                                  setEditLtCarryForward(lt.carryForward);
                                  setEditLtMaxDays(lt.maxDaysPerYear);
                                  setEditLtStatus(lt.status);
                                }}
                                className="text-sky-600 hover:text-sky-500 hover:scale-110 transition-transform"
                                title={t('hr.leaves.tooltipEdit')}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleLeaveTypeStatus(lt.id, lt.status)}
                                className="text-slate-600 hover:text-slate-900 hover:scale-110 transition-transform"
                                title={t('hr.leaves.tooltipToggleStatus')}
                              >
                                <Activity className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLeaveType(lt.id)}
                                className="text-rose-600 hover:text-rose-700 hover:scale-110 transition-transform"
                                title={t('hr.leaves.tooltipDelete')}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
            <Pagination currentPage={leaveTypesPage} totalItems={typesTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setLeaveTypesPage} idPrefix="leave-types" />
          </div>
        </div>
      )}

      {leavesSubTab === 'holidays' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add/Edit Holiday Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {editingHolidayId ? t('hr.leaves.editHoliday') : t('hr.leaves.createHoliday')}
              </h3>
              <form onSubmit={editingHolidayId ? editHolidayForm.handleSubmit(handleUpdateHolidayForm) : holidayForm.handleSubmit(handleCreateHolidayForm)} className="space-y-3 pt-2 text-xs">
                {editingHolidayId ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayName')}</label>
                      <input
                        type="text"
                        placeholder={t('hr.leaves.holidayNamePlaceholder')}
                        {...editHolidayForm.register('name')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {editHolidayForm.formState.errors.name && <p className="text-red-500">{editHolidayForm.formState.errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayDate')}</label>
                      <input
                        type="date"
                        {...editHolidayForm.register('date')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {editHolidayForm.formState.errors.date && <p className="text-red-500">{editHolidayForm.formState.errors.date.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayType')}</label>
                      <select
                        {...editHolidayForm.register('type')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      >
                        <option value="PUBLIC">{t('hr.leaves.public')}</option>
                        <option value="COMPANY">{t('hr.leaves.company')}</option>
                        <option value="REGIONAL">{t('hr.leaves.regional')}</option>
                        <option value="RELIGIOUS">{t('hr.leaves.religious')}</option>
                        <option value="SPECIAL">{t('hr.leaves.special')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.briefDesc')}</label>
                      <textarea
                        placeholder={t('hr.leaves.descPlaceholder2')}
                        rows={3}
                        {...editHolidayForm.register('description')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-600 text-[10px] uppercase">
                        <input
                          type="checkbox"
                          {...editHolidayForm.register('isPaid')}
                          className="rounded border-slate-200 text-blue-600"
                        />
                        <span>{t('hr.leaves.paidHoliday')}</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-600 text-[10px] uppercase">
                        <input
                          type="checkbox"
                          {...editHolidayForm.register('isRecurring')}
                          className="rounded border-slate-200 text-blue-600"
                        />
                        <span>{t('hr.leaves.recurringYearly')}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.activeStatus')}</label>
                      <select
                        {...editHolidayForm.register('status')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      >
                        <option value="ACTIVE">{t('hr.leaves.activeObservable')}</option>
                        <option value="INACTIVE">{t('hr.leaves.inactiveDisabled')}</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayName')}</label>
                      <input
                        type="text"
                        placeholder={t('hr.leaves.holidayNamePlaceholder')}
                        {...holidayForm.register('name')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {holidayForm.formState.errors.name && <p className="text-red-500">{holidayForm.formState.errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayDate')}</label>
                      <input
                        type="date"
                        {...holidayForm.register('date')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      />
                      {holidayForm.formState.errors.date && <p className="text-red-500">{holidayForm.formState.errors.date.message}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.holidayType')}</label>
                      <select
                        {...holidayForm.register('type')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      >
                        <option value="PUBLIC">{t('hr.leaves.public')}</option>
                        <option value="COMPANY">{t('hr.leaves.company')}</option>
                        <option value="REGIONAL">{t('hr.leaves.regional')}</option>
                        <option value="RELIGIOUS">{t('hr.leaves.religious')}</option>
                        <option value="SPECIAL">{t('hr.leaves.special')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.briefDesc')}</label>
                      <textarea
                        placeholder={t('hr.leaves.descPlaceholder2')}
                        rows={3}
                        {...holidayForm.register('description')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-600 text-[10px] uppercase">
                        <input
                          type="checkbox"
                          {...holidayForm.register('isPaid')}
                          className="rounded border-slate-200 text-blue-600"
                        />
                        <span>{t('hr.leaves.paidHoliday')}</span>
                      </label>

                      <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-600 text-[10px] uppercase">
                        <input
                          type="checkbox"
                          {...holidayForm.register('isRecurring')}
                          className="rounded border-slate-200 text-blue-600"
                        />
                        <span>{t('hr.leaves.recurringYearly')}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.leaves.activeStatus')}</label>
                      <select
                        {...holidayForm.register('status')}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3"
                      >
                        <option value="ACTIVE">{t('hr.leaves.activeObservable')}</option>
                        <option value="INACTIVE">{t('hr.leaves.inactiveDisabled')}</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800 transition-all hover:scale-[1.02]"
                  >
                    {editingHolidayId ? t('hr.leaves.updateHoliday') : t('hr.leaves.createHolidayBtn')}
                  </button>
                  {editingHolidayId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingHolidayId(null);
                        setHolidayName('');
                        setHolidayDate('');
                        setHolidayType('PUBLIC');
                        setHolidayDescription('');
                        setHolidayIsPaid(true);
                        setHolidayIsRecurring(true);
                        setHolidayStatus('ACTIVE');
                      }}
                      className="border border-slate-200 text-slate-500 rounded-lg text-xs px-3 font-semibold hover:bg-slate-50 transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Holidays List Table */}
            <div className={`lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between transition-opacity ${holsPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.leaves.holidayName')} {t('hr.leaves.holidaysTab')}</h3>
                <button onClick={generateHolidaysCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
                  <Download className="h-3 w-3" />
                  <span>{t('exportCSV')}</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">{t('hr.leaves.holidayNameCol')}</th>
                      <th className="p-4">{t('hr.leaves.dateCol')}</th>
                      <th className="p-4">{t('hr.leaves.typeCol')}</th>
                      <th className="p-4">{t('hr.leaves.paidRecur')}</th>
                      <th className="p-4">{t('hr.leaves.thStatus')}</th>
                      <th className="py-3.5 px-6 text-right">{t('hr.leaves.thActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {holsLoading
                      ? renderLoading(6)
                      : hols.length === 0
                      ? renderEmpty(t('hr.leaves.noHolidays'), 6)
                      : hols.map(h => (
                          <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                            <td className="p-4 font-bold text-slate-800">
                              {h.name}
                              {h.description && (
                                <p className="text-[10px] font-normal text-slate-400 mt-0.5">{h.description}</p>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-slate-600">
                              {dbDateStr(h.date)}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                h.type === 'PUBLIC' ? 'bg-indigo-50 text-indigo-700' :
                                h.type === 'COMPANY' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' :
                                h.type === 'RELIGIOUS' ? 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300' :
                                'bg-slate-50 text-slate-700'
                              }`}>
                                {h.type}
                              </span>
                            </td>
                            <td className="p-4 space-y-1">
                              <div className="flex gap-1.5 items-center">
                                <span className={`text-[10px] font-bold uppercase ${h.isPaid ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {h.isPaid ? t('hr.leaves.paid') : t('hr.leaves.unpaid')}
                                </span>
                                <span className="text-slate-300">&bull;</span>
                                <span className={`text-[10px] font-bold uppercase ${h.isRecurring ? 'text-blue-600' : 'text-slate-400'}`}>
                                  {h.isRecurring ? t('hr.leaves.annual') : t('hr.leaves.oneTime')}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                h.status === 'ACTIVE' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                              }`}>
                                {h.status === 'ACTIVE' ? t('hr.leaves.activeEnabled') : t('hr.leaves.inactiveDisabled')}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingHolidayId(h.id);
                                    setHolidayName(h.name);
                                    setHolidayDate(h.date?.split('T')[0] || h.date);
                                    setHolidayType(h.type);
                                    setHolidayDescription(h.description || '');
                                    setHolidayIsPaid(h.isPaid);
                                    setHolidayIsRecurring(h.isRecurring);
                                    setHolidayStatus(h.status);
                                  }}
                                  className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors"
                                  title={t('hr.leaves.tooltipEditHoliday')}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleHolidayStatus(h.id, h.status)}
                                  className="text-slate-600 hover:text-slate-900 p-1 rounded hover:bg-slate-100 transition-colors"
                                  title={t('hr.leaves.tooltipToggleStatus')}
                                >
                                  <Activity className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHoliday(h.id)}
                                  className="text-rose-600 hover:text-rose-700 p-1 rounded hover:bg-rose-50 transition-colors"
                                  title={t('hr.leaves.tooltipDeleteHoliday')}
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={holidaysPage} totalItems={holsTotal} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setHolidaysPage} idPrefix="holidays" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
