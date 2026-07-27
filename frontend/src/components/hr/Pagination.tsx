import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  idPrefix: string;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange, idPrefix }: PaginationProps) {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div id={`${idPrefix}-pagination-container`} className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 text-xs text-slate-500">
      <div>
        {t('hr.pagination.showing', { from: Math.min((currentPage - 1) * itemsPerPage + 1, totalItems), to: Math.min(currentPage * itemsPerPage, totalItems), total: totalItems })}
      </div>
      <div className="flex space-x-1">
        <button
          type="button"
          id={`${idPrefix}-btn-prev`}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:pointer-events-none font-medium transition-colors"
        >
          {t('hr.pagination.previous')}
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          if (totalPages > 5 && Math.abs(currentPage - pageNum) > 1 && pageNum !== 1 && pageNum !== totalPages) {
            if (pageNum === 2 || pageNum === totalPages - 1) {
              return <span key={pageNum} className="px-2 py-1 text-slate-400">...</span>;
            }
            return null;
          }
          return (
            <button
              type="button"
              key={pageNum}
              id={`${idPrefix}-btn-page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-600'
                  : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          type="button"
          id={`${idPrefix}-btn-next`}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:pointer-events-none font-medium transition-colors"
        >
          {t('hr.pagination.next')}
        </button>
      </div>
    </div>
  );
}