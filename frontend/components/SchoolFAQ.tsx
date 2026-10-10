import React, { useState, useMemo } from 'react';
import { Language, SchoolFAQItem, FAQCategory as ItemFAQCategory } from '../types';
import { initialFAQs } from '../data/schoolData';
import {
  HelpCircle,
  Search,
  ChevronDown,
  GraduationCap,
  BookOpen,
  DollarSign,
  Building,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  Minus,
  MessageSquare,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';

export interface SchoolFAQProps {
  lang: Language;
  faqs?: SchoolFAQItem[];
  onNavigate?: (route: string) => void;
  className?: string;
}

export type FAQFilterCategory = 'all' | ItemFAQCategory;

export const SchoolFAQ: React.FC<SchoolFAQProps> = ({
  lang,
  faqs,
  onNavigate,
  className = ''
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np?: string) => (isNp && np ? np : en);

  // Use provided FAQs or fall back to default curated FAQs
  const allFAQs: SchoolFAQItem[] = useMemo(() => {
    const list = faqs && faqs.length > 0 ? faqs : initialFAQs;
    return list
      .filter((item) => item.status !== 'draft')
      .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }, [faqs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FAQFilterCategory>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['faq-adm-1', 'faq-acad-1']));

  const categories: {
    id: FAQFilterCategory;
    label_en: string;
    label_np: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', label_en: 'All Questions', label_np: 'सबै प्रश्नहरू', Icon: HelpCircle },
    { id: 'admissions', label_en: 'Admissions', label_np: 'भर्ना प्रक्रिया', Icon: GraduationCap },
    { id: 'academics', label_en: 'Academics & Streams', label_np: 'शैक्षिक संकाय', Icon: BookOpen },
    { id: 'scholarships', label_en: 'Scholarships & Fees', label_np: 'छात्रवृत्ति तथा शुल्क', Icon: DollarSign },
    { id: 'facilities', label_en: 'Labs & Facilities', label_np: 'पूर्वाधार तथा खाजा', Icon: Building },
    { id: 'discipline', label_en: 'Timing & Rules', label_np: 'समय र नियम', Icon: ShieldCheck }
  ];

  // Toggle single item
  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / collapse all
  const expandAll = () => {
    setExpandedIds(new Set(allFAQs.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Filtered FAQs
  const filteredFAQs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allFAQs.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!q) return true;

      const qEn = item.question_en?.toLowerCase() || '';
      const qNp = item.question_np?.toLowerCase() || '';
      const aEn = item.answer_en?.toLowerCase() || '';
      const aNp = item.answer_np?.toLowerCase() || '';

      return qEn.includes(q) || qNp.includes(q) || aEn.includes(q) || aNp.includes(q);
    });
  }, [allFAQs, activeCategory, searchQuery]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allFAQs.length };
    allFAQs.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [allFAQs]);

  return (
    <section
      id="school-faq-section"
      className={`rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all duration-300 ${className}`}
      aria-labelledby="faq-section-heading"
    >
      {/* 1. Header Banner */}
      <div className="relative p-6 sm:p-8 md:p-10 bg-linear-to-br from-blue-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 border-b border-slate-200 dark:border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-[#1E40AF] dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('Frequently Asked Questions', 'प्रायः सोधिने प्रश्नहरू (FAQ)')}</span>
          </div>

          <h2
            id="faq-section-heading"
            className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            {t(
              'Answers for Students, Parents & Guardians',
              'विद्यार्थी तथा अभिभावकका साझा जिज्ञासा र समाधान'
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              'Explore official institutional guidelines regarding school admissions, scholarship quotas, curriculum streams, midday meals, and campus regulations at Shree Ishwari Secondary School.',
              'श्री ईश्वरी माध्यमिक विद्यालय, बैजनाथ-५ मा विद्यार्थी भर्ना, छात्रवृत्ति सुविधा, संकाय विवरण, दिवा खाजा तथा विद्यालय नियम सम्बन्धी आधिकारिक जानकारी यहाँ पाउन सक्नुहुन्छ।'
            )}
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search questions by keyword (e.g. admission, scholarship, science, timing)...',
                  'कुनै प्रश्न खोज्नुहोस् (उदा. भर्ना, छात्रवृत्ति, संकाय, समय, खाजा)...'
                )}
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF] shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={t('Clear search', 'खोजी हटाउनुहोस्')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ambient Decorative element */}
        <div
          aria-hidden="true"
          className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none"
        />
      </div>

      {/* 2. Controls & Categories Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.Icon;
            const count = categoryCounts[cat.id] || 0;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(cat.label_en, cat.label_np)}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse All */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 px-2 py-1 rounded transition cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Expand All', 'सबै खोल्नुहोस्')}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 px-2 py-1 rounded transition cursor-pointer flex items-center gap-1"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>{t('Collapse All', 'सबै बन्द गर्नुहोस्')}</span>
          </button>
        </div>
      </div>

      {/* 3. Accordion List */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-3.5">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <HelpCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {t('No matching questions found', 'कुनै प्रश्न फेला परेन')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {t(
                'Try searching with different keywords or switch category filters to see more answers.',
                'कृपया फरक शब्दहरू खोजी हेर्नुहोस् वा सबै प्रश्न वर्ग चयन गर्नुहोस्।'
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-300 hover:bg-blue-100 transition cursor-pointer inline-flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('Reset filters', 'फिल्टर हटाउनुहोस्')}</span>
            </button>
          </div>
        ) : (
          filteredFAQs.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            const questionText = t(item.question_en, item.question_np);
            const answerText = t(item.answer_en, item.answer_np);
            const highlights = isNp ? (item.highlights_np || []) : (item.highlights_en || []);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#1E40AF]/40 bg-blue-50/20 dark:bg-blue-950/15 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${item.id}`}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                        isExpanded
                          ? 'bg-[#1E40AF] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {questionText}
                    </h3>
                  </div>

                  <div
                    className={`shrink-0 p-1.5 rounded-lg transition-transform duration-200 ${
                      isExpanded
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-[#1E40AF] dark:text-blue-300 rotate-180'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div
                    id={`faq-answer-${item.id}`}
                    role="region"
                    className="px-4 pb-5 sm:px-5 sm:pb-6 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed"
                  >
                    <p className="pt-3">{answerText}</p>

                    {/* Key Highlights Badge Row with institutional BookmarkCheck icon */}
                    {highlights.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{t('Key Highlights:', 'मुख्य बुँदाहरू:')}</span>
                        </span>
                        {highlights.map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-2xs"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Bottom Support CTA Card */}
      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Have a specific question not listed here?', 'यहाँ सूचीकृत नभएको कुनै अन्य जिज्ञासा छ?')}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'Our administration office is here to help. Reach out directly or submit an online inquiry.',
              'हाम्रो विद्यालय प्रशासन कार्यालय सधैँ सेवामा तयार छ। सिधै सम्पर्क गर्नुहोस् वा सन्देश पठाउनुहोस्।'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E40AF] text-white hover:bg-[#1D4ED8] shadow-xs shadow-[#1E40AF]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t('Contact Administration', 'प्रशासनमा सम्पर्क')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admissions')}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 transition-all cursor-pointer"
              >
                <span>{t('Admissions Inquiry', 'भर्ना सोधपुछ')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default SchoolFAQ;
