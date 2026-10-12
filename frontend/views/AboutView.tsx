import React from 'react';
import { Language, SchoolData, AboutSection, SiteCustomizerConfig } from '../types';
import { initialAboutSections } from '../data/schoolData';
import { AboutContentRenderer } from '../components/AboutContentRenderer';
import { EducationalBackground } from '../components/EducationalBackground';
import { BlurSharpStatement, ScrollRevealHeading, TypographicBackground } from '../components/InteractiveTypography';
import { SchoolFAQ } from '../components/SchoolFAQ';
import { SchoolFAQItem } from '../types';
import {
  Target,
  Eye,
  Scale,
  Building2,
  ArrowRight,
  FileText,
  History,
  Compass,
  Award,
  BookOpen,
  Heart,
  Users,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface AboutViewProps {
  lang: Language;
  school: SchoolData;
  aboutSections?: AboutSection[];
  faqs?: SchoolFAQItem[];
  onNavigate: (route: string) => void;
  siteConfig?: SiteCustomizerConfig;
}

export function AboutView({
  lang,
  school,
  aboutSections = initialAboutSections,
  faqs,
  onNavigate,
  siteConfig
}: AboutViewProps) {
  const isNp = lang === 'np';
  const t = (en: string, np?: string) => (isNp && np ? np : en);

  // Active sections: only published and enabled, sorted by display_order
  const effectiveSections = (aboutSections && aboutSections.length > 0 ? aboutSections : initialAboutSections)
    .filter((s) => s.status === 'published' && s.is_enabled !== false)
    .sort((a, b) => a.display_order - b.display_order);

  // Separate overview/intro section from pillars and custom sections
  const introSection = effectiveSections.find((s) => s.category === 'overview') || effectiveSections[0];
  const otherSections = effectiveSections.filter((s) => s.id !== introSection?.id);

  // Helper to render section icon dynamically
  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Target':
        return <Target className="w-5 h-5" />;
      case 'Eye':
        return <Eye className="w-5 h-5" />;
      case 'Scale':
        return <Scale className="w-5 h-5" />;
      case 'Building2':
        return <Building2 className="w-5 h-5" />;
      case 'Award':
        return <Award className="w-5 h-5" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5" />;
      case 'Heart':
        return <Heart className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'Compass':
      default:
        return <Compass className="w-5 h-5" />;
    }
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header / Intro Section */}
        {(() => {
          const introHasBg = Boolean(introSection?.image && introSection.image.trim() && !introSection.content_en?.includes('[[image:'));
          const introPosClass =
            introSection?.image_position === 'top'
              ? 'object-top'
              : introSection?.image_position === 'bottom'
              ? 'object-bottom'
              : introSection?.image_position === 'left'
              ? 'object-left'
              : introSection?.image_position === 'right'
              ? 'object-right'
              : 'object-center';

          return (
            <div
              className={`relative overflow-hidden transition ${
                introHasBg
                  ? 'p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-2xs'
                  : 'pb-8 border-b border-slate-200 dark:border-slate-800'
              }`}
            >
              {introHasBg && (
                <>
                  <img
                    src={introSection?.image}
                    alt=""
                    aria-hidden="true"
                    className={`absolute inset-0 w-full h-full object-cover ${introPosClass} pointer-events-none select-none z-0`}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-white/92 dark:bg-slate-950/92 backdrop-blur-[1px] pointer-events-none z-1" />
                </>
              )}

              {/* Typographic Ambient Background: ESTD 2028 */}
              <TypographicBackground
                text="ESTD 2028"
                position="top-right"
                align="right"
                opacityClass="text-slate-900/[0.025] dark:text-white/[0.02]"
              />

              {/* Educational Background Watermark: Open Books / Library Books */}
              <EducationalBackground
                config={siteConfig?.educationalBackgrounds?.about_intro}
                defaultPreset="library_books"
                placement="right"
              />

              <div className="relative z-10 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('Institutional Profile & Heritage', 'विद्यालयको चिनारी तथा ऐतिहासिक पृष्ठभूमि')}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                    {introSection ? t(introSection.title_en, introSection.title_np) : t('About Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालयको बारेमा')}
                  </h1>
                </div>

                <div className="text-slate-700 dark:text-slate-300">
                  {introSection ? (
                    <AboutContentRenderer
                      content={t(introSection.content_en, introSection.content_np)}
                      lang={lang}
                    />
                  ) : (
                    <BlurSharpStatement as="p" className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t(
                        'A landmark community institution dedicated to democratic, inclusive, and scientific secondary education since 2028 B.S.',
                        'वि.सं. २०२८ मा स्थापित यस विद्यालयले गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको छ।'
                      )}
                    </BlurSharpStatement>
                  )}
                </div>

                {/* Quick institutional badges */}
                <div className="pt-2 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1E40AF] dark:bg-blue-900/30 dark:text-blue-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t(`Established: ${school.estd_bs} B.S. (${school.estd_ad})`, `स्थापना: वि.सं. ${school.estd_bs}`)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t(school.address_en, school.address_np)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t('Government Accredited Secondary', 'नेपाल सरकार स्वीकृत माध्यमिक')}</span>
                  </span>
                  <a
                    href="#school-faq-section"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1E40AF] dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{t('School FAQs', 'प्रायः सोधिने प्रश्नहरू (FAQ)')}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Sections Grid (Mission, Vision, Values, etc.) */}
        {(() => {
          const pillarSections = otherSections.filter(
            (s) => s.category === 'mission' || s.category === 'vision' || s.category === 'values'
          );

          if (pillarSections.length === 0) return null;

          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <ScrollRevealHeading as="h2" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('Institutional Pillars & Core Principles', 'संस्थागत आधारस्तम्भ तथा मूल सिद्धान्त')}
                  </ScrollRevealHeading>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {t(
                      'Guiding Ishwari Secondary School’s academic mission, future vision, and student code',
                      'ईश्वरी माध्यमिक विद्यालयको उद्देश्य, भावी दृष्टिकोण र विद्यार्थी आचारसंहिता'
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
                {pillarSections.map((section, idx) => {
                  const hasBg = Boolean(section.image && section.image.trim());
                  const objectPosClass =
                    section.image_position === 'top'
                      ? 'object-top'
                      : section.image_position === 'bottom'
                      ? 'object-bottom'
                      : section.image_position === 'left'
                      ? 'object-left'
                      : section.image_position === 'right'
                      ? 'object-right'
                      : 'object-center';

                  // If there are 3 pillar sections, make 3rd card span 2 cols on tablet for [1][2] / [ 3 ] arrangement
                  const tabletSpanClass =
                    pillarSections.length === 3 && idx === 2
                      ? 'md:col-span-2 lg:col-span-1'
                      : '';

                  return (
                    <div
                      key={section.id}
                      tabIndex={0}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 cursor-default select-text hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.99] p-5 sm:p-6 lg:p-7 md:min-h-[280px] lg:min-h-[300px] ${tabletSpanClass} ${
                        hasBg
                          ? 'border-slate-200/90 dark:border-slate-800/90 hover:border-[#1E40AF]/50 dark:hover:border-blue-400/50 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 hover:border-[#1E40AF]/40 dark:hover:border-blue-400/40 shadow-2xs'
                      }`}
                    >
                      {/* Background Image Layer: strictly behind content, never determines card height */}
                      {hasBg && (
                        <>
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
                          >
                            <img
                              src={section.image}
                              alt=""
                              aria-hidden="true"
                              className={`w-full h-full object-cover ${objectPosClass} transform transition-transform duration-300 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04]`}
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Subtle educational institution overlay ensuring WCAG AAA readability */}
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 z-1 bg-white/92 sm:bg-white/88 dark:bg-slate-950/92 sm:dark:bg-slate-950/88 backdrop-blur-[0.5px] transition-colors duration-200 group-hover:bg-white/84 dark:group-hover:bg-slate-950/84 pointer-events-none"
                          />
                        </>
                      )}

                      {/* Content Layer in normal document flow with higher z-index */}
                      <div className="relative z-2 space-y-3.5">
                        {/* Monochrome institutional icon with subtle hover accent */}
                        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-[1.04] group-hover:bg-blue-100/70 dark:group-hover:bg-blue-900/60">
                          {renderIcon(section.icon)}
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors duration-200">
                            {t(section.title_en, section.title_np)}
                          </h3>
                          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line max-w-prose">
                            {t(section.content_en, section.content_np)}
                          </p>
                        </div>
                      </div>

                      {/* Optional metadata or caption footer */}
                      {(section.image_caption_en || section.image_caption_np) && hasBg && (
                        <div className="relative z-2 pt-4 mt-auto border-t border-slate-200/60 dark:border-slate-800/60">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
                            {t(section.image_caption_en || '', section.image_caption_np || '')}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Additional Custom/Extended Sections created by Admin */}
        {otherSections
          .filter((s) => s.category !== 'mission' && s.category !== 'vision' && s.category !== 'values' && s.category !== 'governance')
          .map((section) => {
            const hasBg = Boolean(section.image && section.image.trim());
            const objectPosClass =
              section.image_position === 'top'
                ? 'object-top'
                : section.image_position === 'bottom'
                ? 'object-bottom'
                : section.image_position === 'left'
                ? 'object-left'
                : section.image_position === 'right'
                ? 'object-right'
                : 'object-center';

            return (
              <div
                key={section.id}
                tabIndex={0}
                className="group relative overflow-hidden p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 hover:border-[#1E40AF]/40 transition-all duration-300"
              >
                {hasBg && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
                    >
                      <img
                        src={section.image}
                        alt=""
                        aria-hidden="true"
                        className={`w-full h-full object-cover ${objectPosClass} transform transition-transform duration-300 group-hover:scale-[1.03]`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-1 bg-white/92 sm:bg-white/88 dark:bg-slate-950/92 sm:dark:bg-slate-950/88 backdrop-blur-[0.5px] pointer-events-none"
                    />
                  </>
                )}

                <div className="relative z-2 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                      {renderIcon(section.icon)}
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {t(section.title_en, section.title_np)}
                    </h2>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <AboutContentRenderer
                      content={t(section.content_en, section.content_np)}
                      lang={lang}
                    />
                  </div>
                </div>
              </div>
            );
          })}

        {/* Governance / SMC Section */}
        {otherSections
          .filter((s) => s.category === 'governance')
          .map((section) => {
            const hasBg = Boolean(section.image && section.image.trim());
            const objectPosClass =
              section.image_position === 'top'
                ? 'object-top'
                : section.image_position === 'bottom'
                ? 'object-bottom'
                : section.image_position === 'left'
                ? 'object-left'
                : section.image_position === 'right'
                ? 'object-right'
                : 'object-center';

            return (
              <div
                key={section.id}
                tabIndex={0}
                className="group relative overflow-hidden p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-5 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 hover:border-[#1E40AF]/40 transition-all duration-300"
              >
                {hasBg && (
                  <>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none"
                    >
                      <img
                        src={section.image}
                        alt=""
                        aria-hidden="true"
                        className={`w-full h-full object-cover ${objectPosClass} transform transition-transform duration-300 group-hover:scale-[1.03]`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 z-1 bg-white/92 sm:bg-white/88 dark:bg-slate-950/92 sm:dark:bg-slate-950/88 backdrop-blur-[0.5px] pointer-events-none"
                    />
                  </>
                )}

                <div className="relative z-2 space-y-5">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                    <Building2 className="w-5 h-5 text-[#1E40AF]" />
                    <h2 className="text-lg font-bold">
                      {t(section.title_en, section.title_np)}
                    </h2>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <AboutContentRenderer
                      content={t(section.content_en, section.content_np)}
                      lang={lang}
                    />
                  </div>
                  <div className="pt-2 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => onNavigate('documents')}
                      className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-[#1E40AF] text-white hover:bg-[#1D4ED8] shadow-xs shadow-[#1E40AF]/25 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('View Citizen Charter & Audit Reports', 'नागरिक बडापत्र तथा सामाजिक प्रतिवेदन')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('history')}
                      className="px-4 py-2.5 rounded-lg font-semibold text-xs bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>{t('Read Complete History Timeline', 'ऐतिहासिक समयरेखा हेर्नुहोस्')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Frequently Asked Questions (FAQ) Section */}
        <SchoolFAQ lang={lang} faqs={faqs} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default AboutView;
