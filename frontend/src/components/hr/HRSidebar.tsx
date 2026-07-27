import { useTranslation } from 'react-i18next';
import { User as UserIcon, Calendar, Clock, ClipboardList, CreditCard, Award, Building, Edit, Menu } from 'lucide-react';

interface HRSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  applicants: any[];
  leaveRequests: any[];
  profileRequests: any[];
  mobileSidebarOpen?: boolean;
  setMobileSidebarOpen?: (v: boolean) => void;
}

export default function HRSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
  applicants,
  leaveRequests,
  profileRequests,
  mobileSidebarOpen = false,
  setMobileSidebarOpen,
}: HRSidebarProps) {
  const { t } = useTranslation();
  return (
    <aside className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-4 text-slate-600 dark:text-slate-400 flex flex-col shrink-0 overflow-hidden
      fixed lg:static inset-y-0 left-0 z-40
      ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      {/* Sidebar Header with Toggle Button */}
      <div className={`flex items-center ${sidebarOpen ? 'justify-between px-6' : 'justify-center'} mb-6 h-8 shrink-0 whitespace-nowrap`}>
        {sidebarOpen ? (
          <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">
            {t('hr.sidebar.hrCenter')}
          </span>
        ) : null}
        <button
          onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen?.(false); }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all"
          title={sidebarOpen ? t('hr.sidebar.collapse') : t('hr.sidebar.expand')}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="space-y-1 px-3 flex-1 overflow-y-auto">
        {[
          { id: 'applicants', name: t('hr.sidebar.onboardingPending'), icon: UserIcon, badge: applicants.length },
          { id: 'employees', name: t('hr.sidebar.rosterProfiles'), icon: ClipboardList },
          { id: 'org', name: t('hr.sidebar.orgStructuring'), icon: Building },
          { id: 'shifts', name: t('hr.sidebar.shiftAssignments'), icon: Calendar },
          { id: 'attendance', name: t('hr.sidebar.dailyAttendance'), icon: Clock },
          { id: 'leaves', name: t('hr.sidebar.leaveProfiles'), icon: ClipboardList, badge: leaveRequests.filter(r => r.status === 'PENDING').length },
          { id: 'payroll', name: t('hr.sidebar.payrollProfiles'), icon: CreditCard },
          { id: 'profileRequests', name: t('hr.sidebar.profileUpdates'), icon: Edit, badge: profileRequests.filter(r => r.status === 'PENDING').length },
          { id: 'reviews', name: t('hr.sidebar.reviewsRatings'), icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileSidebarOpen?.(false); }}
              title={tab.name}
              className={`flex items-center ${sidebarOpen ? 'justify-between w-full px-3' : 'justify-center px-1'} py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <div className="flex items-center">
                {sidebarOpen && (
                  <span className={`w-1.5 h-1.5 rounded-full mr-3 ${activeTab === tab.id ? 'bg-blue-600' : 'bg-transparent'}`}></span>
                )}
                <Icon className={`h-4 w-4 ${sidebarOpen ? 'mr-2' : ''}`} />
                {sidebarOpen && <span className="truncate">{tab.name}</span>}
              </div>
              {sidebarOpen && tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}