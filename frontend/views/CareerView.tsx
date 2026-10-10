import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase,
  Calendar,
  MapPin,
  Clock,
  Search,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  GraduationCap,
  X,
  Share2,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Language, Vacancy, EmploymentType } from '../types';
import { IconActionButton } from '../components/IconActionButton';

interface CareerViewProps {
  lang: Language;
  vacancies: Vacancy[];
  schoolNameEn?: string;
  schoolNameNp?: string;
}

export const CareerView: React.FC<CareerViewProps> = ({
  lang,
  vacancies = [],
  schoolNameEn = 'Ishwari Secondary School',
  schoolNameNp = 'श्री ईश्वरी माध्यमिक विद्यालय'
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(true);

  // Selected vacancy for detailed view modal
  const [activeModalVacancy, setActiveModalVacancy] = useState<Vacancy | null>(null);

  // Confirmation modal for external Google Form redirect
  const [redirectTargetUrl, setRedirectTargetUrl] = useState<string | null>(null);
  const [redirectVacancyTitle, setRedirectVacancyTitle] = useState<string>('');

  // Date helper
  const isDeadlinePassed = (deadlineStr: string): boolean => {
    if (!deadlineStr) return false;
    try {
      const deadline = new Date(deadlineStr);
      // Set to end of day
      deadline.setHours(23, 59, 59, 999);
      return Date.now() > deadline.getTime();
    } catch {
      return false;
    }
  };

  const getDaysRemaining = (deadlineStr: string): number | null => {
    if (!deadlineStr) return null;
    try {
      const deadline = new Date(deadlineStr);
      deadline.setHours(23, 59, 59, 999);
      const diffTime = deadline.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  // Format date nicely
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(isNp ? 'ne-NP' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Available departments from published vacancies
  const availableDepartments = useMemo(() => {
    const deps = new Set<string>();
    vacancies.forEach((v) => {
      if (v.department && v.status !== 'draft') {
        deps.add(v.department);
      }
    });
    return Array.from(deps);
  }, [vacancies]);

  // Filtered vacancies list
  const filteredVacancies = useMemo(() => {
    return vacancies
      .filter((v) => {
        // Only show published or closed in public view (never drafts)
        if (v.status === 'draft') return false;

        // Active only filter
        const deadlinePassed = isDeadlinePassed(v.application_deadline);
        const isClosed = v.status === 'closed' || deadlinePassed;
        if (filterActiveOnly && isClosed) return false;

        // Employment type filter
        if (selectedType !== 'all' && v.employment_type !== selectedType) return false;

        // Department filter
        if (selectedDepartment !== 'all' && v.department !== selectedDepartment) return false;

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (v.title_en || '').toLowerCase().includes(q) || (v.title_np || '').toLowerCase().includes(q);
          const matchDep = (v.department || '').toLowerCase().includes(q);
          const matchDesc = (v.short_description_en || '').toLowerCase().includes(q) || (v.description_en || '').toLowerCase().includes(q);
          const matchSkills = (v.skills || []).some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchDep && !matchDesc && !matchSkills) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Featured first, then order, then publish date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime();
      });
  }, [vacancies, searchQuery, selectedType, selectedDepartment, filterActiveOnly]);

  const handleOpenApplication = (vacancy: Vacancy) => {
    if (!vacancy.application_url) return;
    setRedirectTargetUrl(vacancy.application_url);
    setRedirectVacancyTitle(isNp && vacancy.title_np ? vacancy.title_np : vacancy.title_en);
  };

  const handleConfirmRedirect = () => {
    if (redirectTargetUrl) {
      window.open(redirectTargetUrl, '_blank', 'noopener,noreferrer');
    }
    setRedirectTargetUrl(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. INSTITUTIONAL PAGE HEADER & HERO */}
      <section className="bg-linear-to-b from-blue-900 via-blue-950 to-slate-900 text-white border-b border-blue-800/40 relative overflow-hidden">
        {/* Subtle grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <Briefcase className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('CAREER & RECRUITMENT', 'रोजगारी तथा पदपूर्ति')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {t('Career Opportunities', 'पदपूर्ति तथा रोजगारीका अवसरहरू')}
            </h1>

            <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed">
              {t(
                `Explore teaching and administrative vacancies at ${schoolNameEn}. Join a dedicated community of educators shaping disciplined, innovative, and empowered citizens.`,
                `${schoolNameNp}मा उपलब्ध शिक्षण तथा प्रशासनिक पदहरू। भविष्यका कर्णधारहरूलाई अनुशासित, दक्ष र सिर्जनशील बनाउने हाम्रो शैक्षिक अभियानमा जोडिनुहोस्।`
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <section className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('Search by job title, department, or skill...', 'पद, विभाग वा सीप खोज्नुहोस्...')}
                className="w-full pl-9.5 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  {t('Clear', 'हटाउनुहोस्')}
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Employment Type */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">{t('All Employment Types', 'सबै प्रकार')}</option>
                <option value="Full Time">{t('Full Time', 'पूर्णकालीन')}</option>
                <option value="Part Time">{t('Part Time', 'अंशकालीन')}</option>
                <option value="Contract">{t('Contract', 'करार')}</option>
                <option value="Temporary">{t('Temporary', 'अस्थायी')}</option>
                <option value="Other">{t('Other', 'अन्य')}</option>
              </select>

              {/* Department Filter */}
              {availableDepartments.length > 0 && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 text-xs sm:text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[180px] truncate"
                >
                  <option value="all">{t('All Departments', 'सबै विभाग')}</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              )}

              {/* Active Only Toggle */}
              <button
                type="button"
                onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterActiveOnly
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${filterActiveOnly ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{filterActiveOnly ? t('Open Positions Only', 'खुला पदहरू मात्र') : t('All (Incl. Closed)', 'सबै रेकर्ड')}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VACANCY LISTING SECTION */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Results summary */}
        <div className="flex items-center justify-between mb-6 text-sm text-slate-500 dark:text-slate-400">
          <div>
            {t('Showing', 'जम्मा')} <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredVacancies.length}</span> {t('position(s)', 'पदहरू')}
          </div>
          {(searchQuery || selectedType !== 'all' || selectedDepartment !== 'all' || !filterActiveOnly) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedDepartment('all');
                setFilterActiveOnly(true);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {t('Reset all filters', 'फिल्टर रिसेट गर्नुहोस्')}
            </button>
          )}
        </div>

        {/* Empty state */}
        {filteredVacancies.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
              {t('No Vacancies Found', 'कुनै पद फेला परेन')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
              {filterActiveOnly
                ? t(
                    'There are currently no open vacancies matching your criteria. Please check back later or adjust your search filter to view past records.',
                    'तपाईंको खोज अनुसार हाल कुनै खुला पद फेला परेन। कृपया केही समयपछि पुन: हेर्नुहोला वा अघिल्ला विज्ञापनहरू हेर्न फिल्टर परिवर्तन गर्नुहोस्।'
                  )
                : t(
                    'No vacancy records matched the search filters.',
                    'खोजिएका फिल्टरहरू अनुसार कुनै पनि पद भेटिएन।'
                  )}
            </p>
            {(searchQuery || selectedType !== 'all' || selectedDepartment !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedDepartment('all');
                  setFilterActiveOnly(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-xs cursor-pointer"
              >
                {t('View All Open Vacancies', 'सबै खुला पदहरू हेर्नुहोस्')}
              </button>
            )}
          </div>
        ) : (
          /* Grid of Institutional Vacancy Cards */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVacancies.map((vacancy) => {
              const deadlinePassed = isDeadlinePassed(vacancy.application_deadline);
              const isClosed = vacancy.status === 'closed' || deadlinePassed;
              const daysLeft = !isClosed ? getDaysRemaining(vacancy.application_deadline) : null;
              const hasUrl = Boolean(vacancy.application_url && vacancy.application_url.trim());

              return (
                <article
                  key={vacancy.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                    isClosed
                      ? 'border-slate-200 dark:border-slate-800 opacity-90'
                      : vacancy.featured
                      ? 'border-blue-300 dark:border-blue-700/80 ring-1 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Card Header & Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top pill bar: Category, Featured, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {vacancy.department && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{vacancy.department}</span>
                          </span>
                        )}
                        {vacancy.featured && !isClosed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800/60">
                            ★ {t('Featured', 'प्रमुख')}
                          </span>
                        )}
                      </div>

                      {/* Status badge */}
                      {isClosed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3 text-slate-400" />
                          <span>{t('Application Closed', 'आवेदन बन्द')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>{t('Open', 'स्वीकार्य')}</span>
                        </span>
                      )}
                    </div>

                    {/* Job Title */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setActiveModalVacancy(vacancy)}
                        className="text-left group/title focus:outline-hidden focus:underline cursor-pointer block"
                      >
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover/title:text-[#1E40AF] dark:group-hover/title:text-blue-400 leading-snug transition-colors">
                          {isNp && vacancy.title_np ? vacancy.title_np : vacancy.title_en}
                        </h2>
                      </button>
                      {/* Secondary language title if available */}
                      {isNp && vacancy.title_en && vacancy.title_np && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {vacancy.title_en}
                        </p>
                      )}
                      {!isNp && vacancy.title_np && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                          {vacancy.title_np}
                        </p>
                      )}
                    </div>

                    {/* Meta specifications: Positions, Type, Level, Location */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="truncate">{vacancy.employment_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="font-semibold">{vacancy.positions_count} {t(vacancy.positions_count === 1 ? 'Position' : 'Positions', 'पद')}</span>
                      </div>
                      {vacancy.academic_level && (
                        <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-md border border-slate-100 dark:border-slate-800 truncate">
                          <span className="truncate font-medium">{vacancy.academic_level}</span>
                        </div>
                      )}
                    </div>

                    {/* Short summary description */}
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {isNp && vacancy.short_description_np
                        ? vacancy.short_description_np
                        : vacancy.short_description_en || vacancy.description_en}
                    </p>

                    {/* Skills/Tags if provided */}
                    {vacancy.skills && vacancy.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {vacancy.skills.slice(0, 4).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                        {vacancy.skills.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                            +{vacancy.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Deadline & Action Buttons */}
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Deadline block */}
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">{t('Deadline:', 'म्याद:')} </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(vacancy.application_deadline)}
                        </span>
                        {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                          <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {t(`Closing in ${daysLeft}d`, `${daysLeft} दिन बाँकी`)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Apply Online */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isClosed ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed flex items-center justify-center gap-1.5"
                        >
                          <span>{t('Application Closed', 'आवेदन बन्द')}</span>
                        </button>
                      ) : !hasUrl ? (
                        <button
                          type="button"
                          disabled
                          className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-not-allowed flex items-center justify-center gap-1"
                          title={t('Application form link is being updated', 'फारम लिङ्क अद्यावधिक भइरहेको छ')}
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{t('Form Unavailable', 'लिङ्क उपलब्ध छैन')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenApplication(vacancy)}
                          className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition shadow-xs hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>{t('Apply Online', 'अनलाइन दरखास्त')}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. DETAILED VACANCY MODAL */}
      <AnimatePresence>
        {activeModalVacancy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalVacancy(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/80 dark:bg-slate-950/60 shrink-0">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeModalVacancy.department && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                        {activeModalVacancy.department}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {activeModalVacancy.employment_type}
                    </span>
                    {isDeadlinePassed(activeModalVacancy.application_deadline) || activeModalVacancy.status === 'closed' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {t('Closed', 'बन्द')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {t('Active', 'खुला')}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {isNp && activeModalVacancy.title_np ? activeModalVacancy.title_np : activeModalVacancy.title_en}
                  </h2>
                  {isNp && activeModalVacancy.title_en && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activeModalVacancy.title_en}</p>
                  )}
                </div>

                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setActiveModalVacancy(null)}
                  tooltip={t('Close', 'बन्द गर्नुहोस्')}
                  aria-label={t('Close', 'बन्द गर्नुहोस्')}
                />
              </div>

              {/* Modal Body - Scrollable */}
              <div className="px-6 py-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {/* Meta Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium">{t('Positions', 'पद सङ्ख्या')}</div>
                    <div className="text-slate-900 dark:text-white font-bold text-sm mt-0.5">
                      {activeModalVacancy.positions_count}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">{t('Academic Level', 'तह / श्रेणी')}</div>
                    <div className="text-slate-900 dark:text-white font-semibold mt-0.5 truncate">
                      {activeModalVacancy.academic_level || t('General', 'साधारण')}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">{t('Deadline', 'दरखास्त म्याद')}</div>
                    <div className="text-slate-900 dark:text-white font-semibold mt-0.5">
                      {formatDate(activeModalVacancy.application_deadline)}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium">{t('Publish Date', 'प्रकाशन मिति')}</div>
                    <div className="text-slate-900 dark:text-white font-semibold mt-0.5">
                      {formatDate(activeModalVacancy.publish_date)}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {activeModalVacancy.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>{activeModalVacancy.location}</span>
                  </div>
                )}

                {/* Detailed Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t('Job Overview / Description', 'कार्य विवरण तथा परिचय')}
                  </h3>
                  <div className="whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {isNp && activeModalVacancy.description_np
                      ? activeModalVacancy.description_np
                      : activeModalVacancy.description_en}
                  </div>
                </div>

                {/* Responsibilities */}
                {activeModalVacancy.responsibilities && activeModalVacancy.responsibilities.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {t('Key Responsibilities', 'प्रमुख जिम्मेवारीहरू')}
                    </h3>
                    <ul className="space-y-1.5 list-none">
                      {activeModalVacancy.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Minimum Qualifications */}
                {activeModalVacancy.qualifications && activeModalVacancy.qualifications.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {t('Required Qualifications & Eligibility', 'आवश्यक योग्यता तथा मापदण्ड')}
                    </h3>
                    <ul className="space-y-1.5 list-none">
                      {activeModalVacancy.qualifications.map((qual, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Experience */}
                {activeModalVacancy.experience && (
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {t('Experience Requirement', 'अनुभवको आवश्यकता')}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">{activeModalVacancy.experience}</p>
                  </div>
                )}

                {/* Required Skills */}
                {activeModalVacancy.skills && activeModalVacancy.skills.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      {t('Technical & Interpersonal Skills', 'आवश्यक सीप तथा दक्षता')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {activeModalVacancy.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Application Instructions */}
                {activeModalVacancy.application_instructions && (
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                      <FileText className="w-4 h-4" />
                      <span>{t('Application Instructions', 'आवेदन पेश गर्ने प्रक्रिया')}</span>
                    </div>
                    <p className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed whitespace-pre-line">
                      {activeModalVacancy.application_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0">
                <IconActionButton
                  action="close"
                  onClick={() => setActiveModalVacancy(null)}
                  tooltip={t('Close', 'बन्द गर्नुहोस्')}
                  aria-label={t('Close', 'बन्द गर्नुहोस्')}
                />

                {isDeadlinePassed(activeModalVacancy.application_deadline) || activeModalVacancy.status === 'closed' ? (
                  <button
                    type="button"
                    disabled
                    className="min-h-[44px] px-5 py-2 text-sm font-medium text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-not-allowed"
                  >
                    {t('Application Closed', 'आवेदन म्याद समाप्त')}
                  </button>
                ) : !activeModalVacancy.application_url ? (
                  <button
                    type="button"
                    disabled
                    className="min-h-[44px] px-5 py-2 text-sm font-medium text-slate-400 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-not-allowed"
                  >
                    {t('Form Link Unavailable', 'लिङ्क उपलब्ध छैन')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const v = activeModalVacancy;
                      setActiveModalVacancy(null);
                      handleOpenApplication(v);
                    }}
                    className="min-h-[44px] px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t('Apply Online via Google Form', 'गुगल फारम मार्फत आवेदन')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. EXTERNAL APPLICATION REDIRECT CONFIRMATION MODAL */}
      <AnimatePresence>
        {redirectTargetUrl && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRedirectTargetUrl(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ExternalLink className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t('Redirecting to Application Form', 'अनलाइन दरखास्त फारममा जाँदै')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t(
                    `You are being redirected to the official online application form for "${redirectVacancyTitle}". Please prepare scanned digital copies of your citizenship, academic certificates, teaching license, and updated CV for submission.`,
                    `तपाईं "${redirectVacancyTitle}" पदको आधिकारिक अनलाइन दरखास्त फारममा जाँदै हुनुहुन्छ। कृपया आफ्नो नागरिकता, शैक्षिक प्रमाणपत्र, अध्यापन अनुमतिपत्र तथा बायोडाटा (CV) को डिजिटल प्रति तयार राख्नुहोला।`
                  )}
                </p>
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all">
                  {redirectTargetUrl}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <IconActionButton
                  action="cancel"
                  onClick={() => setRedirectTargetUrl(null)}
                  tooltip={t('Cancel', 'रद्द गर्नुहोस्')}
                  aria-label={t('Cancel', 'रद्द गर्नुहोस्')}
                />
                <button
                  type="button"
                  onClick={handleConfirmRedirect}
                  className="min-h-[44px] px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#1E40AF] hover:bg-[#1D4ED8] rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('Continue to Application', 'आवेदन फारम खोल्नुहोस्')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerView;
