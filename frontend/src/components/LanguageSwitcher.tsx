import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer outline-none"
    >
      <Globe className="h-4 w-4" />
      <span>{i18n.language === 'en' ? 'EN' : 'AR'}</span>
    </button>
  );
}