import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700/80 focus:outline-none"
      title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-amber-500 animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  );
}
