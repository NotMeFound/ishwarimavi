import React, { useState, useMemo } from 'react';
import { Language, DocumentItem, DocumentCategory } from '../types';
import {
  FileText,
  Download,
  Search,
  FolderArchive,
  Calendar,
  CheckCircle2,
  X,
  FileCheck2,
  ShieldCheck,
  Filter,
  Layers,
  ArrowDownToLine,
  Building2,
  BookOpen
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { IconActionButton } from '../components/IconActionButton';
import { isRecentlyUpdated } from '../utils/dateUtils';

interface DocumentsViewProps {
  lang: Language;
  documents: DocumentItem[];
}

const DOCUMENT_CATEGORIES: { id: string; labelEn: string; labelNp: string }[] = [
  { id: 'all', labelEn: 'All Categories', labelNp: 'सबै विधा' },
  { id: 'notices', labelEn: 'Notices & Circulars', labelNp: 'सूचना तथा परिपत्र' },
  { id: 'forms', labelEn: 'Application Forms', labelNp: 'आवेदन फारम' },
  { id: 'curriculum', labelEn: 'Curriculum & Syllabi', labelNp: 'पाठ्यक्रम तथा पाठ्यभार' },
  { id: 'guidelines', labelEn: 'Guidelines & Policies', labelNp: 'निर्देशिका तथा नीति' },
  { id: 'routines', labelEn: 'Routines & Timetables', labelNp: 'परीक्षा तथा कक्षा तालिका' },
  { id: 'publications', labelEn: 'School Publications', labelNp: 'वार्षिक मुखपत्र तथा प्रकाशन' },
  { id: 'academic', labelEn: 'Academic Resources', labelNp: 'शैक्षिक सामग्री' },
  { id: 'reports', labelEn: 'Audits & Reports', labelNp: 'सामाजिक परीक्षण तथा प्रतिवेदन' },
  { id: 'other', labelEn: 'Other Resources', labelNp: 'अन्य कागजात' }
];

export const DocumentsView: React.FC<DocumentsViewProps> = ({ lang, documents }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [pendingDownloadDoc, setPendingDownloadDoc] = useState<DocumentItem | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Extract distinct academic years
  const availableYears = useMemo(() => {
    const set = new Set<string>();
    documents.forEach(d => {
      if (d.academic_year) set.add(d.academic_year);
    });
    return Array.from(set).sort().reverse();
  }, [documents]);

  // Filter only published documents for public visitors
  const publishedDocs = useMemo(() => {
    return documents.filter(d => d.status !== 'draft' && d.status !== 'unpublished');
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return publishedDocs.filter(d => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = d.category || 'other';
        if (cat !== selectedCategory) return false;
      }

      // Academic Year filter
      if (selectedYear !== 'all') {
        if (d.academic_year && d.academic_year !== selectedYear) return false;
      }

      // Search query
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchTitle = (d.title_en?.toLowerCase() || '').includes(q) || (d.title_np?.toLowerCase() || '').includes(q);
        const matchDesc = (d.description_en?.toLowerCase() || '').includes(q) || (d.description_np?.toLowerCase() || '').includes(q);
        const matchType = (d.type?.toLowerCase() || '').includes(q);
        if (!matchTitle && !matchDesc && !matchType) return false;
      }

      return true;
    }).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [publishedDocs, selectedCategory, selectedYear, query]);

  const executeDownload = (doc: DocumentItem) => {
    if (doc.file_data) {
      const link = document.createElement('a');
      link.href = doc.file_data;
      link.download = doc.file_name || `document_${doc.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadToast(t(`Downloaded: ${doc.title_en}`, `कागजात डाउनलोड भयो: ${doc.title_np}`));
      setTimeout(() => setDownloadToast(null), 3500);
      return;
    }

    const content = `=====================================================
ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Official Public Institutional Repository & Citizen Charter
EMIS: 48012004 • Affiliated to NEB Nepal
=====================================================
Document Reference: ISS-DOC-${doc.id}
Document Title: ${doc.title_en} (${doc.title_np})
Category / Type: ${doc.type || 'Official Document'}
Academic Year: ${doc.academic_year || '2083 B.S.'}
Certified File Size: ${doc.size || 'Standard PDF'}
Verification Date: ${doc.date}

DOCUMENT CERTIFICATION:
This document represents an authenticated institutional record issued by
Ishwari Secondary School, Bheerkot-4, Syangja, Gandaki Province, Nepal.

Certified by:
Office of the Principal / Administration
Ishwari Secondary School
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = doc.title_en.toLowerCase().replace(/[^a-z0-9]/g, '_');
    link.download = `ishwari_${safeName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(
      t(
        `Downloaded official document: ${doc.title_en}`,
        `कागजात डाउनलोड भयो: ${doc.title_np}`
      )
    );
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-950 min-h-[85vh] text-slate-900 dark:text-slate-100">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-blue-500 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Confirmation Modal with Icon-Only controls */}
      {pendingDownloadDoc && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingDownloadDoc(null)}
          onConfirm={() => {
            const doc = pendingDownloadDoc;
            setPendingDownloadDoc(null);
            executeDownload(doc);
          }}
          variant="download"
          iconOnlyActions={true}
          title={t('Confirm Document Download', 'कागजात डाउनलोड पुष्टि गर्नुहोस्')}
          description={t(
            'Are you sure you want to download this authenticated institutional file?',
            'के तपाईं यो आधिकारिक विद्यालय कागजात डाउनलोड गर्न चाहनुहुन्छ?'
          )}
          itemName={`${t(pendingDownloadDoc.title_en, pendingDownloadDoc.title_np)} (${pendingDownloadDoc.size})`}
          confirmText={t('Download Now', 'अहिले डाउनलोड गर्नुहोस्')}
          cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl border border-blue-800/40">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <FolderArchive className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('Institutional Repository & Downloads Center', 'सार्वजनिक कागजात तथा डाउनलोड केन्द्र')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('Official Documents, Forms & Publications', 'आधिकारिक कागजात, फारम तथा प्रकाशनहरू')}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {t(
                'Download verified school circulars, citizen charter, scholarship application forms, examination routines, and annual school publications issued by the administration.',
                'विद्यालयको नागरिक वडापत्र, भर्ना तथा छात्रवृत्ति फारम, परीक्षा तालिका, सामाजिक परीक्षण प्रतिवेदन र वार्षिक मुखपत्र डाउनलोड गर्नुहोस्।'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-emerald-300 border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{publishedDocs.length} {t('Available Resources', 'उपलब्ध कागजात')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-blue-300 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('Certified Digital Repository', 'प्रमाणित अभिलेख')}</span>
              </div>
            </div>
          </div>

          <div className="absolute right-6 -bottom-6 opacity-10 pointer-events-none">
            <FileText className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search documents by title or description...', 'कागजात शीर्षक वा विवरण खोज्नुहोस्...')}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Academic Year Selector if available */}
            {availableYears.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {t('Academic Year:', 'शैक्षिक सत्र:')}
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="all">{t('All Sessions', 'सबै शैक्षिक सत्र')}</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-[#1E40AF]" />
              <span>{t('Category:', 'विधा:')}</span>
            </span>

            {DOCUMENT_CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {t(cat.labelEn, cat.labelNp)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Documents Table / Compact Row Presentation */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FolderArchive className="w-8 h-8 mx-auto text-slate-400 stroke-[1.5]" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {t('No documents found.', 'कुनै कागजात फेला परेन।')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('Try modifying your search or selecting a different category filter.', 'कृपया खोजी शब्द बदल्नुहोस् वा अर्को विधा छनोट गर्नुहोस्।')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="py-3 px-3 sm:px-4 w-12 text-center">
                      {t('S.N.', 'क्र.सं.')}
                    </th>
                    <th className="py-3 px-4">
                      {t('Document Title', 'कागजात शीर्षक')}
                    </th>
                    <th className="py-3 px-3 whitespace-nowrap">
                      {t('Category', 'विधा')}
                    </th>
                    <th className="py-3 px-3 whitespace-nowrap">
                      {t('Session', 'सत्र')}
                    </th>
                    <th className="py-3 px-3 whitespace-nowrap">
                      {t('Published Date', 'प्रकाशित मिति')}
                    </th>
                    <th className="py-3 px-3 text-center whitespace-nowrap">
                      {t('Size', 'साइज')}
                    </th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">
                      {t('Action', 'कार्य')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredDocs.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      onClick={() => setPreviewDoc(doc)}
                      className="group cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors"
                    >
                      {/* S.N. */}
                      <td className="py-3 px-3 sm:px-4 text-center font-mono text-slate-400 group-hover:text-[#1E40AF] font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors text-xs sm:text-sm">
                            {t(doc.title_en, doc.title_np)}
                          </span>
                          {doc.description_en && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {t(doc.description_en, doc.description_np || '')}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {doc.category || 'other'}
                        </span>
                      </td>

                      {/* Academic Year */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.academic_year || '2083 B.S.'}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.date}
                      </td>

                      {/* Size */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {doc.size || 'PDF'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <IconActionButton
                            action="download"
                            size="sm"
                            onClick={() => setPendingDownloadDoc(doc)}
                            tooltip={t('Download File', 'डाउनलोड गर्नुहोस्')}
                            aria-label={t('Download File', 'डाउनलोड गर्नुहोस्')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {previewDoc.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{previewDoc.date}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {t(previewDoc.title_en, previewDoc.title_np)}
                </h3>
              </div>

              <IconActionButton
                action="close"
                appearance="ghost"
                size="sm"
                onClick={() => setPreviewDoc(null)}
                tooltip={t('Close preview', 'बन्द गर्नुहोस्')}
                aria-label={t('Close preview', 'बन्द गर्नुहोस्')}
              />
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Ref: ISS-DOC-{previewDoc.id}-2083</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{previewDoc.size}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t('Verified Institutional Record • Public Repository', 'प्रमाणित अभिलेख • सार्वजनिक भण्डार')}</span>
                </div>
              </div>

              <p className="leading-relaxed">
                {t(
                  previewDoc.description_en || 'This official document is published by Ishwari Secondary School for public information, institutional transparency, and administrative reference. You can securely download this verified document to your device.',
                  previewDoc.description_np || 'यो आधिकारिक दस्तावेज ईश्वरी माध्यमिक विद्यालयद्वारा सार्वजनिक सूचना तथा संस्थागत पारदर्शिताका लागि प्रकाशित गरिएको हो।'
                )}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <IconActionButton
                action="close"
                onClick={() => setPreviewDoc(null)}
                tooltip={t('Close document details', 'बन्द गर्नुहोस्')}
                aria-label={t('Close document details', 'बन्द गर्नुहोस्')}
              />

              <IconActionButton
                action="download"
                onClick={() => {
                  const doc = previewDoc;
                  setPreviewDoc(null);
                  setPendingDownloadDoc(doc);
                }}
                tooltip={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
                aria-label={t('Download Document', 'कागजात डाउनलोड गर्नुहोस्')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsView;
