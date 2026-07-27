import { useTranslation } from 'react-i18next';
import { fmtDT } from '../../lib/utils';
import Pagination from '../hr/Pagination';
import type { AttendanceRecord } from './types';

interface EmployeeAttendanceTabProps {
  attendance: AttendanceRecord[];
  attendancePage: number;
  totalAttendance: number;
  onAttendancePageChange: (page: number) => void;
}

export default function EmployeeAttendanceTab({ attendance, attendancePage, totalAttendance, onAttendancePageChange }: EmployeeAttendanceTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.attendanceHistory')}</h2>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">{t('employee.latestCheckInLogs')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">{t('employee.date')}</th>
                <th className="p-4">{t('employee.checkIn')}</th>
                <th className="p-4">{t('employee.checkOut')}</th>
                <th className="p-4">{t('employee.workedMinutes')}</th>
                <th className="p-4">{t('employee.status')}</th>
                <th className="p-4">{t('employee.deviceCoordinates')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {attendance.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="p-4 font-bold">{fmtDT(rec.date)}</td>
                  <td className="p-4">{rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : <span className="text-slate-400 italic">{t('employee.noClockIn')}</span>}</td>
                  <td className="p-4">{rec.checkOutTime ? new Date(rec.checkOutTime).toLocaleTimeString() : <span className="text-slate-400 italic">{t('employee.noClockOut')}</span>}</td>
                  <td className="p-4">{rec.workedMinutes !== undefined ? `${rec.workedMinutes} ${t('employee.minutes')}` : '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${rec.status === 'PRESENT' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : rec.status === 'WEEKEND' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : rec.status === 'LATE' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'}`}>
                      {rec.status === 'PRESENT' ? t('employee.present') : rec.status === 'WEEKEND' ? t('employee.weekend') : rec.status === 'LATE' ? t('employee.late') : t('employee.absent')}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[10px]">
                    {rec.checkInLatitude ? t('employee.gpsCoordinates', { lat: rec.checkInLatitude, lng: rec.checkInLongitude }) : t('employee.rfidTerminal')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={attendancePage}
          totalItems={totalAttendance}
          itemsPerPage={10}
          onPageChange={onAttendancePageChange}
          idPrefix="emp-attendance"
        />
      </div>
    </div>
  );
}
