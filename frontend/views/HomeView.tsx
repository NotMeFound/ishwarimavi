import React, { useState, useMemo } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  Facility,
  StaffMember,
  SchoolEvent,
  Achievement,
  CurriculumGuideline,
  AboutSection,
  DocumentItem,
  GalleryItem,
  SiteCustomizerConfig,
  HomepageSectionItem,
  QuickAccessItem
} from '../types';
import { initialSiteConfig, defaultHomepageSections, defaultQuickAccessItems } from '../data/schoolData';
import {
  GraduationCap,
  Users,
  Award,
  Calendar,
  Bell,
  Download,
  ChevronRight,
  ShieldCheck,
  Building2,
  BookOpen,
  BookMarked,
  Quote,
  ArrowRight,
  Microscope,
  Monitor,
  Library,
  Trophy,
  FileText,
  PhoneCall,
  CheckCircle2,
  X,
  Clock,
  Briefcase,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
  Compass,
  Layers,
  Star
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { EducationalBackground } from '../components/EducationalBackground';
import { Weather } from '../components/Weather';
import { MagneticButton } from '../components/MagneticButton';
import { IconActionButton } from '../components/IconActionButton';
import {
  StaggeredHeroHeading,
  ScrollRevealHeading,
  BlurSharpStatement,
  AnimatedCounter,
  TypographicBackground,
  HoverInteractiveLink,
  EducatorNameTypography,
  PointerIlluminatedText,
  InteractiveSectionHeading,
} from '../components/InteractiveTypography';

interface HomeViewProps {
  lang: Language;
  school: SchoolData;
  notices: Notice[];
  facilities: Facility[];
  staff: StaffMember[];
  events?: SchoolEvent[];
  achievements?: Achievement[];
  curriculumGuidelines?: CurriculumGuideline[];
  aboutSections?: AboutSection[];
  documents?: DocumentItem[];
  gallery?: GalleryItem[];
  siteConfig?: SiteCustomizerConfig;
  onNavigate: (route: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  lang,
  school,
  notices = [],
  facilities = [],
  staff = [],
  events = [],
  achievements = [],
  curriculumGuidelines = [],
  aboutSections = [],
  documents = [],
  gallery = [],
  siteConfig = initialSiteConfig,
  onNavigate,
}) => {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [pendingDownloadNotice, setPendingDownloadNotice] = useState<Notice | null>(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const config = siteConfig || initialSiteConfig;
  const visibility = config?.sectionVisibility || initialSiteConfig.sectionVisibility;
  const statsConfig = config?.stats || initialSiteConfig.stats;

  // Dynamic Homepage Background Image & Controls
  const isBgEnabled = (config?.homeBgEnabled ?? false) || (school.home_bg_enabled ?? false);
  const rawBgUrl = config?.homeBgImage || school.home_bg_image || '';
  const homeBgUrl = isBgEnabled && rawBgUrl ? rawBgUrl : '';

  // Background position & size
  const bgPositionMode = config?.homeBgPosition || school.home_bg_position || 'center';
  const customPosition = config?.homeBgCustomPosition || school.home_bg_custom_position || 'center';
  const bgPosition = bgPositionMode === 'custom' ? customPosition : bgPositionMode;
  const bgSize = config?.homeBgSize || school.home_bg_size || 'cover';

  // Overlay settings
  const overlayEnabled = config?.homeBgOverlayEnabled ?? school.home_bg_overlay_enabled ?? true;
  const rawOverlayOpacity = config?.homeBgOverlayOpacity ?? school.home_bg_overlay_opacity ?? 85;
  const overlayOpacity = overlayEnabled ? Math.min(Math.max(rawOverlayOpacity / 100, 0), 0.98) : 0;

  // Published filtered data
  const publishedNotices = useMemo(() => {
    return notices.filter(n => n.published !== false && n.is_published !== false);
  }, [notices]);

  const pinnedNotices = useMemo(() => {
    return publishedNotices.filter(n => n.pinned);
  }, [publishedNotices]);

  const upcomingEvents = useMemo(() => {
    return events
      .filter(e => e.status !== 'draft')
      .slice(0, 3);
  }, [events]);

  const featuredAchievements = useMemo(() => {
    return achievements
      .filter(a => a.published !== false)
      .slice(0, 3);
  }, [achievements]);

  const featuredCurriculums = useMemo(() => {
    return curriculumGuidelines
      .filter(c => c.status === 'published')
      .slice(0, 4);
  }, [curriculumGuidelines]);

  // Dynamic School Statistics (Calculated from Real Database Records when available)
  const computedStats = useMemo(() => {
    // Years of Service calculation from Estd BS
    let yearsOfService = statsConfig.years || '48';
    if (school.estd_bs) {
      const match = school.estd_bs.match(/\d{4}/);
      if (match) {
        const estdYear = parseInt(match[0], 10);
        const currentBsYear = 2083;
        if (estdYear > 1900 && estdYear <= currentBsYear) {
          yearsOfService = String(currentBsYear - estdYear);
        }
      }
    }

    // Certified staff count
    const staffCount = staff.length > 0 ? String(staff.length) : statsConfig.staff;

    return {
      students: statsConfig.students || '1,240+',
      studentsLabelEn: statsConfig.studentsLabelEn || 'Enrolled Students',
      studentsLabelNp: statsConfig.studentsLabelNp || 'अध्ययनरत विद्यार्थी',
      staff: staffCount,
      staffLabelEn: statsConfig.staffLabelEn || 'Faculty & Staff',
      staffLabelNp: statsConfig.staffLabelNp || 'शिक्षक तथा कर्मचारी',
      years: yearsOfService,
      yearsLabelEn: statsConfig.yearsLabelEn || 'Years of Service',
      yearsLabelNp: statsConfig.yearsLabelNp || 'वर्षको गौरवमय इतिहास',
      successRate: statsConfig.successRate || '100%',
      successLabelEn: statsConfig.successLabelEn || 'SEE Success Rate',
      successLabelNp: statsConfig.successLabelNp || 'एसईई परीक्षा सफलता',
      facilities: facilities.length > 0 ? `${facilities.length}+` : '8+',
      achievements: achievements.length > 0 ? `${achievements.length}+` : '24+'
    };
  }, [statsConfig, school.estd_bs, staff.length, facilities.length, achievements.length]);

  // Section Manager Resolution (Order & Enabled states controlled by Admin)
  const activeSections = useMemo(() => {
    const definedSections = config?.homepageSections && config.homepageSections.length > 0
      ? config.homepageSections
      : defaultHomepageSections;

    return [...definedSections]
      .filter(sec => {
        // Check section item enabled state
        if (sec.enabled === false) return false;
        // Fallback check against legacy sectionVisibility config
        const legacyKey = sec.id as keyof typeof visibility;
        if (legacyKey in visibility && visibility[legacyKey] === false) return false;
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [config?.homepageSections, visibility]);

  // Quick access items resolution
  const quickAccessItems = useMemo(() => {
    const items = config?.quickAccessItems && config.quickAccessItems.length > 0
      ? config.quickAccessItems
      : defaultQuickAccessItems;

    return [...items]
      .filter(item => item.enabled !== false)
      .sort((a, b) => a.order - b.order);
  }, [config?.quickAccessItems]);

  const handleDownloadNotice = (notice: Notice) => {
    if (notice.file_data) {
      const link = document.createElement('a');
      link.href = notice.file_data;
      link.download = notice.file_name || `notice_${notice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccessMsg(t(`Downloaded ${notice.file_name}`, `${notice.file_name} डाउनलोड भयो`));
      setTimeout(() => setDownloadSuccessMsg(null), 3500);
      return;
    }

    const content = `ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Public Circular Document
Date: ${notice.date_en} (${notice.date_np})
Category: ${notice.category.toUpperCase()}

Title: ${notice.title_en}
शीर्षक: ${notice.title_np}

Description:
${notice.description_en}

विवरण:
${notice.description_np}

--------------------------------------------------
Ishwari Secondary School Administrative Authority
Affiliation: National Examination Board (NEB) Nepal
Website: Official Institutional Web Portal
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = notice.file_name.endsWith('.pdf') ? notice.file_name.replace('.pdf', '.txt') : `${notice.file_name}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessMsg(t(`Downloaded ${notice.file_name}`, `${notice.file_name} डाउनलोड भयो`));
    setTimeout(() => setDownloadSuccessMsg(null), 3500);
  };

  const executeDownloadNotice = (notice: Notice) => {
    handleDownloadNotice(notice);
    setPendingDownloadNotice(null);
  };

  // Helper to map quick access icon string to Lucide component
  const renderQuickAccessIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bell': return Bell;
      case 'Calendar': return Calendar;
      case 'BookMarked': return BookMarked;
      case 'Download': return Download;
      case 'Clock': return Clock;
      case 'Briefcase': return Briefcase;
      case 'Award': return Award;
      case 'Users': return Users;
      case 'Building2': return Building2;
      case 'PhoneCall': return PhoneCall;
      case 'Image': return ImageIcon;
      case 'Compass': return Compass;
      default: return FileText;
    }
  };

  // Render individual sections safely
  const renderSection = (sec: HomepageSectionItem) => {
    switch (sec.id) {
      // 1. HERO INSTITUTIONAL BANNER
      case 'hero':
        return (
          <section key="sec-hero" className="relative bg-slate-950 text-white py-16 sm:py-24 border-b border-slate-800 overflow-hidden">
            {homeBgUrl ? (
              <>
                <div
                  className="absolute inset-0 bg-no-repeat transition-all duration-700"
                  style={{
                    backgroundImage: `url(${homeBgUrl})`,
                    backgroundPosition: bgPosition,
                    backgroundSize: bgSize
                  }}
                />
                {overlayEnabled && overlayOpacity > 0 && (
                  <div
                    className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
                    style={{ opacity: overlayOpacity }}
                  />
                )}
              </>
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />
            )}

            <TypographicBackground
              text="ISHWARI"
              position="bottom-right"
              align="right"
              opacityClass="text-white/[0.035]"
            />

            <EducationalBackground
              config={config.educationalBackgrounds?.hero}
              defaultPreset="school_building"
              className="text-blue-100"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
              {config.heroBadgeEn && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 shadow-xs text-blue-300 text-xs font-bold tracking-wider uppercase backdrop-blur-xs">
                  <span>{t(config.heroBadgeEn, config.heroBadgeNp)}</span>
                </div>
              )}

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
                <StaggeredHeroHeading
                  key={isNp ? 'hero-title-np' : 'hero-title-en'}
                  text={t(sec.title_en || config.heroTitleEn || initialSiteConfig.heroTitleEn, sec.title_np || config.heroTitleNp || initialSiteConfig.heroTitleNp)}
                  interactiveIllumination={true}
                />
              </h1>

              <div className="pt-0.5">
                <PointerIlluminatedText
                  as="div"
                  entranceType="blur"
                  entranceDelay={0.15}
                  radius={80}
                  className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-amber-400/90 dark:text-amber-400/90"
                  text={t(school.tagline_en || 'Center for Academic Excellence & Character Building', school.tagline_np || 'शैक्षिक उत्कृष्टता र चरित्र निर्माणको केन्द्र')}
                />
              </div>

              <BlurSharpStatement
                as="p"
                delay={0.25}
                className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed"
              >
                {t(sec.subtitle_en || config.heroSubtitleEn || initialSiteConfig.heroSubtitleEn, sec.subtitle_np || config.heroSubtitleNp || initialSiteConfig.heroSubtitleNp)}
              </BlurSharpStatement>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <MagneticButton
                  onClick={() => onNavigate('academics')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#1E40AF]/30 cursor-pointer"
                >
                  <span>{t('Explore Academic Programs', 'शैक्षिक कार्यक्रमहरू')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </MagneticButton>

                <MagneticButton
                  onClick={() => onNavigate('academic-calendar')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('Academic Calendar 2083', 'वार्षिक क्यालेन्डर')}</span>
                </MagneticButton>

                <MagneticButton
                  onClick={() => onNavigate('notices')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('Digital Notice Board', 'डिजिटल सूचना पाटी')}</span>
                </MagneticButton>
              </div>
            </div>
          </section>
        );

      // 2. QUICK ACCESS / INFORMATION HUB (Monochrome Thin-Line SVGs, Institutional & Compact)
      case 'quick_access':
        return (
          <section key="sec-quick_access" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {t(sec.title_en || 'Information Hub & Direct Services', sec.title_np || 'सूचना केन्द्र तथा प्रत्यक्ष सेवाहरू')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {t('Quick institutional navigation', 'द्रुत संस्थागत पहुँच')}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                {quickAccessItems.map((item) => {
                  const Icon = renderQuickAccessIcon(item.icon);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.is_external && item.external_url) {
                          window.open(item.external_url, '_blank', 'noopener,noreferrer');
                        } else {
                          onNavigate(item.route);
                        }
                      }}
                      className="flex flex-col items-start p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 hover:bg-blue-50/80 dark:bg-slate-850/60 dark:hover:bg-blue-950/40 text-slate-700 hover:text-[#1E40AF] dark:text-slate-300 dark:hover:text-blue-300 transition-all duration-150 cursor-pointer text-left group"
                      title={t(item.title_en, item.title_np)}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <Icon className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-[#1E40AF] dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors" strokeWidth={1.8} />
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1E40AF] transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors truncate w-full">
                        {t(item.title_en, item.title_np)}
                      </span>
                      {item.desc_en && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {t(item.desc_en, item.desc_np || '')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        );

      // 3. OFFICIAL CIRCULARS & DIGITAL NOTICE BOARD
      case 'notices':
        return (
          <section key="sec-notices" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF] animate-pulse shrink-0" />}
                title={t(sec.title_en || 'Official Circulars & Announcements', sec.title_np || 'आधिकारिक सूचना तथा परिपत्रहरू')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('notices')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('View All Notices & Circulars', 'सबै सूचना हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Column: Latest Circulars & Announcements */}
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(pinnedNotices.length > 0 ? pinnedNotices : publishedNotices.slice(0, 4)).slice(0, 4).map((notice) => (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedNotice(notice);
                        }
                      }}
                      className="p-5 rounded-2xl border border-[#1E40AF]/25 bg-blue-50/40 dark:bg-slate-900/90 space-y-3 relative shadow-2xs hover:border-[#1E40AF]/60 transition-all duration-200 cursor-pointer group select-none flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1E40AF] text-white font-bold uppercase tracking-wider text-[10px]">
                            {notice.pinned ? t('PINNED CIRCULAR', 'मुख्य सूचना') : notice.category.toUpperCase()}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#1E40AF] dark:text-blue-400" />
                            <span>{t(notice.date_en, notice.date_np)}</span>
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {t(notice.title_en, notice.title_np)}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {t(notice.description_en, notice.description_np)}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200 dark:border-slate-800 mt-2">
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {notice.file_size_kb ? `${notice.file_size_kb} KB • PDF` : 'PDF'}
                        </span>
                        <span className="text-[11px] text-[#1E40AF] dark:text-blue-400 font-medium group-hover:underline">
                          {t('Read Circular →', 'विस्तृत सूचना →')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar: Campus Weather & Environmental Widget */}
              <aside className="lg:col-span-4 space-y-4">
                <Weather lang={lang} config={siteConfig?.weather} />
              </aside>
            </div>
          </section>
        );

      // 4. ABOUT SCHOOL & PILLARS
      case 'about':
        return (
          <section key="sec-about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<Building2 className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />}
                title={t(sec.title_en || 'About School & Educational Pillars', sec.title_np || 'विद्यालय परिचय तथा शैक्षिक स्तम्भ')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('about')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('Read Full History', 'विस्तृत परिचय हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1E40AF] flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Academic Rigor & STEM', 'सैद्धान्तिक तथा प्रयोगात्मक विज्ञान')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t(
                    'Curriculum aligned to CDC Nepal standards, supplemented with hands-on robotics, computer labs, and continuous assessments.',
                    'राष्ट्रिय पाठ्यक्रम मापदण्ड अनुसार प्रयोगात्मक रोबोटिक्स, कम्प्युटर ल्याब र निरन्तर मूल्याङ्कन।'
                  )}
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1E40AF] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Moral Character & Civic Values', 'नैतिक आचरण तथा संस्कार')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t(
                    'Instilling integrity, social responsibility, teamwork, and empathetic community service in every student.',
                    'अनुशासन, सामाजिक उत्तरदायित्व, सहकार्य र सामाजिक सेवाको भावना विकास।'
                  )}
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1E40AF] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Equal Learning Opportunity', 'समान सिकाइ अवसर')}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t(
                    'Inclusive education ensuring every child, irrespective of background, receives top-tier modern pedagogy.',
                    'सबै पृष्ठभूमिका बालबालिकाका लागि समावेशी, बालमैत्री र उच्चस्तरीय आधुनिक शिक्षा।'
                  )}
                </p>
              </div>
            </div>
          </section>
        );

      // 5. PRINCIPAL'S MESSAGE & LEADERSHIP
      case 'principal':
        return (
          <section key="sec-principal" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <TypographicBackground
                text="LEADERSHIP"
                position="top-right"
                align="right"
                opacityClass="text-slate-900/[0.025] dark:text-white/[0.02]"
              />
              <EducationalBackground
                config={config.educationalBackgrounds?.principal}
                defaultPreset="classroom"
              />
              <div className="lg:col-span-4 text-center space-y-3 relative z-10">
                {school.principal_image && school.principal_image.trim() ? (
                  <div className="relative w-28 h-28 mx-auto">
                    <img
                      src={school.principal_image}
                      alt={school.principal_name_en}
                      className="w-28 h-28 mx-auto rounded-2xl object-cover border-2 border-[#1E40AF] shadow-md transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#1E40AF] text-white shadow-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 mx-auto rounded-2xl bg-blue-50 dark:bg-slate-800 border-2 border-[#1E40AF] text-[#1E40AF] dark:text-blue-400 flex flex-col items-center justify-center shadow-sm">
                    <GraduationCap className="w-10 h-10 mb-0.5" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('Principal', 'प्र.अ.')}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  <EducatorNameTypography
                    name={t(school.principal_name_en, school.principal_name_np)}
                    role="principal"
                    as="h3"
                    size="lg"
                    align="center"
                  />
                  <p className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400">
                    {t(school.principal_designation_en || 'Headmaster / Principal (M.Ed, M.A.)', school.principal_designation_np || 'प्रधानाध्यापक')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(school.name_en, school.name_np)}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed relative z-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
                  <Quote className="w-3.5 h-3.5" />
                  <span>{t(sec.title_en || "Principal's Institutional Address", sec.title_np || 'प्रधानाध्यापकको सन्देश')}</span>
                </div>
                <BlurSharpStatement
                  as="p"
                  className="italic text-base sm:text-lg text-slate-900 dark:text-slate-100 font-serif leading-relaxed"
                >
                  "{t(school.principal_message_en, school.principal_message_np)}"
                </BlurSharpStatement>
                <p>
                  {t(
                    sec.subtitle_en || 'Our focus remains deeply rooted in experiential learning, digital pedagogy, moral character building, and equal opportunity for every child.',
                    sec.subtitle_np || 'हाम्रो मुख्य उद्देश्य विद्यार्थीहरूलाई सैद्धान्तिक ज्ञानका साथै व्यावहारिक सीप, नैतिक आचरण र प्रतिस्पर्धी क्षमता प्रदान गर्नु हो।'
                  )}
                </p>
              </div>
            </div>
          </section>
        );

      // 6. INSTITUTIONAL METRICS (Calculated from Real DB Records)
      case 'stats':
        return (
          <section key="sec-stats" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">
                  <AnimatedCounter value={computedStats.students} />
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(computedStats.studentsLabelEn, computedStats.studentsLabelNp)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('ECD to Grade 12', 'शिशुदेखि कक्षा १२ सम्म')}</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">
                  <AnimatedCounter value={computedStats.staff} />
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(computedStats.staffLabelEn, computedStats.staffLabelNp)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('Certified Educators', 'दक्ष तथा तालिमप्राप्त')}</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">
                  <AnimatedCounter value={computedStats.years} />
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(computedStats.yearsLabelEn, computedStats.yearsLabelNp)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t(`Estd. ${school.estd_bs}`, `वि.सं. ${school.estd_bs} मा स्थापित`)}</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-1.5 shadow-2xs hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
                <span className="text-2xl sm:text-3xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">
                  <AnimatedCounter value={computedStats.successRate} />
                </span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t(computedStats.successLabelEn, computedStats.successLabelNp)}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('District Board Topper', 'जिल्ला प्रथम नतिजा')}</p>
              </div>
            </div>
          </section>
        );

      // 7. MODEL INFRASTRUCTURE HIGHLIGHTS
      case 'facilities':
        return (
          <section key="sec-facilities" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 overflow-hidden">
            <EducationalBackground
              config={config.educationalBackgrounds?.facilities}
              defaultPreset="science_lab"
              placement="bottom-right"
            />
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 relative z-10">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<Building2 className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />}
                title={t(sec.title_en || 'Model School Infrastructure & Facilities', sec.title_np || 'नमुना विद्यालयका भौतिक पूर्वाधारहरू')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('facilities')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('View All Facilities', 'सबै पूर्वाधार हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.slice(0, 4).map((f) => (
                <div
                  key={f.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF] dark:hover:border-blue-500 hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center font-bold">
                    {f.id === 1 ? <Microscope className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                     f.id === 2 ? <Monitor className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                     f.id === 3 ? <Library className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" /> :
                     <Trophy className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t(f.title_en, f.title_np)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {t(f.desc_en, f.desc_np)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );

      // 8. UPCOMING EVENTS & CALENDAR HIGHLIGHTS
      case 'events':
        return (
          <section key="sec-events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<Calendar className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />}
                title={t(sec.title_en || 'Upcoming Programs & Key Dates', sec.title_np || 'आगामी कार्यक्रम तथा तालिका')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('academic-calendar')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('View Full Calendar', 'पूर्ण क्यालेन्डर हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onNavigate('academic-calendar')}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-2xs hover:border-[#1E40AF] transition cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase font-mono">
                        {ev.category || 'event'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1E40AF]" />
                        <span>{t(ev.date_en, ev.date_np)}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                      {t(ev.title_en, ev.title_np)}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {t(ev.desc_en, ev.desc_np)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <MapPin className="w-3 h-3 text-[#1E40AF]" />
                      <span>{t(ev.venue_en, ev.venue_np)}</span>
                    </span>
                    <span className="text-[#1E40AF] font-semibold">{t('Details', 'विवरण')} →</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      // 9. STUDENT ACHIEVEMENTS WALL HIGHLIGHTS
      case 'achievements':
        return (
          <section key="sec-achievements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<Trophy className="w-4 h-4 text-amber-500 shrink-0" />}
                title={t(sec.title_en || 'Student Honors & Board Distinctions', sec.title_np || 'विद्यार्थी उपलब्धि तथा सम्मान')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('achievements')}
                direction="right"
                className="text-xs font-semibold text-amber-700 dark:text-amber-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('View Achievement Wall', 'उपलब्धि पर्खाल हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredAchievements.map((ach) => (
                <div
                  key={ach.id}
                  onClick={() => onNavigate('achievements')}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3 shadow-2xs hover:border-amber-400 dark:hover:border-amber-600 transition cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase font-mono">
                        {ach.year}
                      </span>
                      <Award className="w-4 h-4 text-amber-500" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                      {t(ach.title_en, ach.title_np)}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {t(ach.desc_en, ach.desc_np)}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{ach.student_name_en ? t(ach.student_name_en, ach.student_name_np || ach.student_name_en) : t('Honors Record', 'सम्मान रेकर्ड')}</span>
                    <span className="text-[#1E40AF] dark:text-blue-400 font-medium group-hover:underline">
                      {t('View Honors →', 'सम्मान हेर्नुहोस् →')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      // 10. CURRICULUM GUIDELINES & DIGITAL RESOURCES
      case 'curriculum':
        return (
          <section key="sec-curriculum" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<BookMarked className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />}
                title={t(sec.title_en || 'Curriculum Guidelines & Digital Resources', sec.title_np || 'पाठ्यक्रम निर्देशिका तथा डिजिटल स्रोत')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('curriculum')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('Access Resource Center', 'स्रोत केन्द्र हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCurriculums.map((curr) => (
                <div
                  key={curr.id}
                  onClick={() => onNavigate('curriculum')}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-2.5 shadow-2xs hover:border-[#1E40AF] transition cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300">
                      {curr.class_level}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] transition truncate">
                      {t(curr.title_en, curr.title_np || '')}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {curr.subject}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{curr.file_size_formatted || 'PDF'}</span>
                    <IconActionButton
                      action="download"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('curriculum');
                      }}
                      tooltip={t('Download Document', 'डाउनलोड गर्नुहोस्')}
                      aria-label={t('Download Document', 'डाउनलोड गर्नुहोस्')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      // 11. CAMPUS PHOTO GALLERY
      case 'gallery':
        return (
          <section key="sec-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ScrollRevealHeading as="div" className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
              <InteractiveSectionHeading
                as="h2"
                className="text-lg font-bold text-slate-900 dark:text-white"
                icon={<ImageIcon className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" />}
                title={t(sec.title_en || 'Campus Photo Gallery', sec.title_np || 'तस्बिर ग्यालरी')}
              />
              <HoverInteractiveLink
                onClick={() => onNavigate('gallery')}
                direction="right"
                className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400"
              >
                <span className="flex items-center gap-1">
                  <span>{t('View Full Gallery', 'सबै तस्बिर हेर्नुहोस्')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </HoverInteractiveLink>
            </ScrollRevealHeading>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gallery.slice(0, 4).map((g) => {
                const imgUrl = (g.url || g.image || '').trim();
                return (
                  <div
                    key={g.id}
                    onClick={() => onNavigate('gallery')}
                    className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 group cursor-pointer shadow-2xs flex flex-col"
                  >
                    <div className="h-36 overflow-hidden bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center relative">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={g.title_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-300">
                          <ImageIcon className="w-8 h-8 text-blue-500/70" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {t(g.title_en, g.title_np)}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );

      // 12. CONTACT & INSTITUTIONAL HELPDESK
      case 'contact':
        return (
          <section key="sec-contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-2">
                <span className="text-[11px] font-bold text-[#1E40AF] uppercase tracking-wider">{t('Direct Administration Helpdesk', 'सोधपुछ केन्द्र')}</span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t(sec.title_en || 'Connect With School Administration', sec.title_np || 'विद्यालय प्रशासनसँग सम्पर्क गर्नुहोस्')}
                </h3>
                <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
                  {t(
                    sec.subtitle_en || 'Have questions regarding admissions, examinations, transfer certificates, or student welfare? Our administrative team is here to assist.',
                    sec.subtitle_np || 'भर्ना, परीक्षा, स्थानान्तरण प्रमाणपत्र वा विद्यार्थी सेवा सम्बन्धी कुनै जिज्ञासा भए सिधै सम्पर्क गर्नुहोस्।'
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>{school.phone}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>{t(school.address_en, school.address_np)}</span>
                  </span>
                </div>
              </div>

              <div className="flex justify-start md:justify-end">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="px-6 py-3 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-md shadow-[#1E40AF]/20 transition cursor-pointer"
                >
                  {t('Send Inquiry / Message', 'सन्देश पठाउनुहोस्')} →
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Toast Feedback Notification */}
      {downloadSuccessMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white border border-blue-600 shadow-lg text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccessMsg}</span>
        </div>
      )}

      {/* Notice Download Confirmation Modal */}
      {pendingDownloadNotice && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingDownloadNotice(null)}
          onConfirm={() => executeDownloadNotice(pendingDownloadNotice)}
          variant="download"
          iconOnlyActions={true}
          title={t('Confirm Notice Download', 'सूचना डाउनलोड पुष्टि गर्नुहोस्')}
          description={t(
            'Do you want to download this notice?',
            'के तपाईं यो सूचना डाउनलोड गर्न चाहनुहुन्छ?'
          )}
          itemName={`${t(pendingDownloadNotice.title_en, pendingDownloadNotice.title_np)} (${pendingDownloadNotice.file_name})`}
          confirmText={t('Download', 'डाउनलोड')}
          cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        />
      )}

      {/* Notice Preview Modal */}
      {selectedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedNotice(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1E40AF] text-white uppercase">
                  {selectedNotice.category}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {t(selectedNotice.date_en, selectedNotice.date_np)}
                </span>
              </div>
              <IconActionButton
                action="close"
                appearance="ghost"
                size="sm"
                onClick={() => setSelectedNotice(null)}
                tooltip={t('Close Notice', 'सूचना बन्द गर्नुहोस्')}
                aria-label={t('Close Notice', 'सूचना बन्द गर्नुहोस्')}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {t(selectedNotice.title_en, selectedNotice.title_np)}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-[50vh] overflow-y-auto whitespace-pre-line">
                {t(selectedNotice.description_en, selectedNotice.description_np)}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <IconActionButton
                action="close"
                onClick={() => setSelectedNotice(null)}
                tooltip={t('Close Notice', 'सूचना बन्द गर्नुहोस्')}
                aria-label={t('Close Notice', 'सूचना बन्द गर्नुहोस्')}
              />

              <IconActionButton
                action="download"
                onClick={() => {
                  const toDownload = selectedNotice;
                  setSelectedNotice(null);
                  setPendingDownloadNotice(toDownload);
                }}
                tooltip={t('Download Notice', 'सूचना डाउनलोड गर्नुहोस्')}
                aria-label={t('Download Notice', 'सूचना डाउनलोड गर्नुहोस्')}
              />
            </div>
          </div>
        </div>
      )}

      {/* RENDER ALL HOMEPAGE SECTIONS IN CONTROLLED ORDER */}
      {activeSections.map(sec => renderSection(sec))}
    </div>
  );
};

export default HomeView;
