import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Download } from 'lucide-react';
import { fmtDT } from '../../lib/utils';
import Pagination from './Pagination';
import { useEmployees } from '../../hooks/queries/useEmployees';
import { useDepartments } from '../../hooks/queries/useDepartments';
import { usePositions } from '../../hooks/queries/usePositions';
import { employeeSalaryProfileApi } from '../../lib/employee-salary-profiles';

interface EmployeesTabProps {
  employeesPage: number;
  setEmployeesPage: (v: number) => void;
  ITEMS_PER_PAGE: number;
  setSelectedEmployee: (emp: any) => void;
  setModalTab: (tab: any) => void;
  setModalSalaryProfiles: (profiles: any[]) => void;
}

const EmployeesTab = React.memo(function EmployeesTab({
  employeesPage,
  setEmployeesPage,
  ITEMS_PER_PAGE,
  setSelectedEmployee,
  setModalTab,
  setModalSalaryProfiles,
}: EmployeesTabProps) {
  const { t } = useTranslation();
  const { data: empRes, isLoading: empLoading, isPlaceholderData } = useEmployees({ page: employeesPage, pageSize: ITEMS_PER_PAGE });
  const { data: allEmpRes } = useEmployees({ pageSize: 500 });
  const allEmpItems = allEmpRes?.items || [];
  const { data: deptRes } = useDepartments({ pageSize: 100 });
  const { data: posRes } = usePositions({ pageSize: 100 });

  const empItems = empRes?.items || [];
  const empTotal = empRes?.pagination?.totalItems || 0;
  const departments = deptRes?.items || [];
  const positions = posRes?.items || [];

  const generateCSV = () => {
    const headers = [t('hr.employees.colId'), t('hr.employees.colName'), t('hr.employees.colDepartment'), t('hr.employees.colPosition'), t('hr.employees.colHireDate'), t('hr.employees.colType'), t('hr.employees.colStatus')];
    const rows = allEmpItems.map(emp => {
      const dept = departments.find(d => d.id === emp.departmentId);
      const pos = positions.find(p => p.id === emp.positionId);
      return [
        emp.employeeNumber,
        `${emp.firstName} ${emp.lastName}`,
        dept?.name || '',
        pos?.name || '',
        emp.hireDate || '',
        emp.employmentType || '',
        (emp as any).status || '',
      ];
    });
    const csv = [headers.join(','), ...rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{t('hr.employees.title')}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('hr.employees.subtitle')}</p>
        </div>
        <button onClick={generateCSV} className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-4 py-2 rounded-xl font-semibold text-xs hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors border border-emerald-100 dark:border-emerald-900">
          <Download className="h-4 w-4" />
          <span>{t('exportCSV')}</span>
        </button>
      </div>

      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-opacity ${isPlaceholderData ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">{t('hr.employees.colId')}</th>
                <th className="p-4">{t('hr.employees.colName')}</th>
                <th className="p-4">{t('hr.employees.colDepartment')}</th>
                <th className="p-4">{t('hr.employees.colPosition')}</th>
                <th className="p-4">{t('hr.employees.colHireDate')}</th>
                <th className="p-4">{t('hr.employees.colType')}</th>
                <th className="p-4">{t('hr.employees.colStatus')}</th>
                <th className="p-4">{t('hr.employees.colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              {empLoading ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.employees.loading')}</td></tr>
              ) : empItems.length === 0 ? (
                <tr><td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-bold">{t('hr.employees.noEmployees')}</td></tr>
              ) : empItems.map(emp => {
                const dept = departments.find(d => d.id === emp.departmentId);
                const pos = positions.find(p => p.id === emp.positionId);
                return (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                    <td className="p-4 font-bold">{emp.employeeNumber}</td>
                    <td className="p-4">{emp.firstName} {emp.lastName}</td>
                    <td className="p-4">{dept ? dept.name : <span className="text-slate-400 italic">{t('hr.employees.none')}</span>}</td>
                    <td className="p-4">{pos ? pos.name : <span className="text-slate-400 italic">{t('hr.employees.none')}</span>}</td>
                    <td className="p-4">{emp.hireDate ? fmtDT(emp.hireDate) : '-'}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 rounded text-[10px]">
                        {emp.employmentType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        (emp as any).status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' :
                        (emp as any).status === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                        (emp as any).status === 'TERMINATED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {t((emp as any).status === 'ACTIVE' ? 'hr.employees.active' : (emp as any).status === 'SUSPENDED' ? 'hr.employeeFile.suspendedTempBlock' : (emp as any).status === 'TERMINATED' ? 'hr.employeeFile.terminated' : 'hr.employeeFile.inactiveAccessRevoked')}
                      </span>
                    </td>
                    <td className="p-4 text-sky-600 hover:text-sky-500 font-bold">
                      <button
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setModalTab('dossier');
                          employeeSalaryProfileApi.getByEmployee(emp.id).then(res => {
                            setModalSalaryProfiles(Array.isArray(res) ? res : (res as any)?.items || []);
                          }).catch(() => setModalSalaryProfiles([]));
                        }}
                        className="flex items-center gap-1 hover:underline text-sky-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t('hr.employees.viewFile')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={employeesPage}
          totalItems={empTotal}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setEmployeesPage}
          idPrefix="employees"
        />
      </div>
    </div>
  );
});

export default EmployeesTab;
