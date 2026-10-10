import React, { useState, useMemo, useRef } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  GraduationCap,
  Save,
  X,
  Link,
  Copy,
  ChevronUp,
  ChevronDown,
  Info,
  Download,
  Upload,
  FileDown,
  Loader2,
  Check,
  FileCheck
} from 'lucide-react';
import { Language, Vacancy, EmploymentType, VacancyStatus, PermissionKey } from '../../types';
import { apiClient, getApiUrl } from '../../services/apiClient';
import { IconActionButton } from '../../components/IconActionButton';
import { isRecentlyUpdated } from '../../utils/dateUtils';

interface AdminCareerTabProps {
  lang: Language;
  vacancies: Vacancy[];
  onSave: (updated: Vacancy[]) => Promise<boolean | void> | boolean | void;
  can?: (perm: PermissionKey) => boolean;
}

export const AdminCareerTab: React.FC<AdminCareerTabProps> = ({
  lang,
  vacancies = [],
  onSave,
  can = () => true
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Permission capabilities
  const canCreate = can('career.create');
  const canUpdate = can('career.update');
  const canDelete = can('career.delete');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VacancyStatus | 'featured'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'order' | 'deadline' | 'newest'>('order');

  // Modals & Editing state
  const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);
  const [isEditingNew, setIsEditingNew] = useState(false);
  const [previewVacancy, setPreviewVacancy] = useState<Vacancy | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [urlValidationError, setUrlValidationError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Form field temporary string states for arrays (responsibilities, qualifications, skills)
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [qualificationsText, setQualificationsText] = useState('');
  const [skillsText, setSkillsText] = useState('');

  // PDF upload & preview states
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [previewPdfModal, setPreviewPdfModal] = useState<{ url: string; title: string } | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // Google Form URL validator
  const validateGoogleFormUrl = (url: string): { isValid: boolean; error?: string } => {
    if (!url || !url.trim()) return { isValid: true };
    const trimmed = url.trim();

    if (/^(javascript:|data:|vbscript:|file:|blob:)/i.test(trimmed)) {
      return { isValid: false, error: t('Unsafe URL protocol detected.', 'असुरक्षित URL प्रोटोकल फेला पर्यो।') };
    }

    if (!/^https?:\/\//i.test(trimmed)) {
      return { isValid: false, error: t('URL must start with https://', 'URL https:// बाट सुरु हुनुपर्छ।') };
    }

    const isGoogleForm = /^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/[a-zA-Z0-9_\-\/]+)/i.test(trimmed);
    if (!isGoogleForm) {
      return {
        isValid: false,
        error: t(
          'Please provide a valid Google Form URL (e.g., https://forms.gle/... or https://docs.google.com/forms/...)',
          'कृपया मान्य गुगल फारमको लिङ्क राख्नुहोस् (उदा: https://forms.gle/... वा https://docs.google.com/forms/...)'
        )
      };
    }

    return { isValid: true };
  };

  const handleOpenAdd = () => {
    if (!canCreate) return;
    const newVac: Partial<Vacancy> = {
      id: 'vac-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      title_en: '',
      title_np: '',
      department: 'Academics',
      employment_type: 'Full Time',
      positions_count: 1,
      academic_level: 'Secondary Level',
      location: 'Main Academic Campus, Bhotewodar, Lamjung',
      short_description_en: '',
      short_description_np: '',
      description_en: '',
      description_np: '',
      responsibilities: [],
      qualifications: [],
      skills: [],
      application_method: 'google_form',
      application_url: '',
      apply_now_enabled: false, // Default is OFF
      pdf_url: '',
      pdf_filename: '',
      pdf_size_bytes: 0,
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      application_instructions: 'Please complete all sections of the Google Form and upload verified copies of your citizenship, transcripts, teaching license, and updated curriculum vitae.',
      status: 'draft',
      publish_date: new Date().toISOString().split('T')[0],
      display_order: vacancies.length + 1,
      featured: false
    };

    setEditingVacancy(newVac);
    setIsEditingNew(true);
    setResponsibilitiesText('');
    setQualificationsText('');
    setSkillsText('');
    setUrlValidationError('');
    setPdfError('');
  };

  const handleOpenEdit = (vac: Vacancy) => {
    if (!canUpdate) return;
    setEditingVacancy({
      ...vac,
      apply_now_enabled: Boolean(vac.apply_now_enabled),
      pdf_url: vac.pdf_url || '',
      pdf_filename: vac.pdf_filename || '',
      pdf_size_bytes: vac.pdf_size_bytes || 0
    });
    setIsEditingNew(false);
    setResponsibilitiesText((vac.responsibilities || []).join('\n'));
    setQualificationsText((vac.qualifications || []).join('\n'));
    setSkillsText((vac.skills || []).join(', '));
    setUrlValidationError('');
    setPdfError('');
  };

  // PDF upload handler with client-side magic-bytes and extension checks
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Verify extension
    const nameLower = file.name.toLowerCase();
    if (!nameLower.endsWith('.pdf')) {
      setPdfError(t('Vacancy notice must be in PDF format only (.pdf)', 'विज्ञापन सूचना PDF ढाँचामा मात्र हुनुपर्छ (.pdf)'));
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    // 2. Verify size (max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPdfError(t('File size exceeds the 10 MB limit.', 'फाइलको आकार १० MB सीमा भन्दा ठूलो छ।'));
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    // 3. Verify magic bytes (%PDF-)
    setIsUploadingPdf(true);
    setPdfError('');

    const reader = new FileReader();
    reader.onerror = () => {
      setPdfError(t('Failed to read file.', 'फाइल पढ्न सकिएन।'));
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    };

    reader.onload = async (evt) => {
      try {
        const dataUrl = evt.target?.result as string;
        const commaIdx = dataUrl.indexOf(',');
        const rawBase64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        
        // Check magic bytes from decoded start
        const binaryHeader = atob(rawBase64.slice(0, 32));
        if (!binaryHeader.startsWith('%PDF-')) {
          setPdfError(
            t(
              'Security verification failed: File is not a valid PDF document (%PDF- signature missing).',
              'सुरक्षा प्रमाणीकरण असफल: फाइल मान्य PDF होइन (%PDF- हस्ताक्षर छैन)।'
            )
          );
          setIsUploadingPdf(false);
          if (pdfInputRef.current) pdfInputRef.current.value = '';
          return;
        }

        // Upload to server endpoint
        const token = apiClient.getToken();
        const res = await fetch(getApiUrl('/api/cms/upload'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify({
            fileName: file.name,
            fileType: 'application/pdf',
            category: 'vacancy_pdf',
            base64Data: dataUrl
          })
        });

        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || t('Server rejected the PDF upload.', 'सर्भरले PDF अपलोड अस्वीकार गर्यो।'));
        }

        setEditingVacancy((prev) =>
          prev
            ? {
                ...prev,
                pdf_url: result.url ? getApiUrl(result.url) : result.url,
                pdf_filename: result.fileName || file.name,
                pdf_size_bytes: result.size || file.size
              }
            : null
        );
        setPdfError('');
      } catch (err: any) {
        setPdfError(err?.message || t('PDF upload failed.', 'PDF अपलोड असफल भयो।'));
      } finally {
        setIsUploadingPdf(false);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
      }
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePdf = async () => {
    if (!editingVacancy?.pdf_url) return;
    const oldUrl = editingVacancy.pdf_url;
    
    // If it's a server file, notify server
    if (oldUrl.includes('/api/vacancy/file/')) {
      const filename = oldUrl.split('/').pop();
      if (filename) {
        const token = apiClient.getToken();
        fetch(getApiUrl(`/api/vacancy/file/${filename}`), {
          method: 'DELETE',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include'
        }).catch(() => {});
      }
    }

    setEditingVacancy({
      ...editingVacancy,
      pdf_url: '',
      pdf_filename: '',
      pdf_size_bytes: 0
    });
    setPdfError('');
  };

  const handleDownloadPdf = (url: string, filename?: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'Ishwari-Vacancy-Notice.pdf';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes <= 0) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSaveVacancy = async () => {
    if (!editingVacancy) return;
    if (!editingVacancy.title_en || !editingVacancy.title_en.trim()) {
      alert(t('Please enter a vacancy job title in English.', 'कृपया अंग्रेजीमा पदको नाम लेख्नुहोस्।'));
      return;
    }

    // Validate Apply Now: If enabled, application URL is strictly mandatory
    if (editingVacancy.apply_now_enabled) {
      if (!editingVacancy.application_url || !editingVacancy.application_url.trim()) {
        setUrlValidationError(
          t(
            'Apply Now cannot be enabled without a valid application destination URL.',
            'आवेदन लिङ्क बिना Apply Now सक्षम गर्न सकिँदैन।'
          )
        );
        return;
      }
    }

    // Validate URL format if provided
    if (editingVacancy.application_url && editingVacancy.application_url.trim()) {
      const check = validateGoogleFormUrl(editingVacancy.application_url);
      if (!check.isValid) {
        setUrlValidationError(check.error || 'Invalid URL');
        return;
      }
    }

    const respArray = responsibilitiesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const qualArray = qualificationsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const completeVacancy: Vacancy = {
      id: editingVacancy.id || 'vac-' + Date.now(),
      title_en: editingVacancy.title_en.trim(),
      title_np: editingVacancy.title_np?.trim() || '',
      department: editingVacancy.department?.trim() || 'General',
      employment_type: (editingVacancy.employment_type as EmploymentType) || 'Full Time',
      positions_count: Math.max(1, Number(editingVacancy.positions_count) || 1),
      academic_level: editingVacancy.academic_level?.trim() || '',
      location: editingVacancy.location?.trim() || '',
      short_description_en: editingVacancy.short_description_en?.trim() || '',
      short_description_np: editingVacancy.short_description_np?.trim() || '',
      description_en: editingVacancy.description_en?.trim() || '',
      description_np: editingVacancy.description_np?.trim() || '',
      responsibilities: respArray,
      qualifications: qualArray,
      skills: skillsArray,
      application_method: 'google_form',
      application_url: editingVacancy.application_url?.trim() || '',
      apply_now_enabled: Boolean(editingVacancy.apply_now_enabled),
      pdf_url: editingVacancy.pdf_url?.trim() || '',
      pdf_filename: editingVacancy.pdf_filename?.trim() || '',
      pdf_size_bytes: editingVacancy.pdf_size_bytes || 0,
      application_deadline: editingVacancy.application_deadline || new Date().toISOString().split('T')[0],
      application_instructions: editingVacancy.application_instructions?.trim() || '',
      status: editingVacancy.status || 'draft',
      publish_date: editingVacancy.publish_date || new Date().toISOString().split('T')[0],
      display_order: Number(editingVacancy.display_order) || 1,
      featured: Boolean(editingVacancy.featured),
      created_at: editingVacancy.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let updatedList: Vacancy[] = [];
    if (isEditingNew) {
      updatedList = [completeVacancy, ...vacancies];
    } else {
      updatedList = vacancies.map((v) => (v.id === completeVacancy.id ? completeVacancy : v));
    }

    setIsSaving(true);
    try {
      await onSave(updatedList);
      setEditingVacancy(null);
      setIsEditingNew(false);
      setSaveSuccessMsg(t('Vacancy saved successfully!', 'विज्ञापन सफलतापूर्वक सुरक्षित गरियो!'));
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(t('Error saving vacancy: ' + (err?.message || 'Unknown error'), 'विज्ञापन बचत गर्न सकिएन'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (vac: Vacancy, newStatus: VacancyStatus) => {
    if (!canUpdate) return;
    const updated = vacancies.map((v) =>
      v.id === vac.id ? { ...v, status: newStatus, updated_at: new Date().toISOString() } : v
    );
    setIsSaving(true);
    try {
      await onSave(updated);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVacancy = async (id: string) => {
    if (!canDelete) return;
    const updated = vacancies.filter((v) => v.id !== id);
    setIsSaving(true);
    try {
      await onSave(updated);
      setDeleteConfirmId(null);
      setSaveSuccessMsg(t('Vacancy deleted successfully.', 'विज्ञापन मेटाइयो।'));
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (!canUpdate) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredList.length) return;

    const copy = [...filteredList];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Reassign order
    const updatedFull = vacancies.map((v) => {
      const matchIdx = copy.findIndex((c) => c.id === v.id);
      if (matchIdx !== -1) {
        return { ...v, display_order: matchIdx + 1 };
      }
      return v;
    });

    await onSave(updatedFull);
  };

  const handleTestApplicationLink = (url?: string) => {
    if (!url || !url.trim()) {
      alert(t('Please enter an application form URL first.', 'कृपया पहिले फारमको लिङ्क राख्नुहोस्।'));
      return;
    }
    const check = validateGoogleFormUrl(url);
    if (!check.isValid) {
      alert(check.error);
      return;
    }
    window.open(url.trim(), '_blank', 'noopener,noreferrer');
  };

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    return vacancies
      .filter((v) => {
        if (statusFilter === 'featured' && !v.featured) return false;
        if (statusFilter !== 'all' && statusFilter !== 'featured' && v.status !== statusFilter) return false;
        if (typeFilter !== 'all' && v.employment_type !== typeFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (v.title_en || '').toLowerCase().includes(q) || (v.title_np || '').toLowerCase().includes(q);
          const matchDep = (v.department || '').toLowerCase().includes(q);
          const matchPos = (v.academic_level || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDep && !matchPos) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'order') return (a.display_order || 1) - (b.display_order || 1);
        if (sortBy === 'deadline') return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
        return new Date(b.created_at || b.publish_date).getTime() - new Date(a.created_at || a.publish_date).getTime();
      });
  }, [vacancies, statusFilter, typeFilter, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const published = vacancies.filter((v) => v.status === 'published').length;
    const draft = vacancies.filter((v) => v.status === 'draft').length;
    const closed = vacancies.filter((v) => v.status === 'closed').length;
    const totalPositions = vacancies.reduce((acc, v) => acc + (v.positions_count || 1), 0);
    return { published, draft, closed, totalPositions };
  }, [vacancies]);

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & METRIC SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('Career & Vacancy Management', 'रोजगारी तथा विज्ञापन व्यवस्थापन')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'Publish teaching and staff opportunities, configure Google Forms applications, and manage recruitment deadlines.',
              'शिक्षक तथा कर्मचारी पदपूर्ति विज्ञापन, गुगल फारम अनलाइन दरखास्त र आवेदन म्याद व्यवस्थापन गर्नुहोस्।'
            )}
          </p>
        </div>

        {/* Action Button: Add Vacancy (Rendered only if authorized) */}
        {canCreate && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg transition shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Post New Vacancy', 'नयाँ पदपूर्ति सिर्जना')}</span>
          </button>
        )}
      </div>

      {/* Success alert message */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('Published / Active', 'सक्रिय विज्ञापन')}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.published}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('Draft Vacancies', 'ड्राफ्ट विज्ञापन')}</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.draft}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('Closed Vacancies', 'समाप्त विज्ञापन')}</div>
          <div className="text-2xl font-bold text-slate-600 dark:text-slate-400 mt-1">{stats.closed}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('Total Positions', 'कुल रिक्त पद')}</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.totalPositions}</div>
        </div>
      </div>

      {/* 3. SEARCH, FILTER & SORT BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search by job title, department, or position...', 'पद वा विभाग खोज्नुहोस्...')}
            className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">{t('All Statuses', 'सबै स्थिति')}</option>
            <option value="published">{t('Published Only', 'प्रकाशित मात्र')}</option>
            <option value="draft">{t('Drafts Only', 'ड्राफ्ट मात्र')}</option>
            <option value="closed">{t('Closed Only', 'बन्द मात्र')}</option>
            <option value="featured">{t('Featured Only', 'प्रमुख मात्र')}</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">{t('All Types', 'सबै प्रकार')}</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Temporary">Temporary</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="order">{t('Sort: Display Order', 'क्रम अनुसार')}</option>
            <option value="deadline">{t('Sort: Deadline', 'म्याद अनुसार')}</option>
            <option value="newest">{t('Sort: Newest First', 'नयाँ पहिला')}</option>
          </select>
        </div>
      </div>

      {/* 4. VACANCY TABLE / LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-10 text-center text-slate-500 dark:text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-sm">{t('No vacancies found', 'कुनै विज्ञापन फेला परेन')}</p>
            <p className="text-xs text-slate-400 mt-1">
              {canCreate
                ? t('Click "Post New Vacancy" above to create one.', 'माथिको "नयाँ पदपूर्ति सिर्जना" बटन थिच्नुहोस्।')
                : t('No vacancies are currently available in this view.', 'हाल यस सूचीमा विज्ञापन उपलब्ध छैन।')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">{t('Job Title & Dept', 'पद तथा विभाग')}</th>
                  <th className="py-3 px-4">{t('Type & Positions', 'प्रकार तथा सङ्ख्या')}</th>
                  <th className="py-3 px-4">{t('Apply Now', 'आवेदन प्रणाली')}</th>
                  <th className="py-3 px-4">{t('Notice PDF', 'कागजात PDF')}</th>
                  <th className="py-3 px-4">{t('Deadline', 'म्याद')}</th>
                  <th className="py-3 px-4">{t('Status', 'स्थिति')}</th>
                  <th className="py-3 px-4 text-right">{t('Actions', 'कार्य')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredList.map((vac, idx) => {
                  const isClosed = vac.status === 'closed' || new Date(vac.application_deadline).getTime() < Date.now();
                  const hasUrl = Boolean(vac.application_url && vac.application_url.trim());
                  const hasPdf = Boolean(vac.pdf_url && vac.pdf_url.trim());

                  return (
                    <tr
                      key={vac.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        vac.featured ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Order buttons */}
                      <td className="py-3 px-3 text-center">
                        {canUpdate ? (
                          <div className="flex flex-col items-center justify-center">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveOrder(idx, 'up')}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-mono text-slate-400">{vac.display_order || idx + 1}</span>
                            <button
                              type="button"
                              disabled={idx === filteredList.length - 1}
                              onClick={() => handleMoveOrder(idx, 'down')}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">{idx + 1}</span>
                        )}
                      </td>

                      {/* Title & Dept */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setPreviewVacancy(vac)}
                          className="text-left font-bold text-slate-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group flex items-center flex-wrap"
                        >
                          <span>{vac.title_en}</span>
                          {vac.featured && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold">
                              ★ {t('Featured', 'प्रमुख')}
                            </span>
                          )}
                          {isRecentlyUpdated(vac.updated_at || vac.publish_date) && (
                            <span className="ml-2 px-1.5 py-0.2 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                              NEW
                            </span>
                          )}
                        </button>
                        {vac.title_np && <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{vac.title_np}</div>}
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                            {vac.department}
                          </span>
                          {vac.academic_level && <span>• {vac.academic_level}</span>}
                        </div>
                      </td>

                      {/* Type & Positions */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{vac.employment_type}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {vac.positions_count} {t(vac.positions_count === 1 ? 'position' : 'positions', 'पद')}
                        </div>
                      </td>

                      {/* Apply Now Status & Form Link */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          {vac.apply_now_enabled ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Apply: ON</span>
                              </span>
                              {hasUrl && (
                                <IconActionButton
                                  action="custom"
                                  icon={ExternalLink}
                                  size="sm"
                                  onClick={() => handleTestApplicationLink(vac.application_url)}
                                  tooltip={t('Test application link', 'फारम लिङ्क परीक्षण गर्नुहोस्')}
                                  aria-label={t('Test application link', 'फारम लिङ्क परीक्षण गर्नुहोस्')}
                                />
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              <span>Apply: OFF</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Notice PDF Attachment */}
                      <td className="py-3 px-4">
                        {hasPdf ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewPdfModal({ url: vac.pdf_url!, title: vac.title_en })}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                              title={t('View PDF document', 'PDF कागजात हेर्नुहोस्')}
                            >
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>PDF</span>
                              {vac.pdf_size_bytes ? (
                                <span className="text-[10px] text-blue-500 font-normal">
                                  ({formatFileSize(vac.pdf_size_bytes)})
                                </span>
                              ) : null}
                            </button>
                            <IconActionButton
                              action="download"
                              size="sm"
                              onClick={() => handleDownloadPdf(vac.pdf_url!, vac.pdf_filename)}
                              tooltip={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
                              aria-label={t('Download PDF', 'PDF डाउनलोड गर्नुहोस्')}
                            />
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{vac.application_deadline}</div>
                        {isClosed ? (
                          <span className="text-[10px] text-red-500 font-semibold">{t('Deadline Passed', 'म्याद सकियो')}</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{t('Active', 'स्वीकार्य')}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {vac.status === 'published' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t('Published', 'प्रकाशित')}</span>
                          </span>
                        ) : vac.status === 'closed' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span>{t('Closed', 'बन्द')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span>{t('Draft', 'ड्राफ्ट')}</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Status toggle actions (Rendered only if authorized) */}
                          {canUpdate && (
                            <>
                              {vac.status === 'draft' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(vac, 'published')}
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-md transition cursor-pointer"
                                  title={t('Publish immediately', 'प्रकाशन गर्नुहोस्')}
                                >
                                  {t('Publish', 'प्रकाशित')}
                                </button>
                              ) : vac.status === 'published' ? (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(vac, 'closed')}
                                  className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-md transition cursor-pointer"
                                  title={t('Mark application as closed', 'बन्द गर्नुहोस्')}
                                >
                                  {t('Close', 'बन्द')}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(vac, 'published')}
                                  className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 rounded-md transition cursor-pointer"
                                  title={t('Reopen vacancy', 'पुन: खुला गर्नुहोस्')}
                                >
                                  {t('Reopen', 'पुन: खुला')}
                                </button>
                              )}

                              {/* Edit */}
                              <IconActionButton
                                action="edit"
                                size="sm"
                                onClick={() => handleOpenEdit(vac)}
                                tooltip={t('Edit vacancy', 'सम्पादन गर्नुहोस्')}
                                aria-label={t('Edit vacancy', 'सम्पादन गर्नुहोस्')}
                              />
                            </>
                          )}

                          {/* Delete (Rendered only if authorized) */}
                          {canDelete && (
                            <IconActionButton
                              action="delete"
                              size="sm"
                              onClick={() => setDeleteConfirmId(vac.id)}
                              tooltip={t('Delete vacancy', 'मेटाउनुहोस्')}
                              aria-label={t('Delete vacancy', 'मेटाउनुहोस्')}
                            />
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

      {/* 5. CREATE / EDIT VACANCY MODAL */}
      {editingVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            onClick={() => !isSaving && setEditingVacancy(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden my-8 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isEditingNew
                    ? t('Create New Vacancy / Recruitment', 'नयाँ पदपूर्ति सिर्जना')
                    : t('Edit Vacancy Details', 'पदपूर्ति सम्पादन')}
                </h3>
              </div>
              <IconActionButton
                action="close"
                appearance="ghost"
                size="sm"
                disabled={isSaving}
                onClick={() => setEditingVacancy(null)}
                tooltip={t('Close', 'बन्द')}
                aria-label={t('Close', 'बन्द')}
              />
            </div>

            {/* Modal Body - Scrollable */}
            <div className="px-6 py-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title (English) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Job Title (English) *', 'पदको नाम (अंग्रेजी) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVacancy.title_en || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, title_en: e.target.value })}
                    placeholder="e.g. Secondary Level Computer Teacher"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Title (Nepali) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Job Title (Nepali)', 'पदको नाम (नेपाली)')}
                  </label>
                  <input
                    type="text"
                    value={editingVacancy.title_np || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, title_np: e.target.value })}
                    placeholder="उदा: माध्यमिक तह कम्प्युटर शिक्षक"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Department / Faculty', 'विभाग / संकाय')}
                  </label>
                  <input
                    type="text"
                    value={editingVacancy.department || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, department: e.target.value })}
                    placeholder="e.g. Science & Computer / Languages / Administration"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Employment Type */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Employment Type', 'रोजगारी प्रकार')}
                  </label>
                  <select
                    value={editingVacancy.employment_type || 'Full Time'}
                    onChange={(e) =>
                      setEditingVacancy({
                        ...editingVacancy,
                        employment_type: e.target.value as EmploymentType
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full Time">Full Time (पूर्णकालीन)</option>
                    <option value="Part Time">Part Time (अंशकालीन)</option>
                    <option value="Contract">Contract (करार सेवा)</option>
                    <option value="Temporary">Temporary (अस्थायी)</option>
                    <option value="Other">Other (अन्य)</option>
                  </select>
                </div>

                {/* Positions Count */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Number of Vacancies', 'संख्या')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingVacancy.positions_count || 1}
                    onChange={(e) =>
                      setEditingVacancy({
                        ...editingVacancy,
                        positions_count: Math.max(1, parseInt(e.target.value, 10) || 1)
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Academic Level */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Academic Level / Category', 'तह / श्रेणी')}
                  </label>
                  <input
                    type="text"
                    value={editingVacancy.academic_level || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, academic_level: e.target.value })}
                    placeholder="e.g. Secondary Level (Grade 9-12)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 1. APPLY NOW TOGGLE (ON / OFF) & APPLICATION URL */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      <span>{t('Apply Now System', 'अनलाइन आवेदन प्रणाली')}</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        'Control whether public applicants can click an active "Apply Now" button.',
                        'सर्वसाधारण उम्मेदवारहरूका लागि "Apply Now" बटन सक्रिय वा निष्क्रिय गर्नुहोस्।'
                      )}
                    </p>
                  </div>

                  {/* Prominent ON / OFF Switcher (Default: OFF) */}
                  <div className="inline-flex items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVacancy({ ...editingVacancy, apply_now_enabled: false });
                        setUrlValidationError('');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        !editingVacancy.apply_now_enabled
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t('Apply: OFF (Default)', 'Apply: बन्द (पूर्वनिर्धारित)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingVacancy({ ...editingVacancy, apply_now_enabled: true })}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        editingVacancy.apply_now_enabled
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t('Apply: ON', 'Apply: चालू')}
                    </button>
                  </div>
                </div>

                {/* Status Notice */}
                {editingVacancy.apply_now_enabled ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('Apply Now is ON', 'अनलाइन आवेदन चालू छ')}</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {t(
                        'Public visitors will see an active "Apply Now" button on the Notice & Career page that securely redirects them to the Google Form URL specified below.',
                        'सूचना तथा करियर पृष्ठमा उम्मेदवारहरूका लागि "Apply Now" बटन देखिनेछ र यसले तल उल्लेखित फारममा लैजानेछ।'
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>{t('Apply Now is OFF', 'अनलाइन आवेदन बन्द छ')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t(
                        'This vacancy will be presented as an institutional notice. The "Apply Now" button will NOT be shown to public visitors.',
                        'यो विज्ञापन संस्थागत सूचनाको रूपमा मात्र रहनेछ। सार्वजनिक प्रयोगकर्ताहरूलाई "Apply Now" बटन देखाइने छैन।'
                      )}
                    </p>
                  </div>
                )}

                {/* Application URL Input Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                      <span>{t('Application Destination URL (Google Form)', 'दरखास्त फारम लिङ्क (गुगल फारम)')}</span>
                      {editingVacancy.apply_now_enabled && (
                        <span className="text-red-500 font-bold">* {t('(Required)', '(अनिवार्य)')}</span>
                      )}
                    </label>
                    {editingVacancy.application_url && (
                      <button
                        type="button"
                        onClick={() => handleTestApplicationLink(editingVacancy.application_url)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300 hover:underline cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{t('Test Link in Browser', 'लिङ्क परीक्षण')}</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editingVacancy.application_url || ''}
                    onChange={(e) => {
                      setEditingVacancy({ ...editingVacancy, application_url: e.target.value });
                      setUrlValidationError('');
                    }}
                    placeholder="https://forms.gle/... or https://docs.google.com/forms/d/e/..."
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-slate-900 dark:text-slate-100 text-xs font-mono focus:ring-2 ${
                      urlValidationError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                  {urlValidationError ? (
                    <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{urlValidationError}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* 2. OFFICIAL VACANCY NOTICE PDF ATTACHMENT */}
              <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>{t('Official Vacancy Notice (PDF Attachment)', 'आधिकारिक पदपूर्ति सूचना (PDF कागजात)')}</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t(
                        'Upload the official signed and stamped PDF vacancy document (%PDF- signature verified, max 10 MB).',
                        'आधिकारिक हस्ताक्षर र छाप भएको पदपूर्ति PDF कागजात अपलोड गर्नुहोस् (%PDF- प्रमाणित, बढीमा १० MB)।'
                      )}
                    </p>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={pdfInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handlePdfFileSelect}
                  className="hidden"
                />

                {editingVacancy.pdf_url ? (
                  /* Attached PDF Card */
                  <div className="p-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div
                      onClick={() =>
                        setPreviewPdfModal({
                          url: editingVacancy.pdf_url!,
                          title: editingVacancy.title_en || 'Vacancy Notice'
                        })
                      }
                      className="flex items-center gap-3 min-w-0 cursor-pointer group"
                      title={t('Click to preview document', 'पूर्वावलोकन गर्न थिच्नुहोस्')}
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition">
                        <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-xs sm:max-w-md group-hover:text-blue-600 transition">
                          {editingVacancy.pdf_filename || 'Ishwari-Vacancy-Notice.pdf'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {editingVacancy.pdf_size_bytes ? (
                            <span>{formatFileSize(editingVacancy.pdf_size_bytes)}</span>
                          ) : null}
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <Check className="w-3 h-3" />
                            <span>%PDF- Verified</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(editingVacancy.pdf_url!, editingVacancy.pdf_filename)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 dark:bg-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{t('Download', 'डाउनलोड')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition cursor-pointer"
                      >
                        {t('Replace', 'फेर्नुहोस्')}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePdf}
                        className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                        title={t('Remove PDF', 'हटाउनुहोस्')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Empty PDF Upload Area */
                  <div
                    onClick={() => !isUploadingPdf && pdfInputRef.current?.click()}
                    className={`border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center transition cursor-pointer ${
                      isUploadingPdf
                        ? 'opacity-60 cursor-not-allowed bg-blue-50/20'
                        : 'hover:bg-blue-50/60 dark:hover:bg-blue-950/30'
                    }`}
                  >
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-2">
                      {isUploadingPdf ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {isUploadingPdf
                        ? t('Uploading and verifying PDF signature...', 'अपलोड तथा प्रमाणीकरण हुँदैछ...')
                        : t('Click to upload official Vacancy Notice (PDF)', 'आधिकारिक पदपूर्ति PDF सूचना अपलोड गर्न थिच्नुहोस्')}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {t('PDF format only (%PDF- header verified). Up to 10 MB in file size.', 'PDF ढाँचा मात्र (%PDF- हस्ताक्षर प्रमाणीकरण सहित)। बढीमा १० MB।')}
                    </p>
                  </div>
                )}

                {pdfError ? (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{pdfError}</span>
                  </p>
                ) : null}
              </div>

              {/* Dates & Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Application Deadline */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Application Deadline *', 'दरखास्त म्याद *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={editingVacancy.application_deadline || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Publish Date */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Publish Date', 'प्रकाशन मिति')}
                  </label>
                  <input
                    type="date"
                    value={editingVacancy.publish_date || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, publish_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Publishing Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={editingVacancy.status || 'draft'}
                    onChange={(e) =>
                      setEditingVacancy({
                        ...editingVacancy,
                        status: e.target.value as VacancyStatus
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs cursor-pointer focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">{t('Draft (Not visible publicly)', 'ड्राफ्ट (सार्वजनिक रूपमा नदेखिने)')}</option>
                    <option value="published">{t('Published (Active on Career page)', 'प्रकाशित (सार्वजनिक करियर पृष्ठमा सक्रिय)')}</option>
                    <option value="closed">{t('Closed (Marked as Closed)', 'बन्द (म्याद समाप्त भएको)')}</option>
                  </select>
                </div>
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-checkbox"
                  checked={Boolean(editingVacancy.featured)}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, featured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="featured-checkbox" className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  {t('Mark as Featured Vacancy (Pin to top with gold badge)', 'प्रमुख विज्ञापन बनाउनुहोस् (शीर्षमा विशेष ब्याज सहित राखिने)')}
                </label>
              </div>

              {/* Short Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Short Summary (English)', 'संक्षिप्त विवरण (अंग्रेजी)')}
                  </label>
                  <textarea
                    rows={2}
                    value={editingVacancy.short_description_en || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, short_description_en: e.target.value })}
                    placeholder="Brief 1-2 line overview for the card summary..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Short Summary (Nepali)', 'संक्षिप्त विवरण (नेपाली)')}
                  </label>
                  <textarea
                    rows={2}
                    value={editingVacancy.short_description_np || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, short_description_np: e.target.value })}
                    placeholder="विज्ञापन कार्डमा देखिने छोटो सारांश..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Full Detailed Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Full Job Description (English)', 'पूर्ण कार्य विवरण (अंग्रेजी)')}
                  </label>
                  <textarea
                    rows={4}
                    value={editingVacancy.description_en || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, description_en: e.target.value })}
                    placeholder="Comprehensive institutional overview and scope..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Full Job Description (Nepali)', 'पूर्ण कार्य विवरण (नेपाली)')}
                  </label>
                  <textarea
                    rows={4}
                    value={editingVacancy.description_np || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, description_np: e.target.value })}
                    placeholder="विस्तृत कार्य विवरण तथा विज्ञापनको व्यहोरा..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Responsibilities & Qualifications (One per line) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Responsibilities (one per line)', 'जिम्मेवारीहरू (प्रति हरफ एक)')}
                  </label>
                  <textarea
                    rows={3}
                    value={responsibilitiesText}
                    onChange={(e) => setResponsibilitiesText(e.target.value)}
                    placeholder="Deliver lectures for Grades 9-12&#10;Maintain computer lab hardware&#10;Facilitate extracurricular coding club"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Required Qualifications (one per line)', 'आवश्यक योग्यता (प्रति हरफ एक)')}
                  </label>
                  <textarea
                    rows={3}
                    value={qualificationsText}
                    onChange={(e) => setQualificationsText(e.target.value)}
                    placeholder="Bachelor's degree in Computer Science (B.Sc. CSIT / BIT / BCA)&#10;Valid Secondary Teaching License&#10;Nepali citizenship"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Experience & Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Required Experience', 'अनुभवको विवरण')}
                  </label>
                  <input
                    type="text"
                    value={editingVacancy.experience || ''}
                    onChange={(e) => setEditingVacancy({ ...editingVacancy, experience: e.target.value })}
                    placeholder="Minimum 1-2 years teaching experience preferred"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200">
                    {t('Required Skills (comma separated)', 'सीपहरू (अल्पविरामले छुट्याइएको)')}
                  </label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="Python, HTML/CSS, Hardware Troubleshooting, Bilingual Communication"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Application Instructions */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200">
                  {t('Application Instructions / Document Checklist', 'आवेदन निर्देशन तथा कागजात सूची')}
                </label>
                <textarea
                  rows={2}
                  value={editingVacancy.application_instructions || ''}
                  onChange={(e) => setEditingVacancy({ ...editingVacancy, application_instructions: e.target.value })}
                  placeholder="Please submit scanned copies of citizenship, academic certificates, teaching license, and updated CV via the Google Form link..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setEditingVacancy(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveVacancy}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg transition shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? t('Saving...', 'बचत हुँदैछ...') : t('Save Vacancy', 'सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. PREVIEW MODAL */}
      {previewVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div onClick={() => setPreviewVacancy(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  {previewVacancy.department}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {previewVacancy.title_en}
                </h3>
                {previewVacancy.title_np && <p className="text-xs text-slate-500">{previewVacancy.title_np}</p>}
              </div>
              <button onClick={() => setPreviewVacancy(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <div>
                <span className="text-slate-400">{t('Type:', 'प्रकार:')}</span>{' '}
                <span className="font-semibold">{previewVacancy.employment_type}</span>
              </div>
              <div>
                <span className="text-slate-400">{t('Positions:', 'सङ्ख्या:')}</span>{' '}
                <span className="font-semibold">{previewVacancy.positions_count}</span>
              </div>
              <div>
                <span className="text-slate-400">{t('Deadline:', 'म्याद:')}</span>{' '}
                <span className="font-semibold">{previewVacancy.application_deadline}</span>
              </div>
              <div>
                <span className="text-slate-400">{t('Level:', 'तह:')}</span>{' '}
                <span className="font-semibold">{previewVacancy.academic_level || 'General'}</span>
              </div>
            </div>

            <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="font-semibold text-slate-900 dark:text-white">{t('Description:', 'विवरण:')}</div>
              <p className="whitespace-pre-line leading-relaxed">{previewVacancy.description_en}</p>
            </div>

            {/* Apply Now Status */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400">{t('Apply Now Status:', 'अनलाइन आवेदन:')}</span>{' '}
                <span className={`font-bold ${previewVacancy.apply_now_enabled ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {previewVacancy.apply_now_enabled ? t('ON (Active)', 'चालू (सक्रिय)') : t('OFF (Disabled)', 'बन्द')}
                </span>
              </div>
              {previewVacancy.apply_now_enabled && previewVacancy.application_url && (
                <button
                  type="button"
                  onClick={() => handleTestApplicationLink(previewVacancy.application_url)}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>{t('Test Link', 'लिङ्क जाँच्नुहोस्')}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Attached PDF Notice */}
            {previewVacancy.pdf_url && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs flex items-center justify-between">
                <div
                  onClick={() => setPreviewPdfModal({ url: previewVacancy.pdf_url!, title: previewVacancy.title_en })}
                  className="flex items-center gap-2 cursor-pointer group"
                  title={t('Click to preview PDF document', 'PDF पूर्वावलोकन गर्न थिच्नुहोस्')}
                >
                  <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 group-hover:underline transition">
                    {previewVacancy.pdf_filename || t('Official Vacancy Notice (PDF)', 'आधिकारिक पदपूर्ति सूचना (PDF)')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(previewVacancy.pdf_url!, previewVacancy.pdf_filename)}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md cursor-pointer flex items-center gap-1 transition"
                  >
                    <Download className="w-3 h-3" />
                    <span>{t('Download', 'डाउनलोड')}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={async () => {
                      const newStatus: VacancyStatus = previewVacancy.status === 'published' ? 'draft' : 'published';
                      const updated = vacancies.map(v => v.id === previewVacancy.id ? { ...v, status: newStatus, is_open: newStatus === 'published' } : v);
                      await onSave(updated);
                      setPreviewVacancy({ ...previewVacancy, status: newStatus, is_open: newStatus === 'published' });
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition ${
                      previewVacancy.status === 'published'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {previewVacancy.status === 'published'
                      ? t('Unpublish (Save as Draft)', 'अप्रकाशित (मस्यौदा) गर्नुहोस्')
                      : t('Publish Vacancy Live', 'खुला विज्ञापन प्रकाशित गर्नुहोस्')}
                  </button>
                )}
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => {
                      const v = previewVacancy;
                      setPreviewVacancy(null);
                      handleOpenEdit(v);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                  >
                    {t('Edit Vacancy', 'सम्पादन गर्नुहोस्')}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewVacancy(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer"
              >
                {t('Close Preview', 'बन्द गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PDF VIEWER MODAL */}
      {previewPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setPreviewPdfModal(null)} className="fixed inset-0 bg-black/75 backdrop-blur-xs" />
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col z-10 h-[85vh] overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {previewPdfModal.title}
                </h4>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <IconActionButton
                  action="download"
                  size="sm"
                  onClick={() => handleDownloadPdf(previewPdfModal.url)}
                  tooltip={t('Download PDF', 'डाउनलोड गर्नुहोस्')}
                  aria-label={t('Download PDF', 'डाउनलोड गर्नुहोस्')}
                />
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setPreviewPdfModal(null)}
                  tooltip={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                />
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
              {previewPdfModal.url && previewPdfModal.url.trim() ? (
                <iframe
                  src={previewPdfModal.url}
                  title={previewPdfModal.title}
                  className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
                />
              ) : (
                <div className="text-center p-6 text-slate-500 text-xs">
                  {t('No valid PDF URL provided for this document.', 'यस कागजातको लागि मान्य PDF URL उपलब्ध छैन।')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeleteConfirmId(null)} className="fixed inset-0 bg-black/60" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-base">
                {t('Delete Vacancy Record?', 'के तपाईं यो विज्ञापन मेटाउन निश्चित हुनुहुन्छ?')}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t(
                  'This action will permanently delete this job advertisement from the database.',
                  'यसले यो पदपूर्ति विवरणलाई डाटाबेसबाट स्थायी रूपमा हटाउनेछ।'
                )}
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteVacancy(deleteConfirmId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                {t('Confirm Delete', 'मेटाउनुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
