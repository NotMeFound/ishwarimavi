import React, { useState, useMemo } from 'react';
import { Language, SchoolFAQItem, FAQCategory } from '../../types';
import { initialFAQs } from '../../data/schoolData';
import {
  HelpCircle,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  DollarSign,
  Building,
  ShieldCheck,
  BookmarkCheck,
  Layers,
  FileText
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';
import { CmsEmptyState } from './CmsEmptyState';
import { AdminDrawer } from './AdminDrawer';
import { CmsStatusBadge } from './CmsStatusBadge';

interface FaqAdminTabProps {
  lang: Language;
  faqs?: SchoolFAQItem[];
  onUpdateFaqs: (items: SchoolFAQItem[]) => void;
  onShowToast: (msg: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const FaqAdminTab: React.FC<FaqAdminTabProps> = ({
  lang,
  faqs = initialFAQs,
  onUpdateFaqs,
  onShowToast,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np?: string) => (isNp && np ? np : en);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [highlightsInputEn, setHighlightsInputEn] = useState<string>('');
  const [highlightsInputNp, setHighlightsInputNp] = useState<string>('');

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    confirmText: string;
    variant: ConfirmationVariant;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirm',
    variant: 'warning',
    action: () => {}
  });

  const emptyForm: SchoolFAQItem = {
    id: '',
    category: 'admissions',
    question_en: '',
    question_np: '',
    answer_en: '',
    answer_np: '',
    highlights_en: [],
    highlights_np: [],
    display_order: (faqs?.length || 0) + 1,
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const [form, setForm] = useState<SchoolFAQItem>(emptyForm);

  const categories: { id: string; labelEn: string; labelNp: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', labelEn: 'All Categories', labelNp: 'सबै वर्गहरू', icon: Layers },
    { id: 'admissions', labelEn: 'Admissions', labelNp: 'भर्ना प्रक्रिया', icon: GraduationCap },
    { id: 'academics', labelEn: 'Academics & Streams', labelNp: 'शैक्षिक संकाय', icon: BookOpen },
    { id: 'scholarships', labelEn: 'Scholarships & Fees', labelNp: 'छात्रवृत्ति तथा शुल्क', icon: DollarSign },
    { id: 'facilities', labelEn: 'Labs & Facilities', labelNp: 'पूर्वाधार तथा खाजा', icon: Building },
    { id: 'discipline', labelEn: 'Timing & Rules', labelNp: 'समय र नियम', icon: ShieldCheck }
  ];

  // Category badge helper
  const getCategoryMeta = (cat: FAQCategory) => {
    switch (cat) {
      case 'admissions':
        return { label: t('Admissions', 'भर्ना'), color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' };
      case 'academics':
        return { label: t('Academics', 'शैक्षिक'), color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'scholarships':
        return { label: t('Scholarships', 'छात्रवृत्ति'), color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' };
      case 'facilities':
        return { label: t('Facilities', 'पूर्वाधार'), color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' };
      case 'discipline':
        return { label: t('Rules & Hours', 'नियम'), color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' };
      default:
        return { label: cat, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  // Filtered FAQs list
  const filteredList = useMemo(() => {
    const list = Array.isArray(faqs) ? faqs : initialFAQs;
    return list
      .filter((item) => {
        if (activeCategory !== 'all' && item.category !== activeCategory) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.question_en?.toLowerCase().includes(q) ||
          item.question_np?.toLowerCase().includes(q) ||
          item.answer_en?.toLowerCase().includes(q) ||
          item.answer_np?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  }, [faqs, activeCategory, searchQuery]);

  // Open Create Drawer
  const handleAddNew = () => {
    const newId = `faq-${Date.now().toString(36)}`;
    setForm({
      ...emptyForm,
      id: newId,
      display_order: (faqs?.length || 0) + 1
    });
    setHighlightsInputEn('');
    setHighlightsInputNp('');
    setIsEditing(true);
  };

  // Open Edit Drawer
  const handleEdit = (item: SchoolFAQItem) => {
    setForm({ ...item });
    setHighlightsInputEn((item.highlights_en || []).join(', '));
    setHighlightsInputNp((item.highlights_np || []).join(', '));
    setIsEditing(true);
  };

  // Save FAQ Form
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question_en.trim() && !form.question_np.trim()) {
      onShowToast(t('Question cannot be empty.', 'प्रश्न खाली हुन सक्दैन।'));
      return;
    }

    const hlEn = highlightsInputEn
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const hlNp = highlightsInputNp
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedItem: SchoolFAQItem = {
      ...form,
      question_en: form.question_en.trim() || form.question_np.trim(),
      question_np: form.question_np.trim() || form.question_en.trim(),
      answer_en: form.answer_en.trim() || form.answer_np.trim(),
      answer_np: form.answer_np.trim() || form.answer_en.trim(),
      highlights_en: hlEn,
      highlights_np: hlNp,
      updated_at: new Date().toISOString()
    };

    const currentList = Array.isArray(faqs) ? [...faqs] : [...initialFAQs];
    const existingIndex = currentList.findIndex((item) => item.id === updatedItem.id);

    let newList: SchoolFAQItem[];
    if (existingIndex >= 0) {
      newList = [...currentList];
      newList[existingIndex] = updatedItem;
      onShowToast(t('FAQ updated successfully.', 'प्रायः सोधिने प्रश्न सफलतापूर्वक अद्यावधिक भयो।'));
    } else {
      newList = [...currentList, updatedItem];
      onShowToast(t('New FAQ created successfully.', 'नयाँ प्रायः सोधिने प्रश्न सफलतापूर्वक थपियो।'));
    }

    onUpdateFaqs(newList);
    setIsEditing(false);
  };

  // Toggle Publish/Draft status
  const handleToggleStatus = (item: SchoolFAQItem) => {
    const currentList = Array.isArray(faqs) ? [...faqs] : [...initialFAQs];
    const newStatus: 'published' | 'draft' = item.status === 'published' ? 'draft' : 'published';
    const newList = currentList.map((f) =>
      f.id === item.id ? { ...f, status: newStatus, updated_at: new Date().toISOString() } : f
    );
    onUpdateFaqs(newList);
    onShowToast(
      newStatus === 'published'
        ? t('FAQ published to live site.', 'प्रश्न वेबसाइटमा प्रकाशित गरियो।')
        : t('FAQ saved as draft.', 'प्रश्न ड्राफ्टमा सारियो।')
    );
  };

  // Move Order Up/Down
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const currentList = Array.isArray(faqs) ? [...faqs] : [...initialFAQs];
    const sorted = [...currentList].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const temp = sorted[index].display_order;
    sorted[index].display_order = sorted[targetIndex].display_order;
    sorted[targetIndex].display_order = temp;

    onUpdateFaqs(sorted);
    onShowToast(t('FAQ display order updated.', 'प्रश्नको क्रम अद्यावधिक गरियो।'));
  };

  // Delete FAQ with confirmation
  const handleDelete = (item: SchoolFAQItem) => {
    setConfirmState({
      isOpen: true,
      title: t('Delete FAQ', 'प्रायः सोधिने प्रश्न मेटाउनुहोस्'),
      description: t(
        'Are you sure you want to permanently delete this FAQ item? This action will remove it from the public website.',
        'के तपाईं यो प्रश्न मेटाउन निश्चित हुनुहुन्छ? यो सार्वजनिक वेबसाइटबाट हट्नेछ।'
      ),
      itemName: t(item.question_en, item.question_np),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      variant: 'delete',
      action: () => {
        const currentList = Array.isArray(faqs) ? [...faqs] : [...initialFAQs];
        const newList = currentList.filter((f) => f.id !== item.id);
        onUpdateFaqs(newList);
        onShowToast(t('FAQ deleted successfully.', 'प्रश्न सफलतापूर्वक हटाइयो।'));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <HelpCircle className="w-5 h-5 text-[#1E40AF]" />
            <h2 className="text-lg font-bold">
              {t('Frequently Asked Questions (FAQ) Manager', 'प्रायः सोधिने प्रश्नहरू व्यवस्थापन (FAQ)')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t(
              'Manage institutional questions and answers displayed in the About view for students and parents.',
              'परिचय पृष्ठमा विद्यार्थी र अभिभावकहरूका लागि देखिने संस्थागत प्रश्न तथा उत्तरहरू नियन्त्रण गर्नुहोस्।'
            )}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleAddNew}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-[#1E40AF] text-white hover:bg-[#1D4ED8] shadow-xs shadow-[#1E40AF]/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('Add New FAQ', 'नयाँ प्रश्न थप्नुहोस्')}</span>
          </button>
        )}
      </div>

      {/* 2. Filters & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E40AF] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t(cat.labelEn, cat.labelNp)}</span>
                </button>
              );
            })}
          </div>

          {/* Keyword Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('Search FAQs...', 'प्रश्न खोज्नुहोस्...')}
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FAQ Items List */}
      {filteredList.length === 0 ? (
        <CmsEmptyState
          title={t('No FAQs found', 'कुनै प्रश्न फेला परेन')}
          description={t(
            'No question matches your search criteria or category filter.',
            'तपाईंको खोजी मापदण्ड अनुसार कुनै प्रश्न भेटिएन।'
          )}
          actionLabel={canCreate ? t('Create First FAQ', 'पहिलो प्रश्न सिर्जना गर्नुहोस्') : undefined}
          onAction={canCreate ? handleAddNew : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filteredList.map((item, idx) => {
            const catMeta = getCategoryMeta(item.category);
            const isDraft = item.status === 'draft';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                  isDraft
                    ? 'border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 shadow-2xs hover:border-[#1E40AF]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0 flex-1">
                    {/* Meta Row: Category, Status, Order */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${catMeta.color}`}>
                        {catMeta.label}
                      </span>

                      <CmsStatusBadge status={item.status || 'published'} />

                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {t(`Order #${item.display_order ?? idx + 1}`, `क्रम #${item.display_order ?? idx + 1}`)}
                      </span>
                    </div>

                    {/* Question (English & Nepali) */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.question_en}
                      </h3>
                      {item.question_np && item.question_np !== item.question_en && (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                          {item.question_np}
                        </p>
                      )}
                    </div>

                    {/* Answer Preview */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {t(item.answer_en, item.answer_np)}
                    </p>

                    {/* Highlights tags */}
                    {item.highlights_en && item.highlights_en.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <BookmarkCheck className="w-3 h-3 text-blue-500" />
                          <span>{t('Highlights:', 'मुख्य बुँदा:')}</span>
                        </span>
                        {(item.highlights_en || []).map((h, hIdx) => (
                          <span
                            key={hIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                            <span>{h}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    {/* Reorder Up/Down */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      title={t('Move Up', 'माथि सार्नुहोस्')}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filteredList.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      title={t('Move Down', 'तल सार्नुहोस्')}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Status */}
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        title={isDraft ? t('Publish to site', 'प्रकाशित गर्नुहोस्') : t('Save as draft', 'ड्राफ्ट बनाउनुहोस्')}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDraft
                            ? 'border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400'
                            : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400'
                        }`}
                      >
                        {isDraft ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Edit */}
                    {canUpdate && (
                      <IconActionButton
                        action="edit"
                        icon={Edit3}
                        label={t('Edit', 'सम्पादन')}
                        onClick={() => handleEdit(item)}
                      />
                    )}

                    {/* Delete */}
                    {canDelete && (
                      <IconActionButton
                        action="delete"
                        icon={Trash2}
                        label={t('Delete', 'मेटाउनुहोस्')}
                        onClick={() => handleDelete(item)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Edit / Create Drawer Modal */}
      <AdminDrawer
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title={form.id && faqs.some((f) => f.id === form.id) ? t('Edit FAQ', 'प्रश्न सम्पादन') : t('Add New FAQ', 'नयाँ प्रश्न थप्नुहोस्')}
        subtitle={t('Configure institutional questions, answers, and highlights', 'संस्थागत प्रश्न, उत्तर तथा मुख्य बुँदाहरू मिलाउनुहोस्')}
        width="lg"
      >
        <form onSubmit={handleSave} className="space-y-5">
          {/* Category & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Category', 'वर्ग / समूह')} *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as FAQCategory })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="admissions">{t('Admissions', 'भर्ना प्रक्रिया')}</option>
                <option value="academics">{t('Academics & Streams', 'शैक्षिक संकाय')}</option>
                <option value="scholarships">{t('Scholarships & Fees', 'छात्रवृत्ति तथा शुल्क')}</option>
                <option value="facilities">{t('Labs & Facilities', 'पूर्वाधार तथा खाजा')}</option>
                <option value="discipline">{t('Timing & Rules', 'समय र नियम')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Publication Status', 'प्रकाशन स्थिति')} *
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="published">{t('Published (Live)', 'प्रकाशित (प्रत्यक्ष)')}</option>
                <option value="draft">{t('Draft (Hidden)', 'ड्राफ्ट (गोप्य)')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Display Order', 'प्रदर्शन क्रम')}
              </label>
              <input
                type="number"
                min={1}
                value={form.display_order || 1}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          {/* Question (English & Nepali) */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Question (English)', 'प्रश्न (अङ्ग्रेजी)')} *
              </label>
              <input
                type="text"
                required
                value={form.question_en}
                onChange={(e) => setForm({ ...form, question_en: e.target.value })}
                placeholder="e.g. When does the admission process begin?"
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Question (Nepali)', 'प्रश्न (नेपाली)')} *
              </label>
              <input
                type="text"
                value={form.question_np}
                onChange={(e) => setForm({ ...form, question_np: e.target.value })}
                placeholder="उदा. नयाँ शैक्षिक सत्रको लागि भर्ना कहिले सुरु हुन्छ?"
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          {/* Answer (English & Nepali) */}
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Detailed Answer (English)', 'विस्तृत उत्तर (अङ्ग्रेजी)')} *
              </label>
              <textarea
                required
                rows={4}
                value={form.answer_en}
                onChange={(e) => setForm({ ...form, answer_en: e.target.value })}
                placeholder="Provide accurate, detailed institutional guidelines..."
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Detailed Answer (Nepali)', 'विस्तृत उत्तर (नेपाली)')}
              </label>
              <textarea
                rows={4}
                value={form.answer_np}
                onChange={(e) => setForm({ ...form, answer_np: e.target.value })}
                placeholder="नेपालीमा स्पष्ट, आधिकारिक जानकारी लेख्नुहोस्..."
                className="w-full px-3 py-2.5 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          {/* Highlights Row */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Key Highlights (English - comma separated)', 'मुख्य बुँदाहरू (अङ्ग्रेजी - कमा छुट्याएर)')}
              </label>
              <input
                type="text"
                value={highlightsInputEn}
                onChange={(e) => setHighlightsInputEn(e.target.value)}
                placeholder="e.g. Free admission, Grades 1-8, Ward recommendation"
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('Key Highlights (Nepali - comma separated)', 'मुख्य बुँदाहरू (नेपाली - कमा छुट्याएर)')}
              </label>
              <input
                type="text"
                value={highlightsInputNp}
                onChange={(e) => setHighlightsInputNp(e.target.value)}
                placeholder="उदा. निःशुल्क भर्ना, कक्षा १-८, वडा सिफारिस"
                className="w-full px-3 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#1E40AF]"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 transition cursor-pointer"
            >
              {t('Cancel', 'रद्द गर्नुहोस्')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1D4ED8] shadow-xs shadow-[#1E40AF]/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('Save FAQ', 'प्रश्न सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      </AdminDrawer>

      {/* 5. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        variant={confirmState.variant}
        onConfirm={() => {
          confirmState.action();
          setConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default FaqAdminTab;
