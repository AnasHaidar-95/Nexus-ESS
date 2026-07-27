import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, XCircle, Download } from 'lucide-react';
import Pagination from '../Pagination';
import { payrollPeriodApi } from '../../../lib/payroll-periods';
import { payrollApi } from '../../../lib/payroll';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { PayrollPeriodStatus } from '../../../types';
import { usePayrollPeriods } from '../../../hooks/queries/usePayroll';
import {
  payrollPeriodSchema,
  payrollPeriodEditSchema,
  type PayrollPeriodFormData,
  type PayrollPeriodEditFormData,
} from '../../../lib/formSchemas';

interface PayrollPeriodsTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  PAYROLL_PROFILES_PER_PAGE: number;
  fmtDT: (v: string) => string;
  selectedPeriodId: string;
  setSelectedPeriodId: (v: string) => void;
  setPayrollSubTab: (v: string) => void;
}

export default function PayrollPeriodsTab({
  page,
  setPage,
  PAYROLL_PROFILES_PER_PAGE,
  fmtDT,
  setSelectedPeriodId,
  setPayrollSubTab,
}: PayrollPeriodsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [editPeriodName, setEditPeriodName] = useState('');
  const [editPeriodStart, setEditPeriodStart] = useState('');
  const [editPeriodEnd, setEditPeriodEnd] = useState('');
  const [editPeriodPayDate, setEditPeriodPayDate] = useState('');
  const [editPeriodStatus, setEditPeriodStatus] = useState<PayrollPeriodStatus>('DRAFT');

  const { data: periodRes, isLoading: periodLoading, isPlaceholderData: periodPlaceholder } = usePayrollPeriods({ page, pageSize: PAYROLL_PROFILES_PER_PAGE });
  const periodItems = periodRes?.items || [];
  const periodTotalPages = periodRes?.pagination?.totalPages || 1;

  const { data: allPeriodsRes } = usePayrollPeriods({ pageSize: 500 });
  const allPeriodItems = allPeriodsRes?.items || [];

  // --- Handlers ---

  const handleCreatePayrollPeriodForm = async (data: PayrollPeriodFormData) => {
    try {
      await payrollPeriodApi.create({ name: data.name, startDate: data.startDate, endDate: data.endDate, payDate: data.payDate || data.endDate });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to create payroll period.', 'error');
      return;
    }
    showToast('Profile Created', 'Payroll profile created successfully.', 'success');
  };

  const handleUpdatePayrollPeriodForm = async (data: PayrollPeriodEditFormData) => {
    if (!editingPeriodId) return;
    try {
      await payrollPeriodApi.update(editingPeriodId, { name: data.name, payDate: data.payDate });

      if (data.status !== editPeriodStatus) {
        const target = data.status;
        const current = editPeriodStatus;
        if (target === 'OPEN' && current === 'DRAFT') await payrollPeriodApi.open(editingPeriodId);
        else if (target === 'OPEN' && current === 'LOCKED') await payrollPeriodApi.reopen(editingPeriodId);
        else if (target === 'CLOSED') await payrollPeriodApi.close(editingPeriodId);
        else if (target === 'LOCKED') await payrollPeriodApi.lock(editingPeriodId);
        else if (target === 'CANCELLED') await payrollPeriodApi.cancel(editingPeriodId);
      }
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Updated', 'Payroll profile updated successfully.', 'success');
    setEditingPeriodId(null);
  };

  const handleDeletePayrollPeriod = async (id: string) => {
    try {
      await payrollPeriodApi.hardDelete(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Deleted', 'Payroll profile has been permanently deleted.', 'info');
  };

  const handleCancelPayrollPeriod = async (id: string) => {
    try {
      await payrollPeriodApi.cancel(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Cancelled', 'Payroll profile has been cancelled.', 'info');
  };

  const handleGeneratePayroll = async (periodId: string) => {
    const period = allPeriodItems.find(p => p.id === periodId) || periodItems.find(p => p.id === periodId);
    if (!period) { showToast('Error', 'Period not found.', 'error'); return; }
    if (period.status === 'LOCKED') {
      showToast('Validation Error', 'This period is locked and finalized.', 'error');
      return;
    }
    try {
      await payrollApi.generate({ payrollPeriodId: periodId });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to generate payroll.', 'error');
      return;
    }
    showToast('Wages Compiled Successfully', 'Calculated wages and generated payslip items for active employees.', 'success');
  };

  const handleFinalizePayroll = async (periodId: string) => {
    const period = allPeriodItems.find(p => p.id === periodId) || periodItems.find(p => p.id === periodId);
    if (!period) return;
    try {
      await payrollPeriodApi.approve(periodId);
      await payrollPeriodApi.finalize(periodId);
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to finalize payroll.', 'error');
      return;
    }
    showToast('Payroll Finalized', 'Payroll finalized and locked. Bank transfer instructions dispatched.', 'success');
  };

  // --- Forms ---

  const periodCreateForm = useForm<PayrollPeriodFormData>({
    resolver: zodResolver(payrollPeriodSchema),
    defaultValues: { name: '', startDate: '', endDate: '', payDate: '' },
  });

  const periodEditForm = useForm<PayrollPeriodEditFormData>({
    resolver: zodResolver(payrollPeriodEditSchema),
    values: editingPeriodId
      ? {
          name: editPeriodName || '',
          startDate: editPeriodStart || '',
          endDate: editPeriodEnd || '',
          payDate: editPeriodPayDate || '',
          status: (editPeriodStatus as any) || 'DRAFT',
        }
      : undefined,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {editingPeriodId ? t('hr.payroll.editPeriod') : t('hr.payroll.createPeriod')}
        </h3>
        {editingPeriodId ? (
          <form
            onSubmit={periodEditForm.handleSubmit(async (data) => {
                await handleUpdatePayrollPeriodForm(data);
               periodEditForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.profileName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.profileNamePlaceholder')}
                {...periodEditForm.register('name')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
              />
              {periodEditForm.formState.errors.name && <p className="text-[10px] text-red-500 mt-1">{periodEditForm.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.startDate')}</label>
                <input
                  type="date"
                  {...periodEditForm.register('startDate')}
                  disabled
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {periodEditForm.formState.errors.startDate && <p className="text-[10px] text-red-500 mt-1">{periodEditForm.formState.errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.endDate')}</label>
                <input
                  type="date"
                  {...periodEditForm.register('endDate')}
                  disabled
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {periodEditForm.formState.errors.endDate && <p className="text-[10px] text-red-500 mt-1">{periodEditForm.formState.errors.endDate.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.payDateLabel')}</label>
              <input
                type="date"
                {...periodEditForm.register('payDate')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
              />
              {periodEditForm.formState.errors.payDate && <p className="text-[10px] text-red-500 mt-1">{periodEditForm.formState.errors.payDate.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.status')}</label>
              <select
                {...periodEditForm.register('status')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="DRAFT">{t('hr.payroll.statusDraft')}</option>
                <option value="OPEN">{t('hr.payroll.statusOpen')}</option>
                <option value="PROCESSING">{t('hr.payroll.statusProcessing')}</option>
                <option value="CLOSED">{t('hr.payroll.statusClosed')}</option>
                <option value="LOCKED">{t('hr.payroll.statusLocked')}</option>
                <option value="CANCELLED">{t('hr.payroll.statusCancelled')}</option>
              </select>
              {periodEditForm.formState.errors.status && <p className="text-[10px] text-red-500 mt-1">{periodEditForm.formState.errors.status.message}</p>}
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.updateProfile')}
              </button>
              <button
                type="button"
                onClick={() => { setEditingPeriodId(null); periodEditForm.reset(); }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-300 rounded-lg text-xs font-semibold py-2 px-3"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={periodCreateForm.handleSubmit(async (data) => {
               await handleCreatePayrollPeriodForm(data);
               periodCreateForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.profileName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.profileNamePlaceholder')}
                {...periodCreateForm.register('name')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
              />
              {periodCreateForm.formState.errors.name && <p className="text-[10px] text-red-500 mt-1">{periodCreateForm.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.startDate')}</label>
                <input
                  type="date"
                  {...periodCreateForm.register('startDate')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                />
                {periodCreateForm.formState.errors.startDate && <p className="text-[10px] text-red-500 mt-1">{periodCreateForm.formState.errors.startDate.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.endDate')}</label>
                <input
                  type="date"
                  {...periodCreateForm.register('endDate')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                />
                {periodCreateForm.formState.errors.endDate && <p className="text-[10px] text-red-500 mt-1">{periodCreateForm.formState.errors.endDate.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.payDateLabel')}</label>
              <input
                type="date"
                {...periodCreateForm.register('payDate')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
              />
              {periodCreateForm.formState.errors.payDate && <p className="text-[10px] text-red-500 mt-1">{periodCreateForm.formState.errors.payDate.message}</p>}
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.createProfile')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Column: List of Periods */}
      <div className={`lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transition-opacity ${periodPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.activeProfiles')}</h3>
          <button onClick={() => {
            const headers = ['Name', 'Start Date', 'End Date', 'Pay Date', 'Status'];
            const rows = allPeriodItems.map(p => [p.name, p.startDate, p.endDate, p.payDate, p.status]);
            const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `payroll-periods-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
            window.URL.revokeObjectURL(url);
          }} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
            <Download className="h-3 w-3" />
            <span>{t('exportCSV')}</span>
          </button>
        </div>
        <div className="space-y-4 pt-2">
          {periodLoading ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-8 font-bold">{t('hr.payroll.loadingProfiles')}</p>
          ) : periodItems.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('hr.payroll.noProfiles')}</p>
          ) : periodItems.map((per) => (
              <div
                key={per.id}
                className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-850/30 transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs gap-3"
              >
                <div className="space-y-1">
                  <p className="font-bold text-slate-850 dark:text-white text-sm">{per.name}</p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {t('hr.payroll.range', { start: fmtDT(per.startDate), end: fmtDT(per.endDate), payDate: fmtDT(per.payDate) })}
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      per.status === 'LOCKED'
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30'
                        : per.status === 'OPEN'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30'
                    }`}
                  >
                    {t('hr.payroll.' + per.status.toLowerCase())}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 self-start sm:self-center justify-end">
                  {per.status === 'DRAFT' && (
                      <button
                       onClick={async () => { await handleGeneratePayroll(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); setSelectedPeriodId(per.id); setPayrollSubTab('runs'); }}
                       className="bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1.5 rounded font-bold text-[10px]"
                     >
                       {t('hr.payroll.compileWages')}
                     </button>
                  )}
                  {per.status === 'OPEN' && (
                      <button
                        onClick={async () => { await handleFinalizePayroll(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded font-bold text-[10px]"
                      >
                        {t('hr.payroll.finalizeDisburse')}
                      </button>
                  )}
                  {per.status !== 'LOCKED' && (
                    <button
                      onClick={() => {
                        setEditingPeriodId(per.id);
                        setEditPeriodName(per.name);
                        setEditPeriodStart(per.startDate ? per.startDate.split('T')[0] : '');
                        setEditPeriodEnd(per.endDate ? per.endDate.split('T')[0] : '');
                        setEditPeriodPayDate(per.payDate ? per.payDate.split('T')[0] : '');
                        setEditPeriodStatus(per.status);
                      }}
                      className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded transition-transform hover:scale-110"
                      title={t('hr.payroll.editProfileBtn')}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {per.status !== 'LOCKED' && per.status !== 'CANCELLED' && (
                    <button
                       onClick={() => { handleCancelPayrollPeriod(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); }}
                      className="bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-white p-2 rounded transition-transform hover:scale-110"
                      title={t('hr.payroll.cancelProfile')}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {per.status !== 'LOCKED' && (
                    <button
                      onClick={() => {
                      
                          handleDeletePayrollPeriod(per.id);
                          queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] });

                      }}
                      className="bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white p-2 rounded transition-transform hover:scale-110"
                      title={t('hr.payroll.deleteProfile')}
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </div>
        <Pagination currentPage={page} totalItems={periodTotalPages * PAYROLL_PROFILES_PER_PAGE} itemsPerPage={PAYROLL_PROFILES_PER_PAGE} onPageChange={setPage} idPrefix="payroll" />
      </div>
    </div>
  );
}
