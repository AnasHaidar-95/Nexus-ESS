import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fmtDT } from '../../lib/utils';
import type { BankAccountData, SalaryProfileData, PayrollDisbursementData } from './types';

interface EmployeePayrollTabProps {
  bankAccounts: BankAccountData[];
  salaryProfile: SalaryProfileData[];
  salaryComponents: any[];
  payrollDisbursements: PayrollDisbursementData[];
  onViewPayslip: (disb: PayrollDisbursementData) => void;
}

const PAYSPLIP_PER_PAGE = 5;

const fmtCurrency = (v: string | number | undefined | null) =>
  Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EmployeePayrollTab({
  bankAccounts,
  salaryProfile,
  salaryComponents,
  payrollDisbursements,
  onViewPayslip,
}: EmployeePayrollTabProps) {
  const { t } = useTranslation();
  const [payslipPage, setPayslipPage] = useState(1);
  const totalPages = Math.ceil(payrollDisbursements.length / PAYSPLIP_PER_PAGE);

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.mySalaryBankAccounts')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Salary profile breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('employee.monthlyCompensationProfile')}</h3>
          <div className="space-y-3 pt-2">
            {salaryProfile.map(sp => {
              const comp = salaryComponents.find((c: any) => c.id === sp.salaryComponentId);
              return (
                <div key={sp.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2">
                  <div>
                    <p className="font-semibold text-slate-800">{comp ? comp.name : t('employee.component')}</p>
                    <p className="text-[10px] text-slate-400 uppercase">{comp?.type}</p>
                  </div>
                  <span className={`font-bold ${comp?.type === 'DEDUCTION' ? 'text-rose-600' : 'text-slate-800'}`}>
                    {comp?.type === 'DEDUCTION' ? '-' : ''}${Number(sp.customValue ?? comp?.defaultValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank account detail */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('employee.directDepositBankAccount')}</h3>
          {bankAccounts.length === 0 ? (
            <p className="text-xs text-slate-500 italic pt-2">{t('employee.noBankAccounts')}</p>
          ) : (
            bankAccounts.map(ba => (
              <div key={ba.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-800 text-sm">{(ba as any).bankName}</p>
                  {(ba as any).isDefault && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold text-[10px] uppercase">{t('employee.default')}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">{t('employee.accountName')}</p>
                    <p className="font-bold text-slate-700 mt-0.5">{(ba as any).accountName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">{t('employee.accountNumber')}</p>
                    <p className="font-bold text-slate-700 mt-0.5">{(ba as any).accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">{t('employee.branchCode')}</p>
                    <p className="font-bold text-slate-700 mt-0.5">{(ba as any).branchCode || t('employee.na')}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase">{t('employee.swiftBic')}</p>
                    <p className="font-bold text-slate-700 mt-0.5">{(ba as any).swiftCode || t('employee.na')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Historic Payslips */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">{t('employee.historicMonthlyPayslips')}</h3>
        </div>
        <div className="p-6">
          {payrollDisbursements.length === 0 ? (
            <p className="text-sm text-slate-500 italic">{t('employee.noPayslips')}</p>
          ) : (
            <div className="space-y-4">
              {payrollDisbursements.slice((payslipPage - 1) * PAYSPLIP_PER_PAGE, payslipPage * PAYSPLIP_PER_PAGE).map(pd => (
                <div key={pd.id} className="border border-slate-150 rounded-xl p-5 hover:bg-slate-50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800 text-sm">{t('employee.periodMonth', { month: pd.month, year: pd.year })}</p>
                    <p className="text-slate-500">{t('employee.grossSalaryNetPaid', { grossSalary: fmtCurrency(pd.grossSalary) })} <span className="font-bold text-slate-700">${fmtCurrency(pd.netSalary)}</span></p>
                    <p className="text-[10px] text-slate-400">{t('employee.paymentDate', { date: fmtDT(pd.payDate) })} {t('employee.statusColon')} <span className="font-bold uppercase text-green-600">{t(pd.status === 'PAID' ? 'employee.paid' : pd.status === 'APPROVED' ? 'employee.approved' : pd.status === 'CANCELLED' ? 'employee.cancelled' : 'employee.pending')}</span></p>
                  </div>
                  <button
                    onClick={() => onViewPayslip(pd)}
                    className="mt-3 md:mt-0 bg-slate-900 text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors"
                  >
                    {t('employee.viewBreakdown')}
                  </button>
                </div>
              ))}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-2 text-xs">
                  <button onClick={() => setPayslipPage(p => Math.max(1, p - 1))} disabled={payslipPage === 1} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 font-semibold">{t('employee.prev')}</button>
                  <span className="text-slate-500 text-[10px] font-bold">{t('employee.pageOf', { page: payslipPage, total: totalPages })}</span>
                  <button onClick={() => setPayslipPage(p => Math.min(totalPages, p + 1))} disabled={payslipPage === totalPages} className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 font-semibold">{t('employee.next')}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
