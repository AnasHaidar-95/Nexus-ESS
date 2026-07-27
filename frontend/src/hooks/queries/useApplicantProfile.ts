import { useQuery } from '@tanstack/react-query';
import { applicantApi } from '../../lib/applicants';

export const APPLICANT_PROFILE_KEYS = {
  all: ['applicantProfile'] as const,
  profile: () => [...APPLICANT_PROFILE_KEYS.all, 'profile'] as const,
};

export function useApplicantProfile() {
  return useQuery({
    queryKey: APPLICANT_PROFILE_KEYS.profile(),
    queryFn: () => applicantApi.getProfile(),
  });
}
