import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shiftSchema, shiftAssignmentSchema, ShiftFormData, ShiftAssignmentFormData } from '../../lib/formSchemas';
import { useQueryClient } from '@tanstack/react-query';
import { shiftApi } from '../../lib/shifts';
import { shiftAssignmentApi } from '../../lib/shift-assignments';
import Pagination from './Pagination';
import { Clock, User as UserIcon, Trash, Download } from 'lucide-react';
import { useShifts } from '../../hooks/queries/useShifts';
import { useShiftAssignments } from '../../hooks/queries/useShiftAssignments';
import { useNotificationStore } from '../../stores/notificationStore';

interface ShiftsTabProps {
  shifts: any[];
  employees: any[];
  fmtDT: (v: string) => string;
}

export default function ShiftsTab({
  shifts: shiftsProp,
  employees,
  fmtDT,
}: ShiftsTabProps) {
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const { t } = useTranslation();

  const [activeShiftsPage, setActiveShiftsPage] = React.useState(1);
  const [assignmentsPage, setAssignmentsPage] = React.useState(1);

  const ASSIGNMENTS_PER_PAGE = 10;
  const ACTIVE_SHIFTS_PER_PAGE = 4;

  const { data: shiftRes, isLoading: shiftsLoading, isPlaceholderData: shiftsPlaceholder } = useShifts({ page: activeShiftsPage, pageSize: ACTIVE_SHIFTS_PER_PAGE });
  const { data: assignRes, isLoading: assignmentsLoading, isPlaceholderData: assignsPlaceholder } = useShiftAssignments({ page: assignmentsPage, pageSize: ASSIGNMENTS_PER_PAGE });

  const { data: allShiftRes } = useShifts({ pageSize: 500 });
  const allShifts = allShiftRes?.items ?? [];
  const { data: allAssignRes } = useShiftAssignments({ pageSize: 500 });
  const allAssignments = allAssignRes?.items ?? [];

  const paginatedShifts = shiftRes?.items ?? [];
  const shiftsTotalCount = shiftRes?.pagination?.totalItems ?? 0;
  const assignments = assignRes?.items ?? [];
  const assignmentsTotalCount = assignRes?.pagination?.totalItems ?? 0;

  const createShiftForm = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: { name: '', code: '', startTime: '09:00', endTime: '17:00' },
  });

  const assignShiftForm = useForm<ShiftAssignmentFormData>({
    resolver: zodResolver(shiftAssignmentSchema),
    defaultValues: { employeeId: '', shiftId: '', effectiveFrom: '', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], notes: '' },
  });

  const renderShiftPagination = () => (
    <Pagination
      currentPage={activeShiftsPage}
      totalItems={shiftsTotalCount}
      itemsPerPage={ACTIVE_SHIFTS_PER_PAGE}
      onPageChange={setActiveShiftsPage}
      idPrefix="active-shifts"
    />
  );

  const renderAssignmentPagination = () => (
    <div className="px-6 pt-2">
      <Pagination
        currentPage={assignmentsPage}
        totalItems={assignmentsTotalCount}
        itemsPerPage={ASSIGNMENTS_PER_PAGE}
        onPageChange={setAssignmentsPage}
        idPrefix="shifts"
      />
    </div>
  );

  const generateAssignmentsCSV = () => {
    const headers = [t('hr.shifts.empId'), t('hr.shifts.name'), t('hr.shifts.assignedShift'), t('hr.shifts.workingDays'), t('hr.shifts.shiftHours'), t('hr.shifts.effectiveFrom'), t('hr.shifts.status')];
    const rows = allAssignments.map(sa => {
      const emp = employees.find(e => e.id === sa.employeeId);
      const shift = allShifts.find(s => s.id === sa.shiftId);
      const startH = Math.floor((shift?.startTimeMinutes ?? 0) / 60);
      const startM = (shift?.startTimeMinutes ?? 0) % 60;
      const endH = Math.floor((shift?.endTimeMinutes ?? 0) / 60);
      const endM = (shift?.endTimeMinutes ?? 0) % 60;
      return [
        emp?.employeeNumber || '',
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        shift?.name || '',
        (sa.daysOfWeek || []).join(', '),
        `${startH < 10 ? '0' + startH : startH}:${startM < 10 ? '0' + startM : startM} - ${endH < 10 ? '0' + endH : endH}:${endM < 10 ? '0' + endM : endM}`,
        sa.effectiveFrom || '',
        !sa.effectiveTo ? 'ACTIVE' : 'EXPIRED',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-assignments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('hr.shifts.title')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.shifts.subtitle')}</p>
        </div>
        <button onClick={generateAssignmentsCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Download className="h-4 w-4" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              {t('hr.shifts.addShift')}
            </h3>
            <form onSubmit={createShiftForm.handleSubmit(async (data) => {
              const [sH, sM] = data.startTime.split(':').map(Number);
              const [eH, eM] = data.endTime.split(':').map(Number);
              try {
                await shiftApi.create({
                  name: data.name,
                  code: data.code.toUpperCase(),
                  startTimeMinutes: sH * 60 + sM,
                  endTimeMinutes: eH * 60 + eM,
                  breakMinutes: 60,
                  graceMinutes: 15,
                });
              } catch (err: any) {
                showToast('Error', err?.message || 'Failed to create shift.', 'error');
                return;
              }
              showToast('Shift Created', `Shift "${data.name}" created successfully.`, 'success');
              createShiftForm.reset({ name: '', code: '', startTime: '09:00', endTime: '17:00' });
              queryClient.invalidateQueries({ queryKey: ['shifts'] });
            })} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 items-end">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.shiftName')}</label>
                <input {...createShiftForm.register('name')} placeholder={t('hr.shifts.namePlaceholder')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
                {createShiftForm.formState.errors.name && <p className="text-[10px] text-red-500 mt-1">{createShiftForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.shiftCode')}</label>
                <input {...createShiftForm.register('code')} placeholder={t('hr.shifts.codePlaceholder')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
                {createShiftForm.formState.errors.code && <p className="text-[10px] text-red-500 mt-1">{createShiftForm.formState.errors.code.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.startHour')}</label>
                <input type="time" {...createShiftForm.register('startTime')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
                {createShiftForm.formState.errors.startTime && <p className="text-[10px] text-red-500 mt-1">{createShiftForm.formState.errors.startTime.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.endHour')}</label>
                <input type="time" {...createShiftForm.register('endTime')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
                {createShiftForm.formState.errors.endTime && <p className="text-[10px] text-red-500 mt-1">{createShiftForm.formState.errors.endTime.message}</p>}
              </div>
              <div className="sm:col-span-4">
                <button type="submit" disabled={createShiftForm.formState.isSubmitting} className="w-full bg-slate-950 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 transition-colors disabled:opacity-50">
                  {t('hr.shifts.registerTemplate')}
                </button>
              </div>
            </form>
          </div>

          <div className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between transition-opacity ${shiftsPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.shifts.activeShifts', { count: shiftsLoading ? '...' : shiftsTotalCount })}</h3>
              {shiftsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 animate-pulse h-28" />
                  ))}
                </div>
              ) : paginatedShifts.length === 0 ? (
                <p className="text-sm text-slate-400 italic mt-3">{t('hr.shifts.noShifts')}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  {paginatedShifts.map(s => {
                    const startH = Math.floor(s.startTimeMinutes / 60);
                    const startM = s.startTimeMinutes % 60;
                    const endH = Math.floor(s.endTimeMinutes / 60);
                    const endM = s.endTimeMinutes % 60;
                    return (
                      <div key={s.id} className="border border-slate-100 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                          <span className="bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{s.code}</span>
                        </div>
                        <p className="text-slate-500 text-[11px]">{s.description || t('hr.shifts.defaultDesc')}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {t('hr.shifts.clock', { start: `${startH < 10 ? '0' + startH : startH}:${startM < 10 ? '0' + startM : startM}`, end: `${endH < 10 ? '0' + endH : endH}:${endM < 10 ? '0' + endM : endM}` })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-slate-50">
              {renderShiftPagination()}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-emerald-600" />
              {t('hr.shifts.assignShift')}
            </h3>
            <form onSubmit={assignShiftForm.handleSubmit(async (data) => {
              try {
                await shiftAssignmentApi.create({
                  employeeId: data.employeeId,
                  shiftId: data.shiftId,
                  effectiveFrom: data.effectiveFrom,
                  daysOfWeek: data.daysOfWeek,
                  notes: data.notes || undefined,
                });
              } catch (err: any) {
                showToast('Error', err?.message || 'Failed to assign shift.', 'error');
                return;
              }
              showToast('Shift Assigned', 'Shift assignment created successfully.', 'success');
              assignShiftForm.reset({ employeeId: '', shiftId: '', effectiveFrom: '', daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], notes: '' });
              queryClient.invalidateQueries({ queryKey: ['shiftAssignments'] });
              queryClient.invalidateQueries({ queryKey: ['shifts'] });
            })} className="space-y-4 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.selectEmployee')}</label>
                <select {...assignShiftForm.register('employeeId')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800">
                  <option value="">{t('hr.shifts.chooseEmployee')}</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeNumber})</option>
                  ))}
                </select>
                {assignShiftForm.formState.errors.employeeId && <p className="text-[10px] text-red-500 mt-1">{assignShiftForm.formState.errors.employeeId.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.selectShiftSystem')}</label>
                <select {...assignShiftForm.register('shiftId')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800">
                  <option value="">{t('hr.shifts.chooseShift')}</option>
                  {shiftsProp.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
                {assignShiftForm.formState.errors.shiftId && <p className="text-[10px] text-red-500 mt-1">{assignShiftForm.formState.errors.shiftId.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.effectiveDate')}</label>
                <input type="date" {...assignShiftForm.register('effectiveFrom')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
                {assignShiftForm.formState.errors.effectiveFrom && <p className="text-[10px] text-red-500 mt-1">{assignShiftForm.formState.errors.effectiveFrom.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">{t('hr.shifts.workingDays')}</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const selected = assignShiftForm.watch('daysOfWeek') || [];
                    const isSelected = selected.includes(day);
                    return (
                      <label key={day} className={`flex items-center justify-center px-2.5 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all select-none ${isSelected ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isSelected}
                          onChange={() => {
                            const current = assignShiftForm.getValues('daysOfWeek') || [];
                            const next = isSelected ? current.filter(d => d !== day) : [...current, day];
                            assignShiftForm.setValue('daysOfWeek', next, { shouldValidate: true });
                          }}
                        />
                        {day}
                      </label>
                    );
                  })}
                </div>
                {assignShiftForm.formState.errors.daysOfWeek && <p className="text-[10px] text-red-500 mt-1">{assignShiftForm.formState.errors.daysOfWeek.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.shifts.assignmentNotes')}</label>
                <input {...assignShiftForm.register('notes')} placeholder={t('hr.shifts.notesPlaceholder')}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs outline-none text-slate-800" />
              </div>
              <button type="submit" disabled={assignShiftForm.formState.isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold py-2.5 transition-colors disabled:opacity-50">
                {t('hr.shifts.assignBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden space-y-4 py-6 transition-opacity ${assignsPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="px-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.shifts.assignmentsTitle')}</h3>
          <p className="text-slate-500 text-xs mt-1">{t('hr.shifts.assignmentsSubtitle')}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-6">{t('hr.shifts.empId')}</th>
                <th className="py-3 px-6">{t('hr.shifts.name')}</th>
                <th className="py-3 px-6">{t('hr.shifts.assignedShift')}</th>
                <th className="py-3 px-6">{t('hr.shifts.workingDays')}</th>
                <th className="py-3 px-6">{t('hr.shifts.shiftHours')}</th>
                <th className="py-3 px-6">{t('hr.shifts.effectiveFrom')}</th>
                <th className="py-3 px-6">{t('hr.shifts.status')}</th>
                <th className="py-3 px-6">{t('hr.shifts.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {assignmentsLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 px-6 text-center text-slate-400 italic">{t('hr.shifts.loading')}</td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-6 text-center text-slate-400 italic">{t('hr.shifts.noAssignments')}</td>
                </tr>
              ) : (
                assignments.map(sa => {
                  const emp = employees.find(e => e.id === sa.employeeId);
                  if (!emp) return null;
                  const shift = shiftsProp.find(s => s.id === sa.shiftId);
                  const startH = Math.floor((shift?.startTimeMinutes ?? 0) / 60);
                  const startM = (shift?.startTimeMinutes ?? 0) % 60;
                  const endH = Math.floor((shift?.endTimeMinutes ?? 0) / 60);
                  const endM = (shift?.endTimeMinutes ?? 0) % 60;
                  return (
                    <tr key={sa.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                      <td className="py-3 px-6 font-bold text-slate-900">{emp.employeeNumber}</td>
                      <td className="py-3 px-6">{emp.firstName} {emp.lastName}</td>
                      <td className="py-3 px-6 font-semibold text-blue-600">{shift?.name} ({shift?.code})</td>
                      <td className="py-3 px-6">
                        <div className="flex flex-wrap gap-0.5">
                          {(sa.daysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(d => (
                            <span key={d} className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">{d}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-6 font-mono text-[11px]">
                        {startH < 10 ? '0' + startH : startH}:{startM < 10 ? '0' + startM : startM} - {endH < 10 ? '0' + endH : endH}:{endM < 10 ? '0' + endM : endM}
                      </td>
                      <td className="py-3 px-6">{fmtDT(sa.effectiveFrom)}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${!sa.effectiveTo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          {!sa.effectiveTo ? t('hr.shifts.active') : t('hr.shifts.expired', { date: fmtDT(sa.effectiveTo) })}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <button onClick={async () => {
                          try {
                            await shiftAssignmentApi.end(sa.id, { effectiveTo: new Date().toISOString().split('T')[0] });
                          } catch (err: any) {
                            showToast('Error', err?.message || 'Failed to remove assignment.', 'error');
                            return;
                          }
                          showToast('Assignment Ended', 'Shift assignment has been ended.', 'success');
                          queryClient.invalidateQueries({ queryKey: ['shiftAssignments'] });
                        }} className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline">
                          <Trash className="h-3.5 w-3.5" /> {t('hr.shifts.remove')}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {renderAssignmentPagination()}
      </div>
    </div>
  );
}
