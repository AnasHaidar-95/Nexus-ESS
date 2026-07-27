import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { documentCategoryApi } from '../../lib/document-categories';
import { employeeDocumentApi } from '../../lib/employee-documents';

export const DOC_KEYS = {
  all: ['documents'] as const,
  categories: (params?: Record<string, unknown>) => [...DOC_KEYS.all, 'categories', params] as const,
  employeeDocs: (params?: Record<string, unknown>) => [...DOC_KEYS.all, 'employeeDocs', params] as const,
};

export function useDocumentCategories(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: DOC_KEYS.categories(params),
    queryFn: () => documentCategoryApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeDocuments(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: DOC_KEYS.employeeDocs(params),
    queryFn: () => employeeDocumentApi.list(params),
    placeholderData: keepPreviousData,
  });
}
