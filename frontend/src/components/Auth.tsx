import React, { useState } from 'react';
import { KeyRound, Mail, User as UserIcon, Lock, Landmark, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SECURITY_QUESTIONS = [
  'What city were you born in?',
  'What was the name of your first pet?',
  'What was the make of your first car?',
  'What is your favorite food?',
  'What elementary school did you attend?',
  'What is the name of your childhood best friend?',
  'What was the name of your first boss?',
  'What is your favorite movie?',
];

interface AuthProps {
  onLoginSuccess: () => void;
  resetToken?: string;
}

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

export default function Auth({ onLoginSuccess, resetToken }: AuthProps) {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>(resetToken ? 'reset-password' : 'login');

  const [loginEmailOrUsername, setLoginEmailOrUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerSecurityQuestion, setRegisterSecurityQuestion] = useState('');
  const [registerSecurityAnswer, setRegisterSecurityAnswer] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotSecurityQuestion, setForgotSecurityQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginEmailOrUsername, loginPassword);
      onLoginSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errors.invalidCredentials');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await register(registerName, registerEmail, registerPassword, registerSecurityQuestion, registerSecurityAnswer);
      setSuccess(t('auth.accountCreated'));
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterSecurityQuestion('');
      setRegisterSecurityAnswer('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errors.somethingWentWrong');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { authApi } = await import('../lib/auth');

      if (forgotStep === 1) {
        const result = await authApi.forgotPassword(forgotEmail) as { securityQuestion: string };
        setForgotSecurityQuestion(result.securityQuestion);
        setForgotStep(2);
      } else if (forgotStep === 2) {
        const result = await authApi.verifySecurityAnswer(forgotEmail, forgotAnswer) as { resetToken: string };
        setForgotResetToken(result.resetToken);
        setForgotStep(3);
      } else if (forgotStep === 3) {
        if (forgotNewPassword !== forgotConfirmPassword) {
          setError(t('errors.passwordMismatch'));
          setSubmitting(false);
          return;
        }
        if (forgotNewPassword.length < 8) {
          setError(t('errors.passwordTooShort'));
          setSubmitting(false);
          return;
        }
        if (!/[A-Z]/.test(forgotNewPassword)) {
          setError(t('validation.passwordRequirements'));
          setSubmitting(false);
          return;
        }
        if (!/[0-9]/.test(forgotNewPassword)) {
          setError(t('validation.passwordRequirements'));
          setSubmitting(false);
          return;
        }
        if (!/[^A-Za-z0-9]/.test(forgotNewPassword)) {
          setError(t('validation.passwordRequirements'));
          setSubmitting(false);
          return;
        }
        await authApi.resetPassword(forgotResetToken, forgotNewPassword);
        setSuccess(t('auth.accountCreated'));
        setTimeout(() => {
          switchView('login');
          setForgotStep(1);
          setForgotEmail('');
          setForgotAnswer('');
          setForgotNewPassword('');
          setForgotConfirmPassword('');
        }, 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errors.somethingWentWrong');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetPasswordValue !== resetConfirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (resetPasswordValue.length < 8) {
      setError(t('errors.passwordTooShort'));
      return;
    }
    if (!/[A-Z]/.test(resetPasswordValue)) {
      setError(t('validation.passwordRequirements'));
      return;
    }
    if (!/[0-9]/.test(resetPasswordValue)) {
      setError(t('validation.passwordRequirements'));
      return;
    }
    if (!/[^A-Za-z0-9]/.test(resetPasswordValue)) {
      setError(t('validation.passwordRequirements'));
      return;
    }

    setSubmitting(true);
    try {
      const { authApi } = await import('../lib/auth');
      await authApi.resetPassword(resetToken || '', resetPasswordValue);
      setSuccess(t('auth.accountCreated'));
      setResetPasswordValue('');
      setResetConfirmPassword('');
      setTimeout(() => setView('login'), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('errors.tryAgain');
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError('');
    setSuccess('');
  };

  const inputClass = "block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 ps-10 pe-3 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100";
  const btnPrimaryClass = "group relative w-full flex justify-center rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm disabled:opacity-50";
  const linkClass = "font-semibold text-blue-600 hover:text-blue-700 underline";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 rounded-xl bg-white p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{t('auth.signInTitle')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {view === 'login' && t('auth.signInSubtitle')}
            {view === 'register' && t('auth.signUpSubtitle')}
            {view === 'forgot-password' && t('auth.resetPasswordTitle')}
            {view === 'reset-password' && t('auth.resetPasswordTitle')}
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">{error}</div>
        )}

        {success && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">{success}</div>
        )}

        {/* LOGIN */}
        {view === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4 rounded-md">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('auth.email')}</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input type="text" required value={loginEmailOrUsername} onChange={(e) => setLoginEmailOrUsername(e.target.value)} className={inputClass} placeholder="admin@company.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('auth.password')}</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="text-right text-sm">
              <button type="button" onClick={() => switchView('forgot-password')} className="text-slate-500 hover:text-blue-600 transition-colors">
                {t('auth.forgotPassword')}
              </button>
            </div>

            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              <span className="absolute inset-y-0 inset-s-0 flex items-center ps-3">
                <KeyRound className="h-5 w-5 text-blue-200" />
              </span>
              {submitting ? t('auth.signingIn') : t('auth.signIn')}
            </button>

            <div className="text-center text-sm text-slate-500">
              {t('auth.dontHaveAccount')}{' '}
              <button type="button" onClick={() => switchView('register')} className={linkClass}>
                {t('auth.signUp')}
              </button>
            </div>


          </form>
        )}

        {/* REGISTER */}
        {view === 'register' && (
          <form className="mt-8 space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('auth.fullName')} *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input type="text" required value={registerName} onChange={(e) => setRegisterName(e.target.value)} className={inputClass} placeholder="Alice Johnson" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">{t('auth.email')} *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input type="email" required value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} className={inputClass} placeholder="alice@gmail.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">{t('auth.password')} *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input type="password" required value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Security Question *</label>
                <select
                  required
                  value={registerSecurityQuestion}
                  onChange={(e) => setRegisterSecurityQuestion(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-3 text-sm placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a question...</option>
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Security Answer *</label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={registerSecurityAnswer}
                    onChange={(e) => setRegisterSecurityAnswer(e.target.value)}
                    className={inputClass}
                    placeholder="Your answer (case-insensitive)"
                  />
                </div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              {submitting ? t('auth.creatingAccount') : t('auth.signUp')}
            </button>

            <div className="text-center text-sm text-slate-500">
              {t('auth.alreadyHaveAccount')}{' '}
              <button type="button" onClick={() => switchView('login')} className={linkClass}>{t('auth.signIn')}</button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {view === 'forgot-password' && (
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            {/* Step 1: Enter email */}
            {forgotStep === 1 && (
              <>
                <div className="text-sm text-slate-500 text-center">
                  Enter your email to answer your security question.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('auth.email')} *</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className={inputClass} placeholder="your@email.com" />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Answer security question */}
            {forgotStep === 2 && (
              <>
                <div className="text-sm text-slate-500 text-center">
                  Answer your security question to continue.
                </div>
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700">Your Security Question</label>
                  <p className="mt-1 text-sm text-slate-900 font-medium">{forgotSecurityQuestion}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your Answer *</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input type="text" required value={forgotAnswer} onChange={(e) => setForgotAnswer(e.target.value)} className={inputClass} placeholder="Your answer" />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Set new password */}
            {forgotStep === 3 && (
              <>
                <div className="text-sm text-slate-500 text-center">
                  Answer verified! Set your new password below.
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('auth.password')} *</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input type="password" required value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} className={inputClass} placeholder="Min. 8 characters" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('auth.confirmPassword')} *</label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input type="password" required value={forgotConfirmPassword} onChange={(e) => setForgotConfirmPassword(e.target.value)} className={inputClass} placeholder="Repeat password" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              {submitting ? t('common.loading') : forgotStep === 1 ? t('common.next') : forgotStep === 2 ? 'Verify Answer' : t('auth.resetPassword')}
            </button>

            <div className="text-center text-sm text-slate-500">
              <button type="button" onClick={() => { switchView('login'); setForgotStep(1); setForgotEmail(''); setForgotAnswer(''); }} className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4 me-1 rtl:rotate-180" /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD */}
        {view === 'reset-password' && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="text-sm text-slate-500 text-center">
              Enter your new password below.
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('auth.password')} *</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input type="password" required value={resetPasswordValue} onChange={(e) => setResetPasswordValue(e.target.value)} className={inputClass} placeholder="Min. 8 characters" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('auth.confirmPassword')} *</label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center ps-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input type="password" required value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} className={inputClass} placeholder="Repeat password" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className={btnPrimaryClass}>
              {submitting ? t('common.loading') : t('auth.resetPassword')}
            </button>

            <div className="text-center text-sm text-slate-500">
              <button type="button" onClick={() => switchView('login')} className="flex items-center justify-center mx-auto text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="h-4 w-4 me-1 rtl:rotate-180" /> Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
