import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface PayslipModalProps {
  viewPayslipDisb: any;
  setViewPayslipDisb: (v: null) => void;
  employees: any[];
  periods: any[];
  fmtDT: (v: string) => string;
}

export default function PayslipModal({ viewPayslipDisb, setViewPayslipDisb, employees, periods, fmtDT }: PayslipModalProps) {
  const { t } = useTranslation();
  if (!viewPayslipDisb) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewPayslipDisb(null)}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('hr.payslip.title')}</h2>
          <button onClick={() => setViewPayslipDisb(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X className="h-5 w-5" /></button>
        </div>
        {(() => {
          const emp = employees.find(e => e.id === viewPayslipDisb.employeeId);
          const period = periods.find(p => p.id === viewPayslipDisb.payrollPeriodId);
          return (
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.employee')}</span><span>{emp ? `${emp.firstName} ${emp.lastName}` : viewPayslipDisb.employeeId}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.period')}</span><span>{period?.name || t('hr.payroll.periodFormat', { month: viewPayslipDisb.month, year: viewPayslipDisb.year })}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.payDate')}</span><span>{fmtDT(viewPayslipDisb.payDate)}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.status')}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${viewPayslipDisb.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : viewPayslipDisb.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : viewPayslipDisb.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{t(viewPayslipDisb.status === 'PAID' ? 'hr.payroll.paid' : viewPayslipDisb.status === 'CANCELLED' ? 'hr.payroll.cancelled' : viewPayslipDisb.status === 'APPROVED' ? 'employee.approved' : 'employee.pending')}</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.basicSalary')}</span><span>${Number(viewPayslipDisb.basicSalary || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.overtime')}</span><span>${Number(viewPayslipDisb.overtimeAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.allowances')}</span><span>${Number(viewPayslipDisb.allowanceAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.bonus')}</span><span>${Number(viewPayslipDisb.bonusAmount || 0).toLocaleString()}</span></div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.tax')}</span><span className="text-rose-600">-${Number(viewPayslipDisb.taxAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.deductions')}</span><span className="text-rose-600">-${Number(viewPayslipDisb.deductionAmount || 0).toLocaleString()}</span></div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between"><span className="font-bold text-slate-900 dark:text-white">{t('hr.payslip.grossSalary')}</span><span className="font-bold text-slate-900 dark:text-white">${Number(viewPayslipDisb.grossSalary || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="font-bold text-blue-600 dark:text-blue-400">{t('hr.payslip.netSalary')}</span><span className="font-bold text-blue-600 dark:text-blue-400">${Number(viewPayslipDisb.netSalary || 0).toLocaleString()}</span></div>
              {viewPayslipDisb.remarks && <div className="flex justify-between"><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.payslip.remarks')}</span><span>{viewPayslipDisb.remarks}</span></div>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}