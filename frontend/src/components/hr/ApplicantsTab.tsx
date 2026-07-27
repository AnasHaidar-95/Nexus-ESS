import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicantApprovalSchema, ApplicantApprovalFormData } from '../../lib/formSchemas';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '../../stores/notificationStore';
import type { ApplicantProfile } from '../../types';
import { CheckCircle, Download, FileText, X } from 'lucide-react';
import { applicantApi } from '../../lib/applicants';
import { useApplicants } from '../../hooks/queries/useApplicants';
import { useEmployees } from '../../hooks/queries/useEmployees';
import Pagination from './Pagination';

interface ApplicantsTabProps {
  applicantsPage: number;
  setApplicantsPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  departments: any[];
  positions: any[];
  shifts: any[];
  isAdminMode: boolean;
}

export default function ApplicantsTab({
  applicantsPage,
  setApplicantsPage,
  ITEMS_PER_PAGE,
  departments,
  positions,
  shifts,
  isAdminMode,
}: ApplicantsTabProps) {
  const queryClient = useQueryClient();
  const showToast = useNotificationStore((s) => s.showToast);

  const [approveFormVisible, setApproveFormVisible] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [rejectFormVisible, setRejectFormVisible] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ appId: string; userId: string } | null>(null);
  const [appRejectReason, setAppRejectReason] = useState('');

  const handleRejectApplicant = (appId: string, userId: string) => {
    setRejectTarget({ appId, userId });
    setAppRejectReason('');
    setRejectFormVisible(true);
  };

  const handleOpenApproveForm = (app: { id: string; firstName: string; lastName: string }) => {
    setSelectedApplicant(app);
    setApproveFormVisible(true);
  };

  const handleApproveApplicantForm = async (data: ApplicantApprovalFormData) => {
    if (!selectedApplicant) return;
    try {
      await applicantApi.approve(selectedApplicant.id, {
        employeeNumber: data.employeeNumber, departmentId: data.departmentId, positionId: data.positionId,
        shiftId: data.shiftId, hireDate: new Date().toISOString().split('T')[0],
        employmentType: data.employmentType, basicSalary: data.basicSalary,
        housingAllowance: data.housingAllowance, transportAllowance: data.transportAllowance,
      });
      showToast('Applicant Approved', `${selectedApplicant.firstName} ${selectedApplicant.lastName} has been approved.`, 'success');
      setApproveFormVisible(false);
      setSelectedApplicant(null);
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to approve applicant.', 'error');
    }
  };

  const confirmRejectApplicant = async () => {
    if (!rejectTarget) return;
    const reason = appRejectReason.trim() || 'Rejected by HR';
    if (reason.length < 5) {
      showToast('Error', 'Reason must be at least 5 characters.', 'error');
      return;
    }
    try {
      await applicantApi.reject(rejectTarget.appId, { reason });
      showToast('Applicant Rejected', 'The employment application has been rejected.', 'info');
      setRejectFormVisible(false);
      setRejectTarget(null);
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to reject applicant.', 'error');
    }
  };

  const { t } = useTranslation();
  const { data: appRes, isLoading: appLoading, isPlaceholderData } = useApplicants({ page: applicantsPage, pageSize: ITEMS_PER_PAGE, sort: '-createdAt' });
  const { data: empRes } = useEmployees({ pageSize: 100 });

  const appItems = appRes?.items || [];
  const appTotalPages = appRes?.pagination?.totalPages || 1;
  const employees = empRes?.items || [];

  const nextNum = employees.length + 1;
  const defaultEmpNum = `EMP-2026-00${nextNum}`;

  const approvalForm = useForm<ApplicantApprovalFormData>({
    resolver: zodResolver(applicantApprovalSchema),
    defaultValues: {
      employeeNumber: defaultEmpNum,
      employmentType: 'FULL_TIME',
      departmentId: departments[0]?.id || '',
      positionId: positions[0]?.id || '',
      shiftId: shifts[0]?.id || '',
      basicSalary: 4000,
      housingAllowance: 1000,
      transportAllowance: 300,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('hr.applicants.title')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.applicants.subtitle')}</p>
        </div>
      </div>

      {appLoading ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <div className="h-8 w-8 border-4 border-slate-200 border-t-sky-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 dark:text-slate-500">{t('hr.applicants.loading')}</p>
        </div>
      ) : appItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800">{t('hr.applicants.noApplicants')}</p>
          <p className="text-xs text-slate-400">{t('hr.applicants.allProcessed')}</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 gap-6 transition-opacity ${isPlaceholderData ? 'opacity-60 pointer-events-none' : ''}`}>
          {appItems.map(app => {
            const apiDocs = (app as any).documents as Array<Record<string, unknown>> || [];
            const docs = apiDocs.map(d => ({ id: d.id as string, category: d.category as string, originalFilename: d.originalFilename as string, fileSizeBytes: (d.fileSizeBytes as number) || 0, uploadedAt: d.uploadedAt as string }));
            return (
              <div key={app.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-slate-50 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{app.firstName} {app.lastName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t('hr.applicants.submittedAt', { date: app.submittedAt ? new Date(app.submittedAt).toLocaleString() : 'N/A' })}</p>
                  </div>
                  <div className="mt-3 md:mt-0 flex space-x-2">
                    <button
                      onClick={() => handleRejectApplicant(app.id, app.userId)}
                      className="text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('hr.applicants.rejectBtn')}
                    </button>
                    <button
                      onClick={() => {
                        handleOpenApproveForm(app);
                        approvalForm.reset({
                          employeeNumber: `EMP-2026-00${employees.length + 1}`,
                          employmentType: 'FULL_TIME',
                          departmentId: departments[0]?.id || '',
                          positionId: positions[0]?.id || '',
                          shiftId: shifts[0]?.id || '',
                          basicSalary: 4000,
                          housingAllowance: 1000,
                          transportAllowance: 300,
                        });
                      }}
                      className="text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {t('hr.applicants.reviewApprove')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{t('hr.applicants.contactInfo')}</p>
                    <div className="mt-2 space-y-1.5">
                      <p><span className="font-semibold text-slate-500">{t('hr.applicants.phone')}</span> {app.phone || 'N/A'}</p>
                      <p><span className="font-semibold text-slate-500">{t('hr.applicants.altPhone')}</span> {app.alternatePhone || 'N/A'}</p>
                      <p><span className="font-semibold text-slate-500">{t('hr.applicants.nationalId')}</span> {app.nationalId || 'N/A'}</p>
                      <p><span className="font-semibold text-slate-500">{t('hr.applicants.address')}</span> {app.addressLine1 || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">{t('hr.applicants.onboardingDocs')}</p>
                    <div className="mt-2 space-y-2">
                      {docs.length === 0 ? (
                        <p className="italic text-slate-400 text-[11px]">{t('hr.applicants.noFiles')}</p>
                      ) : (
                        docs.map(doc => (
                          <div key={doc.id} className="flex items-center space-x-2 border border-slate-100 dark:border-slate-800/60 rounded-lg p-2 bg-slate-50/50 dark:bg-slate-950/40">
                            <FileText className="h-4 w-4 text-sky-500" />
                            <div className="flex-1 min-w-0 text-[10px]">
                              <p className="font-semibold text-slate-700 truncate">{doc.originalFilename}</p>
                              <p className="text-slate-400 mt-0.5 uppercase font-bold">{doc.category}</p>
                            </div>
                            <button
                              onClick={() => applicantApi.downloadDocument(doc.id, doc.originalFilename)}
                              className="text-sky-600 hover:text-sky-500"
                              title={t('hr.applicants.download')}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!appLoading && (
        <Pagination
          currentPage={applicantsPage}
          totalItems={appTotalPages * ITEMS_PER_PAGE}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => { setApplicantsPage(p); }}
          idPrefix="applicants"
        />
      )}

      {/* Applicant Approval Modal */}
      {approveFormVisible && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-slate-150 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{t('hr.applicants.approveTitle')}</h3>
                <p className="text-xs text-slate-500">{t('hr.applicants.applicant')}: {selectedApplicant.firstName} {selectedApplicant.lastName}</p>
              </div>
              <button onClick={() => setApproveFormVisible(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={approvalForm.handleSubmit(async (data) => {
              await handleApproveApplicantForm(data);
              approvalForm.reset();
            })} className="space-y-6 pt-6 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.employeeNumber')}</label>
                  <input {...approvalForm.register('employeeNumber')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 bg-slate-50 outline-none" />
                  {approvalForm.formState.errors.employeeNumber && <p className="text-[10px] text-red-500 mt-1">{approvalForm.formState.errors.employeeNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.employmentType')}</label>
                  <select {...approvalForm.register('employmentType')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 bg-slate-50 outline-none">
                    <option value="FULL_TIME">{t('hr.applicants.fullTime')}</option>
                    <option value="PART_TIME">{t('hr.applicants.partTime')}</option>
                    <option value="CONTRACT">{t('hr.applicants.contract')}</option>
                    <option value="INTERN">{t('hr.applicants.intern')}</option>
                    <option value="TEMPORARY">{t('hr.applicants.temporary')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.department')}</label>
                  <select {...approvalForm.register('departmentId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 bg-slate-50 outline-none">
                    {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                  {approvalForm.formState.errors.departmentId && <p className="text-[10px] text-red-500 mt-1">{approvalForm.formState.errors.departmentId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.jobPosition')}</label>
                  <select {...approvalForm.register('positionId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 bg-slate-50 outline-none">
                    {positions.filter(p => isAdminMode ? true : !['SYS_ADMIN', 'HR_MGR', 'HR_OFF'].includes(p.code)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {approvalForm.formState.errors.positionId && <p className="text-[10px] text-red-500 mt-1">{approvalForm.formState.errors.positionId.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.workShift')}</label>
                  <select {...approvalForm.register('shiftId')}
                    className="mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 bg-slate-50 outline-none">
                    {shifts.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <p className="font-bold text-slate-800">{t('hr.applicants.compensationSettings')}</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.basicSalary')}</label>
                    <input type="number" {...approvalForm.register('basicSalary', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.housingAllowance')}</label>
                    <input type="number" {...approvalForm.register('housingAllowance', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 bg-slate-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500">{t('hr.applicants.transportAllowance')}</label>
                    <input type="number" {...approvalForm.register('transportAllowance', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 bg-slate-50" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setApproveFormVisible(false)}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg font-semibold">
                  {t('common.cancel')}
                </button>
                <button type="submit" disabled={approvalForm.formState.isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md shadow-emerald-50 disabled:opacity-50">
                  {t('hr.applicants.approveRegister')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Applicant Modal */}
      {rejectFormVisible && rejectTarget && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl border border-slate-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t('hr.applicants.rejectTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">{t('hr.applicants.cannotUndo')}</p>
              </div>
              <button onClick={() => setRejectFormVisible(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-6 space-y-4">
              <p className="text-sm text-slate-700 font-medium">{t('hr.applicants.rejectionReason')}</p>
              <textarea
                value={appRejectReason}
                onChange={(e) => setAppRejectReason(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all resize-none"
                placeholder={t('hr.applicants.rejectPlaceholder')}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button onClick={() => { setRejectFormVisible(false); setRejectTarget(null); }}
                className="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg font-semibold text-sm">
                {t('common.cancel')}
              </button>
              <button onClick={confirmRejectApplicant}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-semibold text-sm shadow-md">
                {t('hr.applicants.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
