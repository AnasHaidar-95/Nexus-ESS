import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2, X, Loader2, Check } from 'lucide-react';
import { attendanceDeviceApi } from '../../lib/attendance-devices';
import { auditLogApi } from '../../lib/audit-logs';
import { useQueryClient } from '@tanstack/react-query';
import { ATTENDANCE_DEVICE_KEYS } from '../../hooks/queries/useAttendanceDevices';
import { ATTENDANCE_KEYS } from '../../hooks/queries/useAttendanceRecords';
import { AUDIT_LOG_KEYS } from '../../hooks/queries/useAuditLogs';
import { useNotificationStore } from '../../stores/notificationStore';

interface AdminDevicesTabProps {
  devices: any[];
  onRegisterDevice: (form: { name: string; location: string; deviceSerialNumber: string }) => Promise<void>;
  onUpdateDevice: (id: string, form: { name: string; location: string; deviceSerialNumber: string }) => Promise<void>;
  onDeleteDevice: (id: string) => Promise<void>;
  onTestConnection: (id: string) => Promise<void>;
  currentUser: any;
}

export default function AdminDevicesTab({ devices, onRegisterDevice, onUpdateDevice, onDeleteDevice, onTestConnection, currentUser }: AdminDevicesTabProps) {
  const { t } = useTranslation();
  const showToast = useNotificationStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [deviceForm, setDeviceForm] = useState({ name: '', location: '', deviceSerialNumber: '' });
  const [submitting, setSubmitting] = useState(false);

  const openCreateModal = () => { setEditingDevice(null); setDeviceForm({ name: '', location: '', deviceSerialNumber: '' }); setModalOpen(true); };
  const openEditModal = (device: any) => {
    setEditingDevice(device);
    setDeviceForm({ name: device.name || device.deviceName, location: device.location || '', deviceSerialNumber: device.serialNumber || device.deviceSerialNumber || '' });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    if (editingDevice) {
      await onUpdateDevice(editingDevice.id, deviceForm);
    } else {
      await onRegisterDevice(deviceForm);
    }
    setSubmitting(false);
    setModalOpen(false);
  };

  const handleSync = async (dev: any) => {
    try {
      const res = await attendanceDeviceApi.sync(dev.id);
      showToast(t('admin.syncSuccessful'), t('admin.syncSuccessfulMessage', { count: res.recordsImported, name: dev.deviceName || dev.name }), 'success');
      await auditLogApi.create({ userId: currentUser.id, eventType: 'ATTENDANCE', entityName: 'AttendanceDevice', entityId: dev.id, action: 'SYNC_DEVICE', description: 'Triggered RFID/Biometric terminal manual sync' });
    } catch (error) {
      showToast(t('admin.syncFailed'), t('admin.syncFailedMessage', { name: dev.deviceName || dev.name }), 'error');
    }
    queryClient.invalidateQueries({ queryKey: ATTENDANCE_DEVICE_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEYS.all });
    queryClient.invalidateQueries({ queryKey: AUDIT_LOG_KEYS.all });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.attendanceDevices')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.deviceManagementSubtitle')}</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Plus className="w-4 h-4" />
          <span>{t('admin.addDevice')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device: any) => {
          const devName = device.name || device.deviceName;
          const devCode = device.deviceCode || device.serialNumber || device.deviceSerialNumber;
          return (
            <div key={device.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 bg-sky-50 dark:bg-sky-950/30 text-sky-500 dark:text-sky-400 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>
                </div>
                <div className="flex space-x-1">
                  <button onClick={() => openEditModal(device)} className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDeleteDevice(device.id)} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{devName}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{device.location || t('admin.noLocation')}</p>
              {devCode && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">SN: {devCode}</p>}
              <div className="flex space-x-2 mt-4">
                <button onClick={() => onTestConnection(device.id)} className="flex-1 text-[10px] px-2 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors font-semibold">{t('admin.testPing')}</button>
                <button onClick={() => handleSync(device)} className="flex-1 text-[10px] px-2 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-bold">{t('admin.syncLogs')}</button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{editingDevice ? t('admin.editDevice') : t('admin.addNewDevice')}</h3>
            <div className="space-y-3">
              <input type="text" placeholder={t('admin.deviceName')} value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder={t('admin.location')} value={deviceForm.location} onChange={(e) => setDeviceForm({ ...deviceForm, location: e.target.value })} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder={t('admin.deviceSerialNumber')} value={deviceForm.deviceSerialNumber} onChange={(e) => setDeviceForm({ ...deviceForm, deviceSerialNumber: e.target.value })} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950"><X className="w-3.5 h-3.5 inline mr-1" />{t('cancel')}</button>
              <button onClick={handleSubmit} disabled={!deviceForm.name || submitting} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs disabled:opacity-50">
                {submitting ? <Loader2 className="w-3.5 h-3.5 inline mr-1 animate-spin" /> : <Check className="w-3.5 h-3.5 inline mr-1" />}
                {editingDevice ? t('admin.updateDevice') : t('admin.addDevice')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
