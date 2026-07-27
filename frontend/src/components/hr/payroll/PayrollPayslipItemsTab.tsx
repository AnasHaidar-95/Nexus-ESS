import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import Pagination from '../Pagination';
import { usePayrollDisbursements, useSalaryComponents, usePayslipItems } from '../../../hooks/queries/usePayroll';

interface PayrollPayslipItemsTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
}

export default function PayrollPayslipItemsTab({ page, setPage, ITEMS_PER_PAGE }: PayrollPayslipItemsTabProps) {
  const { t } = useTranslation();

  const { data: piRes, isLoading: piLoading, isPlaceholderData: piPlaceholder } = usePayslipItems({ page, pageSize: ITEMS_PER_PAGE });
  const piItems = piRes?.items || [];
  const piTotalPages = piRes?.pagination?.totalPages || 1;
  const { data: allPiRes } = usePayslipItems({ pageSize: 9999 });
  const allPiItems = allPiRes?.items || [];
  const { data: disbRes } = usePayrollDisbursements({ pageSize: 500 });
  const disbItems = disbRes?.items || [];
  const { data: allScRes } = useSalaryComponents({ pageSize: 500, status: 'ACTIVE' });
  const scItems = allScRes?.items || [];

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${piPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.payslipTitle')}</h3>
        <button onClick={() => {
          const headers = [t('hr.payroll.piId'), t('hr.payroll.piEmployee'), t('hr.payroll.piComponent'), t('hr.payroll.piType'), t('hr.payroll.piAmount'), t('hr.payroll.piDetails')];
          const rows = allPiItems.map(pi => {
            const emp = pi.payrollDisbursement?.employee || (disbItems.find(d => d.id === pi.payrollDisbursementId)?.employee || null);
            const comp = pi.salaryComponent || scItems.find(c => c.id === pi.salaryComponentId);
            return [pi.id, emp ? `${emp.firstName} ${emp.lastName}` : '', comp?.code || '', comp?.type || '', pi.amount, pi.calculationDetail || comp?.name || ''];
          });
          const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `payslip-items-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
              <th className="py-3 px-6">{t('hr.payroll.piId')}</th>
              <th className="py-3 px-4">{t('hr.payroll.piEmployee')}</th>
              <th className="py-3 px-4">{t('hr.payroll.piComponent')}</th>
              <th className="py-3 px-4">{t('hr.payroll.piType')}</th>
              <th className="py-3 px-4">{t('hr.payroll.piAmount')}</th>
              <th className="py-3 px-6">{t('hr.payroll.piDetails')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
            {piLoading ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.piLoading')}</td></tr>
            ) : piItems.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.piNoItems')}</td></tr>
            ) : piItems.map((pi) => {
              const emp = pi.payrollDisbursement?.employee || (disbItems.find(d => d.id === pi.payrollDisbursementId)?.employee || null);
              const comp = pi.salaryComponent || scItems.find(c => c.id === pi.salaryComponentId);
              return (
                <tr key={pi.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                  <td className="py-3 px-6 font-mono text-[10px] text-slate-500">{pi.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                  <td className="py-3 px-4 font-bold text-slate-850 dark:text-slate-200">{comp?.code || t('common.na')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${comp?.type === 'EARNING' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'}`}>
                      {comp?.type ? t('hr.payroll.' + comp.type.toLowerCase()) : t('hr.payroll.earning')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">${Number(pi.amount).toLocaleString()}</td>
                  <td className="py-3 px-6 text-slate-500 text-[11px]">{pi.calculationDetail || comp?.name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalItems={piTotalPages * ITEMS_PER_PAGE} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} idPrefix="payslips" />
    </div>
  );
}
