import { useTranslation } from 'react-i18next';

interface DeptModalProps {
  viewingDept: any;
  setViewingDept: (v: null) => void;
  employees: any[];
  positions: any[];
}

export default function DeptModal({ viewingDept, setViewingDept, employees, positions }: DeptModalProps) {
  const { t } = useTranslation();
  return (
    <>
      {viewingDept && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingDept(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">{t('hr.deptModal.title', { name: viewingDept.name })}</h3>
              <button onClick={() => setViewingDept(null)} className="text-slate-400 hover:text-white font-bold text-lg">&times;</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.deptModal.code')}</p><p className="font-bold text-slate-800">{viewingDept.code}</p></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.deptModal.status')}</p><p className="font-bold text-emerald-600">{viewingDept.status === 'ACTIVE' ? t('hr.employees.active') : t('hr.employees.inactive')}</p></div>
              </div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('hr.deptModal.description')}</p><p className="text-slate-600">{viewingDept.description || t('hr.deptModal.noDescription')}</p></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">{t('hr.deptModal.employees')}</p>
                {(() => {
                  const deptEmps = employees.filter((e: any) => e.departmentId === viewingDept.id || e.department?.id === viewingDept.id);
                  if (deptEmps.length === 0) return <p className="italic text-slate-400 text-xs">{t('hr.deptModal.noEmployees')}</p>;
                  return (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {deptEmps.map((e: any) => (
                        <div key={e.id} className="flex justify-between items-center text-xs bg-slate-50 rounded-lg px-3 py-2">
                          <span className="font-semibold text-slate-800">{e.firstName} {e.lastName}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{positions.find(p => p.id === e.positionId)?.name || t('hr.deptModal.unknown')}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 flex justify-end">
              <button onClick={() => setViewingDept(null)} className="bg-slate-900 text-white rounded-lg text-xs font-semibold px-4 py-2 hover:bg-slate-800 transition-colors">{t('hr.deptModal.close')}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}