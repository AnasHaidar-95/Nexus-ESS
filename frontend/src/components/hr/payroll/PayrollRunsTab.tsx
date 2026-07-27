import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, XCircle, Download } from 'lucide-react';
import { payrollPeriodApi } from '../../../lib/payroll-periods';
import { payrollDisbursementApi } from '../../../lib/payroll-disbursements';
import { payrollApi } from '../../../lib/payroll';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { PayrollPeriodStatus } from '../../../types';
import { useEmployees } from '../../../hooks/queries/useEmployees';
import { usePayrollPeriods, usePayrollDisbursements } from '../../../hooks/queries/usePayroll';
import {
  disbursementEditSchema,
  type DisbursementEditFormData,
} from '../../../lib/formSchemas';

interface PayrollRunsTabProps {
  page: number;
  setPage: (v: number | ((prev: number) => number)) => void;
  ITEMS_PER_PAGE: number;
  fmtDT: (v: string) => string;
  selectedPeriodId: string;
  setSelectedPeriodId: (v: string) => void;
  setPayrollSubTab: (v: string) => void;
}

export default function PayrollRunsTab({
  page,
  setPage,
  selectedPeriodId,
  setSelectedPeriodId,
}: PayrollRunsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [editingDisbId, setEditingDisbId] = useState<string | null>(null);
  const [editDisbAllowance, setEditDisbAllowance] = useState(0);
  const [editDisbOvertime, setEditDisbOvertime] = useState(0);
  const [editDisbBonus, setEditDisbBonus] = useState(0);
  const [editDisbTax, setEditDisbTax] = useState(0);
  const [editDisbDeduction, setEditDisbDeduction] = useState(0);

  const { data: empRes } = useEmployees({ pageSize: 500 });
  const employees = empRes?.items || [];

  const { data: runsRes, isLoading: runsLoading, isPlaceholderData: runsPlaceholder } = usePayrollDisbursements({ page: 1, pageSize: 9999 });
  const runsItems = (runsRes?.items || []).filter((d: any) => !selectedPeriodId || d.payrollPeriodId === selectedPeriodId);

  const { data: allPeriodsRes } = usePayrollPeriods({ pageSize: 500 });
  const allPeriodItems = allPeriodsRes?.items || [];
  const periodItems = allPeriodItems;

  const handleSetPeriodStatus = async (id: string, status: PayrollPeriodStatus) => {
    try {
      if (status === 'OPEN') { await payrollPeriodApi.reopen(id); }
      else if (status === 'LOCKED') await payrollPeriodApi.lock(id);
      else if (status === 'CLOSED') await payrollPeriodApi.close(id);
      else await payrollPeriodApi.update(id, {});
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Status Updated', `Period status updated to ${status}.`, 'success');
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

  const handleCancelPayrollRun = async (periodId: string) => {
    const period = allPeriodItems.find(p => p.id === periodId) || periodItems.find(p => p.id === periodId);
    if (!period) return;
    try {
      await payrollPeriodApi.cancel(periodId);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Run Cancelled', 'The payroll run has been cancelled.', 'info');
  };

  const handleUpdateDisbursementAmountsForm = async (disbId: string, data: DisbursementEditFormData) => {
    const targetDisb = runsItems.find(d => d.id === disbId);
    if (!targetDisb) return;
    const gross = targetDisb.basicSalary + data.allowanceAmount + data.overtimeAmount + data.bonusAmount;
    const finalNet = gross - data.taxAmount - data.deductionAmount;
    try {
      await payrollDisbursementApi.update(disbId, {
        allowanceAmount: data.allowanceAmount, overtimeAmount: data.overtimeAmount,
        bonusAmount: data.bonusAmount, taxAmount: data.taxAmount,
        deductionAmount: data.deductionAmount, grossSalary: gross, netSalary: finalNet,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Wages Updated', 'Adjusted salary component amounts successfully.', 'success');
    setEditingDisbId(null);
  };

  const disbEditForm = useForm<DisbursementEditFormData>({
    resolver: zodResolver(disbursementEditSchema),
    values: editingDisbId
      ? {
          allowanceAmount: editDisbAllowance || 0,
          overtimeAmount: editDisbOvertime || 0,
          bonusAmount: editDisbBonus || 0,
          taxAmount: editDisbTax || 0,
          deductionAmount: editDisbDeduction || 0,
        }
      : undefined,
  });

  const generateRunsCSV = (periodDisbursements: any[], periodName: string) => {
    const headers = [t('hr.payroll.thEmployee'), t('hr.payroll.thBasic'), t('hr.payroll.thAllowances'), t('hr.payroll.thOvertime'), t('hr.payroll.thBonus'), t('hr.payroll.thTax'), t('hr.payroll.thDeductions'), t('hr.payroll.thGross'), t('hr.payroll.thNet'), t('hr.payroll.thStatus')];
    const rows = periodDisbursements.map(d => {
      const emp = d.employee || employees.find(e => e.id === d.employeeId);
      return [
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        d.basicSalary || 0,
        d.allowanceAmount || 0,
        d.overtimeAmount || 0,
        d.bonusAmount || 0,
        d.taxAmount || 0,
        d.deductionAmount || 0,
        d.grossSalary || 0,
        d.netSalary || 0,
        d.status || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-${periodName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Selector Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="w-full sm:max-w-xs">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.selectProfileRun')}</label>
          <select
            value={selectedPeriodId}
            onChange={(e) => { setSelectedPeriodId(e.target.value); setPage(1); }}
            className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
          >
            <option value="">{t('hr.payroll.selectPeriod')}</option>
            {allPeriodItems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({t('hr.payroll.' + p.status.toLowerCase())})
              </option>
            ))}
          </select>
        </div>

        {selectedPeriodId && !runsLoading && (
          (() => {
            const per = allPeriodItems.find(p => p.id === selectedPeriodId) || periodItems.find(p => p.id === selectedPeriodId);
            if (!per) return null;
            const totGross = runsItems.reduce((acc, curr) => acc + Number(curr.grossSalary || 0), 0);
            const totNet = runsItems.reduce((acc, curr) => acc + Number(curr.netSalary || 0), 0);
            return (
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t('hr.payroll.runs.totalGross')}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">${totGross.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t('hr.payroll.runs.totalNet')}</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">${totNet.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{t('hr.payroll.runs.wagesFor')}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{runsItems.length} {t('hr.payroll.runs.employees')}</p>
                </div>
              </div>
            );
          })()
        )}
      </div>

      {selectedPeriodId ? (
        runsLoading ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs shadow-sm">
            {t('hr.payroll.loadingDisbursements')}
          </div>
        ) : (
        (() => {
          const per = allPeriodItems.find(p => p.id === selectedPeriodId) || periodItems.find(p => p.id === selectedPeriodId);
          if (!per) return null;
          const dList = runsItems;
          const RUNS_PER_PAGE = 15;
          const dPageTotal = Math.ceil(dList.length / RUNS_PER_PAGE);
          const dPageItems = dList.slice((page - 1) * RUNS_PER_PAGE, page * RUNS_PER_PAGE);
          return (
            <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${runsPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.disbursementsLedger', { name: per.name })}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.payroll.runs.statusLabel', { status: t('hr.payroll.' + per.status.toLowerCase()) })}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => generateRunsCSV(dList, per.name)} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
                    <Download className="h-3 w-3" />
                    <span>{t('exportCSV')}</span>
                  </button>
                  {per.status !== 'LOCKED' && (
                    <button
                        onClick={async () => { await handleGeneratePayroll(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); }}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      >
                        {t('hr.payroll.recompileWages')}
                      </button>
                  )}
                  {per.status === 'OPEN' && (
                    <>
                       <button
                          onClick={async () => { await handleFinalizePayroll(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        >
                          {t('hr.payroll.approveFinalize')}
                        </button>
                        <button
                          onClick={async () => { await handleCancelPayrollRun(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); }}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        >
                          {t('hr.payroll.cancelRun')}
                        </button>
                    </>
                  )}
                  {per.status === 'LOCKED' && (
                      <button
                        onClick={async () => { await handleSetPeriodStatus(per.id, 'OPEN'); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); queryClient.invalidateQueries({ queryKey: ['payroll', 'periods'] }); }}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      >
                        {t('hr.payroll.reopenRun')}
                     </button>
                  )}
                </div>
              </div>

              {dList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('hr.payroll.wagesNotCompiled')}</p>
                  {per.status !== 'LOCKED' && (
                     <button
                       onClick={async () => { await handleGeneratePayroll(per.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); }}
                       className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold"
                     >
                       {t('hr.payroll.compileWagesNow')}
                     </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-6">{t('hr.payroll.thEmployee')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thBasic')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thAllowances')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thOvertime')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thBonus')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thTax')}</th>
                        <th className="py-3 px-3">{t('hr.payroll.thDeductions')}</th>
                        <th className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{t('hr.payroll.thGross')}</th>
                        <th className="py-3 px-3 font-bold text-slate-900 dark:text-white">{t('hr.payroll.thNet')}</th>
                        <th className="py-3 px-4 text-right">{t('hr.payroll.thStatus')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                      {dPageItems.map((d) => {
                        const emp = d.employee || employees.find(e => e.id === d.employeeId);
                        return (
                          <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                            <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-white">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  {emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}
                                  <p className="text-[10px] font-normal text-slate-400">{emp?.employeeNumber}</p>
                                </div>
                                {per.status !== 'LOCKED' && (
                                  <button
                                    onClick={() => {
                                      setEditingDisbId(d.id);
                                      setEditDisbAllowance(d.allowanceAmount ?? 0);
                                      setEditDisbOvertime(d.overtimeAmount ?? 0);
                                      setEditDisbBonus(d.bonusAmount ?? 0);
                                      setEditDisbTax(d.taxAmount ?? 0);
                                      setEditDisbDeduction(d.deductionAmount ?? 0);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    title={t('hr.payroll.editWageAmounts')}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-3">${d.basicSalary.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400">+${d.allowanceAmount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400">+${d.overtimeAmount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-emerald-600 dark:text-emerald-400">+${d.bonusAmount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-rose-600">-${d.taxAmount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 text-rose-600">-${d.deductionAmount.toLocaleString()}</td>
                            <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">${d.grossSalary.toLocaleString()}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">${d.netSalary.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  d.status === 'PAID' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                {t('hr.payroll.' + d.status.toLowerCase())}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {dPageTotal > 1 && (
                    <div className="flex justify-center items-center space-x-2 py-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200">{t('common.prev')}</button>
                      <span className="text-slate-500 text-[10px] font-bold">{t('common.pageOf', { page, total: dPageTotal })}</span>
                      <button onClick={() => setPage(p => Math.min(dPageTotal, p + 1))} disabled={page === dPageTotal} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200">{t('common.next')}</button>
                    </div>
                  )}
                </div>
              )}

              {editingDisbId && (() => {
                const dRecord = dList.find(disb => disb.id === editingDisbId);
                if (!dRecord) return null;
                const dEmp = employees.find(e => e.id === dRecord.employeeId);
                return (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{t('hr.payroll.runs.adjustWages', { name: dEmp ? `${dEmp.firstName} ${dEmp.lastName}` : t('common.unknown') })}</h3>
                        <button onClick={() => setEditingDisbId(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                       <form onSubmit={disbEditForm.handleSubmit(async (data) => {
                         await handleUpdateDisbursementAmountsForm(editingDisbId, data);
                         setEditingDisbId(null);
                         queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] });
                       })}>
                        <div className="space-y-3 text-xs">
                          <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-slate-500 font-semibold">{t('hr.payroll.basicSalaryFixed', { amount: dRecord.basicSalary })}</p>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.allowancesLabel')}</label>
                            <input
                              type="number"
                              {...disbEditForm.register('allowanceAmount', { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-slate-800 dark:text-white outline-none"
                            />
                            {disbEditForm.formState.errors.allowanceAmount && <p className="text-[10px] text-red-500 mt-1">{disbEditForm.formState.errors.allowanceAmount.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.overtimeLabel')}</label>
                            <input
                              type="number"
                              {...disbEditForm.register('overtimeAmount', { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-slate-800 dark:text-white outline-none"
                            />
                            {disbEditForm.formState.errors.overtimeAmount && <p className="text-[10px] text-red-500 mt-1">{disbEditForm.formState.errors.overtimeAmount.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.bonusLabel')}</label>
                            <input
                              type="number"
                              {...disbEditForm.register('bonusAmount', { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-slate-800 dark:text-white outline-none"
                            />
                            {disbEditForm.formState.errors.bonusAmount && <p className="text-[10px] text-red-500 mt-1">{disbEditForm.formState.errors.bonusAmount.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.taxDeduction')}</label>
                            <input
                              type="number"
                              {...disbEditForm.register('taxAmount', { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-slate-800 dark:text-white outline-none"
                            />
                            {disbEditForm.formState.errors.taxAmount && <p className="text-[10px] text-red-500 mt-1">{disbEditForm.formState.errors.taxAmount.message}</p>}
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.otherDeductions')}</label>
                            <input
                              type="number"
                              {...disbEditForm.register('deductionAmount', { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 py-2 px-3 text-slate-800 dark:text-white outline-none"
                            />
                            {disbEditForm.formState.errors.deductionAmount && <p className="text-[10px] text-red-500 mt-1">{disbEditForm.formState.errors.deductionAmount.message}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold py-2.5 transition-colors"
                          >
                            {t('hr.payroll.saveWages')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDisbId(null)}
                            className="border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold py-2.5 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            {t('common.cancel')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs shadow-sm">
          {t('hr.payroll.selectProfileHint')}
        </div>
      )}
    </div>
  );
}
