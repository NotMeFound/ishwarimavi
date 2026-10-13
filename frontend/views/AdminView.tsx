import React, { useState, useEffect, useRef } from 'react';
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
  SecurityAuditLogEntry,
  AdminAccount,
  PermissionKey,
  ThemeMode,
  AboutSection,
  CurriculumGuideline,
  Vacancy
} from '../types';
import {
  hasPermission,
  verifyPassword,
  initialAdminAccounts,
  acquireSessionLock,
  releaseSessionLock,
  getActiveSessionLock,
  refreshSessionHeartbeat,
  forceClearSessionLock
} from '../utils/security';
import { safeSessionStorage, safeStorage } from '../utils/storage';
import { apiClient, formatErrorMessage } from '../services/apiClient';
import {
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Building2,
  Bell,
  Users,
  BookOpen,
  BookMarked,
  FolderDown,
  MessageSquare,
  Download,
  Trash2,
  Edit3,
  Plus,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  AlertCircle,
  Pin,
  SlidersHorizontal,
  Quote,
  Layout,
  ShieldAlert,
  CalendarDays,
  Image,
  Database,
  KeyRound,
  Clock,
  Check,
  Upload,
  FileText,
  X,
  Sun,
  Moon,
  Globe,
  LayoutDashboard,
  Briefcase,
  ArrowLeft,
  Loader2,
  User,
  Activity,
  HelpCircle
} from 'lucide-react';

import { SiteCustomizerTab } from './admin/SiteCustomizerTab';
import { SecurityTab } from './admin/SecurityTab';
import { EventsAchievementsHistoryTab } from './admin/EventsAchievementsHistoryTab';
import { GalleryAdminTab } from './admin/GalleryAdminTab';
import { BackupRestoreTab } from './admin/BackupRestoreTab';
import { SuperAdminControlCenter } from './admin/SuperAdminControlCenter';
import { RbacAdminTab } from './admin/RbacAdminTab';
import { StaffAdminTab } from './admin/StaffAdminTab';
import { AdminSidebar, AdminNavTabId } from './admin/AdminSidebar';
import { AdminHeader } from './admin/AdminHeader';
import { AdminPageHeader } from './admin/AdminPageHeader';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminWebsiteTab } from './admin/AdminWebsiteTab';
import { CampusWeatherManagerTab } from './admin/CampusWeatherManagerTab';
import { AdminGovernanceTab } from './admin/AdminGovernanceTab';
import { AdminContentTab } from './admin/AdminContentTab';
import { ContentHealthTab } from './admin/ContentHealthTab';
import { AdminCommunicationTab } from './admin/AdminCommunicationTab';
import { AdminSystemHubTab } from './admin/AdminSystemHubTab';
import { AdminSystemSettingsTab } from './admin/AdminSystemSettingsTab';
import { AdminAuditLogsTab } from './admin/AdminAuditLogsTab';
import { ApiErrorLogsTab } from './admin/ApiErrorLogsTab';
import { AdminProfileTab } from './admin/AdminProfileTab';
import { CurriculumGuidelinesTab } from './admin/CurriculumGuidelinesTab';
import { AdminCareerTab } from './admin/AdminCareerTab';
import { FaqAdminTab } from './admin/FaqAdminTab';
import { SchoolFAQItem } from '../types';
import { initialFAQs } from '../data/schoolData';
import { buildAuthorizedNavigation, getAuthorizedTabIds } from './admin/adminNavigationRegistry';

interface AdminViewProps {
  lang: Language;
  theme?: ThemeMode;
  onToggleTheme?: () => void;
  onToggleLang?: () => void;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  facilities: Facility[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  programs: AcademicProgram[];
  onUpdatePrograms: (programs: AcademicProgram[]) => void;
  documents: DocumentItem[];
  onUpdateDocuments: (docs: DocumentItem[]) => void;
  messages: ContactMessage[];
  onUpdateMessages: (msgs: ContactMessage[]) => void;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => Promise<boolean>;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  securityConfig: SecurityConfig;
  onUpdateSecurityConfig: (config: SecurityConfig) => void;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onAddAuditLog: (entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  adminAccounts?: AdminAccount[];
  onUpdateAdminAccounts?: (accounts: AdminAccount[]) => void;
  aboutSections?: AboutSection[];
  onUpdateAboutSections?: (sections: AboutSection[]) => void;
  curriculumGuidelines?: CurriculumGuideline[];
  onUpdateCurriculumGuidelines?: (items: CurriculumGuideline[]) => void;
  vacancies?: Vacancy[];
  onUpdateVacancies?: (vacancies: Vacancy[]) => void;
  faqs?: SchoolFAQItem[];
  onUpdateFaqs?: (items: SchoolFAQItem[]) => void;
  onRestoreAllData: (data: any) => void;
  onResetData: () => void;
  onNavigateHome: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
  school,
  onUpdateSchool,
  notices,
  onUpdateNotices,
  staff,
  onUpdateStaff,
  facilities,
  onUpdateFacilities,
  programs,
  onUpdatePrograms,
  documents,
  onUpdateDocuments,
  messages,
  onUpdateMessages,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  gallery,
  onUpdateGallery,
  siteConfig,
  onUpdateSiteConfig,
  securityConfig,
  onUpdateSecurityConfig,
  auditLogs,
  onClearAuditLogs,
  onAddAuditLog,
  adminAccounts,
  onUpdateAdminAccounts,
  aboutSections,
  onUpdateAboutSections,
  curriculumGuidelines = [],
  onUpdateCurriculumGuidelines,
  vacancies = [],
  onUpdateVacancies,
  faqs = initialFAQs,
  onUpdateFaqs,
  onRestoreAllData,
  onResetData,
  onNavigateHome,
}) => {
  const effectiveAccounts = adminAccounts && adminAccounts.length > 0 ? adminAccounts : initialAdminAccounts;

  const [currentAccount, setCurrentAccount] = useState<AdminAccount | null>(() => {
    const saved = safeSessionStorage.getItem('ishwari_current_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    if (safeSessionStorage.getItem('ishwari_admin_auth') === 'true') {
      return (adminAccounts && adminAccounts.length > 0 ? adminAccounts : initialAdminAccounts)[0];
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem('ishwari_admin_auth') === 'true';
  });
  const [username, setUsername] = useState<string>(() => {
    const saved = safeStorage.getItem('ishwari_saved_admin_username');
    if (saved && saved.toLowerCase() === 'admin') {
      safeStorage.removeItem('ishwari_saved_admin_username');
      return '';
    }
    return saved || '';
  });
  const [rememberUsername, setRememberUsername] = useState<boolean>(() => {
    return !!safeStorage.getItem('ishwari_saved_admin_username');
  });
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminNavTabId | string>(() => {
    try {
      const saved = localStorage.getItem('ishwari_admin_active_tab');
      if (saved) return saved;
    } catch {}
    return 'dashboard';
  });

  useEffect(() => {
    try {
      if (activeTab) {
        localStorage.setItem('ishwari_admin_active_tab', activeTab);
      }
    } catch {}
  }, [activeTab]);
  const [toastMessage, setToastMessage] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [apiErrorLogCount, setApiErrorLogCount] = useState<number>(() => apiClient.getRecentErrorLogs(10).length);

  useEffect(() => {
    return apiClient.onErrorLogsChange((logs) => {
      setApiErrorLogCount(logs.length);
    });
  }, []);

  const can = (perm: PermissionKey): boolean => {
    return hasPermission(currentAccount, perm);
  };

  const isSuperAdmin = currentAccount?.role === 'super_admin';
  const authorizedTabIds = React.useMemo(() => {
    const groups = buildAuthorizedNavigation(can, isSuperAdmin, {
      apiErrors: apiErrorLogCount > 0 ? apiErrorLogCount : undefined
    });
    return getAuthorizedTabIds(groups);
  }, [currentAccount, isSuperAdmin, apiErrorLogCount]);

  // UI Isolation Guard: If activeTab is unauthorized for the current admin, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && !authorizedTabIds.has(activeTab as any)) {
      setActiveTab('dashboard');
    }
  }, [isAuthenticated, activeTab, authorizedTabIds]);

  // Authoritative Server Session Verification on Mount:
  // Verifies the session against /api/auth/me using Bearer token or HttpOnly cookie.
  // Persists authentication across reloads, navigation, and new tabs.
  useEffect(() => {
    let isMounted = true;
    const verifyServerSession = async () => {
      try {
        const res = await apiClient.checkAuth();
        if (!isMounted) return;
        if (res.authenticated && res.account) {
          setIsAuthenticated(true);
          setCurrentAccount(res.account);
          safeSessionStorage.setItem('ishwari_admin_auth', 'true');
          safeSessionStorage.setItem('ishwari_current_account', JSON.stringify(res.account));
          acquireSessionLock(res.account, true);
        } else if (isAuthenticated && !apiClient.getToken()) {
          setIsAuthenticated(false);
          setCurrentAccount(null);
          safeSessionStorage.removeItem('ishwari_admin_auth');
          safeSessionStorage.removeItem('ishwari_current_account');
          releaseSessionLock();
        }
      } catch (err) {
        console.warn('Server session verification error:', err);
      }
    };

    const handlePageShow = async (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const checkedToken = apiClient.getToken();
      const res = await apiClient.checkAuth();
      if (
        !isMounted ||
        res.authenticated ||
        !res.invalid ||
        (checkedToken !== apiClient.getToken() && apiClient.getToken())
      ) return;

      setIsAuthenticated(false);
      setCurrentAccount(null);
      safeSessionStorage.removeItem('ishwari_admin_auth');
      safeSessionStorage.removeItem('ishwari_current_account');
      safeSessionStorage.removeItem('ishwari_my_session_id');
      releaseSessionLock();
      setAuthError(
        lang === 'np'
          ? 'प्रशासनिक सत्र लगआउट गरिएको छ। पुनः लगइन गर्नुहोस्।'
          : 'You left the admin panel. Please log in again.'
      );
    };

    verifyServerSession();
    window.addEventListener('pageshow', handlePageShow);
    return () => {
      isMounted = false;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // Security Lockout & Failed Attempts State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return Number(safeSessionStorage.getItem('ishwari_failed_attempts') || '0');
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return Number(safeSessionStorage.getItem('ishwari_lockout_until') || '0');
  });
  const [now, setNow] = useState<number>(Date.now());

  // Emergency PIN Modal (strictly requires Username + Master Key)
  const [showEmergencyPinModal, setShowEmergencyPinModal] = useState(false);
  const [emergencyUserInput, setEmergencyUserInput] = useState('');
  const [emergencyPinInput, setEmergencyPinInput] = useState('');
  const [emergencyPinError, setEmergencyPinError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const recoveryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const recoveryUserInputRef = useRef<HTMLInputElement | null>(null);

  const openEmergencyRecovery = () => {
    setShowEmergencyPinModal(true);
    setEmergencyPinError('');
    requestAnimationFrame(() => {
      recoveryUserInputRef.current?.focus();
    });
  };

  const closeEmergencyRecovery = () => {
    setShowEmergencyPinModal(false);
    setEmergencyUserInput('');
    setEmergencyPinInput('');
    setEmergencyPinError('');
    requestAnimationFrame(() => {
      recoveryTriggerRef.current?.focus();
    });
  };

  // Close Emergency Recovery Modal on Escape key
  useEffect(() => {
    if (!showEmergencyPinModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEmergencyRecovery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEmergencyPinModal]);

  // Single Active Session Lock Heartbeat & Multi-tab/device sync
  useEffect(() => {
    if (!isAuthenticated) return;
    refreshSessionHeartbeat();
    const interval = setInterval(() => {
      refreshSessionHeartbeat();
    }, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let refreshInProgress = false;
    const refreshSession = async () => {
      if (refreshInProgress) return;
      refreshInProgress = true;
      const result = await apiClient.refreshAuthSession();
      refreshInProgress = false;

      if (result.authenticated) {
        setSessionTimeLeft((securityConfig?.sessionTimeoutMinutes || 30) * 60);
      } else if (
        result.success &&
        result.expiredToken &&
        apiClient.getToken() === result.expiredToken
      ) {
        window.dispatchEvent(new CustomEvent('ishwari:session-expired', {
          detail: { message: 'Session expired. Please log in again.' }
        }));
      }
    };

    const interval = setInterval(() => {
      void refreshSession();
    }, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, securityConfig?.sessionTimeoutMinutes]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ishwari_server_token') {
        apiClient.setToken(e.newValue);
      }

      if (e.key === 'ishwari_active_session_lock' && !e.newValue && isAuthenticated) {
        apiClient.setToken(null);
        setIsAuthenticated(false);
        setCurrentAccount(null);
        safeSessionStorage.removeItem('ishwari_admin_auth');
        safeSessionStorage.removeItem('ishwari_current_account');
        safeSessionStorage.removeItem('ishwari_my_session_id');
        setAuthError(
          lang === 'np'
            ? 'प्रशासनिक सत्र लगआउट गरिएको छ।'
            : 'The administrative session was logged out.'
        );
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleSessionExpired = (e: any) => {
      apiClient.setToken(null);
      setIsAuthenticated(false);
      setCurrentAccount(null);
      safeSessionStorage.removeItem('ishwari_admin_auth');
      safeSessionStorage.removeItem('ishwari_current_account');
      safeSessionStorage.removeItem('ishwari_my_session_id');
      const msg = e?.detail?.message || (lang === 'np' ? 'सत्र समाप्त भयो। कृपया पुनः लगइन गर्नुहोस्।' : 'Session expired. Please log in again.');
      setAuthError(msg);
      showToast(msg);
    };
    window.addEventListener('ishwari:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ishwari:session-expired', handleSessionExpired);
    };
  }, [isAuthenticated, lang]);

  const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(
    (securityConfig?.sessionTimeoutMinutes || 30) * 60
  );

  // Display the configured session expiry; the server session is renewed while the panel stays open.
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      if (isAuthenticated) {
        setSessionTimeLeft((prev) => {
          return Math.max(0, prev - 1);
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  const isLockedOut = lockoutUntil > now;
  const lockoutSecondsRemaining = isLockedOut ? Math.ceil((lockoutUntil - now) / 1000) : 0;

  // Form states
  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...school });

  // Notice Form State
  const [noticeForm, setNoticeForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    category: Notice['category'];
    pinned: boolean;
    file_name: string;
    file_data?: string;
    file_size_kb?: number;
    description_en: string;
    description_np: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    category: 'academic',
    pinned: false,
    file_name: '',
    file_data: undefined,
    file_size_kb: undefined,
    description_en: '',
    description_np: '',
  });
  const [noticeFileError, setNoticeFileError] = useState<string>('');
  const noticeFileInputRef = useRef<HTMLInputElement>(null);

  // Staff Form State
  const [staffForm, setStaffForm] = useState<{
    id: number | null;
    name_en: string;
    name_np: string;
    role: StaffMember['role'];
    designation_en: string;
    designation_np: string;
    experience: string;
  }>({
    id: null,
    name_en: '',
    name_np: '',
    role: 'teacher',
    designation_en: '',
    designation_np: '',
    experience: '5 Years Experience',
  });

  // Academic Program Form State
  const [programForm, setProgramForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    level: string;
    duration: string;
    intake: number;
    desc_en: string;
    desc_np: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    level: 'Secondary / +2',
    duration: '2 Years',
    intake: 60,
    desc_en: '',
    desc_np: '',
  });

  // Facility Form State
  const [facilityForm, setFacilityForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    desc_en: string;
    desc_np: string;
    icon: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
    icon: '🏫',
  });

  // Document Form State
  const [documentForm, setDocumentForm] = useState<{
    id: number | null;
    title_en: string;
    title_np: string;
    type: string;
    size: string;
    date: string;
  }>({
    id: null,
    title_en: '',
    title_np: '',
    type: 'Official PDF',
    size: '1.5 MB',
    date: '2083-05-01',
  });

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isLockedOut) {
      setAuthError(
        t(
          `Security lockout active. Please wait ${lockoutSecondsRemaining}s or use Master Emergency PIN.`,
          `सुरक्षा लक सक्रिय छ। कृपया ${lockoutSecondsRemaining} सेकेन्ड पर्खनुहोस् वा मास्टर पिन प्रयोग गर्नुहोस्।`
        )
      );
      return;
    }

    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedUser) {
      setAuthError(t('Username or email is required.', 'प्रयोगकर्ता नाम वा इमेल आवश्यक छ।'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Call Authoritative Backend Authentication Service
      const authRes = await apiClient.login({
        username: trimmedUser,
        password: trimmedPass
      });

      if (authRes.isLocked) {
        const lockoutTime = Date.now() + (authRes.lockoutSeconds || 300) * 1000;
        setLockoutUntil(lockoutTime);
        safeSessionStorage.setItem('ishwari_lockout_until', String(lockoutTime));
        setAuthError(formatErrorMessage(authRes.error, t('Security lockout active.', 'सुरक्षा लक सक्रिय छ।')));
        return;
      }

      if (!authRes.success || !authRes.account) {
        const nextFailures = failedAttempts + 1;
        setFailedAttempts(nextFailures);
        safeSessionStorage.setItem('ishwari_failed_attempts', String(nextFailures));
        const errorMsg = formatErrorMessage(authRes.error, t('Invalid username or password.', 'अमान्य प्रयोगकर्ता नाम वा पासवर्ड।'));
        setAuthError(errorMsg);
        return;
      }

      const authenticatedAccount = authRes.account;

      // Claim session lock for this verified authenticated session
      acquireSessionLock(authenticatedAccount, true);

      setIsAuthenticated(true);
      setCurrentAccount(authenticatedAccount);
      safeSessionStorage.setItem('ishwari_admin_auth', 'true');
      safeSessionStorage.setItem('ishwari_current_account', JSON.stringify(authenticatedAccount));
      setAuthError('');
      setFailedAttempts(0);
      setLockoutUntil(0);
      safeSessionStorage.removeItem('ishwari_failed_attempts');
      safeSessionStorage.removeItem('ishwari_lockout_until');

      if (rememberUsername && trimmedUser) {
        safeStorage.setItem('ishwari_saved_admin_username', trimmedUser);
      } else {
        safeStorage.removeItem('ishwari_saved_admin_username');
      }

      setSessionTimeLeft((securityConfig?.sessionTimeoutMinutes || 30) * 60);

      onAddAuditLog({
        action: 'ADMIN_LOGIN_SUCCESS',
        actor: authenticatedAccount.username,
        role: authenticatedAccount.role,
        module: 'AUTH',
        status: 'success',
        result: 'success',
        details: `Successful authenticated session by ${authenticatedAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'} (${authenticatedAccount.fullName}).`,
      });

      showToast(
        t(
          `Welcome, ${authenticatedAccount.fullName}! Authenticated as ${authenticatedAccount.role === 'super_admin' ? 'Super Admin' : 'Admin'}.`,
          `स्वागत छ, ${authenticatedAccount.fullName}! (${authenticatedAccount.role === 'super_admin' ? 'सुपर प्रशासक' : 'प्रशासक'})`
        )
      );

      // Default active tab based on account role
      if (authenticatedAccount.role === 'super_admin') {
        setActiveTab('super_admin_control');
      } else if (hasPermission(authenticatedAccount, 'notice.view')) {
        setActiveTab('notices');
      } else if (hasPermission(authenticatedAccount, 'teacher.view')) {
        setActiveTab('staff');
      } else {
        setActiveTab('notices');
      }
    } catch (err: any) {
      setAuthError(formatErrorMessage(err, 'Login request error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmergencyPinUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecovering) return;

    const trimmedUser = emergencyUserInput.trim().toLowerCase();
    const pin = emergencyPinInput.trim();

    if (!trimmedUser) {
      setEmergencyPinError(
        t('Username is required for Master Key authentication.', 'मास्टर की प्रमाणीकरणका लागि प्रयोगकर्ता नाम आवश्यक छ।')
      );
      return;
    }

    if (!pin) {
      setEmergencyPinError(
        t('Master Key / PIN is required.', 'मास्टर की / आपतकालीन पिन आवश्यक छ।')
      );
      return;
    }

    if (pin.length !== 6) {
      setEmergencyPinError(
        t('Recovery PIN must be exactly 6 digits.', 'रिकभरी पिन ठ्याक्कै ६ अङ्कको हुनुपर्छ।')
      );
      return;
    }

    setIsRecovering(true);
    try {
      const authRes = await apiClient.login({
        username: trimmedUser,
        loginType: 'master_key',
        masterKey: pin
      });

      if (!authRes.success || !authRes.account) {
        setEmergencyPinError(
          formatErrorMessage(
            authRes.error,
            t('Invalid Master Recovery Key or account suspended.', 'गलत मास्टर रिकभरी पिन वा खाता निलम्बनमा छ।')
          )
        );
        return;
      }

      const matchingAccount = authRes.account;
      forceClearSessionLock();
      acquireSessionLock(matchingAccount);
      setIsAuthenticated(true);
      setCurrentAccount(matchingAccount);
      safeSessionStorage.setItem('ishwari_admin_auth', 'true');
      safeSessionStorage.setItem('ishwari_current_account', JSON.stringify(matchingAccount));
      setFailedAttempts(0);
      setLockoutUntil(0);
      safeSessionStorage.removeItem('ishwari_failed_attempts');
      safeSessionStorage.removeItem('ishwari_lockout_until');
      setShowEmergencyPinModal(false);
      setEmergencyUserInput('');
      setEmergencyPinInput('');
      setEmergencyPinError('');
      setAuthError('');
      setSessionTimeLeft((securityConfig?.sessionTimeoutMinutes || 30) * 60);

      onAddAuditLog({
        action: 'EMERGENCY_PIN_BYPASS',
        actor: matchingAccount.username,
        role: matchingAccount.role,
        module: 'AUTH',
        status: 'warning',
        result: 'success',
        details: `Account unlocked using verified Master Key for administrator "${matchingAccount.username}".`
      });

      showToast(t(`Master Key verified. Welcome, ${matchingAccount.fullName}.`, `मास्टर की प्रमाणित भयो। स्वागत छ, ${matchingAccount.fullName}।`));
    } catch (err: any) {
      setEmergencyPinError(formatErrorMessage(err, 'Emergency unlock failed'));
    } finally {
      setIsRecovering(false);
    }
  };

  const handleLockConsole = async () => {
    await apiClient.logout();
    releaseSessionLock();
    setIsAuthenticated(false);
    safeSessionStorage.removeItem('ishwari_admin_auth');
    safeSessionStorage.removeItem('ishwari_my_session_id');
    onAddAuditLog({
      action: 'ADMIN_CONSOLE_LOCKED',
      actor: currentAccount?.username || username,
      role: currentAccount?.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: 'Administrator manually locked active management session.'
    });
    showToast(t('Console locked. Re-authentication required.', 'कन्सोल सुरक्षित रूपमा लक गरियो।'));
  };

  const handleLogout = async () => {
    await apiClient.logout();
    releaseSessionLock();
    setIsAuthenticated(false);
    setCurrentAccount(null);
    safeSessionStorage.removeItem('ishwari_admin_auth');
    safeSessionStorage.removeItem('ishwari_current_account');
    safeSessionStorage.removeItem('ishwari_my_session_id');
    setPassword('');
    onAddAuditLog({
      action: 'ADMIN_LOGOUT',
      actor: currentAccount?.username || username,
      role: currentAccount?.role,
      module: 'AUTH',
      status: 'success',
      result: 'success',
      details: 'Administrator logged out of the session.'
    });
    showToast(t('Logged out successfully.', 'सफलतापूर्वक लगआउट भयो।'));
  };

  // 1. Save School Info
  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(schoolForm);
    showToast(t('Institutional profile updated successfully!', 'विद्यालयको प्रोफाइल सुरक्षित गरियो!'));
  };

  // 2. Notices CRUD
  const handleNoticePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoticeFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type: PDF only
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setNoticeFileError(
        t(
          'Invalid file type! Attachment file type: PDF only (.pdf).',
          'अमान्य फाइल प्रकार! केवल PDF (.pdf) फाइल मात्र अपलोड गर्न सकिन्छ।'
        )
      );
      if (e.target) e.target.value = '';
      return;
    }

    // Validate file size: must be <= 200 KB (204,800 bytes)
    const maxSizeBytes = 200 * 1024;
    const fileSizeKb = Math.round((file.size / 1024) * 10) / 10;
    if (file.size > maxSizeBytes) {
      setNoticeFileError(
        t(
          `File size exceeds limit! The PDF file must be ≤ 200 KB (selected: ${fileSizeKb} KB).`,
          `फाइल आकार बढी भयो! PDF फाइल २०० KB वा सोभन्दा कम हुनुपर्छ (छानिएको: ${fileSizeKb} KB)।`
        )
      );
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setNoticeForm(prev => ({
        ...prev,
        file_name: file.name,
        file_data: base64,
        file_size_kb: fileSizeKb,
      }));
      showToast(t(`PDF attached: ${file.name} (${fileSizeKb} KB)`, `PDF संलग्न गरियो: ${file.name} (${fileSizeKb} KB)`));
    };
    reader.onerror = () => {
      setNoticeFileError(t('Failed to read PDF file. Please try again.', 'फाइल पढ्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveNoticePdf = () => {
    setNoticeForm(prev => ({
      ...prev,
      file_name: '',
      file_data: undefined,
      file_size_kb: undefined,
    }));
    setNoticeFileError('');
    if (noticeFileInputRef.current) {
      noticeFileInputRef.current.value = '';
    }
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title_en) return;

    const attachmentName = noticeForm.file_name?.trim() || 'notice.pdf';

    if (noticeForm.id) {
      // Edit
      const updated = notices.map(n => n.id === noticeForm.id ? {
        ...n,
        title_en: noticeForm.title_en,
        title_np: noticeForm.title_np || noticeForm.title_en,
        category: noticeForm.category,
        pinned: noticeForm.pinned,
        file_name: attachmentName,
        file_data: noticeForm.file_data,
        file_size_kb: noticeForm.file_size_kb,
        description_en: noticeForm.description_en,
        description_np: noticeForm.description_np || noticeForm.description_en,
      } : n);
      onUpdateNotices(updated);
      showToast(t('Notice updated successfully!', 'सूचना अद्यावधिक गरियो!'));
    } else {
      // Create
      const newNotice: Notice = {
        id: Date.now(),
        title_en: noticeForm.title_en,
        title_np: noticeForm.title_np || noticeForm.title_en,
        date_en: 'Today',
        date_np: 'आज',
        category: noticeForm.category,
        pinned: noticeForm.pinned,
        file_name: attachmentName,
        file_data: noticeForm.file_data,
        file_size_kb: noticeForm.file_size_kb,
        description_en: noticeForm.description_en,
        description_np: noticeForm.description_np || noticeForm.description_en,
      };
      onUpdateNotices([newNotice, ...notices]);
      showToast(t('New notice published successfully!', 'नयाँ सूचना प्रकाशित गरियो!'));
    }

    setNoticeForm({
      id: null,
      title_en: '',
      title_np: '',
      category: 'academic',
      pinned: false,
      file_name: '',
      file_data: undefined,
      file_size_kb: undefined,
      description_en: '',
      description_np: '',
    });
    setNoticeFileError('');
    if (noticeFileInputRef.current) {
      noticeFileInputRef.current.value = '';
    }
  };

  const handleDeleteNotice = (id: number) => {
    if (confirm(t('Are you sure you want to delete this circular?', 'के तपाईं यो सूचना हटाउन निश्चित हुनुहुन्छ?'))) {
      onUpdateNotices(notices.filter(n => n.id !== id));
      showToast(t('Notice deleted.', 'सूचना हटाइयो।'));
    }
  };

  const handleTogglePinNotice = (id: number) => {
    onUpdateNotices(notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    showToast(t('Notice pin status updated.', 'पिन स्थिति परिवर्तन गरियो।'));
  };

  // 3. Staff CRUD
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name_en) return;

    if (staffForm.id) {
      const updated = staff.map(s => s.id === staffForm.id ? {
        ...s,
        name_en: staffForm.name_en,
        name_np: staffForm.name_np || staffForm.name_en,
        role: staffForm.role,
        designation_en: staffForm.designation_en,
        designation_np: staffForm.designation_np || staffForm.designation_en,
        experience: staffForm.experience,
      } : s);
      onUpdateStaff(updated);
      showToast(t('Faculty record updated.', 'शिक्षक विवरण अद्यावधिक गरियो।'));
    } else {
      const newStaff: StaffMember = {
        id: Date.now(),
        name_en: staffForm.name_en,
        name_np: staffForm.name_np || staffForm.name_en,
        role: staffForm.role,
        designation_en: staffForm.designation_en,
        designation_np: staffForm.designation_np || staffForm.designation_en,
        experience: staffForm.experience,
      };
      onUpdateStaff([...staff, newStaff]);
      showToast(t('New staff member added.', 'नयाँ शिक्षक/कर्मचारी थपियो।'));
    }

    setStaffForm({
      id: null,
      name_en: '',
      name_np: '',
      role: 'teacher',
      designation_en: '',
      designation_np: '',
      experience: '5 Years Experience',
    });
  };

  const handleDeleteStaff = (id: number) => {
    if (confirm(t('Are you sure you want to remove this staff member?', 'के तपाईं यो विवरण हटाउन चाहनुहुन्छ?'))) {
      onUpdateStaff(staff.filter(s => s.id !== id));
      showToast(t('Staff member removed.', 'विवरण हटाइयो।'));
    }
  };

  // 4. Academic Programs CRUD
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title_en) return;

    if (programForm.id) {
      const updated = programs.map(p => p.id === programForm.id ? {
        ...p,
        title_en: programForm.title_en,
        title_np: programForm.title_np || programForm.title_en,
        level: programForm.level,
        duration: programForm.duration,
        intake: Number(programForm.intake),
        desc_en: programForm.desc_en,
        desc_np: programForm.desc_np || programForm.desc_en,
      } : p);
      onUpdatePrograms(updated);
      showToast(t('Program updated successfully.', 'शैक्षिक कार्यक्रम अद्यावधिक गरियो।'));
    } else {
      const newProg: AcademicProgram = {
        id: Date.now(),
        title_en: programForm.title_en,
        title_np: programForm.title_np || programForm.title_en,
        level: programForm.level,
        duration: programForm.duration,
        intake: Number(programForm.intake),
        desc_en: programForm.desc_en,
        desc_np: programForm.desc_np || programForm.desc_en,
      };
      onUpdatePrograms([...programs, newProg]);
      showToast(t('New academic program added.', 'नयाँ शैक्षिक कार्यक्रम थपियो।'));
    }

    setProgramForm({
      id: null,
      title_en: '',
      title_np: '',
      level: 'Secondary / +2',
      duration: '2 Years',
      intake: 60,
      desc_en: '',
      desc_np: '',
    });
  };

  const handleDeleteProgram = (id: number) => {
    if (confirm(t('Delete this academic program?', 'के यो शैक्षिक कार्यक्रम हटाउने?'))) {
      onUpdatePrograms(programs.filter(p => p.id !== id));
      showToast(t('Program deleted.', 'कार्यक्रम हटाइयो।'));
    }
  };

  // 5. Facilities CRUD
  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.title_en) return;

    if (facilityForm.id) {
      const updated = facilities.map(f => f.id === facilityForm.id ? {
        ...f,
        title_en: facilityForm.title_en,
        title_np: facilityForm.title_np || facilityForm.title_en,
        desc_en: facilityForm.desc_en,
        desc_np: facilityForm.desc_np || facilityForm.desc_en,
        icon: facilityForm.icon,
      } : f);
      onUpdateFacilities(updated);
      showToast(t('Facility updated.', 'पूर्वाधार विवरण अद्यावधिक गरियो।'));
    } else {
      const newFac: Facility = {
        id: Date.now(),
        title_en: facilityForm.title_en,
        title_np: facilityForm.title_np || facilityForm.title_en,
        desc_en: facilityForm.desc_en,
        desc_np: facilityForm.desc_np || facilityForm.desc_en,
        icon: facilityForm.icon,
      };
      onUpdateFacilities([...facilities, newFac]);
      showToast(t('New facility added.', 'नयाँ पूर्वाधार थपियो।'));
    }

    setFacilityForm({
      id: null,
      title_en: '',
      title_np: '',
      desc_en: '',
      desc_np: '',
      icon: '🏫',
    });
  };

  const handleDeleteFacility = (id: number) => {
    if (confirm(t('Delete this facility?', 'पूर्वाधार हटाउने?'))) {
      onUpdateFacilities(facilities.filter(f => f.id !== id));
      showToast(t('Facility deleted.', 'पूर्वाधार हटाइयो।'));
    }
  };

  // 6. Documents CRUD
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentForm.title_en) return;

    if (documentForm.id) {
      const updated = documents.map(d => d.id === documentForm.id ? {
        ...d,
        title_en: documentForm.title_en,
        title_np: documentForm.title_np || documentForm.title_en,
        type: documentForm.type,
        size: documentForm.size,
        date: documentForm.date,
      } : d);
      onUpdateDocuments(updated);
      showToast(t('Document updated.', 'दस्तावेज अद्यावधिक गरियो।'));
    } else {
      const newDoc: DocumentItem = {
        id: Date.now(),
        title_en: documentForm.title_en,
        title_np: documentForm.title_np || documentForm.title_en,
        type: documentForm.type,
        size: documentForm.size,
        date: documentForm.date,
      };
      onUpdateDocuments([...documents, newDoc]);
      showToast(t('New downloadable document added.', 'नयाँ दस्तावेज थपियो।'));
    }

    setDocumentForm({
      id: null,
      title_en: '',
      title_np: '',
      type: 'Official PDF',
      size: '1.5 MB',
      date: '2083-05-01',
    });
  };

  const handleDeleteDocument = (id: number) => {
    if (confirm(t('Delete this document?', 'दस्तावेज हटाउने?'))) {
      onUpdateDocuments(documents.filter(d => d.id !== id));
      showToast(t('Document removed.', 'दस्तावेज हटाइयो।'));
    }
  };

  // 7. Messages Management
  const handleUpdateMessageStatus = (id: number, status: ContactMessage['status']) => {
    onUpdateMessages(messages.map(m => m.id === id ? { ...m, status } : m));
    showToast(t(`Inquiry status updated to ${status}.`, 'सम्पर्क सन्देशको स्थिति परिवर्तन गरियो।'));
  };

  const handleDeleteMessage = (id: number) => {
    if (confirm(t('Delete this inquiry message?', 'के यो सन्देश मेटाउने?'))) {
      onUpdateMessages(messages.filter(m => m.id !== id));
      showToast(t('Message deleted.', 'सन्देश हटाइयो।'));
    }
  };

  // ----------------------------------------------------
  // RENDER: LOGIN GATE IF NOT AUTHENTICATED
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 relative selection:bg-[#1E40AF] selection:text-white transition-colors duration-200">
        {/* Emergency Master Recovery PIN Modal (Hidden until triggered) */}
        {showEmergencyPinModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="recovery-dialog-title"
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeEmergencyRecovery();
              }
            }}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5 sm:p-6 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                    <KeyRound className="w-5 h-5 shrink-0" strokeWidth={2} />
                    <h2 id="recovery-dialog-title" className="text-sm font-bold text-slate-900 dark:text-white">
                      Emergency Master Recovery PIN
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeEmergencyRecovery}
                    aria-label="Close dialog"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Enter the 6-digit administrative master recovery PIN configured in institutional security settings.
                </p>
              </div>

              <form onSubmit={handleEmergencyPinUnlock} className="space-y-3.5">
                {emergencyPinError && (
                  <div
                    role="alert"
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" strokeWidth={2} />
                    <span className="flex-1">{formatErrorMessage(emergencyPinError)}</span>
                    <button
                      type="button"
                      onClick={() => setEmergencyPinError('')}
                      className="p-0.5 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="recovery-username-input"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Admin Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      ref={recoveryUserInputRef}
                      id="recovery-username-input"
                      type="text"
                      value={emergencyUserInput}
                      onChange={(e) => {
                        setEmergencyUserInput(e.target.value);
                        if (emergencyPinError) setEmergencyPinError('');
                      }}
                      placeholder="(username)"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck="false"
                      disabled={isRecovering}
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs font-sans focus:outline-hidden focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="recovery-pin-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Master Key (6-Digit Recovery PIN)
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {emergencyPinInput.length}/6
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="recovery-pin-input"
                      type="password"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={emergencyPinInput}
                      onChange={(e) => {
                        if (emergencyPinError) setEmergencyPinError('');
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setEmergencyPinInput(val);
                      }}
                      placeholder="(••••••)"
                      autoComplete="off"
                      disabled={isRecovering}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center text-lg font-mono tracking-widest focus:outline-hidden focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all disabled:opacity-60"
                      required
                    />
                  </div>
                  {/* Interactive PIN progress dots */}
                  <div className="flex items-center justify-center gap-2 pt-1" aria-hidden="true">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all duration-150 ${
                          emergencyPinInput.length > idx
                            ? 'bg-[#1E40AF] scale-110 shadow-xs'
                            : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEmergencyRecovery}
                    disabled={isRecovering}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRecovering || emergencyPinInput.length !== 6 || !emergencyUserInput.trim()}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E40AF] hover:bg-[#1D4ED8] active:bg-[#1E3A8A] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRecovering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" strokeWidth={2} />
                        <span>Verify & Unlock</span>
                      </>
                    ) : (
                      <span>Verify & Unlock</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Login Content Card */}
        <main className="relative z-10 w-full max-w-[420px] my-auto">
          <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-none p-6 sm:p-8 space-y-6">
            {/* Crest / Insignia & Portal Title */}
            <div className="text-center space-y-4">
              {/* Crest / Insignia */}
              {school.logo_url && school.logo_url.trim().length > 0 ? (
                <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs select-none">
                  <img
                    src={school.logo_url}
                    alt={school.name_en || 'Ishwari Secondary School'}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-linear-to-br from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] p-2.5 flex flex-col items-center justify-center text-white mx-auto shadow-md border-2 border-amber-400/30 select-none">
                  <span className="font-serif font-black text-2xl sm:text-3xl text-amber-300 leading-none">ई</span>
                  <span className="text-[9px] font-mono tracking-widest text-blue-100 font-bold uppercase mt-0.5">२०३५</span>
                </div>
              )}

              {/* Portal Title */}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                Ishwari CMS Portal
              </h1>
            </div>

            {/* Lockout Warning State */}
            {isLockedOut ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-3 text-left">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" strokeWidth={2} />
                  <span>Account Security Lockout Active</span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">
                  Exceeded maximum login attempts ({securityConfig?.lockoutThreshold || 5}). Console locked for {lockoutSecondsRemaining} seconds.
                </p>
                <button
                  type="button"
                  onClick={openEmergencyRecovery}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Emergency Master Recovery PIN</span>
                </button>
              </div>
            ) : (
              <form
                action="javascript:void(0);"
                method="POST"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLogin(e);
                }}
                className="space-y-4 text-left"
                noValidate
              >
                {authError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 leading-relaxed"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" strokeWidth={2} />
                    <span className="flex-1">{formatErrorMessage(authError)}</span>
                    <button
                      type="button"
                      onClick={() => setAuthError('')}
                      className="p-0.5 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      aria-label="Dismiss error"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                )}

                {/* Username Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-username"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Username
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      id="admin-username"
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      placeholder="(username)"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      disabled={isSubmitting}
                      className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-sans focus:outline-hidden focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    />
                    {username.length > 0 && !isSubmitting && (
                      <button
                        type="button"
                        onClick={() => {
                          setUsername('');
                          if (authError) setAuthError('');
                        }}
                        aria-label="Clear username"
                        className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) setAuthError('');
                      }}
                      onKeyUp={(e) => {
                        if (e.getModifierState) {
                          setIsCapsLockOn(e.getModifierState('CapsLock'));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.getModifierState) {
                          setIsCapsLockOn(e.getModifierState('CapsLock'));
                        }
                      }}
                      placeholder="(password)"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-sans focus:outline-hidden focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]/25 cursor-pointer transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {isCapsLockOn && (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                      <span>{t('Caps Lock is ON', 'क्याप्स लक अन छ')}</span>
                    </div>
                  )}
                </div>

                {/* Remember Username */}
                <div className="flex items-center text-xs pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberUsername}
                      onChange={(e) => setRememberUsername(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#1E40AF] focus:ring-[#1E40AF] focus:ring-offset-0 cursor-pointer accent-[#1E40AF]"
                    />
                    <span>{t('Remember username', 'प्रयोगकर्ता नाम सम्झनुहोस्')}</span>
                  </label>
                </div>

                {/* Login Button */}
                <button
                  id="admin-login-submit-btn"
                  type="submit"
                  disabled={isSubmitting || isLockedOut}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogin(e);
                  }}
                  className="w-full h-11 rounded-xl font-bold text-sm bg-[#1E40AF] hover:bg-[#1D4ED8] active:bg-[#1E3A8A] text-white shadow-md shadow-blue-900/10 focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={2} aria-hidden="true" />
                      <span>{t('Authenticating Session...', 'सत्र प्रमाणीकरण हुँदैछ...')}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" strokeWidth={2} />
                      <span>Login</span>
                    </>
                  )}
                </button>

                {/* Secondary Actions: Emergency Master Recovery PIN & Back to Public Portal */}
                <div className="pt-2 flex flex-col items-center gap-2.5">
                  <button
                    id="admin-emergency-recovery-trigger"
                    ref={recoveryTriggerRef}
                    type="button"
                    onClick={openEmergencyRecovery}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#1E40AF] dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer hover:underline focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]/20 rounded-md px-2 py-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>Emergency Master Recovery PIN</span>
                  </button>

                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#1E40AF] dark:text-slate-400 dark:hover:text-blue-400 transition-colors cursor-pointer hover:underline focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]/20 rounded-md px-2 py-1 group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
                    <span>Back to Public Portal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: AUTHENTICATED FULL CRUD DASHBOARD
  // ----------------------------------------------------
  const adminNavTabs = [
    // 1. Super Admin Master Control
    ...(currentAccount?.role === 'super_admin' ? [
      {
        id: 'super_admin_control',
        labelEn: 'Super Admin Control',
        labelNp: 'सुपर प्रशासक नियन्त्रण',
        icon: SlidersHorizontal,
      }
    ] : []),

    // 2. RBAC Management
    ...(currentAccount?.role === 'super_admin' || can('admin.view') ? [
      {
        id: 'rbac_admin',
        labelEn: `RBAC & Admins (${effectiveAccounts.length})`,
        labelNp: `प्रशासक खाताहरू (${effectiveAccounts.length})`,
        icon: ShieldCheck,
      }
    ] : []),

    ...(currentAccount?.role === 'super_admin' || can('settings.view') ? [
      { id: 'customizer', labelEn: 'Site Layout & Content', labelNp: 'वेबसाइट रूपरेखा तथा सामग्री', icon: Layout },
      { id: 'profile', labelEn: 'Institutional Info', labelNp: 'संस्थागत विवरण', icon: Building2 },
      { id: 'principal', labelEn: "Principal's Desk", labelNp: 'प्रअको सन्देश', icon: Quote },
    ] : []),

    ...(can('notice.view') ? [
      { id: 'notices', labelEn: `Notices (${notices.length})`, labelNp: `सूचनाहरू (${notices.length})`, icon: Bell },
    ] : []),

    ...(can('teacher.view') || can('staff.view') ? [
      { id: 'staff', labelEn: `Faculty (${staff.length})`, labelNp: `शिक्षक/कर्मचारी (${staff.length})`, icon: Users },
    ] : []),

    ...(can('program.view') ? [
      { id: 'academics', labelEn: `Programs (${programs.length})`, labelNp: `शैक्षिक कार्यक्रम (${programs.length})`, icon: BookOpen },
    ] : []),

    ...(can('facility.view') ? [
      { id: 'facilities', labelEn: `Facilities (${facilities.length})`, labelNp: `पूर्वाधार (${facilities.length})`, icon: Building2 },
    ] : []),

    ...(can('event.view') || can('achievement.view') ? [
      { id: 'events_extra', labelEn: `Events & History (${events.length + achievements.length})`, labelNp: `कार्यक्रम तथा इतिहास`, icon: CalendarDays },
    ] : []),

    ...(can('gallery.view') ? [
      { id: 'gallery', labelEn: `Photo Gallery (${gallery.length})`, labelNp: `फोटो ग्यालरी (${gallery.length})`, icon: Image },
    ] : []),

    ...(can('document.view') ? [
      { id: 'documents', labelEn: `Documents (${documents.length})`, labelNp: `दस्तावेज (${documents.length})`, icon: FolderDown },
    ] : []),

    ...(can('message.view') ? [
      { id: 'messages', labelEn: `Inquiries (${messages.length})`, labelNp: `सन्देश (${messages.length})`, icon: MessageSquare, badge: messages.filter(m => m.status === 'new').length },
    ] : []),

    ...(currentAccount?.role === 'super_admin' ? [
      { id: 'security', labelEn: 'Security & Stealth Link', labelNp: 'सुरक्षा तथा गोप्य मार्ग', icon: ShieldAlert },
      { id: 'system', labelEn: 'Database Backup & Restore', labelNp: 'डाटाबेस ब्याकअप तथा रिस्टोर', icon: Database },
    ] : []),
  ];

  const currentTab = adminNavTabs.find(t => t.id === activeTab) || adminNavTabs[0];
  const roleTitle = currentAccount?.role === 'super_admin' ? 'Superadmin' : 'Admin Panel';

  // Standardized institutional page headers for all sections
  const getPageHeaderProps = () => {
    // 1. Dashboard
    if (activeTab === 'dashboard' || activeTab === 'super_admin_control') {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन पोर्टल') },
          { label: t('Dashboard', 'ड्यासबोर्ड') }
        ],
        title: t('School Administration Dashboard', 'विद्यालय प्रशासनिक ड्यासबोर्ड'),
        subtitle: t(
          'Central administrative overview of portal operations, published notices, faculty records, and incoming inquiries.',
          'पोर्टल सञ्चालन, प्रकाशित सूचनाहरू, शिक्षक विवरण र प्राप्त सोधपुछको केन्द्रीय प्रशासनिक विहङ्गावलोकन।'
        ),
        icon: LayoutDashboard,
        actions: [
          {
            label: t('New Notice', 'नयाँ सूचना'),
            icon: Bell,
            onClick: () => setActiveTab('content_notices'),
            variant: 'primary' as const
          },
          {
            label: t('Add Staff', 'कर्मचारी थप'),
            icon: Users,
            onClick: () => setActiveTab('gov_staff'),
            variant: 'secondary' as const
          },
          {
            label: t('Public Site', 'सार्वजनिक साइट'),
            icon: ExternalLink,
            onClick: onNavigateHome,
            variant: 'secondary' as const
          }
        ]
      };
    }

    // 2. Website Group
    if (
      activeTab === 'website_identity' ||
      activeTab === 'website_homepage' ||
      activeTab === 'website_weather' ||
      activeTab === 'website_header' ||
      activeTab === 'website_navigation' ||
      activeTab === 'website_footer'
    ) {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('Website', 'वेबसाइट') },
          {
            label:
              activeTab === 'website_identity' ? t('Site Identity', 'पहिचान') :
              activeTab === 'website_homepage' ? t('Homepage', 'गृहपृष्ठ') :
              activeTab === 'website_weather' ? t('Campus Weather', 'क्याम्पस मौसम') :
              activeTab === 'website_header' ? t('Header & Ticker', 'हेडर') :
              activeTab === 'website_navigation' ? t('Navigation', 'नेभिगेसन') :
              t('Footer', 'फुटर')
          }
        ],
        title: t('Website Management', 'वेबसाइट व्यवस्थापन'),
        subtitle: t(
          'Configure public school branding, homepage layout, campus weather widgets, announcement tickers, navigation routes, and institutional footer.',
          'सार्वजनिक वेबसाइटको पहिचान, गृहपृष्ठ, मौसम विजेट, सूचना पट्टी, नेभिगेसन मेनु र फुटर व्यवस्थापन गर्नुहोस्।'
        ),
        icon: Globe,
        tabs: [
          { id: 'website_identity', label: t('Site Identity', 'पहिचान तथा लोगो') },
          { id: 'website_homepage', label: t('Homepage Layout', 'गृहपृष्ठ बनावट') },
          { id: 'website_weather', label: t('Campus Weather', 'क्याम्पस मौसम विजेट') },
          { id: 'website_header', label: t('Header / Top Bar', 'हेडर / शीर्ष पट्टी') },
          { id: 'website_navigation', label: t('Navigation Menu', 'नेभिगेसन मेनु') },
          { id: 'website_footer', label: t('Footer', 'फुटर सेटिङ') }
        ].filter(tab => authorizedTabIds.has(tab.id as AdminNavTabId)),
        activeTabId: activeTab,
        onTabChange: (tabId: string) => setActiveTab(tabId as any)
      };
    }

    // 3. Content Group
    if (
      activeTab === 'content_health' ||
      activeTab === 'content_about' ||
      activeTab === 'content_notices' ||
      activeTab === 'content_career' ||
      activeTab === 'content_documents' ||
      activeTab === 'content_curriculum' ||
      activeTab === 'content_events' ||
      activeTab === 'content_achievements' ||
      activeTab === 'content_history' ||
      activeTab === 'content_faq'
    ) {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('Content', 'सामग्री') },
          {
            label:
              activeTab === 'content_health' ? t('Content Health', 'सामग्री स्वास्थ्य') :
              activeTab === 'content_notices' ? t('Notices', 'सूचनाहरू') :
              activeTab === 'content_career' ? t('Career & Vacancies', 'रोजगारी तथा विज्ञापन') :
              activeTab === 'content_documents' ? t('Documents', 'दस्तावेज') :
              activeTab === 'content_curriculum' ? t('Curriculum Guidelines', 'पाठ्यक्रम निर्देशिका') :
              activeTab === 'content_about' ? t('About & Programs', 'परिचय') :
              activeTab === 'content_events' ? t('Events & Routines', 'कार्यक्रम') :
              activeTab === 'content_achievements' ? t('Honors & Awards', 'उपलब्धि') :
              activeTab === 'content_faq' ? t('FAQs & Q&A', 'प्रायः सोधिने प्रश्नहरू') :
              t('History', 'इतिहास')
          }
        ],
        title: activeTab === 'content_health'
          ? t('Content Health Dashboard', 'सामग्री स्वास्थ्य ड्यासबोर्ड')
          : activeTab === 'content_curriculum'
          ? t('Curriculum Guidelines', 'पाठ्यक्रम निर्देशिका')
          : activeTab === 'content_career'
          ? t('Career & Staff Recruitment', 'रोजगारी तथा पदपूर्ति')
          : activeTab === 'content_faq'
          ? t('Frequently Asked Questions (FAQ)', 'प्रायः सोधिने प्रश्नहरू (FAQ)')
          : t('Content & Publications', 'सामग्री तथा प्रकाशन'),
        subtitle: activeTab === 'content_health'
          ? t(
              'Automated institutional readiness audit, missing asset verification, deadline tracking, and integrity checks.',
              'संस्थागत तयारी, सम्पत्ति परीक्षण, म्याद ट्र्याकिङ तथा सत्यता स्वचालित जाँच।'
            )
          : activeTab === 'content_curriculum'
          ? t(
              'Manage curriculum guidelines and useful PDF learning resources for students.',
              'विद्यार्थीहरूका लागि पाठ्यक्रम निर्देशिका र उपयोगी PDF अध्ययन सामग्री व्यवस्थापन गर्नुहोस्।'
            )
          : activeTab === 'content_career'
          ? t(
              'Publish, manage, and track job vacancies, teacher recruitments, and administrative hiring.',
              'शिक्षक, कर्मचारी तथा प्रशासनिक खुला पदपूर्ति विज्ञापन व्यवस्थापन गर्नुहोस्।'
            )
          : activeTab === 'content_faq'
          ? t(
              'Manage institutional questions and answers for students, parents, and community members.',
              'विद्यार्थी तथा अभिभावकका लागि संस्थागत जिज्ञासा र समाधानहरू व्यवस्थापन गर्नुहोस्।'
            )
          : t(
            'Manage school circulars, downloadable documents, academic program details, event routines, and historical milestones.',
            'विद्यालयका सूचनाहरू, डाउनलोड फारम, शैक्षिक कार्यक्रम, क्यालेन्डर तालिका र इतिहास व्यवस्थापन गर्नुहोस्।'
          ),
        icon: activeTab === 'content_health' ? Activity : activeTab === 'content_curriculum' ? BookMarked : activeTab === 'content_career' ? Briefcase : activeTab === 'content_faq' ? HelpCircle : FileText,
        tabs: [
          { id: 'content_health', label: t('Content Health', 'सामग्री स्वास्थ्य') },
          { id: 'content_about', label: t('About', 'परिचय') },
          { id: 'content_notices', label: t('Notices', 'सूचनाहरू'), count: notices.length },
          { id: 'content_career', label: t('Career & Vacancies', 'रोजगारी तथा विज्ञापन'), count: (vacancies || []).length },
          { id: 'content_documents', label: t('Documents', 'दस्तावेज'), count: documents.length },
          { id: 'content_curriculum', label: t('Curriculum Guidelines', 'पाठ्यक्रम निर्देशिका'), count: curriculumGuidelines.length },
          { id: 'content_events', label: t('Events & Routines', 'कार्यक्रम तथा तालिका'), count: events.length },
          { id: 'content_achievements', label: t('Honors & Achievements', 'उपलब्धि तथा पुरस्कार'), count: achievements.length },
          { id: 'content_history', label: t('History & Milestones', 'इतिहास तथा कोसेढुङ्गा'), count: history.length },
          { id: 'content_faq', label: t('FAQs & Q&A', 'प्रायः सोधिने प्रश्नहरू'), count: (faqs || []).length }
        ].filter(tab => authorizedTabIds.has(tab.id as AdminNavTabId)),
        activeTabId: activeTab,
        onTabChange: (tabId: string) => setActiveTab(tabId as any)
      };
    }

    // 4. Governance Group
    if (
      activeTab === 'gov_leadership' ||
      activeTab === 'gov_smc' ||
      activeTab === 'gov_staff' ||
      activeTab === 'gov_chairman' ||
      activeTab === 'gov_principal'
    ) {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('Governance', 'प्रशासन तथा नेतृत्व') },
          {
            label:
              activeTab === 'gov_principal' ? t('Principal', 'प्रधानाध्यापक') :
              activeTab === 'gov_smc' || activeTab === 'gov_chairman' || activeTab === 'gov_leadership' ? t('SMC / Chairman', 'वि.व्य.स. / अध्यक्ष') :
              t('Teachers & Staff', 'शिक्षक तथा कर्मचारी')
          }
        ],
        title: t('Governance & Personnel', 'प्रशासन तथा कर्मचारी'),
        subtitle: t(
          'Institutional directory of the School Management Committee (SMC), executive leadership, and faculty staff members.',
          'विद्यालय व्यवस्थापन समिति, नेतृत्व (अध्यक्ष र प्र.अ.) र शिक्षक तथा कर्मचारीहरूको विवरण।'
        ),
        icon: Users,
        tabs: [
          { id: 'gov_smc', label: t('SMC / Chairman', 'वि.व्य.स. / अध्यक्ष') },
          { id: 'gov_principal', label: t('Principal', 'प्रधानाध्यापक') },
          { id: 'gov_staff', label: t('Teachers & Staff', 'शिक्षक तथा कर्मचारी'), count: staff.length }
        ].filter(tab => authorizedTabIds.has(tab.id as AdminNavTabId)),
        activeTabId: activeTab === 'gov_chairman' || activeTab === 'gov_leadership' ? 'gov_smc' : activeTab,
        onTabChange: (tabId: string) => setActiveTab(tabId as any)
      };
    }

    // 5. Media Group
    if (activeTab === 'media_gallery') {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('Media', 'मिडिया') },
          { label: t('Photo Gallery', 'फोटो ग्यालरी') }
        ],
        title: t('Campus Photo Gallery', 'क्याम्पस फोटो ग्यालरी'),
        subtitle: t(
          'Upload, organize, and categorize high-resolution campus photography, academic facilities, and annual day events.',
          'विद्यालयका भवन, प्रयोगशाला, खेलकुद तथा विभिन्न कार्यक्रमका तस्वीरहरू व्यवस्थापन गर्नुहोस्।'
        ),
        icon: Image
      };
    }

    // 6. Communication Group
    if (activeTab === 'comm_contact') {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('Communication', 'सञ्चार') },
          { label: t('Contact Inquiries', 'सम्पर्क सोधपुछ') }
        ],
        title: t('Contact & Inquiries Inbox', 'सम्पर्क तथा सोधपुछ इनबक्स'),
        subtitle: t(
          'Review inquiries, parent messages, and admission queries submitted through the public school portal.',
          'सार्वजनिक वेबसाइटबाट अभिभावक तथा विद्यार्थीहरूले पठाएका सोधपुछ र सन्देशहरू समीक्षा गर्नुहोस्।'
        ),
        icon: MessageSquare
      };
    }

    // 7. System Group
    if (
      activeTab === 'system' ||
      activeTab === 'sys_admins' ||
      activeTab === 'sys_roles' ||
      activeTab === 'sys_settings' ||
      activeTab === 'sys_audit' ||
      activeTab === 'sys_api_errors' ||
      activeTab === 'sys_security' ||
      activeTab === 'sys_backup'
    ) {
      return {
        breadcrumbs: [
          { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
          { label: t('System', 'प्रणाली') },
          {
            label:
              activeTab === 'system' ? t('System Hub', 'केन्द्र') :
              activeTab === 'sys_admins' ? t('Administrators', 'प्रशासकहरू') :
              activeTab === 'sys_roles' ? t('Roles & Permissions', 'भूमिका र अनुमति') :
              activeTab === 'sys_settings' || activeTab === 'sys_security' || activeTab === 'sys_backup' ? t('Site Settings', 'सेटिङ') :
              activeTab === 'sys_api_errors' ? t('API Error Log', 'एपीआई त्रुटि लग') :
              t('Audit Logs', 'अडिट लग')
          }
        ],
        title: t('System Administration & Security', 'प्रणाली तथा सुरक्षा व्यवस्थापन'),
        subtitle: t(
          'Manage administrator accounts, granular role permissions, security policies, backup/restore, activity audit logs, and API error diagnostics.',
          'प्रशासक खाता, भूमिका अनुमति, सुरक्षा नीति, ब्याकअप तथा रिस्टोर, अडिट लग र एपीआई त्रुटि लग व्यवस्थापन गर्नुहोस्।'
        ),
        icon: ShieldCheck,
        tabs: [
          { id: 'sys_admins', label: t('Administrators', 'प्रशासकहरू'), count: effectiveAccounts.length },
          { id: 'sys_roles', label: t('Roles & Permissions', 'भूमिका र अनुमति') },
          { id: 'sys_settings', label: t('Site Settings', 'साइट सेटिङ') },
          { id: 'sys_audit', label: t('Audit Logs', 'सुरक्षा अडिट लग'), count: auditLogs.length },
          { id: 'sys_api_errors', label: t('API Error Log', 'एपीआई त्रुटि लग'), count: apiErrorLogCount }
        ].filter(tab => authorizedTabIds.has(tab.id as AdminNavTabId)),
        activeTabId: activeTab === 'system' ? 'sys_admins' : activeTab === 'sys_security' || activeTab === 'sys_backup' ? 'sys_settings' : activeTab,
        onTabChange: (tabId: string) => setActiveTab(tabId as any)
      };
    }

    // 8. Account Group
    return {
      breadcrumbs: [
        { label: t('Admin Portal', 'प्रशासन'), onClick: () => setActiveTab('dashboard') },
        { label: t('Account', 'खाता') },
        { label: activeTab === 'account_security' ? t('Account Security', 'खाता सुरक्षा') : t('Profile & Security', 'प्रोफाइल र सुरक्षा') }
      ],
      title: activeTab === 'account_security' ? t('Account Security & Password', 'खाता सुरक्षा तथा पासवर्ड') : t('Administrator Profile & Security', 'प्रशासक प्रोफाइल तथा सुरक्षा'),
      subtitle: t(
        'Manage your account credentials, password updates, active session timeout, and institutional profile coordinates.',
        'तपाईंको पासवर्ड, सुरक्षा विवरण, सक्रिय सत्र समय र संस्थागत सम्पर्क ठेगाना व्यवस्थापन गर्नुहोस्।'
      ),
      icon: Users,
      tabs: [
        { id: 'account_profile', label: t('My Profile', 'मेरो प्रोफाइल') },
        { id: 'account_security', label: t('Account Security', 'खाता सुरक्षा') }
      ],
      activeTabId: activeTab === 'account_security' ? 'account_security' : 'account_profile',
      onTabChange: (tabId: string) => setActiveTab(tabId as any)
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#1E40AF] shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-[#1E40AF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR NAVIGATION */}
      <AdminSidebar
        lang={lang}
        currentRole={currentAccount?.role || 'admin'}
        currentUsername={currentAccount?.username || username}
        activeTab={activeTab as AdminNavTabId}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        unreadMessagesCount={messages.filter(m => m.status === 'new').length}
        noticesCount={notices.length}
        badgeCounts={{
          notices: notices.length,
          career: (vacancies || []).length,
          documents: documents.length,
          curriculum: curriculumGuidelines.length,
          staff: staff.length,
          messages: messages.filter(m => m.status === 'new').length,
          admins: effectiveAccounts.length,
          apiErrors: apiErrorLogCount > 0 ? apiErrorLogCount : undefined
        }}
        can={can}
        onNavigateHome={onNavigateHome}
        onLogout={handleLogout}
        onLockConsole={handleLockConsole}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Simple top header bar */}
        <AdminHeader
          lang={lang}
          currentRole={currentAccount?.role || 'admin'}
          currentUsername={currentAccount?.username || username}
          activeTab={activeTab as AdminNavTabId}
          sessionTimeLeft={sessionTimeLeft}
          authorizedTabIds={authorizedTabIds as Set<string>}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onToggleLang={onToggleLang}
          onNavigateHome={onNavigateHome}
          onLogout={handleLogout}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
        />

        {/* Tab Content Canvas */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Standardized Institutional Page Header */}
          <AdminPageHeader {...getPageHeaderProps()} />

      {/* 1. DASHBOARD */}
      {(activeTab === 'dashboard' || activeTab === 'super_admin_control') && (
        <AdminDashboardTab
          lang={lang}
          currentRole={currentAccount?.role || 'admin'}
          currentUsername={currentAccount?.username || username}
          school={school}
          notices={notices}
          documents={documents}
          staff={staff}
          messages={messages}
          gallery={gallery}
          events={events}
          vacancies={vacancies}
          siteConfig={siteConfig}
          auditLogs={auditLogs}
          adminCount={effectiveAccounts.length}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />
      )}

      {/* 2. WEBSITE */}
      {(activeTab === 'website_identity' ||
        activeTab === 'website_homepage' ||
        activeTab === 'website_header' ||
        activeTab === 'website_navigation' ||
        activeTab === 'website_footer') && (
        <AdminWebsiteTab
          lang={lang}
          activeSubTab={activeTab as any}
          school={school}
          onUpdateSchool={onUpdateSchool}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onShowToast={showToast}
          notices={notices}
        />
      )}

      {/* 2.1 CAMPUS WEATHER MANAGER */}
      {activeTab === 'website_weather' && (
        <CampusWeatherManagerTab
          lang={lang}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          onShowToast={showToast}
          onAddAuditLog={onAddAuditLog}
          isSuperAdmin={currentAccount?.role === 'super_admin'}
        />
      )}

      {/* 3. CONTENT */}
      {activeTab === 'content_health' && (
        <ContentHealthTab
          lang={lang}
          school={school}
          siteConfig={siteConfig}
          notices={notices}
          vacancies={vacancies}
          aboutSections={aboutSections}
          staff={staff}
          facilities={facilities}
          programs={programs}
          documents={documents}
          curriculumGuidelines={curriculumGuidelines}
          events={events}
          achievements={achievements}
          history={history}
          gallery={gallery}
          messages={messages}
          currentRole={currentAccount?.role || 'admin'}
          can={can}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
          onShowToast={showToast}
        />
      )}

      {activeTab === 'content_career' && (
        <AdminCareerTab
          lang={lang}
          vacancies={vacancies}
          onSave={async (updated) => {
            if (onUpdateVacancies) {
              onUpdateVacancies(updated);
            }
            showToast(lang === 'np' ? 'रोजगारी विवरण सुरक्षित गरियो!' : 'Vacancies updated successfully!');
          }}
          can={can}
        />
      )}

      {(activeTab === 'content_about' ||
        activeTab === 'content_notices' ||
        activeTab === 'content_documents' ||
        activeTab === 'content_curriculum' ||
        activeTab === 'content_events' ||
        activeTab === 'content_achievements' ||
        activeTab === 'content_history') && (
        activeTab === 'content_curriculum' ? (
          <CurriculumGuidelinesTab
            lang={lang}
            curriculumGuidelines={curriculumGuidelines}
            onUpdateCurriculumGuidelines={onUpdateCurriculumGuidelines || (() => {})}
            onShowToast={showToast}
            currentAccount={currentAccount}
          />
        ) : (
          <AdminContentTab
            lang={lang}
            activeSubTab={activeTab as any}
            school={school}
            onUpdateSchool={onUpdateSchool}
            aboutSections={aboutSections}
            onUpdateAboutSections={onUpdateAboutSections}
            notices={notices}
            onUpdateNotices={onUpdateNotices}
            documents={documents}
            onUpdateDocuments={onUpdateDocuments}
            programs={programs}
            onUpdatePrograms={onUpdatePrograms}
            facilities={facilities}
            onUpdateFacilities={onUpdateFacilities}
            events={events}
            onUpdateEvents={onUpdateEvents}
            achievements={achievements}
            onUpdateAchievements={onUpdateAchievements}
            history={history}
            onUpdateHistory={onUpdateHistory}
            onShowToast={showToast}
            can={can}
          />
        )
      )}

      {/* FAQ Management */}
      {activeTab === 'content_faq' && (
        <FaqAdminTab
          lang={lang}
          faqs={faqs}
          onUpdateFaqs={onUpdateFaqs || (() => {})}
          onShowToast={showToast}
          canCreate={currentAccount?.role === 'super_admin' || can('notice.create')}
          canUpdate={currentAccount?.role === 'super_admin' || can('notice.update')}
          canDelete={currentAccount?.role === 'super_admin' || can('notice.delete')}
        />
      )}

      {/* 4. GOVERNANCE */}
      {(activeTab === 'gov_leadership' ||
        activeTab === 'gov_smc' ||
        activeTab === 'gov_chairman' ||
        activeTab === 'gov_principal' ||
        activeTab === 'gov_staff') && (
        <AdminGovernanceTab
          lang={lang}
          activeSubTab={activeTab as any}
          school={school}
          onUpdateSchool={onUpdateSchool}
          staff={staff}
          onUpdateStaff={onUpdateStaff}
          onShowToast={showToast}
          canCreateStaff={can('teacher.create') || can('staff.create')}
          canUpdateStaff={can('teacher.update') || can('staff.update')}
          canDeleteStaff={can('teacher.delete') || can('staff.delete')}
        />
      )}

      {/* 5. MEDIA */}
      {activeTab === 'media_gallery' && (
        <GalleryAdminTab
          lang={lang}
          gallery={gallery}
          onUpdateGallery={onUpdateGallery}
          onShowToast={showToast}
          canCreate={can('gallery.create')}
          canUpdate={can('gallery.update')}
          canDelete={can('gallery.delete')}
        />
      )}

      {/* 6. COMMUNICATION */}
      {activeTab === 'comm_contact' && (
        <AdminCommunicationTab
          lang={lang}
          school={school}
          onUpdateSchool={onUpdateSchool}
          messages={messages}
          onUpdateMessages={onUpdateMessages}
          onShowToast={showToast}
        />
      )}

      {/* 7. SYSTEM: SYSTEM HUB */}
      {activeTab === 'system' && (
        <AdminSystemHubTab
          lang={lang}
          accounts={effectiveAccounts}
          securityConfig={securityConfig}
          auditLogs={auditLogs}
          onNavigateTab={(tabId) => setActiveTab(tabId)}
          isSuperAdmin={currentAccount?.role === 'super_admin'}
        />
      )}

      {/* 8. SYSTEM: ADMINS & ROLES */}
      {(activeTab === 'sys_admins' || activeTab === 'sys_roles') && (
        <RbacAdminTab
          lang={lang}
          accounts={effectiveAccounts}
          onUpdateAccounts={(updated) => {
            if (onUpdateAdminAccounts) {
              onUpdateAdminAccounts(updated);
            }
          }}
          currentAccount={currentAccount || effectiveAccounts[0]}
          auditLogs={auditLogs}
          onClearAuditLogs={onClearAuditLogs}
          onAddAuditLog={onAddAuditLog}
          onShowToast={showToast}
          activeSubTab={activeTab === 'sys_roles' ? 'roles' : 'accounts'}
        />
      )}

      {/* 9. SYSTEM: SITE SETTINGS & BACKUP */}
      {(activeTab === 'sys_settings' || activeTab === 'sys_security' || activeTab === 'sys_backup' || activeTab === 'system') && (
        <AdminSystemSettingsTab
          lang={lang}
          school={school}
          notices={notices}
          staff={staff}
          facilities={facilities}
          programs={programs}
          documents={documents}
          messages={messages}
          events={events}
          achievements={achievements}
          history={history}
          gallery={gallery}
          siteConfig={siteConfig}
          onUpdateSiteConfig={onUpdateSiteConfig}
          securityConfig={securityConfig}
          onUpdateSecurityConfig={onUpdateSecurityConfig}
          auditLogs={auditLogs}
          onClearAuditLogs={onClearAuditLogs}
          isSuperAdmin={currentAccount?.role === 'super_admin'}
          currentUsername={currentAccount?.username || username}
          onRestoreAllData={onRestoreAllData}
          onResetFactory={onResetData}
          onShowToast={showToast}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* 10. SYSTEM: AUDIT LOGS */}
      {activeTab === 'sys_audit' && (
        <AdminAuditLogsTab
          lang={lang}
          auditLogs={auditLogs}
          onClearAuditLogs={onClearAuditLogs}
          onAddAuditLog={onAddAuditLog}
          onShowToast={showToast}
          isSuperAdmin={currentAccount?.role === 'super_admin'}
          currentUsername={currentAccount?.username || username}
        />
      )}

      {/* 11. SYSTEM: API ERROR LOGS & VERCEL DIAGNOSTICS */}
      {activeTab === 'sys_api_errors' && (
        <ApiErrorLogsTab
          lang={lang}
          onShowToast={showToast}
          isSuperAdmin={currentAccount?.role === 'super_admin'}
        />
      )}

      {/* 12. ACCOUNT & PROFILE */}
      {(activeTab === 'account_profile' || activeTab === 'account_security' || activeTab === 'account' || activeTab === 'profile') && (
        <AdminProfileTab
          lang={lang}
          currentAccount={currentAccount || effectiveAccounts[0]}
          school={school}
          onUpdateSchool={onUpdateSchool}
          onUpdateAccounts={(updated) => {
            if (onUpdateAdminAccounts) {
              onUpdateAdminAccounts(updated);
            }
          }}
          accounts={effectiveAccounts}
          onShowToast={showToast}
          onAddAuditLog={onAddAuditLog}
          onLogout={handleLogout}
          initialSubTab={activeTab === 'account_security' ? 'security' : 'profile'}
        />
      )}
        </div>
      </main>
    </div>
  );
};

export default AdminView;
