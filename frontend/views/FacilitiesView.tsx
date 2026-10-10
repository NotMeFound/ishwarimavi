import React from 'react';
import { Language, Facility, SiteCustomizerConfig } from '../types';
import { EducationalBackground } from '../components/EducationalBackground';
import { ScrollRevealHeading } from '../components/InteractiveTypography';
import {
  Building2,
  Droplet,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  BookOpen,
  FlaskConical,
  Award,
  Layers
} from 'lucide-react';

interface FacilitiesViewProps {
  lang: Language;
  facilities: Facility[];
  siteConfig?: SiteCustomizerConfig;
}

interface FacilityTheme {
  icon: React.ReactNode;
  colorClass: string;
  badgeText: string;
  hoverBorder: string;
}

const InteractiveFacilityCard: React.FC<{
  fac: Facility;
  theme: FacilityTheme;
  t: (en: string, np: string) => string;
}> = ({ fac, theme, t }) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [shift, setShift] = React.useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setShift({
      x: Math.max(-2, Math.min(2, nx * 2)),
      y: Math.max(-2, Math.min(2, ny * 2)),
    });
  };

  const handlePointerLeave = () => {
    setShift({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`group relative p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs ${theme.hoverBorder} hover:shadow-md transition-all duration-200 cursor-default flex flex-col justify-between`}
      style={{
        transform: `translate3d(${shift.x.toFixed(2)}px, ${shift.y.toFixed(2)}px, 0)`,
        transition: 'transform 0.12s ease-out, border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <div className="space-y-4">
        {/* Dynamic Facility Image if uploaded by Admin */}
        {fac.image && fac.image.trim() && (
          <div className="w-full h-44 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <img
              src={fac.image}
              alt={t(fac.title_en, fac.title_np)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${theme.colorClass} group-hover:scale-105 transition-transform duration-200`}
          >
            {theme.icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
              {t(fac.title_en, fac.title_np)}
            </h2>
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-0.5 ${theme.badgeText}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>{t('Certified Campus Facility', 'सत्यापित पूर्वाधार')}</span>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t(fac.desc_en, fac.desc_np)}
        </p>
      </div>

      {fac.detailed_desc_en && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-normal">
          {t(fac.detailed_desc_en, fac.detailed_desc_np || fac.detailed_desc_en)}
        </div>
      )}
    </div>
  );
};

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({
  lang,
  facilities,
  siteConfig
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Global system theme tokens for facilities
  const getFacilityTheme = (iconStr: string) => {
    let iconElement: React.ReactNode = <Building2 className="w-5 h-5" />;
    switch (iconStr) {
      case '🔬':
        iconElement = <FlaskConical className="w-5 h-5" />;
        break;
      case '💻':
        iconElement = <Cpu className="w-5 h-5" />;
        break;
      case '📚':
        iconElement = <BookOpen className="w-5 h-5" />;
        break;
      case '⚽':
        iconElement = <Award className="w-5 h-5" />;
        break;
      default:
        iconElement = <Building2 className="w-5 h-5" />;
        break;
    }

    return {
      icon: iconElement,
      colorClass: 'bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-400 border-blue-200/80 dark:border-blue-900/60',
      hoverBorder: 'hover:border-[#1E40AF]/50 dark:hover:border-blue-500/50',
      badgeText: 'text-[#1E40AF] dark:text-blue-400'
    };
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 pb-6">
          <EducationalBackground
            config={siteConfig?.educationalBackgrounds?.facilities}
            defaultPreset="science_lab"
            placement="right"
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-400">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('Infrastructure & Equipment', 'पूर्वाधार तथा प्रविधि')}</span>
            </div>
            <ScrollRevealHeading as="h1" className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Campus Infrastructure & Facilities', 'विद्यालयका भौतिक पूर्वाधारहरू')}
            </ScrollRevealHeading>
            <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {t(
                'Designed to meet national Model School guidelines, prioritizing experiential scientific experiments, computer literacy, and physical wellness.',
                'नेपाल सरकारको नमुना विद्यालय मापदण्ड बमोजिम निर्मित अत्याधुनिक प्रयोगशाला, सूचना प्रविधि केन्द्र र खेलकुद पूर्वाधारहरू।'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {facilities.map((fac) => {
            const theme = getFacilityTheme(fac.icon);
            return (
              <InteractiveFacilityCard
                key={fac.id}
                fac={fac}
                theme={theme}
                t={t}
              />
            );
          })}
        </div>

        {/* Health & Safety Amenities with system tokens */}
        <div className="p-8 rounded-2xl bg-slate-900 text-slate-200 space-y-6 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              {t('Health, Safety & Sustainable Amenities', 'स्वास्थ्य, सुरक्षा तथा दिगो पूर्वाधार')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-blue-500/50 transition">
              <p className="font-bold text-blue-400 flex items-center gap-1.5">
                <Droplet className="w-4 h-4" />
                <span>{t('UV Purified Drinking Water', 'शुद्ध पिउने पानी')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Automated multi-stage filtration system accessible in all blocks.', 'प्रत्येक भवनमा युरोगार्ड र फिल्टरयुक्त पिउने पानीको व्यवस्था।')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-blue-500/50 transition">
              <p className="font-bold text-blue-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                <span>{t('Solar Power & UPS Backup', 'सौर्य ऊर्जा तथा ब्याकअप')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Continuous electric power for computer labs and digital boards.', 'कम्प्युटर ल्याब र डिजिटल बोर्डका लागि २४सै घण्टा विद्युत् सुविधा।')}
              </p>
            </div>
            <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700/80 space-y-1.5 hover:border-blue-500/50 transition">
              <p className="font-bold text-blue-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('CCTV Security Surveillance', 'सीसीटिभी सुरक्षा निगरानी')}</span>
              </p>
              <p className="text-slate-400 leading-relaxed">
                {t('Comprehensive campus boundary monitoring for student safety.', 'विद्यार्थीहरूको सुरक्षाका लागि क्याम्पस परिसरभर क्यामेरा निगरानी।')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesView;
