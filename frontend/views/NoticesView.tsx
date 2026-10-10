import React, { useState, useEffect } from 'react';
import { Language, Notice, Vacancy } from '../types';
import {
  Bell,
  Download,
  Calendar,
  FileText,
  Search,
  CheckCircle2,
  X,
  Briefcase,
  ExternalLink,
  Clock,
  Building2,
  FileDown,
  CheckSquare,
  Printer,
  Share2,
  Bookmark,
  BookmarkCheck,
  QrCode,
  Copy
} from 'lucide-react';
import { ScrollRevealHeading, TypographicBackground } from '../components/InteractiveTypography';
import { IconActionButton } from '../components/IconActionButton';
import { isRecentlyUpdated } from '../utils/dateUtils';
import { generateQrDataUrl } from '../utils/qrUtils';
import { safeStorage } from '../utils/storage';

export interface NoticesViewProps {
  lang: Language;
  notices: Notice[];
  vacancies?: Vacancy[];
  schoolNameEn?: string;
  schoolNameNp?: string;
}

export const NoticesView: React.FC<NoticesViewProps> = ({
  lang,
  notices = [],
  vacancies = [],
  schoolNameEn = 'Ishwari Secondary School',
  schoolNameNp = 'ईश्वरी माध्यमिक विद्यालय'
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Notice Section States
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('all');
  const [noticeSearchQuery, setNoticeSearchQuery] = useState<string>('');
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);
  const [downloadConfirmNotice, setDownloadConfirmNotice] = useState<Notice | null>(null);

  // Vacancy Section States
  const [vacancySearchQuery, setVacancySearchQuery] = useState<string>('');
  const [previewVacancy, setPreviewVacancy] = useState<Vacancy | null>(null);
  const [downloadConfirmVacancy, setDownloadConfirmVacancy] = useState<Vacancy | null>(null);
  const [externalApplyVacancy, setExternalApplyVacancy] = useState<Vacancy | null>(null);

  // Saved Notices State (Stored in localStorage)
  const [savedNoticeIds, setSavedNoticeIds] = useState<number[]>(() => {
    try {
      const saved = safeStorage.getItem('ishwari_saved_notices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveNotice = (id: number) => {
    setSavedNoticeIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      safeStorage.setItem('ishwari_saved_notices', JSON.stringify(next));
      showToast(
        next.includes(id)
          ? t('Notice saved to bookmarks', 'सूचना सुरक्षित गरियो')
          : t('Notice removed from bookmarks', 'सूचना सुरक्षित सूचीबाट हटाइयो')
      );
      return next;
    });
  };

  // QR Code Data URL States
  const [noticeQrUrl, setNoticeQrUrl] = useState<string>('');
  const [vacancyQrUrl, setVacancyQrUrl] = useState<string>('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter Notices: Only published notices
  const publicNotices = notices.filter(
    (n) => n.published !== false && n.is_published !== false
  );

  // Filter Vacancies: Only published and open vacancies
  const publicVacancies = vacancies.filter(
    (v) => v.status === 'published' && v.is_open !== false
  );

  // Handle direct URL hash: #notice/{id} or #vacancy/{id}
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#notice/')) {
        const id = hash.replace('#notice/', '');
        const target = publicNotices.find((n) => String(n.id) === id);
        if (target) setPreviewNotice(target);
      } else if (hash.startsWith('#vacancy/')) {
        const id = hash.replace('#vacancy/', '');
        const target = publicVacancies.find((v) => String(v.id) === id);
        if (target) setPreviewVacancy(target);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [publicNotices, publicVacancies]);

  // ONE shared close handler for notice viewer (Critical Req 1 & 2)
  const handleCloseNoticeModal = () => {
    setPreviewNotice(null);
    setNoticeQrUrl('');
    if (window.location.hash.startsWith('#notice/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // ONE shared close handler for vacancy viewer (Req 1 & 2)
  const handleCloseVacancyModal = () => {
    setPreviewVacancy(null);
    setVacancyQrUrl('');
    if (window.location.hash.startsWith('#vacancy/')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  // Body scroll lock & ESC key listener for all modal viewers (Req 1, 2)
  useEffect(() => {
    const isAnyModalOpen = Boolean(previewNotice || previewVacancy || downloadConfirmNotice || downloadConfirmVacancy || externalApplyVacancy);
    if (!isAnyModalOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (downloadConfirmNotice) {
          setDownloadConfirmNotice(null);
        } else if (downloadConfirmVacancy) {
          setDownloadConfirmVacancy(null);
        } else if (externalApplyVacancy) {
          setExternalApplyVacancy(null);
        } else if (previewNotice) {
          handleCloseNoticeModal();
        } else if (previewVacancy) {
          handleCloseVacancyModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewNotice, previewVacancy, downloadConfirmNotice, downloadConfirmVacancy, externalApplyVacancy]);

  // Sync QR and hash when previewing notice (Req 7, 8, 10)
  useEffect(() => {
    if (previewNotice) {
      const showQr = Boolean(previewNotice.show_qr || previewNotice.qr_code_enabled);
      if (showQr) {
        const canonicalUrl = `${window.location.origin}/#notice/${previewNotice.id}`;
        generateQrDataUrl(canonicalUrl).then((qr) => {
          if (previewNotice) setNoticeQrUrl(qr);
        });
      } else {
        setNoticeQrUrl('');
      }
      window.history.replaceState(null, '', `#notice/${previewNotice.id}`);
    } else {
      setNoticeQrUrl('');
      if (window.location.hash.startsWith('#notice/')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [previewNotice]);

  // Sync QR and hash when previewing vacancy
  useEffect(() => {
    if (previewVacancy) {
      const canonicalUrl = `${window.location.origin}/#vacancy/${previewVacancy.id}`;
      generateQrDataUrl(canonicalUrl).then((qr) => {
        if (previewVacancy) setVacancyQrUrl(qr);
      });
      window.history.replaceState(null, '', `#vacancy/${previewVacancy.id}`);
    } else {
      setVacancyQrUrl('');
      if (window.location.hash.startsWith('#vacancy/')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [previewVacancy]);

  const handleShareNotice = (notice: Notice) => {
    const url = `${window.location.origin}/#notice/${notice.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(t('Direct notice link copied to clipboard!', 'सूचनाको लिङ्क प्रतिलिपि गरियो!'));
    } else {
      showToast(url);
    }
  };

  const handleShareVacancy = (vacancy: Vacancy) => {
    const url = `${window.location.origin}/#vacancy/${vacancy.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(t('Direct vacancy link copied to clipboard!', 'विज्ञापनको लिङ्क प्रतिलिपि गरियो!'));
    } else {
      showToast(url);
    }
  };

  const handlePrintNotice = () => {
    window.print();
  };

  const noticeCategories = [
    { id: 'all', labelEn: 'All Notices', labelNp: 'सबै सूचनाहरू' },
    { id: 'saved', labelEn: `Saved (${savedNoticeIds.length})`, labelNp: `सुरक्षित (${savedNoticeIds.length})` },
    { id: 'academic', labelEn: 'Academic', labelNp: 'शैक्षिक' },
    { id: 'exam', labelEn: 'Examination', labelNp: 'परीक्षा' },
    { id: 'scholarship', labelEn: 'Scholarship', labelNp: 'छात्रवृत्ति' },
    { id: 'admin', labelEn: 'Administration', labelNp: 'प्रशासनिक' },
    { id: 'event', labelEn: 'Events', labelNp: 'कार्यक्रम' },
  ];

  const filteredNotices = publicNotices.filter((n) => {
    const matchesCategory =
      selectedNoticeCategory === 'all'
        ? true
        : selectedNoticeCategory === 'saved'
        ? savedNoticeIds.includes(n.id)
        : n.category === selectedNoticeCategory;
    const q = noticeSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      n.title_en.toLowerCase().includes(q) ||
      (n.title_np && n.title_np.toLowerCase().includes(q)) ||
      (n.description_en && n.description_en.toLowerCase().includes(q)) ||
      (n.description_np && n.description_np.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const filteredVacancies = publicVacancies.filter((v) => {
    const q = vacancySearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      v.title_en.toLowerCase().includes(q) ||
      (v.title_np && v.title_np.toLowerCase().includes(q)) ||
      (v.department && v.department.toLowerCase().includes(q)) ||
      (v.employment_type && v.employment_type.toLowerCase().includes(q))
    );
  });

  // Download Notice file handler
  const executeNoticeDownload = (notice: Notice) => {
    setDownloadConfirmNotice(null);

    if (notice.file_data) {
      const link = document.createElement('a');
      link.href = notice.file_data;
      link.download = notice.file_name?.toLowerCase().endsWith('.pdf')
        ? notice.file_name
        : `${notice.file_name || 'notice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(t(`Downloaded: ${notice.file_name}`, `कागजात डाउनलोड भयो: ${notice.file_name}`));
      return;
    }

    // Fallback formatted text official document
    const content = `=====================================================
${schoolNameEn.toUpperCase()} (${schoolNameNp})
Official Government Model Secondary School • EMIS: 48012004
=====================================================
Document Reference: ${notice.file_name || `NOTICE-${notice.id}`}
Subject: ${isNp ? notice.title_np : notice.title_en}
Published Date: ${isNp ? notice.date_np : notice.date_en}
Category: ${notice.category.toUpperCase()}

OFFICIAL BULLETIN DETAILS:
-----------------------------------------------------
${isNp ? notice.description_np : notice.description_en}

Certified By:
Principal / Administration Office
${schoolNameEn}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (notice.file_name || `notice-${notice.id}`).replace('.pdf', '.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t(`Downloaded Notice: ${notice.file_name || 'Document'}`, `सूचना कागजात डाउनलोड भयो`));
  };

  // Download Vacancy file handler with confirmation fallback
  const executeVacancyDownload = (vacancy: Vacancy) => {
    setDownloadConfirmVacancy(null);

    if (vacancy.pdf_url) {
      const link = document.createElement('a');
      link.href = vacancy.pdf_url;
      link.download =
        vacancy.pdf_filename ||
        `${vacancy.title_en.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vacancy.pdf`;
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(t(`Downloaded Vacancy PDF: ${vacancy.title_en}`, `पदपूर्ति सूचना PDF डाउनलोड भयो`));
      return;
    }

    // Official formatted vacancy document
    const content = `=====================================================
${schoolNameEn.toUpperCase()} (${schoolNameNp})
Official Government Model Secondary School • EMIS: 48012004
VACANCY / RECRUITMENT NOTICE
=====================================================
Position: ${isNp && vacancy.title_np ? vacancy.title_np : vacancy.title_en}
Department: ${vacancy.department}
Employment Type: ${vacancy.employment_type}
Number of Openings: ${vacancy.positions_count}
Publish Date: ${vacancy.publish_date || 'N/A'}
Application Deadline: ${vacancy.application_deadline}

JOB OVERVIEW:
-----------------------------------------------------
${isNp && vacancy.description_np ? vacancy.description_np : vacancy.description_en}

MINIMUM QUALIFICATIONS:
-----------------------------------------------------
${vacancy.qualifications && vacancy.qualifications.length > 0 ? vacancy.qualifications.map(q => `- ${q}`).join('\n') : 'As per Ministry of Education guidelines.'}

APPLICATION INSTRUCTIONS:
-----------------------------------------------------
${vacancy.application_instructions || 'Submit official credentials to the administration office or via online portal.'}

Certified By:
Recruitment Committee / Principal
${schoolNameEn}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = vacancy.title_en.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `ishwari_vacancy_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t(`Downloaded Vacancy Document: ${vacancy.title_en}`, `पदपूर्ति सूचना डाउनलोड भयो`));
  };

  // Safe external apply handler
  const confirmApplyRedirect = (vacancy: Vacancy) => {
    if (!vacancy.application_url) return;
    window.open(vacancy.application_url, '_blank', 'noopener,noreferrer');
    setExternalApplyVacancy(null);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[80vh] text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative overflow-hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Subtle Ambient Watermark: GAZETTE */}
        <TypographicBackground
          text="CIRCULARS"
          position="top-right"
          align="right"
          opacityClass="text-slate-900/[0.02] dark:text-white/[0.015]"
        />

        {/* Page Title & Breadcrumb Header */}
        <div className="relative z-10 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E40AF] dark:text-blue-400 uppercase tracking-wider mb-1">
                <Bell className="w-4 h-4 stroke-[2]" />
                <span>{t('Official Notice Board', 'आधिकारिक सूचना पाटी')}</span>
              </div>
              <ScrollRevealHeading as="h1" className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('Notices & Announcements', 'सूचना तथा विज्ञापन')}
              </ScrollRevealHeading>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
                {t(
                  'Access official institutional circulars, exam routines, public guidelines, and open recruitment announcements.',
                  'विद्यालयका आधिकारिक सूचना, परिपत्र, परीक्षा तालिका, सार्वजनिक सूचना तथा शिक्षक/कर्मचारी खुला पदपूर्ति विज्ञापनहरू।'
                )}
              </p>
            </div>

            {/* Quick Summary Pill Counter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#1E40AF]" />
                <span>{t('Notices:', 'सूचना:')} <strong>{publicNotices.length}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t('Vacancies:', 'विज्ञापन:')} <strong>{publicVacancies.length}</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: SCHOOL NOTICES */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]" />
                <ScrollRevealHeading as="h2" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {t('School Notices', 'विद्यालयका सूचनाहरू')}
                </ScrollRevealHeading>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Circulars, academic schedules, admissions, and institutional alerts', 'शैक्षिक तालिका, भर्ना, परीक्षा तथा प्रशासनिक परिपत्रहरू')}
              </p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category selector */}
              <div className="relative">
                <select
                  value={selectedNoticeCategory}
                  onChange={(e) => setSelectedNoticeCategory(e.target.value)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer focus:ring-2 focus:ring-[#1E40AF]"
                >
                  {noticeCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {t(c.labelEn, c.labelNp)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search input */}
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2]" />
                <input
                  type="text"
                  value={noticeSearchQuery}
                  onChange={(e) => setNoticeSearchQuery(e.target.value)}
                  placeholder={t('Search notice title...', 'सूचना खोज्नुहोस्...')}
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
                />
                {noticeSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setNoticeSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2]" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* School Notices Table / Compact List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            {filteredNotices.length === 0 ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400 space-y-1.5">
                <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-sm font-semibold">
                  {t('No notices available.', 'कुनै सूचना उपलब्ध छैन।')}
                </p>
                <p className="text-xs text-slate-400">
                  {t('Please check back later or modify your search filter.', 'कृपया केही समयपछि पुन: हेर्नुहोस् वा खोजी शब्द बदल्नुहोस्।')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">
                        {t('S.N.', 'क्र.सं.')}
                      </th>
                      <th className="py-3 px-4">
                        {t('Notice', 'सूचना')}
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap">
                        {t('Date', 'मिति')}
                      </th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">
                        {t('Document', 'कागजात')}
                      </th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">
                        {t('Action', 'कार्य')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredNotices.map((n, idx) => (
                      <tr
                        key={n.id}
                        onClick={() => setPreviewNotice(n)}
                        className={`group cursor-pointer hover:bg-amber-50/40 dark:hover:bg-amber-950/20 active:bg-amber-50/60 dark:active:bg-amber-950/30 transition-colors ${
                          n.pinned ? 'bg-amber-50/30 dark:bg-amber-950/15' : ''
                        }`}
                      >
                        {/* Two-digit S.N. (01, 02, 03...) */}
                        <td className="py-3 px-3 sm:px-4 text-center font-mono text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 font-bold transition-colors">
                          {String(idx + 1).padStart(2, '0')}
                        </td>

                        {/* Notice Title & Metadata */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-semibold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-xs sm:text-sm">
                                {t(n.title_en, n.title_np)}
                              </span>
                              {n.pinned && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                                  ★ {t('Pinned', 'पिन')}
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                                {n.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                              {t(n.description_en, n.description_np)}
                            </p>
                          </div>
                        </td>

                        {/* Published Date & NEW badge */}
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <span>{t(n.date_en, n.date_np)}</span>
                            {isRecentlyUpdated(n.updated_at || n.date_en) && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {t('NEW', 'नयाँ')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Document (PDF Download) */}
                        <td className="py-3 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {n.file_data || n.file_name ? (
                            <IconActionButton
                              action="download"
                              onClick={() => setDownloadConfirmNotice(n)}
                              tooltip={t('Download Notice PDF', 'सूचना PDF डाउनलोड गर्नुहोस्')}
                              aria-label={t('Download Notice PDF', 'सूचना PDF डाउनलोड गर्नुहोस्')}
                            />
                          ) : (
                            <span className="text-slate-400 font-mono text-xs">—</span>
                          )}
                        </td>

                        {/* Actions (Bookmark, Share) */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center justify-end gap-1">
                            {/* Save / Bookmark Button */}
                            <button
                              type="button"
                              onClick={() => toggleSaveNotice(n.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title={savedNoticeIds.includes(n.id) ? t('Remove bookmark', 'हटाउनुहोस्') : t('Save notice', 'सुरक्षित गर्नुहोस्')}
                              aria-label={savedNoticeIds.includes(n.id) ? t('Remove bookmark', 'हटाउनुहोस्') : t('Save notice', 'सुरक्षित गर्नुहोस्')}
                            >
                              {savedNoticeIds.includes(n.id) ? (
                                <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                              ) : (
                                <Bookmark className="w-4 h-4" strokeWidth={1.8} />
                              )}
                            </button>

                            {/* Share Direct Link Button */}
                            <button
                              type="button"
                              onClick={() => handleShareNotice(n)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                              title={t('Share notice link', 'लिङ्क साझा गर्नुहोस्')}
                              aria-label={t('Share notice link', 'लिङ्क साझा गर्नुहोस्')}
                            >
                              <Share2 className="w-4 h-4" strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: CAREER & VACANCIES */}
        {/* ============================================================ */}
        <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <ScrollRevealHeading as="h2" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2]" />
                  <span>{t('Career & Vacancies', 'रोजगारी तथा पदपूर्ति विज्ञापन')}</span>
                </ScrollRevealHeading>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  'Open teaching and administrative employment opportunities at Ishwari Secondary School',
                  'ईश्वरी माध्यमिक विद्यालयमा शिक्षक तथा प्रशासनिक कर्मचारी खुला पदपूर्ति'
                )}
              </p>
            </div>

            {/* Vacancy Search */}
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none stroke-[2]" />
              <input
                type="text"
                value={vacancySearchQuery}
                onChange={(e) => setVacancySearchQuery(e.target.value)}
                placeholder={t('Search position...', 'पद खोज्नुहोस्...')}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
              {vacancySearchQuery && (
                <button
                  type="button"
                  onClick={() => setVacancySearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              )}
            </div>
          </div>

          {/* Vacancies Table / Compact List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            {filteredVacancies.length === 0 ? (
              <div className="p-10 text-center text-slate-500 dark:text-slate-400 space-y-1.5">
                <Briefcase className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                <p className="text-sm font-semibold">
                  {t('No current vacancies available.', 'हाल कुनै खुला विज्ञापन उपलब्ध छैन।')}
                </p>
                <p className="text-xs text-slate-400">
                  {t(
                    'All positions are currently filled. New vacancies will be published here.',
                    'हाल सबै पदहरू पूर्ण छन्। नयाँ पदपूर्ति विज्ञापन खुल्नासाथ यसै सूचीमा प्रकाशित गरिनेछ।'
                  )}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      <th className="py-3 px-3 sm:px-4 w-12 text-center">
                        {t('S.N.', 'क्र.सं.')}
                      </th>
                      <th className="py-3 px-4">
                        {t('Position', 'पद तथा विभाग')}
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap">
                        {t('Date', 'मिति')}
                      </th>
                      <th className="py-3 px-4 whitespace-nowrap">
                        {t('Deadline', 'दरखास्त म्याद')}
                      </th>
                      <th className="py-3 px-4 text-center whitespace-nowrap">
                        {t('Document', 'कागजात')}
                      </th>
                      <th className="py-3 px-4 text-right whitespace-nowrap">
                        {t('Action', 'कार्य')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredVacancies.map((v, idx) => {
                      const hasPdf = Boolean(v.pdf_url || v.pdf_filename);
                      const isApplyEnabled = Boolean(
                        v.apply_now_enabled && v.application_url && v.application_url.trim()
                      );

                      return (
                        <tr
                          key={v.id}
                          onClick={() => setPreviewVacancy(v)}
                          className="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Two-digit S.N. */}
                          <td className="py-3 px-3 sm:px-4 text-center font-mono text-slate-400 font-bold">
                            {String(idx + 1).padStart(2, '0')}
                          </td>

                          {/* Position & Department */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPreviewVacancy(v)}
                                  className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm hover:text-[#1E40AF] dark:hover:text-blue-400 text-left transition cursor-pointer"
                                >
                                  {t(v.title_en, v.title_np || v.title_en)}
                                </button>
                                {v.featured && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                                    ★ {t('Featured', 'प्रमुख')}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-medium">
                                  {v.department}
                                </span>
                                <span>•</span>
                                <span>{v.employment_type}</span>
                                <span>•</span>
                                <span>
                                  {v.positions_count} {t('Position(s)', 'पद')}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Published Date & NEW badge */}
                          <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{v.publish_date || '—'}</span>
                              {isRecentlyUpdated(v.updated_at || v.publish_date) && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {t('NEW', 'नयाँ')}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Deadline Date */}
                          <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                            <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                              <span>{v.application_deadline}</span>
                            </span>
                          </td>

                          {/* PDF Column - ICON ONLY, triggers confirmation */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {hasPdf ? (
                              <IconActionButton
                                action="download"
                                onClick={() => setDownloadConfirmVacancy(v)}
                                tooltip={t('Download Vacancy PDF', 'आधिकारिक PDF डाउनलोड गर्नुहोस्')}
                                aria-label={t('Download Vacancy PDF', 'आधिकारिक PDF डाउनलोड गर्नुहोस्')}
                              />
                            ) : (
                              <span className="text-slate-400 font-mono text-xs">—</span>
                            )}
                          </td>

                          {/* Actions: Share, Apply Now */}
                          <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Share Direct Link Button */}
                              <button
                                type="button"
                                onClick={() => handleShareVacancy(v)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title={t('Share vacancy link', 'लिङ्क साझा गर्नुहोस्')}
                                aria-label={t('Share vacancy link', 'लिङ्क साझा गर्नुहोस्')}
                              >
                                <Share2 className="w-4 h-4" strokeWidth={1.8} />
                              </button>

                              {/* Apply Now button: Only shown when apply_now_enabled === true */}
                              {isApplyEnabled && (
                                <button
                                  type="button"
                                  onClick={() => setExternalApplyVacancy(v)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                >
                                  <span>{t('Apply Now', 'दरखास्त दिनुहोस्')}</span>
                                  <ExternalLink className="w-3 h-3 stroke-[2]" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: NOTICE DETAILS PREVIEW MODAL & PRINTABLE LETTERHEAD */}
      {/* ============================================================ */}
      {previewNotice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-modal-title"
          onClick={handleCloseNoticeModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 sm:gap-4 shrink-0 bg-white dark:bg-slate-900">
              <div className="space-y-1.5 min-w-0 flex-1 pr-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                    {previewNotice.category.toUpperCase()}
                  </span>
                  {previewNotice.pinned && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                      PINNED
                    </span>
                  )}
                  {isRecentlyUpdated(previewNotice.updated_at || previewNotice.date_en) && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      NEW
                    </span>
                  )}
                </div>
                <h3 id="notice-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug break-words">
                  {t(previewNotice.title_en, previewNotice.title_np)}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <Calendar className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                  <span>{t(previewNotice.date_en, previewNotice.date_np)}</span>
                </div>
              </div>

              {/* Standardized Header Action Toolbar: Bookmark | Share | Print | X (Req 3, 4) */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* 1. Bookmark Toggle (40x40px) */}
                <button
                  type="button"
                  onClick={() => toggleSaveNotice(previewNotice.id)}
                  className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    savedNoticeIds.includes(previewNotice.id)
                      ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-slate-700'
                  }`}
                  title={savedNoticeIds.includes(previewNotice.id) ? t('Remove bookmark', 'हटाउनुहोस्') : t('Save notice', 'सुरक्षित गर्नुहोस्')}
                  aria-label={savedNoticeIds.includes(previewNotice.id) ? t('Remove bookmark', 'हटाउनुहोस्') : t('Save notice', 'सुरक्षित गर्नुहोस्')}
                >
                  {savedNoticeIds.includes(previewNotice.id) ? (
                    <BookmarkCheck className="w-5 h-5 text-amber-500 fill-amber-500 stroke-[2]" />
                  ) : (
                    <Bookmark className="w-5 h-5 stroke-[2]" />
                  )}
                </button>

                {/* 2. Share Notice (40x40px) */}
                <button
                  type="button"
                  onClick={() => handleShareNotice(previewNotice)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={t('Share notice link', 'लिङ्क साझा गर्नुहोस्')}
                  aria-label={t('Share notice link', 'लिङ्क साझा गर्नुहोस्')}
                >
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </button>

                {/* 3. Print Notice (40x40px) */}
                <button
                  type="button"
                  onClick={handlePrintNotice}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={t('Print Notice', 'सूचना छाप्नुहोस्')}
                  aria-label={t('Print Notice', 'सूचना छाप्नुहोस्')}
                >
                  <Printer className="w-5 h-5 stroke-[2]" />
                </button>

                {/* 4. Top-Right Close Button (40x40px) */}
                <button
                  type="button"
                  onClick={handleCloseNoticeModal}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50/70 dark:hover:bg-red-950/40 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto flex-1">
              {/* Document Information & Official Verification (Req 7, 8, 9, 10, 11, 14) */}
              {(() => {
                const noticeRef = previewNotice.reference_no?.trim() || ('ISS-NOTICE-' + String(previewNotice.id).padStart(3, '0'));
                const showQr = Boolean(previewNotice.show_qr || previewNotice.qr_code_enabled);

                return (
                  <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 font-mono text-[11px]">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 rounded">
                          Ref: {noticeRef}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-sans">
                          {previewNotice.file_size_kb ? `${previewNotice.file_size_kb} KB PDF` : t('Official Document', 'आधिकारिक दस्तावेज')}
                        </span>
                      </div>
                      <p className="truncate text-slate-600 dark:text-slate-400 font-sans text-xs">
                        {previewNotice.file_name || 'Official School Notice Document'}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                        <span>{t('Official School Bulletin Authenticated', 'आधिकारिक विद्यालय सूचना प्रमाणित')}</span>
                      </p>
                    </div>

                    {/* QR Code Block (Only if enabled by admin for this notice) */}
                    {showQr && noticeQrUrl && noticeQrUrl.trim() && (
                      <div className="shrink-0 flex flex-row sm:flex-col items-center gap-2 sm:gap-1 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <img
                          src={noticeQrUrl}
                          alt="Notice QR"
                          className="w-16 h-16 rounded bg-white p-0.5 object-contain"
                        />
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-sans font-medium text-center leading-tight max-w-[100px]">
                          {t('Scan to view official notice', 'आधिकारिक सूचना हेर्न स्क्यान')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200">
                {t(previewNotice.description_en, previewNotice.description_np)}
              </div>

              {/* Printable Notice Format (rendered in print media) */}
              {(() => {
                const noticeRef = previewNotice.reference_no?.trim() || ('ISS-NOTICE-' + String(previewNotice.id).padStart(3, '0'));
                const showQr = Boolean(previewNotice.show_qr || previewNotice.qr_code_enabled);

                return (
                  <div className="hidden print:block printable-notice-area text-black font-serif pt-6 border-t-2 border-slate-900">
                    <div className="text-center pb-4 border-b border-slate-400 space-y-1">
                      <h1 className="text-xl font-bold uppercase tracking-wider">{schoolNameEn}</h1>
                      <h2 className="text-lg font-bold">{schoolNameNp}</h2>
                      <p className="text-xs">Government Model Secondary School • EMIS: 48012004 • Nepal</p>
                      <p className="text-xs font-mono font-bold pt-1">OFFICIAL INSTITUTIONAL BULLETIN</p>
                    </div>

                    <div className="flex justify-between py-2 text-xs font-mono border-b border-slate-200">
                      <span>Ref: {noticeRef}</span>
                      <span>Date: {previewNotice.date_en} ({previewNotice.date_np})</span>
                    </div>

                    <div className="py-4 space-y-3">
                      <h3 className="text-base font-bold underline text-center">{previewNotice.title_en}</h3>
                      <p className="text-sm text-justify leading-relaxed whitespace-pre-line">{previewNotice.description_en}</p>
                      {previewNotice.description_np && (
                        <p className="text-sm text-justify leading-relaxed whitespace-pre-line pt-2">{previewNotice.description_np}</p>
                      )}
                    </div>

                    <div className="pt-8 flex justify-between items-end text-xs">
                      {showQr && noticeQrUrl && noticeQrUrl.trim() ? (
                        <div className="text-center">
                          <img src={noticeQrUrl} alt="QR" className="w-20 h-20 mx-auto" />
                          <span className="text-[9px] font-mono">{t('Scan to view official notice', 'आधिकारिक सूचना हेर्न स्क्यान')}</span>
                        </div>
                      ) : <div />}
                      <div className="text-center w-48 space-y-1">
                        <div className="border-b border-black w-full h-8" />
                        <p className="font-bold">Principal / Authority</p>
                        <p className="text-[10px]">{schoolNameEn}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Standardized Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <IconActionButton
                action="close"
                onClick={handleCloseNoticeModal}
                tooltip={t('Close notice', 'सूचना बन्द गर्नुहोस्')}
                aria-label={t('Close notice', 'सूचना बन्द गर्नुहोस्')}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintNotice}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center cursor-pointer shadow-2xs"
                  title={t('Print Notice', 'सूचना छाप्नुहोस्')}
                  aria-label={t('Print Notice', 'सूचना छाप्नुहोस्')}
                >
                  <Printer className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Standardized Download Action Button */}
                <IconActionButton
                  action="download"
                  onClick={() => {
                    const target = previewNotice;
                    setPreviewNotice(null);
                    setDownloadConfirmNotice(target);
                  }}
                  tooltip={t('Download Notice', 'सूचना डाउनलोड गर्नुहोस्')}
                  aria-label={t('Download Notice', 'सूचना डाउनलोड गर्नुहोस्')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: NOTICE DOWNLOAD CONFIRMATION */}
      {/* ============================================================ */}
      {downloadConfirmNotice && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDownloadConfirmNotice(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 relative"
          >
            <div className="absolute top-4 right-4">
              <IconActionButton
                action="close"
                appearance="ghost"
                onClick={() => setDownloadConfirmNotice(null)}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 mx-auto">
              <Download className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Download Notice Document?', 'सूचना डाउनलोड गर्न चाहनुहुन्छ?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-2">
                "{t(downloadConfirmNotice.title_en, downloadConfirmNotice.title_np)}"
              </p>
              {downloadConfirmNotice.file_size_kb && (
                <p className="text-[11px] font-mono text-slate-400">
                  {downloadConfirmNotice.file_size_kb} KB • PDF
                </p>
              )}
            </div>

            {/* Confirmation actions: Icon-only standard controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <IconActionButton
                action="cancel"
                onClick={() => setDownloadConfirmNotice(null)}
                tooltip={t('Cancel', 'रद्द गर्नुहोस्')}
                aria-label={t('Cancel', 'रद्द गर्नुहोस्')}
              />
              <IconActionButton
                action="download"
                onClick={() => executeNoticeDownload(downloadConfirmNotice)}
                tooltip={t('Confirm Download', 'डाउनलोड सुनिश्चित गर्नुहोस्')}
                aria-label={t('Confirm Download', 'डाउनलोड सुनिश्चित गर्नुहोस्')}
              />
            </div>
          </div>
        </div>
      )}


      {/* ============================================================ */}
      {/* MODAL 3: VACANCY DETAILS PREVIEW MODAL */}
      {/* ============================================================ */}
      {previewVacancy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="vacancy-modal-title"
          onClick={handleCloseVacancyModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 sm:gap-4 shrink-0 bg-white dark:bg-slate-900">
              <div className="space-y-1.5 min-w-0 flex-1 pr-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                    {previewVacancy.employment_type}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {previewVacancy.department}
                  </span>
                </div>
                <h3 id="vacancy-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug break-words">
                  {t(previewVacancy.title_en, previewVacancy.title_np || previewVacancy.title_en)}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{t('Positions:', 'सङ्ख्या:')} {previewVacancy.positions_count}</span>
                  <span>•</span>
                  <span>{t('Deadline:', 'म्याद:')} {previewVacancy.application_deadline}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShareVacancy(previewVacancy)}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#1E40AF] dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={t('Share vacancy link', 'लिङ्क साझा गर्नुहोस्')}
                  aria-label={t('Share vacancy link', 'लिङ्क साझा गर्नुहोस्')}
                >
                  <Share2 className="w-5 h-5 stroke-[2]" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseVacancyModal}
                  className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/60 hover:bg-red-50/70 dark:hover:bg-red-950/40 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                  title={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed overflow-y-auto flex-1">
              {/* QR and Metadata verification box */}
              {vacancyQrUrl && vacancyQrUrl.trim() && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-[11px]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">Ref: ISS-VACANCY-{previewVacancy.id}</p>
                    <p className="text-slate-500 font-sans">{previewVacancy.department} • {previewVacancy.employment_type}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2] shrink-0" />
                      <span>{t('Official Career Listing Authenticated', 'आधिकारिक पदपूर्ति विज्ञापन')}</span>
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <img
                      src={vacancyQrUrl}
                      alt="Vacancy QR"
                      className="w-16 h-16 rounded bg-white p-0.5 object-contain border border-slate-200 dark:border-slate-700 shadow-2xs"
                    />
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-sans font-medium max-w-[100px] leading-tight">
                      {t('Scan to view official vacancy', 'आधिकारिक विज्ञापन हेर्न स्क्यान')}
                    </span>
                  </div>
                </div>
              )}
              {/* Short summary */}
              {(previewVacancy.short_description_en || previewVacancy.short_description_np) && (
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {t(
                    previewVacancy.short_description_en || '',
                    previewVacancy.short_description_np || previewVacancy.short_description_en || ''
                  )}
                </p>
              )}

              {/* Full description */}
              <div className="whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed">
                {t(
                  previewVacancy.description_en || '',
                  previewVacancy.description_np || previewVacancy.description_en || ''
                )}
              </div>

              {/* Qualifications */}
              {previewVacancy.qualifications && previewVacancy.qualifications.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 stroke-[2]" />
                    <span>{t('Minimum Qualifications Required', 'आवश्यक न्यूनतम योग्यता')}</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                    {previewVacancy.qualifications.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Responsibilities */}
              {previewVacancy.responsibilities && previewVacancy.responsibilities.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#1E40AF] stroke-[2]" />
                    <span>{t('Key Roles & Responsibilities', 'मुख्य जिम्मेवारीहरू')}</span>
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                    {previewVacancy.responsibilities.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application instructions */}
              {previewVacancy.application_instructions && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 stroke-[2]" />
                    <span>{t('Application Instructions', 'आवेदन सम्बन्धी निर्देशन')}</span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {previewVacancy.application_instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <IconActionButton
                action="close"
                onClick={handleCloseVacancyModal}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />

              <div className="flex items-center gap-2">
                <IconActionButton
                  action="download"
                  onClick={() => {
                    const target = previewVacancy;
                    setPreviewVacancy(null);
                    setDownloadConfirmVacancy(target);
                  }}
                  tooltip={t('Download Vacancy Notice', 'पदपूर्ति सूचना डाउनलोड गर्नुहोस्')}
                  aria-label={t('Download Vacancy Notice', 'पदपूर्ति सूचना डाउनलोड गर्नुहोस्')}
                />

                {previewVacancy.apply_now_enabled &&
                  previewVacancy.application_url &&
                  previewVacancy.application_url.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewVacancy;
                        setPreviewVacancy(null);
                        setExternalApplyVacancy(target);
                      }}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold text-white bg-[#1E40AF] hover:bg-[#1D4ED8] transition shadow-xs cursor-pointer"
                    >
                      <span>{t('Apply Now', 'दरखास्त दिनुहोस्')}</span>
                      <ExternalLink className="w-4 h-4 stroke-[2]" />
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: VACANCY DOWNLOAD CONFIRMATION */}
      {/* ============================================================ */}
      {downloadConfirmVacancy && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDownloadConfirmVacancy(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 relative"
          >
            <div className="absolute top-4 right-4">
              <IconActionButton
                action="close"
                appearance="ghost"
                onClick={() => setDownloadConfirmVacancy(null)}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 mx-auto">
              <Download className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Download Vacancy Document?', 'पदपूर्ति सूचना डाउनलोड गर्न चाहनुहुन्छ?')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 px-2">
                "{t(downloadConfirmVacancy.title_en, downloadConfirmVacancy.title_np || downloadConfirmVacancy.title_en)}"
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                {downloadConfirmVacancy.department} • {downloadConfirmVacancy.employment_type}
              </p>
            </div>

            {/* Confirmation actions: Icon-only standard controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <IconActionButton
                action="cancel"
                onClick={() => setDownloadConfirmVacancy(null)}
                tooltip={t('Cancel', 'रद्द गर्नुहोस्')}
                aria-label={t('Cancel', 'रद्द गर्नुहोस्')}
              />
              <IconActionButton
                action="download"
                onClick={() => executeVacancyDownload(downloadConfirmVacancy)}
                tooltip={t('Confirm Download', 'डाउनलोड सुनिश्चित गर्नुहोस्')}
                aria-label={t('Confirm Download', 'डाउनलोड सुनिश्चित गर्नुहोस्')}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: EXTERNAL APPLY NOW CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {externalApplyVacancy && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setExternalApplyVacancy(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 relative"
          >
            <div className="absolute top-4 right-4">
              <IconActionButton
                action="close"
                appearance="ghost"
                onClick={() => setExternalApplyVacancy(null)}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 mx-auto">
              <ExternalLink className="w-6 h-6 stroke-[2]" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Proceed to Online Application Form', 'अनलाइन दरखास्त फारममा जाँदै हुनुहुन्छ')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 px-2 leading-relaxed">
                {t(
                  `You will be safely redirected to the verified online application form for "${externalApplyVacancy.title_en}".`,
                  `तपाईं "${t(externalApplyVacancy.title_en, externalApplyVacancy.title_np || externalApplyVacancy.title_en)}" को आधिकारिक फारममा पुग्नुहुनेछ।`
                )}
              </p>
              <p className="text-[11px] font-mono text-slate-400 truncate max-w-xs mx-auto pt-1">
                {externalApplyVacancy.application_url}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <IconActionButton
                action="cancel"
                onClick={() => setExternalApplyVacancy(null)}
                tooltip={t('Cancel', 'रद्द गर्नुहोस्')}
                aria-label={t('Cancel', 'रद्द गर्नुहोस्')}
              />
              <button
                type="button"
                onClick={() => confirmApplyRedirect(externalApplyVacancy)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#1E40AF] hover:bg-[#1D4ED8] transition shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>{t('Continue', 'अगाडि बढ्नुहोस्')}</span>
                <ExternalLink className="w-3.5 h-3.5 stroke-[2]" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default NoticesView;
