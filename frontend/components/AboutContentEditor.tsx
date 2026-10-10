import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  List,
  Image as ImageIcon,
  Eye,
  Edit3,
  Smartphone,
  Tablet,
  Monitor,
  X,
  Check,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Settings2,
  HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { CmsImageUploader } from './CmsImageUploader';
import { AboutContentRenderer, InlineImageData } from './AboutContentRenderer';

interface AboutContentEditorProps {
  valueEn: string;
  valueNp: string;
  onChangeEn: (val: string) => void;
  onChangeNp: (val: string) => void;
  lang: Language;
  onShowToast: (msg: string) => void;
  labelEn?: string;
  labelNp?: string;
}

export const AboutContentEditor: React.FC<AboutContentEditorProps> = ({
  valueEn,
  valueNp,
  onChangeEn,
  onChangeNp,
  lang,
  onShowToast,
  labelEn = 'Body Content & Story (English)',
  labelNp = 'विवरण तथा सामग्री (नेपाली)'
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Active language tab: 'en' or 'np'
  const [activeLangTab, setActiveLangTab] = useState<'en' | 'np'>('en');

  // Preview Mode: 'edit' or 'preview'
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Textarea references for cursor injection
  const textareaEnRef = useRef<HTMLTextAreaElement>(null);
  const textareaNpRef = useRef<HTMLTextAreaElement>(null);

  // Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [modalImageState, setModalImageState] = useState<InlineImageData>({
    url: '',
    align: 'right',
    size: 'medium',
    alt: '',
    caption: ''
  });
  const [editingTokenIndex, setEditingTokenIndex] = useState<number | null>(null);

  // Current value and setter based on active tab
  const currentValue = activeLangTab === 'en' ? valueEn : valueNp;
  const currentSetter = activeLangTab === 'en' ? onChangeEn : onChangeNp;
  const currentTextareaRef = activeLangTab === 'en' ? textareaEnRef : textareaNpRef;

  // Insert markdown tag at cursor
  const insertTextAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = currentTextareaRef.current;
    if (!textarea) {
      currentSetter(currentValue + '\n' + prefix + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = prefix + (selected || '') + suffix;

    const updated = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    currentSetter(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  // Parse existing inline images from text
  const parseInlineImages = (text: string) => {
    const items: Array<{ raw: string; data: InlineImageData; index: number }> = [];
    const regex = /\[\[image:(.+?)\]\]/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      const parts = match[1].split('|').map((p) => p.trim());
      const rawUrl = parts[0].replace(/^url:/i, '').trim();
      let align: 'left' | 'right' | 'center' | 'full' = 'center';
      let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
      let alt = '';
      let caption = '';

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (/^align:/i.test(part)) {
          const val = part.replace(/^align:/i, '').trim().toLowerCase();
          if (['left', 'right', 'center', 'full'].includes(val)) align = val as any;
        } else if (/^size:/i.test(part)) {
          const val = part.replace(/^size:/i, '').trim().toLowerCase();
          if (['small', 'medium', 'large', 'full'].includes(val)) size = val as any;
        } else if (/^alt:/i.test(part)) {
          alt = part.replace(/^alt:/i, '').trim();
        } else if (/^caption:/i.test(part)) {
          caption = part.replace(/^caption:/i, '').trim();
        }
      }

      items.push({
        raw: match[0],
        data: { url: rawUrl, align, size, alt, caption },
        index: match.index
      });
    }

    return items;
  };

  const currentInlineImages = parseInlineImages(currentValue);

  // Open modal for new image insertion
  const handleOpenInsertModal = () => {
    setModalImageState({
      url: '',
      align: 'right',
      size: 'medium',
      alt: '',
      caption: ''
    });
    setEditingTokenIndex(null);
    setIsImageModalOpen(true);
  };

  // Open modal to edit an existing image token
  const handleEditExistingImage = (idx: number) => {
    const item = currentInlineImages[idx];
    if (!item) return;
    setModalImageState(item.data);
    setEditingTokenIndex(idx);
    setIsImageModalOpen(true);
  };

  // Remove an image token from text
  const handleRemoveImageToken = (idx: number) => {
    const item = currentInlineImages[idx];
    if (!item) return;
    const updated = currentValue.replace(item.raw, '').replace(/\n\s*\n\s*\n/g, '\n\n');
    currentSetter(updated);
    onShowToast(t('Image removed from body content.', 'सामग्रीबाट फोटो हटाइयो।'));
  };

  // Save image token into text
  const handleSaveImageModal = () => {
    if (!modalImageState.url) {
      onShowToast(t('Please upload or provide an image URL first.', 'कृपया पहिले तस्बिर छान्नुहोस् वा अपलोड गर्नुहोस्।'));
      return;
    }

    // Build shortcode
    const altText = modalImageState.alt.trim() || 'Ishwari Secondary School photograph';
    let token = `[[image:${modalImageState.url}|align:${modalImageState.align}|size:${modalImageState.size}|alt:${altText}`;
    if (modalImageState.caption && modalImageState.caption.trim()) {
      token += `|caption:${modalImageState.caption.trim()}`;
    }
    token += `]]`;

    if (editingTokenIndex !== null && currentInlineImages[editingTokenIndex]) {
      // Replace existing token
      const oldRaw = currentInlineImages[editingTokenIndex].raw;
      const updated = currentValue.replace(oldRaw, token);
      currentSetter(updated);
      onShowToast(t('Inline image configuration updated!', 'इनलाइन तस्बिर विवरण अद्यावधिक गरियो!'));
    } else {
      // Insert at cursor
      const textarea = currentTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        // Ensure separation
        const prefix = before.length > 0 && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
        const suffix = after.length > 0 && !after.startsWith('\n\n') ? (after.startsWith('\n') ? '\n' : '\n\n') : '';
        const updated = before + prefix + token + suffix + after;
        currentSetter(updated);
      } else {
        currentSetter(currentValue + '\n\n' + token + '\n\n');
      }
      onShowToast(t('Image inserted inside content flow!', 'सामग्रीको प्रवाहभित्र तस्बिर थपियो!'));
    }

    setIsImageModalOpen(false);
  };

  // Presets of institutional sample images for quick reuse
  const institutionalSamples = [
    {
      title: 'Academic Building',
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
      alt: 'Ishwari Secondary School academic building and campus grounds'
    },
    {
      title: 'Science Lab',
      url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
      alt: 'Students conducting experimental physics and chemistry research'
    },
    {
      title: 'Computer Lab',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      alt: 'Digital literacy and ICT computer training facility'
    },
    {
      title: 'Library',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      alt: 'Institutional reference library and reading room'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar: Language Tabs & View Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Language switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveLangTab('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeLangTab === 'en'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🇬🇧 English Content
          </button>
          <button
            type="button"
            onClick={() => setActiveLangTab('np')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeLangTab === 'np'
                ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            🇳🇵 नेपाली सामग्री
          </button>
        </div>

        {/* Edit Mode vs Live Article Preview Mode */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                mode === 'edit'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-[#1E40AF]" />
              <span>{t('Editor', 'सम्पादक')}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                mode === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('Live Article Preview', 'प्रत्यक्ष पूर्वावलोकन')}</span>
            </button>
          </div>
        </div>
      </div>

      {mode === 'edit' ? (
        <div className="space-y-3">
          {/* Professional Formatting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                onClick={() => insertTextAtCursor('**', '**')}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Bold (**text**)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('*', '*')}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Italic (*text*)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n### ', '\n')}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Subheading (### Title)"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor('\n- ', '')}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                title="Bullet List (- item)"
              >
                <List className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

              {/* PRIMARY INSERT IMAGE BUTTON */}
              <button
                type="button"
                onClick={handleOpenInsertModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition cursor-pointer"
                title="Insert Image within text flow"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t('Insert Inline Image', 'तस्बिर घुसाउनुहोस्')}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('Images flow naturally within paragraph story', 'तस्बिरहरू अनुच्छेदभित्र स्वाभाविक रूपमा बग्छन्')}</span>
            </div>
          </div>

          {/* Textarea Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeLangTab === 'en' ? labelEn : labelNp}
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {currentValue.length} {t('characters', 'अक्षर')} | {currentInlineImages.length} {t('images', 'तस्बिरहरू')}
              </span>
            </div>

            {activeLangTab === 'en' ? (
              <textarea
                ref={textareaEnRef}
                rows={9}
                value={valueEn}
                onChange={(e) => onChangeEn(e.target.value)}
                placeholder="Write the institutional narrative in English. Use the 'Insert Inline Image' button to position archival photos, building grounds, or student activities directly between or beside paragraphs..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-sans leading-relaxed focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent outline-none resize-y"
              />
            ) : (
              <textarea
                ref={textareaNpRef}
                rows={9}
                value={valueNp}
                onChange={(e) => onChangeNp(e.target.value)}
                placeholder="विद्यालयको ऐतिहासिक पृष्ठभूमि, उद्देश्य तथा गतिविधिका विवरणहरू नेपालीमा प्रविष्ट गर्नुहोस्। तस्बिरहरूलाई उपयुक्त स्थानमा देखाउन माथिको 'तस्बिर घुसाउनुहोस्' बटन प्रयोग गर्नुहोस्..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-sans leading-relaxed focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent outline-none resize-y"
              />
            )}
          </div>

          {/* Detected Images List in this content */}
          {currentInlineImages.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#1E40AF]" />
                  <span>
                    {t(
                      `Images Embedded in ${activeLangTab === 'en' ? 'English' : 'Nepali'} Content (${currentInlineImages.length})`,
                      `${activeLangTab === 'en' ? 'अंग्रेजी' : 'नेपाली'} सामग्रीभित्र राखिएका तस्बिरहरू (${currentInlineImages.length})`
                    )}
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">
                  {t('Click Edit to change alignment or caption', 'ढाँचा वा क्याप्सन परिवर्तन गर्न सम्पादन गर्नुहोस्')}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentInlineImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {img.data.url && img.data.url.trim() ? (
                          <img
                            src={img.data.url}
                            alt={img.data.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#1E40AF] dark:bg-blue-900/30 dark:text-blue-300">
                            {img.data.align}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {img.data.size}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {img.data.alt || 'School photograph'}
                        </p>
                        {img.data.caption && (
                          <p className="text-[11px] text-slate-500 italic truncate">
                            &quot;{img.data.caption}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEditExistingImage(idx)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                        title="Edit image settings"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImageToken(idx)}
                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-500 cursor-pointer"
                        title="Remove from content"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIVE ARTICLE PREVIEW TAB */
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Responsive Layout Viewport Preview', 'उत्तरदायी लेआउट पूर्वावलोकन')}</span>
            </span>

            {/* Viewport switch: Desktop, Tablet, Mobile */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewViewport('desktop')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                  previewViewport === 'desktop'
                    ? 'bg-[#1E40AF] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Desktop (100% width, floats wrap)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport('tablet')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                  previewViewport === 'tablet'
                    ? 'bg-[#1E40AF] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Tablet (768px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewViewport('mobile')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition cursor-pointer ${
                  previewViewport === 'mobile'
                    ? 'bg-[#1E40AF] text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Mobile (375px, floats cleanly stack)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* Simulated Viewport Stage */}
          <div className="p-4 bg-slate-100 dark:bg-slate-950/80 rounded-2xl flex justify-center overflow-x-auto min-h-[300px]">
            <div
              className={`bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 ${
                previewViewport === 'mobile'
                  ? 'w-[375px] max-w-full'
                  : previewViewport === 'tablet'
                  ? 'w-[768px] max-w-full'
                  : 'w-full max-w-4xl'
              }`}
            >
              <AboutContentRenderer
                content={currentValue}
                lang={activeLangTab}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSERT / EDIT INLINE IMAGE MODAL */}
      {/* ========================================================================= */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {editingTokenIndex !== null
                      ? t('Configure Inline Image', 'इनलाइन तस्बिर विवरण मिलाउनुहोस्')
                      : t('Insert Image into Story', 'सामग्री प्रवाहमा तस्बिर थप्नुहोस्')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {t(
                      'Supports PNG, JPG, JPEG (Max 1MB). Flow image with text using alignment and size.',
                      'PNG, JPG, JPEG (अधिकतम १MB)। तस्बिर र अक्षरको उपयुक्त संयोजन मिलाउनुहोस्।'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Upload Image (Max 1MB, JPG/PNG) OR Select Existing */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('1. Photo Selection & Upload (Max 1 MB, PNG/JPG/JPEG)', '१. तस्बिर छनोट वा अपलोड (अधिकतम १ MB, PNG/JPG/JPEG)')}
              </label>

              <CmsImageUploader
                lang={lang}
                label={t('Upload Archival or Institutional Photo', 'ऐतिहासिक वा संस्थागत तस्बिर अपलोड गर्नुहोस्')}
                description={t('Strictly verified for PNG/JPG format under 1MB limit.', '१MB भन्दा कम आकारको PNG/JPG ढाँचा।')}
                imageUrl={modalImageState.url}
                onImageChange={(url) => setModalImageState((prev) => ({ ...prev, url }))}
                onImageRemove={() => setModalImageState((prev) => ({ ...prev, url: '' }))}
                maxSizeMB={1}
                allowedFormats={['jpg', 'jpeg', 'png']}
                category="about_image"
                aspectRatioLabel="Natural / 4:3 / 16:9"
                onShowToast={onShowToast}
              />

              {/* Quick Preset Selector for common school photos */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1.5">
                  {t('Or select from sample institutional library:', 'वा नमुना तस्बिर पुस्तकालयबाट छान्नुहोस्:')}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {institutionalSamples.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() =>
                        setModalImageState((prev) => ({
                          ...prev,
                          url: sample.url,
                          alt: prev.alt || sample.alt
                        }))
                      }
                      className={`p-1.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                        modalImageState.url === sample.url
                          ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-8 h-8 rounded-md object-cover shrink-0"
                      />
                      <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                        {sample.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Alignment Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('2. Image Alignment in Text Flow', '२. सामग्रीभित्र तस्बिरको स्थिति')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'left' as const,
                    icon: AlignLeft,
                    label: t('Left (Wrap Text)', 'बायाँ (दायाँ अक्षर)'),
                    desc: t('Floats left on desktop, stacks on mobile', 'डेस्कटपमा बायाँ, मोबाइलमा सिधा')
                  },
                  {
                    id: 'right' as const,
                    icon: AlignRight,
                    label: t('Right (Wrap Text)', 'दायाँ (बायाँ अक्षर)'),
                    desc: t('Floats right on desktop, stacks on mobile', 'डेस्कटपमा दायाँ, मोबाइलमा सिधा')
                  },
                  {
                    id: 'center' as const,
                    icon: AlignCenter,
                    label: t('Center (Block)', 'केन्द्र (ब्लक)'),
                    desc: t('Centered between paragraphs', 'अनुच्छेदहरूको बीचमा केन्द्रित')
                  },
                  {
                    id: 'full' as const,
                    icon: Maximize2,
                    label: t('Full Width', 'पूर्ण चौडाइ'),
                    desc: t('Spans available container width', 'कन्टेनरको पूरा चौडाइ ओगट्ने')
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = modalImageState.align === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setModalImageState((prev) => ({ ...prev, align: item.id }))}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-[#1E40AF] bg-[#1E40AF]/5 dark:bg-blue-900/20 ring-1 ring-[#1E40AF]'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#1E40AF]' : 'text-slate-400'}`} />
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#1E40AF]" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Size Options */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {t('3. Image Size (Controlled Proportions)', '३. तस्बिरको आकार')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'small' as const, label: t('Small (~260px)', 'सानो (~260px)') },
                  { id: 'medium' as const, label: t('Medium (~400px)', 'मध्यम (~400px)') },
                  { id: 'large' as const, label: t('Large (~560px)', 'ठूलो (~560px)') },
                  { id: 'full' as const, label: t('Full Width (100%)', 'पूर्ण चौडाइ (100%)') }
                ].map((sizeItem) => (
                  <button
                    key={sizeItem.id}
                    type="button"
                    onClick={() => setModalImageState((prev) => ({ ...prev, size: sizeItem.id }))}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold text-center transition cursor-pointer ${
                      modalImageState.size === sizeItem.id
                        ? 'border-[#1E40AF] bg-[#1E40AF] text-white'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {sizeItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4 & 5: Alt Text and Caption */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('Alt Text (Accessibility) *', 'अल्ट टेक्स्ट (पहुँच योग्यता) *')}
                </label>
                <input
                  type="text"
                  required
                  value={modalImageState.alt}
                  onChange={(e) => setModalImageState((prev) => ({ ...prev, alt: e.target.value }))}
                  placeholder={t('e.g., Students conducting experiments in science lab', 'उदा: विज्ञान प्रयोगशालामा विद्यार्थीहरू')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t('Describes the image for screen readers', 'दृष्टिबिहीन तथा स्क्रिन रिडरका लागि विवरण')}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {t('Optional Caption', 'तस्बिर मुनिको क्याप्सन (वैकल्पिक)')}
                </label>
                <input
                  type="text"
                  value={modalImageState.caption || ''}
                  onChange={(e) => setModalImageState((prev) => ({ ...prev, caption: e.target.value }))}
                  placeholder={t('e.g., Inauguration of the senior physics wing, 2038 BS', 'उदा: वि.सं. २०३८ मा नयाँ शैक्षिक भवनको उद्घाटन')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {t('Subtle italic description displayed under the photo', 'फोटो मुनि देखिने सानो विवरण')}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                disabled={!modalImageState.url}
                onClick={handleSaveImageModal}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#1E40AF] text-white hover:bg-blue-700 text-xs font-bold shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>
                  {editingTokenIndex !== null
                    ? t('Update Inline Image', 'तस्बिर विवरण सुरक्षित गर्नुहोस्')
                    : t('Insert into Content', 'सामग्रीमा घुसाउनुहोस्')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
