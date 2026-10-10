import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  SiteCustomizerConfig,
  SecurityConfig,
  AdminAccount,
  SecurityAuditLogEntry
} from '../../types';
import {
  Sliders,
  LayoutTemplate,
  Layout,
  Eye,
  EyeOff,
  Bell,
  CheckCircle2,
  Save,
  Globe,
  School,
  FileText,
  Users,
  Image as ImageIcon,
  Building,
  GraduationCap,
  Calendar,
  Award,
  Hash,
  ShieldCheck,
  Palette,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface SuperAdminControlCenterProps {
  lang: Language;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  currentAccount: AdminAccount;
  onAddAuditLog: (log: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  onShowToast: (msg: string) => void;
  onNavigateTab: (tabId: any) => void;
}

export const SuperAdminControlCenter: React.FC<SuperAdminControlCenterProps> = ({
  lang,
  school,
  onUpdateSchool,
  siteConfig,
  onUpdateSiteConfig,
  currentAccount,
  onAddAuditLog,
  onShowToast,
  onNavigateTab,
}) => {
  const [activeSection, setActiveSection] = useState<
    'header_ticker' | 'homepage_hero' | 'stats_counters' | 'section_visibility' | 'school_identity' | 'quick_modules'
  >('header_ticker');

  // Local copy of configs for editing
  const [localSiteConfig, setLocalSiteConfig] = useState<SiteCustomizerConfig>({ ...siteConfig });
  const [localSchool, setLocalSchool] = useState<SchoolData>({ ...school });

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

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const handleSaveAll = () => {
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Confirm Master Control Publication', 'मास्टर कन्ट्रोल सेटिङ प्रकाशन पुष्टि गर्नुहोस्'),
      description: t(
        'Are you sure you want to publish these live system configurations to the public portal?',
        'के तपाईं यी मास्टर सेटिङहरू सार्वजनिक पोर्टलमा लागू गर्न निश्चित हुनुहुन्छ?'
      ),
      itemName: t('Master Website Identity & Layout Controls', 'वेबसाइट परिचय तथा बनावट सेटिङ'),
      confirmText: t('Publish Live Changes', 'परिवर्तन लागू गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(localSiteConfig);
        onUpdateSchool(localSchool);

        onAddAuditLog({
          action: 'SUPER_ADMIN_SYSTEM_CONFIG_UPDATED',
          actor: currentAccount.username,
          role: currentAccount.role,
          module: 'SUPER_ADMIN_CONTROL',
          status: 'success',
          result: 'success',
          details: 'Super Admin updated dynamic site identity, ticker, hero elements, and section visibility.'
        });

        onShowToast(t('Master UI and system configurations published successfully!', 'सुपर प्रशासक प्रणाली सेटिङहरू सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleToggleVisibility = (key: keyof SiteCustomizerConfig['sectionVisibility']) => {
    setLocalSiteConfig(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [key]: !prev.sectionVisibility[key]
      }
    }));
  };

  return (
    <div className="space-y-6 relative">
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
      {/* Super Admin Control Center Header */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400 text-slate-950 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin Command Console</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t('Master Website & UI Control Center', 'वेबसाइट तथा युजर इन्टरफेस मुख्य नियन्त्रण केन्द्र')}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {t(
              'Exclusive Super Admin dashboard to orchestrate live header tickers, homepage hero displays, dynamic statistics, section visibility, and school branding.',
              'ताजा समाचार टिकर, गृहपृष्ठ, तथ्याङ्क काउन्टर, सेक्सन दृश्यता र विद्यालय ब्राण्डिङ नियन्त्रण गर्ने सर्वोच्च केन्द्र।'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{t('Save & Publish Live Changes', 'परिवर्तनहरू सुरक्षित गरी लागू गर्नुहोस्')}</span>
        </button>
      </div>

      {/* Navigation Sub-Menu for Super Admin Control */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'header_ticker', labelEn: 'Header & Latest News Ticker', labelNp: 'हेडर तथा ताजा समाचार टिकर', icon: Bell },
          { id: 'homepage_hero', labelEn: 'Homepage Hero & Branding', labelNp: 'गृहपृष्ठ हिरो सेक्सन', icon: LayoutTemplate },
          { id: 'stats_counters', labelEn: 'Key Stats & Counters', labelNp: 'मुख्य तथ्याङ्क तथा काउन्टर', icon: Hash },
          { id: 'section_visibility', labelEn: 'Section Visibility (13 Modules)', labelNp: 'सेक्सन दृश्यता नियन्त्रण', icon: Layout },
          { id: 'school_identity', labelEn: 'Institution Identity & Affiliation', labelNp: 'विद्यालय परिचय तथा सम्बन्धन', icon: School },
          { id: 'quick_modules', labelEn: 'Module Shortcuts', labelNp: 'मोड्युल सर्टकट', icon: Sliders },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t(item.labelEn, item.labelNp)}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-SECTION 1: HEADER & LATEST NEWS TICKER */}
      {activeSection === 'header_ticker' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>{t('Top Header Alert Ticker ("Latest News")', 'शीर्ष हेडर अलर्ट टिकर ("ताजा समाचार")')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Renamed from "Urgent" to "Latest News" (ताजा समाचार). Automatically pulls newly created Pinned notices, scrolling horizontally across all screens.',
                  'पिन गरिएका सबै सूचनाहरू स्वचालित रूपमा ताजा समाचार टिकरमा निरन्तर स्क्रोल हुनेछन्।'
                )}
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={localSiteConfig.showAlertTicker}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, showAlertTicker: e.target.checked }))}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>{t('Enable Alert Ticker', 'अलर्ट टिकर सक्रिय गर्नुहोस्')}</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Fallback Ticker Notice (English)
              </label>
              <textarea
                rows={2}
                value={localSiteConfig.alertTickerEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, alertTickerEn: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Annual Examination Routine (Grades 1 to 9) Published for Session 2083"
              />
              <p className="text-[11px] text-slate-400">
                Used if no notices are currently marked as Pinned.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                वैकल्पिक टिकर सूचना (नेपाली)
              </label>
              <textarea
                rows={2}
                value={localSiteConfig.alertTickerNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, alertTickerNp: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका (कक्षा १ देखि ९ सम्म) प्रकाशित गरिएको बारे"
              />
              <p className="text-[11px] text-slate-400">
                कुनै सूचना पिन नगरिएको अवस्थामा यो पाठ प्रदर्शित हुन्छ।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                Automatic Pinned Notice Integration Active
              </p>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                Whenever an administrator creates or edits a notice in the Notices module and checks <span className="font-mono font-bold text-amber-600">"Pin this Notice to Top Banner"</span>, it immediately flows into this scrolling Latest News marquee without needing manual updates!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 2: HOMEPAGE HERO & BRANDING */}
      {activeSection === 'homepage_hero' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Homepage Hero Section & Academic Badges', 'गृहपृष्ठ हिरो सेक्सन तथा शैक्षिक ब्याच')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('Customize the primary greeting, banner tagline, and school vision.', 'मुख्य ब्यानर शीर्षक, उपशीर्षक र दृष्टिकोण परिवर्तन गर्नुहोस्।')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Hero Tagline / Badge (English)</label>
              <input
                type="text"
                value={localSiteConfig.heroBadgeEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroBadgeEn: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">हिरो ब्याच (नेपाली)</label>
              <input
                type="text"
                value={localSiteConfig.heroBadgeNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroBadgeNp: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Main Hero Title (English)</label>
              <input
                type="text"
                value={localSiteConfig.heroTitleEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroTitleEn: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">मुख्य हिरो शीर्षक (नेपाली)</label>
              <input
                type="text"
                value={localSiteConfig.heroTitleNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroTitleNp: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Hero Subtitle / Description (English)</label>
              <textarea
                rows={2}
                value={localSiteConfig.heroSubtitleEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroSubtitleEn: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">हिरो उपशीर्षक तथा विवरण (नेपाली)</label>
              <textarea
                rows={2}
                value={localSiteConfig.heroSubtitleNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, heroSubtitleNp: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 3: STATS & NUMERICAL COUNTERS */}
      {activeSection === 'stats_counters' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Dynamic Key Statistics & Academic Counters', 'मुख्य तथ्याङ्क तथा शैक्षिक काउन्टर')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('Manage verified school metrics displayed in the stats bar on the home screen.', 'गृहपृष्ठमा देखिने विद्यार्थी संख्या, शिक्षक संख्या, इतिहास वर्ष र उत्तीर्ण प्रतिशत।')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Students */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Total Students</label>
              <input
                type="text"
                value={localSiteConfig.stats.students}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, students: e.target.value } }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold font-mono"
              />
              <input
                type="text"
                value={localSiteConfig.stats.studentsLabelEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, studentsLabelEn: e.target.value } }))}
                placeholder="English Label"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                value={localSiteConfig.stats.studentsLabelNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, studentsLabelNp: e.target.value } }))}
                placeholder="नेपाली लेबल"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Faculty & Staff */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Certified Faculty</label>
              <input
                type="text"
                value={localSiteConfig.stats.staff}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, staff: e.target.value } }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold font-mono"
              />
              <input
                type="text"
                value={localSiteConfig.stats.staffLabelEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, staffLabelEn: e.target.value } }))}
                placeholder="English Label"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                value={localSiteConfig.stats.staffLabelNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, staffLabelNp: e.target.value } }))}
                placeholder="नेपाली लेबल"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Academic Legacy Years */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Legacy Years</label>
              <input
                type="text"
                value={localSiteConfig.stats.years}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, years: e.target.value } }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold font-mono"
              />
              <input
                type="text"
                value={localSiteConfig.stats.yearsLabelEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, yearsLabelEn: e.target.value } }))}
                placeholder="English Label"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                value={localSiteConfig.stats.yearsLabelNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, yearsLabelNp: e.target.value } }))}
                placeholder="नेपाली लेबल"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Success / Pass Rate */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Pass / Success Rate</label>
              <input
                type="text"
                value={localSiteConfig.stats.successRate}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, successRate: e.target.value } }))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold font-mono"
              />
              <input
                type="text"
                value={localSiteConfig.stats.successLabelEn}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, successLabelEn: e.target.value } }))}
                placeholder="English Label"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                value={localSiteConfig.stats.successLabelNp}
                onChange={(e) => setLocalSiteConfig(prev => ({ ...prev, stats: { ...prev.stats, successLabelNp: e.target.value } }))}
                placeholder="नेपाली लेबल"
                className="w-full px-2.5 py-1 text-[11px] rounded border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 4: SECTION VISIBILITY (13 MODULES) */}
      {activeSection === 'section_visibility' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Granular Section Visibility Management (13 Modules)', '१३ मोड्युलहरूको दृश्यता नियन्त्रण')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('Toggle any major content section on or off on the public portal instantly.', 'सार्वजनिक वेबसाइटमा कुनै पनि सेक्सन प्रदर्शन गर्ने वा लुकाउने स्विच।')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { key: 'hero', nameEn: 'Hero Header Banner', nameNp: 'हिरो ब्यानर' },
              { key: 'stats', nameEn: 'Statistical Counter Bar', nameNp: 'तथ्याङ्क काउन्टर' },
              { key: 'notices', nameEn: 'Notices & Circulars', nameNp: 'सूचना तथा परिपत्र' },
              { key: 'principal', nameEn: "Principal's Official Desk", nameNp: 'प्रधानाध्यापकको सन्देश' },
              { key: 'facilities', nameEn: 'Campus Infrastructure', nameNp: 'भौतिक पूर्वाधार' },
              { key: 'academics', nameEn: 'Academic Programs & Curricula', nameNp: 'शैक्षिक कार्यक्रम' },
              { key: 'events', nameEn: 'School Events & Calendar', nameNp: 'कार्यक्रम तथा क्यालेन्डर' },
              { key: 'achievements', nameEn: 'Accreditations & Awards', nameNp: 'उपलब्धि तथा पुरस्कार' },
              { key: 'history', nameEn: 'Historical Heritage Timeline', nameNp: 'ऐतिहासिक विकासक्रम' },
              { key: 'documents', nameEn: 'Downloads & Publications', nameNp: 'डाउनलोड तथा प्रकाशन' },
              { key: 'gallery', nameEn: 'Photographic Gallery Archive', nameNp: 'फोटो ग्यालरी' },
              { key: 'community', nameEn: 'SMC & PTA Governance', nameNp: 'विद्यालय व्यवस्थापन समिति' },
              { key: 'contact', nameEn: 'Contact Desk & Inquiries', nameNp: 'सम्पर्क तथा सोधपुछ' },
            ].map(sec => {
              const isVisible = localSiteConfig.sectionVisibility[sec.key as keyof SiteCustomizerConfig['sectionVisibility']];
              return (
                <div
                  key={sec.key}
                  onClick={() => handleToggleVisibility(sec.key as any)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                    isVisible
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t(sec.nameEn, sec.nameNp)}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">
                      {sec.key}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                    isVisible
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>{isVisible ? 'LIVE' : 'HIDDEN'}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-SECTION 5: SCHOOL IDENTITY & ACCREDITATION */}
      {activeSection === 'school_identity' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <School className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Official Institution Identity & Accreditation', 'आधिकारिक विद्यालय परिचय तथा सम्बन्धन')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('Official government school credentials, registration codes, and contact info.', 'सरकारी दर्ता, सम्बन्धन, सम्पर्क नम्बर तथा इमेल विवरण।')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">School Name (English)</label>
              <input
                type="text"
                value={localSchool.name_en}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, name_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">विद्यालयको नाम (नेपाली)</label>
              <input
                type="text"
                value={localSchool.name_np}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, name_np: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Official Tagline / Motto (English)</label>
              <input
                type="text"
                value={localSchool.tagline_en}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, tagline_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">विद्यालयको मूल नारा (नेपाली)</label>
              <input
                type="text"
                value={localSchool.tagline_np}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, tagline_np: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Location / Address (English)</label>
              <input
                type="text"
                value={localSchool.location_en}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, location_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">ठेगाना (नेपाली)</label>
              <input
                type="text"
                value={localSchool.location_np}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, location_np: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                value={localSchool.phone}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Official Email</label>
              <input
                type="email"
                value={localSchool.email}
                onChange={(e) => setLocalSchool(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUB-SECTION 6: QUICK MODULES */}
      {activeSection === 'quick_modules' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: 'notices', label: 'Notices & Circulars', count: 'PDF & Pinned', icon: FileText, desc: 'Manage announcements & Latest News ticker' },
            { id: 'staff', label: 'Teachers & Staff', count: 'Oval Passport Photos', icon: Users, desc: 'Faculty profiles with photo upload' },
            { id: 'gallery', label: 'Photo Gallery', count: 'JPG / PNG < 1 MB', icon: ImageIcon, desc: 'Campus photo archives' },
            { id: 'academics', label: 'Academic Programs', count: '+2 & Secondary', icon: GraduationCap, desc: 'Curriculum & admission streams' },
            { id: 'facilities', label: 'Facilities', count: 'Campus Labs', icon: Building, desc: 'Infrastructure & equipment' },
            { id: 'events_extra', label: 'Events & Calendar', count: 'Annual Calendar', icon: Calendar, desc: 'Academic schedule' },
            { id: 'documents', label: 'Official Documents', count: 'PDF Publications', icon: FileText, desc: 'Forms, circulars & syllabi' },
            { id: 'security', label: 'Security & Slugs', count: 'Session & Lockout', icon: ShieldCheck, desc: 'Portal routing & lockout rules' },
          ].map(m => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => onNavigateTab(m.id)}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#1E40AF] hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1E40AF] group-hover:scale-110 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-3">
                    {m.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {m.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>{m.count}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#1E40AF]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
