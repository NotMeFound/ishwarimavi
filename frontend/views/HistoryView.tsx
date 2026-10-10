import React, { useState, useRef } from 'react';
import { Language, HistoryItem, SiteCustomizerConfig, SchoolData } from '../types';
import { useInView, useReducedMotion, motion } from 'motion/react';
import { AnimatedCounter } from '../components/InteractiveTypography';
import {
  History,
  Clock,
  Calendar,
  Building2,
  Award,
  GraduationCap,
  Users,
  HeartHandshake,
  CheckCircle2,
  BookOpen,
  MapPin,
  ChevronRight,
  ShieldCheck,
  FileText,
  Maximize2,
  X,
  Image as ImageIcon
} from 'lucide-react';

interface HistoryViewProps {
  lang: Language;
  history: HistoryItem[];
  siteConfig?: SiteCustomizerConfig;
  school?: SchoolData;
}

interface HistoricalLeader {
  name_en: string;
  name_np: string;
  tenure_bs: string;
  role_en: string;
  role_np: string;
  key_achievement_en: string;
  key_achievement_np: string;
}

const historicalLeaders: HistoricalLeader[] = [
  {
    name_en: "Late Pt. Dilaram Adhikari",
    name_np: "स्व. पं. डिल्लीराम अधिकारी",
    tenure_bs: "२०३५ - २०४३",
    role_en: "Founding Headmaster",
    role_np: "संस्थापक प्रधानाध्यापक",
    key_achievement_en: "Established the primary schooling foundation under community thatch roof with 45 village children.",
    key_achievement_np: "४५ जना गाउँका बालबालिकालाई खरको छानामुनि प्रारम्भिक अक्षरारम्भ गराउँदै जग बसाल्नुभएको।"
  },
  {
    name_en: "Mr. Ram Prasad Sharma",
    name_np: "श्री रामप्रसाद शर्मा",
    tenure_bs: "२०४३ - २०५५",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Expanded the school to Lower Secondary level, secured government teacher quotas, and built stone masonry classrooms.",
    key_achievement_np: "निम्न माध्यमिक तहमा स्तरोन्नति, सरकारी शिक्षक दरबन्दी व्यवस्थापन र ढुङ्गा-माटोको पक्की भवन निर्माण।"
  },
  {
    name_en: "Mr. Khem Bahadur KC",
    name_np: "श्री खेमबहादुर केसी",
    tenure_bs: "२०५५ - २०६९",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Upgraded to Secondary High School, guided the historic first batch of SLC examinees to 100% pass result.",
    key_achievement_np: "माध्यमिक तह (SLC) सम्म विस्तार र पहिलो ब्याचमै शतप्रतिशत सफलता हासिल।"
  },
  {
    name_en: "Mr. Narayan Prasad Koirala",
    name_np: "श्री नारायणप्रसाद कोइराला",
    tenure_bs: "२०६९ - २०७८",
    role_en: "Former Headmaster",
    role_np: "पूर्व प्रधानाध्यापक",
    key_achievement_en: "Introduced Higher Secondary (+2) Science, Management & Education streams; laid foundation for Model School status.",
    key_achievement_np: "+२ विज्ञान, व्यवस्थापन र शिक्षा संकायको सम्बन्धन तथा नमुना विद्यालय अवधारणाको जग निर्माण।"
  },
  {
    name_en: "Mr. Ram Bahadur Thapa",
    name_np: "श्री रामबहादुर थापा",
    tenure_bs: "२०७८ - हालसम्म",
    role_en: "Current Principal",
    role_np: "वर्तमान प्रधानाध्यापक",
    key_achievement_en: "Steering the modern Digital Smart Campus, integrated STEAM laboratories, and nationwide Model School excellence.",
    key_achievement_np: "आधुनिक डिजिटल स्मार्ट क्याम्पस, स्टिम प्रयोगशाला तथा राष्ट्रिय नमुना विद्यालयको सफल नेतृत्व।"
  }
];

const foundingPillars = [
  {
    title_en: "Community Land Donors",
    title_np: "जग्गादाता तथा समाजसेवीहरू",
    desc_en: "Generous local village families who gifted 18 Ropanis of fertile community land in 2035 B.S. to ensure education for all children.",
    desc_np: "वि.सं. २०३५ मा आफ्ना बालबालिकाको उज्ज्वल भविष्यका लागि १८ रोपनी बहुमूल्य जग्गा निःशुल्क दान गर्ने स्थानीय महानुभावहरू।"
  },
  {
    title_en: "Voluntary Laborers (Shramadan)",
    title_np: "श्रमदानी ग्रामीण समुदाय",
    desc_en: "Hundreds of villagers and guardians who carried river stone, timber, and red bricks on their backs to construct the earliest classrooms.",
    desc_np: "नदीबाट ढुङ्गा, बालुवा र जंगलबाट काठ-दाउरा बोकेर विद्यालयको पहिलो भवन निर्माणमा पसिना बगाउने सम्पूर्ण गाउँले जनसमुदाय।"
  },
  {
    title_en: "Pioneer Teachers & Gurus",
    title_np: "प्रारम्भिक शिक्षक तथा गुरुवर्ग",
    desc_en: "Selfless educators who taught for years on minimal community grain stipends, driven purely by devotion to literacy.",
    desc_np: "न्यूनतम अन्न-मुठीदानमा वर्षौंसम्म निरन्तर ज्ञानको दीप प्रज्वलित गर्ने त्यागी र निष्ठावान गुरुजनहरू।"
  }
];

interface TimelineMilestoneItemProps {
  item: HistoryItem;
  index: number;
  isNp: boolean;
  t: (en: string, np: string) => string;
  onOpenLightbox: (data: { url: string; title: string; caption?: string }) => void;
}

const TimelineMilestoneItem: React.FC<TimelineMilestoneItemProps> = ({
  item,
  index,
  isNp,
  t,
  onOpenLightbox,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(itemRef, { margin: '-15% 0px -25% 0px' });
  const shouldReduceMotion = useReducedMotion();

  const milestoneTitle = t(item.title_en, item.title_np);
  const milestoneDesc = t(item.desc_en, item.desc_np);
  const caption = item.image_caption_en || item.image_caption_np
    ? t(item.image_caption_en || item.image_caption_np || '', item.image_caption_np || item.image_caption_en || '')
    : undefined;

  return (
    <div ref={itemRef} className="relative pl-6 sm:pl-8 group">
      {/* Visual Dot on Spine - transforms smoothly to warm amber accent when active */}
      <div
        className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full transition-all duration-300 ${
          isInView
            ? 'bg-amber-500 border-2 border-white dark:border-slate-900 ring-4 ring-amber-400/30 scale-110 shadow-md'
            : 'bg-[#1E40AF] border-2 border-white dark:border-slate-950 shadow-xs'
        }`}
      />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`p-6 sm:p-7 rounded-2xl border transition-all duration-300 space-y-4 ${
          isInView
            ? 'border-amber-300/70 dark:border-amber-600/50 bg-amber-50/20 dark:bg-amber-950/10 shadow-md'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-[#1E40AF]/50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Year tag receives subtle orange accent treatment when active */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-lg border transition-all duration-300 ${
              isInView
                ? 'text-amber-800 dark:text-amber-200 bg-amber-100/90 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700/80 shadow-xs'
                : 'text-[#1E40AF] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isInView ? 'text-amber-600 dark:text-amber-400' : 'text-[#1E40AF] dark:text-blue-400'}`} />
            <span>{item.year}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {t(`Milestone #${index + 1}`, `ऐतिहासिक कोशेढुङ्गा #${index + 1}`)}
          </span>
        </div>

        <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-200 ${
          isInView ? 'text-amber-900 dark:text-amber-100' : 'text-slate-900 dark:text-white'
        }`}>
          {milestoneTitle}
        </h3>

        {/* Milestone Image (if present) */}
        {Boolean(item.image && item.image.trim()) && (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 group/img">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={item.image}
                alt={milestoneTitle}
                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => onOpenLightbox({ url: item.image!, title: milestoneTitle, caption })}
              />
            </div>
            {caption && (
              <div className="p-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 italic">
                {caption}
              </div>
            )}
          </div>
        )}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {milestoneDesc}
        </p>
      </motion.div>
    </div>
  );
};

export const HistoryView: React.FC<HistoryViewProps> = ({ lang, history, siteConfig, school }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [activeEra, setActiveEra] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Background Image Configuration for School History page
  const isBgEnabled = (siteConfig?.historyBgEnabled ?? false) || (school?.history_bg_enabled ?? false);
  const rawBgUrl = siteConfig?.historyBgImage || school?.history_bg_image || '';
  const historyBgUrl = isBgEnabled && rawBgUrl && rawBgUrl.trim() ? rawBgUrl.trim() : '';

  const bgPositionMode = siteConfig?.historyBgPosition || school?.history_bg_position || 'center';
  const customPosition = siteConfig?.historyBgCustomPosition || school?.history_bg_custom_position || 'center';
  const bgPosition = bgPositionMode === 'custom' ? customPosition : bgPositionMode;
  const bgSize = siteConfig?.historyBgSize || school?.history_bg_size || 'cover';

  const overlayEnabled = siteConfig?.historyBgOverlayEnabled ?? school?.history_bg_overlay_enabled ?? true;
  const rawOverlayOpacity = siteConfig?.historyBgOverlayOpacity ?? school?.history_bg_overlay_opacity ?? 80;
  const overlayOpacity = overlayEnabled ? Math.min(Math.max(rawOverlayOpacity / 100, 0), 0.98) : 0;

  // Filter only published milestones for public display and sort by display_order
  const publishedMilestones = (history || [])
    .filter(item => item.status !== 'unpublished' && item.is_enabled !== false)
    .sort((a, b) => {
      const orderA = a.display_order !== undefined ? a.display_order : 999;
      const orderB = b.display_order !== undefined ? b.display_order : 999;
      return orderA - orderB;
    });

  // Filter published history by era
  const filteredHistory = publishedMilestones.filter(item => {
    if (activeEra === 'all') return true;
    const yearNum = parseInt(item.year.replace(/[^0-9]/g, ''), 10);
    if (isNaN(yearNum)) return true;
    if (activeEra === 'foundation') return yearNum <= 2045;
    if (activeEra === 'expansion') return yearNum > 2045 && yearNum <= 2065;
    if (activeEra === 'modern') return yearNum > 2065;
    return true;
  });

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      {/* Lightbox Modal for Milestone Images */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {lightboxImage.title}
                </h4>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={t('Close Image Preview', 'बन्द गर्नुहोस्')}
                aria-label={t('Close Image Preview', 'बन्द गर्नुहोस्')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto bg-black/50">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
            {lightboxImage.caption && (
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 text-xs text-slate-300 text-center">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. HERO INSTITUTIONAL HERITAGE BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-6 sm:p-10 md:p-12 border border-slate-800 shadow-xl">
          {/* Layer 0: Background Media (Image or Animated GIF) / Fallback Gradient */}
          {historyBgUrl ? (
            <img
              src={historyBgUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none z-0 transition-opacity duration-700"
              style={{ objectPosition: bgPosition }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="absolute inset-0 z-0 bg-linear-to-br from-[#0B1528] via-[#1E3A8A] to-[#172554] pointer-events-none select-none" />
          )}

          {/* Layer 1: Contrast Overlay, Decorative Grid & Nepali Text */}
          {/* Subtle Institutional Overlay */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-1 pointer-events-none transition-opacity duration-300 ${
              historyBgUrl ? 'bg-slate-950' : 'bg-transparent'
            }`}
            style={historyBgUrl ? { opacity: Math.max(overlayOpacity, 0.55) } : undefined}
          />

          {/* Decorative Grid Pattern */}
          <div
            aria-hidden="true"
            className={`absolute inset-0 z-1 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none ${
              historyBgUrl ? 'opacity-15' : 'opacity-20'
            }`}
          />

          {/* Large Nepali Decorative Watermark (Behind Content) */}
          <div
            aria-hidden="true"
            className="absolute -right-4 sm:-right-8 -bottom-6 sm:-bottom-10 z-1 opacity-10 text-[110px] sm:text-[160px] md:text-[180px] font-serif font-black select-none pointer-events-none text-white leading-none overflow-hidden"
          >
            २०३५
          </div>

          {/* Layer 2: Independent Content Layer */}
          <div className="relative z-2 max-w-3xl space-y-4">
            {/* Established Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-mono font-bold tracking-wide border border-amber-400/30 backdrop-blur-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('Established 2035 B.S. (1978 A.D.)', 'स्थापना: वि.सं. २०३५ (सन् १९७८)')}</span>
            </div>

            {/* Main Hero Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
              {t('Four Decades of Educational Heritage', 'गौरवमय चार दशकको ऐतिहासिक यात्रा')}
            </h1>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base text-blue-100/90 leading-relaxed drop-shadow-2xs">
              {t(
                'From a modest community-funded hut with thatch roofing in 2035 B.S. to one of the nation’s highest-ranked Government Model Secondary Schools, Ishwari Secondary School has illuminated thousands of lives with knowledge, virtue, and resilience.',
                'वि.सं. २०३५ मा समुदायको अगाध निष्ठा र श्रमदानबाट स्थापित सानो प्राथमिक पाठशालादेखि आजको अत्याधुनिक, प्रविधिमैत्री नमुना माध्यमिक विद्यालयसम्मको संघर्ष, समर्पण र सफलताको अविस्मरणीय इतिहास।'
              )}
            </p>

            {/* Heritage Stats Strip (Responsive Reflow) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/20 text-xs">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  <AnimatedCounter value={isNp ? "४८+" : "48+"} /> {t('Years', 'वर्ष')}
                </span>
                <span className="text-blue-100">{t('Years of Service', 'निरन्तर सेवा')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  <AnimatedCounter value={isNp ? "१०,०००+" : "10,000+"} />
                </span>
                <span className="text-blue-100">{t('Graduated Alumni', 'उत्कृष्ट पूर्व विद्यार्थी')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  <AnimatedCounter value="100%" />
                </span>
                <span className="text-blue-100">{t('SEE Success Track', 'एसईई निरन्तर सफलता')}</span>
              </div>
              <div>
                <span className="block text-xl sm:text-2xl font-black text-amber-300 font-mono">
                  {t('Model', 'नमुना')}
                </span>
                <span className="text-blue-100">{t('Govt Model Status', 'नेपाल सरकार नमुना मावि')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CHRONOLOGICAL TIMELINE OF MILESTONES */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
                <History className="w-3.5 h-3.5" />
                <span>{t('Chronicle of Milestones', 'ऐतिहासिक कालखण्डहरू')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {t('From Inception to Modern Excellence', 'स्थापनादेखि नमुना विद्यालयसम्म')}
              </h2>
            </div>

            {/* Era Filter Pills */}
            {publishedMilestones.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start">
                {[
                  { id: 'all', en: 'All Eras', np: 'सबै कालखण्ड' },
                  { id: 'foundation', en: '2035–2045', np: '२०३५–२०४५' },
                  { id: 'expansion', en: '2046–2065', np: '२०४६–२०६५' },
                  { id: 'modern', en: '2066–Present', np: '२०६६–हालसम्म' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEra(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      activeEra === tab.id
                        ? 'bg-[#1E40AF] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t(tab.en, tab.np)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Milestone Content Area */}
          {publishedMilestones.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
              <History className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
                {t('School history information will be available soon.', 'विद्यालयको ऐतिहासिक विवरण चाँडै उपलब्ध गराइनेछ।')}
              </p>
              <p className="text-xs text-slate-500">
                {t('The institution is archiving historical records and milestones.', 'ऐतिहासिक अभिलेख तथा कोसेढुङ्गाहरू अभिलेखीकरण भइरहेको छ।')}
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-500 text-xs">
              {t('No milestones recorded under the selected era.', 'चयन गरिएको कालखण्डमा कुनै कोसेढुङ्गा दर्ता भएको छैन।')}
            </div>
          ) : (
            <div className="relative border-l-2 border-[#1E40AF]/30 dark:border-blue-900/40 ml-4 sm:ml-6 space-y-10 pb-6">
              {filteredHistory.map((item, index) => (
                <TimelineMilestoneItem
                  key={item.id ?? index}
                  item={item}
                  index={index}
                  isNp={isNp}
                  t={t}
                  onOpenLightbox={setLightboxImage}
                />
              ))}
            </div>
          )}
        </section>

        {/* 3. FOUNDING PILLARS & COMMUNITY VISIONARIES */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{t('Sacrifice & Service', 'त्याग र समर्पणको कदर')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Founding Pillars & Community Visionaries', 'संस्थापक स्तम्भ तथा जग्गादाताहरू')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'We pay perpetual tribute to the benevolent leaders whose foresight gave birth to this temple of learning.',
                'विद्यालय स्थापनामा निःस्वार्थ योगदान पुर्याउनुहुने सम्पूर्ण अभिभावक, जग्गादाता तथा अग्रजहरूप्रति हार्दिक नमन।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {foundingPillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-300 flex items-center justify-center font-bold text-base">
                  {idx + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t(pillar.title_en, pillar.title_np)}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(pillar.desc_en, pillar.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CHRONOLOGY OF INSTITUTIONAL LEADERSHIP (HEADMASTERS) */}
        <section className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <Users className="w-3.5 h-3.5" />
              <span>{t('Leadership Roll of Honor', 'नेतृत्वको नामावली')}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t("Principals' Historic Chronology", 'प्रधानाध्यापकहरूको ऐतिहासिक नामावली')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t(
                'Distinguished educators who navigated and enriched Ishwari Secondary School across various developmental eras.',
                'विद्यालयको शैक्षिक तथा भौतिक विकासमा दिशानिर्देश गर्नुहुने आदरणीय प्रधानाध्यापकहरू।'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {historicalLeaders.map((leader, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                    {leader.tenure_bs}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {t(leader.role_en, leader.role_np)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(leader.name_en, leader.name_np)}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(`Tenure: ${leader.tenure_bs}`, `कार्यकाल: ${leader.tenure_bs}`)}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
                  {t(leader.key_achievement_en, leader.key_achievement_np)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. INSTITUTIONAL PLEDGE & ENDURING LEGACY */}
        <section className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF] dark:text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('Enduring Institutional Pledge', 'संस्थागत प्रतिबद्धता')}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('Preserving Heritage While Embracing the Future', 'गौरवशाली इतिहासको जगमा प्रविधिमैत्री भविष्य')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'As Ishwari Secondary School strides towards its golden jubilee, we stand resolute in our mission: providing equitable, world-class community education rooted in Nepali culture, moral values, and global competence.',
                'स्वर्ण महोत्सवको संघारमा उभिएर ईश्वरी माध्यमिक विद्यालय स्थानीय संस्कार, राष्ट्रिय गौरव र विश्वस्तरीय प्रतिस्पर्धात्मक शिक्षाको संगमस्थल बन्ने संकल्प गर्दछ।'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="block text-2xl font-black text-[#1E40AF] dark:text-blue-400 font-mono">२०३५</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('Origin Year', 'स्थापना वर्ष')}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="block text-2xl font-black text-amber-500 font-mono">२०८३</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{t('Current Session', 'वर्तमान सत्र')}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HistoryView;
