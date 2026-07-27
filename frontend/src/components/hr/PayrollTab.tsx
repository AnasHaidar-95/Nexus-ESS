import { useEffect } from 'react';
import { PayrollPeriodsTab, PayrollRunsTab, PayrollComponentsTab, PayrollBankAccountsTab, PayrollSalaryProfilesTab, PayrollDisbursementsTab, PayrollPayslipItemsTab } from './payroll';

interface PayrollTabProps {
  payrollSubTab: string;
  setPayrollSubTab: (v: string) => void;
  ITEMS_PER_PAGE: number;
  fmtDT: (v: string) => string;
  departments: any[];
  PAYROLL_PROFILES_PER_PAGE: number;
  payrollPage: number; setPayrollPage: (v: number) => void;
  selectedPeriodId: string; setSelectedPeriodId: (v: string) => void;
  runsDisbPage: number; setRunsDisbPage: (v: number | ((prev: number) => number)) => void;
  componentsPage: number; setComponentsPage: (v: number) => void;
  bankAccountsPage: number; setBankAccountsPage: (v: number) => void;
  salaryProfilesPage: number; setSalaryProfilesPage: (v: number) => void;
  disbursementsPage: number; setDisbursementsPage: (v: number) => void;
  payslipsPage: number; setPayslipsPage: (v: number) => void;
  setViewPayslipDisb: (v: any) => void;
}

const SUB_TABS = [
  { id: 'periods', label: 'Payroll Periods' },
  { id: 'runs', label: 'Payroll Runs' },
  { id: 'components', label: 'Salary Components' },
  { id: 'bank_accounts', label: 'Bank Accounts' },
  { id: 'salary_profiles', label: 'Salary Profiles' },
  { id: 'disbursements', label: 'Disbursements' },
  { id: 'payslip_items', label: 'Payslip Items' },
] as const;

export default function PayrollTab({
  payrollSubTab,
  setPayrollSubTab,
  ITEMS_PER_PAGE,
  fmtDT,
  departments,
  PAYROLL_PROFILES_PER_PAGE,
  payrollPage, setPayrollPage,
  selectedPeriodId, setSelectedPeriodId,
  runsDisbPage, setRunsDisbPage,
  componentsPage, setComponentsPage,
  bankAccountsPage, setBankAccountsPage,
  salaryProfilesPage, setSalaryProfilesPage,
  disbursementsPage, setDisbursementsPage,
  payslipsPage, setPayslipsPage,
  setViewPayslipDisb,
}: PayrollTabProps) {

  // Reset pagination to page 1 when sub-tab changes
  useEffect(() => { if (payrollSubTab === 'periods') setPayrollPage(1); }, [payrollSubTab, setPayrollPage]);
  useEffect(() => { if (payrollSubTab === 'runs') setRunsDisbPage(1); }, [payrollSubTab, setRunsDisbPage]);
  useEffect(() => { if (payrollSubTab === 'components') setComponentsPage(1); }, [payrollSubTab, setComponentsPage]);
  useEffect(() => { if (payrollSubTab === 'bank_accounts') setBankAccountsPage(1); }, [payrollSubTab, setBankAccountsPage]);
  useEffect(() => { if (payrollSubTab === 'salary_profiles') setSalaryProfilesPage(1); }, [payrollSubTab, setSalaryProfilesPage]);
  useEffect(() => { if (payrollSubTab === 'disbursements') setDisbursementsPage(1); }, [payrollSubTab, setDisbursementsPage]);
  useEffect(() => { if (payrollSubTab === 'payslip_items') setPayslipsPage(1); }, [payrollSubTab, setPayslipsPage]);

  return (
    <div>
      {/* Sub-tab navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex space-x-2 overflow-x-auto">
          {SUB_TABS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setPayrollSubTab(sub.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                payrollSubTab === sub.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab content */}
      {payrollSubTab === 'periods' && (
        <PayrollPeriodsTab
          page={payrollPage} setPage={setPayrollPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE} PAYROLL_PROFILES_PER_PAGE={PAYROLL_PROFILES_PER_PAGE}
          fmtDT={fmtDT} selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId}
          setPayrollSubTab={setPayrollSubTab}
        />
      )}

      {payrollSubTab === 'runs' && (
        <PayrollRunsTab
          page={runsDisbPage} setPage={setRunsDisbPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE} fmtDT={fmtDT}
          selectedPeriodId={selectedPeriodId} setSelectedPeriodId={setSelectedPeriodId}
          setPayrollSubTab={setPayrollSubTab}
        />
      )}

      {payrollSubTab === 'components' && (
        <PayrollComponentsTab
          page={componentsPage} setPage={setComponentsPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />
      )}

      {payrollSubTab === 'bank_accounts' && (
        <PayrollBankAccountsTab
          page={bankAccountsPage} setPage={setBankAccountsPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />
      )}

      {payrollSubTab === 'salary_profiles' && (
        <PayrollSalaryProfilesTab
          page={salaryProfilesPage} setPage={setSalaryProfilesPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE} fmtDT={fmtDT}
          departments={departments}
        />
      )}

      {payrollSubTab === 'disbursements' && (
        <PayrollDisbursementsTab
          page={disbursementsPage} setPage={setDisbursementsPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE} fmtDT={fmtDT}
          setViewPayslipDisb={setViewPayslipDisb}
        />
      )}

      {payrollSubTab === 'payslip_items' && (
        <PayrollPayslipItemsTab
          page={payslipsPage} setPage={setPayslipsPage}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />
      )}
    </div>
  );
}
