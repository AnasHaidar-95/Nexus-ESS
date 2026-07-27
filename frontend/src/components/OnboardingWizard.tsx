import { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../types';
import { applicantApi, UpdateProfileData } from '../lib/applicants';
import { User as UserIcon, FileText, Trash2, CheckCircle2, CloudUpload, Loader2 } from 'lucide-react';
import { useNotificationStore } from '../stores/notificationStore';
import { useApplicantProfile, APPLICANT_PROFILE_KEYS } from '../hooks/queries/useApplicantProfile';

interface OnboardingWizardProps {
  currentUser: User;
  onLogout: () => void;
}

export default function OnboardingWizard({ currentUser, onLogout }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const showToast = useNotificationStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useApplicantProfile();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [docs, setDocs] = useState<Array<{ id: string; category: string; originalFilename: string; fileSizeBytes: number }>>([]);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [nationalId, setNationalId] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const p = profile as Record<string, any>;
    setFirstName(p.firstName || '');
    setMiddleName(p.middleName || '');
    setLastName(p.lastName || '');
    setPreferredName(p.preferredName || '');
    setDateOfBirth(p.dateOfBirth?.split('T')[0] || '');
    setGender(p.gender || 'MALE');
    setNationalId(p.nationalId || '');
    setPassportNumber(p.passportNumber || '');
    setPhone(p.phone || '');
    setAlternatePhone(p.alternatePhone || '');
    setAddressLine1(p.addressLine1 || '');
    setAddressLine2(p.addressLine2 || '');
    setCity(p.city || '');
    setState(p.state || '');
    setPostalCode(p.postalCode || '');
    setCountry(p.country || 'United States');
    setEmergencyContactName(p.emergencyContactName || '');
    setEmergencyContactPhone(p.emergencyContactPhone || '');
    setEmergencyContactRelationship(p.emergencyContactRelationship || '');
    if (p.documents) setDocs(p.documents);
    if (p.submittedAt) setStep(3);
  }, [profile]);

  const handleSaveInfo = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { showToast(t('errors.validationError'), t('errors.firstNameRequired'), 'error'); return; }
    if (firstName.trim().length < 2) { showToast(t('errors.validationError'), t('errors.firstNameMinLength'), 'error'); return; }
    if (!lastName.trim()) { showToast(t('errors.validationError'), t('errors.lastNameRequired'), 'error'); return; }
    if (lastName.trim().length < 2) { showToast(t('errors.validationError'), t('errors.lastNameMinLength'), 'error'); return; }
    if (!phone.trim()) { showToast(t('errors.validationError'), t('errors.phoneRequired'), 'error'); return; }
    if (!/^[\+\d][\d\s\-\(\)]{7,20}$/.test(phone.trim())) { showToast(t('errors.validationError'), t('errors.phoneInvalid'), 'error'); return; }
    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) { showToast(t('errors.validationError'), t('errors.dateOfBirthInvalid'), 'error'); return; }
    if (nationalId.trim() && nationalId.trim().length < 3) { showToast(t('errors.validationError'), t('errors.nationalIdMinLength'), 'error'); return; }
    if (passportNumber.trim() && passportNumber.trim().length < 3) { showToast(t('errors.validationError'), t('errors.passportNumberMinLength'), 'error'); return; }
    if (alternatePhone && !/^[\+\d][\d\s\-\(\)]{7,20}$/.test(alternatePhone.trim())) { showToast(t('errors.validationError'), t('errors.alternatePhoneInvalid'), 'error'); return; }
    if (!addressLine1.trim()) { showToast(t('errors.validationError'), t('errors.addressRequired'), 'error'); return; }
    if (addressLine1.trim().length < 5) { showToast(t('errors.validationError'), t('errors.addressMinLength'), 'error'); return; }
    if (!city.trim()) { showToast(t('errors.validationError'), t('errors.cityRequired'), 'error'); return; }
    if (!state.trim()) { showToast(t('errors.validationError'), t('errors.stateRequired'), 'error'); return; }
    if (!postalCode.trim()) { showToast(t('errors.validationError'), t('errors.postalCodeRequired'), 'error'); return; }
    if (postalCode.trim().length < 3) { showToast(t('errors.validationError'), t('errors.postalCodeMinLength'), 'error'); return; }
    if (!country.trim()) { showToast(t('errors.validationError'), t('errors.countryRequired'), 'error'); return; }
    if (!gender) { showToast(t('errors.validationError'), t('errors.genderRequired'), 'error'); return; }
    if (!emergencyContactName.trim()) { showToast(t('errors.validationError'), t('errors.emergencyContactNameRequired'), 'error'); return; }
    if (emergencyContactName.trim().length < 2) { showToast(t('errors.validationError'), t('errors.emergencyContactNameMinLength'), 'error'); return; }
    if (!emergencyContactPhone.trim()) { showToast(t('errors.validationError'), t('errors.emergencyContactPhoneRequired'), 'error'); return; }
    if (!/^[\+\d][\d\s\-\(\)]{7,20}$/.test(emergencyContactPhone.trim())) { showToast(t('errors.validationError'), t('errors.emergencyContactPhoneInvalid'), 'error'); return; }
    if (!emergencyContactRelationship.trim()) { showToast(t('errors.validationError'), t('errors.emergencyContactRelationshipRequired'), 'error'); return; }
    setSaving(true);
    try {
      await applicantApi.updateProfile({
        firstName, middleName, lastName, preferredName,
        dateOfBirth: dateOfBirth || null, gender,
        nationalId: nationalId || null,
        passportNumber: passportNumber || null,
        phone, alternatePhone: alternatePhone || null,
        addressLine1, addressLine2: addressLine2 || null, city, state, postalCode, country,
        emergencyContactName, emergencyContactPhone, emergencyContactRelationship
      } as UpdateProfileData);
      queryClient.invalidateQueries({ queryKey: APPLICANT_PROFILE_KEYS.all });
      setStep(2);
    } catch (err: any) {
      showToast(t('errors.somethingWentWrong'), err.message || t('errors.failedToSave'), 'error');
    }
    setSaving(false);
  };

  const handleUploadFile = async (category: string, file: File) => {
    setUploading(true);
    try {
      const doc = await applicantApi.uploadDocument(file, category);
      setDocs(prev => [...prev, doc]);
      queryClient.invalidateQueries({ queryKey: APPLICANT_PROFILE_KEYS.all });
    } catch (err: any) {
      showToast(t('errors.uploadFailed'), err.message || t('errors.uploadFailed'), 'error');
    }
    setUploading(false);
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await applicantApi.deleteDocument(docId);
      setDocs(prev => prev.filter(d => d.id !== docId));
      queryClient.invalidateQueries({ queryKey: APPLICANT_PROFILE_KEYS.all });
    } catch (err: any) {
      showToast(t('errors.somethingWentWrong'), err.message || t('errors.failedToDelete'), 'error');
    }
  };

  const handleSubmitProfile = async () => {
    const hasCV = docs.some(d => d.category === 'CV');
    if (!hasCV) {
      showToast(t('errors.validationError'), t('errors.cvRequired'), 'error');
      return;
    }
    setSaving(true);
    try {
      await applicantApi.submit();
      queryClient.invalidateQueries({ queryKey: APPLICANT_PROFILE_KEYS.all });
      setStep(3);
    } catch (err: any) {
      showToast(t('errors.somethingWentWrong'), err.message || t('errors.failedToSubmit'), 'error');
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            OC
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg">{t('onboarding.headerTitle')}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-slate-600 font-medium">{t('onboarding.loggedInAs', { email: currentUser.email })}</span>
          <button
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            {t('auth.signOut')}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {step === 3 ? (
          /* Scenario 1: Redirection success page written in the middle */
          <div className="max-w-2xl bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none">
              {t('onboarding.accountCreated')}
            </h1>
            <p className="text-lg text-slate-500 max-w-md mx-auto">
              {t('onboarding.submittedMessage')}
            </p>
            <div className="pt-4 border-t border-slate-100 mt-6 max-w-md mx-auto">
              <div className="bg-slate-50 rounded-xl p-4 text-left text-sm text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">{t('onboarding.whatHappensNext')}</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>{t('onboarding.nextStep1')}</li>
                  <li>{t('onboarding.nextStep2')}</li>
                  <li>{t('onboarding.nextStep3')}</li>
                </ol>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Step Indicator */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{t('onboarding.title')}</h1>
                <p className="text-xs text-slate-500 mt-1">{t('onboarding.employmentDetails')}</p>
              </div>
              <div className="flex flex-wrap space-x-4 sm:space-x-6">
                <div className={`flex items-center space-x-2 text-sm ${step === 1 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                  <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold border-current">1</span>
                  <span>{t('onboarding.employmentInformation')}</span>
                </div>
                <div className={`flex items-center space-x-2 text-sm ${step === 2 ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                  <span className="h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold border-current">2</span>
                  <span>{t('onboarding.uploadDocuments')}</span>
                </div>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSaveInfo} className="p-4 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" /> {t('onboarding.personalIdentityDetails')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.firstName')}</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('employee.middleName')}</label>
                      <input
                        type="text"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Edward"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('employee.lastName')}</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.preferredName')}</label>
                      <input
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Johnny"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.gender')}</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      >
                        <option value="MALE">{t('onboarding.male')}</option>
                        <option value="FEMALE">{t('onboarding.female')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.dateOfBirth')}</label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.nationalId')}</label>
                      <input
                        type="text"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="ID-8293749"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" /> {t('onboarding.contactDetails')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('employee.phone')}</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.alternatePhone')}</label>
                      <input
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.passportNumber')}</label>
                      <input
                        type="text"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="PP-A92834"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.address')}</label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="123 Tech Boulevard"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.addressLine2')}</label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Suite 400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.city')}</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="San Francisco"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.stateRegion')}</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="CA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.postalCode')}</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="94105"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.country')}</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                <div>
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" /> {t('hr.employeeFile.emergencyContact')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.emergencyContactName')}</label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Mary Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.emergencyContactPhone')}</label>
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">{t('onboarding.emergencyContactRelationship')}</label>
                      <input
                        type="text"
                        value={emergencyContactRelationship}
                        onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Spouse"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {saving ? t('onboarding.saving') : t('onboarding.saveAndProceed')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{t('onboarding.requiredDocuments')}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t('onboarding.uploadDescription')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category: CV/Resume */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center space-y-3 hover:border-blue-500 transition-colors">
                    <CloudUpload className="h-10 w-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{t('onboarding.cvResume')}</p>
                      <p className="text-xs text-slate-500">{t('onboarding.cvResumeHint')}</p>
                    </div>
                    <label className={`inline-block cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading ? t('onboarding.uploading') : t('onboarding.selectCvFile')}
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFile('CV', file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Category: Certifications */}
                  <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 text-center space-y-3 hover:border-blue-500 transition-colors">
                    <CloudUpload className="h-10 w-10 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{t('onboarding.certificates')}</p>
                      <p className="text-xs text-slate-500">{t('onboarding.certificatesHint')}</p>
                    </div>
                    <label className={`inline-block cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-lg text-xs transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {uploading ? t('onboarding.uploading') : t('onboarding.selectCertificateFile')}
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFile('CERTIFICATE', file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="mt-8">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">{t('onboarding.uploadedDocuments', { count: docs.length })}</h4>
                  {docs.length === 0 ? (
                    <p className="text-sm text-slate-500 mt-2 italic">{t('common.noData')}</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{doc.originalFilename}</p>
                              <p className="text-xs text-slate-400">
                                <span className="font-bold text-slate-500 uppercase">{doc.category}</span> • {(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-100">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    {t('onboarding.backToEmployment')}
                  </button>
                  <button
                    onClick={handleSubmitProfile}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
                  >
                    {saving ? t('onboarding.submitting') : t('onboarding.submitApplication')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 bg-white">
        {t('onboarding.footer')}
      </footer>
    </div>
  );
}
