import React, { useState, useMemo } from 'react';
import { Language, Achievement, AchievementCategory } from '../types';
import {
  Trophy,
  Award,
  Medal,
  Star,
  Search,
  Filter,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  CheckCircle2,
  X,
  Target
} from 'lucide-react';
import { AnimatedCounter } from '../components/InteractiveTypography';

interface AchievementsViewProps {
  lang: Language;
  achievements: Achievement[];
}

const CATEGORY_MAP: Record<
  AchievementCategory,
  { labelEn: string; labelNp: string; color: string; bg: string; border: string }
> = {
  academic: {
    labelEn: 'Academic Board',
    labelNp: 'शैक्षिक उत्कृष्टता',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  sports: {
    labelEn: 'Sports & Athletics',
    labelNp: 'खेलकुद तथा एथलेटिक्स',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  arts: {
    labelEn: 'Fine Arts & Literature',
    labelNp: 'ललितकला तथा साहित्य',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  competition: {
    labelEn: 'Quiz & Olympiad',
    labelNp: 'प्रतियोगिता तथा हाजिरीजवाफ',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  science: {
    labelEn: 'Science & Innovation',
    labelNp: 'विज्ञान तथा प्रविधि',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  cultural: {
    labelEn: 'Cultural & Performing Arts',
    labelNp: 'सांस्कृतिक कार्यक्रम',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  other: {
    labelEn: 'General Distinction',
    labelNp: 'अन्य विशिष्ट सम्मान',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  }
};

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  lang,
  achievements = []
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Filter published only
  const publishedAchievements = useMemo(() => {
    return achievements.filter(a => a.published !== false);
  }, [achievements]);

  // Extract distinct years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    publishedAchievements.forEach(a => {
      if (a.year) set.add(a.year);
    });
    return Array.from(set).sort().reverse();
  }, [publishedAchievements]);

  // Calculated Real Statistics strictly from actual database records (No hardcoded numbers!)
  const stats = useMemo(() => {
    const total = publishedAchievements.length;
    const academic = publishedAchievements.filter(a => a.category === 'academic').length;
    const sports = publishedAchievements.filter(a => a.category === 'sports').length;
    const competitions = publishedAchievements.filter(a => a.category === 'competition' || a.category === 'science').length;

    return { total, academic, sports, competitions };
  }, [publishedAchievements]);

  // Filtered list
  const filteredAchievements = useMemo(() => {
    return publishedAchievements.filter(ach => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = ach.category || 'other';
        if (cat !== selectedCategory) return false;
      }

      // Year filter
      if (selectedYear !== 'all') {
        if (ach.year !== selectedYear) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (ach.title_en?.toLowerCase() || '').includes(q) || (ach.title_np?.toLowerCase() || '').includes(q);
        const matchDesc = (ach.desc_en?.toLowerCase() || '').includes(q) || (ach.desc_np?.toLowerCase() || '').includes(q);
        const matchStudent = (ach.student_name_en?.toLowerCase() || '').includes(q) || (ach.student_name_np?.toLowerCase() || '').includes(q);
        const matchRank = (ach.position_rank?.toLowerCase() || '').includes(q);
        if (!matchTitle && !matchDesc && !matchStudent && !matchRank) return false;
      }

      return true;
    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [publishedAchievements, selectedCategory, selectedYear, searchQuery]);

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[85vh] text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 dark:bg-slate-950 p-8 sm:p-10 text-white shadow-lg border border-slate-800">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('Hall of Fame & Distinctions', 'हाम्रा गौरवमय उपलब्धिहरू')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('Student Achievement Wall & Honors', 'विद्यार्थी उपलब्धि पर्खाल तथा सम्मान')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t(
                'Honoring Ishwari Secondary School students consistently securing district first positions in national SEE examinations, athletic championships, and state-level science olympiads.',
                'राष्ट्रिय एसईई परीक्षा, राष्ट्रपति रनिङ शिल्ड, अन्तर-विद्यालय विज्ञान प्रदर्शनी तथा सिर्जनात्मक प्रतियोगिताहरूमा विद्यार्थीहरूले हासिल गरेका ऐतिहासिक सफलताहरू।'
              )}
            </p>
          </div>

          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <Award className="w-64 h-64 text-blue-400" />
          </div>
        </div>

        {/* Dynamic Achievement Statistics (Calculated Strictly from Real DB Records) */}
        {publishedAchievements.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-[#1E40AF] dark:text-blue-400">
                <AnimatedCounter value={String(stats.total)} />
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Total Distinctions', 'कुल उपलब्धि')}</p>
              <p className="text-[11px] text-slate-400">{t('Authenticated Records', 'प्रमाणित रेकर्ड')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                <AnimatedCounter value={String(stats.academic)} />
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Academic Board Honors', 'शैक्षिक बोर्ड सम्मान')}</p>
              <p className="text-[11px] text-slate-400">{t('SEE & Board Distinctions', 'एसईई र बोर्ड टपर')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-700 dark:text-blue-300">
                <AnimatedCounter value={String(stats.sports)} />
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Sports Championships', 'खेलकुद उपाधि')}</p>
              <p className="text-[11px] text-slate-400">{t('Running Shield & Zonal', 'रनिङ शिल्ड तथा क्षेत्रीय')}</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1 text-center">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
                <AnimatedCounter value={String(stats.competitions)} />
              </span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Competitions & Science', 'प्रतिस्पर्धा तथा विज्ञान')}</p>
              <p className="text-[11px] text-slate-400">{t('Robotics & Olympiads', 'रोबोटिक्स र ओलम्पियाड')}</p>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search achievements, student name, rank...', 'उपलब्धि, विद्यार्थी नाम वा स्थान खोज्नुहोस्...')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Academic Year Selector */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {t('Session / Year:', 'वर्ष:')}
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="all">{t('All Years', 'सबै वर्ष')}</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#1E40AF]" />
              <span>{t('Category:', 'विधा:')}</span>
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {t('All Achievements', 'सबै विधा')}
            </button>

            {(Object.keys(CATEGORY_MAP) as AchievementCategory[]).map(catKey => {
              const cfg = CATEGORY_MAP[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? 'all' : catKey)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                      : `${cfg.bg} ${cfg.color} ${cfg.border} hover:opacity-90`
                  }`}
                >
                  {t(cfg.labelEn, cfg.labelNp)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t('No achievements found matching your selection.', 'कुनै उपलब्धि फेला परेन।')}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t(
                'Please modify your search term or select another category or academic session.',
                'कृपया खोजी शब्द बदल्नुहोस् वा अर्को विधा छनोट गर्नुहोस्।'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((ach) => {
              const cat = ach.category || 'academic';
              const cfg = CATEGORY_MAP[cat] || CATEGORY_MAP.other;

              return (
                <div
                  key={ach.id}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#1E40AF]/60 dark:hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    {/* Achievement Image if provided */}
                    {ach.image && ach.image.trim() && (
                      <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={ach.image}
                          alt={t(ach.title_en, ach.title_np)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Top: Year & Category Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider font-mono ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {t(cfg.labelEn, cfg.labelNp)}
                      </span>

                      <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#1E40AF]" />
                        <span>{ach.year}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors leading-snug">
                      {t(ach.title_en, ach.title_np)}
                    </h3>

                    {/* Student Name / Rank if present */}
                    {(ach.student_name_en || ach.position_rank) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        {ach.student_name_en && (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span>{t(ach.student_name_en, ach.student_name_np || ach.student_name_en)}</span>
                          </span>
                        )}
                        {ach.position_rank && (
                          <span className="inline-flex items-center gap-1 font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md text-[11px]">
                            <Medal className="w-3.5 h-3.5 text-[#1E40AF]" />
                            <span>{ach.position_rank}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {t(ach.desc_en, ach.desc_np)}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{t('Certified Institution Honor', 'प्रमाणित शैक्षिक सम्मान')}</span>
                    </span>
                    {ach.featured && (
                      <span className="text-[10px] font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#1E40AF] text-[#1E40AF]" />
                        <span>{t('Featured', 'विशेष')}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementsView;
