export interface ApplicantProfile {
  id: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  passportNumber?: string;
  phone?: string;
  alternatePhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}
