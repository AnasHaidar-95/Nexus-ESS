import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSameLocalDate } from '../../lib/utils';

interface AdminAuditTabProps {
  attendanceRecords: any[];
  users: any[];
  employees: any[];
}

export default function AdminAuditTab({ attendanceRecords, users, employees }: AdminAuditTabProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const getEmployeeInfo = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return { fullName: 'N/A', role: 'System' };
    return {
      fullName: `${emp.firstName} ${emp.lastName}`,
      role: emp.role?.name || 'Employee',
    };
  };

  const today = new Date();
  const formatLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const todayStr = formatLocalDate(today);

  const allLogs = attendanceRecords
    .filter((r) => isSameLocalDate(r.date) || formatLocalDate(new Date(r.date)) === todayStr)
    .map((r) => {
      const { fullName, role } = getEmployeeInfo(r.employeeId);
      const user = users.find((u) => u.employeeId === r.employeeId);
      return { ...r, fullName, role, userId: user?.id || 'N/A' };
    })
    .sort((a, b) => (b.createdAt || b.checkInTime || 0) - (a.createdAt || a.checkInTime || 0));

  const logsPerPage = 10;

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return allLogs;
    const term = searchTerm.toLowerCase();
    return allLogs.filter(log =>
      log.fullName.toLowerCase().includes(term) ||
      log.role.toLowerCase().includes(term) ||
      log.status.toLowerCase().includes(term)
    );
  }, [allLogs, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const generateCSV = () => {
    const headers = [t('employee.label'), t('employeeInfo.role'), t('attendance.status'), t('checkInTime'), t('checkOutTime'), t('attendance.workHours')];
    const rows = allLogs.map(log => [
      `"${log.fullName}"`,
      `"${log.role}"`,
      log.status,
      new Date(log.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '',
      log.workHours || '',
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${formatLocalDate(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300';
      case 'ABSENT': return 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300';
      case 'LEAVE': return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300';
      case 'REMOTE': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle2 className="w-3 h-3" />;
      case 'ABSENT': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.todayAttendanceLogs')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.auditSubtitle')}</p>
        </div>
        <button onClick={generateCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Download className="h-4 w-4" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('admin.searchLogs')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('employee.label')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('attendance.status')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('checkInTime')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('checkOutTime')}</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('attendance.workHours')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{log.fullName}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold ${getStatusStyle(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span>{t(`attendance.statuses.${log.status.toLowerCase()}`)}</span>
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{new Date(log.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{log.workHours || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-xs text-slate-500 dark:text-slate-400">
          <span>{t('pagination.showing', { from: (currentPage - 1) * logsPerPage + 1, to: Math.min(currentPage * logsPerPage, filteredLogs.length), total: filteredLogs.length })}</span>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
