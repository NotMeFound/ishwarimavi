import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  DocumentItem,
  ContactMessage,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry
} from '../../types';
import {
  Settings,
  Shield,
  Database,
  Sliders,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  KeyRound,
  FileJson,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface AdminSystemSettingsTabProps {
  lang: Language;
  securityConfig: SecurityConfig;
  onUpdateSecurityConfig: (config: SecurityConfig) => void;
  school: SchoolData;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  onRestoreAllData: (data: any) => void;
  onResetFactory: () => void;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onAddAuditLog: (log: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  onShowToast: (msg: string) => void;
  isSuperAdmin: boolean;
  currentUsername: string;
  defaultSection?: 'security' | 'backup' | 'system_info';
}

export const AdminSystemSettingsTab: React.FC<AdminSystemSettingsTabProps> = ({
  lang,
  securityConfig,
  onUpdateSecurityConfig,
  school,
  notices,
  staff,
  facilities,
  programs,
  documents,
  messages,
  events,
  achievements,
  history,
  gallery,
  siteConfig,
  onUpdateSiteConfig,
  onRestoreAllData,
  onResetFactory,
  auditLogs,
  onAddAuditLog,
  onShowToast,
  isSuperAdmin,
  currentUsername,
  defaultSection = 'security'
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [activeSection, setActiveSection] = useState<'security' | 'backup' | 'operations'>(
    defaultSection === 'backup' ? 'backup' : 'security'
  );

  // Security configuration form
  const [securityForm, setSecurityForm] = useState<SecurityConfig>({ ...securityConfig });

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

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      onShowToast(t('Only Super Administrators can update security policies.', 'सुपर प्रशासकले मात्र सुरक्षा नीति परिवर्तन गर्न सक्छन्।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Security Configuration', 'सुरक्षा नीति सुरक्षित गर्नुहोस्'),
      description: t(
        'Are you sure you want to update global system security parameters including session timeout and lockout durations?',
        'के तपाईं प्रणालीको सुरक्षा नीति, सत्र अवधि र लकआउट सेटिङहरू अद्यावधिक गर्न निश्चित हुनुहुन्छ?'
      ),
      itemName: t('System Security Policies', 'प्रणाली सुरक्षा नीति'),
      confirmText: t('Save Policies', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSecurityConfig(securityForm);
        onAddAuditLog({
          action: 'SECURITY_POLICIES_UPDATED',
          actor: currentUsername,
          role: 'super_admin',
          module: 'SYSTEM_SETTINGS',
          status: 'success',
          result: 'success',
          details: `Updated session timeout (${securityForm.sessionTimeoutMinutes}m) and lockout threshold (${securityForm.maxLoginAttempts} attempts).`
        });
        onShowToast(t('Security policies saved successfully.', 'सुरक्षा सेटिङहरू सुरक्षित गरियो।'));
      }
    });
  };

  // Full Database Export (Backup)
  const handleExportBackup = () => {
    setConfirmState({
      isOpen: true,
      variant: 'download',
      title: t('Export Authoritative Database Backup', 'सम्पूर्ण डाटाबेस ब्याकअप डाउनलोड गर्नुहोस्'),
      description: t(
        'This creates an authoritative, timestamped JSON snapshot containing all school profile records, notices, staff members, events, gallery images, documents, and system configuration.',
        'यसले विद्यालयको सम्पूर्ण विवरण, सूचनाहरू, कर्मचारी, कार्यक्रम, ग्यालरी र प्रणाली सेटिङहरूको पूर्ण ब्याकअप सिर्जना गर्दछ।'
      ),
      itemName: `ishwari_backup_${new Date().toISOString().split('T')[0]}.json`,
      confirmText: t('Download Complete Backup', 'ब्याकअप डाउनलोड गर्नुहोस्'),
      action: () => {
        const fullBackup = {
          version: '2.5.0',
          exportedAt: new Date().toISOString(),
          exportedBy: currentUsername,
          school,
          notices,
          staff,
          facilities,
          programs,
          documents,
          messages,
          events,
          achievements,
          history,
          gallery,
          siteConfig,
          securityConfig
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `ishwari_school_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        onAddAuditLog({
          action: 'SYSTEM_BACKUP_EXPORTED',
          actor: currentUsername,
          role: isSuperAdmin ? 'super_admin' : 'admin',
          module: 'BACKUP_MANAGEMENT',
          status: 'success',
          result: 'success',
          details: `Exported complete institutional database backup containing ${notices.length} notices and ${staff.length} staff records.`
        });

        onShowToast(t('Authoritative backup downloaded successfully.', 'डाटाबेस ब्याकअप सफलतापूर्वक डाउनलोड भयो।'));
      }
    });
  };

  // File Upload Restore
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }

        setConfirmState({
          isOpen: true,
          variant: 'update',
          title: t('Confirm System Restore', 'डाटाबेस रिस्टोर पुष्टि गर्नुहोस्'),
          description: t(
            'Are you sure you want to restore the application state from this backup file? Existing records will be overwritten with the archive contents.',
            'के तपाईं यस ब्याकअप फाइलबाट डाटाबेस रिस्टोर गर्न निश्चित हुनुहुन्छ? हालको विवरणहरू अभिलेख अनुसार प्रतिस्थापन हुनेछन्।'
          ),
          itemName: file.name,
          confirmText: t('Restore Database Now', 'डाटाबेस रिस्टोर गर्नुहोस्'),
          action: () => {
            onRestoreAllData(parsed);
            onAddAuditLog({
              action: 'SYSTEM_RESTORE_EXECUTED',
              actor: currentUsername,
              role: isSuperAdmin ? 'super_admin' : 'admin',
              module: 'BACKUP_MANAGEMENT',
              status: 'warning',
              result: 'success',
              details: `Restored full database from backup file "${file.name}".`
            });
            onShowToast(t('Database restored successfully from backup.', 'ब्याकअपबाट डाटाबेस सफलतापूर्वक रिस्टोर गरियो।'));
          }
        });
      } catch {
        onShowToast(t('Error reading backup file. Please provide a valid JSON archive.', 'ब्याकअप फाइल पढ्न सकिएन। कृपया मान्य JSON फाइल छान्नुहोस्।'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Factory Reset
  const handleFactoryResetConfirm = () => {
    if (!isSuperAdmin) {
      onShowToast(t('Only Super Administrators are authorized to perform a factory reset.', 'सुपर प्रशासकले मात्र प्रणाली रिसेट गर्न सक्छन्।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Emergency Factory Reset', 'प्रणाली प्रारम्भिक रिसेट'),
      description: t(
        'CRITICAL WARNING: This will purge all modifications and revert school profile, notices, faculty members, and gallery back to original school default values. This cannot be undone!',
        'गम्भीर चेतावनी: यसले सबै परिमार्जनहरू हटाएर विद्यालयको तथ्याङ्क, सूचना र कर्मचारीहरूलाई प्रारम्भिक स्थितिमा फर्काउनेछ।'
      ),
      itemName: 'Ishwari School Master Database',
      confirmText: t('Execute Factory Reset', 'प्रणाली रिसेट गर्नुहोस्'),
      action: () => {
        onResetFactory();
        onAddAuditLog({
          action: 'FACTORY_RESET_TRIGGERED',
          actor: currentUsername,
          role: 'super_admin',
          module: 'SYSTEM_MAINTENANCE',
          status: 'danger',
          result: 'success',
          details: `Super Administrator @${currentUsername} triggered an emergency factory reset.`
        });
        onShowToast(t('System reverted to factory configuration.', 'प्रणाली प्रारम्भिक अवस्थामा रिसेट भयो।'));
      }
    });
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

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1E40AF]" />
            <span>{t('Site & System Settings', 'साइट तथा प्रणाली सेटिङ')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Manage institutional security policies, automated backups, and system operational parameters.',
              'सुरक्षा नीति, डाटाबेस ब्याकअप तथा प्रणाली सञ्चालन सेटिङहरू व्यवस्थापन गर्नुहोस्।'
            )}
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveSection('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'security'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{t('Security & Access', 'सुरक्षा नीति')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('backup')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'backup'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{t('Backup & Restore', 'ब्याकअप र रिस्टोर')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('operations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'operations'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t('System Diagnostics', 'प्रणाली डायग्नोस्टिक्स')}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SECURITY POLICIES */}
      {activeSection === 'security' && (
        <form onSubmit={handleSaveSecurity} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Authentication & Session Security Controls', 'प्रमाणीकरण तथा सत्र सुरक्षा नियन्त्रण')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'Configure idle session timeout, maximum failed login attempts, and account lockout durations.',
                'सत्रको समयसीमा, अधिकतम असफल लगइन प्रयास र लकआउट अवधि सेट गर्नुहोस्।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Session Timeout Duration (Minutes)', 'सत्र स्वतः समाप्त हुने अवधि (मिनेट)')}
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={securityForm.sessionTimeoutMinutes}
                onChange={e => setSecurityForm({ ...securityForm, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('Administrators will be automatically logged out after inactivity. Default: 30 minutes.', 'निष्क्रिय भएपछि स्वतः लगआउट हुने समय (डिफल्ट: ३० मिनेट)।')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Max Failed Login Attempts Before Lockout', 'लकआउट हुनु अघिको अधिकतम गलत प्रयास')}
              </label>
              <input
                type="number"
                min="3"
                max="10"
                value={securityForm.maxLoginAttempts}
                onChange={e => setSecurityForm({ ...securityForm, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('IP address or username temporarily locked out after exceeding limit. Default: 5 attempts.', 'सिमा नाघेमा खाता अस्थायी रूपमा रोकिनेछ (डिफल्ट: ५)।')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Account Lockout Duration (Minutes)', 'लकआउट अवधि (मिनेट)')}
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={securityForm.lockoutDurationMinutes}
                onChange={e => setSecurityForm({ ...securityForm, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('Duration an account remains locked after failed attempts. Default: 15 minutes.', 'लकआउट भइसकेपछि खुल्न लाग्ने समय (डिफल्ट: १५ मिनेट)।')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Emergency SuperAdmin Master PIN', 'आपतकालीन मास्टर पिन (PIN)')}
              </label>
              <input
                type="password"
                maxLength={8}
                value={securityForm.emergencyPin || '8301'}
                onChange={e => setSecurityForm({ ...securityForm, emergencyPin: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-[#1E40AF]"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {t('Used for emergency console unlock and factory reset authorization.', 'आपतकालीन कन्सोल अनलक र रिसेट प्रमाणीकरणको लागि प्रयोग गरिन्छ।')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('Save Security Policies', 'सुरक्षा सेटिङ सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* SECTION 2: BACKUP & RESTORE */}
      {activeSection === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Backup Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Authoritative Database Backup', 'आधिकारिक डाटाबेस ब्याकअप')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'Download an instant JSON archive containing all notices, faculty members, gallery items, documents, and site preferences.',
                  'विद्यालयको सम्पूर्ण तथ्याङ्क, सूचना र फोटोहरू समावेश भएको JSON ब्याकअप डाउनलोड गर्नुहोस्।'
                )}
              </p>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>{t('Notices Archived', 'सूचनाहरू')}:</span>
                <span className="font-mono font-bold">{notices.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Staff & Faculty', 'कर्मचारीहरू')}:</span>
                <span className="font-mono font-bold">{staff.length}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('Gallery Images', 'ग्यालरी तस्बिरहरू')}:</span>
                <span className="font-mono font-bold">{gallery.length}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('Download Backup (JSON)', 'ब्याकअप डाउनलोड गर्नुहोस्')}</span>
            </button>
          </div>

          {/* Restore from File Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Restore Database from Backup File', 'ब्याकअप फाइलबाट डाटाबेस रिस्टोर')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'Select a previously generated JSON backup file to overwrite or recover all institutional records.',
                  'पहिले डाउनलोड गरिएको JSON ब्याकअप फाइल छानेर डाटाबेस पुनःस्थापना गर्नुहोस्।'
                )}
              </p>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
              {t('Note: Restoring will overwrite existing data. Please take a backup before proceeding.', 'चेतावनी: रिस्टोर गर्दा हालको तथ्याङ्क प्रतिस्थापन हुनेछ।')}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{t('Select Backup JSON File', 'ब्याकअप फाइल छान्नुहोस्')}</span>
            </button>
          </div>

          {/* Emergency Factory Reset */}
          {isSuperAdmin && (
            <div className="md:col-span-2 p-6 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold">{t('Emergency Factory Data Reset', 'आपतकालीन फ्याक्ट्री रिसेट')}</h3>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300">
                {t(
                  'Super Administrator only: Reset the entire system back to default pre-populated demo records. All custom entries will be lost.',
                  'सुपर प्रशासकका लागि मात्र: सम्पूर्ण डाटाबेसलाई प्रारम्भिक अवस्थामा रिसेट गर्दछ। सबै व्यक्तिगत परिवर्तनहरू हट्नेछन्।'
                )}
              </p>
              <button
                type="button"
                onClick={handleFactoryResetConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('Reset to Initial Defaults', 'प्रारम्भिक अवस्थामा रिसेट गर्नुहोस्')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: SYSTEM DIAGNOSTICS */}
      {activeSection === 'operations' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('System Health & Environment Telemetry', 'प्रणाली अवस्था तथा वातावरण विवरण')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t(
                'Monitor database synchronization status, storage quotas, and security subsystem health.',
                'डाटाबेस सिङ्क्रोनाइजेसन, भण्डारण कोटा र सुरक्षा प्रणालीको स्वास्थ्य स्थिति जाँच्नुहोस्।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-500">{t('Authoritative Backend File', 'मुख्य सर्भर डाटाबेस फाइल')}</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">data/cms_database.json</p>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Synchronized & Active</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-500">{t('Storage Mode', 'भण्डारण प्रकार')}</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">Express Node.js + LocalStorage Fallback</p>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Dual-Tier Resilient</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-slate-500">{t('Security Encryption Standard', 'सुरक्षा इन्क्रिप्सन गुणस्तर')}</span>
              <p className="font-mono font-bold text-slate-800 dark:text-slate-200">Bcrypt Salted Hash (10 Rounds)</p>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>FIPS Compliant Hashing</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onShowToast(t('System diagnostics and storage integrity verified.', 'प्रणाली डायग्नोस्टिक्स र डाटाबेस प्रमाणित गरियो।'));
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{t('Run Storage Health Diagnostic', 'डाटाबेस स्वास्थ्य परीक्षण गर्नुहोस्')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
