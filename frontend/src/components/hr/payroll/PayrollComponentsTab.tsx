import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, XCircle } from 'lucide-react';
import Pagination from '../Pagination';
import { salaryComponentApi } from '../../../lib/salary-components';
import { useNotificationStore } from '../../../stores/notificationStore';
import type { SalaryComponentType, CalculationMethod, StandardStatus } from '../../../types';
import { useSalaryComponents } from '../../../hooks/queries/usePayroll';
import {
  salaryComponentSchema,
  type SalaryComponentFormData,
} from '../../../lib/formSchemas';

interface PayrollComponentsTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
}

export default function PayrollComponentsTab({
  page,
  setPage,
  ITEMS_PER_PAGE,
}: PayrollComponentsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [editingScId, setEditingScId] = useState<string | null>(null);
  const [editScCode, setEditScCode] = useState('');
  const [editScName, setEditScName] = useState('');
  const [editScType, setEditScType] = useState<SalaryComponentType>('EARNING');
  const [editScCalculationMethod, setEditScCalculationMethod] = useState<CalculationMethod>('FIXED');
  const [editScDefaultValue, setEditScDefaultValue] = useState(0);
  const [editScFormula, setEditScFormula] = useState('');
  const [editScIsTaxable, setEditScIsTaxable] = useState(false);
  const [editScIsPensionable, setEditScIsPensionable] = useState(false);
  const [editScStatus, setEditScStatus] = useState<StandardStatus>('ACTIVE');

  const { data: scRes, isLoading: scLoading, isPlaceholderData: scPlaceholder } = useSalaryComponents({ page, pageSize: ITEMS_PER_PAGE });
  const scItems = scRes?.items || [];
  const scTotalPages = scRes?.pagination?.totalPages || 1;

  const handleCreateSalaryComponentForm = async (data: SalaryComponentFormData) => {
    if (data.calculationMethod === 'FORMULA' && !data.formula) {
      showToast('Formula Required', 'A formula expression is required when calculation method is FORMULA.', 'error');
      return;
    }
    try {
      await salaryComponentApi.create({
        code: data.code.toUpperCase(), name: data.name, type: data.type,
        calculationMethod: data.calculationMethod, defaultValue: Number(data.defaultValue),
        formula: data.formula, isTaxable: data.isTaxable, isPensionable: data.isPensionable,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Component Created', 'Salary component created successfully.', 'success');
  };

  const handleUpdateSalaryComponentForm = async (data: SalaryComponentFormData & { status?: string }) => {
    if (!editingScId) return;
    if (data.calculationMethod === 'FORMULA' && !data.formula) {
      showToast('Formula Required', 'A formula expression is required when calculation method is FORMULA.', 'error');
      return;
    }
    try {
      await salaryComponentApi.update(editingScId, {
        code: data.code.toUpperCase(), name: data.name, type: data.type,
        calculationMethod: data.calculationMethod, defaultValue: Number(data.defaultValue),
        formula: data.formula, isTaxable: data.isTaxable, isPensionable: data.isPensionable,
        status: (data.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Component Updated', 'Salary component updated successfully.', 'success');
    setEditingScId(null);
  };

  const handleToggleSalaryComponentStatus = async (id: string, currentStatus: StandardStatus) => {
    const next: StandardStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      if (next === 'ACTIVE') { await salaryComponentApi.activate(id); }
      else { await salaryComponentApi.delete(id); }
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Status Updated', `Salary component status updated to ${next}.`, 'success');
  };

  const handleDeactivateSalaryComponent = async (id: string) => {
    try {
      await salaryComponentApi.delete(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Component Deactivated', 'Salary component has been set to inactive.', 'info');
  };

  const handleDeleteSalaryComponent = async (id: string) => {
    try {
      await salaryComponentApi.hardDelete(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Component Deleted', 'Salary component has been permanently deleted.', 'info');
  };

  const scCreateForm = useForm<SalaryComponentFormData>({
    resolver: zodResolver(salaryComponentSchema) as any,
    defaultValues: { code: '', name: '', type: 'EARNING', calculationMethod: 'FIXED', defaultValue: 0, formula: '', isTaxable: false, isPensionable: false },
  });

  const scEditForm = useForm<SalaryComponentFormData>({
    resolver: zodResolver(salaryComponentSchema) as any,
    values: editingScId
      ? {
          code: editScCode || '',
          name: editScName || '',
          type: (editScType as any) || 'EARNING',
          calculationMethod: (editScCalculationMethod as any) || 'FIXED',
          defaultValue: editScDefaultValue || 0,
          formula: editScFormula || '',
          isTaxable: editScIsTaxable ?? false,
          isPensionable: editScIsPensionable ?? false,
        }
      : undefined,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          {editingScId ? t('hr.payroll.components.edit') : t('hr.payroll.components.create')}
        </h3>
        {editingScId ? (
          <form
            onSubmit={scEditForm.handleSubmit(async (data: SalaryComponentFormData) => {
               await handleUpdateSalaryComponentForm({ ...data, status: editScStatus as any });
               scEditForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.codeUnique')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.codePlaceholder')}
                {...scEditForm.register('code')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scEditForm.formState.errors.code && <p className="text-[10px] text-red-500 mt-1">{scEditForm.formState.errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.componentName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.componentNamePlaceholder')}
                {...scEditForm.register('name')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scEditForm.formState.errors.name && <p className="text-[10px] text-red-500 mt-1">{scEditForm.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.type')}</label>
                <select
                  {...scEditForm.register('type')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-2 text-xs"
                >
                  <option value="EARNING">{t('hr.payroll.earning')}</option>
                  <option value="DEDUCTION">{t('hr.payroll.deduction')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.calcMethod')}</label>
                <select
                  {...scEditForm.register('calculationMethod')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-2 text-xs"
                >
                  <option value="FIXED">{t('hr.payroll.fixed')}</option>
                  <option value="PERCENTAGE">{t('hr.payroll.percentage')}</option>
                  <option value="FORMULA">{t('hr.payroll.formula')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {scEditForm.watch('calculationMethod') === 'PERCENTAGE' ? t('hr.payroll.defaultPercentage') : t('hr.payroll.defaultValue')}
              </label>
              <input
                type="number"
                step="any"
                placeholder={scEditForm.watch('calculationMethod') === 'PERCENTAGE' ? t('hr.payroll.percentagePlaceholder') : ''}
                {...scEditForm.register('defaultValue', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {t('hr.payroll.formula')} {scEditForm.watch('calculationMethod') === 'FORMULA' ? t('common.required') : t('common.optional')}
              </label>
              <input
                type="text"
                placeholder={t('hr.payroll.formulaPlaceholder')}
                {...scEditForm.register('formula')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scEditForm.watch('calculationMethod') === 'FORMULA' && (
                <p className="text-[10px] text-slate-400 mt-1">{t('hr.payroll.formulaHint')}</p>
              )}
            </div>
            <div className="flex space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...scEditForm.register('isTaxable')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.taxable')}</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...scEditForm.register('isPensionable')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.pensionable')}</span>
              </label>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.status')}</label>
              <select
                value={editScStatus}
                onChange={() => { /* kept in context */ }}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="ACTIVE">{t('hr.payroll.activeStatus')}</option>
                <option value="INACTIVE">{t('hr.payroll.inactiveStatus')}</option>
              </select>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.updateComponent')}
              </button>
              <button
                type="button"
                onClick={() => { setEditingScId(null); scEditForm.reset(); }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-300 rounded-lg text-xs font-semibold py-2 px-3"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={scCreateForm.handleSubmit(async (data: SalaryComponentFormData) => {
               await handleCreateSalaryComponentForm(data);
               scCreateForm.reset();
               queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
             })}
            className="space-y-3 pt-2 text-xs"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.codeUnique')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.codePlaceholder')}
                {...scCreateForm.register('code')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scCreateForm.formState.errors.code && <p className="text-[10px] text-red-500 mt-1">{scCreateForm.formState.errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.componentName')}</label>
              <input
                type="text"
                placeholder={t('hr.payroll.componentNamePlaceholder')}
                {...scCreateForm.register('name')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scCreateForm.formState.errors.name && <p className="text-[10px] text-red-500 mt-1">{scCreateForm.formState.errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.type')}</label>
                <select
                  {...scCreateForm.register('type')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-2 text-xs"
                >
                  <option value="EARNING">{t('hr.payroll.earning')}</option>
                  <option value="DEDUCTION">{t('hr.payroll.deduction')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.calcMethod')}</label>
                <select
                  {...scCreateForm.register('calculationMethod')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-2 text-xs"
                >
                  <option value="FIXED">{t('hr.payroll.fixed')}</option>
                  <option value="PERCENTAGE">{t('hr.payroll.percentage')}</option>
                  <option value="FORMULA">{t('hr.payroll.formula')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {scCreateForm.watch('calculationMethod') === 'PERCENTAGE' ? t('hr.payroll.defaultPercentage') : t('hr.payroll.defaultValue')}
              </label>
              <input
                type="number"
                step="any"
                placeholder={scCreateForm.watch('calculationMethod') === 'PERCENTAGE' ? t('hr.payroll.percentagePlaceholder') : ''}
                {...scCreateForm.register('defaultValue', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                {t('hr.payroll.formula')} {scCreateForm.watch('calculationMethod') === 'FORMULA' ? t('common.required') : t('common.optional')}
              </label>
              <input
                type="text"
                placeholder={t('hr.payroll.formulaPlaceholder')}
                {...scCreateForm.register('formula')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
              {scCreateForm.watch('calculationMethod') === 'FORMULA' && (
                <p className="text-[10px] text-slate-400 mt-1">{t('hr.payroll.formulaHint')}</p>
              )}
            </div>
            <div className="flex space-x-4 pt-1">
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...scCreateForm.register('isTaxable')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.taxable')}</span>
              </label>
              <label className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  {...scCreateForm.register('isPensionable')}
                  className="rounded text-blue-600"
                />
                <span className="text-[10px] font-bold uppercase">{t('hr.payroll.pensionable')}</span>
              </label>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.createComponent')}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Column: List */}
      <div className={`lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${scPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('hr.payroll.systemComponents')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-6">{t('hr.payroll.codeComponent')}</th>
                <th className="py-3 px-4">{t('hr.payroll.type')}</th>
                <th className="py-3 px-4">{t('hr.payroll.calculation')}</th>
                <th className="py-3 px-4">{t('hr.payroll.defaultVal')}</th>
                <th className="py-3 px-4">{t('hr.payroll.taxesPension')}</th>
                <th className="py-3 px-4">{t('hr.payroll.status')}</th>
                <th className="py-3 px-6 text-right">{t('hr.payroll.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {scLoading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.loadingComponents')}</td></tr>
              ) : scItems.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.noComponents')}</td></tr>
              ) : scItems.map((sc) => (
                <tr key={sc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                  <td className="py-3 px-6">
                    <span className="font-bold text-slate-900 dark:text-white block">{sc.code}</span>
                    <span className="text-[10px] text-slate-400">{sc.name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sc.type === 'EARNING' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'}`}>
                      {t('hr.payroll.' + sc.type.toLowerCase())}
                    </span>
                  </td>
                  <td className="py-3 px-4">{t('hr.payroll.' + sc.calculationMethod.toLowerCase())} {sc.formula && `(${sc.formula})`}</td>
                  <td className="py-3 px-4">${sc.defaultValue || 0}</td>
                  <td className="py-3 px-4 text-[10px] space-y-0.5">
                    <p>{t('hr.payroll.taxableYesNo', { taxable: sc.isTaxable ? t('common.yes') : t('common.no') })}</p>
                    <p>{t('hr.payroll.pensionableYesNo', { pensionable: sc.isPensionable ? t('common.yes') : t('common.no') })}</p>
                  </td>
                  <td className="py-3 px-4">
                     <button
                        onClick={() => { handleToggleSalaryComponentStatus(sc.id, sc.status as StandardStatus); queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] }); }}
                       className={`px-2 py-0.5 rounded text-[10px] font-bold ${sc.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                     >
                       {sc.status === 'ACTIVE' ? t('hr.payroll.components.active') : t('hr.payroll.components.inactive')}
                     </button>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end space-x-3 items-center">
                        <button
                          onClick={() => {
                            setEditingScId(sc.id);
                            setEditScCode(sc.code);
                            setEditScName(sc.name);
                            setEditScType(sc.type);
                            setEditScCalculationMethod(sc.calculationMethod);
                            setEditScDefaultValue(sc.defaultValue ?? 0);
                            setEditScFormula(sc.formula ?? '');
                            setEditScIsTaxable(sc.isTaxable);
                            setEditScIsPensionable(sc.isPensionable);
                            setEditScStatus(sc.status as StandardStatus);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:scale-110 transition-transform"
                          title={t('hr.payroll.editComp')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      {sc.status === 'ACTIVE' && (
                         <button
                           onClick={() => { handleDeactivateSalaryComponent(sc.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] }); }}
                           className="text-amber-600 hover:text-amber-800 hover:scale-110 transition-transform"
                           title={t('hr.payroll.deactivate')}
                         >
                           <XCircle className="h-4 w-4" />
                         </button>
                      )}
                       <button
                         onClick={() => { handleDeleteSalaryComponent(sc.id); queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] }); }}
                         className="text-rose-600 hover:text-rose-800 hover:scale-110 transition-transform"
                         title={t('hr.payroll.deleteComponent')}
                       >
                         <Trash className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalItems={scTotalPages * ITEMS_PER_PAGE} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} idPrefix="components" />
      </div>
    </div>
  );
}
