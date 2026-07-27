import { useTranslation } from 'react-i18next';
import { User as UserIcon, Calendar, Clock, ClipboardList, CreditCard, Award, Sun, Menu } from 'lucide-react';
import { formatTimeFromMinutes } from './utils';
import type { ShiftData } from './types';

interface EmployeeSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  mobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  shift: ShiftData | null;
}

const TABS = [
  { id: 'dashboard', icon: Calendar, labelKey: 'employee.dashboard' },
  { id: 'profile', icon: UserIcon, labelKey: 'employee.myProfile' },
  { id: 'attendance', icon: Clock, labelKey: 'employee.myAttendance' },
  { id: 'leaves', icon: ClipboardList, labelKey: 'employee.myLeaves' },
  { id: 'payroll', icon: CreditCard, labelKey: 'employee.myPayroll' },
  { id: 'performance', icon: Award, labelKey: 'employee.performanceReviews' },
] as const;

export default function EmployeeSidebar({
  activeTab,
  onTabChange,
  sidebarOpen,
  onToggleSidebar,
  mobileSidebarOpen,
  onCloseMobileSidebar,
  shift,
}: EmployeeSidebarProps) {
  const { t } = useTranslation();

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    onCloseMobileSidebar();
  };

  return (
    <>
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onCloseMobileSidebar}
        />
      )}

      <aside className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-4 text-slate-600 dark:text-slate-400 flex flex-col shrink-0 overflow-hidden
        fixed lg:static inset-y-0 left-0 z-40
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center'} mb-6 h-8 shrink-0 whitespace-nowrap`}>
          {sidebarOpen && (
            <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t('employee.dashboard')}</p>
          )}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
            title={sidebarOpen ? t('employee.collapseSidebar') : t('employee.expandSidebar')}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 px-3 flex-1 overflow-y-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                title={t(tab.labelKey)}
                className={`flex items-center ${sidebarOpen ? 'justify-between w-full px-3' : 'justify-center px-1'} py-2.5 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
              >
                <div className="flex items-center">
                  {sidebarOpen && (
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-blue-600' : 'bg-transparent'}`} />
                  )}
                  <Icon className={`h-4 w-4 ${sidebarOpen ? 'mr-2' : ''}`} />
                  {sidebarOpen && <span className="truncate">{t(tab.labelKey)}</span>}
                </div>
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="mt-auto pt-6 px-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-xs space-y-2 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
              <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <Sun className="h-3.5 w-3.5 mr-1.5 text-amber-500 animate-pulse" /> {t('employee.currentShift')}
              </p>
              <p className="font-bold text-slate-800 dark:text-slate-100">{shift ? shift.name : t('employee.noAssignedShift')}</p>
              {shift && (
                <p className="text-[10px]">
                  {t('common.time')}: {formatTimeFromMinutes(shift.startTimeMinutes)} - {formatTimeFromMinutes(shift.endTimeMinutes)}
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
