import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronLeft, ChevronRight, Download, Shield, User, FileText, Settings, LogIn, Trash2, RefreshCw, CheckCircle2, Key, Pencil, AlertTriangle, Clock, Lock, Unlock, UserX, Upload, Download as DownloadIcon, Ban, Archive, ArrowRightLeft, DollarSign, Calendar, Briefcase, Building2 } from 'lucide-react';
import { useAuditLogs } from '../../hooks/queries/useAuditLogs';

const EVENT_COLORS: Record<string, string> = {
  AUTHENTICATION:            'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  SECURITY:                  'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  USER_MANAGEMENT:           'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  EMPLOYEE:                  'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300',
  ATTENDANCE:                'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  SYSTEM_CONFIGURATION:      'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  ORGANIZATION:              'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300',
  DOCUMENT:                  'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300',
  PAYROLL:                   'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300',
  HR:                        'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
  ROLE_PERMISSION:           'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  AUTHENTICATION:            <LogIn className="w-3 h-3" />,
  SECURITY:                  <Lock className="w-3 h-3" />,
  USER_MANAGEMENT:           <User className="w-3 h-3" />,
  EMPLOYEE:                  <Briefcase className="w-3 h-3" />,
  ATTENDANCE:                <CheckCircle2 className="w-3 h-3" />,
  SYSTEM_CONFIGURATION:      <Settings className="w-3 h-3" />,
  ORGANIZATION:              <Building2 className="w-3 h-3" />,
  DOCUMENT:                  <FileText className="w-3 h-3" />,
  PAYROLL:                   <DollarSign className="w-3 h-3" />,
  HR:                        <User className="w-3 h-3" />,
  ROLE_PERMISSION:           <Key className="w-3 h-3" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  UPDATE: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  DELETE: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  ACTIVATE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  DEACTIVATE: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  LOGIN_SUCCESS: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  LOGIN_FAILED: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  LOGOUT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  REGISTER: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  PASSWORD_CHANGE: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  PASSWORD_RESET: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  LOCK: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  UNLOCK: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  SUSPEND: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  ARCHIVE: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  TERMINATE: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  TRANSFER: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CHANGE_MANAGER: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CHANGE_POSITION: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CHANGE_DEPARTMENT: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  UPDATE_STATUS: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  UPDATE_EMPLOYMENT_STATUS: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  UPDATE_ROLE: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  UPDATE_PERMISSIONS: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  CORRECT: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  CREATE_INCIDENT: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  UPDATE_INCIDENT: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CANCEL_INCIDENT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  RESOLVE_INCIDENT: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  REJECT_INCIDENT: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  ADD_INCIDENT_COMMENT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  ASSIGN_SHIFT: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  BULK_ASSIGN_SHIFT: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  END_SHIFT_ASSIGNMENT: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  TEST: 'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300',
  SYNC: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  UPLOAD: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  DOWNLOAD: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  UPDATE_METADATA: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CREATE_CATEGORY: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  UPDATE_CATEGORY: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  ACTIVATE_CATEGORY: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  DEACTIVATE_CATEGORY: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  GENERATE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  APPROVE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  REJECT: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  FINALIZE: 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300',
  CANCEL: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  REOPEN: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CREATE_PERIOD: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  UPDATE_PERIOD: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CANCEL_PERIOD: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  DELETE_PERIOD: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  OPEN_PERIOD: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  CLOSE_PERIOD: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  LOCK_PERIOD: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  UNLOCK_PERIOD: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  APPROVE_PERIOD: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  FINALIZE_PERIOD: 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300',
  REOPEN_PERIOD: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  MARK_PAID: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  SUBMIT: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  UPDATE_SETTING: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  CREATE_DEVICE: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  TEST_CONNECTION: 'bg-sky-100 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300',
  SYNC_DEVICE: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <FileText className="w-3 h-3" />,
  UPDATE: <Pencil className="w-3 h-3" />,
  DELETE: <Trash2 className="w-3 h-3" />,
  ACTIVATE: <CheckCircle2 className="w-3 h-3" />,
  DEACTIVATE: <Ban className="w-3 h-3" />,
  LOGIN_SUCCESS: <LogIn className="w-3 h-3" />,
  LOGIN_FAILED: <AlertTriangle className="w-3 h-3" />,
  LOGOUT: <LogIn className="w-3 h-3 rotate-180" />,
  REGISTER: <User className="w-3 h-3" />,
  PASSWORD_CHANGE: <Key className="w-3 h-3" />,
  PASSWORD_RESET: <Key className="w-3 h-3" />,
  LOCK: <Lock className="w-3 h-3" />,
  UNLOCK: <Unlock className="w-3 h-3" />,
  SUSPEND: <UserX className="w-3 h-3" />,
  ARCHIVE: <Archive className="w-3 h-3" />,
  TERMINATE: <UserX className="w-3 h-3" />,
  TRANSFER: <ArrowRightLeft className="w-3 h-3" />,
  CHANGE_MANAGER: <User className="w-3 h-3" />,
  CHANGE_POSITION: <Briefcase className="w-3 h-3" />,
  CHANGE_DEPARTMENT: <Building2 className="w-3 h-3" />,
  UPDATE_STATUS: <Pencil className="w-3 h-3" />,
  UPDATE_EMPLOYMENT_STATUS: <Pencil className="w-3 h-3" />,
  UPDATE_ROLE: <Shield className="w-3 h-3" />,
  UPDATE_PERMISSIONS: <Key className="w-3 h-3" />,
  CORRECT: <Pencil className="w-3 h-3" />,
  CREATE_INCIDENT: <AlertTriangle className="w-3 h-3" />,
  UPDATE_INCIDENT: <Pencil className="w-3 h-3" />,
  CANCEL_INCIDENT: <Ban className="w-3 h-3" />,
  RESOLVE_INCIDENT: <CheckCircle2 className="w-3 h-3" />,
  REJECT_INCIDENT: <Ban className="w-3 h-3" />,
  ADD_INCIDENT_COMMENT: <FileText className="w-3 h-3" />,
  ASSIGN_SHIFT: <Calendar className="w-3 h-3" />,
  BULK_ASSIGN_SHIFT: <Calendar className="w-3 h-3" />,
  END_SHIFT_ASSIGNMENT: <Clock className="w-3 h-3" />,
  TEST: <CheckCircle2 className="w-3 h-3" />,
  SYNC: <RefreshCw className="w-3 h-3" />,
  UPLOAD: <Upload className="w-3 h-3" />,
  DOWNLOAD: <DownloadIcon className="w-3 h-3" />,
  UPDATE_METADATA: <Pencil className="w-3 h-3" />,
  CREATE_CATEGORY: <FileText className="w-3 h-3" />,
  UPDATE_CATEGORY: <Pencil className="w-3 h-3" />,
  ACTIVATE_CATEGORY: <CheckCircle2 className="w-3 h-3" />,
  DEACTIVATE_CATEGORY: <Ban className="w-3 h-3" />,
  GENERATE: <DollarSign className="w-3 h-3" />,
  APPROVE: <CheckCircle2 className="w-3 h-3" />,
  REJECT: <Ban className="w-3 h-3" />,
  FINALIZE: <CheckCircle2 className="w-3 h-3" />,
  CANCEL: <Ban className="w-3 h-3" />,
  REOPEN: <Pencil className="w-3 h-3" />,
  CREATE_PERIOD: <Calendar className="w-3 h-3" />,
  UPDATE_PERIOD: <Pencil className="w-3 h-3" />,
  CANCEL_PERIOD: <Ban className="w-3 h-3" />,
  DELETE_PERIOD: <Trash2 className="w-3 h-3" />,
  OPEN_PERIOD: <CheckCircle2 className="w-3 h-3" />,
  CLOSE_PERIOD: <Lock className="w-3 h-3" />,
  LOCK_PERIOD: <Lock className="w-3 h-3" />,
  UNLOCK_PERIOD: <Unlock className="w-3 h-3" />,
  APPROVE_PERIOD: <CheckCircle2 className="w-3 h-3" />,
  FINALIZE_PERIOD: <CheckCircle2 className="w-3 h-3" />,
  REOPEN_PERIOD: <Pencil className="w-3 h-3" />,
  MARK_PAID: <DollarSign className="w-3 h-3" />,
  SUBMIT: <FileText className="w-3 h-3" />,
  UPDATE_SETTING: <Settings className="w-3 h-3" />,
  CREATE_DEVICE: <Settings className="w-3 h-3" />,
  TEST_CONNECTION: <CheckCircle2 className="w-3 h-3" />,
  SYNC_DEVICE: <RefreshCw className="w-3 h-3" />,
};

function formatAction(raw: string) {
  return raw.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function formatEntity(raw: string) {
  return raw.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
}

function getEventMeta(eventType: string, t: (key: string) => string) {
  const i18nLabel = t(`admin.auditEvents.eventTypes.${eventType}`);
  const label = i18nLabel !== `admin.auditEvents.eventTypes.${eventType}` ? i18nLabel : formatAction(eventType);
  return {
    label,
    color: EVENT_COLORS[eventType] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    icon: EVENT_ICONS[eventType] || <FileText className="w-3 h-3" />,
  };
}

function getActionMeta(action: string, t: (key: string) => string) {
  const i18nLabel = t(`admin.auditEvents.actions.${action}`);
  const label = i18nLabel !== `admin.auditEvents.actions.${action}` ? i18nLabel : formatAction(action);
  return {
    label,
    color: ACTION_COLORS[action] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    icon: ACTION_ICONS[action] || <Pencil className="w-3 h-3" />,
  };
}

interface AdminAuditTrailTabProps {
  users: any[];
  employees: any[];
}

export default function AdminAuditTrailTab({ users, employees }: AdminAuditTrailTabProps) {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const logsPerPage = 10;

  const { data, isLoading } = useAuditLogs({ page: currentPage, pageSize: logsPerPage, sort: '-createdAt' });

  const allLogs = useMemo(() => {
    const raw = data?.items || [];
    return raw.map((log: any) => {
      const user = users.find((u: any) => u.id === log.userId);
      const emp = user?.employeeId ? employees.find((e: any) => e.id === user.employeeId) : null;
      const actorName = log.user?.username || user?.username || emp ? `${emp?.firstName || ''} ${emp?.lastName || ''}`.trim() || 'System' : 'System';
      return { ...log, actorName };
    });
  }, [data, users, employees]);

  const total = data?.total || 0;
  const totalPages = Math.ceil(total / logsPerPage);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return allLogs;
    const term = searchTerm.toLowerCase();
    return allLogs.filter((log: any) =>
      (log.actorName || '').toLowerCase().includes(term) ||
      (log.action || '').toLowerCase().includes(term) ||
      (log.description || '').toLowerCase().includes(term) ||
      (log.entityName || '').toLowerCase().includes(term) ||
      (log.eventType || '').toLowerCase().includes(term) ||
      getEventMeta(log.eventType, t).label.toLowerCase().includes(term) ||
      getActionMeta(log.action, t).label.toLowerCase().includes(term)
    );
  }, [allLogs, searchTerm, t]);

  const formatLocalDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const generateCSV = () => {
    const headers = [t('admin.timestamp'), t('admin.actor'), t('admin.eventType'), t('admin.action'), t('admin.entityType'), t('admin.description')];
    const rows = allLogs.map((log: any) => [
      `"${formatTimestamp(log.createdAt)}"`,
      `"${log.actorName}"`,
      getEventMeta(log.eventType, t).label,
      getActionMeta(log.action, t).label,
      formatEntity(log.entityName),
      `"${(log.description || '').replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${formatLocalDate(new Date())}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.auditTrailTitle')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.auditLogsSubtitle')}</p>
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
              placeholder={t('admin.searchAuditLogs')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">{t('common.loading')}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">{t('admin.noAuditLogs')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.timestamp')}</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.actor')}</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.eventType')}</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.action')}</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.entityType')}</th>
                  <th className="p-4 font-semibold text-slate-600 dark:text-slate-400">{t('admin.description')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                      {log.actorName}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold ${getEventMeta(log.eventType, t).color}`}>
                        {getEventMeta(log.eventType, t).icon}
                        <span>{getEventMeta(log.eventType, t).label}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold ${getActionMeta(log.action, t).color}`}>
                        {getActionMeta(log.action, t).icon}
                        <span>{getActionMeta(log.action, t).label}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{formatEntity(log.entityName)}</span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {log.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 text-xs text-slate-500 dark:text-slate-400">
          <span>{t('pagination.showing', { from: (currentPage - 1) * logsPerPage + 1, to: Math.min(currentPage * logsPerPage, total), total })}</span>
          <div className="flex space-x-2">
            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
