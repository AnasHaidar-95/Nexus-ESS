import { useTranslation } from 'react-i18next';
import { ClipboardList, Clock, Calendar, XCircle } from 'lucide-react';
import { formatTimeFromMinutes } from './utils';
import type { ShiftData, LeaveBalanceData, LeaveTypeData, LeaveRequestData, Holiday } from './types';

interface EmployeeDetailModalsProps {
  activeModal: 'leaves' | 'schedule' | 'holidays' | null;
  onClose: () => void;
  leaveBalances: LeaveBalanceData[];
  leaveTypes: LeaveTypeData[];
  leaves: LeaveRequestData[];
  shift: ShiftData | null;
  shiftAssignmentDaysOfWeek: string[] | null;
  holidays: Holiday[];
}

export default function EmployeeDetailModals({
  activeModal,
  onClose,
  leaveBalances,
  leaveTypes,
  leaves,
  shift,
  shiftAssignmentDaysOfWeek,
  holidays,
}: EmployeeDetailModalsProps) {
  const { t } = useTranslation();

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-slate-50 dark:bg-slate-950/25">
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base flex items-center gap-2">
            {activeModal === 'leaves' && (
              <>
                <ClipboardList className="h-5 w-5 text-sky-500" />
                <span>{t('employee.detailedLeaveProfile')}</span>
              </>
            )}
            {activeModal === 'schedule' && (
              <>
                <Clock className="h-5 w-5 text-amber-500" />
                <span>{t('employee.weeklyShiftScheduleDetails')}</span>
              </>
            )}
            {activeModal === 'holidays' && (
              <>
                <Calendar className="h-5 w-5 text-emerald-500" />
                <span>{t('employee.holidayCalendarObservations')}</span>
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto text-xs space-y-4">
          {activeModal === 'leaves' && (
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400 leading-normal">
                {t('employee.detailLeaveDesc')}
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {leaveBalances.map(bal => {
                  const lt = leaveTypes.find(lt => lt.id === bal.leaveTypeId);
                  const rem = Number(bal.entitledDays) - Number(bal.usedDays);
                  const percentage = Math.max(0, Math.min(100, (rem / Number(bal.entitledDays)) * 100));
                  return (
                    <div key={bal.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-2">
                      <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                        <span>{lt ? lt.name : t('employee.unknownLeave')}</span>
                        <span className="text-blue-600 dark:text-blue-400">{t('employee.daysRemaining', { count: rem })}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-sky-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                        <span>{t('employee.allocated', { count: bal.entitledDays })}</span>
                        <span>{t('employee.consumed', { count: bal.usedDays })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">{t('employee.leaveRequestHistory')}</h4>
                {leaves.length === 0 ? (
                  <p className="text-slate-400 italic">{t('employee.noHistoricalLeaves')}</p>
                ) : (
                  <div className="space-y-2">
                    {leaves.slice(0, 3).map(req => {
                      const lt = leaveTypes.find(lt => lt.id === req.leaveTypeId);
                      return (
                        <div key={req.id} className="flex justify-between items-center p-2.5 rounded-lg border border-slate-100 dark:border-slate-850/60 text-[11px]">
                          <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{lt ? lt.name : t('employee.leaveType')}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t('employee.to')} {req.startDate} - {req.endDate}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 dark:bg-red-950/20' :
                            'bg-amber-50 text-amber-700 dark:bg-amber-950/20'
                          }`}>
                            {req.status === 'APPROVED' ? t('employee.approved') : req.status === 'REJECTED' ? t('employee.rejected') : t('employee.pending')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeModal === 'schedule' && (
            <div className="space-y-4">
              {shift ? (
                <>
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40 text-center">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{shift.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{shift.description}</p>
                    <div className="flex justify-center gap-8 mt-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px]">{t('employee.standardStart')}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatTimeFromMinutes(shift.startTimeMinutes)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[9px]">{t('employee.standardEnd')}</span>
                        <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatTimeFromMinutes(shift.endTimeMinutes)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2.5">{t('employee.weeklyWorkingDays')}</h4>
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px]">
                      {(() => {
                        const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                        const assignedDays = shiftAssignmentDaysOfWeek || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
                        const startH = Math.floor(shift.startTimeMinutes / 60);
                        const startM = shift.startTimeMinutes % 60;
                        const timeLabel = `${startH < 10 ? '0' + startH : startH}:${startM < 10 ? '0' + startM : startM}`;
                        return allDays.map((day) => {
                          const isWorking = assignedDays.includes(day);
                          return (
                            <div key={day} className={`p-2.5 rounded-lg border ${
                              isWorking
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
                            }`}>
                              <p>{day}</p>
                              <p className="text-[8px] font-normal mt-1">{isWorking ? timeLabel : t('employee.off')}</p>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    <p className="font-bold text-slate-700 dark:text-slate-300">{t('employee.shiftComplianceRules')}</p>
                    <p>{t('employee.complianceRule1')}</p>
                    <p>{t('employee.complianceRule2')}</p>
                    <p>{t('employee.complianceRule3')}</p>
                  </div>
                </>
              ) : (
                <p className="text-slate-500 italic">{t('employee.noActiveShiftAssignments')}</p>
              )}
            </div>
          )}

          {activeModal === 'holidays' && (
            <div className="space-y-4">
              <p className="text-slate-500 dark:text-slate-400 leading-normal">
                {t('employee.holidayDesc')}
              </p>
              <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
                {holidays.map(hol => (
                  <div key={hol.id} className="flex justify-between items-start p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{hol.name}</p>
                      {hol.description && (
                        <p className="text-[10px] text-slate-400">{hol.description}</p>
                      )}
                      <div className="flex gap-2.5 items-center pt-0.5">
                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">{hol.type}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{hol.isPaid ? t('employee.paidOff') : t('employee.unpaid')}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700">{new Date(hol.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/25">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors"
          >
            {t('employee.closeView')}
          </button>
        </div>
      </div>
    </div>
  );
}
