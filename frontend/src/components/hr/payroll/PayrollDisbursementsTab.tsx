import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Trash, Eye, Check, Download } from 'lucide-react';
import Pagination from '../Pagination';
import { payrollDisbursementApi } from '../../../lib/payroll-disbursements';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useEmployees } from '../../../hooks/queries/useEmployees';
import { usePayrollPeriods, usePayrollDisbursements } from '../../../hooks/queries/usePayroll';

interface PayrollDisbursementsTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  fmtDT: (v: string) => string;
  setViewPayslipDisb: (v: any) => void;
}

export default function PayrollDisbursementsTab({ page, setPage, ITEMS_PER_PAGE, fmtDT, setViewPayslipDisb }: PayrollDisbursementsTabProps) {
  const { t } = useTranslation();
  const showToast = useNotificationStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const { data: empRes } = useEmployees({ pageSize: 500 });
  const employees = empRes?.items || [];
  const { data: disbRes, isLoading: disbLoading, isPlaceholderData: disbPlaceholder } = usePayrollDisbursements({ page, pageSize: ITEMS_PER_PAGE });
  const disbItems = disbRes?.items || [];
  const disbTotalPages = disbRes?.pagination?.totalPages || 1;
  const { data: allDisbRes } = usePayrollDisbursements({ pageSize: 9999 });
  const allDisbItems = allDisbRes?.items || [];
  const { data: allPeriodsRes } = usePayrollPeriods({ pageSize: 500 });
  const allPeriodItems = allPeriodsRes?.items || [];
  const periodItems = allPeriodItems;

  const handleMarkDisbursementAsPaid = async (id: string) => {
    try {
      await payrollDisbursementApi.markPaid(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Disbursement Paid', 'Disbursement status set to PAID.', 'success');
  };

  const handleDeleteDisbursement = async (id: string) => {
    try {
      await payrollDisbursementApi.hardDelete(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Disbursement Deleted', 'Disbursement has been permanently deleted.', 'info');
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${disbPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.disbursementsTitle')}</h3>
        <button onClick={() => {
          const headers = [t('hr.payroll.disbId'), t('hr.payroll.disbEmployee'), t('hr.payroll.disbPeriod'), t('hr.payroll.disbPayDate'), t('hr.payroll.disbGross'), t('hr.payroll.disbNet'), t('hr.payroll.disbStatus')];
          const rows = allDisbItems.map(d => {
            const emp = d.employee || employees.find(e => e.id === d.employeeId);
            const period = allPeriodItems.find(p => p.id === d.payrollPeriodId);
            return [d.id, emp ? `${emp.firstName} ${emp.lastName}` : '', period?.name || `${d.month}/${d.year}`, fmtDT(d.payDate), d.grossSalary, d.netSalary, d.status];
          });
          const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `disbursements-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
          window.URL.revokeObjectURL(url);
        }} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Download className="h-3 w-3" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-6">{t('hr.payroll.disbId')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbEmployee')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbPeriod')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbPayDate')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbGross')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbNet')}</th>
              <th className="py-3 px-4">{t('hr.payroll.disbStatus')}</th>
              <th className="py-3 px-6 text-right">{t('hr.payroll.thActions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
            {disbLoading ? (
              <tr><td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.disbursements.loading')}</td></tr>
            ) : disbItems.length === 0 ? (
              <tr><td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.disbursements.noDisbursements')}</td></tr>
            ) : disbItems.map((d) => {
              const emp = d.employee || employees.find(e => e.id === d.employeeId);
              const period = allPeriodItems.find(p => p.id === d.payrollPeriodId) || periodItems.find(p => p.id === d.payrollPeriodId);
              return (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                  <td className="py-3 px-6 font-mono text-[10px] text-slate-500">{d.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                  <td className="py-3 px-4">{period?.name || t('hr.payroll.periodFormat', { month: d.month, year: d.year })}</td>
                  <td className="py-3 px-4 text-slate-500">{fmtDT(d.payDate)}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">${d.grossSalary.toLocaleString()}</td>
                  <td className="py-3 px-4 font-bold text-slate-950 dark:text-white">${d.netSalary.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${d.status === 'PAID' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400'}`}>
                      {t('hr.payroll.' + d.status.toLowerCase())}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={() => setViewPayslipDisb(d)}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 p-2 rounded transition-transform hover:scale-110 flex items-center justify-center"
                        title={t('hr.payroll.viewAdvice')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {d.status !== 'PAID' && (
                        <button
                          onClick={async () => { await handleMarkDisbursementAsPaid(d.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); }}
                          className="bg-green-600 hover:bg-green-500 text-white p-2 rounded transition-transform hover:scale-110 flex items-center justify-center"
                          title={t('hr.payroll.markPaid')}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {d.status !== 'PAID' && (
                        <button
                          onClick={() => { handleDeleteDisbursement(d.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] }); }}
                          className="text-rose-600 hover:text-rose-800 hover:scale-110 transition-transform p-2"
                          title={t('hr.payroll.deleteDisb')}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalItems={disbTotalPages * ITEMS_PER_PAGE} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} idPrefix="disbursements" />
    </div>
  );
}
