import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Check } from 'lucide-react';
import { useEmployees } from '../../hooks/queries/useEmployees';
import { usePerformanceReviews } from '../../hooks/queries/useReviews';
import { performanceReviewApi } from '../../lib/performance-reviews';
import Pagination from './Pagination';
import { useNotificationStore } from '../../stores/notificationStore';

interface ReviewsTabProps {
  reviewsPage: number; setReviewsPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviewsPage, setReviewsPage, ITEMS_PER_PAGE,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);
  const { data: revRes, isLoading, isPlaceholderData } = usePerformanceReviews({ page: reviewsPage, pageSize: ITEMS_PER_PAGE });
  const { data: empRes } = useEmployees({ pageSize: 100 });

  const reviews = revRes?.items || [];
  const totalItems = revRes?.pagination?.totalItems || 0;
  const employees = empRes?.items || [];

  const [reviewEmpId, setReviewEmpId] = useState('');
  const [reviewCycle, setReviewCycle] = useState('Q2 2026');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewGoals, setReviewGoals] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewGoals, setEditReviewGoals] = useState('');
  const [editReviewComments, setEditReviewComments] = useState('');

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewEmpId || !reviewComments.trim()) return;
    try {
      await performanceReviewApi.create({
        employeeId: reviewEmpId,
        cycle: reviewCycle,
        rating: String(reviewRating),
        goals: reviewGoals,
        comments: reviewComments,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to create review.', 'error');
      return;
    }
    showToast('Review Created', 'Performance review created successfully.', 'success');
    setReviewEmpId('');
    setReviewCycle('Q2 2026');
    setReviewRating(5);
    setReviewGoals('');
    setReviewComments('');
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  };

  const handleUpdateReview = async (id: string) => {
    try {
      await performanceReviewApi.update(id, {
        rating: String(editReviewRating),
        goals: editReviewGoals,
        comments: editReviewComments,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update review.', 'error');
      return;
    }
    showToast('Review Updated', 'Performance review updated successfully.', 'success');
    setEditingReviewId(null);
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  };

  const handleSubmitReview = async (id: string) => {
    try {
      await performanceReviewApi.submit(id);
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to submit review.', 'error');
      return;
    }
    showToast('Review Submitted', 'Performance review submitted successfully.', 'success');
    queryClient.invalidateQueries({ queryKey: ['reviews'] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('hr.reviews.title')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.reviews.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.reviews.createReview')}</h3>
        <form onSubmit={handleCreateReview} className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.reviews.employee')}</label>
              <select value={reviewEmpId} onChange={(e) => setReviewEmpId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3" required>
                <option value="">{t('hr.reviews.selectEmployee')}</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.reviews.reviewCycle')}</label>
              <input type="text" value={reviewCycle} onChange={(e) => setReviewCycle(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3" required />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.reviews.rating')}</label>
              <input type="number" min="1" max="5" value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3" required />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.reviews.goals')}</label>
            <textarea value={reviewGoals} onChange={(e) => setReviewGoals(e.target.value)}
              placeholder={t('hr.reviews.goalsPlaceholder')}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3" rows={2} />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.reviews.comments')}</label>
            <textarea value={reviewComments} onChange={(e) => setReviewComments(e.target.value)}
              placeholder={t('hr.reviews.commentsPlaceholder')}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3" rows={3} required />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800">
            {t('hr.reviews.publish')}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('hr.reviews.reviewLogs')}</h3>
        <div className={`space-y-4 pt-2 transition-opacity ${isPlaceholderData ? 'opacity-60 pointer-events-none' : ''}`}>
          {isLoading ? (
            <p className="text-sm text-slate-500 text-center py-8">{t('common.loading')}</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-8">{t('hr.reviews.noReviews')}</p>
          ) : reviews.map(rev => {
            const emp = employees.find(e => e.id === rev.employeeId);
            const isEditing = editingReviewId === rev.id;
            if (isEditing) {
              return (
                <div key={rev.id} className="border border-blue-200 rounded-xl p-5 bg-blue-50/30 transition-all text-xs space-y-3">
                  <p className="font-bold text-slate-800 text-sm">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')} ({rev.cycle})</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('hr.reviews.rating')}</label>
                    <select value={editReviewRating} onChange={(e) => setEditReviewRating(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs">
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('hr.reviews.goals')}</label>
                    <textarea value={editReviewGoals} onChange={(e) => setEditReviewGoals(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{t('hr.reviews.comments')}</label>
                    <textarea value={editReviewComments} onChange={(e) => setEditReviewComments(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs" />
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleUpdateReview(rev.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold">{t('hr.reviews.save')}</button>
                    <button onClick={() => setEditingReviewId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-lg text-xs font-bold">{t('hr.reviews.cancel')}</button>
                  </div>
                </div>
              );
            }
            return (
              <div key={rev.id} className="border border-slate-150 rounded-xl p-5 hover:bg-slate-50 transition-all text-xs">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <p className="font-bold text-slate-800 text-sm">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')} ({rev.cycle})</p>
                  <div className="flex items-center space-x-2">
                    <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold">{t('hr.reviews.score', { rating: rev.rating })}</span>
                    <button onClick={() => { setEditingReviewId(rev.id); setEditReviewRating(Number(rev.rating)); setEditReviewGoals(rev.goals || ''); setEditReviewComments(rev.comments || ''); }} className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" title={t('hr.reviews.editReview')}>
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleSubmitReview(rev.id)} className="text-emerald-600 hover:text-emerald-800 p-1 rounded hover:bg-emerald-50" title={t('hr.reviews.submitReview')}>
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 mt-2 italic">&quot;{rev.comments}&quot;</p>
              </div>
            );
          })}
        </div>
        <Pagination
          currentPage={reviewsPage}
          totalItems={totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setReviewsPage}
          idPrefix="reviews"
        />
      </div>
    </div>
  );
};

export default ReviewsTab;
