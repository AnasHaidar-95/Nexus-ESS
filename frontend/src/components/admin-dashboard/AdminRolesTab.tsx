import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Shield, Check, Loader2, Trash2, Save, Users, X } from 'lucide-react';
import { useRolePermissions } from '../../hooks/queries/useRoles';

interface AdminRolesTabProps {
  roles: any[];
  permissions: any[];
  employees: any[];
  onCreateRole: (name: string, description: string) => Promise<void>;
  onDeleteRole: (id: string) => Promise<void>;
  onSavePermissions: (roleId: string, permissionIds: string[]) => Promise<void>;
  onAssignRole: (employeeId: string, roleId: string) => Promise<void>;
}

export default function AdminRolesTab({
  roles,
  permissions,
  employees,
  onCreateRole,
  onDeleteRole,
  onSavePermissions,
  onAssignRole,
}: AdminRolesTabProps) {
  const { t } = useTranslation();
  const [isRoleModalOpen, setRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [employeeRoleSelection, setEmployeeRoleSelection] = useState<Record<string, string>>({});
  const [savingPerms, setSavingPerms] = useState(false);

  const rolePermissionsQuery = useRolePermissions(selectedRoleId || '');
  const currentRolePermissions: string[] = Array.isArray(rolePermissionsQuery.data) ? rolePermissionsQuery.data : [];

  const groupedPermissions: Record<string, any[]> = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, any[]>);

  const togglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleRoleSelect = (roleId: string) => {
    setSelectedRoleId(roleId);
  };

  useEffect(() => {
    if (selectedRoleId && rolePermissionsQuery.data) {
      setSelectedPermissionIds(currentRolePermissions);
    }
  }, [selectedRoleId, rolePermissionsQuery.data]);

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPerms(true);
    await onSavePermissions(selectedRoleId, selectedPermissionIds);
    setSavingPerms(false);
  };

  const handleCreateRole = async () => {
    if (!roleName) return;
    await onCreateRole(roleName, roleDesc);
    setRoleModalOpen(false);
    setRoleName('');
    setRoleDesc('');
  };

  const handleAssignRole = (employeeId: string) => {
    const roleId = employeeRoleSelection[employeeId];
    if (roleId) onAssignRole(employeeId, roleId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.roleManagement')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.roleManagementSubtitle')}</p>
        </div>
        <button onClick={() => setRoleModalOpen(true)} className="flex items-center space-x-2 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-900">
          <Plus className="w-4 h-4" />
          <span>{t('admin.addNewRole')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Role List */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 overflow-y-auto max-h-[70vh]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('admin.availableRoles')}</h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">{roles.length}</span>
          </div>
          {roles.map((role) => (
            <div key={role.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-slate-800 transition-all group">
              <button onClick={() => handleRoleSelect(role.id)} className={`flex-1 flex items-center space-x-3 text-left ${selectedRoleId === role.id ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                <Shield className="h-4 w-4" />
                <span className="text-xs">{role.name}</span>
              </button>
              {role.name !== 'ADMIN' && role.name !== 'EMPLOYEE' && (
                <button onClick={() => onDeleteRole(role.id)} className="p-1.5 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 rounded-lg transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Permissions Editor */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="flex justify-between items-center mb-2 sticky top-0 bg-white dark:bg-slate-900 z-10 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedRoleId ? `${t('admin.permissionsFor')} ${roles.find(r => r.id === selectedRoleId)?.name}` : t('admin.selectRoleToManage')}</h3>
            {selectedRoleId && (
              <button onClick={handleSavePermissions} disabled={!selectedRoleId || savingPerms} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg font-semibold text-[10px] hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900 disabled:opacity-50">
                {savingPerms ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                <span>{savingPerms ? t('admin.saving') : t('admin.savePermissions')}</span>
              </button>
            )}
          </div>
          {selectedRoleId && Object.entries(groupedPermissions).map(([module, perms]) => (
            <div key={module} className="mb-4">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">{module}</h4>
              <div className="space-y-1">
                {perms.map((perm) => {
                   const isChecked = selectedPermissionIds.includes(perm.code);
                   return (
                     <button key={perm.id} onClick={() => togglePermission(perm.code)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-xs transition-all ${isChecked ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-900' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950'}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-700'}`}>
                        {isChecked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span>{perm.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Employee Role Assignment */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('admin.assignRolesToEmployees')}</h3>
          </div>
          {employees.map((emp) => (
            <div key={emp.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <div className="bg-slate-200 dark:bg-slate-800 h-8 w-8 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                  {emp.profilePhoto ? <img src={emp.profilePhoto} alt="" className="w-full h-full object-cover" /> : <Users className="w-4 h-4" />}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.firstName} {emp.lastName}</p>
                  <p className="text-[10px] text-slate-400">{t('admin.currentRole')}: {emp.role?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={employeeRoleSelection[emp.id] || ''}
                  onChange={(e) => setEmployeeRoleSelection((prev) => ({ ...prev, [emp.id]: e.target.value }))}
                  className="flex-1 sm:w-32 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('admin.selectRole')}</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleAssignRole(emp.id)}
                  disabled={!employeeRoleSelection[emp.id]}
                  className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 disabled:opacity-50 border border-blue-100 dark:border-blue-900"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl w-full max-w-md space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{t('admin.createNewRole')}</h3>
            <div className="space-y-3">
              <input type="text" placeholder={t('admin.roleName')} value={roleName} onChange={(e) => setRoleName(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder={t('admin.descriptionOptional')} value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} className="w-full p-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950"><X className="w-3.5 h-3.5 inline mr-1" />{t('cancel')}</button>
              <button onClick={handleCreateRole} disabled={!roleName} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs disabled:opacity-50">
                <Plus className="w-3.5 h-3.5 inline mr-1" />{t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
