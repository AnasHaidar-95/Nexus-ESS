import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, positionSchema, DepartmentFormData, PositionFormData } from '../../lib/formSchemas';

interface OrgTabProps {
  departments: any[];
  positions: any[];
  onSubmitDept: (data: DepartmentFormData) => Promise<void>;
  onSubmitPos: (data: PositionFormData) => Promise<void>;
  setViewingDept: (d: any) => void;
  setViewingPosition: (p: any) => void;
}

export default function OrgTab({
  departments,
  positions,
  onSubmitDept,
  onSubmitPos,
  setViewingDept,
  setViewingPosition,
}: OrgTabProps) {
  const { t } = useTranslation();
  const deptForm = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  const posForm = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues: { name: '', code: '', description: '', grade: 1 },
  });

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{t('hr.org.title')}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.org.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">{t('hr.org.departments')}</h3>

          <form onSubmit={deptForm.handleSubmit(onSubmitDept)} className="space-y-3 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-xs text-slate-400 uppercase">{t('hr.org.createDept')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" placeholder={t('hr.org.deptNamePlaceholder')}
                  {...deptForm.register('name')}
                  className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none w-full" />
                {deptForm.formState.errors.name && <p className="text-[10px] text-rose-500 mt-1">{deptForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <input type="text" placeholder={t('hr.org.deptCodePlaceholder')}
                  {...deptForm.register('code')}
                  className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none w-full" />
                {deptForm.formState.errors.code && <p className="text-[10px] text-rose-500 mt-1">{deptForm.formState.errors.code.message}</p>}
              </div>
            </div>
            <input type="text" placeholder={t('hr.org.descriptionPlaceholder')}
              {...deptForm.register('description')}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none" />
            <button type="submit" disabled={deptForm.formState.isSubmitting}
              className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold py-2 disabled:opacity-50">
              {deptForm.formState.isSubmitting ? t('hr.org.adding') : t('hr.org.addDepartment')}
            </button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
            {departments.map(d => (
              <div key={d.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors" onClick={() => setViewingDept(d)}>
                <div>
                  <p className="font-semibold text-slate-800">{d.name} ({d.code})</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{d.description || t('hr.org.noDescription')}</p>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{d.status === 'ACTIVE' ? t('hr.employees.active') : t('hr.employees.inactive')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">{t('hr.org.jobPositions')}</h3>

          <form onSubmit={posForm.handleSubmit(onSubmitPos)} className="space-y-3 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-xs text-slate-400 uppercase">{t('hr.org.createPosition')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" placeholder={t('hr.org.positionTitlePlaceholder')}
                  {...posForm.register('name')}
                  className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none w-full" />
                {posForm.formState.errors.name && <p className="text-[10px] text-rose-500 mt-1">{posForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <input type="text" placeholder={t('hr.org.positionCodePlaceholder')}
                  {...posForm.register('code')}
                  className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none w-full" />
                {posForm.formState.errors.code && <p className="text-[10px] text-rose-500 mt-1">{posForm.formState.errors.code.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder={t('hr.org.descriptionPlaceholder')}
                {...posForm.register('description')}
                className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none" />
              <div>
                <input type="number" placeholder={t('hr.org.gradePlaceholder')}
                  {...posForm.register('grade', { valueAsNumber: true })}
                  className="rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none w-full" />
                {posForm.formState.errors.grade && <p className="text-[10px] text-rose-500 mt-1">{posForm.formState.errors.grade.message}</p>}
              </div>
            </div>
            <button type="submit" disabled={posForm.formState.isSubmitting}
              className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-semibold py-2 disabled:opacity-50">
              {posForm.formState.isSubmitting ? t('hr.org.adding') : t('hr.org.addPosition')}
            </button>
          </form>

          <div className="space-y-2 max-h-64 overflow-y-auto pt-2">
            {positions.map(p => (
              <div key={p.id} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors" onClick={() => setViewingPosition(p)}>
                <div>
                  <p className="font-semibold text-slate-800">{p.name} ({p.code})</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t('hr.org.gradeLevel', { grade: p.grade || 1 })}</p>
                </div>
                <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold uppercase text-[9px]">{p.status === 'ACTIVE' ? t('hr.employees.active') : t('hr.employees.inactive')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}