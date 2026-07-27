import { useTranslation } from 'react-i18next';

interface PositionModalProps {
  viewingPosition: any;
  setViewingPosition: (v: null) => void;
  employees: any[];
  departments: any[];
}

export default function PositionModal({ viewingPosition, setViewingPosition, employees, departments }: PositionModalProps) {
  const { t } = useTranslation();
  return (
    <>
      {viewingPosition && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingPosition(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">{t('hr.positionModal.title', { name: viewingPosition.name })}</h3>
              <button onClick={() => setViewingPosition(null)} className="text-slate-400 hover:text-white font-bold text-lg">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.positionModal.code')}</p><p className="font-bold text-slate-800">{viewingPosition.code}</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.positionModal.grade')}</p><p className="font-bold text-slate-800">{viewingPosition.grade || 1}</p></div>
              </div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.positionModal.status')}</p><p className="font-bold text-emerald-600">{viewingPosition.status === 'ACTIVE' ? t('hr.employees.active') : t('hr.employees.inactive')}</p></div>
              {viewingPosition.description && <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.positionModal.description')}</p><p className="text-slate-600">{viewingPosition.description}</p></div>}
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">{t('hr.positionModal.employees')}</p>
                {(() => {
                  const posEmps = employees.filter((e: any) => e.positionId === viewingPosition.id || e.position?.id === viewingPosition.id);
                  if (posEmps.length === 0) return <p className="italic text-slate-400 text-xs">{t('hr.positionModal.noEmployees')}</p>;
                  return (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {posEmps.map((e: any) => (
                        <div key={e.id} className="flex justify-between items-center text-xs bg-slate-50 rounded-lg px-3 py-2">
                          <span className="font-semibold text-slate-800">{e.firstName} {e.lastName}</span>
                          <span className="text-[10px] text-slate-400">{departments.find(d => d.id === e.departmentId)?.name || t('hr.positionModal.unknown')}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewingPosition(null)} className="bg-slate-900 text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors">{t('hr.positionModal.close')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}