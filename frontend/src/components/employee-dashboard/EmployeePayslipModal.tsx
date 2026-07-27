import { useTranslation } from 'react-i18next';
import type { PayrollDisbursementData } from './types';

interface EmployeePayslipModalProps {
  payslip: PayrollDisbursementData;
  onClose: () => void;
}

export default function EmployeePayslipModal({ payslip, onClose }: EmployeePayslipModalProps) {
  const { t } = useTranslation();

  const items = [
    { label: t('employee.basicSalary'), value: payslip.basicSalary, color: 'text-slate-800' },
    { label: t('employee.allowances'), value: payslip.allowanceAmount, color: 'text-emerald-600' },
    { label: t('employee.overtime'), value: payslip.overtimeAmount, color: 'text-emerald-600' },
    { label: t('employee.bonus'), value: payslip.bonusAmount, color: 'text-emerald-600' },
    { label: t('employee.grossSalary'), value: payslip.grossSalary, color: 'text-slate-900', bold: true },
    { label: t('employee.deductions'), value: payslip.deductionAmount, color: 'text-rose-600', prefix: '-' },
    { label: t('employee.tax'), value: payslip.taxAmount, color: 'text-rose-600', prefix: '-' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-sm">{t('employee.payslipBreakdown', { month: payslip.month, year: payslip.year })}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
              <span className={`text-slate-500 ${item.bold ? 'font-bold text-slate-900' : ''}`}>{item.label}</span>
              <span className={`font-bold ${item.color}`}>{item.prefix || ''}${Number(item.value || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-2 bg-slate-50 rounded-lg px-3 mt-2">
            <span className="font-bold text-slate-900">{t('employee.netPay')}</span>
            <span className="font-extrabold text-lg text-slate-900">${Number(payslip.netSalary || 0).toFixed(2)}</span>
          </div>
        </div>
        <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="bg-slate-900 text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors">{t('employee.close')}</button>
        </div>
      </div>
    </div>
  );
}
