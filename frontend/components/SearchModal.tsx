import React, { useState, useEffect } from 'react';
import {
  Language,
  Notice,
  StaffMember,
  Facility,
  CurriculumGuideline,
  Vacancy,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  AboutSection
} from '../types';
import {
  Search,
  ArrowRight,
  FileText,
  Users,
  Building2,
  BookMarked,
  Briefcase,
  Calendar,
  Award,
  History,
  Info,
  ExternalLink,
  X
} from 'lucide-react';
import { EducatorNameTypography } from './InteractiveTypography';
import { IconActionButton } from './IconActionButton';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onNavigate: (route: string) => void;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  curriculumGuidelines?: CurriculumGuideline[];
  vacancies?: Vacancy[];
  documents?: DocumentItem[];
  events?: SchoolEvent[];
  achievements?: Achievement[];
  history?: HistoryItem[];
  aboutSections?: AboutSection[];
  onSelectNotice?: (notice: Notice) => void;
  onSelectVacancy?: (vacancy: Vacancy) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigate,
  notices = [],
  staff = [],
  facilities = [],
  curriculumGuidelines = [],
  vacancies = [],
  documents = [],
  events = [],
  achievements = [],
  history = [],
  aboutSections = [],
  onSelectNotice,
  onSelectVacancy
}) => {
  const [query, setQuery] = useState('');
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Close on Escape or Ctrl+K / Meta+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Public Pages Catalog
  const publicPages = [
    { route: 'home', title_en: 'Home & Institutional Overview', title_np: 'गृहपृष्ठ तथा सामान्य परिचय', keywords: 'home landing main overview' },
    { route: 'about', title_en: 'About the School & Mission', title_np: 'विद्यालय परिचय तथा उद्देश्य', keywords: 'about mission vision values history leadership' },
    { route: 'academics', title_en: 'Academic Programs & Faculty Streams', title_np: 'शैक्षिक कार्यक्रम तथा संकायहरू', keywords: 'academics classes see ten plus two science management humanities' },
    { route: 'facilities', title_en: 'Campus Infrastructure & Laboratory', title_np: 'विद्यालयका भौतिक पूर्वाधार तथा प्रयोगशाला', keywords: 'facilities lab science computer library playground hostel' },
    { route: 'staff', title_en: 'Faculty & Administrative Staff Directory', title_np: 'शिक्षक तथा कर्मचारी विवरण', keywords: 'teachers faculty principal administration staff educators' },
    { route: 'notices', title_en: 'Official Notice Board & Circulars', title_np: 'आधिकारिक सूचना पाटी तथा परिपत्र', keywords: 'notices circulars announcements circular board exam' },
    { route: 'history', title_en: 'Chronicle of Milestones & Heritage', title_np: 'ऐतिहासिक कालखण्ड तथा कोसेढुङ्गा', keywords: 'history timeline heritage 2035 founders' },
    { route: 'curriculum', title_en: 'National Curriculum Guidelines & Syllabus', title_np: 'राष्ट्रिय पाठ्यक्रम निर्देशिका तथा पाठ्यसामग्री', keywords: 'curriculum guidelines syllabus books downloads' },
    { route: 'documents', title_en: 'Institutional Documents & Citizen Charter', title_np: 'कागजात, नागरिक वडापत्र तथा डाउनलोड', keywords: 'documents citizen charter forms circulars' },
    { route: 'gallery', title_en: 'School Photo & Activities Gallery', title_np: 'फोटो तथा गतिविधि ग्यालरी', keywords: 'gallery photos events campus pictures' },
    { route: 'contact', title_en: 'Contact & Institutional Admissions Inquiry', title_np: 'सम्पर्क तथा भर्ना सोधपुछ', keywords: 'contact phone email map address inquiry' },
  ];

  // 1. NOTICES (Publicly published only)
  const matchedNotices = q ? notices.filter(n =>
    n.published !== false && n.is_published !== false && n.status !== 'draft' && (
      n.title_en.toLowerCase().includes(q) ||
      n.title_np?.includes(q) ||
      n.category.toLowerCase().includes(q) ||
      n.description_en.toLowerCase().includes(q) ||
      n.description_np?.includes(q)
    )
  ) : [];

  // 2. VACANCIES (Publicly published/open only)
  const matchedVacancies = q ? vacancies.filter(v =>
    v.status === 'published' && (
      v.title_en.toLowerCase().includes(q) ||
      v.title_np?.includes(q) ||
      v.department.toLowerCase().includes(q) ||
      v.short_description_en.toLowerCase().includes(q) ||
      v.description_en.toLowerCase().includes(q)
    )
  ) : [];

  // 3. CURRICULUM GUIDELINES (Published only)
  const matchedCurriculum = q ? curriculumGuidelines.filter(c =>
    c.status === 'published' && (
      c.title_en.toLowerCase().includes(q) ||
      c.title_np?.includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.class_level.toLowerCase().includes(q) ||
      c.description_en?.toLowerCase().includes(q)
    )
  ) : [];

  // 4. DOCUMENTS (Published only)
  const matchedDocuments = q ? documents.filter(d =>
    d.title_en.toLowerCase().includes(q) ||
    d.title_np.includes(q) ||
    d.type.toLowerCase().includes(q) ||
    (d.description_en && d.description_en.toLowerCase().includes(q)) ||
    (d.description_np && d.description_np.includes(q))
  ) : [];

  // 5. FACULTY & STAFF
  const matchedStaff = q ? staff.filter(s =>
    s.name_en.toLowerCase().includes(q) ||
    s.name_np.includes(q) ||
    s.designation_en.toLowerCase().includes(q) ||
    s.designation_np.includes(q) ||
    (s.department_en && s.department_en.toLowerCase().includes(q)) ||
    (s.department_np && s.department_np.includes(q))
  ) : [];

  // 6. EVENTS & ACHIEVEMENTS
  const matchedEvents = q ? events.filter(e =>
    e.title_en.toLowerCase().includes(q) ||
    e.title_np.includes(q) ||
    (e.desc_en && e.desc_en.toLowerCase().includes(q)) ||
    (e.desc_np && e.desc_np.includes(q))
  ) : [];

  const matchedAchievements = q ? achievements.filter(a =>
    a.title_en.toLowerCase().includes(q) ||
    a.title_np.includes(q) ||
    (a.desc_en && a.desc_en.toLowerCase().includes(q)) ||
    (a.desc_np && a.desc_np.includes(q))
  ) : [];

  // 7. HISTORY MILESTONES (Published only)
  const matchedHistory = q ? history.filter(h =>
    h.status !== 'unpublished' && h.is_enabled !== false && (
      h.year.includes(q) ||
      h.title_en.toLowerCase().includes(q) ||
      h.title_np.includes(q) ||
      h.desc_en.toLowerCase().includes(q) ||
      h.desc_np.includes(q)
    )
  ) : [];

  // 8. PAGES
  const matchedPages = q ? publicPages.filter(p =>
    p.title_en.toLowerCase().includes(q) ||
    p.title_np.includes(q) ||
    p.keywords.includes(q) ||
    p.route.includes(q)
  ) : [];

  const totalResults =
    matchedNotices.length +
    matchedVacancies.length +
    matchedCurriculum.length +
    matchedDocuments.length +
    matchedStaff.length +
    matchedEvents.length +
    matchedAchievements.length +
    matchedHistory.length +
    matchedPages.length;

  const handleOpenNotice = (n: Notice) => {
    onClose();
    if (onSelectNotice) {
      onSelectNotice(n);
    } else {
      window.location.hash = `notice/${n.id}`;
      onNavigate('notices');
    }
  };

  const handleOpenVacancy = (v: Vacancy) => {
    onClose();
    if (onSelectVacancy) {
      onSelectVacancy(v);
    } else {
      window.location.hash = `vacancy/${v.id}`;
      onNavigate('notices');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-20 px-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3 bg-slate-50/50 dark:bg-slate-850/50">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('Search notices, vacancies, curriculum, staff, history...', 'सूचना, विज्ञापन, पाठ्यक्रम, शिक्षक, इतिहास खोज्नुहोस्...')}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
            autoFocus
          />
          {query && (
            <IconActionButton
              action="clear"
              appearance="ghost"
              size="sm"
              onClick={() => setQuery('')}
              tooltip={t('Clear search', 'खोजी मेटाउनुहोस्')}
              aria-label={t('Clear search', 'खोजी मेटाउनुहोस्')}
            />
          )}
          <IconActionButton
            action="close"
            appearance="ghost"
            onClick={onClose}
            tooltip={t('Close search', 'खोजी बन्द गर्नुहोस्')}
            aria-label={t('Close search', 'खोजी बन्द गर्नुहोस्')}
            className="shrink-0"
          />
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs">
          {!q ? (
            <div className="text-center py-8 text-slate-400 space-y-3">
              <p>{t('Search across official school circulars, vacancies, curriculum guidelines, faculty, and pages.', 'विद्यालयका आधिकारिक सूचना, विज्ञापन, पाठ्यक्रम, शिक्षक तथा पृष्ठहरू खोज्नुहोस्।')}</p>
              <div className="flex justify-center gap-1.5 flex-wrap pt-2">
                {[
                  { tag: 'exam', label: isNp ? '#परीक्षा' : '#exam' },
                  { tag: 'admission', label: isNp ? '#भर्ना' : '#admission' },
                  { tag: 'teacher', label: isNp ? '#शिक्षक' : '#teacher' },
                  { tag: 'curriculum', label: isNp ? '#पाठ्यक्रम' : '#curriculum' },
                  { tag: 'scholarship', label: isNp ? '#छात्रवृत्ति' : '#scholarship' }
                ].map(({ tag, label }) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[#1E40AF] dark:text-blue-400 hover:bg-[#1E40AF]/10 font-mono text-xs transition cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="font-medium text-slate-600 dark:text-slate-300">
                {t('No matching public records found for', 'कुनै सार्वजनिक नतिजा फेला परेन:')} "{query}"
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {t('Try searching with general keywords like "exam", "notice", "grade 10", or "teacher".', 'कृपया "परीक्षा", "सूचना", "कक्षा १०" वा "शिक्षक" जस्ता सामान्य शब्दहरू खोज्नुहोस्।')}
              </p>
            </div>
          ) : (
            <>
              {/* GROUP 1: NOTICES */}
              {matchedNotices.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('Notices', 'सूचनाहरू')} ({matchedNotices.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedNotices.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleOpenNotice(n)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/60 text-[#1E40AF] dark:text-blue-300 shrink-0">
                              {n.category}
                            </span>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition truncate">
                              {t(n.title_en, n.title_np)}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t(n.date_en, n.date_np)} {n.file_name ? `• PDF (${n.file_size_kb || 0} KB)` : ''}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#1E40AF] dark:text-blue-400 shrink-0 flex items-center gap-1">
                          <span>{t('View', 'हेर्नुहोस्')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 2: VACANCIES */}
              {matchedVacancies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{t('Vacancies & Careers', 'रोजगारी तथा विज्ञापन')} ({matchedVacancies.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedVacancies.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => handleOpenVacancy(v)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 shrink-0">
                              {v.employment_type}
                            </span>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition truncate">
                              {t(v.title_en, v.title_np || v.title_en)}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {v.department} • {t('Deadline', 'म्याद')}: {v.application_deadline}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 shrink-0 flex items-center gap-1">
                          <span>{t('Apply', 'आवेदन')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 3: CURRICULUM GUIDELINES */}
              {matchedCurriculum.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>{t('Curriculum Guidelines', 'पाठ्यक्रम निर्देशिका')} ({matchedCurriculum.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedCurriculum.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('curriculum');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 shrink-0">
                              {c.class_level}
                            </span>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
                              {isNp && c.title_np ? c.title_np : c.title_en}
                            </p>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {c.subject} • CDC Nepal Curriculum
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center gap-1">
                          <span>{t('Download', 'डाउनलोड')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 4: DOCUMENTS */}
              {matchedDocuments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('Important Documents', 'महत्वपूर्ण कागजात')} ({matchedDocuments.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedDocuments.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onNavigate('documents');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition truncate">
                            {t(d.title_en, d.title_np)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {d.type.toUpperCase()} • {d.size} • {d.date}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 shrink-0 flex items-center gap-1">
                          <span>{t('Access', 'खोल्नुहोस्')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 5: FACULTY & STAFF */}
              {matchedStaff.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>{t('Faculty & Staff', 'शिक्षक तथा कर्मचारी')} ({matchedStaff.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedStaff.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigate('staff');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/70 dark:hover:bg-purple-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <EducatorNameTypography
                            name={t(s.name_en, s.name_np)}
                            role={s.role}
                            as="p"
                            size="sm"
                            align="left"
                            className="font-semibold truncate"
                          />
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t(s.designation_en, s.designation_np)} {s.department_en ? `• ${t(s.department_en, s.department_np || s.department_en)}` : ''}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 shrink-0 flex items-center gap-1">
                          <span>{t('Profile', 'विवरण')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 6: EVENTS & ACHIEVEMENTS */}
              {(matchedEvents.length > 0 || matchedAchievements.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5" />
                    <span>{t('Events & Achievements', 'कार्यक्रम तथा उपलब्धि')} ({matchedEvents.length + matchedAchievements.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          onNavigate('about');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition truncate">
                            {t(e.title_en, e.title_np)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t('Event', 'कार्यक्रम')} • {t(e.date_en, e.date_np)}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition" />
                      </div>
                    ))}
                    {matchedAchievements.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onNavigate('about');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition truncate">
                            {t(a.title_en, a.title_np)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {t('Achievement', 'उपलब्धि')} • {a.year}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 7: HISTORY & HERITAGE */}
              {matchedHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <History className="w-3.5 h-3.5" />
                    <span>{t('History & Milestones', 'ऐतिहासिक कोशेढुङ्गा')} ({matchedHistory.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedHistory.map((h, i) => (
                      <div
                        key={h.id ?? i}
                        onClick={() => {
                          onNavigate('history');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition truncate">
                            {t(h.title_en, h.title_np)}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {h.year}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 shrink-0 flex items-center gap-1">
                          <span>{t('Chronicle', 'इतिहास')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROUP 8: PUBLIC PAGES */}
              {matchedPages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{t('Pages', 'वेबसाइट पृष्ठहरू')} ({matchedPages.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchedPages.map((p) => (
                      <div
                        key={p.route}
                        onClick={() => {
                          onNavigate(p.route);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition flex items-center justify-between group border border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition truncate">
                            {t(p.title_en, p.title_np)}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">#{p.route}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0 flex items-center gap-1">
                          <span>{t('Open', 'खोल्नुहोस्')}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
