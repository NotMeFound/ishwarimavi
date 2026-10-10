import React, { useState, useMemo } from 'react';
import { Language, CurriculumGuideline, ResourceType } from '../types';
import {
  BookMarked,
  Search,
  Filter,
  Download,
  FileText,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  X,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { IconActionButton } from '../components/IconActionButton';

interface CurriculumViewProps {
  lang: Language;
  curriculumGuidelines: CurriculumGuideline[];
}

const CLASS_FILTERS = [
  { id: 'all', labelEn: 'All Classes', labelNp: 'सबै कक्षाहरू' },
  { id: 'Grade 1-5', labelEn: 'Primary (1-5)', labelNp: 'प्राथमिक (१-५)' },
  { id: 'Grade 6-8', labelEn: 'Basic Level (6-8)', labelNp: 'आधारभूत (६-८)' },
  { id: 'Grade 9-10', labelEn: 'Secondary (9-10 / SEE)', labelNp: 'माध्यमिक (९-१०)' },
  { id: 'Grade 11-12', labelEn: '+2 Higher Sec (11-12)', labelNp: '+२ माध्यमिक (११-१२)' }
];

const RESOURCE_TYPE_FILTERS: { id: string; labelEn: string; labelNp: string }[] = [
  { id: 'all', labelEn: 'All Types', labelNp: 'सबै प्रकार' },
  { id: 'curriculum', labelEn: 'Curriculum', labelNp: 'पाठ्यक्रम' },
  { id: 'syllabus', labelEn: 'Syllabus', labelNp: 'पाठ्यभार' },
  { id: 'guidelines', labelEn: 'Guidelines', labelNp: 'निर्देशिका' },
  { id: 'notes', labelEn: 'Study Notes', labelNp: 'नोट्स' },
  { id: 'question_paper', labelEn: 'Question Paper', labelNp: 'प्रश्नपत्र' },
  { id: 'routine', labelEn: 'Routine', labelNp: 'तालिका' },
  { id: 'reference', labelEn: 'Reference', labelNp: 'सन्दर्भ सामग्री' },
  { id: 'other', labelEn: 'Other', labelNp: 'अन्य' }
];

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  lang,
  curriculumGuidelines
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedResourceType, setSelectedResourceType] = useState('all');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<CurriculumGuideline | null>(null);
  const [pendingDownloadItem, setPendingDownloadItem] = useState<CurriculumGuideline | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const executeCurriculumDownload = (item: CurriculumGuideline) => {
    setPendingDownloadItem(null);
    if (item.file_data) {
      const link = document.createElement('a');
      link.href = item.file_data;
      link.download = item.original_filename || `${item.title_en}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (item.file_url) {
      const link = document.createElement('a');
      link.href = item.file_url;
      link.download = item.original_filename || 'curriculum_guideline.pdf';
      link.target = '_blank';
      link.rel = 'noopener,noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `=====================================================
ISHWARI SECONDARY SCHOOL (ईश्वरी माध्यमिक विद्यालय)
Academic Digital Resources • CDC & NEB Framework
=====================================================
Title: ${isNp && item.title_np ? item.title_np : item.title_en}
Subject: ${item.subject}
Class Level: ${item.class_level}
Academic Year: ${item.academic_year || '2083 B.S.'}
Resource Type: ${(item.resource_type || 'curriculum').toUpperCase()}

OVERVIEW & OBJECTIVES:
-----------------------------------------------------
${isNp && item.description_np ? item.description_np : item.description_en || 'Official Curriculum Guidelines'}
=====================================================`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title_en.toLowerCase().replace(/[^a-z0-9]/g, '_')}_curriculum.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    setDownloadToast(
      t(
        `Downloaded: ${item.title_en}`,
        `शैक्षिक सामग्री डाउनलोड भयो: ${item.title_np || item.title_en}`
      )
    );
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Strictly filter only PUBLISHED resources for public visitors
  const publishedGuidelines = useMemo(() => {
    return curriculumGuidelines.filter((g) => g.status === 'published');
  }, [curriculumGuidelines]);

  // Extract distinct subjects available among published guidelines
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    publishedGuidelines.forEach((g) => {
      if (g.subject) set.add(g.subject);
    });
    return Array.from(set).sort();
  }, [publishedGuidelines]);

  // Extract distinct academic years
  const availableAcademicYears = useMemo(() => {
    const set = new Set<string>();
    publishedGuidelines.forEach((g) => {
      if (g.academic_year) set.add(g.academic_year);
    });
    return Array.from(set).sort().reverse();
  }, [publishedGuidelines]);

  // Filtered guidelines
  const filteredGuidelines = useMemo(() => {
    let result = [...publishedGuidelines];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title_en?.toLowerCase().includes(q) ||
          item.title_np?.toLowerCase().includes(q) ||
          item.subject?.toLowerCase().includes(q) ||
          item.class_level?.toLowerCase().includes(q) ||
          item.description_en?.toLowerCase().includes(q) ||
          item.description_np?.toLowerCase().includes(q)
      );
    }

    if (selectedClass !== 'all') {
      result = result.filter((item) => item.class_level === selectedClass);
    }

    if (selectedSubject !== 'all') {
      result = result.filter((item) => item.subject === selectedSubject);
    }

    if (selectedResourceType !== 'all') {
      result = result.filter((item) => (item.resource_type || 'curriculum') === selectedResourceType);
    }

    if (selectedAcademicYear !== 'all') {
      result = result.filter((item) => item.academic_year === selectedAcademicYear);
    }

    return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [publishedGuidelines, searchQuery, selectedClass, selectedSubject, selectedResourceType, selectedAcademicYear]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-blue-500 shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingDownloadItem && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingDownloadItem(null)}
          onConfirm={() => executeCurriculumDownload(pendingDownloadItem)}
          variant="download"
          iconOnlyActions={true}
          title={t('Confirm Document Download', 'कागजात डाउनलोड पुष्टि')}
          description={t(
            'Do you want to download this curriculum resource?',
            'के तपाईं यो पाठ्यक्रम सामग्री डाउनलोड गर्न चाहनुहुन्छ?'
          )}
          itemName={`${t(pendingDownloadItem.title_en, pendingDownloadItem.title_np || '')} (${pendingDownloadItem.file_size_formatted || 'PDF'})`}
          confirmText={t('Download', 'डाउनलोड')}
          cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase">
              <BookMarked className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('Digital Resource Center & Curriculum Hub', 'डिजिटल स्रोत केन्द्र तथा पाठ्यक्रम निर्देशिका')}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {t(
                'Digital Resources & Curriculum Guidelines',
                'डिजिटल स्रोत सामग्री तथा पाठ्यक्रम निर्देशिका'
              )}
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
              {t(
                'Access official curriculum frameworks, prescribed learning outcomes, internal assessment rubrics, laboratory practical manuals, study notes, and sample question papers for Ishwari Secondary School students.',
                'ईश्वरी माध्यमिक विद्यालयका विद्यार्थीहरूका लागि निर्धारित राष्ट्रिय पाठ्यक्रम, सिकाइ उपलब्धि, आन्तरिक मूल्याङ्कन निर्देशिका, प्रयोगात्मक कार्यपुस्तिका र नमुना प्रश्नपत्रहरू डाउनलोड गर्नुहोस्।'
              )}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-blue-200">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{publishedGuidelines.length} {t('Published Documents', 'प्रकाशित निर्देशिका')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <Layers className="w-4 h-4 text-blue-300" />
                <span>{t('Grades 1 to 12 Covered', 'कक्षा १ देखि १२ सम्म')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <FileText className="w-4 h-4 text-amber-300" />
                <span>{t('CDC & NEB Prescribed', 'पाठ्यक्रम विकास केन्द्र तथा NEB मापदण्ड')}</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute right-10 top-10 opacity-10 pointer-events-none">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'Search title, subject, notes, or class...',
                  'शीर्षक, विषय, नोट्स वा कक्षा खोज्नुहोस्...'
                )}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
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

            {/* Subject Selector & Academic Year */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {t('Subject:', 'विषय:')}
                </span>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="all">{t('All Subjects', 'सबै विषयहरू')}</option>
                  {availableSubjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>

              {availableAcademicYears.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {t('Year:', 'सत्र:')}
                  </span>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="all">{t('All Sessions', 'सबै सत्र')}</option>
                    {availableAcademicYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Resource Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{t('Resource Type:', 'प्रकार:')}</span>
            </span>
            {RESOURCE_TYPE_FILTERS.map((rf) => (
              <button
                key={rf.id}
                type="button"
                onClick={() => setSelectedResourceType(rf.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedResourceType === rf.id
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(rf.labelEn, rf.labelNp)}
              </button>
            ))}
          </div>

          {/* Class Level Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 mr-1">
              {t('Academic Level:', 'तह:')}
            </span>
            {CLASS_FILTERS.map((cf) => (
              <button
                key={cf.id}
                type="button"
                onClick={() => setSelectedClass(cf.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedClass === cf.id
                    ? 'bg-[#1E40AF] text-white shadow-xs font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(cf.labelEn, cf.labelNp)}
              </button>
            ))}
          </div>
        </div>

        {/* Guidelines List */}
        {filteredGuidelines.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {t('No curriculum resources found', 'कुनै पाठ्यक्रम निर्देशिका फेला परेन')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t(
                'Try modifying your search or choosing another academic level or resource type.',
                'कृपया खोजी शब्द बदल्नुहोस् वा अन्य तह र विषय छनोट गर्नुहोस्।'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGuidelines.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPreviewItem(item);
                  }
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-blue-500/50 hover:shadow-md transition flex flex-col justify-between space-y-4 group cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase font-mono">
                      {item.class_level}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      {item.resource_type || 'curriculum'}
                    </span>
                  </div>

                  {/* Title & Subject */}
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                      {item.subject}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition leading-snug mt-0.5">
                      {t(item.title_en, item.title_np || '')}
                    </h3>
                  </div>

                  {/* Description */}
                  {(item.description_en || item.description_np) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t(item.description_en || '', item.description_np || '')}
                    </p>
                  )}
                </div>

                {/* Footer with File Info and Download Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{item.file_size_formatted || 'PDF'}</span>
                    {item.academic_year && <span>• {item.academic_year}</span>}
                  </div>

                  {/* Icon-Only Download Action */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <IconActionButton
                      action="download"
                      size="sm"
                      onClick={() => setPendingDownloadItem(item)}
                      tooltip={t('Download Document', 'डाउनलोड गर्नुहोस्')}
                      aria-label={t('Download Document', 'डाउनलोड गर्नुहोस्')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                    {previewItem.class_level}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {previewItem.subject}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {t(previewItem.title_en, previewItem.title_np || '')}
                </h3>
              </div>
              <IconActionButton
                action="close"
                appearance="ghost"
                size="sm"
                onClick={() => setPreviewItem(null)}
                tooltip={t('Close', 'बन्द गर्नुहोस्')}
                aria-label={t('Close', 'बन्द गर्नुहोस्')}
              />
            </div>

            {/* Overview */}
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 font-mono text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>{t('File Name:', 'फाइल नाम:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {previewItem.original_filename || `${previewItem.title_en}.pdf`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('File Size:', 'साइज:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {previewItem.file_size_formatted || 'Standard PDF'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t('Academic Session:', 'शैक्षिक सत्र:')}</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {previewItem.academic_year || '2083 B.S.'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">{t('Learning Objectives & Prescriptions:', 'सिकाइ उद्देश्य तथा पाठ्यभार:')}</h4>
                <p className="leading-relaxed">
                  {t(
                    previewItem.description_en || 'Official Curriculum Guideline issued as per CDC and NEB regulations.',
                    previewItem.description_np || 'पाठ्यक्रम विकास केन्द्र तथा राष्ट्रिय परीक्षा बोर्डको मापदण्ड अनुसार जारी गरिएको आधिकारिक निर्देशिका।'
                  )}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <IconActionButton
                action="close"
                onClick={() => setPreviewItem(null)}
                tooltip={t('Close', 'बन्द गर्नुहोस्')}
                aria-label={t('Close', 'बन्द गर्नुहोस्')}
              />

              <IconActionButton
                action="download"
                onClick={() => {
                  const toDownload = previewItem;
                  setPreviewItem(null);
                  setPendingDownloadItem(toDownload);
                }}
                tooltip={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
                aria-label={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumView;
