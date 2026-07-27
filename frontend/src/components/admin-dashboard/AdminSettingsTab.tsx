import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Edit2, X, Loader2, Check } from 'lucide-react';

interface AdminSettingsTabProps {
  settings: any[];
  onUpdateSetting: (key: string, value: string) => Promise<void>;
}

export default function AdminSettingsTab({ settings, onUpdateSetting }: AdminSettingsTabProps) {
  const { t } = useTranslation();
  const [editingSettings, setEditingSettings] = useState<Record<string, any>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveSetting = async (key: string) => {
    if (!editingSettings[key]) return;
    setSaving(true);
    await onUpdateSetting(key, editingSettings[key]);
    setSaving(false);
    setEditingKey(null);
    setEditingSettings(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('admin.systemParameters')}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('admin.systemParametersSubtitle')}</p>
      </div>
      <div className="space-y-3">
        {settings.map((setting: any) => {
          const isEditing = editingKey === setting.key;
          return (
            <div key={setting.key} className={`bg-white dark:bg-slate-900 border rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 transition-colors ${isEditing ? 'border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'border-slate-100 dark:border-slate-800'}`}>
              <div>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">{t(`settings.${setting.key}`, setting.key)}</span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{setting.description}</p>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editingSettings[setting.key] ?? ''}
                      onChange={e => setEditingSettings(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="flex-1 sm:w-64 border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs p-2 rounded-lg focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent outline-none shadow-inner"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveSetting(setting.key); if (e.key === 'Escape') setEditingKey(null); }}
                    />
                    <button onClick={() => saveSetting(setting.key)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm" disabled={saving}>
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setEditingKey(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-inner">{setting.value}</span>
                    <button onClick={() => { setEditingKey(setting.key); setEditingSettings(prev => ({ ...prev, [setting.key]: setting.value })); }} className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-800"><Edit2 className="w-3.5 h-3.5" /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
