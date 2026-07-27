import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { fmtDT } from '../../lib/utils';
import type { LeaveRequestData, LeaveBalanceData, LeaveTypeData } from './types';

interface EmployeeLeaveTabProps {
  leaves: LeaveRequestData[];
  leaveBalances: LeaveBalanceData[];
  leaveTypes: LeaveTypeData[];
  onSubmitLeave: (data: { leaveTypeId: string; startDate: string; endDate: string; totalDays: number; reason: string }) => void;
  onCancelLeave: (reqId: string) => void;
}

export default function EmployeeLeaveTab({
  leaves,
  leaveBalances,
  leaveTypes,
  onSubmitLeave,
  onCancelLeave,
}: EmployeeLeaveTabProps) {
  const { t } = useTranslation();
  const [leaveFormType, setLeaveFormType] = useState('');
  const [leaveFormStart, setLeaveFormStart] = useState('');
  const [leaveFormEnd, setLeaveFormEnd] = useState('');
  const [leaveFormReason, setLeaveFormReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveFormType || !leaveFormStart || !leaveFormEnd || !leaveFormReason) return;

    const start = new Date(leaveFormStart);
    const end = new Date(leaveFormEnd);
    if (end < start) return;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    onSubmitLeave({
      leaveTypeId: leaveFormType,
      startDate: leaveFormStart,
      endDate: leaveFormEnd,
      totalDays,
      reason: leaveFormReason,
    });

    setLeaveFormType('');
    setLeaveFormStart('');
    setLeaveFormEnd('');
    setLeaveFormReason('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.myLeaveManagement')}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Form column */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-slate-900 text-sm flex items-center">
            <Send className="h-4 w-4 mr-2 text-sky-500" /> {t('employee.fileLeaveRequest')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.leaveType')}</label>
              <select
                value={leaveFormType}
                onChange={(e) => setLeaveFormType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none bg-slate-50 focus:bg-white"
                required
              >
                <option value="">{t('employee.selectLeaveType')}</option>
                {leaveTypes.map(lt => (
                  <option key={lt.id} value={lt.id}>{lt.name} {t('employee.paidLabel', { isPaid: (lt as any).isPaid ? t('employee.paidYes') : t('employee.paidNo') })}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.from')}</label>
                <input
                  type="date"
                  value={leaveFormStart}
                  onChange={(e) => setLeaveFormStart(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.to')}</label>
                <input
                  type="date"
                  value={leaveFormEnd}
                  onChange={(e) => setLeaveFormEnd(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none bg-slate-50 focus:bg-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.reasonDescription')}</label>
              <textarea
                value={leaveFormReason}
                onChange={(e) => setLeaveFormReason(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none bg-slate-50 focus:bg-white"
                placeholder={t('employee.reasonPlaceholder')}
                rows={3}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800 transition-colors"
            >
              {t('employee.applyLeave')}
            </button>
          </form>
        </div>

        {/* List column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('employee.allocatedAnnualLeaveBalance')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {leaveBalances.map(bal => {
                const lt = leaveTypes.find(lt => lt.id === bal.leaveTypeId);
                const rem = Number(bal.entitledDays) - Number(bal.usedDays);
                return (
                  <div key={bal.id} className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400 uppercase">{lt ? lt.name : t('employee.leaveType')}</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-2">{t('employee.daysLeft', { rem, entitled: bal.entitledDays })}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{t('employee.daysUsed', { count: bal.usedDays })}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Requests list */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">{t('employee.previousFiledRequests')}</h3>
            </div>
            {leaves.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 italic">{t('employee.noLeaveRequestsFiled')}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">{t('employee.leaveType')}</th>
                      <th className="p-4">{t('employee.period')}</th>
                      <th className="p-4">{t('employee.duration')}</th>
                      <th className="p-4">{t('employee.status')}</th>
                      <th className="p-4">{t('employee.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                    {leaves.map(req => {
                      const lt = leaveTypes.find(lt => lt.id === req.leaveTypeId);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                          <td className="p-4 font-semibold">{lt ? lt.name : t('employee.unknown')}</td>
                          <td className="p-4">{fmtDT(req.startDate)} {t('employee.to')} {fmtDT(req.endDate)}</td>
                          <td className="p-4">{t('employee.daysCount', { count: req.totalDays })}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' : req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : req.status === 'REJECTED' ? 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              {req.status === 'PENDING' ? t('employee.pending') : req.status === 'APPROVED' ? t('employee.approved') : req.status === 'REJECTED' ? t('employee.rejected') : t('employee.cancelled')}
                            </span>
                          </td>
                          <td className="p-4">
                            {req.status === 'PENDING' && (
                              <button
                                onClick={() => onCancelLeave(req.id)}
                                className="text-xs text-rose-600 hover:text-rose-500 font-bold"
                              >
                                {t('employee.cancel')}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
