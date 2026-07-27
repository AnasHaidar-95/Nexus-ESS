import { useTranslation } from 'react-i18next';
import ThemeToggle from '../ThemeToggle';
import LanguageSwitcher from '../LanguageSwitcher';
import { Bell, Check, LogOut, Menu } from 'lucide-react';
import { Notification } from '../../types';

interface HRNavbarProps {
  isAdminMode: boolean;
  showNotificationsDropdown: boolean;
  setShowNotificationsDropdown: (v: boolean) => void;
  unreadCount: number;
  notifications: Notification[];
  handleMarkNotificationRead: (id: string) => void;
  handleMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export default function HRNavbar({
  isAdminMode,
  showNotificationsDropdown,
  setShowNotificationsDropdown,
  unreadCount,
  notifications,
  handleMarkNotificationRead,
  handleMarkAllNotificationsRead,
  onLogout,
  onToggleSidebar,
}: HRNavbarProps) {
  const { t } = useTranslation();
  return (
    <nav className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all mr-1"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center font-extrabold text-white shadow-sm">
          H
        </div>
        <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
          {isAdminMode ? t('hr.navbar.titleAdmin') : t('hr.navbar.titleHR')}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <LanguageSwitcher />
        <ThemeToggle />

        <div className="relative">
          <button 
            onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{t('hr.navbar.notificationTitle')}</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllNotificationsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    {t('hr.navbar.markAllRead')}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-500 italic text-center">{t('hr.navbar.noNotifications')}</p>
                ) : (
                  notifications.map(not => (
                    <div 
                      key={not.id} 
                      className={`p-3 text-xs border-b border-slate-100 dark:border-slate-800 flex justify-between items-start transition-colors ${!not.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                    >
                      <div className="space-y-1 min-w-0">
                        <p className={`font-semibold text-slate-800 dark:text-slate-200 ${!not.isRead ? 'text-blue-900 dark:text-blue-400' : ''}`}>{not.title}</p>
                        <p className="text-slate-500 dark:text-slate-400 leading-normal">{not.message}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(not.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!not.isRead && (
                        <button 
                          onClick={() => handleMarkNotificationRead(not.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 hover:bg-blue-100 dark:hover:bg-blue-950/40 rounded shrink-0 ml-2"
                          title={t('hr.navbar.markRead')}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('hr.navbar.liveConnection')}</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 px-2 sm:px-3 py-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('hr.navbar.signOut')}</span>
        </button>
      </div>
    </nav>
  );
}