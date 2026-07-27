import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle } from 'lucide-react';
import { useEmployees } from '../../hooks/queries/useEmployees';
import { useProfileRequests } from '../../hooks/queries/useProfileRequests';
import Pagination from './Pagination';

interface ProfileRequestsTabProps {
  profileRequestsPage: number; setProfileRequestsPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
}

export default function ProfileRequestsTab({
  profileRequestsPage,
  setProfileRequestsPage,
  ITEMS_PER_PAGE,
}: ProfileRequestsTabProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: prRes, isLoading, isPlaceholderData } = useProfileRequests({ page: profileRequestsPage, pageSize: ITEMS_PER_PAGE, sort: '-createdAt' });
  const { data: empRes } = useEmployees({ pageSize: 100 });

  const profileRequests = prRes?.items || [];
  const totalItems = prRes?.pagination?.totalItems || 0;
  const employees = empRes?.items || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{t('hr.profileRequests.title')}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.profileRequests.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('common.loading')}</p>
        </div>
      ) : profileRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800">{t('hr.profileRequests.noRequests')}</p>
        </div>
      ) : (
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-opacity ${isPlaceholderData ? 'opacity-60 pointer-events-none' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">{t('hr.profileRequests.colEmployee')}</th>
                  <th className="p-4">{t('hr.profileRequests.colField')}</th>
                  <th className="p-4">{t('hr.profileRequests.colOldValue')}</th>
                  <th className="p-4">{t('hr.profileRequests.colNewValue')}</th>
                  <th className="p-4">{t('hr.profileRequests.colStatus')}</th>
                  <th className="p-4">{t('hr.profileRequests.colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                {profileRequests.map(req => {
                  const emp = employees.find(e => e.id === req.employeeId);
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                      <td className="p-4 font-semibold">{emp ? `${emp.firstName} ${emp.lastName}` : t('common.unknown')}</td>
                      <td className="p-4 font-bold capitalize">{req.field}</td>
                      <td className="p-4 text-slate-400 italic">{req.oldValue || t('hr.profileRequests.empty')}</td>
                      <td className="p-4 font-bold text-slate-800">{req.newValue}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' : req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'}`}>
                          {t('hr.profileRequests.' + req.status.toLowerCase())}
                        </span>
                      </td>
                      <td className="p-4">
                        {req.status === 'PENDING' ? (
                          <div className="flex space-x-2">
                            <button onClick={() => {}} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2.5 py-1 font-bold text-[10px]">
                              {t('hr.profileRequests.approve')}
                            </button>
                            <button onClick={() => {}} className="bg-rose-600 hover:bg-rose-500 text-white rounded px-2.5 py-1 font-bold text-[10px]">
                              {t('hr.profileRequests.reject')}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">{t('hr.profileRequests.resolved')}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={profileRequestsPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setProfileRequestsPage}
            idPrefix="profileRequests"
          />
        </div>
      )}
    </div>
  );
}
