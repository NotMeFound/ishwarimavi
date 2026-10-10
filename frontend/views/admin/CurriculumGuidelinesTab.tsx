import React, { useState, useMemo, useRef } from 'react';
import {
  Language,
  CurriculumGuideline,
  AdminAccount
} from '../../types';
import {
  BookMarked,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  FileCheck,
  AlertCircle,
  X,
  ArrowUpDown,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { CmsStatusBadge } from './CmsStatusBadge';
import { CmsEmptyState } from './CmsEmptyState';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';
import { apiClient, getApiUrl } from '../../services/apiClient';

interface CurriculumGuidelinesTabProps {
  lang: Language;
  curriculumGuidelines: CurriculumGuideline[];
  onUpdateCurriculumGuidelines: (items: CurriculumGuideline[]) => void;
  onShowToast: (msg: string) => void;
  currentAccount?: AdminAccount | null;
}

const CLASS_LEVEL_OPTIONS = [
  { value: 'all', labelEn: 'All Classes', labelNp: 'सबै कक्षाहरू' },
  { value: 'Grade 1-5', labelEn: 'Grade 1-5 (Primary)', labelNp: 'कक्षा १-५ (आधारभूत प्राथमिक)' },
  { value: 'Grade 6-8', labelEn: 'Grade 6-8 (Lower Secondary)', labelNp: 'कक्षा ६-८ (निम्न माध्यमिक)' },
  { value: 'Grade 9-10', labelEn: 'Grade 9-10 (Secondary / SEE)', labelNp: 'कक्षा ९-१० (माध्यमिक / एसईई)' },
  { value: 'Grade 10', labelEn: 'Grade 10 (SEE)', labelNp: 'कक्षा १० (एसईई)' },
  { value: 'Grade 11-12', labelEn: 'Grade 11-12 (+2 Secondary)', labelNp: 'कक्षा ११-१२ (उच्च माध्यमिक)' }
];

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science & Technology',
  'English Language',
  'Nepali',
  'Social Studies & Life Skills',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Accountancy & Economics'
];

export const CurriculumGuidelinesTab: React.FC<CurriculumGuidelinesTabProps> = ({
  lang,
  curriculumGuidelines,
  onUpdateCurriculumGuidelines,
  onShowToast,
  currentAccount
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const actorName = currentAccount?.fullName || currentAccount?.username || 'Admin';

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<CurriculumGuideline | null>(null);

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<CurriculumGuideline | null>(null);

  // Delete Modal
  const [deleteCandidate, setDeleteCandidate] = useState<CurriculumGuideline | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title_en: '',
    title_np: '',
    subject: 'Mathematics',
    class_level: 'Grade 9-10',
    academic_year: '2083 B.S.',
    description_en: '',
    description_np: '',
    status: 'published' as 'published' | 'unpublished',
    display_order: 1,
    original_filename: '',
    file_url: '',
    file_size_bytes: 0,
    file_size_formatted: '',
    file_data: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered list
  const filteredItems = useMemo(() => {
    let result = [...curriculumGuidelines];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title_en?.toLowerCase().includes(q) ||
          item.title_np?.toLowerCase().includes(q) ||
          item.subject?.toLowerCase().includes(q) ||
          item.class_level?.toLowerCase().includes(q) ||
          item.description_en?.toLowerCase().includes(q) ||
          item.original_filename?.toLowerCase().includes(q)
      );
    }

    if (selectedClass !== 'all') {
      result = result.filter((item) => item.class_level === selectedClass);
    }

    if (selectedSubject !== 'all') {
      result = result.filter((item) => item.subject === selectedSubject);
    }

    if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus);
    }

    return result.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }, [curriculumGuidelines, searchQuery, selectedClass, selectedSubject, selectedStatus]);

  // Handle open Add Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title_en: '',
      title_np: '',
      subject: 'Mathematics',
      class_level: 'Grade 9-10',
      academic_year: '2083 B.S.',
      description_en: '',
      description_np: '',
      status: 'published',
      display_order: curriculumGuidelines.length + 1,
      original_filename: '',
      file_url: '',
      file_size_bytes: 0,
      file_size_formatted: '',
      file_data: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (item: CurriculumGuideline) => {
    setEditingItem(item);
    setFormData({
      title_en: item.title_en || '',
      title_np: item.title_np || '',
      subject: item.subject || 'Mathematics',
      class_level: item.class_level || 'Grade 9-10',
      academic_year: item.academic_year || '2083 B.S.',
      description_en: item.description_en || '',
      description_np: item.description_np || '',
      status: item.status || 'published',
      display_order: item.display_order || 1,
      original_filename: item.original_filename || '',
      file_url: item.file_url || '',
      file_size_bytes: item.file_size_bytes || 0,
      file_size_formatted: item.file_size_formatted || '',
      file_data: item.file_data || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // PDF File Selection & Server Validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setFormErrors((prev) => ({ ...prev, file: '' }));

    // Client-side format validation (PDF only)
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFormErrors((prev) => ({
        ...prev,
        file: t('Only PDF documents (.pdf) are allowed.', 'केवल PDF फाइलहरू (.pdf) मात्र स्वीकार्य छन्।')
      }));
      return;
    }

    // Client-side size validation (Max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      setFormErrors((prev) => ({
        ...prev,
        file: t(
          'File size exceeds the maximum limit of 10 MB.',
          'फाइल आकार अधिकतम १० MB सीमाभन्दा बढी छ।'
        )
      }));
      return;
    }

    setUploadProgress(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Verify with server upload endpoint
        const uploadRes = await fetch(getApiUrl('/api/cms/upload'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiClient.getToken() ? { Authorization: `Bearer ${apiClient.getToken()}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || 'application/pdf',
            category: 'curriculum_guideline',
            base64Data
          })
        });

        const uploadJson = await uploadRes.json();
        setUploadProgress(false);

        if (!uploadRes.ok || !uploadJson.success) {
          setFormErrors((prev) => ({
            ...prev,
            file: uploadJson.error || t('Failed to validate PDF file on server.', 'सर्भरमा PDF फाइल प्रमाणित गर्न सकिएन।')
          }));
          return;
        }

        const formattedSize = file.size < 1024 * 1024
          ? `${Math.round(file.size / 1024)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        setFormData((prev) => ({
          ...prev,
          original_filename: file.name,
          file_url: uploadJson.url || getApiUrl(`/api/curriculum/file/${uploadJson.uniqueFileName || file.name}`),
          file_size_bytes: file.size,
          file_size_formatted: formattedSize,
          file_data: base64Data
        }));

        onShowToast(t('PDF file uploaded and verified successfully!', 'PDF फाइल सफलतापूर्वक अपलोड र प्रमाणित भयो!'));
      };

      reader.onerror = () => {
        setUploadProgress(false);
        setFormErrors((prev) => ({
          ...prev,
          file: t('Error reading selected file.', 'फाइल पढ्नमा समस्या आयो।')
        }));
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadProgress(false);
      setFormErrors((prev) => ({
        ...prev,
        file: err?.message || 'Upload error'
      }));
    }
  };

  // Submit Form (Add or Edit)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!formData.title_en.trim()) {
      errors.title_en = t('Document Title in English is required.', 'अंग्रेजीमा शीर्षक अनिवार्य छ।');
    }
    if (!formData.subject.trim()) {
      errors.subject = t('Subject is required.', 'विषय अनिवार्य छ।');
    }
    if (!formData.class_level.trim()) {
      errors.class_level = t('Class / Academic Level is required.', 'कक्षा / तह अनिवार्य छ।');
    }
    if (!formData.file_url && !formData.original_filename) {
      errors.file = t('Please select a PDF document (max 10 MB).', 'कृपया PDF दस्तावेज छनोट गर्नुहोस् (अधिकतम १० MB)।');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      let updatedList: CurriculumGuideline[];
      const now = new Date().toISOString().split('T')[0];

      if (editingItem) {
        // Edit existing
        updatedList = curriculumGuidelines.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title_en: formData.title_en.trim(),
                title_np: formData.title_np.trim() || formData.title_en.trim(),
                subject: formData.subject.trim(),
                class_level: formData.class_level.trim(),
                academic_year: formData.academic_year.trim(),
                description_en: formData.description_en.trim(),
                description_np: formData.description_np.trim() || formData.description_en.trim(),
                status: formData.status,
                display_order: Number(formData.display_order) || 1,
                original_filename: formData.original_filename || item.original_filename,
                pdf_path: formData.file_url || item.pdf_path || `/curriculum/${formData.original_filename || item.original_filename || 'guideline.pdf'}`,
                file_url: formData.file_url || item.file_url,
                mime_type: 'application/pdf',
                file_size_bytes: formData.file_size_bytes || item.file_size_bytes,
                file_size_formatted: formData.file_size_formatted || item.file_size_formatted,
                file_data: formData.file_data || item.file_data,
                updated_at: now
              }
            : item
        );
      } else {
        // Create new
        const newGuideline: CurriculumGuideline = {
          id: `curr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title_en: formData.title_en.trim(),
          title_np: formData.title_np.trim() || formData.title_en.trim(),
          subject: formData.subject.trim(),
          class_level: formData.class_level.trim(),
          academic_year: formData.academic_year.trim(),
          description_en: formData.description_en.trim(),
          description_np: formData.description_np.trim() || formData.description_en.trim(),
          status: formData.status,
          display_order: Number(formData.display_order) || curriculumGuidelines.length + 1,
          original_filename: formData.original_filename || 'curriculum_document.pdf',
          pdf_path: formData.file_url || `/curriculum/${formData.original_filename || 'curriculum_document.pdf'}`,
          file_url: formData.file_url,
          mime_type: 'application/pdf',
          file_size_bytes: formData.file_size_bytes,
          file_size_formatted: formData.file_size_formatted || '1.2 MB',
          file_data: formData.file_data,
          created_at: now,
          updated_at: now
        };
        updatedList = [newGuideline, ...curriculumGuidelines];
      }

      // Synchronize with database
      const syncRes = await apiClient.syncModule('curriculumGuidelines', updatedList, actorName);
      setIsSubmitting(false);

      if (syncRes.success) {
        onUpdateCurriculumGuidelines(updatedList);
        setIsFormOpen(false);
        onShowToast(
          editingItem
            ? t('Curriculum guideline updated successfully.', 'पाठ्यक्रम निर्देशिका अद्यावधिक गरियो।')
            : t('New curriculum guideline added successfully.', 'नयाँ पाठ्यक्रम निर्देशिका सफलतापूर्वक थपियो।')
        );
      } else {
        setFormErrors({ form: syncRes.error || t('Database synchronization failed.', 'डेटाबेस समक्रमण असफल भयो।') });
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setFormErrors({ form: err?.message || 'An unexpected error occurred' });
    }
  };

  // Toggle Publish / Unpublish Status
  const handleToggleStatus = async (item: CurriculumGuideline) => {
    const nextStatus: 'published' | 'unpublished' = item.status === 'published' ? 'unpublished' : 'published';
    const updatedList: CurriculumGuideline[] = curriculumGuidelines.map((g) =>
      g.id === item.id ? { ...g, status: nextStatus, updated_at: new Date().toISOString().split('T')[0] } : g
    );

    const syncRes = await apiClient.syncModule('curriculumGuidelines', updatedList, actorName);
    if (syncRes.success) {
      onUpdateCurriculumGuidelines(updatedList);
      onShowToast(
        nextStatus === 'published'
          ? t(`"${item.title_en}" is now published on the public site.`, `"${item.title_en}" सार्वजनिक गरियो।`)
          : t(`"${item.title_en}" has been unpublished.`, `"${item.title_en}" अप्रकाशित गरियो।`)
      );
    } else {
      onShowToast(syncRes.error || t('Failed to update status.', 'स्थिति परिवर्तन असफल भयो।'));
    }
  };

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;

    const updatedList = curriculumGuidelines.filter((g) => g.id !== deleteCandidate.id);
    const syncRes = await apiClient.syncModule('curriculumGuidelines', updatedList, actorName);

    if (syncRes.success) {
      onUpdateCurriculumGuidelines(updatedList);
      onShowToast(t(`Deleted "${deleteCandidate.title_en}".`, `"${deleteCandidate.title_en}" हटाइयो।`));
      setDeleteCandidate(null);
    } else {
      onShowToast(syncRes.error || t('Failed to delete item.', 'हटाउन असफल भयो।'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('Curriculum Guidelines', 'पाठ्यक्रम निर्देशिका')}
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {curriculumGuidelines.length} {t('Resources', 'सामग्री')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {t(
              'Manage curriculum guidelines and useful PDF learning resources for students. Published items are instantly accessible to students on the public website.',
              'विद्यार्थीहरूका लागि पाठ्यक्रम निर्देशिका र उपयोगी PDF अध्ययन सामग्री व्यवस्थापन गर्नुहोस्। प्रकाशित सामग्री वेबसाइटमा तत्काल उपलब्ध हुन्छ।'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm hover:shadow-md transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={2.4} />
          <span>{t('+ Add Curriculum Guideline', '+ नयाँ पाठ्यक्रम निर्देशिका थप्नुहोस्')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search title, subject, file...', 'शीर्षक, विषय, फाइल खोज्नुहोस्...')}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Class / Academic Level Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
            >
              {CLASS_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isNp ? opt.labelNp : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
            >
              <option value="all">{t('All Subjects', 'सबै विषयहरू')}</option>
              {SUBJECT_OPTIONS.map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-800 cursor-pointer"
            >
              <option value="all">{t('All Statuses', 'सबै स्थिति')}</option>
              <option value="published">{t('Published', 'प्रकाशित')}</option>
              <option value="unpublished">{t('Unpublished', 'अप्रकाशित')}</option>
            </select>
          </div>
        </div>

        {/* Filter status indicator */}
        {(searchQuery || selectedClass !== 'all' || selectedSubject !== 'all' || selectedStatus !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              {t(`Showing ${filteredItems.length} of ${curriculumGuidelines.length} guidelines`, `कूल ${curriculumGuidelines.length} मध्ये ${filteredItems.length} देखाइएको छ`)}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedClass('all');
                setSelectedSubject('all');
                setSelectedStatus('all');
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium cursor-pointer"
            >
              {t('Clear all filters', 'सबै फिल्टर हटाउनुहोस्')}
            </button>
          </div>
        )}
      </div>

      {/* Guidelines Table & List */}
      {filteredItems.length === 0 ? (
        curriculumGuidelines.length === 0 ? (
          <CmsEmptyState
            icon={BookMarked}
            title={t('No curriculum guidelines yet.', 'कुनै पाठ्यक्रम निर्देशिका उपलब्ध छैन।')}
            description={t(
              'Upload your first school curriculum guideline to make it available on the public website.',
              'सार्वजनिक वेबसाइटमा उपलब्ध गराउन पहिलो विद्यालय पाठ्यक्रम निर्देशिका थप्नुहोस्।'
            )}
            actionLabel={t('Add Curriculum Guideline', 'निर्देशिका थप्नुहोस्')}
            onAction={handleOpenAdd}
          />
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('No matching curriculum guidelines found.', 'कुनै मिल्दो निर्देशिका भेटिएन।')}
            </p>
            <p>{t('Try adjusting your search query or filters.', 'खोज शब्द वा फिल्टर परिवर्तन गरी पुन: प्रयास गर्नुहोस्।')}</p>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{t('Title & Description', 'शीर्षक तथा विवरण')}</th>
                  <th className="py-3 px-4">{t('Subject', 'विषय')}</th>
                  <th className="py-3 px-4">{t('Class / Level', 'कक्षा / तह')}</th>
                  <th className="py-3 px-4">{t('PDF Resource', 'PDF स्रोत')}</th>
                  <th className="py-3 px-4">{t('Status', 'स्थिति')}</th>
                  <th className="py-3 px-4">{t('Year', 'वर्ष')}</th>
                  <th className="py-3 px-4 text-right">{t('Actions', 'कार्यहरू')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => setPreviewItem(item)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {isNp && item.title_np ? item.title_np : item.title_en}
                      </div>
                      {isNp && item.title_np && item.title_en && (
                        <div className="text-[11px] text-slate-400 line-clamp-1">
                          {item.title_en}
                        </div>
                      )}
                      {(item.description_en || item.description_np) && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {isNp && item.description_np ? item.description_np : item.description_en}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.class_level}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          PDF
                        </span>
                        <div className="max-w-[150px] truncate text-[11px] text-slate-600 dark:text-slate-400" title={item.original_filename}>
                          {item.original_filename}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({item.file_size_formatted || 'PDF'})
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <CmsStatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                      {item.academic_year || '2083 B.S.'}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Download button */}
                        <IconActionButton
                          action="download"
                          size="sm"
                          href={item.file_url ? `${item.file_url}?download=1&name=${encodeURIComponent(item.original_filename)}` : '#'}
                          download={item.original_filename}
                          tooltip={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
                          aria-label={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
                        />

                        {/* Toggle status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          title={item.status === 'published' ? t('Unpublish', 'अप्रकाशित गर्नुहोस्') : t('Publish', 'प्रकाशित गर्नुहोस्')}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                        >
                          {item.status === 'published' ? (
                            <XCircle className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>

                        {/* Edit button */}
                        <IconActionButton
                          action="edit"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          tooltip={t('Edit Guideline', 'सम्पादन गर्नुहोस्')}
                          aria-label={t('Edit Guideline', 'सम्पादन गर्नुहोस्')}
                        />

                        {/* Delete button */}
                        <IconActionButton
                          action="delete"
                          size="sm"
                          onClick={() => setDeleteCandidate(item)}
                          tooltip={t('Delete Guideline', 'हटाउनुहोस्')}
                          aria-label={t('Delete Guideline', 'हटाउनुहोस्')}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Requirement 29: Mobile Admin) */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      {isNp && item.title_np ? item.title_np : item.title_en}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {item.class_level}
                      </span>
                    </div>
                  </div>
                  <CmsStatusBadge status={item.status} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200">
                    PDF
                  </span>
                  <span className="truncate flex-1 font-mono text-[11px]">
                    {item.original_filename}
                  </span>
                  <span className="text-[10px] font-mono">
                    {item.file_size_formatted}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {item.academic_year || '2083 B.S.'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewItem(item)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      {t('Preview', 'हेर्नुहोस्')}
                    </button>
                    <a
                      href={item.file_url ? `${item.file_url}?download=1&name=${encodeURIComponent(item.original_filename)}` : '#'}
                      download={item.original_filename}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      {t('Download', 'डाउनलोड')}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                    >
                      {item.status === 'published' ? t('Unpublish', 'अप्रकाशित') : t('Publish', 'प्रकाशित')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(item)}
                      className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingItem
                    ? t('Edit Curriculum Guideline', 'पाठ्यक्रम निर्देशिका सम्पादन')
                    : t('Add Curriculum Guideline', 'नयाँ पाठ्यक्रम निर्देशिका थप्नुहोस्')}
                </h3>
              </div>
              <IconActionButton
                action="close"
                appearance="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />
            </div>

            {formErrors.form && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formErrors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Guideline Title (English) *', 'दस्तावेज शीर्षक (अंग्रेजी) *')}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g. Grade 10 Compulsory Mathematics"
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                      formErrors.title_en
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                    }`}
                  />
                  {formErrors.title_en && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.title_en}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Guideline Title (Nepali)', 'दस्तावेज शीर्षक (नेपाली)')}
                  </label>
                  <input
                    type="text"
                    value={formData.title_np}
                    onChange={(e) => setFormData({ ...formData, title_np: e.target.value })}
                    placeholder="उदा. कक्षा १० अनिवार्य गणित पाठ्यक्रम"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Subject, Class Level, Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Subject *', 'विषय *')}
                  </label>
                  <input
                    type="text"
                    list="subjects-list"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Mathematics"
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 ${
                      formErrors.subject
                        ? 'border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
                    }`}
                  />
                  <datalist id="subjects-list">
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                  {formErrors.subject && (
                    <p className="text-[11px] text-rose-600 mt-1">{formErrors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Class / Level *', 'कक्षा / तह *')}
                  </label>
                  <select
                    value={formData.class_level}
                    onChange={(e) => setFormData({ ...formData, class_level: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="Grade 1-5">Grade 1-5 (Primary)</option>
                    <option value="Grade 6-8">Grade 6-8 (Lower Secondary)</option>
                    <option value="Grade 9-10">Grade 9-10 (Secondary / SEE)</option>
                    <option value="Grade 10">Grade 10 (SEE)</option>
                    <option value="Grade 11-12">Grade 11-12 (+2 Secondary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Academic Year', 'शैक्षिक वर्ष')}
                  </label>
                  <input
                    type="text"
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    placeholder="e.g. 2083 B.S."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Description (English)', 'विवरण (अंग्रेजी)')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="Brief description of prescribed learning outcomes, assessment rubrics..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Description (Nepali)', 'विवरण (नेपाली)')}
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description_np}
                    onChange={(e) => setFormData({ ...formData, description_np: e.target.value })}
                    placeholder="पाठ्यक्रमका मुख्य सिकाइ उपलब्धि तथा प्रयोगात्मक कार्यसम्बन्धी संक्षिप्त जानकारी..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* PDF Document Upload Section (Validated Client + Server: PDF only, max 10 MB) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('PDF File Attachment *', 'PDF फाइल संलग्नक *')}
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {t('PDF only • Max 10 MB', 'PDF मात्र • अधिकतम १० MB')}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.original_filename ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200">
                        PDF
                      </span>
                      <div className="truncate text-xs font-medium text-slate-800 dark:text-slate-200">
                        {formData.original_filename}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">
                        ({formData.file_size_formatted || 'PDF'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                      >
                        {t('Replace', 'परिवर्तन')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress}
                    className="w-full py-6 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-white/50 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition"
                  >
                    <Upload className="w-5 h-5 text-slate-400" />
                    <div>
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        {uploadProgress ? t('Verifying and uploading PDF...', 'प्रमाणित गर्दै...') : t('Click to choose PDF guideline', 'PDF फाइल छनोट गर्न यहाँ थिच्नुहोस्')}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t('File size up to 10 MB. Server verifies magic bytes %PDF-', '१० MB सम्मको PDF फाइल।')}
                      </p>
                    </div>
                  </button>
                )}

                {formErrors.file && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.file}</p>
                )}
              </div>

              {/* Status and Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Publication Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="published">{t('Published (Visible on website)', 'प्रकाशित (वेबसाइटमा देखिने)')}</option>
                    <option value="unpublished">{t('Unpublished (Admin only)', 'अप्रकाशित (प्रशासक मात्र)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Display Sort Order', 'क्रम मिलाउनुहोस्')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  {t('Cancel', 'रद्द गर्नुहोस्')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadProgress}
                  className="px-5 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t('Saving...', 'बचत गर्दै...') : editingItem ? t('Update Guideline', 'अद्यावधिक गर्नुहोस्') : t('Save & Publish Guideline', 'बचत तथा प्रकाशन गर्नुहोस्')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200">
                  PDF
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {previewItem.title_en}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{previewItem.subject}</span>
                    <span>•</span>
                    <span>{previewItem.class_level}</span>
                    <span>•</span>
                    <span>{previewItem.file_size_formatted}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <IconActionButton
                  action="download"
                  size="sm"
                  href={previewItem.file_url ? `${previewItem.file_url}?download=1&name=${encodeURIComponent(previewItem.original_filename)}` : '#'}
                  download={previewItem.original_filename}
                  tooltip={t('Download PDF', 'डाउनलोड')}
                  aria-label={t('Download PDF', 'डाउनलोड')}
                />

                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                  tooltip={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                />
              </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 overflow-y-auto flex items-center justify-center min-h-[450px]">
              {previewItem.file_url && previewItem.file_url.trim() ? (
                <iframe
                  src={previewItem.file_url}
                  title={previewItem.title_en}
                  className="w-full h-[550px] rounded-lg border border-slate-200 dark:border-slate-800 bg-white"
                />
              ) : (
                <div className="text-center p-8">
                  <BookMarked className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('PDF viewer not available for this preview.', 'यस फाइलको लागि प्रिभ्यु उपलब्ध छैन।')}
                  </p>
                  <a
                    href={previewItem.file_url}
                    download={previewItem.original_filename}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t('Download to read on your device', 'आफ्नो डिभाइसमा पढ्न डाउनलोड गर्नुहोस्')}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={Boolean(deleteCandidate)}
        title={t('Delete Curriculum Guideline', 'पाठ्यक्रम निर्देशिका हटाउने?')}
        description={t(
          `Are you sure you want to permanently delete "${deleteCandidate?.title_en}"? This file will be immediately removed from the public website.`,
          `के तपाईं "${deleteCandidate?.title_en}" लाई स्थायी रूपमा मेटाउन चाहनुहुन्छ? यो फाइल तत्काल सार्वजनिक वेबसाइटबाट हट्नेछ।`
        )}
        itemName={deleteCandidate?.title_en}
        confirmText={t('Yes, Delete Guideline', 'हो, मेटाउनुहोस्')}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        variant="delete"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
