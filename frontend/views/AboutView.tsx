import React from 'react';
import { Language, SchoolData, AboutSection, SiteCustomizerConfig, SchoolFAQItem } from '../types';
import { initialAboutSections } from '../data/schoolData';
import { AboutContentRenderer } from '../components/AboutContentRenderer';
import { AboutPhotoReveal } from '../components/AboutPhotoReveal';
import { EducationalBackground } from '../components/EducationalBackground';
import { BlurSharpStatement, ScrollRevealHeading, TypographicBackground } from '../components/InteractiveTypography';
import { SchoolFAQ } from '../components/SchoolFAQ';
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
  const effectiveSections = (aboutSections.length > 0 ? aboutSections : initialAboutSections)
    .filter((section) => section.status === 'published' && section.is_enabled !== false)
    .sort((a, b) => a.display_order - b.display_order);
  const introSection = effectiveSections.find((section) => section.category === 'overview') || effectiveSections[0];
  const otherSections = effectiveSections.filter((section) => section.id !== introSection?.id);

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Target': return <Target className="w-5 h-5" />;
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'Scale': return <Scale className="w-5 h-5" />;
      case 'Building2': return <Building2 className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Heart': return <Heart className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  const sectionTitle = (section: AboutSection) => t(section.title_en, section.title_np);
  const sectionCaption = (section: AboutSection) =>
    t(section.image_caption_en || '', section.image_caption_np || '');

  const renderSectionMedia = (
    section: AboutSection,
    className: string,
    children: React.ReactNode
  ) => (
    <AboutPhotoReveal
      key={section.id}
      image={section.image}
      imagePosition={section.image_position}
      imageAlt={sectionTitle(section)}
      title={sectionTitle(section)}
      caption={sectionCaption(section)}
      mode={section.image_display_mode || 'foreground'}
      lang={lang}
      className={className}
    >
      {children}
    </AboutPhotoReveal>
  );

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {(() => {
          const hasImage = Boolean(introSection?.image?.trim() && !introSection.content_en?.includes('[[image:'));
          const introTitle = introSection
            ? sectionTitle(introSection)
            : t('About Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालयको बारेमा');
          return (
            <AboutPhotoReveal
              image={hasImage ? introSection?.image : undefined}
              imagePosition={introSection?.image_position}
              imageAlt={introTitle}
              title={introTitle}
              caption={introSection ? sectionCaption(introSection) : ''}
              mode={introSection?.image_display_mode || 'foreground'}
              lang={lang}
              className={`relative overflow-hidden transition ${
                hasImage
                  ? 'p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shadow-2xs'
                  : 'pb-8 border-b border-slate-200 dark:border-slate-800'
              }`}
            >
              <TypographicBackground
                text="ESTD 2028"
                position="top-right"
                align="right"
                opacityClass="text-slate-900/[0.025] dark:text-white/[0.02]"
              />
              <EducationalBackground
                config={siteConfig?.educationalBackgrounds?.about_intro}
                defaultPreset="library_books"
                placement="right"
              />

              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
                    <Compass className="w-3.5 h-3.5" />
                    <span>{t('Institutional Profile & Heritage', 'विद्यालयको चिनारी तथा ऐतिहासिक पृष्ठभूमि')}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                    {introTitle}
                  </h1>
                </div>

                <div className="text-slate-700 dark:text-slate-300">
                  {introSection ? (
                    <AboutContentRenderer content={t(introSection.content_en, introSection.content_np)} lang={lang} />
                  ) : (
                    <BlurSharpStatement as="p" className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t(
                        'A landmark community institution dedicated to democratic, inclusive, and scientific secondary education since 2028 B.S.',
                        'वि.सं. २०२८ मा स्थापित यस विद्यालयले गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको छ।'
                      )}
                    </BlurSharpStatement>
                  )}
                </div>

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
            </AboutPhotoReveal>
          );
        })()}

        {(() => {
          const pillars = otherSections.filter(
            (section) => section.category === 'mission' || section.category === 'vision' || section.category === 'values'
          );
          if (pillars.length === 0) return null;
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
                {pillars.map((section, index) => {
                  const hasImage = Boolean(section.image?.trim());
                  const tabletSpan = pillars.length === 3 && index === 2 ? 'md:col-span-2 lg:col-span-1' : '';
                  return renderSectionMedia(
                    section,
                    `group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out flex flex-col justify-between focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1E40AF] focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950 cursor-default select-text hover:-translate-y-1 hover:shadow-md active:translate-y-0 active:scale-[0.99] p-5 sm:p-6 lg:p-7 md:min-h-[280px] lg:min-h-[300px] ${tabletSpan} ${
                      hasImage
                        ? 'border-slate-200/90 dark:border-slate-800/90 hover:border-[#1E40AF]/50 dark:hover:border-blue-400/50 shadow-2xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 hover:border-[#1E40AF]/40 dark:hover:border-blue-400/40 shadow-2xs'
                    }`,
                    <div key={section.id} className="space-y-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-[1.04]">
                        {renderIcon(section.icon)}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {sectionTitle(section)}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line max-w-prose">
                          {t(section.content_en, section.content_np)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {otherSections
          .filter((section) =>
            section.category !== 'mission' &&
            section.category !== 'vision' &&
            section.category !== 'values' &&
            section.category !== 'governance'
          )
          .map((section) =>
            renderSectionMedia(
              section,
              'group relative overflow-hidden p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-2xs space-y-5 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1E40AF] focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950 hover:border-[#1E40AF]/40 transition-all duration-300',
              <div key={section.id} className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
                    {renderIcon(section.icon)}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{sectionTitle(section)}</h2>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <AboutContentRenderer content={t(section.content_en, section.content_np)} lang={lang} />
                </div>
              </div>
            )
          )}

        {otherSections
          .filter((section) => section.category === 'governance')
          .map((section) =>
            renderSectionMedia(
              section,
              'group relative overflow-hidden p-6 sm:p-7 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-5 shadow-2xs focus-within:outline-none focus-within:ring-2 focus-within:ring-[#1E40AF] focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-950 hover:border-[#1E40AF]/40 transition-all duration-300',
              <div key={section.id} className="space-y-5">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Building2 className="w-5 h-5 text-[#1E40AF]" />
                  <h2 className="text-lg font-bold">{sectionTitle(section)}</h2>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <AboutContentRenderer content={t(section.content_en, section.content_np)} lang={lang} />
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
            )
          )}

        <SchoolFAQ lang={lang} faqs={faqs} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default AboutView;
