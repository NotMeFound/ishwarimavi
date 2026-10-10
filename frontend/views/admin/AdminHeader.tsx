import React, { useState, useEffect, useRef } from 'react';
import { Language, AdminRole, ThemeMode } from '../../types';
import {
  Menu,
  Clock,
  Globe,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  ChevronRight,
  Search,
  Building2,
  X,
  FileText,
  Bell,
  Briefcase,
  FileDown,
  Users,
  Image as ImageIcon,
  Mail,
  ShieldCheck,
  Settings,
  User,
  LayoutDashboard,
  CornerDownLeft
} from 'lucide-react';
import { AdminNavTabId } from './AdminSidebar';

interface AdminHeaderProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername?: string;
  activeTab: AdminNavTabId;
  sessionRemainingSec?: number;
  sessionTimeLeft?: number;
  authorizedTabIds?: Set<string>;
  onOpenMobileSidebar: () => void;
  onToggleTheme?: () => void;
  theme?: ThemeMode;
  onToggleLang?: () => void;
  onNavigateHome: () => void;
  onLogout: () => void;
  onLockConsole?: () => void;
  onNavigateTab?: (tab: AdminNavTabId) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  lang,
  currentRole,
  currentUsername,
  activeTab,
  sessionRemainingSec = 1800,
  sessionTimeLeft,
  authorizedTabIds,
  onOpenMobileSidebar,
  onToggleTheme,
  theme,
  onToggleLang,
  onNavigateHome,
  onLogout,
  onNavigateTab
}) => {
  const effectiveSessionSec = sessionTimeLeft !== undefined ? sessionTimeLeft : sessionRemainingSec;
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Format session countdown
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Keyboard shortcut Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Search catalog of administrative sections
  const searchableSections: Array<{
    id: AdminNavTabId;
    titleEn: string;
    titleNp: string;
    categoryEn: string;
    categoryNp: string;
    icon: React.ComponentType<{ className?: string }>;
    keywords: string[];
  }> = [
    { id: 'dashboard', titleEn: 'Dashboard Overview', titleNp: 'ड्यासबोर्ड विहङ्गावलोकन', categoryEn: 'Overview', categoryNp: 'अवलोकन', icon: LayoutDashboard, keywords: ['home', 'stats', 'metrics', 'summary'] },
    { id: 'website_identity', titleEn: 'Site Identity & Logo', titleNp: 'वेबसाइट पहिचान तथा लोगो', categoryEn: 'Website', categoryNp: 'वेबसाइट', icon: Building2, keywords: ['branding', 'emis', 'motto', 'crest'] },
    { id: 'website_homepage', titleEn: 'Homepage Layout', titleNp: 'गृहपृष्ठ बनावट', categoryEn: 'Website', categoryNp: 'वेबसाइट', icon: Building2, keywords: ['hero', 'banner', 'sections'] },
    { id: 'website_header', titleEn: 'Header & Announcement Ticker', titleNp: 'हेडर तथा सूचना पट्टी', categoryEn: 'Website', categoryNp: 'वेबसाइट', icon: Bell, keywords: ['topbar', 'ticker', 'marquee'] },
    { id: 'website_navigation', titleEn: 'Navigation Menu', titleNp: 'नेभिगेसन मेनु', categoryEn: 'Website', categoryNp: 'वेबसाइट', icon: Building2, keywords: ['links', 'menu', 'routes'] },
    { id: 'website_footer', titleEn: 'Footer Configuration', titleNp: 'फुटर सेटिङ', categoryEn: 'Website', categoryNp: 'वेबसाइट', icon: Building2, keywords: ['copyright', 'links', 'footer'] },
    { id: 'content_notices', titleEn: 'Notices & Circulars', titleNp: 'सूचना तथा परिपत्र', categoryEn: 'Content', categoryNp: 'सामग्री', icon: Bell, keywords: ['publish', 'announcement', 'circular', 'pin'] },
    { id: 'content_career', titleEn: 'Career & Vacancies', titleNp: 'रोजगारी तथा खुला विज्ञापन', categoryEn: 'Content', categoryNp: 'सामग्री', icon: Briefcase, keywords: ['jobs', 'recruitment', 'vacancies', 'career', 'teacher vacancy', 'apply'] },
    { id: 'content_documents', titleEn: 'Documents & Downloads', titleNp: 'दस्तावेज तथा फारम', categoryEn: 'Content', categoryNp: 'सामग्री', icon: FileDown, keywords: ['pdf', 'charter', 'forms', 'download'] },
    { id: 'content_about', titleEn: 'About School & Programs', titleNp: 'विद्यालय परिचय तथा कार्यक्रम', categoryEn: 'Content', categoryNp: 'सामग्री', icon: FileText, keywords: ['mission', 'vision', 'facilities'] },
    { id: 'content_events', titleEn: 'Events & Academic Routines', titleNp: 'कार्यक्रम तथा तालिका', categoryEn: 'Content', categoryNp: 'सामग्री', icon: FileText, keywords: ['calendar', 'routine', 'exam'] },
    { id: 'content_achievements', titleEn: 'Honors & Achievements', titleNp: 'उपलब्धि तथा पुरस्कार', categoryEn: 'Content', categoryNp: 'सामग्री', icon: FileText, keywords: ['awards', 'results', 'rank'] },
    { id: 'content_history', titleEn: 'History & Milestones', titleNp: 'इतिहास तथा कोसेढुङ्गा', categoryEn: 'Content', categoryNp: 'सामग्री', icon: FileText, keywords: ['origin', 'establishment', 'timeline'] },
    { id: 'gov_staff', titleEn: 'Faculty & Staff Directory', titleNp: 'शिक्षक तथा कर्मचारी सूची', categoryEn: 'Governance', categoryNp: 'प्रशासन', icon: Users, keywords: ['teachers', 'staff', 'departments'] },
    { id: 'gov_smc', titleEn: 'School Management Committee (SMC)', titleNp: 'विद्यालय व्यवस्थापन समिति', categoryEn: 'Governance', categoryNp: 'प्रशासन', icon: Users, keywords: ['smc', 'committee', 'members'] },
    { id: 'gov_leadership', titleEn: 'Leadership (Principal & Chair)', titleNp: 'नेतृत्व तथा प्रशासन', categoryEn: 'Governance', categoryNp: 'प्रशासन', icon: Users, keywords: ['principal', 'chairman', 'message'] },
    { id: 'media_gallery', titleEn: 'Photo Gallery & Albums', titleNp: 'फोटो ग्यालरी तथा एल्बम', categoryEn: 'Media', categoryNp: 'मिडिया', icon: ImageIcon, keywords: ['photos', 'images', 'pictures'] },
    { id: 'comm_contact', titleEn: 'Contact Inquiries & Messages', titleNp: 'सम्पर्क सोधपुछ तथा सन्देश', categoryEn: 'Communication', categoryNp: 'सञ्चार', icon: Mail, keywords: ['inbox', 'queries', 'parent messages'] },
    { id: 'sys_admins', titleEn: 'Administrators Management', titleNp: 'प्रशासक खाता व्यवस्थापन', categoryEn: 'System', categoryNp: 'प्रणाली', icon: ShieldCheck, keywords: ['accounts', 'users', 'passwords', 'rbac'] },
    { id: 'sys_roles', titleEn: 'Roles & Permissions Matrix', titleNp: 'भूमिका र अनुमति म्याट्रिक्स', categoryEn: 'System', categoryNp: 'प्रणाली', icon: ShieldCheck, keywords: ['permissions', 'access control'] },
    { id: 'sys_settings', titleEn: 'Site Settings & Disaster Recovery', titleNp: 'साइट सेटिङ तथा ब्याकअप', categoryEn: 'System', categoryNp: 'प्रणाली', icon: Settings, keywords: ['backup', 'restore', 'maintenance', 'security'] },
    { id: 'sys_audit', titleEn: 'Security Audit Logs', titleNp: 'सुरक्षा अडिट लग', categoryEn: 'System', categoryNp: 'प्रणाली', icon: FileText, keywords: ['logs', 'history', 'activity'] },
    { id: 'account_profile', titleEn: 'Admin Profile & Security', titleNp: 'प्रशासक प्रोफाइल तथा पासवर्ड', categoryEn: 'Account', categoryNp: 'खाता', icon: User, keywords: ['password', 'profile', 'credentials'] }
  ];

  // Isolate search index: Only authorized modules can ever appear in the search index
  const authorizedSections = searchableSections.filter(sec => {
    if (sec.id === 'dashboard' || sec.id === 'account_profile') return true;
    if (authorizedTabIds) {
      return authorizedTabIds.has(sec.id);
    }
    return true;
  });

  const filteredSections = searchQuery.trim() === ''
    ? authorizedSections.slice(0, 8)
    : authorizedSections.filter(sec => {
        const q = searchQuery.toLowerCase();
        return (
          sec.titleEn.toLowerCase().includes(q) ||
          sec.titleNp.toLowerCase().includes(q) ||
          sec.categoryEn.toLowerCase().includes(q) ||
          sec.categoryNp.toLowerCase().includes(q) ||
          sec.keywords.some(k => k.toLowerCase().includes(q))
        );
      });

  const handleSelectSearchItem = (id: AdminNavTabId) => {
    if (onNavigateTab) {
      onNavigateTab(id);
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 select-none">
        {/* Left: Mobile Toggle & Institutional Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 md:hidden cursor-pointer"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              ई
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {isNp ? 'श्री ईश्वरी मा.वि.' : 'Ishwari Sec. School'}
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {isSuperAdmin ? 'Superadmin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-400 text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('Search admin tools, notices, staff...', 'प्रशासकीय कार्य खोज्नुहोस्...')}</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 sm:hidden cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Authoritative Database Sync Indicator */}
          <div
            title={t('Connected to authoritative CMS storage', 'केन्द्रीकृत डाटाबेससँग जोडिएको')}
            className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-800 dark:text-emerald-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>DB Synced</span>
          </div>

          {/* Session Countdown Timer */}
          <div
            title={t('Time remaining before session expires', 'सत्र समाप्त हुन बाँकी समय')}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{formatTimer(effectiveSessionSec)}</span>
          </div>

          {/* Administrator User Pill */}
          {currentUsername && (
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('account_profile')}
              title={t('Admin Profile & Settings', 'प्रशासक प्रोफाइल तथा सेटिङ')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <span className="w-4 h-4 rounded-full bg-[#1E40AF] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUsername.charAt(0).toUpperCase()}
              </span>
              <span className="hidden md:inline font-mono">@{currentUsername}</span>
            </button>
          )}

          {/* Language Switcher */}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              title={isNp ? 'Switch to English' : 'नेपालीमा हेर्नुहोस्'}
              className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <Globe className="w-3 h-3 text-slate-400" />
              <span>{isNp ? 'EN' : 'नेपाली'}</span>
            </button>
          )}

          {/* Theme Mode Switcher */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-600" />
              )}
            </button>
          )}

          {/* Public Website Link */}
          <button
            type="button"
            onClick={onNavigateHome}
            title={t('Open public school portal', 'सार्वजनिक वेबसाइट हेर्नुहोस्')}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer"
          >
            <ExternalLink className="w-3 h-3 text-slate-400" />
            <span>{t('View Site', 'वेबसाइट')}</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title={t('End session and logout', 'सत्र समाप्त गरी बाहिरिनुहोस्')}
            className="p-1.5 rounded-md text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Global Admin Search Palette Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSearchOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Input Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('Search admin tools, notices, staff, settings...', 'प्रशासकीय कार्य वा सेक्सन खोज्नुहोस्...')}
                className="w-full bg-transparent border-none text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filteredSections.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {t('No matching administrative sections found.', 'कुनै मिल्दो नतिजा भेटिएन।')}
                </div>
              ) : (
                filteredSections.map(sec => {
                  const ItemIcon = sec.icon;
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleSelectSearchItem(sec.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                          <ItemIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 truncate">
                            {t(sec.titleEn, sec.titleNp)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {t(sec.categoryEn, sec.categoryNp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                        <span>{t('Go', 'जानुहोस्')}</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              <span>{t('Quick Jump Navigator', 'द्रुत नेभिगेसन')}</span>
              <span>ESC {t('to close', 'बन्द गर्न')}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
