import React, { useState, useMemo } from 'react';
import { Language, SchoolEvent, EventCategory } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  CalendarDays,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Layers,
  GraduationCap,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  X,
  Share2,
  Download,
  AlertCircle
} from 'lucide-react';
import { ScrollRevealHeading } from '../components/InteractiveTypography';
import { IconActionButton } from '../components/IconActionButton';

interface AcademicCalendarViewProps {
  lang: Language;
  events: SchoolEvent[];
  onNavigate?: (route: string) => void;
}

const CATEGORY_CONFIG: Record<
  EventCategory,
  { labelEn: string; labelNp: string; color: string; bg: string; border: string }
> = {
  examination: {
    labelEn: 'Examination',
    labelNp: 'परीक्षा',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  holiday: {
    labelEn: 'Holiday',
    labelNp: 'सार्वजनिक बिदा',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  admission: {
    labelEn: 'Admission',
    labelNp: 'विद्यार्थी भर्ना',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  academic: {
    labelEn: 'Academic',
    labelNp: 'शैक्षिक गतिविधि',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  meeting: {
    labelEn: 'Meeting / Assembly',
    labelNp: 'बैठक तथा भेला',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  event: {
    labelEn: 'Program / Ceremony',
    labelNp: 'विशेष कार्यक्रम',
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
  program: {
    labelEn: 'Extra-Curricular',
    labelNp: 'अतिरिक्त क्रियाकलाप',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  },
  other: {
    labelEn: 'General Notice',
    labelNp: 'विविध सूचना',
    color: 'text-slate-800 dark:text-slate-200',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    border: 'border-slate-300 dark:border-slate-700'
  }
};

export const AcademicCalendarView: React.FC<AcademicCalendarViewProps> = ({
  lang,
  events = [],
  onNavigate
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // View mode: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Time scope filter: 'upcoming' | 'past' | 'all'
  const [timeScope, setTimeScope] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  // Category filter
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Academic Year filter
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Selected event for modal preview
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);

  // Month navigation for Calendar View
  const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());
  const [currentYearNumber, setCurrentYearNumber] = useState(new Date().getFullYear());

  // Filter only published events
  const publishedEvents = useMemo(() => {
    return events.filter(e => e.status !== 'draft');
  }, [events]);

  // Extract distinct academic years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    publishedEvents.forEach(e => {
      if (e.academic_year) set.add(e.academic_year);
    });
    return Array.from(set).sort().reverse();
  }, [publishedEvents]);

  // Helper to test if an event is in the past
  const isEventPast = (ev: SchoolEvent): boolean => {
    // Attempt parse from date_en or standard strings
    const raw = ev.date_en || '';
    const parsed = Date.parse(raw);
    if (!isNaN(parsed)) {
      return parsed < Date.now() - 24 * 60 * 60 * 1000;
    }
    // Fallback heuristic: check if contains 2081 or 2082 when current year is 2083
    if (raw.includes('2081') || raw.includes('2082')) return true;
    return false;
  };

  // Filtered events
  const filteredEvents = useMemo(() => {
    return publishedEvents.filter(ev => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = ev.category || 'event';
        if (cat !== selectedCategory) return false;
      }

      // Academic Year filter
      if (selectedYear !== 'all' && ev.academic_year) {
        if (ev.academic_year !== selectedYear) return false;
      }

      // Time Scope filter
      const isPast = isEventPast(ev);
      if (timeScope === 'upcoming' && isPast) return false;
      if (timeScope === 'past' && !isPast) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = (ev.title_en?.toLowerCase() || '').includes(q) || (ev.title_np?.toLowerCase() || '').includes(q);
        const matchDesc = (ev.desc_en?.toLowerCase() || '').includes(q) || (ev.desc_np?.toLowerCase() || '').includes(q);
        const matchVenue = (ev.venue_en?.toLowerCase() || '').includes(q) || (ev.venue_np?.toLowerCase() || '').includes(q);
        if (!matchTitle && !matchDesc && !matchVenue) return false;
      }

      return true;
    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [publishedEvents, selectedCategory, selectedYear, timeScope, searchQuery]);

  // Upcoming and Past counters for badges
  const upcomingCount = useMemo(() => {
    return publishedEvents.filter(e => !isEventPast(e)).length;
  }, [publishedEvents]);

  const pastCount = useMemo(() => {
    return publishedEvents.filter(e => isEventPast(e)).length;
  }, [publishedEvents]);

  // Calendar view days calculation
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYearNumber, currentMonthIndex, 1).getDay();
    const daysInMonth = new Date(currentYearNumber, currentMonthIndex + 1, 0).getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentYearNumber, currentMonthIndex]);

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesNp = [
    'जनवरी / माघ', 'फेब्रुअरी / फागुन', 'मार्च / चैत', 'अप्रिल / वैशाख', 'मे / जेठ', 'जुन / असार',
    'जुलाई / साउन', 'अगस्ट / भदौ', 'सेप्टेम्बर / असोज', 'अक्टोबर / कात्तिक', 'नोभेम्बर / मङ्सिर', 'डिसेम्बर / पुस'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYearNumber(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYearNumber(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  // Export event to ICS / text format
  const handleExportIcs = (event: SchoolEvent) => {
    const title = event.title_en || 'Ishwari School Event';
    const venue = event.venue_en || 'Ishwari Secondary School';
    const desc = event.desc_en || '';
    const dateStr = event.date_en || new Date().toISOString().slice(0, 10);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Ishwari Secondary School//Academic Calendar//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${venue}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[85vh] text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-8 sm:p-10 text-white shadow-xl border border-blue-900/40">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('Institutional Academic Calendar 2083 B.S.', 'वार्षिक शैक्षिक क्यालेन्डर २०८३')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('School Academic Calendar & Important Dates', 'शैक्षिक क्यालेन्डर तथा महत्त्वपूर्ण मितिहरू')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t(
                'Comprehensive schedule of examinations, government & regional holidays, admission cycles, sporting events, co-curricular assemblies, and school ceremonies.',
                'वार्षिक परीक्षा, सार्वजनिक बिदा, विद्यार्थी भर्ना, अतिरिक्त क्रियाकलाप, खेलकुद सप्ताह र अभिभावक भेलाहरूको आधिकारिक कार्यतालिका।'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-emerald-300 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{upcomingCount} {t('Upcoming Events', 'आगामी कार्यक्रम')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-blue-300 border border-white/10">
                <Layers className="w-3.5 h-3.5" />
                <span>{publishedEvents.length} {t('Total Calendar Items', 'कुल कार्यतालिका')}</span>
              </div>
            </div>
          </div>

          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <Calendar className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* View Switcher, Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Left: Time Scope Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTimeScope('upcoming')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  timeScope === 'upcoming'
                    ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t('Upcoming Dates', 'आगामी मिति')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 font-mono">
                  {upcomingCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimeScope('past')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  timeScope === 'past'
                    ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{t('Past Archive', 'सम्पन्न कार्यक्रम')}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                  {pastCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTimeScope('all')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  timeScope === 'all'
                    ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t('All Items', 'सबै')}
              </button>
            </div>

            {/* Right: Search + View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search calendar...', 'क्यालेन्डर खोज्नुहोस्...')}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('List View', 'सूची')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                    viewMode === 'calendar'
                      ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t('Monthly Grid', 'मासिक ग्रिड')}
                </button>
              </div>
            </div>
          </div>

          {/* Category & Academic Year Filter Chips */}
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
              {t('All Categories', 'सबै विधा')}
            </button>

            {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map(catKey => {
              const cfg = CATEGORY_CONFIG[catKey];
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

            {/* Academic Year Selector if available */}
            {availableYears.length > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">{t('Year:', 'सत्र:')}</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="all">{t('All Sessions', 'सबै शैक्षिक सत्र')}</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 1. LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {t('No calendar events match your filters.', 'कुनै कार्यक्रम फेला परेन।')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Try modifying the category or time period filter.', 'कृपया अन्य विधा वा समय दायरा छनोट गर्नुहोस्।')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map(event => {
                  const cat = event.category || 'event';
                  const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                  const isPast = isEventPast(event);

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group ${
                        isPast
                          ? 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#1E40AF]/60 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Top: Category Badge + Date */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${catCfg.bg} ${catCfg.color} ${catCfg.border}`}>
                            {t(catCfg.labelEn, catCfg.labelNp)}
                          </span>

                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
                            <span>{t(event.date_en, event.date_np)}</span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                          {t(event.title_en, event.title_np)}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {t(event.desc_en, event.desc_np)}
                        </p>
                      </div>

                      {/* Footer: Time & Venue */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          {event.time && (
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{event.time}</span>
                            </span>
                          )}
                          <span className="flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="w-3 h-3 text-[#1E40AF] shrink-0" />
                            <span>{t(event.venue_en, event.venue_np)}</span>
                          </span>
                        </div>

                        <span className="text-[#1E40AF] dark:text-blue-400 font-medium group-hover:underline text-[11px]">
                          {t('Details →', 'विवरण →')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. MONTHLY CALENDAR GRID VIEW */}
        {viewMode === 'calendar' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {/* Month Navigator */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {monthNamesEn[currentMonthIndex]} {currentYearNumber}
                </h2>
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  ({monthNamesNp[currentMonthIndex]})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonthIndex(new Date().getMonth());
                    setCurrentYearNumber(new Date().getFullYear());
                  }}
                  className="px-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  {t('Today', 'आज')}
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[85px] sm:min-h-[100px] p-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40"
                    />
                  );
                }

                // Check for events in current month and day
                const dayEvents = filteredEvents.filter(ev => {
                  const raw = ev.date_en || '';
                  const d = new Date(raw);
                  if (!isNaN(d.getTime())) {
                    return (
                      d.getDate() === day &&
                      d.getMonth() === currentMonthIndex &&
                      d.getFullYear() === currentYearNumber
                    );
                  }
                  return false;
                });

                return (
                  <div
                    key={`day-${day}`}
                    className={`min-h-[85px] sm:min-h-[100px] p-2 rounded-xl border flex flex-col justify-between transition ${
                      dayEvents.length > 0
                        ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 2).map(ev => {
                        const cat = ev.category || 'event';
                        const catCfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="p-1 rounded text-[10px] font-semibold truncate cursor-pointer transition bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#1E40AF] hover:text-white dark:hover:bg-[#1E40AF] dark:hover:text-white"
                            title={t(ev.title_en, ev.title_np)}
                          >
                            {t(ev.title_en, ev.title_np)}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-slate-400 block text-right">
                          +{dayEvents.length - 2} {t('more', 'थप')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. EVENT PREVIEW MODAL */}
        {selectedEvent && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const cat = selectedEvent.category || 'event';
                      const cfg = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.other;
                      return (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          {t(cfg.labelEn, cfg.labelNp)}
                        </span>
                      );
                    })()}
                    {selectedEvent.academic_year && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {selectedEvent.academic_year}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {t(selectedEvent.title_en, selectedEvent.title_np)}
                  </h3>
                </div>

                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  tooltip={t('Close event details', 'बन्द गर्नुहोस्')}
                  aria-label={t('Close event details', 'बन्द गर्नुहोस्')}
                />
              </div>

              {/* Event Details */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Date (BS / AD)', 'मिति')}</span>
                    <p className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{t(selectedEvent.date_en, selectedEvent.date_np)}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Schedule / Time', 'समय')}</span>
                    <p className="font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{selectedEvent.time || '10:00 AM - 04:00 PM'}</span>
                    </p>
                  </div>

                  <div className="col-span-2 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t('Location / Venue', 'स्थान')}</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1E40AF]" />
                      <span>{t(selectedEvent.venue_en, selectedEvent.venue_np)}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Program Overview:', 'कार्यक्रम विवरण:')}</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {t(selectedEvent.desc_en, selectedEvent.desc_np)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <IconActionButton
                  action="download"
                  onClick={() => handleExportIcs(selectedEvent)}
                  tooltip={t('Add to Calendar (.ics)', 'क्यालेन्डरमा थप्नुहोस् (.ics)')}
                  aria-label={t('Add to Calendar (.ics)', 'क्यालेन्डरमा थप्नुहोस् (.ics)')}
                />

                <IconActionButton
                  action="close"
                  onClick={() => setSelectedEvent(null)}
                  tooltip={t('Close event details', 'बन्द गर्नुहोस्')}
                  aria-label={t('Close event details', 'बन्द गर्नुहोस्')}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendarView;
