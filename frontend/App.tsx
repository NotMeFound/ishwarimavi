/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

import { HomeView } from './views/HomeView';
import AboutView from './views/AboutView';
import { AcademicsView } from './views/AcademicsView';
import { FacilitiesView } from './views/FacilitiesView';
import { StaffView } from './views/StaffView';
import { NoticesView } from './views/NoticesView';
import { EventsView } from './views/EventsView';
import { AchievementsView } from './views/AchievementsView';
import { HistoryView } from './views/HistoryView';
import { DocumentsView } from './views/DocumentsView';
import { GalleryView } from './views/GalleryView';
import { CommunityView } from './views/CommunityView';
import { ContactView } from './views/ContactView';
import { CurriculumView } from './views/CurriculumView';
import { AcademicCalendarView } from './views/AcademicCalendarView';
import { AdminView } from './views/AdminView';

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

  // Authoritative Database Sync: Fetch from backend API and listen for SSE live updates
  useEffect(() => {
    let isMounted = true;

    const applyAuthoritativeData = (data: AuthoritativeCMSData) => {
      if (!isMounted || !data) return;
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
    };

    apiClient.fetchAuthoritativeState().then((res) => {
      if (res?.data) {
        applyAuthoritativeData(res.data);
      }
    });

    const cleanupLiveSync = apiClient.setupLiveSync((data) => {
      applyAuthoritativeData(data);
    });

    return () => {
      isMounted = false;
      cleanupLiveSync();
    };
  }, []);

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

  // When on Admin Route, isolate the view completely (no public header, footer, or search modal)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#1E40AF] selection:text-white">
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
