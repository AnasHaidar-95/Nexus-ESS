import { useTranslation } from 'react-i18next';
import { Users, Shield, ClipboardList } from 'lucide-react';
import { isSameLocalDate, localDateStr, dbDateStr } from '../../lib/utils';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

interface AdminStatisticsTabProps {
  employees: any[];
  roles: any[];
  permissions: any[];
  profileChangeRequests: any[];
  attendanceRecords: any[];
  departments: any[];
}

export default function AdminStatisticsTab({
  employees,
  roles,
  permissions,
  profileChangeRequests,
  attendanceRecords,
  departments,
}: AdminStatisticsTabProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const totalEmployees = employees.filter(e => e.status === 'ACTIVE').length;
  const activeRolesCount = roles.length;
  const activeChangeRequestsCount = profileChangeRequests.filter(r => r.status === 'PENDING').length;
  const clockedInEmployeeIds = new Set(
    attendanceRecords.filter((r: any) => isSameLocalDate(r.date) && r.checkInTime && !r.checkOutTime).map((r: any) => r.employeeId)
  );
  const employeesOnlineCount = clockedInEmployeeIds.size;

  const COLORS = ['#2563eb', '#38bdf8', '#0ea5e9', '#0284c7', '#f43f5e', '#10b981', '#f59e0b'];

  const headcountData = departments.map(d => ({
    name: d.name,
    value: employees.filter(e => e.departmentId === d.id && e.status === 'ACTIVE').length || 1,
  }));

  const permissionGroups: Record<string, any[]> = {};
  for (const perm of permissions) {
    const mod = perm.module || 'Other';
    if (!permissionGroups[mod]) permissionGroups[mod] = [];
    permissionGroups[mod].push(perm);
  }
  const groupedModuleNames = Object.keys(permissionGroups).sort();

  const rolePermissionData = groupedModuleNames.map(mod => ({
    name: mod.length > 14 ? mod.slice(0, 12) + '…' : mod,
    count: permissionGroups[mod].length,
  })).sort((a, b) => b.count - a.count);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyCheckInsData = (() => {
    const now = new Date();
    const result: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = localDateStr(d);
      const count = attendanceRecords.filter(r => dbDateStr(r.date) === dateStr && r.status === 'PRESENT').length;
      result.push({ day: dayNames[d.getDay()], count });
    }
    return result;
  })();

  const tooltipStyle = { backgroundColor: 'rgba(30, 41, 59, 0.95)', border: 'none', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '11px', color: '#fff' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.orgTelemetryDashboard')}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.telemetrySubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{t('admin.totalEmployees')}</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-2">{t('admin.employeeCountActive', { count: totalEmployees })}</p>
          </div>
          <div className="h-10 w-10 bg-sky-50 dark:bg-sky-950/30 text-sky-500 dark:text-sky-400 rounded-xl flex items-center justify-center"><Users className="h-5 w-5" /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{t('admin.activeRoles')}</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-2">{t('admin.rolesCount', { count: activeRolesCount })}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center"><Shield className="h-5 w-5" /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{t('admin.pendingApproval')}</p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-2">{t('admin.pendingCount', { count: activeChangeRequestsCount })}</p>
          </div>
          <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 rounded-xl flex items-center justify-center"><ClipboardList className="h-5 w-5" /></div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">{t('admin.employeesOnline')}</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{t('admin.clockedInCount', { count: employeesOnlineCount })}</p>
            {employeesOnlineCount > 0 && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {employees.filter((e: any) => clockedInEmployeeIds.has(e.id)).slice(0, 3).map((e: any) => e.firstName).join(', ')}
                {employeesOnlineCount > 3 ? t('admin.xMore', { count: employeesOnlineCount - 3 }) : ''}
              </p>
            )}
          </div>
          <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 dark:text-emerald-400 rounded-xl flex items-center justify-center"><Users className="h-5 w-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('admin.departmentHeadcount')}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.headcountSubtitle')}</p>
          </div>
          <div className="h-48 mt-6 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={headcountData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {headcountData.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('admin.permissionsPerModule')}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.permissionsPerModuleSubtitle')}</p>
          </div>
          <div className="h-48 mt-6">
            {rolePermissionData.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-8">{t('admin.noPermissions')}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rolePermissionData} layout="vertical" margin={isRtl ? { top: 10, left: 10, right: 10, bottom: 0 } : { top: 10, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} reversed={isRtl} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tick={false} tickLine={false} width={80} orientation={isRtl ? 'right' : 'left'} reversed={isRtl} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [value, t('admin.permissions')]} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('admin.weeklyCheckIns')}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.checkInsSubtitle')}</p>
          </div>
          <span className="text-[10px] bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 px-2 py-1 rounded-md font-semibold">{t('admin.liveStream')}</span>
        </div>
        <div className="h-48 mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCheckInsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorCheckins)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
