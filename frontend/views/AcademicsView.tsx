import React from 'react';
import { Language, AcademicProgram, SiteCustomizerConfig } from '../types';
import { initialPrograms } from '../data/schoolData';
import { EducationalBackground } from '../components/EducationalBackground';
import {
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  CheckCircle2,
  Atom,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';

interface AcademicsViewProps {
  lang: Language;
  programs?: AcademicProgram[];
  siteConfig?: SiteCustomizerConfig;
}

export const AcademicsView: React.FC<AcademicsViewProps> = ({
  lang,
  programs = initialPrograms,
  siteConfig
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const getStreamColor = (id: number) => {
    switch (id) {
      case 1: // ECD
        return {
          border: 'hover:border-amber-400 dark:hover:border-amber-600',
          badge: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-600 dark:text-amber-400',
        };
      case 2: // Basic
        return {
          border: 'hover:border-sky-400 dark:hover:border-sky-600',
          badge: 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          iconColor: 'text-sky-600 dark:text-sky-400',
        };
      case 3: // Secondary
        return {
          border: 'hover:border-blue-400 dark:hover:border-blue-600',
          badge: 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
        };
      case 4: // +2 Science
        return {
          border: 'hover:border-emerald-400 dark:hover:border-emerald-600',
          badge: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
        };
      case 5: // +2 Management
        return {
          border: 'hover:border-indigo-400 dark:hover:border-indigo-600',
          badge: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          iconColor: 'text-indigo-600 dark:text-indigo-400',
        };
      default: // +2 Education
        return {
          border: 'hover:border-rose-400 dark:hover:border-rose-600',
          badge: 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          iconColor: 'text-rose-600 dark:text-rose-400',
        };
    }
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="relative overflow-hidden border-b border-slate-200 dark:border-slate-800 pb-6">
          <EducationalBackground
            config={siteConfig?.educationalBackgrounds?.academics}
            defaultPreset="open_books"
            placement="right"
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A] dark:text-blue-400">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t('Curriculum & Pedagogy', 'पाठ्यक्रम तथा शिक्षण अभ्यास')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Academic Programs & Streams', 'शैक्षिक कार्यक्रम तथा संकायहरू')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
              {t(
                'Structured curriculum aligned with Curriculum Development Centre (CDC) and National Examination Board (NEB) standards, enriched by experiential learning.',
                'पाठ्यक्रम विकास केन्द्र (CDC) र राष्ट्रिय परीक्षा बोर्ड (NEB) को मापदण्ड अनुसार सञ्चालित स्तरीय कक्षाहरू।'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => {
            const styles = getStreamColor(prog.id);
            return (
              <div
                key={prog.id}
                className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-2xs ${styles.border} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-md border ${styles.badge}`}>
                    {prog.level}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1">
                    <Users className={`w-3.5 h-3.5 ${styles.iconColor}`} />
                    <span>{t(`Intake: ${prog.intake}`, `सिट संख्या: ${prog.intake}`)}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {t(prog.title_en, prog.title_np)}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {t(prog.desc_en, prog.desc_np)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className={`w-3.5 h-3.5 ${styles.iconColor}`} />
                    <span>{prog.duration}</span>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold text-xs ${styles.iconColor}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('Certified CDC/NEB Curriculum', 'प्रमाणित पाठ्यक्रम')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AcademicsView;
