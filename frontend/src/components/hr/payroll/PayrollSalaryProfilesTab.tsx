import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Trash, XCircle, Download } from 'lucide-react';
import Pagination from '../Pagination';
import { employeeSalaryProfileApi } from '../../../lib/employee-salary-profiles';
import { useNotificationStore } from '../../../stores/notificationStore';
import { useEmployees } from '../../../hooks/queries/useEmployees';
import { useSalaryComponents, useSalaryProfiles } from '../../../hooks/queries/usePayroll';
import {
  salaryProfileSchema,
  bulkSalaryProfileSchema,
  type SalaryProfileFormData,
  type BulkSalaryProfileFormData,
} from '../../../lib/formSchemas';

interface PayrollSalaryProfilesTabProps {
  page: number;
  setPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  fmtDT: (v: string) => string;
  departments: any[];
}

export default function PayrollSalaryProfilesTab({
  page,
  setPage,
  ITEMS_PER_PAGE,
  fmtDT,
  departments,
}: PayrollSalaryProfilesTabProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [editingSpId, setEditingSpId] = useState<string | null>(null);
  const [editSpEmployeeId, setEditSpEmployeeId] = useState('');
  const [editSpSalaryComponentId, setEditSpSalaryComponentId] = useState('');
  const [editSpEffectiveFrom, setEditSpEffectiveFrom] = useState('');
  const [editSpEffectiveTo, setEditSpEffectiveTo] = useState('');
  const [editSpCustomValue, setEditSpCustomValue] = useState<number | ''>('');

  const { data: empRes } = useEmployees({ pageSize: 500 });
  const employees = empRes?.items || [];
  const { data: spRes, isLoading: spLoading, isPlaceholderData: spPlaceholder } = useSalaryProfiles({ page, pageSize: ITEMS_PER_PAGE });
  const spItems = spRes?.items || [];
  const spTotalPages = spRes?.pagination?.totalPages || 1;
  const { data: allSpRes } = useSalaryProfiles({ pageSize: 9999 });
  const allSpItems = allSpRes?.items || [];
  const { data: allScRes } = useSalaryComponents({ pageSize: 500, status: 'ACTIVE' });
  const allScItems = allScRes?.items || [];

  // --- Salary Profile Handlers ---
  const handleCreateSalaryProfileForm = async (data: SalaryProfileFormData) => {
    try {
      await employeeSalaryProfileApi.create({
        employeeId: data.employeeId, salaryComponentId: data.salaryComponentId,
        effectiveFrom: data.effectiveFrom,         customValue: data.customValue ?? undefined,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Component Created', 'Employee salary profile component successfully created.', 'success');
    setPage(1);
  };

  const handleUpdateSalaryProfileForm = async (data: { employeeId: string; salaryComponentId: string; customValue: number | string; effectiveFrom: string; effectiveTo?: string }) => {
    if (!editingSpId) return;
    try {
      await employeeSalaryProfileApi.update(editingSpId, {
        employeeId: data.employeeId,
        salaryComponentId: data.salaryComponentId,
        customValue: (data.customValue === '' || data.customValue === undefined) ? null : Number(data.customValue),
        effectiveFrom: data.effectiveFrom || undefined,
        effectiveTo: data.effectiveTo || undefined,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Component Updated', 'Employee salary profile component successfully updated.', 'success');
    setEditingSpId(null);
  };

  const handleDeleteSalaryProfile = async (id: string, _employeeId: string) => {
    try {
      await employeeSalaryProfileApi.delete(id);
    } catch (err: any) {
      if (err?.status === 404) {
        showToast('Already Deleted', 'This salary profile no longer exists.', 'info');
        return;
      }
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Component Deleted', 'Employee salary profile component permanently deleted.', 'info');
  };

  const handleEndSalaryProfile = async (id: string, _employeeId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await employeeSalaryProfileApi.end(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Operation failed', 'error');
      return;
    }
    showToast('Profile Component Ended', `Salary profile component ended on ${todayStr}.`, 'info');
  };

  const handleBulkAssignSalaryProfileForm = async (data: BulkSalaryProfileFormData) => {
    const deptEmployees = employees.filter(emp => emp.departmentId === data.departmentId);
    if (deptEmployees.length === 0) {
      showToast('No Employees', 'No active employees found in this department.', 'error');
      return;
    }
    let created = 0;
    for (const emp of deptEmployees) {
      try {
        await employeeSalaryProfileApi.create({
          employeeId: emp.id, salaryComponentId: data.salaryComponentId,
          effectiveFrom: data.effectiveFrom, customValue: data.customValue ?? undefined,
        });
        created++;
      } catch { /* skip */ }
    }
    showToast('Bulk Assign Complete', `Assigned compensation component to ${created} of ${deptEmployees.length} employees.`, 'success');
  };

  const spCreateForm = useForm<SalaryProfileFormData>({
    resolver: zodResolver(salaryProfileSchema),
    defaultValues: { employeeId: '', salaryComponentId: '', effectiveFrom: '', effectiveTo: '', customValue: undefined },
  });

  const spEditForm = useForm<SalaryProfileFormData>({
    resolver: zodResolver(salaryProfileSchema),
    values: editingSpId
      ? {
          employeeId: editSpEmployeeId || '',
          salaryComponentId: editSpSalaryComponentId || '',
          effectiveFrom: editSpEffectiveFrom || '',
          effectiveTo: editSpEffectiveTo || '',
          customValue: editSpCustomValue === '' ? undefined : (editSpCustomValue as number),
        }
      : undefined,
  });

  const bulkSpForm = useForm<BulkSalaryProfileFormData>({
    resolver: zodResolver(bulkSalaryProfileSchema),
    defaultValues: { departmentId: '', salaryComponentId: '', effectiveFrom: '', effectiveTo: '' },
  });

  return (
    <div className="space-y-8">
      {/* Top Row: Two Forms Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Assign Compensation Component */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit min-h-[420px]">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {editingSpId ? t('hr.payroll.salaryProfiles.edit') : t('hr.payroll.salaryProfiles.assign')}
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-2">{t('hr.payroll.salaryProfilesHint')}</p>
          {editingSpId ? (
            <form
              onSubmit={spEditForm.handleSubmit(async (data) => {
                await handleUpdateSalaryProfileForm({
                  employeeId: data.employeeId,
                  salaryComponentId: data.salaryComponentId,
                  customValue: data.customValue ?? '',
                  effectiveFrom: data.effectiveFrom,
                  effectiveTo: data.effectiveTo || undefined,
                });
                spEditForm.reset();
                queryClient.invalidateQueries({ queryKey: ['payroll', 'salaryProfiles'] });
              })}
              className="space-y-3 pt-2 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.thEmployee')}</label>
                <select
                  {...spEditForm.register('employeeId')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
                >
                  <option value="">{t('hr.payroll.selectEmployee')}</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.salaryComponent')}</label>
                <select
                  {...spEditForm.register('salaryComponentId')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
                >
                  <option value="">{t('hr.payroll.selectComponent')}</option>
                  {allScItems.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.code} ({sc.name})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.customValue')} <span className="text-slate-400 dark:text-slate-500 font-normal">{t('common.optional')}</span></label>
                <input
                  type="number"
                  placeholder={t('hr.payroll.customValueHint')}
                  {...spEditForm.register('customValue', { setValueAs: (v) => v === '' || v === undefined || v === null ? undefined : Number(v) })}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveFrom')}</label>
                  <input
                    type="date"
                    {...spEditForm.register('effectiveFrom')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveTo')}</label>
                  <input
                    type="date"
                    {...spEditForm.register('effectiveTo')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="pt-2 flex space-x-2">
                <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                  {t('hr.payroll.updateComp')}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingSpId(null); spEditForm.reset(); }}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 dark:text-slate-300 rounded-lg text-xs font-semibold py-2 px-3"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={spCreateForm.handleSubmit(async (data) => {
                await handleCreateSalaryProfileForm(data);
                spCreateForm.reset();
                queryClient.invalidateQueries({ queryKey: ['payroll', 'salaryProfiles'] });
              })}
              className="space-y-3 pt-2 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.thEmployee')}</label>
                <select
                  {...spCreateForm.register('employeeId')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
                >
                  <option value="">{t('hr.payroll.selectEmployee')}</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                  ))}
                </select>
                {spCreateForm.formState.errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{spCreateForm.formState.errors.employeeId.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.salaryComponent')}</label>
                <select
                  {...spCreateForm.register('salaryComponentId')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
                >
                  <option value="">{t('hr.payroll.selectComponent')}</option>
                  {allScItems.map(sc => (
                    <option key={sc.id} value={sc.id}>{sc.code} ({sc.name})</option>
                  ))}
                </select>
                {spCreateForm.formState.errors.salaryComponentId && <p className="text-[10px] text-red-500 mt-1">{spCreateForm.formState.errors.salaryComponentId.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.customValue')} <span className="text-slate-400 dark:text-slate-500 font-normal">{t('common.optional')}</span></label>
                <input
                  type="number"
                  placeholder={t('hr.payroll.customValueHint')}
                  {...spCreateForm.register('customValue', { setValueAs: (v) => v === '' || v === undefined || v === null ? undefined : Number(v) })}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveFrom')}</label>
                  <input
                    type="date"
                    {...spCreateForm.register('effectiveFrom')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                  />
                  {spCreateForm.formState.errors.effectiveFrom && <p className="text-[10px] text-red-500 mt-1">{spCreateForm.formState.errors.effectiveFrom.message}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveTo')}</label>
                  <input
                    type="date"
                    {...spCreateForm.register('effectiveTo')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="pt-2 flex space-x-2">
                <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                  {t('hr.payroll.assignComp')}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Bulk Assign by Department */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit min-h-[420px]">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('hr.payroll.bulkAssign')}</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-2">{t('hr.payroll.bulkHint')}</p>
          <form onSubmit={bulkSpForm.handleSubmit(async (data) => {
            await handleBulkAssignSalaryProfileForm(data);
            bulkSpForm.reset();
            queryClient.invalidateQueries({ queryKey: ['payroll', 'salaryProfiles'] });
          })} className="space-y-3 pt-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.department')}</label>
              <select
                {...bulkSpForm.register('departmentId')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="">{t('hr.payroll.selectDepartment')}</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({employees.filter(e => e.departmentId === d.id).length} {t('hr.payroll.runs.employees')})</option>
                ))}
              </select>
              {bulkSpForm.formState.errors.departmentId && <p className="text-[10px] text-red-500 mt-1">{bulkSpForm.formState.errors.departmentId.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.salaryComponent')}</label>
              <select
                {...bulkSpForm.register('salaryComponentId')}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 py-2 px-3 text-xs"
              >
                <option value="">{t('hr.payroll.selectComponent')}</option>
                {allScItems.map(sc => (
                  <option key={sc.id} value={sc.id}>{sc.code} ({sc.name})</option>
                ))}
              </select>
              {bulkSpForm.formState.errors.salaryComponentId && <p className="text-[10px] text-red-500 mt-1">{bulkSpForm.formState.errors.salaryComponentId.message}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.customValue')} <span className="text-slate-400 dark:text-slate-500 font-normal">{t('common.optional')}</span></label>
              <input
                type="number"
                placeholder={t('hr.payroll.customValueHint')}
                {...bulkSpForm.register('customValue', { setValueAs: (v) => v === '' || v === undefined || v === null ? undefined : Number(v) })}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveFrom')}</label>
                <input
                  type="date"
                  {...bulkSpForm.register('effectiveFrom')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                />
                {bulkSpForm.formState.errors.effectiveFrom && <p className="text-[10px] text-red-500 mt-1">{bulkSpForm.formState.errors.effectiveFrom.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.payroll.effectiveTo')}</label>
                <input
                  type="date"
                  {...bulkSpForm.register('effectiveTo')}
                  className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 py-2 px-3 text-xs outline-none bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
            <div className="pt-2 flex space-x-2">
              <button type="submit" className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2">
                {t('hr.payroll.bulkAssignBtn')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Row: Full Width Table */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${spPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.payroll.profilesList')}</h3>
          <button onClick={() => {
            const headers = [t('hr.payroll.empCol'), t('hr.payroll.componentCol'), t('hr.payroll.effectiveDates'), t('hr.payroll.status'), t('hr.payroll.value')];
            const rows = allSpItems.map(sp => {
              const emp = sp.employee || employees.find(e => e.id === sp.employeeId);
              const comp = sp.salaryComponent || allScItems.find(c => c.id === sp.salaryComponentId);
              return [emp ? `${emp.firstName} ${emp.lastName}` : '', comp?.code || '', `${sp.effectiveFrom}${sp.effectiveTo ? ' - ' + sp.effectiveTo : ''}`, sp.effectiveTo ? 'Ended' : 'Active', sp.customValue ?? comp?.defaultValue ?? 0];
            });
            const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `salary-profiles-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
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
                <th className="py-3 px-6">{t('hr.payroll.empCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.componentCol')}</th>
                <th className="py-3 px-4">{t('hr.payroll.effectiveDates')}</th>
                <th className="py-3 px-4">{t('hr.payroll.status')}</th>
                <th className="py-3 px-4">{t('hr.payroll.value')}</th>
                <th className="py-3 px-6 text-right">{t('hr.payroll.thActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {spLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.loadingSP')}</td></tr>
              ) : spItems.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.payroll.noProfilesSP')}</td></tr>
              ) : spItems.map((sp) => {
                const emp = sp.employee || employees.find(e => e.id === sp.employeeId);
                const comp = sp.salaryComponent || allScItems.find(c => c.id === sp.salaryComponentId);
                return (
                  <tr key={sp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10">
                    <td className="py-3 px-6 font-bold text-slate-900 dark:text-white">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{comp?.code}</span>
                      <span className="text-[10px] text-slate-400">{comp?.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {sp.effectiveTo ? t('hr.payroll.fromTo', { from: fmtDT(sp.effectiveFrom), to: fmtDT(sp.effectiveTo) }) : t('hr.payroll.fromOngoing', { from: fmtDT(sp.effectiveFrom) })}
                    </td>
                    <td className="py-3 px-4">
                      {sp.effectiveTo ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {t('hr.payroll.ended')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">
                          {t('hr.payroll.activeSP')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">${Number(sp.customValue ?? comp?.defaultValue ?? 0).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex justify-end space-x-3 items-center">
                        {editingSpId === sp.id ? (
                          <button
                            onClick={() => { setEditingSpId(null); spEditForm.reset(); }}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-110 transition-transform"
                            title={t('hr.payroll.cancelEdit')}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingSpId(sp.id);
                              setEditSpEmployeeId(sp.employeeId);
                              setEditSpSalaryComponentId(sp.salaryComponentId);
                              setEditSpEffectiveFrom(sp.effectiveFrom ? sp.effectiveFrom.split('T')[0] : '');
                              setEditSpEffectiveTo(sp.effectiveTo ? sp.effectiveTo.split('T')[0] : '');
                              setEditSpCustomValue(sp.customValue ?? '');
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:scale-110 transition-transform"
                            title={t('hr.payroll.editProfileSP')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {!sp.effectiveTo && (
                          <button
                            onClick={() => handleEndSalaryProfile(sp.id, sp.employeeId).then(() => queryClient.invalidateQueries({ queryKey: ['payroll', 'salaryProfiles'] }))}
                            className="text-amber-600 hover:text-amber-800 hover:scale-110 transition-transform"
                            title={t('hr.payroll.endProfile')}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSalaryProfile(sp.id, sp.employeeId).then(() => queryClient.invalidateQueries({ queryKey: ['payroll', 'salaryProfiles'] }))}
                          className="text-rose-600 hover:text-rose-800 hover:scale-110 transition-transform"
                            title={t('hr.payroll.deleteProfileSP')}
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
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800">
           <Pagination currentPage={page} totalItems={spTotalPages * ITEMS_PER_PAGE} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setPage} idPrefix="salary-profiles" />
        </div>
      </div>
    </div>
  );
}
