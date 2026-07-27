import { useTranslation } from 'react-i18next';
import { Clock, ClipboardList, Sun, Calendar } from 'lucide-react';
import { formatTimeFromMinutes } from './utils';
import type { Employee, ShiftData, ShiftTimerState, LeaveBalanceData, LeaveTypeData, Holiday } from './types';

interface EmployeeHomeTabProps {
  employee: Employee;
  shift: ShiftData | null;
  shiftTimer: ShiftTimerState;
  isClockedIn: boolean;
  onClockInOut: () => void;
  leaveBalances: LeaveBalanceData[];
  leaveTypes: LeaveTypeData[];
  holidays: Holiday[];
  onOpenModal: (modal: 'leaves' | 'schedule' | 'holidays') => void;
}

export default function EmployeeHomeTab({
  employee,
  shift,
  shiftTimer,
  isClockedIn,
  onClockInOut,
  leaveBalances,
  leaveTypes,
  holidays,
  onOpenModal,
}: EmployeeHomeTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Headline with clock-in */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.welcomeBack', { name: employee.firstName })}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. {t('employee.keepUpProductivity')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto">
          {isClockedIn && shift && (
            <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border-2 ${shiftTimer.expired ? 'border-rose-300 bg-rose-50' : shiftTimer.mode === 'toStart' ? 'border-amber-300 bg-amber-50' : 'border-emerald-300 bg-emerald-50'}`}>
              <Clock className={`h-4 w-4 ${shiftTimer.expired ? 'text-rose-500' : shiftTimer.mode === 'toStart' ? 'text-amber-500' : 'text-emerald-600'}`} />
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">{shiftTimer.mode === 'toStart' ? t('employee.shiftStartsIn') : shiftTimer.mode === 'overtime' ? t('employee.overtime') : t('employee.shiftEndsIn')}</span>
                <p className={`text-lg font-extrabold font-mono tracking-wider ${shiftTimer.expired ? 'text-rose-600' : shiftTimer.mode === 'toStart' ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {String(shiftTimer.hours).padStart(2, '0')}:{String(shiftTimer.minutes).padStart(2, '0')}:{String(shiftTimer.seconds).padStart(2, '0')}
                </p>
              </div>
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 font-semibold uppercase">{t('employee.clockInStatus')}</p>
            <p className={`text-sm font-bold ${isClockedIn ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isClockedIn ? t('employee.clockedIn') : t('employee.notClockedIn')}
            </p>
          </div>
          <button
            onClick={onClockInOut}
            className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${isClockedIn ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'}`}
          >
            <Clock className="h-4 w-4" />
            <span>{isClockedIn ? t('employee.checkOut') : t('employee.checkIn')}</span>
          </button>
        </div>
      </div>

      {/* Grid Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Leave Balances Widget */}
        <div
          onClick={() => onOpenModal('leaves')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 cursor-pointer hover:border-sky-200 dark:hover:border-sky-950 hover:shadow-md transition-all group"
          title={t('employee.clickToViewLeaveStatus')}
        >
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            <ClipboardList className="h-4 w-4 mr-2 text-sky-500" /> {t('employee.leaveBalance')}
          </h3>
          <div className="space-y-3 pt-2">
            {leaveBalances.map(bal => {
              const lt = leaveTypes.find(lt => lt.id === bal.leaveTypeId);
              return (
                <div key={bal.id} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/50 pb-2 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{lt ? lt.name : t('employee.unknownLeave')}</span>
                  <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-bold px-2 py-1 rounded">
                    {t('employee.daysLeft', { rem: Number(bal.entitledDays) - Number(bal.usedDays), entitled: bal.entitledDays })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Shift Card */}
        <div
          onClick={() => onOpenModal('schedule')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 cursor-pointer hover:border-amber-200 dark:hover:border-amber-950 hover:shadow-md transition-all group"
          title={t('employee.clickToViewWeeklySchedule')}
        >
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <Sun className="h-4 w-4 mr-2 text-amber-500" /> {t('employee.assignedSchedule')}
          </h3>
          {shift ? (
            <div className="space-y-3 pt-2">
              <div className="bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl border border-amber-100 dark:border-amber-950/30 text-center">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{shift.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{shift.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs pt-2 text-center">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">{t('employee.startHour')}</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatTimeFromMinutes(shift.startTimeMinutes)}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-500 font-semibold uppercase">{t('employee.endHour')}</p>
                  <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{formatTimeFromMinutes(shift.endTimeMinutes)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">{t('employee.noShiftAssignment')}</p>
          )}
        </div>

        {/* Company Holidays Card */}
        <div
          onClick={() => onOpenModal('holidays')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 cursor-pointer hover:border-emerald-200 dark:hover:border-emerald-950 hover:shadow-md transition-all group"
          title={t('employee.clickToViewHolidayCalendar')}
        >
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            <Calendar className="h-4 w-4 mr-2 text-emerald-500" /> {t('employee.holidayCalendar')}
          </h3>
          <div className="space-y-3 pt-2 max-h-48 overflow-y-auto">
            {holidays.map(hol => (
              <div key={hol.id} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-800/50 pb-2">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{hol.name}</p>
                  <p className="text-[10px] text-slate-400">{hol.type}</p>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-400">{new Date(hol.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
