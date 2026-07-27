import { useTranslation } from 'react-i18next';
import { LogOut, TrendingUp, Settings, ClipboardList, Shield, Cpu, Users } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';

interface AdminNavbarProps {
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'statistics', icon: TrendingUp, labelKey: 'admin.dashboard' },
  { id: 'settings', icon: Settings, labelKey: 'admin.systemSettings' },
  { id: 'audit', icon: ClipboardList, labelKey: 'admin.todayAttendanceLogs' },
  { id: 'auditTrail', icon: Shield, labelKey: 'admin.auditLogs' },
  { id: 'roles', icon: Shield, labelKey: 'admin.roleManagement' },
  { id: 'devices', icon: Cpu, labelKey: 'admin.attendanceDevices' },
  { id: 'hr_view', icon: Users, labelKey: 'admin.hrRosterView' },
] as const;

export default function AdminNavbar({ onLogout, activeTab, onTabChange }: AdminNavbarProps) {
  const { t } = useTranslation();

  return (
    <>
      <nav className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-extrabold text-white shadow-sm">A</div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">{t('admin.nexusAdminConsole')}</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
          <ThemeToggle />
          <LanguageSwitcher />
          <div className="hidden sm:flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('admin.systemAdminMode')}</span>
          </div>
          <button onClick={onLogout} className="flex items-center space-x-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 px-2 sm:px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 shadow-sm">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('auth.signOut')}</span>
          </button>
        </div>
      </nav>

      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 flex space-x-4 sm:space-x-6 text-sm font-semibold overflow-x-auto shrink-0 z-10 scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 pb-1.5 border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              <Icon className="h-4 w-4" />
              <span>{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
