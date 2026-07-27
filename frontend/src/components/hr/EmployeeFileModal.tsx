import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';
import { employeeApi } from '../../lib/employees';
import { employeeDocumentApi } from '../../lib/employee-documents';

interface EmployeeFileModalProps {
  selectedEmployee: any;
  setSelectedEmployee: (v: any) => void;
  positions: any[];
  departments: any[];
  employees: any[];
  bankAccounts: any[];
  salaryComponents: any[];
  modalSalaryProfiles: any[];
  reviews: any[];
  employeeDocuments: any[];
  documentCategories: any[];
  modalTab: string;
  setModalTab: (v: string) => void;
  fmtDT: (v: string) => string;
  currentUser: any;
  showToast: (title: string, message: string, type: string) => void;
  addAuditLog: (userId: string, entityId: string, entityType: string, entityName: string, recordId: string, action: string, details: string) => void;
  refreshCurrentTab: () => void;
  newDeptPosition: string | null; setNewDeptPosition: (v: string | null) => void;
  newReassignDept: string | null; setNewReassignDept: (v: string | null) => void;
  newReassignMgr: string | null; setNewReassignMgr: (v: string | null) => void;
  newDocName: string; setNewDocName: (v: string) => void;
  newDocCategory: string; setNewDocCategory: (v: string) => void;
  newDocNotes: string; setNewDocNotes: (v: string) => void;
  newDocFile: File | null; setNewDocFile: (v: File | null) => void;
  newDocConfidential: boolean; setNewDocConfidential: (v: boolean) => void;
  handleAddEmployeeDoc: (e: React.FormEvent) => void;
}

const EmployeeFileModal: React.FC<EmployeeFileModalProps> = ({
  selectedEmployee,
  setSelectedEmployee,
  positions,
  departments,
  employees,
  bankAccounts,
  salaryComponents,
  modalSalaryProfiles,
  reviews,
  employeeDocuments,
  documentCategories,
  modalTab,
  setModalTab,
  fmtDT,
  currentUser,
  showToast,
  addAuditLog,
  refreshCurrentTab,
  newDeptPosition,
  setNewDeptPosition,
  newReassignDept,
  setNewReassignDept,
  newReassignMgr,
  setNewReassignMgr,
  newDocName,
  setNewDocName,
  newDocCategory,
  setNewDocCategory,
  newDocNotes,
  setNewDocNotes,
  newDocFile,
  setNewDocFile,
  newDocConfidential,
  setNewDocConfidential,
  handleAddEmployeeDoc,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  if (!selectedEmployee) return null;

  return (
    <>
      {/* Employee File Modal View */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-150 dark:border-slate-800 overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-slate-150 dark:border-slate-800 pb-5 gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 rounded-2xl flex items-center justify-center text-2xl font-extrabold uppercase shrink-0">
                  {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-950 dark:text-white text-xl">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h3>
                    <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-bold px-2.5 py-0.5 rounded text-[10px] uppercase">
                      {selectedEmployee.employmentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t('hr.employeeFile.employeeId')}: <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEmployee.employeeNumber}</span> • {
                      selectedEmployee.position?.name || positions.find(p => p.id === selectedEmployee.positionId)?.name || t('hr.employeeFile.na')
                    } ({
                      selectedEmployee.department?.name || departments.find(d => d.id === selectedEmployee.departmentId)?.name || t('hr.employeeFile.na')
                    })
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                >
                  {t('hr.employeeFile.close')}
                </button>
              </div>
            </div>

            {/* Sub Tabs Selection */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 mt-6 gap-2 overflow-x-auto pb-1">
              {[
                { id: 'dossier', name: t('hr.employeeFile.dossier') },
                { id: 'compensation', name: t('hr.employeeFile.compensation') },
                { id: 'documents', name: t('hr.employeeFile.documents') },
                { id: 'performance', name: t('hr.employeeFile.performance') },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setModalTab(t.id as any)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                    modalTab === t.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="py-6 min-h-[300px]">
              {modalTab === 'dossier' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Personal Details */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.personalRecords')}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.fullName')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.firstName} {selectedEmployee.middleName || ''} {selectedEmployee.lastName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.preferredName')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.preferredName || t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.gender')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">{selectedEmployee.gender || t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.dateOfBirth')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.dateOfBirth ? fmtDT(selectedEmployee.dateOfBirth) : t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.nationalId')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.nationalId || t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.passportNumber')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.passportNumber || t('hr.employeeFile.na')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.contactCoordinates')}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.corporateEmail')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.email}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.personalPhone')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.phone || t('hr.employeeFile.na')}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.residentialAddress')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                            {selectedEmployee.addressLine1 ? (
                              <>
                                {selectedEmployee.addressLine1}
                                {selectedEmployee.addressLine2 ? `, ${selectedEmployee.addressLine2}` : ''}
                                <br />
                                {selectedEmployee.city ? `${selectedEmployee.city}, ` : ''}
                                {selectedEmployee.state ? `${selectedEmployee.state} ` : ''}
                                {selectedEmployee.postalCode ? `${selectedEmployee.postalCode} ` : ''}
                                {selectedEmployee.country || ''}
                              </>
                            ) : t('hr.employeeFile.noAddress')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Information */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4 md:col-span-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.emergencyContact')}</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.contactPerson')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.emergencyContactName || t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.relationship')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.emergencyContactRelationship || t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.phoneNumber')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.emergencyContactPhone || t('hr.employeeFile.na')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Account Lifecycle Editing */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-blue-100 dark:border-blue-950/30 space-y-4 md:col-span-2 shadow-sm">
                      <h4 className="font-bold text-blue-800 dark:text-blue-400 uppercase tracking-wider text-[10px]">{t('hr.employeeFile.statusLifecycle')}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.employeeFile.accountStatus')}</label>
                          <select
                            value={selectedEmployee.status}
                            onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              const updatedEmp = { ...selectedEmployee, status: newStatus };
                              setSelectedEmployee(updatedEmp);
                              
                              try {
                                await employeeApi.update(selectedEmployee.id, { status: newStatus });
                                queryClient.invalidateQueries({ queryKey: ['employees'] });
                              } catch (err) { console.error(err); showToast(t('common.error'), err?.message || t('errors.failedToSave'), 'error'); }
                              
                              addAuditLog(
                                currentUser.id,
                                selectedEmployee.id,
                                'EMPLOYEE',
                                'Employee',
                                selectedEmployee.id,
                                'UPDATE_STATUS',
                                `Updated status to ${newStatus}`
                              );
                              
                              showToast(t('hr.employeeFile.statusUpdated'), `${t('hr.employeeFile.accountStatus')} ${selectedEmployee.firstName} ${t('hr.employeeFile.statusUpdated')}.`, 'success');
                            }}
                            className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-200 font-medium"
                          >
                            <option value="ACTIVE">{t('hr.employeeFile.activeFullAccess')}</option>
                            <option value="INACTIVE">{t('hr.employeeFile.inactiveAccessRevoked')}</option>
                            <option value="SUSPENDED">{t('hr.employeeFile.suspendedTempBlock')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{t('hr.employeeFile.employmentStatus')}</label>
                          <select
                            value={selectedEmployee.employmentStatus}
                            onChange={async (e) => {
                              const newStatus = e.target.value as any;
                              const updatedEmp = { ...selectedEmployee, employmentStatus: newStatus };
                              setSelectedEmployee(updatedEmp);
                              
                              try {
                                await employeeApi.update(selectedEmployee.id, { employmentStatus: newStatus });
                                queryClient.invalidateQueries({ queryKey: ['employees'] });
                              } catch (err) { console.error(err); showToast(t('common.error'), err?.message || t('errors.failedToSave'), 'error'); }
                              
                              addAuditLog(
                                currentUser.id,
                                selectedEmployee.id,
                                'EMPLOYEE',
                                'Employee',
                                selectedEmployee.id,
                                'UPDATE_EMPLOYMENT_STATUS',
                                `Updated employment status to ${newStatus}`
                              );
                              
                              showToast(t('hr.employeeFile.lifecycleUpdated'), `${t('hr.employeeFile.employmentStatus')} ${selectedEmployee.firstName} ${t('hr.employeeFile.lifecycleUpdated')}.`, 'success');
                            }}
                            className="mt-1.5 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-3 text-xs outline-none text-slate-800 dark:text-slate-200 font-medium"
                          >
                            <option value="ACTIVE">{t('hr.employeeFile.active')}</option>
                            <option value="PROBATION">{t('hr.employeeFile.probation')}</option>
                            <option value="ON_LEAVE">{t('hr.employeeFile.onLeave')}</option>
                            <option value="RESIGNED">{t('hr.employeeFile.resigned')}</option>
                            <option value="TERMINATED">{t('hr.employeeFile.terminated')}</option>
                            <option value="RETIRED">{t('hr.employeeFile.retired')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'compensation' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Position & Contract info */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.employmentAgreement')}</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.jobPositionTitle')}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <select
                              value={newDeptPosition || selectedEmployee.positionId || ''}
                              onChange={(e) => setNewDeptPosition(e.target.value || null)}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs outline-none"
                            >
                              <option value="">{positions.find(p => p.id === selectedEmployee.positionId)?.name || t('hr.employeeFile.selectPosition')}</option>
                              {positions.filter(p => p.id !== selectedEmployee.positionId).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={async () => {
                                if (!newDeptPosition) return;
                                try { await employeeApi.changePosition(selectedEmployee.id, { positionId: newDeptPosition }); queryClient.invalidateQueries({ queryKey: ['employees'] }); } catch (err) { console.error(err); showToast(t('common.error'), t('hr.employeeFile.failedUpdatePosition'), 'error'); return; }
                                addAuditLog(currentUser.id, selectedEmployee.id, 'EMPLOYEE', 'Employee', selectedEmployee.id, 'CHANGE_POSITION', `Changed position to ${positions.find(p => p.id === newDeptPosition)?.name}`);
                                showToast(t('hr.employeeFile.positionUpdated'), t('hr.employeeFile.changePositionSuccess'), 'success');
                                const newPos = positions.find(p => p.id === newDeptPosition);
                                setSelectedEmployee({ ...selectedEmployee, positionId: newDeptPosition, position: newPos || selectedEmployee.position });
                                setNewDeptPosition(null);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                              disabled={!newDeptPosition}
                            >{t('common.save')}</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.businessUnit')}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <select
                              value={newReassignDept || selectedEmployee.departmentId || ''}
                              onChange={(e) => setNewReassignDept(e.target.value || null)}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs outline-none"
                            >
                              <option value="">{departments.find(d => d.id === selectedEmployee.departmentId)?.name || t('hr.employeeFile.selectDepartment')}</option>
                              {departments.filter(d => d.id !== selectedEmployee.departmentId).map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={async () => {
                                if (!newReassignDept) return;
                                try { await employeeApi.changeDepartment(selectedEmployee.id, { departmentId: newReassignDept }); queryClient.invalidateQueries({ queryKey: ['employees'] }); } catch (err) { console.error(err); showToast(t('common.error'), t('hr.employeeFile.failedUpdateDepartment'), 'error'); return; }
                                addAuditLog(currentUser.id, selectedEmployee.id, 'EMPLOYEE', 'Employee', selectedEmployee.id, 'CHANGE_DEPARTMENT', `Changed department to ${departments.find(d => d.id === newReassignDept)?.name}`);
                                showToast(t('hr.employeeFile.departmentUpdated'), t('hr.employeeFile.changeDepartmentSuccess'), 'success');
                                const newDept = departments.find(d => d.id === newReassignDept);
                                setSelectedEmployee({ ...selectedEmployee, departmentId: newReassignDept, department: newDept || selectedEmployee.department });
                                setNewReassignDept(null);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                              disabled={!newReassignDept}
                            >{t('common.save')}</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.reportingManager')}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <select
                              value={newReassignMgr || selectedEmployee.managerId || ''}
                              onChange={(e) => setNewReassignMgr(e.target.value || null)}
                              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 px-2 text-xs outline-none"
                            >
                              <option value="">{employees.find(e => e.id === selectedEmployee.managerId) ? `${employees.find(e => e.id === selectedEmployee.managerId)?.firstName} ${employees.find(e => e.id === selectedEmployee.managerId)?.lastName}` : t('hr.employeeFile.none')}</option>
                              {employees.filter(e => e.id !== selectedEmployee.managerId && e.id !== selectedEmployee.id).map(e => (
                                <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                              ))}
                            </select>
                            <button
                              onClick={async () => {
                                try { await employeeApi.changeManager(selectedEmployee.id, { managerId: newReassignMgr }); queryClient.invalidateQueries({ queryKey: ['employees'] }); } catch (err) { console.error(err); showToast(t('common.error'), t('hr.employeeFile.failedUpdateManager'), 'error'); return; }
                                const mgrName = newReassignMgr ? employees.find(e => e.id === newReassignMgr)?.firstName + ' ' + employees.find(e => e.id === newReassignMgr)?.lastName : t('hr.employeeFile.none');
                                addAuditLog(currentUser.id, selectedEmployee.id, 'EMPLOYEE', 'Employee', selectedEmployee.id, 'CHANGE_MANAGER', `Changed manager to ${mgrName}`);
                                showToast(t('hr.employeeFile.managerUpdated'), t('hr.employeeFile.changeManagerSuccess'), 'success');
                                setSelectedEmployee({ ...selectedEmployee, managerId: newReassignMgr });
                                setNewReassignMgr(null);
                              }}
                              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                              disabled={newReassignMgr === null}
                            >{t('common.save')}</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.officialHireDate')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{selectedEmployee.hireDate ? fmtDT(selectedEmployee.hireDate) : t('hr.employeeFile.na')}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.employmentClassification')}</p>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">{selectedEmployee.employmentType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Banking Account */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.bankAccount')}</h4>
                      {(() => {
                        const bank = bankAccounts.find(b => b.employeeId === selectedEmployee.id);
                        if (!bank) {
                          return <p className="italic text-slate-400 py-4">{t('hr.employeeFile.noBanking')}</p>;
                        }
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.financialInstitution')}</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{bank.bankName}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.accountBeneficiary')}</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{bank.accountName}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.accountNumberIban')}</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{bank.accountNumber}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-semibold uppercase text-[9px]">{t('hr.employeeFile.swiftRouting')}</p>
                              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 uppercase">{bank.swiftCode || t('hr.employeeFile.na')}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Custom Salary Component Breakdown */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4 md:col-span-2">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.compProfile')}</h4>
                      {(() => {
                        const profiles = modalSalaryProfiles.filter(p => p.employeeId === selectedEmployee.id);
                        if (profiles.length === 0) {
                          return <p className="italic text-slate-400">{t('hr.employeeFile.noProfile')}</p>;
                        }
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {profiles.map(p => {
                              const comp = salaryComponents.find(c => c.id === p.salaryComponentId);
                              return (
                                <div key={p.id} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white dark:bg-slate-800/50 flex justify-between items-center shadow-sm">
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{comp?.name || t('hr.employeeFile.allowanceComponent')}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-wider">{comp?.type || 'EARNING'}</p>
                                  </div>
                                  <span className="font-extrabold text-slate-900 dark:text-white text-sm bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-800">
                                    ${Number(p.customValue ?? comp?.defaultValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'documents' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Upload new doc form */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 md:col-span-1 h-fit space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.uploadDoc')}</h4>
                      <form onSubmit={handleAddEmployeeDoc} className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('hr.employeeFile.documentTitle')}</label>
                          <input
                            type="text"
                            required
                            placeholder={t('hr.employeeFile.titlePlaceholder')}
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('hr.employeeFile.category')}</label>
                          <select
                            value={newDocCategory}
                            onChange={(e) => setNewDocCategory(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs outline-none"
                          >
                            {documentCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('hr.employeeFile.notesDesc')}</label>
                          <input
                            type="text"
                            placeholder={t('hr.employeeFile.notesPlaceholder')}
                            value={newDocNotes}
                            onChange={(e) => setNewDocNotes(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('hr.employeeFile.file')}</label>
                          <input
                            type="file"
                            required
                            onChange={(e) => setNewDocFile(e.target.files?.[0] || null)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2 px-3 text-xs outline-none file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="checkbox"
                            id="confidential"
                            checked={newDocConfidential}
                            onChange={(e) => setNewDocConfidential(e.target.checked)}
                            className="h-3.5 w-3.5 text-blue-600 rounded border-slate-300 bg-white"
                          />
                          <label htmlFor="confidential" className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                            {t('hr.employeeFile.markConfidential')}
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold py-2 mt-2 shadow-sm transition-colors"
                        >
                          {t('hr.employeeFile.addFileDoc')}
                        </button>
                      </form>
                    </div>

                    {/* Files list */}
                    <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 md:col-span-2 space-y-4">
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.personnelFiles')}</h4>
                      {(() => {
                        const docs = employeeDocuments.filter(d => d.employeeId === selectedEmployee.id);
                        if (docs.length === 0) {
                          return <p className="italic text-slate-400 py-8 text-center">{t('hr.employeeFile.noFiles')}</p>;
                        }
                        return (
                          <div className="space-y-3">
                            {docs.map(doc => {
                              const catName = documentCategories.find(c => c.id === doc.categoryId)?.name || t('hr.employeeFile.other');
                              return (
                                <div key={doc.id} className="border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white dark:bg-slate-800 flex justify-between items-center shadow-sm">
                                  <div className="flex items-center space-x-3">
                                    <div className="h-9 w-9 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg flex items-center justify-center shrink-0">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 dark:text-slate-100">{doc.originalFilename}</p>
                                      <p className="text-[10px] text-slate-400 mt-0.5">
                                        {t('hr.employeeFile.categoryLabel', { name: catName })} • {t('hr.employeeFile.fileSize', { size: (doc.fileSizeBytes / 1024 / 1024).toFixed(2) })} • {t('hr.employeeFile.uploaded', { date: new Date(doc.uploadedAt).toLocaleDateString() })}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {doc.isConfidential && (
                                      <span className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase">
                                        {t('hr.employeeFile.confidential')}
                                      </span>
                                    )}
                                    <button
                                      onClick={async () => {
                                        setDownloadingId(doc.id);
                                        try {
                                          await employeeDocumentApi.download(doc.id);
                                        } catch (err: any) {
                                          showToast(t('common.error'), err?.message || t('hr.employeeFile.downloadFailed', 'Download failed'), 'error');
                                        } finally {
                                          setDownloadingId(null);
                                        }
                                      }}
                                      disabled={downloadingId === doc.id}
                                      className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded px-2.5 py-1.5 font-bold disabled:opacity-50 flex items-center gap-1"
                                    >
                                      {downloadingId === doc.id ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                                      {t('hr.employeeFile.download')}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'performance' && (
                <div className="space-y-6 animate-fade-in text-xs">
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">{t('hr.employeeFile.historicReviews')}</h4>
                    {(() => {
                      const empReviews = reviews.filter(r => r.employeeId === selectedEmployee.id);
                      if (empReviews.length === 0) {
                        return <p className="italic text-slate-400 py-6">{t('hr.employeeFile.noReviews')}</p>;
                      }
                      return (
                        <div className="space-y-3">
                          {empReviews.map(rev => (
                            <div key={rev.id} className="border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-white dark:bg-slate-800/50 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-2">
                                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('hr.employeeFile.reviewCycle', { cycle: rev.cycle })}</p>
                                <span className="bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded font-extrabold uppercase">
                                  {t('hr.employeeFile.score', { rating: rev.rating })}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
                                <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.employeeFile.evalComments')}</span> "{rev.comments}"</p>
                                {rev.goals && rev.goals.text && (
                                  <p><span className="font-semibold text-slate-800 dark:text-slate-200">{t('hr.employeeFile.agreedGoals')}</span> {rev.goals.text}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeFileModal;
