/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useCallback, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, RefreshCw } from 'lucide-react';
import {
  Language,
  ThemeMode,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  AboutSection,
  CurriculumGuideline,
  Vacancy,
  SchoolFAQItem
} from './types';
import { loadAdminAccounts, saveAdminAccounts, releaseSessionLock } from './utils/security';
import { safeStorage, safeSessionStorage } from './utils/storage';
import { apiClient, AuthoritativeCMSData } from './services/apiClient';
import {
  initialSchoolData,
  initialNotices,
  initialStaff,
  initialFacilities,
  initialEvents,
  initialAchievements,
  initialHistory,
  initialDocuments,
  initialPrograms,
  initialMessages,
  initialGallery,
  initialSiteConfig,
  initialSecurityConfig,
  initialAuditLogs,
  initialAboutSections,
  initialCurriculumGuidelines,
  initialVacancies,
  initialFAQs
} from './data/schoolData';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ScrollProgressBackToTop } from './components/ScrollProgressBackToTop';
import { PageLoadingSkeleton } from './components/PageLoadingSkeleton';

const HomeView = lazy(() => import('./views/HomeView').then((module) => ({ default: module.HomeView })));
const AboutView = lazy(() => import('./views/AboutView'));
const AcademicsView = lazy(() => import('./views/AcademicsView').then((module) => ({ default: module.AcademicsView })));
const FacilitiesView = lazy(() => import('./views/FacilitiesView').then((module) => ({ default: module.FacilitiesView })));
const StaffView = lazy(() => import('./views/StaffView').then((module) => ({ default: module.StaffView })));
const NoticesView = lazy(() => import('./views/NoticesView').then((module) => ({ default: module.NoticesView })));
const EventsView = lazy(() => import('./views/EventsView').then((module) => ({ default: module.EventsView })));
const AchievementsView = lazy(() => import('./views/AchievementsView').then((module) => ({ default: module.AchievementsView })));
const HistoryView = lazy(() => import('./views/HistoryView').then((module) => ({ default: module.HistoryView })));
const DocumentsView = lazy(() => import('./views/DocumentsView').then((module) => ({ default: module.DocumentsView })));
const GalleryView = lazy(() => import('./views/GalleryView').then((module) => ({ default: module.GalleryView })));
const CommunityView = lazy(() => import('./views/CommunityView'));
const ContactView = lazy(() => import('./views/ContactView').then((module) => ({ default: module.ContactView })));
const CurriculumView = lazy(() => import('./views/CurriculumView'));
const AcademicCalendarView = lazy(() => import('./views/AcademicCalendarView').then((module) => ({ default: module.AcademicCalendarView })));
const AdminView = lazy(() => import('./views/AdminView'));

const normalizeRouteFromUrl = (): string => {
  if (typeof window === 'undefined') return 'home';
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').trim().toLowerCase();
  const hash = window.location.hash.replace(/^[#/]+/, '').trim().toLowerCase();

  const raw = pathname || hash;
  if (!raw || raw === 'home') return 'home';

  if (
    raw === 'admin' ||
    raw === 'superadmin' ||
    raw === 'login' ||
    raw === 'signin' ||
    raw === 'auth' ||
    raw === 'cms' ||
    raw.startsWith('admin/') ||
    raw.startsWith('superadmin/') ||
    raw.startsWith('login/') ||
    raw.startsWith('auth/')
  ) {
    return 'admin';
  }
  if (
    raw === 'notices' ||
    raw === 'career' ||
    raw === 'careers' ||
    raw === 'vacancy' ||
    raw === 'vacancies' ||
    raw.startsWith('notice/') ||
    raw.startsWith('vacancy/')
  ) {
    return 'notice';
  }
  if (
    raw === 'curriculums' ||
    raw === 'curriculum-guidelines' ||
    raw.startsWith('curriculum/')
  ) {
    return 'curriculum';
  }
  if (
    raw === 'docs' ||
    raw === 'downloads' ||
    raw.startsWith('document/') ||
    raw.startsWith('download/')
  ) {
    return 'documents';
  }
  if (raw === 'academic-calendar' || raw === 'calendar') {
    return 'academic-calendar';
  }
  return raw;
};

export default function App() {
  // 1. Language State
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeStorage.getItem('ishwari_lang');
    return (saved as Language) || 'np';
  });

  // 2. Theme State - Strictly defaults to 'light' mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = safeStorage.getItem('ishwari_theme_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // 3. Active Route with URL pathname & hash synchronization
  const [activeRoute, setActiveRoute] = useState<string>(() => {
    try {
      return normalizeRouteFromUrl();
    } catch {
      return 'home';
    }
  });

  // 4. Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [hasLoadedAuthoritativeState, setHasLoadedAuthoritativeState] = useState(false);
  const [hasInitialLoadError, setHasInitialLoadError] = useState(false);
  const [isInitialLoadSlow, setIsInitialLoadSlow] = useState(false);
  const [isRetryingInitialLoad, setIsRetryingInitialLoad] = useState(false);
  const [hasLogoLoadError, setHasLogoLoadError] = useState(false);

  // 5. Managed School Data & Records (React UI State backed Authoritatively by Database API)
  const [school, setSchool] = useState<SchoolData>(initialSchoolData);
  const [aboutSections, setAboutSections] = useState<AboutSection[]>(initialAboutSections);
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [facilities, setFacilities] = useState<Facility[]>(initialFacilities);
  const [programs, setPrograms] = useState<AcademicProgram[]>(initialPrograms);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [events, setEvents] = useState<SchoolEvent[]>(initialEvents);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [curriculumGuidelines, setCurriculumGuidelines] = useState<CurriculumGuideline[]>(initialCurriculumGuidelines);
  const [siteConfig, setSiteConfig] = useState<SiteCustomizerConfig>(() => ({
    ...initialSiteConfig,
    primaryColor: '#1E3A8A',
    primaryColorName: 'Academic Navy',
  }));
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(initialSecurityConfig);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLogEntry[]>(initialAuditLogs);
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>(() => loadAdminAccounts());
  const [faqs, setFaqs] = useState<SchoolFAQItem[]>(initialFAQs);

  const applyAuthoritativeData = useCallback((data: AuthoritativeCMSData) => {
      if (!data) return;
      if (data.school) setSchool(data.school);
      if (data.aboutSections) setAboutSections(data.aboutSections);
      if (data.notices) setNotices(data.notices);
      if (data.vacancies) setVacancies(data.vacancies);
      if (data.staff) setStaff(data.staff);
      if (data.facilities) setFacilities(data.facilities);
      if (data.programs) setPrograms(data.programs);
      if (data.documents) setDocuments(data.documents);
      if (data.messages) setMessages(data.messages);
      if (data.events) setEvents(data.events);
      if (data.achievements) setAchievements(data.achievements);
      if (data.history) setHistory(data.history);
      if (data.gallery) setGallery(data.gallery);
      if (data.faqs) setFaqs(data.faqs);
      if (data.curriculumGuidelines) setCurriculumGuidelines(data.curriculumGuidelines);
      if (data.siteConfig) {
        setSiteConfig({
          ...data.siteConfig,
          primaryColor: '#1E3A8A',
          primaryColorName: 'Academic Navy',
        });
      }
      if (data.securityConfig) setSecurityConfig(data.securityConfig);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.adminAccounts) setAdminAccounts(data.adminAccounts);
  }, []);

  const loadAuthoritativeState = useCallback(async () => {
    const controller = new AbortController();
    setHasInitialLoadError(false);
    setIsInitialLoadSlow(false);
    setIsRetryingInitialLoad(true);
    const slowTimer = window.setTimeout(() => setIsInitialLoadSlow(true), 4000);
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const res = await apiClient.fetchAuthoritativeState(false, controller.signal);
      if (res?.data) {
        applyAuthoritativeData(res.data);
      } else {
        setHasInitialLoadError(true);
      }
    } catch {
      setHasInitialLoadError(true);
    } finally {
      window.clearTimeout(slowTimer);
      window.clearTimeout(timeout);
      setIsRetryingInitialLoad(false);
      setHasLoadedAuthoritativeState(true);
    }
  }, [applyAuthoritativeData]);

  // Fetch authoritative CMS data once and subscribe to subsequent server updates.
  useEffect(() => {
    void loadAuthoritativeState();
    const cleanupLiveSync = apiClient.setupLiveSync(applyAuthoritativeData);
    return () => {
      cleanupLiveSync();
    };
  }, [applyAuthoritativeData, loadAuthoritativeState]);

  // Listen to popstate and hashchange for clean HTML5 URL routing (/admin, /superadmin, /about)
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const normalized = normalizeRouteFromUrl();
        setActiveRoute(normalized);
      } catch {
        // Ignore URL change errors
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Preferences: Local persistence is strictly reserved for user UI preferences (theme, language)
  useEffect(() => {
    safeStorage.setItem('ishwari_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeStorage.setItem('ishwari_theme_mode', theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Global Ctrl+K hotkey for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'np' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleRouteChange = (route: string) => {
    let normalized = route === 'notices' ? 'notice' : route;
    if (normalized === 'career' || normalized === 'careers' || normalized === 'vacancy' || normalized === 'vacancies') {
      normalized = 'notice';
    }
    setActiveRoute(normalized);
    try {
      const targetPath = normalized === 'home' ? '/' : `/${normalized}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Ignore scroll errors in sandboxed iframes
    }
  };

  const handleUpdateSchool = (newVal: React.SetStateAction<SchoolData>) => {
    setSchool((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('school', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateAboutSections = (newVal: React.SetStateAction<AboutSection[]>) => {
    setAboutSections((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('aboutSections', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateCurriculumGuidelines = (newVal: React.SetStateAction<CurriculumGuideline[]>) => {
    setCurriculumGuidelines((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('curriculumGuidelines', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateNotices = (newVal: React.SetStateAction<Notice[]>) => {
    setNotices((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('notices', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateVacancies = (newVal: React.SetStateAction<Vacancy[]>) => {
    setVacancies((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('vacancies', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateStaff = (newVal: React.SetStateAction<StaffMember[]>) => {
    setStaff((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('staff', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateFacilities = (newVal: React.SetStateAction<Facility[]>) => {
    setFacilities((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('facilities', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdatePrograms = (newVal: React.SetStateAction<AcademicProgram[]>) => {
    setPrograms((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('programs', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateDocuments = (newVal: React.SetStateAction<DocumentItem[]>) => {
    setDocuments((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('documents', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateMessages = (newVal: React.SetStateAction<ContactMessage[]>) => {
    setMessages((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('messages', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateEvents = (newVal: React.SetStateAction<SchoolEvent[]>) => {
    setEvents((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('events', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateAchievements = (newVal: React.SetStateAction<Achievement[]>) => {
    setAchievements((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('achievements', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateHistory = (newVal: React.SetStateAction<HistoryItem[]>) => {
    setHistory((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('history', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateGallery = (newVal: React.SetStateAction<GalleryItem[]>) => {
    setGallery((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('gallery', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateSiteConfig = (newVal: React.SetStateAction<SiteCustomizerConfig>) => {
    setSiteConfig((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('siteConfig', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateSecurityConfig = (newVal: React.SetStateAction<SecurityConfig>) => {
    setSecurityConfig((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('securityConfig', updated, 'Administrator');
      return updated;
    });
  };

  const handleUpdateAdminAccounts = (newVal: React.SetStateAction<AdminAccount[]>) => {
    setAdminAccounts((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('adminAccounts', updated, 'Super Administrator');
      return updated;
    });
  };

  const handleUpdateFaqs = (newVal: React.SetStateAction<SchoolFAQItem[]>) => {
    setFaqs((prev) => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      apiClient.syncModule('faqs', updated, 'Administrator');
      return updated;
    });
  };

  const handleResetData = async () => {
    setSchool(initialSchoolData);
    setNotices(initialNotices);
    setVacancies(initialVacancies);
    setStaff(initialStaff);
    setFacilities(initialFacilities);
    setPrograms(initialPrograms);
    setDocuments(initialDocuments);
    setFaqs(initialFAQs);
    setMessages(initialMessages);
    setEvents(initialEvents);
    setAchievements(initialAchievements);
    setHistory(initialHistory);
    setGallery(initialGallery);
    setSiteConfig(initialSiteConfig);
    setSecurityConfig(initialSecurityConfig);
    setAuditLogs(initialAuditLogs);

    // Resets authoritative database to factory defaults
    await apiClient.resetToDefaults('Super Admin');
  };

  const handleAddMessage = async (msg: ContactMessage) => {
    setMessages((prev) => [msg, ...prev]);
    await apiClient.submitContactMessage({
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
    });
  };

  const handleAddAuditLog = (entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry,
    };
    setAuditLogs((prev) => {
      const updated = [newEntry, ...prev.slice(0, 99)];
      if (apiClient.getToken()) {
        apiClient.syncModule('auditLogs', updated, entry.actor || 'System');
      }
      return updated;
    });
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    if (apiClient.getToken()) {
      apiClient.syncModule('auditLogs', [], 'Super Administrator');
    }
  };

  const handleRestoreAllData = async (data: any) => {
    if (data.school) setSchool(data.school);
    if (data.notices) setNotices(data.notices);
    if (data.staff) setStaff(data.staff);
    if (data.facilities) setFacilities(data.facilities);
    if (data.programs) setPrograms(data.programs);
    if (data.documents) setDocuments(data.documents);
    if (data.messages) setMessages(data.messages);
    if (data.events) setEvents(data.events);
    if (data.achievements) setAchievements(data.achievements);
    if (data.history) setHistory(data.history);
    if (data.gallery) setGallery(data.gallery);
    if (data.siteConfig) setSiteConfig(data.siteConfig);
    if (data.securityConfig) setSecurityConfig(data.securityConfig);

    await apiClient.syncBatch(data, 'Super Admin');
  };

  const adminSlug = securityConfig?.adminRouteSlug || 'admin-portal';
  const isAdminRoute =
    activeRoute === 'admin' ||
    activeRoute === 'superadmin' ||
    activeRoute === adminSlug ||
    activeRoute.startsWith('admin/') ||
    activeRoute.startsWith('superadmin/');

  const wasAdminRoute = useRef(isAdminRoute);
  const terminateAdminSession = () => {
    void apiClient.logout({ keepalive: true });
    releaseSessionLock();
    safeSessionStorage.removeItem('ishwari_admin_auth');
    safeSessionStorage.removeItem('ishwari_current_account');
    safeSessionStorage.removeItem('ishwari_my_session_id');
  };

  useEffect(() => {
    if (wasAdminRoute.current && !isAdminRoute) {
      terminateAdminSession();
    }
    wasAdminRoute.current = isAdminRoute;
  }, [isAdminRoute]);

  useEffect(() => {
    if (!isAdminRoute) return;
    const handlePageHide = () => terminateAdminSession();
    window.addEventListener('pagehide', handlePageHide);
    return () => window.removeEventListener('pagehide', handlePageHide);
  }, [isAdminRoute]);

  if (!hasLoadedAuthoritativeState) {
    return (
      <div
        className="relative min-h-screen overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 px-5"
        role="status"
        aria-live="polite"
      >
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />
        <div className="absolute -bottom-48 -right-24 h-[30rem] w-[30rem] rounded-full bg-amber-300/15 blur-3xl dark:bg-indigo-500/10" />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_80px_-32px_rgba(30,58,138,0.35)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/75 sm:p-10"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="mx-auto mb-7 flex min-h-24 items-center justify-center">
            {school.logo_url && !hasLogoLoadError ? (
              <img
                src={school.logo_url}
                alt={school.name_en || 'Shree Ishwari Secondary School logo'}
                onError={() => setHasLogoLoadError(true)}
                className="h-24 max-w-40 object-contain sm:max-w-48"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1E3A8A] text-amber-300 shadow-md">
                <GraduationCap className="h-10 w-10" strokeWidth={1.7} aria-hidden="true" />
              </div>
            )}
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
            {lang === 'np' ? 'श्री ईश्वरी माध्यमिक विद्यालय' : 'Shree Ishwari Secondary School'}
          </p>
          <h1 className="mt-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {lang === 'np' ? 'तपाईंको विद्यालय अनुभव तयार गर्दैछौँ' : 'Preparing your school experience…'}
          </h1>
          <div className="mt-5 flex min-h-6 items-center justify-center gap-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {lang === 'np' ? 'विद्यालयको सामग्री ल्याउँदैछौँ' : 'Loading the latest school information'}
            </span>
            <span className="flex gap-1" aria-hidden="true">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className={`h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 ${dot === 1 ? 'motion-safe:animate-pulse' : ''}`}
                />
              ))}
            </span>
          </div>
          {isInitialLoadSlow && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {lang === 'np' ? 'अझै केही समय लाग्दैछ…' : 'This is taking a little longer than usual…'}
            </p>
          )}

          <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-slate-800" aria-hidden="true">
            <div className="h-full w-1/3 rounded-full bg-[#1E40AF] motion-safe:animate-pulse motion-reduce:animate-none" />
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500" aria-hidden="true">
            {lang === 'np' ? 'केही क्षण पर्खनुहोस्' : 'Just a few moments'}
          </p>
        </motion.div>
      </div>
    );
  }

  // When on Admin Route, isolate the view completely (no public header, footer, or search modal)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
        <Suspense fallback={<PageLoadingSkeleton lang={lang} variant="admin" />}>
        <AdminView
          lang={lang}
          theme={theme}
          onToggleLang={handleToggleLang}
          onToggleTheme={handleToggleTheme}
          school={school}
          onUpdateSchool={handleUpdateSchool}
          notices={notices}
          onUpdateNotices={handleUpdateNotices}
          vacancies={vacancies}
          onUpdateVacancies={handleUpdateVacancies}
          staff={staff}
          onUpdateStaff={handleUpdateStaff}
          facilities={facilities}
          onUpdateFacilities={handleUpdateFacilities}
          programs={programs}
          onUpdatePrograms={handleUpdatePrograms}
          documents={documents}
          onUpdateDocuments={handleUpdateDocuments}
          messages={messages}
          onUpdateMessages={handleUpdateMessages}
          events={events}
          onUpdateEvents={handleUpdateEvents}
          achievements={achievements}
          onUpdateAchievements={handleUpdateAchievements}
          history={history}
          onUpdateHistory={handleUpdateHistory}
          gallery={gallery}
          onUpdateGallery={handleUpdateGallery}
          siteConfig={siteConfig}
          onUpdateSiteConfig={handleUpdateSiteConfig}
          securityConfig={securityConfig}
          onUpdateSecurityConfig={handleUpdateSecurityConfig}
          auditLogs={auditLogs}
          onClearAuditLogs={handleClearAuditLogs}
          onAddAuditLog={handleAddAuditLog}
          adminAccounts={adminAccounts}
          onUpdateAdminAccounts={handleUpdateAdminAccounts}
          aboutSections={aboutSections}
          onUpdateAboutSections={handleUpdateAboutSections}
          curriculumGuidelines={curriculumGuidelines}
          onUpdateCurriculumGuidelines={handleUpdateCurriculumGuidelines}
          faqs={faqs}
          onUpdateFaqs={handleUpdateFaqs}
          onRestoreAllData={handleRestoreAllData}
          onResetData={handleResetData}
          onNavigateHome={() => handleRouteChange('home')}
        />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
      {/* Universal Header with Lang & Dark Mode Toggles */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeRoute={activeRoute}
        onRouteChange={handleRouteChange}
        onOpenSearch={() => setIsSearchOpen(true)}
        school={school}
        siteConfig={siteConfig}
        securityConfig={securityConfig}
        notices={notices}
      />

      {/* Main Content View Switcher with Smooth Route Transitions */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoute}
            initial={{ opacity: 0.95 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.95 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="w-full"
          >
            {hasInitialLoadError && (
              <div className="mx-auto mb-4 flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" role="status" aria-live="polite">
                <span>{lang === 'np' ? 'नवीनतम सामग्री ल्याउन सकिएन। देखाइएको सामग्री पुरानो हुन सक्छ।' : 'Could not load the latest school content. The displayed information may be out of date.'}</span>
                <button
                  type="button"
                  onClick={() => void loadAuthoritativeState()}
                  disabled={isRetryingInitialLoad}
                  className="inline-flex items-center gap-2 rounded-md border border-current px-3 py-1.5 font-semibold disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetryingInitialLoad ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
                  {isRetryingInitialLoad
                    ? (lang === 'np' ? 'पुनः प्रयास गर्दैछौँ…' : 'Retrying…')
                    : (lang === 'np' ? 'पुनः प्रयास' : 'Retry')}
                </button>
              </div>
            )}
            <Suspense fallback={<PageLoadingSkeleton lang={lang} variant={activeRoute === 'admin' ? 'admin' : activeRoute === 'home' ? 'home' : 'content'} />}>
            {activeRoute === 'home' && (
              <HomeView
                lang={lang}
                school={school}
                notices={notices}
                facilities={facilities}
                staff={staff}
                events={events}
                achievements={achievements}
                curriculumGuidelines={curriculumGuidelines}
                aboutSections={aboutSections}
                documents={documents}
                gallery={gallery}
                siteConfig={siteConfig}
                onNavigate={handleRouteChange}
              />
            )}
            {activeRoute === 'about' && (
              <AboutView
                lang={lang}
                school={school}
                aboutSections={aboutSections}
                faqs={faqs}
                onNavigate={handleRouteChange}
                siteConfig={siteConfig}
              />
            )}
            {activeRoute === 'academics' && (
              <AcademicsView
                lang={lang}
                programs={programs}
                siteConfig={siteConfig}
              />
            )}
            {activeRoute === 'facilities' && (
              <FacilitiesView
                lang={lang}
                facilities={facilities}
                siteConfig={siteConfig}
              />
            )}
            {activeRoute === 'staff' && <StaffView lang={lang} staff={staff} />}
            {(activeRoute === 'notice' || activeRoute === 'notices' || activeRoute === 'career' || activeRoute === 'careers') && (
              <NoticesView
                lang={lang}
                notices={notices}
                vacancies={vacancies}
                schoolNameEn={school.name_en}
                schoolNameNp={school.name_np}
              />
            )}
            {(activeRoute === 'academic-calendar' || activeRoute === 'calendar') && (
              <AcademicCalendarView
                lang={lang}
                events={events}
                onNavigate={handleRouteChange}
              />
            )}
            {activeRoute === 'events' && (
              <AcademicCalendarView
                lang={lang}
                events={events}
                onNavigate={handleRouteChange}
              />
            )}
            {activeRoute === 'achievements' && (
              <AchievementsView lang={lang} achievements={achievements} />
            )}
            {activeRoute === 'history' && (
              <HistoryView
                lang={lang}
                history={history}
                siteConfig={siteConfig}
                school={school}
              />
            )}
            {(activeRoute === 'documents' || activeRoute === 'downloads' || activeRoute === 'docs') && (
              <DocumentsView lang={lang} documents={documents} />
            )}
            {(activeRoute === 'curriculum' || activeRoute === 'curriculum-guidelines' || activeRoute === 'resources' || activeRoute === 'digital-resources') && (
              <CurriculumView lang={lang} curriculumGuidelines={curriculumGuidelines} />
            )}
            {activeRoute === 'gallery' && <GalleryView lang={lang} items={gallery} />}
            {activeRoute === 'community' && <CommunityView lang={lang} />}
            {activeRoute === 'contact' && (
              <ContactView
                lang={lang}
                school={school}
                siteConfig={siteConfig}
                onSendMessage={handleAddMessage}
              />
            )}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Institutional Footer */}
      <Footer
        lang={lang}
        school={school}
        onRouteChange={handleRouteChange}
        siteConfig={siteConfig}
      />

      {/* Global Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        lang={lang}
        onNavigate={handleRouteChange}
        notices={notices}
        staff={staff}
        facilities={facilities}
        curriculumGuidelines={curriculumGuidelines}
        vacancies={vacancies}
        documents={documents}
        events={events}
        achievements={achievements}
      />
      {/* Circular Scroll Progress & Back-to-Top Action */}
      <ScrollProgressBackToTop lang={lang} />
    </div>
  );
}
