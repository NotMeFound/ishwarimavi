import React, { useState } from 'react';
import {
  Language,
  AdminAccount,
  SchoolData,
  SecurityAuditLogEntry
} from '../../types';
import {
  User,
  Building2,
  Lock,
  KeyRound,
  ShieldCheck,
  Clock,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Upload,
  Check,
  ExternalLink
} from 'lucide-react';
import {
  ALL_PERMISSIONS,
  verifyPassword,
  hashPasswordBcrypt
} from '../../utils/security';
import { safeSessionStorage } from '../../utils/storage';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { apiClient } from '../../services/apiClient';

interface AdminProfileTabProps {
  lang: Language;
  currentAccount: AdminAccount | null;
  accounts: AdminAccount[];
  onUpdateAccounts: (accounts: AdminAccount[]) => void;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  onAddAuditLog: (log: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  onShowToast: (msg: string) => void;
  sessionTimeLeft?: number;
  onLogout?: () => void;
  initialSubTab?: 'profile' | 'security' | 'institutional';
}

export const AdminProfileTab: React.FC<AdminProfileTabProps> = ({
  lang,
  currentAccount,
  accounts,
  onUpdateAccounts,
  school,
  onUpdateSchool,
  onAddAuditLog,
  onShowToast,
  sessionTimeLeft = 1800,
  onLogout,
  initialSubTab = 'profile'
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'institutional'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Institutional school form state
  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...school });
  const [logoPreview, setLogoPreview] = useState<string>(school.logo_url || '');

  // Confirmation modal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    confirmText: string;
    variant: ConfirmationVariant;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirm',
    variant: 'warning',
    action: () => {}
  });

  const effectiveAccount = currentAccount || accounts[0] || {
    id: 'usr_superadmin',
    username: 'ishwari-superadmin',
    fullName: 'Master System Administrator',
    email: 'superadmin@ishwari.edu.np',
    role: 'super_admin' as const,
    passwordHash: '',
    salt: '',
    status: 'active' as const,
    permissions: ALL_PERMISSIONS.map(p => p.key),
    createdAt: '2083-01-01',
    lastLogin: 'Today'
  };

  const isSuperAdmin = effectiveAccount.role === 'super_admin';

  // Password strength checker
  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculatePasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError(t('Please enter your current password.', 'कृपया हालको पासवर्ड प्रविष्ट गर्नुहोस्।'));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(t('New password must be at least 8 characters long.', 'नयाँ पासवर्ड कम्तीमा ८ अक्षरको हुनुपर्छ।'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('New passwords do not match.', 'नयाँ पासवर्डहरू मिलेनन्।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Confirm Password Update', 'पासवर्ड परिवर्तन पुष्टि गर्नुहोस्'),
      description: t(
        'Are you sure you want to change your administrator password? You will need to use your new password for your next login.',
        'के तपाईं आफ्नो प्रशासक पासवर्ड परिवर्तन गर्न निश्चित हुनुहुन्छ? अर्को पटक लगइन गर्दा नयाँ पासवर्ड आवश्यक पर्नेछ।'
      ),
      itemName: `@${effectiveAccount.username}`,
      confirmText: t('Update Password', 'पासवर्ड अपडेट गर्नुहोस्'),
      action: async () => {
        setIsUpdatingPassword(true);
        try {
          const res = await apiClient.changePassword({
            currentPassword,
            newPassword
          });

          if (!res.success) {
            setPasswordError(res.error || t('Incorrect current password.', 'हालको पासवर्ड गलत छ।'));
            setIsUpdatingPassword(false);
            return;
          }

          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess(t('Password changed successfully!', 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो!'));
          onShowToast(t('Password updated successfully.', 'पासवर्ड अपडेट भयो।'));
        } catch (err: any) {
          setPasswordError(err?.message || t('An error occurred during password verification.', 'पासवर्ड प्रमाणीकरणमा त्रुटि भयो।'));
        } finally {
          setIsUpdatingPassword(false);
        }
      }
    });
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(schoolForm);
    onAddAuditLog({
      action: 'SCHOOL_PROFILE_UPDATED',
      actor: effectiveAccount.username,
      role: effectiveAccount.role,
      module: 'SETTINGS_PROFILE',
      status: 'success',
      result: 'success',
      details: `Updated school identity details: "${schoolForm.name_en}" / "${schoolForm.name_np}".`
    });
    onShowToast(t('Institutional profile updated successfully.', 'संस्थागत प्रोफाइल सुरक्षित गरियो।'));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast(t('Logo image file must be smaller than 2MB.', 'लोगो फाइल २ MB भन्दा सानो हुनुपर्छ।'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        setLogoPreview(res);
        setSchoolForm(prev => ({ ...prev, logo_url: res }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        variant={confirmState.variant}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#1E40AF]" />
            <span>{t('Account & Profile Management', 'खाता तथा प्रोफाइल व्यवस्थापन')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Manage your administrator credentials, security credentials, and institutional school identity.',
              'तपाईंको प्रशासकीय विवरण, सुरक्षा क्रेडेन्सियल र विद्यालयको संस्थागत पहिचान व्यवस्थापन गर्नुहोस्।'
            )}
          </p>
        </div>

        {/* Sub-tab Switchers */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'profile'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t('My Profile', 'मेरो प्रोफाइल')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'security'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{t('Change Password', 'पासवर्ड फेर्नुहोस्')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('institutional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'institutional'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t('School Identity', 'विद्यालय पहिचान')}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MY PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Profile Card */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#1E40AF] to-blue-700 text-white flex items-center justify-center text-2xl font-black shadow-md border-2 border-white dark:border-slate-800">
                {effectiveAccount.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {effectiveAccount.fullName}
                </h3>
                <p className="text-xs font-mono text-[#1E40AF] dark:text-blue-400 mt-0.5">
                  @{effectiveAccount.username}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isSuperAdmin ? 'Super Administrator' : 'Administrator'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('Email Address', 'इमेल ठेगाना')}:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{effectiveAccount.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('Account Status', 'खाता स्थिति')}:</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Active</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('Member Since', 'खाता सिर्जना')}:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{effectiveAccount.createdAt || '2083-01-01'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('Last Login', 'अन्तिम लगइन')}:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{effectiveAccount.lastLogin || 'Today'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('Session Time Left', 'सत्र बाँकी समय')}:</span>
                <span className="font-mono font-bold text-[#1E40AF] dark:text-blue-400">
                  {formatTimer(sessionTimeLeft)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t('Change Password', 'पासवर्ड परिवर्तन')}</span>
            </button>
          </div>

          {/* Assigned Permissions Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E40AF]" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Assigned Administrative Permissions', 'प्रदत्त प्रशासनिक अनुमतिहरू')}
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#1E40AF] dark:bg-blue-950/60 dark:text-blue-300">
                  {isSuperAdmin ? 'ALL AUTHORIZED (Super Admin)' : `${effectiveAccount.permissions?.length || 0} permissions`}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {isSuperAdmin
                  ? t(
                      'As a Super Administrator, you have unrestricted master clearance across all administrative modules, security controls, backup archives, and database operations.',
                      'सुपर प्रशासकको रूपमा, तपाईंलाई सबै प्रशासनिक मोड्युलहरू, सुरक्षा सेटिङ, ब्याकअप र डाटाबेसमा पूर्ण अख्तियारी छ।'
                    )
                  : t(
                      'Your administrator account is restricted to the specific operational capabilities checked below.',
                      'तपाईंको खाता तल चिन्ह लगाइएका विशिष्ट कार्यहरूमा मात्र सीमित छ।'
                    )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const hasPerm = isSuperAdmin || effectiveAccount.permissions?.includes(perm.key);
                  return (
                    <div
                      key={perm.key}
                      className={`p-3 rounded-xl border transition flex items-start gap-2.5 ${
                        hasPerm
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                          hasPerm
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {isNp ? perm.labelNp : perm.labelEn}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          {perm.key}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CHANGE PASSWORD */}
      {activeSubTab === 'security' && (
        <div className="max-w-2xl p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Change Administrator Password', 'प्रशासक पासवर्ड परिवर्तन गर्नुहोस्')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'Update your account password with strong bcrypt encryption. Passwords should be at least 8 characters long.',
                'कडा इन्क्रिप्सनसहित आफ्नो पासवर्ड परिवर्तन गर्नुहोस्। पासवर्ड कम्तीमा ८ अक्षर लामो हुनुपर्छ।'
              )}
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Current Password', 'हालको पासवर्ड')} *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t('Enter current password', 'हालको पासवर्ड टाइप गर्नुहोस्')}
                  required
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('New Password', 'नयाँ पासवर्ड')} *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('At least 8 characters', 'कम्तीमा ८ अक्षर')}
                  required
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t('Password Strength', 'पासवर्ड मजबुती')}:</span>
                    <span className={`font-bold ${
                      strengthScore <= 2 ? 'text-red-500' : strengthScore <= 4 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {strengthScore <= 2 ? t('Weak', 'कमजोर') : strengthScore <= 4 ? t('Medium', 'मध्यम') : t('Strong', 'बलियो')}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-full flex-1 transition-all rounded-full ${
                          lvl <= strengthScore
                            ? strengthScore <= 2
                              ? 'bg-red-500'
                              : strengthScore <= 4
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Confirm New Password', 'नयाँ पासवर्ड पुनः टाइप गर्नुहोस्')} *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('Re-enter new password', 'नयाँ पासवर्ड पुनः टाइप गर्नुहोस्')}
                  required
                  className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isUpdatingPassword ? t('Verifying...', 'प्रमाणीकरण हुँदै...') : t('Update Password', 'पासवर्ड अपडेट गर्नुहोस्')}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: INSTITUTIONAL SCHOOL IDENTITY */}
      {activeSubTab === 'institutional' && (
        <form onSubmit={handleSaveSchool} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Institutional Profile & School Coordinates', 'संस्थागत प्रोफाइल तथा सम्पर्क विवरण')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('Changes save immediately across public headers, footers, and institutional meta.', 'यहाँ सम्पादन गरिएको विवरण सम्पूर्ण वेबसाइटभर तत्काल लागु हुनेछ।')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (English)', 'विद्यालयको नाम (अंग्रेजी)')} *
              </label>
              <input
                type="text"
                value={schoolForm.name_en}
                onChange={e => setSchoolForm({ ...schoolForm, name_en: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('School Name (Nepali)', 'विद्यालयको नाम (नेपाली)')} *
              </label>
              <input
                type="text"
                value={schoolForm.name_np}
                onChange={e => setSchoolForm({ ...schoolForm, name_np: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Tagline / Motto (English)', 'मूल नारा (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={schoolForm.tagline_en}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_en: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Tagline / Motto (Nepali)', 'मूल नारा (नेपाली)')}
              </label>
              <input
                type="text"
                value={schoolForm.tagline_np}
                onChange={e => setSchoolForm({ ...schoolForm, tagline_np: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            {/* School Logo */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                {t('Official School Logo / Crest Image', 'विद्यालयको आधिकारिक लोगो / छाप')}
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#1E40AF]/30 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                  {logoPreview && logoPreview.trim() ? (
                    <img src={logoPreview} alt="School Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-serif font-black text-2xl text-[#1E40AF]">ई</span>
                  )}
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="text"
                    placeholder={t('Enter Image URL (e.g., https://... or data:image/...)', 'लोगोको URL राख्नुहोस्')}
                    value={schoolForm.logo_url || ''}
                    onChange={e => {
                      setSchoolForm({ ...schoolForm, logo_url: e.target.value });
                      setLogoPreview(e.target.value);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 border border-blue-200 dark:border-blue-800 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('Upload Logo File', 'लोगो फाइल अपलोड गर्नुहोस्')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Primary Phone Number', 'सम्पर्क फोन नम्बर')}
              </label>
              <input
                type="text"
                value={schoolForm.phone}
                onChange={e => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Email Address', 'आधिकारिक इमेल ठेगाना')}
              </label>
              <input
                type="email"
                value={schoolForm.email}
                onChange={e => setSchoolForm({ ...schoolForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Address (English)', 'ठेगाना (अंग्रेजी)')}
              </label>
              <input
                type="text"
                value={schoolForm.address_en}
                onChange={e => setSchoolForm({ ...schoolForm, address_en: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Address (Nepali)', 'ठेगाना (नेपाली)')}
              </label>
              <input
                type="text"
                value={schoolForm.address_np}
                onChange={e => setSchoolForm({ ...schoolForm, address_np: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('Save Institutional Profile', 'संस्थागत विवरण सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
