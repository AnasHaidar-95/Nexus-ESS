import { useTranslation } from 'react-i18next';
import { Award } from 'lucide-react';
import type { PerformanceReviewData } from './types';

interface EmployeePerformanceTabProps {
  performanceReviews: PerformanceReviewData[];
}

export default function EmployeePerformanceTab({ performanceReviews }: EmployeePerformanceTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.myPerformanceReviews')}</h2>

      {performanceReviews.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
          <Award className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500 italic">{t('employee.noPerformanceReviews')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {performanceReviews.map(rev => (
            <div key={rev.id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">{t('employee.reviewCycle')}</p>
                  <p className="font-extrabold text-slate-800 text-lg mt-0.5">{rev.cycle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">{t('employee.ratingScore')}</p>
                  <p className="font-extrabold text-sky-600 text-2xl mt-0.5">{rev.rating ? `${rev.rating} / 5` : t('employee.pending')}</p>
                </div>
              </div>
              <div className="text-xs space-y-3">
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">{t('employee.reviewGoalsDeliverables')}</p>
                  <p className="text-slate-600 mt-1 bg-slate-50 p-4 rounded-xl leading-normal border border-slate-100">{(rev.goals as any)?.text || t('employee.noGoals')}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">{t('employee.reviewerManagerComments')}</p>
                  <p className="text-slate-600 mt-1 leading-normal italic">"{rev.comments || t('employee.noComments')}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
