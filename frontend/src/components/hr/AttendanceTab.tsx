import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Employee, AttendanceRecord, AttendanceIncident } from '../../types';
import { fmtDT } from '../../lib/utils';
import { attendanceRecordApi } from '../../lib/attendance-records';
import { attendanceIncidentApi } from '../../lib/attendance-incidents';
import { useAttendanceRecords } from '../../hooks/queries/useAttendanceRecords';
import { useAttendanceIncidents } from '../../hooks/queries/useAttendanceIncidents';
import { useEmployees } from '../../hooks/queries/useEmployees';
import { Check, X, XCircle, Download } from 'lucide-react';
import Pagination from './Pagination';

interface AttendanceTabProps {
  attendancePage: number;
  setAttendancePage: (v: number) => void;
  incidentsPage: number;
  setIncidentsPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  handleManualAttendance: (eId: string, date: string, tIn: string, tOut: string, notes: string, reason: string) => void;
}

const INCIDENT_TYPES = [
  { value: 'LATE_ARRIVAL', key: 'hr.attendance.lateArrival' },
  { value: 'EARLY_DEPARTURE', key: 'hr.attendance.earlyDeparture' },
  { value: 'MISSING_CHECK_IN', key: 'hr.attendance.missingCheckIn' },
  { value: 'MISSING_CHECK_OUT', key: 'hr.attendance.missingCheckOut' },
  { value: 'UNAUTHORIZED_ABSENCE', key: 'hr.attendance.unauthorizedAbsence' },
  { value: 'DEVICE_ERROR', key: 'hr.attendance.deviceError' },
  { value: 'MANUAL_CORRECTION', key: 'hr.attendance.manualCorrection' },
];

const SEVERITIES = [
  { value: 'LOW', key: 'hr.attendance.low' },
  { value: 'MEDIUM', key: 'hr.attendance.medium' },
  { value: 'HIGH', key: 'hr.attendance.high' },
  { value: 'CRITICAL', key: 'hr.attendance.critical' },
];

const AttendanceTab: React.FC<AttendanceTabProps> = ({
  attendancePage,
  setAttendancePage,
  incidentsPage,
  setIncidentsPage,
  ITEMS_PER_PAGE,
  handleManualAttendance,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: empRes } = useEmployees({ pageSize: 100 });
  const employees = (empRes?.items || []) as Employee[];
  const [manualEmpId, setManualEmpId] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualCheckIn, setManualCheckIn] = useState('');
  const [manualCheckOut, setManualCheckOut] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualReason, setManualReason] = useState('');

  const { data: attRes, isLoading: attLoading, isPlaceholderData: attPlaceholder } = useAttendanceRecords({ page: attendancePage, pageSize: ITEMS_PER_PAGE, sort: '-date' });
  const { data: incRes, isLoading: incLoading, isPlaceholderData: incPlaceholder } = useAttendanceIncidents({ page: incidentsPage, pageSize: ITEMS_PER_PAGE, sort: '-createdAt' });

  const { data: allAttRes } = useAttendanceRecords({ pageSize: 500, sort: '-date' });
  const allAttItems = allAttRes?.items || [];
  const { data: allIncRes } = useAttendanceIncidents({ pageSize: 500, sort: '-createdAt' });
  const allIncItems = allIncRes?.items || [];

  const attItems = attRes?.items || [];
  const attTotalItems = attRes?.pagination?.totalItems || 0;
  const incItems = incRes?.items || [];
  const incTotalItems = incRes?.pagination?.totalItems || 0;

  // Incident modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createRecordId, setCreateRecordId] = useState('');
  const [createType, setCreateType] = useState('LATE_ARRIVAL');
  const [createSeverity, setCreateSeverity] = useState('MEDIUM');
  const [createDesc, setCreateDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [resolveTarget, setResolveTarget] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleSubmit = () => {
    handleManualAttendance(manualEmpId, manualDate, manualCheckIn, manualCheckOut, manualNotes, manualReason);
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
    setManualEmpId('');
    setManualDate('');
    setManualCheckIn('');
    setManualCheckOut('');
    setManualNotes('');
    setManualReason('');
  };

  const handleCreateIncident = async () => {
    if (!createRecordId || !createDesc.trim()) return;
    setCreateLoading(true);
    try {
      await attendanceIncidentApi.create({ recordId: createRecordId, type: createType, severity: createSeverity, description: createDesc.trim() });
      setShowCreateModal(false);
      setCreateRecordId('');
      setCreateDesc('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch {
      // error handled silently
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolveTarget || !resolveNotes.trim()) return;
    setResolveLoading(true);
    try {
      await attendanceIncidentApi.resolve(resolveTarget, { resolutionNotes: resolveNotes.trim() });
      setResolveTarget(null);
      setResolveNotes('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch {
      // error handled silently
    } finally {
      setResolveLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await attendanceIncidentApi.reject(rejectTarget, { reason: rejectReason.trim() });
      setRejectTarget(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch {
      // error handled silently
    } finally {
      setRejectLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await attendanceIncidentApi.cancel(cancelTarget);
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
    } catch {
      // error handled silently
    } finally {
      setCancelLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PRESENT: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300', LATE: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
      HALF_DAY: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300', LEAVE: 'bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
      HOLIDAY: 'bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300', WEEKEND: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
      INCOMPLETE: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300', ABSENT: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
    };
    const labelKeys: Record<string, string> = {
      PRESENT: 'hr.attendance.present', LATE: 'hr.attendance.late', HALF_DAY: 'hr.attendance.halfDay', LEAVE: 'hr.attendance.onLeave',
      HOLIDAY: 'hr.attendance.holiday', WEEKEND: 'hr.attendance.weekend', INCOMPLETE: 'hr.attendance.incomplete', ABSENT: 'hr.attendance.absent',
    };
    const cls = styles[status] || 'bg-red-50 text-red-700';
    const label = labelKeys[status] ? t(labelKeys[status]) : status;
    return <span className={`px-2 py-1 rounded text-[10px] font-bold ${cls}`}>{label}</span>;
  };

  const renderIncidentStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300', IN_PROGRESS: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
      APPROVED: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300', REJECTED: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
      RESOLVED: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300', CANCELLED: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    };
    const statusKey = status === 'IN_PROGRESS' ? 'inProgress' : status.toLowerCase();
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[status] || 'bg-slate-100 text-slate-500'}`}>{t('hr.attendance.' + statusKey)}</span>;
  };

  const renderSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      CRITICAL: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300', HIGH: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
      MEDIUM: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300', LOW: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
    return <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles[severity] || 'bg-slate-100 text-slate-600'}`}>{severity}</span>;
  };

  const renderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      LATE_ARRIVAL: 'hr.attendance.lateArrival', EARLY_DEPARTURE: 'hr.attendance.earlyDeparture',
      MISSING_CHECK_IN: 'hr.attendance.missingCheckIn', MISSING_CHECK_OUT: 'hr.attendance.missingCheckOut',
      UNAUTHORIZED_ABSENCE: 'hr.attendance.unauthorizedAbsence', DEVICE_ERROR: 'hr.attendance.deviceError',
      MANUAL_CORRECTION: 'hr.attendance.manualCorrection',
    };
    const key = labels[type];
    return key ? t(key) : type;
  };

  const renderEmptyState = (message: string) => (
    <tr><td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">{message}</td></tr>
  );

  const renderLoadingState = (colSpan: number) => (
    <tr><td colSpan={colSpan} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">{t('hr.attendance.loading')}</td></tr>
  );

  const generateAttendanceCSV = () => {
    const headers = [t('hr.attendance.employee'), t('hr.attendance.date'), t('hr.attendance.checkIn'), t('hr.attendance.checkOut'), t('hr.attendance.status'), t('hr.attendance.overrideReason')];
    const rows = allAttItems.map(rec => {
      const emp = employees.find(e => e.id === rec.employeeId);
      return [
        emp ? `${emp.firstName} ${emp.lastName}` : '',
        rec.date || '',
        rec.checkInTime ? fmtDT(rec.checkInTime) : '',
        rec.checkOutTime ? fmtDT(rec.checkOutTime) : '',
        rec.status || '',
        rec.correctionReason || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateIncidentsCSV = () => {
    const headers = [t('hr.attendance.employee'), t('hr.attendance.date'), t('hr.attendance.incidentType'), t('hr.attendance.severity'), t('hr.attendance.description'), t('hr.attendance.status'), t('hr.attendance.resolution')];
    const rows = allIncItems.map(inc => {
      const incEmp = inc.record?.employee;
      const incDate = inc.record?.date;
      return [
        incEmp ? `${incEmp.firstName} ${incEmp.lastName}` : '',
        incDate ? fmtDT(incDate) : '',
        inc.type || '',
        inc.severity || '',
        inc.description || '',
        inc.status || '',
        inc.resolutionNotes || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-incidents-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('hr.attendance.title')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.attendance.subtitle')}</p>
        </div>
        <button onClick={generateAttendanceCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Download className="h-4 w-4" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.attendance.overrideEntry')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="man-emp" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.employee')}</label>
            <select id="man-emp" value={manualEmpId} onChange={(e) => setManualEmpId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs">
              <option value="">{t('hr.attendance.selectEmployee')}</option>
              {employees.map(e => (<option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>))}
            </select>
          </div>
          <div>
            <label htmlFor="man-date" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.date')}</label>
            <input id="man-date" type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs" />
          </div>
          <div>
            <label htmlFor="man-in" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.checkInTime')}</label>
            <input id="man-in" type="time" value={manualCheckIn} onChange={(e) => setManualCheckIn(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs" />
          </div>
          <div>
            <label htmlFor="man-out" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.checkOutTime')}</label>
            <input id="man-out" type="time" value={manualCheckOut} onChange={(e) => setManualCheckOut(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="man-reason" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.overrideReason')}</label>
            <input id="man-reason" type="text" placeholder={t('hr.attendance.reasonPlaceholder')} value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs" />
          </div>
          <div className="md:col-span-5">
            <label htmlFor="man-notes" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.correctionNotes')}</label>
            <input id="man-notes" type="text" placeholder={t('hr.attendance.notesPlaceholder')} value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs" />
          </div>
          <div className="md:col-span-5">
            <button onClick={handleSubmit} disabled={!manualEmpId || !manualDate || !manualCheckIn}
              className="w-full bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {t('hr.attendance.applyCorrection')}
            </button>
          </div>
        </div>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${attPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">{t('hr.attendance.employee')}</th>
                <th className="p-4">{t('hr.attendance.date')}</th>
                <th className="p-4">{t('hr.attendance.checkIn')}</th>
                <th className="p-4">{t('hr.attendance.checkOut')}</th>
                <th className="p-4">{t('hr.attendance.status')}</th>
                <th className="p-4">{t('hr.attendance.overrideReason')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {attLoading ? renderLoadingState(6) : attItems.length === 0 ? renderEmptyState(t('hr.attendance.noRecords')) : attItems.map(rec => {
                const emp = employees.find(e => e.id === rec.employeeId);
                return (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="p-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                    <td className="p-4 font-bold">{fmtDT(rec.date)}</td>
                    <td className="p-4">{rec.checkInTime ? fmtDT(rec.checkInTime) : <span className="text-slate-400 italic">{t('hr.attendance.noClockIn')}</span>}</td>
                    <td className="p-4">{rec.checkOutTime ? fmtDT(rec.checkOutTime) : <span className="text-slate-400 italic">{t('hr.attendance.noClockOut')}</span>}</td>
                    <td className="p-4">{renderStatusBadge(rec.status)}</td>
                    <td className="p-4 text-slate-400 italic text-[11px] max-w-xs truncate">{rec.correctionReason || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={attendancePage} totalItems={attTotalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setAttendancePage} idPrefix="attendance" />
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${incPlaceholder ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.attendance.incidents')}</h3>
          <div className="flex items-center space-x-2">
            <button onClick={generateIncidentsCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
              <Download className="h-3 w-3" />
              <span>{t('exportCSV')}</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-slate-900 dark:bg-slate-700 text-white rounded-lg text-[10px] font-bold px-3 py-1.5 hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              {t('hr.attendance.fileIncident')}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-4">{t('hr.attendance.employee')}</th>
                <th className="p-4">{t('hr.attendance.date')}</th>
                <th className="p-4">{t('hr.attendance.incidentType')}</th>
                <th className="p-4">{t('hr.attendance.severity')}</th>
                <th className="p-4">{t('hr.attendance.description')}</th>
                <th className="p-4">{t('hr.attendance.status')}</th>
                <th className="p-4">{t('hr.attendance.resolution')}</th>
                <th className="p-4 text-right">{t('hr.attendance.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {incLoading ? renderLoadingState(8) : incItems.length === 0 ? renderEmptyState(t('hr.attendance.noIncidents')) : incItems.map(inc => {
                const isActive = inc.status === 'OPEN' || inc.status === 'IN_PROGRESS';
                const incEmp = inc.record?.employee;
                const incDate = inc.record?.date;
                return (
                  <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="p-4 font-semibold">{incEmp ? `${incEmp.firstName} ${incEmp.lastName}` : '-'}</td>
                    <td className="p-4 font-bold">{incDate ? fmtDT(incDate) : '-'}</td>
                    <td className="p-4 font-semibold">{renderTypeLabel(inc.type)}</td>
                    <td className="p-4">{renderSeverityBadge(inc.severity)}</td>
                    <td className="p-4 max-w-xs truncate">{inc.description}</td>
                    <td className="p-4">{renderIncidentStatusBadge(inc.status)}</td>
                    <td className="p-4 text-slate-400 italic text-[11px] max-w-xs truncate">{inc.resolutionNotes || '-'}</td>
                    <td className="p-4 text-right">
                      {isActive ? (
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => { setResolveTarget(inc.id); setResolveNotes(''); }}
                            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 hover:scale-110 transition-transform"
                            title={t('hr.attendance.resolve')}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => { setRejectTarget(inc.id); setRejectReason(''); }}
                            className="text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:scale-110 transition-transform"
                            title={t('hr.attendance.rejectBtn')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCancelTarget(inc.id)}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:scale-110 transition-transform"
                            title={t('hr.attendance.cancelBtn')}
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">{t('hr.attendance.closed')}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={incidentsPage} totalItems={incTotalItems} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setIncidentsPage} idPrefix="incidents" />
      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.attendance.fileTitle')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.attendanceRecord')}</label>
                <select value={createRecordId} onChange={(e) => setCreateRecordId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs">
                  <option value="">{t('hr.attendance.selectRecord')}</option>
                  {attItems.map(rec => {
                    const emp = employees.find(e => e.id === rec.employeeId);
                    return <option key={rec.id} value={rec.id}>{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')} — {fmtDT(rec.date)}</option>;
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.incidentType')}</label>
                  <select value={createType} onChange={(e) => setCreateType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs">
                    {INCIDENT_TYPES.map(it => <option key={it.value} value={it.value}>{t(it.key)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.severity')}</label>
                  <select value={createSeverity} onChange={(e) => setCreateSeverity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs">
                    {SEVERITIES.map(s => <option key={s.value} value={s.value}>{t(s.key)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.description')}</label>
                <textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} rows={3}
                  placeholder={t('hr.attendance.descPlaceholder')}
                  className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs resize-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setShowCreateModal(false)} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold">{t('common.cancel')}</button>
              <button onClick={handleCreateIncident} disabled={!createRecordId || !createDesc.trim() || createLoading}
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                {createLoading ? t('hr.attendance.filing') : t('hr.attendance.fileBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveTarget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.attendance.resolveTitle')}</h3>
              <button onClick={() => setResolveTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold">×</button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.resolutionNotes')}</label>
              <textarea value={resolveNotes} onChange={(e) => setResolveNotes(e.target.value)} rows={4}
                placeholder={t('hr.attendance.resolvePlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs resize-none" />
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setResolveTarget(null)} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold">{t('common.cancel')}</button>
              <button onClick={handleResolve} disabled={!resolveNotes.trim() || resolveLoading}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50">
                {resolveLoading ? t('hr.attendance.resolving') : t('hr.attendance.resolveBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.attendance.rejectTitle')}</h3>
              <button onClick={() => setRejectTarget(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg font-bold">×</button>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.attendance.rejectionReason')}</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4}
                placeholder={t('hr.attendance.rejectPlaceholder')}
                className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-3 text-xs resize-none" />
            </div>
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setRejectTarget(null)} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold">{t('common.cancel')}</button>
              <button onClick={handleReject} disabled={!rejectReason.trim() || rejectLoading}
                className="bg-rose-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50">
                {rejectLoading ? t('hr.attendance.rejecting') : t('hr.attendance.rejectBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 text-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">{t('hr.attendance.cancelTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{t('hr.attendance.cancelWarning')}</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setCancelTarget(null)} className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold">{t('hr.attendance.keepOpen')}</button>
              <button onClick={handleCancel} disabled={cancelLoading}
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors disabled:opacity-50">
                {cancelLoading ? t('hr.attendance.cancelling') : t('hr.attendance.cancelBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTab;
