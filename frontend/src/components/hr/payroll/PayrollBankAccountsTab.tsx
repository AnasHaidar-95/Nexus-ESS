import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, Download } from 'lucide-react';
import Pagination from '../Pagination';
import { employeeBankAccountApi } from '../../../lib/employee-bank-accounts';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { StandardStatus } from '../../../types';
import { useEmployees } from '../../../hooks/queries/useEmployees';
import { useBankAccounts } from '../../../hooks/queries/usePayroll';
import {
  bankAccountSchema,
  type BankAccountFormData,
} from '../../../lib/formSchemas';

interface PayrollBankAccountsTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
}

export default function PayrollBankAccountsTab({
  page,
  setPage,
  ITEMS_PER_PAGE,
}: PayrollBankAccountsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [editingBaId, setEditingBaId] = useState<string | null>(null);
  const [editBaEmployeeId, setEditBaEmployeeId] = useState('');
  const [editBaAccountName, setEditBaAccountName] = useState('');
  const [editBaAccountNumber, setEditBaAccountNumber] = useState('');
  const [editBaBankName, setEditBaBankName] = useState('');
  const [editBaBranchCode, setEditBaBranchCode] = useState('');
  const [editBaSwiftCode, setEditBaSwiftCode] = useState('');
  const [editBaIsDefault, setEditBaIsDefault] = useState(false);
  const [editBaStatus, setEditBaStatus] = useState<StandardStatus>('ACTIVE');

  const { data: empRes } = useEmployees({ pageSize: 500 });
  const employees = empRes?.items || [];

  const { data: baRes, isLoading: baLoading, isPlaceholderData: baPlaceholder } = useBankAccounts({ page, pageSize: ITEMS_PER_PAGE });
  const baItems = baRes?.items || [];
  const baTotalPages = baRes?.pagination?.totalPages || 1;
  const { data: allBaRes } = useBankAccounts({ pageSize: 9999 });
  const allBaItems = allBaRes?.items || [];

  // --- Bank Account Handlers ---
  const handleCreateBankAccountForm = async (data: BankAccountFormData) => {
    try {
      await employeeBankAccountApi.create({
        employeeId: data.employeeId, accountName: data.accountName,
        accountNumber: data.accountNumber, bankName: data.bankName,
        branchCode: data.branchCode, swiftCode: data.swiftCode, isDefault: data.isDefault,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Bank Account Created', 'Employee bank account created successfully.', 'success');
  };

  const handleUpdateBankAccountForm = async (data: BankAccountFormData & { status?: string }) => {
    if (!editingBaId) return;
    try {
      await employeeBankAccountApi.update(editingBaId, {
        employeeId: data.employeeId, accountName: data.accountName,
        accountNumber: data.accountNumber, bankName: data.bankName,
        branchCode: data.branchCode, swiftCode: data.swiftCode,
        isDefault: data.isDefault, status: (data.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Bank Account Updated', 'Bank account updated successfully.', 'success');
    setEditingBaId(null);
  };

  const handleDeleteBankAccount = async (id: string) => {
    try {
      await employeeBankAccountApi.delete(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Bank Account Deleted', 'Bank account has been deleted.', 'info');
  };

  const handleSetDefaultBankAccount = async (id: string, _employeeId: string) => {
    try {
      await employeeBankAccountApi.setDefault(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Default Account Set', 'Default bank account set successfully.', 'success');
  };

  const baCreateForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema) as any,
    defaultValues: { employeeId: '', accountName: '', accountNumber: '', bankName: '', branchCode: '', swiftCode: '', isDefault: false },
  });

  const baEditForm = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema) as any,
    values: editingBaId
      ? {
          employeeId: editBaEmployeeId || '',
          accountName: editBaAccountName || '',
          accountNumber: editBaAccountNumber || '',
          bankName: editBaBankName || '',
          branchCode: editBaBranchCode || '',
          swiftCode: editBaSwiftCode || '',
          isDefault: editBaIsDefault ?? false,
        }
      : undefined,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {editingBaId ? t('hr.payroll.bankAccounts.edit') : t('hr.payroll.bankAccounts.add')}
        </h3>
        {editingBaId ? (
          <form
            onSubmit={baEditForm.handleSubmit(async (data: BankAccountFormData) => {
               await handleUpdateBankAccountForm({ ...data, status: editBaStatus as any });
               baEditForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'bankAccounts'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.thEmployee')}</label>
              <select
                {...baEditForm.register('employeeId')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="">{t('hr.payroll.selectEmployee')}</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
              {baEditForm.formState.errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{baEditForm.formState.errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.accountHolder')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.holderPlaceholder')}
                {...baEditForm.register('accountName')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baEditForm.formState.errors.accountName && <p className="text-[10px] text-red-500 mt-1">{baEditForm.formState.errors.accountName.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.accountNumber')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.numberPlaceholder')}
                {...baEditForm.register('accountNumber')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baEditForm.formState.errors.accountNumber && <p className="text-[10px] text-red-500 mt-1">{baEditForm.formState.errors.accountNumber.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.bankName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.bankPlaceholder')}
                {...baEditForm.register('bankName')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baEditForm.formState.errors.bankName && <p className="text-[10px] text-red-500 mt-1">{baEditForm.formState.errors.bankName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.branchCode')}</label>
                <input
                  type="text"
                  placeholder={t('hr.payroll.branchPlaceholder')}
                  {...baEditForm.register('branchCode')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.swiftCode')}</label>
                <input
                  type="text"
                  placeholder={t('hr.payroll.swiftPlaceholder')}
                  {...baEditForm.register('swiftCode')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
            </div>
            <div className="pt-1">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...baEditForm.register('isDefault')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.setDefault')}</span>
              </label>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.status')}</label>
              <select
                value={editBaStatus}
                onChange={() => { /* kept in context */ }}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="ACTIVE">{t('hr.payroll.activeStatus')}</option>
                <option value="INACTIVE">{t('hr.payroll.inactiveStatus')}</option>
              </select>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.updateAccount')}
              </button>
              <button
                type="button"
                onClick={() => { setEditingBaId(null); baEditForm.reset(); }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-300 rounded-lg text-xs font-semibold py-2 px-3"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={baCreateForm.handleSubmit(async (data: BankAccountFormData) => {
               await handleCreateBankAccountForm(data);
               baCreateForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'bankAccounts'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.thEmployee')}</label>
              <select
                {...baCreateForm.register('employeeId')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="">{t('hr.payroll.selectEmployee')}</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
              {baCreateForm.formState.errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{baCreateForm.formState.errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.accountHolder')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.holderPlaceholder')}
                {...baCreateForm.register('accountName')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baCreateForm.formState.errors.accountName && <p className="text-[10px] text-red-500 mt-1">{baCreateForm.formState.errors.accountName.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.accountNumber')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.numberPlaceholder')}
                {...baCreateForm.register('accountNumber')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baCreateForm.formState.errors.accountNumber && <p className="text-[10px] text-red-500 mt-1">{baCreateForm.formState.errors.accountNumber.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.bankName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.bankPlaceholder')}
                {...baCreateForm.register('bankName')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {baCreateForm.formState.errors.bankName && <p className="text-[10px] text-red-500 mt-1">{baCreateForm.formState.errors.bankName.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.branchCode')}</label>
                <input
                  type="text"
                  placeholder={t('hr.payroll.branchPlaceholder')}
                  {...baCreateForm.register('branchCode')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.swiftCode')}</label>
                <input
                  type="text"
                  placeholder={t('hr.payroll.swiftPlaceholder')}
                  {...baCreateForm.register('swiftCode')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
            </div>
            <div className="pt-1">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...baCreateForm.register('isDefault')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.setDefault')}</span>
              </label>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.addAccount')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Column: List */}
      <div className={`lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${baPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.bankingTitle')}</h3>
          <button onClick={() => {
            const headers = [t('hr.payroll.employeeCol'), t('hr.payroll.bankCol'), t('hr.payroll.accountCol'), t('hr.payroll.accountNameCol'), t('hr.payroll.swiftBranch'), t('hr.payroll.default')];
            const rows = allBaItems.map(ba => {
              const emp = employees.find(e => e.id === ba.employeeId);
              return [emp ? `${emp.firstName} ${emp.lastName}` : '', ba.bankName, ba.accountNumber, ba.accountName, `${ba.swiftCode || ''} / ${ba.branchCode || ''}`, ba.isDefault ? 'Yes' : 'No'];
            });
            const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `bank-accounts-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
                <th className="py-3 px-6">{t('hr.payroll.employeeCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.bankCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.accountCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.accountNameCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.swiftBranch')}</th>
                <th className="py-3 px-4">{t('hr.payroll.default')}</th>
                <th className="py-3 px-6 text-right">{t('hr.payroll.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {baLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.loadingBA')}</td></tr>
              ) : baItems.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.noAccounts')}</td></tr>
              ) : baItems.map((ba) => {
                const emp = employees.find(e => e.id === ba.employeeId);
                return (
                  <tr key={ba.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                    <td className="py-3 px-6 font-bold text-slate-900 dark:text-white">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                    <td className="py-3 px-4">{ba.bankName}</td>
                    <td className="py-3 px-4 font-mono">{ba.accountNumber}</td>
                    <td className="py-3 px-4">{ba.accountName}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                      {t('hr.payroll.swiftBranchValue', { swift: ba.swiftCode || t('common.na'), branch: ba.branchCode || t('common.na') })}
                    </td>
                    <td className="py-3 px-4">
                      {ba.isDefault ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{t('hr.payroll.default')}</span>
                      ) : (
                        <button
                           onClick={() => { handleSetDefaultBankAccount(ba.id, ba.employeeId); queryClient.invalidateQueries({ queryKey: ['payroll', 'bankAccounts'] }); }}
                          className="text-slate-400 hover:text-slate-600 text-[10px]"
                        >
                          {t('hr.payroll.setDefaultBtn')}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end space-x-3 items-center">
                        <button
                          onClick={() => {
                            setEditingBaId(ba.id);
                            setEditBaEmployeeId(ba.employeeId);
                            setEditBaAccountName(ba.accountName);
                            setEditBaAccountNumber(ba.accountNumber);
                            setEditBaBankName(ba.bankName);
                            setEditBaBranchCode(ba.branchCode || '');
                            setEditBaSwiftCode(ba.swiftCode || '');
                            setEditBaIsDefault(ba.isDefault);
                            setEditBaStatus(ba.status as StandardStatus);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                          title={t('hr.payroll.editAcc')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                         <button
                           onClick={() => { handleDeleteBankAccount(ba.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'bankAccounts'] }); }}
                          className="text-rose-600 hover:text-rose-800 hover:scale-110 transition-transform"
                          title={t('hr.payroll.deleteAcc')}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalItems={baTotalPages * ITEMS_PER_PAGE} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} idPrefix="bank-accounts" />
      </div>
    </div>
  );
}
