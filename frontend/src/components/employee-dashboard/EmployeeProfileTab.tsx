import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, ClipboardList } from 'lucide-react';
import type { Employee } from './types';

interface ProfileChangeRequest {
  id: string;
  field: string;
  newValue: string;
  status: string;
  rejectionReason?: string;
}

interface EmployeeProfileTabProps {
  employee: Employee;
  profileChangeRequests: ProfileChangeRequest[];
  onSubmitProfileChange: (field: string, value: string) => void;
}

export default function EmployeeProfileTab({
  employee,
  profileChangeRequests,
  onSubmitProfileChange,
}: EmployeeProfileTabProps) {
  const { t } = useTranslation();
  const [changeField, setChangeField] = useState('phone');
  const [changeValue, setChangeValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeValue) return;
    onSubmitProfileChange(changeField, changeValue);
    setChangeValue('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{t('employee.myProfile')}</h2>
        <span className="bg-sky-50 text-sky-700 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider">
          {t('employee.employeeActiveRecord')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left block: Profile card detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Detail Block */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center border-b border-slate-100 pb-3">
              <UserIcon className="h-5 w-5 mr-2 text-sky-500" /> {t('employee.personalInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.firstName')} & {t('employee.lastName')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.firstName} {employee.middleName || ''} {employee.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.preferredNickname')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.preferredName || t('common.none')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.gender')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.gender}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.dateOfBirth')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : t('employee.na')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.emailAddress')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.phone')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.phone || t('employee.na')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.nationalId')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.nationalId || t('employee.na')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.passportNumber')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.passportNumber || t('employee.na')}</p>
              </div>
            </div>
          </div>

          {/* Address & Emergency Details */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center border-b border-slate-100 pb-3">
              <ClipboardList className="h-5 w-5 mr-2 text-sky-500" /> {t('employee.contactEmergencyDetails')}
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="col-span-2">
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.residentialAddress')}</p>
                <p className="font-bold text-slate-800 mt-1">
                  {employee.addressLine1 ? `${employee.addressLine1}, ${employee.city || ''}, ${employee.state || ''} ${employee.postalCode || ''}, ${employee.country || ''}` : t('employee.na')}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.emergencyContactName')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.emergencyContactName || t('employee.na')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{t('employee.emergencyContactPhone')}</p>
                <p className="font-bold text-slate-800 mt-1">{employee.emergencyContactPhone || t('employee.na')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right block: Profile change request forms */}
        <div className="space-y-6">
          {/* Submit Change Request Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('employee.requestProfileUpdate')}</h3>
            <p className="text-xs text-slate-500">{t('employee.profileUpdateDescription')}</p>
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.fieldToChange')}</label>
                <select
                  value={changeField}
                  onChange={(e) => setChangeField(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none bg-slate-50"
                >
                  <option value="phone">{t('employee.phone')}</option>
                  <option value="alternatePhone">{t('employee.alternatePhone')}</option>
                  <option value="addressLine1">{t('employee.residentialAddress')}</option>
                  <option value="city">{t('employee.residentialCity')}</option>
                  <option value="emergencyContactName">{t('employee.emergencyContactName')}</option>
                  <option value="emergencyContactPhone">{t('employee.emergencyContactPhone')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">{t('employee.newValue')}</label>
                <input
                  type="text"
                  required
                  value={changeValue}
                  onChange={(e) => setChangeValue(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-slate-200 py-2 px-3 text-sm outline-none bg-slate-50"
                  placeholder={t('employee.emplPlaceholder')}
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 bg-slate-900 text-white rounded-lg text-xs font-semibold py-2.5 hover:bg-slate-800 transition-colors"
              >
                {t('employee.fileUpdateRequest')}
              </button>
            </form>
          </div>

          {/* Previous Requests List */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{t('employee.myUpdateRequests', { count: profileChangeRequests.length })}</h3>
            <div className="space-y-3 pt-2 max-h-48 overflow-y-auto">
              {profileChangeRequests.length === 0 ? (
                <p className="text-xs text-slate-500 italic">{t('employee.noUpdateRequests')}</p>
              ) : (
                profileChangeRequests.map(req => (
                  <div key={req.id} className="text-xs border-b border-slate-50 pb-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 capitalize">{req.field}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' : req.status === 'APPROVED' ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'}`}>
                        {req.status === 'PENDING' ? t('employee.pending') : req.status === 'APPROVED' ? t('employee.approved') : t('employee.rejected')}
                      </span>
                    </div>
                    <p className="text-slate-500">{t('employee.newValueLabel', { value: req.newValue })}</p>
                    {req.rejectionReason && (
                      <p className="text-[10px] text-red-500 font-medium">{t('employee.rejectionReason', { reason: req.rejectionReason })}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
