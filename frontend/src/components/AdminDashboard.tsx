import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { User, SystemSetting, Role, Permission, AttendanceDevice } from '../types';
import { systemSettingApi } from '../lib/system-settings';
import { auditLogApi } from '../lib/audit-logs';
import { roleApi } from '../lib/roles';
import { attendanceDeviceApi } from '../lib/attendance-devices';
import { userApi } from '../lib/users';
import { useSystemSettings } from '../hooks/queries/useSystemSettings';
import { useRoles, ROLE_KEYS } from '../hooks/queries/useRoles';
import { usePermissions } from '../hooks/queries/usePermissions';
import { useAttendanceDevices, ATTENDANCE_DEVICE_KEYS } from '../hooks/queries/useAttendanceDevices';
import { useEmployees } from '../hooks/queries/useEmployees';
import { useProfileRequests } from '../hooks/queries/useProfileRequests';
import { useDepartments } from '../hooks/queries/useDepartments';
import { useAttendanceRecords } from '../hooks/queries/useAttendanceRecords';
import { useUsers, USER_KEYS } from '../hooks/queries/useUsers';
import { SYSTEM_SETTING_KEYS } from '../hooks/queries/useSystemSettings';
import { AUDIT_LOG_KEYS } from '../hooks/queries/useAuditLogs';
import HRDashboard from './HRDashboard';
import { useNotificationStore } from '../stores/notificationStore';
import { AdminNavbar, AdminStatisticsTab, AdminSettingsTab, AdminAuditTab, AdminAuditTrailTab, AdminRolesTab, AdminDevicesTab } from './admin-dashboard';

interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function AdminDashboard({ currentUser, onLogout }: AdminDashboardProps) {
  const { t } = useTranslation();
  const showToast = useNotificationStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const [adminTab, setAdminTab] = useState('statistics');

  // Data via TanStack Query
  const { data: settingsData } = useSystemSettings({ pageSize: 100 });
  const { data: rolesData } = useRoles({ pageSize: 100 });
  const { data: permissionsData } = usePermissions({ pageSize: 100 });
  const { data: devicesData } = useAttendanceDevices({ pageSize: 100 });
  const { data: employeesData } = useEmployees({ pageSize: 100 });
  const { data: profileData } = useProfileRequests({ pageSize: 100 });
  const { data: departmentsData } = useDepartments({ pageSize: 100 });
  const { data: attendanceData } = useAttendanceRecords({ pageSize: 100, sort: '-date' });
  const { data: usersData } = useUsers({ pageSize: 100 });

  const settings: SystemSetting[] = settingsData?.items || [];
  const roles: Role[] = rolesData?.items || [];
  const permissions: Permission[] = permissionsData?.items || [];
  const devices: AttendanceDevice[] = devicesData?.items || [];
  const employees: any[] = employeesData?.items || [];
  const profileChangeRequests: any[] = profileData?.items || [];
  const departments: any[] = departmentsData?.items || [];
  const attendanceRecords: any[] = attendanceData?.items || [];
  const users: any[] = usersData?.items || [];

  const addAuditLog = async (userId: string | undefined, employeeId: string | undefined, eventType: string, entityName: string, entityId: string, action: string, description: string) => {
    try {
      await auditLogApi.create({ userId, employeeId, eventType, entityName, entityId: entityId || undefined, action, description });
    } catch {
      // API unavailable or insufficient permissions
    }
  };

  // Settings handlers
  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await systemSettingApi.update(key, { value });
      await auditLogApi.create({ userId: currentUser.id, eventType: 'SYSTEM_CONFIGURATION', entityName: 'SystemSetting', entityId: key, action: 'UPDATE_SETTING', description: `Updated setting ${key} to value: ${value}` });
      showToast(t('common.update'), t('admin.settingsUpdated', { key }), 'success');
    } catch (error) {
      console.error('API update failed:', error);
    }
    queryClient.invalidateQueries({ queryKey: SYSTEM_SETTING_KEYS.all });
    queryClient.invalidateQueries({ queryKey: AUDIT_LOG_KEYS.all });
  };

  // Device handlers
  const handleRegisterDevice = async (deviceForm: { name: string; location: string; deviceSerialNumber: string }) => {
    try {
      await attendanceDeviceApi.create({ name: deviceForm.name, serialNumber: deviceForm.deviceSerialNumber, deviceType: 'FACE_RECOGNITION', ipAddress: '192.168.10.60', port: 4370, location: deviceForm.location });
      await auditLogApi.create({ userId: currentUser.id, eventType: 'SYSTEM_CONFIGURATION', entityName: 'AttendanceDevice', entityId: '', action: 'CREATE_DEVICE', description: `Registered new attendance terminal ${deviceForm.name}` });
      showToast(t('admin.addDevice'), t('admin.deviceRegistered', { name: deviceForm.name }), 'success');
    } catch (error) {
      console.error('API create failed:', error);
    }
    queryClient.invalidateQueries({ queryKey: ATTENDANCE_DEVICE_KEYS.all });
    queryClient.invalidateQueries({ queryKey: AUDIT_LOG_KEYS.all });
  };

  const handleUpdateDevice = async (id: string, deviceForm: { name: string; location: string; deviceSerialNumber: string }) => {
    try {
      await attendanceDeviceApi.update(id, deviceForm);
      showToast(t('common.update'), t('admin.deviceUpdated', { name: deviceForm.name }), 'success');
    } catch (error) {
      console.error('API update failed:', error);
    }
    queryClient.invalidateQueries({ queryKey: ATTENDANCE_DEVICE_KEYS.all });
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      await attendanceDeviceApi.delete(id);
      showToast(t('common.delete'), t('admin.deviceDeleted'), 'success');
    } catch (error) {
      console.error('API delete failed:', error);
    }
    queryClient.invalidateQueries({ queryKey: ATTENDANCE_DEVICE_KEYS.all });
  };

  const handleTestConnection = async (devId: string) => {
    try {
      const res = await attendanceDeviceApi.test(devId);
      showToast(t('admin.pingSuccess'), res.message || t('admin.deviceResponsive'), 'success');
      await auditLogApi.create({ userId: currentUser.id, eventType: 'SYSTEM_CONFIGURATION', entityName: 'AttendanceDevice', entityId: devId, action: 'TEST_CONNECTION', description: 'Ping tested terminal connection' });
    } catch (error) {
      showToast(t('admin.pingFailed'), t('admin.couldNotReachDevice'), 'error');
    }
  };

  // Role handlers
  const handleCreateRole = async (name: string, description: string) => {
    try {
      const code = name.toUpperCase().replace(/\s+/g, '_').slice(0, 30);
      await roleApi.create({ name, code, description: description || undefined });
      showToast(t('admin.roleCreated'), t('admin.roleCreatedMessage', { name }), 'success');
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
    } catch (err: any) {
      showToast(t('common.error'), err?.message || t('admin.failedToCreateRole'), 'error');
    }
  };

  const handleDeleteRole = async (id: string) => {
    try {
      await roleApi.delete(id);
      showToast(t('common.delete'), t('admin.roleDeleted'), 'success');
      queryClient.invalidateQueries({ queryKey: ROLE_KEYS.all });
    } catch (err: any) {
      showToast(t('common.error'), err?.message || t('admin.failedToDeleteRole'), 'error');
    }
  };

  const handleSavePermissions = async (roleId: string, permissionIds: string[]) => {
    try {
      await roleApi.setPermissions(roleId, { permissionIds });
      showToast(t('admin.permissionsSaved'), t('admin.permissionsUpdatedSuccess'), 'success');
      await auditLogApi.create({ userId: currentUser.id, eventType: 'ROLE_PERMISSION', entityName: 'Role', entityId: roleId, action: 'UPDATE_PERMISSIONS', description: `Updated permissions for role ${roleId}` });
    } catch (error) {
      showToast(t('common.error'), t('admin.failedToSavePermissions'), 'error');
    }
    queryClient.invalidateQueries({ queryKey: ROLE_KEYS.permissions(roleId) });
    queryClient.invalidateQueries({ queryKey: AUDIT_LOG_KEYS.all });
  };

  const handleAssignRole = async (employeeId: string, roleId: string) => {
    const emp = employees.find((e: any) => e.id === employeeId);
    if (!emp) return;
    const user = users.find((u: any) => u.employeeId === employeeId);
    if (!user) {
      showToast(t('common.error'), t('admin.noUserAccount'), 'error');
      return;
    }
    try {
      await userApi.update(user.id, { roleId });
      const role = roles.find(r => r.id === roleId);
      showToast(t('admin.roleAssigned'), t('admin.roleAssignedMessage', { firstName: emp.firstName, lastName: emp.lastName, roleName: role?.name || t('common.unknown') }), 'success');
      await addAuditLog(currentUser.id, emp.id, 'USER_MANAGEMENT', 'users', user.id, 'UPDATE_ROLE', `Changed role for ${emp.firstName} ${emp.lastName} to ${role?.name}`);
      queryClient.invalidateQueries({ queryKey: USER_KEYS.all });
      queryClient.invalidateQueries({ queryKey: AUDIT_LOG_KEYS.all });
    } catch (err) {
      showToast(t('common.error'), t('admin.failedToAssignRole'), 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col font-sans text-slate-950 dark:text-slate-50 transition-colors duration-200">
      <AdminNavbar onLogout={onLogout} activeTab={adminTab} onTabChange={setAdminTab} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 sm:pb-8">
        {adminTab === 'hr_view' ? (
          <HRDashboard currentUser={currentUser} onLogout={onLogout} />
        ) : (
          <div>
            {adminTab === 'statistics' && (
              <AdminStatisticsTab
                employees={employees}
                roles={roles}
                permissions={permissions}
                profileChangeRequests={profileChangeRequests}
                attendanceRecords={attendanceRecords}
                departments={departments}
              />
            )}
            {adminTab === 'settings' && (
              <AdminSettingsTab
                settings={settings}
                onUpdateSetting={handleUpdateSetting}
              />
            )}
            {adminTab === 'audit' && (
              <AdminAuditTab
                attendanceRecords={attendanceRecords}
                users={users}
                employees={employees}
              />
            )}
            {adminTab === 'auditTrail' && (
              <AdminAuditTrailTab users={users} employees={employees} />
            )}
            {adminTab === 'roles' && (
              <AdminRolesTab
                roles={roles}
                permissions={permissions}
                employees={employees}
                onCreateRole={handleCreateRole}
                onDeleteRole={handleDeleteRole}
                onSavePermissions={handleSavePermissions}
                onAssignRole={handleAssignRole}
              />
            )}
            {adminTab === 'devices' && (
              <AdminDevicesTab
                devices={devices}
                onRegisterDevice={handleRegisterDevice}
                onUpdateDevice={handleUpdateDevice}
                onDeleteDevice={handleDeleteDevice}
                onTestConnection={handleTestConnection}
                currentUser={currentUser}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
