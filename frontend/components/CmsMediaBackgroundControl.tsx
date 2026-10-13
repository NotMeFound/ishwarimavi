import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Globe,
  RefreshCw,
  Trash2,
  X,
  Eye,
  CheckCircle,
  AlertCircle,
  Link2,
  FileImage,
  Check
} from 'lucide-react';
import { Language } from '../types';
import { getApiUrl } from '../utils/apiUrl';
import { apiClient } from '../services/apiClient';

export interface CmsMediaBackgroundControlProps {
  lang: Language;
  label?: string;
  description?: string;
  mediaUrl?: string;
  sourceType?: 'upload' | 'url';
  mediaType?: 'image' | 'gif';
  onMediaChange: (url: string, source: 'upload' | 'url', type: 'image' | 'gif') => void;
  onMediaRemove: () => void;
  maxSizeMB?: number;
  allowedFormats?: string[];
  category?: string;
  onShowToast: (msg: string) => void;
  id?: string;
}

export const CmsMediaBackgroundControl: React.FC<CmsMediaBackgroundControlProps> = ({
  lang,
  label,
  description,
  mediaUrl,
  sourceType = 'upload',
  mediaType = 'image',
  onMediaChange,
  onMediaRemove,
  maxSizeMB = 1,
  allowedFormats = ['jpg', 'jpeg', 'png', 'gif'],
  category = 'about_image',
  onShowToast,
  id
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Active source mode tab: 'upload' or 'url'
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(() => {
    if (sourceType) return sourceType;
    if (mediaUrl?.startsWith('http://') || mediaUrl?.startsWith('https://')) return 'url';
    return 'upload';
  });

  // Keep activeTab in sync if external sourceType changes
  useEffect(() => {
    if (sourceType) {
      setActiveTab(sourceType);
    } else if (mediaUrl?.startsWith('http://') || mediaUrl?.startsWith('https://')) {
      setActiveTab('url');
    }
  }, [sourceType, mediaUrl]);

  // URL input and preview states
  const [inputUrl, setInputUrl] = useState<string>(() => (sourceType === 'url' ? mediaUrl || '' : ''));
  const [urlPreviewState, setUrlPreviewState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    width?: number;
    height?: number;
    detectedType?: 'image' | 'gif';
    errorMsg?: string;
    verifiedUrl?: string;
  }>({ status: 'idle' });

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMeta, setUploadMeta] = useState<{
    width?: number;
    height?: number;
    sizeKB?: number;
    fileName?: string;
    detectedType?: 'image' | 'gif';
  } | null>(null);

  // Confirmation modal state for removal
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox preview modal state
  const [showLightbox, setShowLightbox] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate URL safety
  const validateUrl = (rawUrl: string): { valid: boolean; error?: string } => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { valid: false, error: t('Please enter a media URL.', 'कृपया मिडियाको URL प्रविष्ट गर्नुहोस्।') };
    }

    // Disallow dangerous or unsupported schemes
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('file:') ||
      lower.startsWith('blob:') ||
      lower.startsWith('vbscript:')
    ) {
      return {
        valid: false,
        error: t(
          'Unsafe URL protocol detected. Only HTTPS (or HTTP) URLs are permitted.',
          'असुरक्षित URL प्रोटोकल फेला पर्यो। HTTPS (वा HTTP) URL मात्र समर्थित छ।'
        )
      };
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return {
          valid: false,
          error: t('URL must start with https:// or http://', 'URL https:// वा http:// बाट सुरु हुनुपर्छ।')
        };
      }
      return { valid: true };
    } catch {
      return {
        valid: false,
        error: t('Please enter a valid, well-formed URL.', 'कृपया मान्य URL ढाँचा प्रविष्ट गर्नुहोस्।')
      };
    }
  };

  // Preview entered URL
  const handlePreviewUrl = () => {
    const check = validateUrl(inputUrl);
    if (!check.valid) {
      setUrlPreviewState({
        status: 'error',
        errorMsg: check.error
      });
      return;
    }

    const trimmed = inputUrl.trim();
    setUrlPreviewState({ status: 'loading' });

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      setUrlPreviewState({
        status: 'error',
        errorMsg: t('Media loading timed out. Please verify the URL.', 'मिडिया लोड हुन समय समाप्त भयो। कृपया URL जाँच गर्नुहोस्।')
      });
    }, 10000);

    img.onload = () => {
      clearTimeout(timer);
      const isGif = trimmed.toLowerCase().includes('.gif') || trimmed.toLowerCase().includes('format=gif');
      setUrlPreviewState({
        status: 'success',
        width: img.naturalWidth,
        height: img.naturalHeight,
        detectedType: isGif ? 'gif' : 'image',
        verifiedUrl: trimmed
      });
    };

    img.onerror = () => {
      clearTimeout(timer);
      setUrlPreviewState({
        status: 'error',
        errorMsg: t('Unable to load this media URL.', 'यो मिडिया URL लोड गर्न सकिएन।')
      });
    };

    img.src = trimmed;
  };

  // Confirm URL application
  const handleApplyUrl = () => {
    if (urlPreviewState.status === 'success' && urlPreviewState.verifiedUrl) {
      onMediaChange(urlPreviewState.verifiedUrl, 'url', urlPreviewState.detectedType || 'image');
      onShowToast(t('External media background applied!', 'बाह्य मिडिया पृष्ठभूमि सफलतापूर्वक लागू गरियो!'));
      setUrlPreviewState({ status: 'idle' });
    }
  };

  // Process uploaded file with client & server verification
  const processFile = async (file: File) => {
    // 1. Client-side size verification
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      onShowToast(
        t(
          `Media size exceeds maximum ${maxSizeMB}MB limit (Current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
          `मिडियाको आकार अधिकतम ${maxSizeMB}MB भन्दा बढी भयो (हाल: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`
        )
      );
      return;
    }

    // 2. Client-side extension check
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedFormats.includes(ext)) {
      onShowToast(
        t(
          `Invalid file format. Supported: ${allowedFormats.map(e => e.toUpperCase()).join(', ')}`,
          `अमान्य फाइल ढाँचा। समर्थित: ${allowedFormats.map(e => e.toUpperCase()).join(', ')}`
        )
      );
      return;
    }

    // 3. Client-side MIME check
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (file.type && !allowedMimes.includes(file.type.toLowerCase())) {
      onShowToast(
        t(
          'Invalid MIME type. Supported: JPG, PNG, GIF.',
          'अमान्य MIME प्रकार। समर्थित: JPG, PNG, GIF।'
        )
      );
      return;
    }

    // 4. Client-side magic bytes / signature check via ArrayBuffer
    try {
      const headerBuffer = await file.slice(0, 8).arrayBuffer();
      const bytes = new Uint8Array(headerBuffer);
      const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      const isGif =
        bytes[0] === 0x47 &&
        bytes[1] === 0x49 &&
        bytes[2] === 0x46 &&
        bytes[3] === 0x38 &&
        (bytes[4] === 0x37 || bytes[4] === 0x39) &&
        bytes[5] === 0x61; // 'GIF87a' or 'GIF89a'

      if (!isJpeg && !isPng && !isGif) {
        onShowToast(
          t(
            'Invalid file signature. File is not a valid JPG, PNG, or GIF image.',
            'अमान्य फाइल हस्ताक्षर। फाइल मान्य JPG, PNG, वा GIF तस्बिर होइन।'
          )
        );
        return;
      }

      const detectedType: 'gif' | 'image' = isGif ? 'gif' : 'image';

      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        if (!base64Data) {
          setIsUploading(false);
          onShowToast(t('Could not read the selected media file.', 'छानिएको मिडिया फाइल पढ्न सकिएन।'));
          return;
        }

        // Measure image dimensions
        const img = new Image();
        img.onload = () => {
          setUploadMeta({
            width: img.naturalWidth,
            height: img.naturalHeight,
            sizeKB: Math.round(file.size / 1024),
            fileName: file.name,
            detectedType
          });
        };
        img.src = base64Data;

        // Server-side upload and verification via authoritative apiClient
        try {
          const uploadRes = await apiClient.uploadFile({
            fileName: file.name,
            fileType: file.type || (detectedType === 'gif' ? 'image/gif' : 'image/jpeg'),
            base64Data,
            category: category || 'about'
          });

          if (uploadRes.success && uploadRes.url) {
            onMediaChange(uploadRes.url, 'upload', detectedType);
            onShowToast(
              t(
                `${detectedType === 'gif' ? 'Animated GIF' : 'Background image'} uploaded successfully!`,
                `${detectedType === 'gif' ? 'एनिमेटेड GIF' : 'पृष्ठभूमि तस्बिर'} सफलतापूर्वक अपलोड गरियो!`
              )
            );
            setIsUploading(false);
            return;
          }
          onShowToast(uploadRes.error || t('Media upload failed. Please try again.', 'मिडिया अपलोड असफल भयो। कृपया पुनः प्रयास गर्नुहोस्।'));
        } catch (error) {
          onShowToast(error instanceof Error
            ? error.message
            : t('Media upload failed. Check your connection and try again.', 'मिडिया अपलोड असफल भयो। इन्टरनेट जाँच गरी पुनः प्रयास गर्नुहोस्।'));
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        setIsUploading(false);
        onShowToast(t('Failed to read file from disk.', 'फाइल पढ्न सकिएन।'));
      };

      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      onShowToast(t('Error reading file signature.', 'फाइल जाँच गर्दा त्रुटि भयो।'));
    }
  };

  // Perform media removal with cleanup
  const handleConfirmRemove = async () => {
    setIsDeleting(true);
    try {
      // If locally uploaded file on server, attempt to delete from backend
      if (mediaUrl && (mediaUrl.startsWith('/api/about/file/') || mediaUrl.startsWith('/api/history/file/'))) {
        const endpoint = mediaUrl.startsWith('/api/about/file/') ? '/api/about/file/' : '/api/history/file/';
        const filename = mediaUrl.split('/').pop();
        if (filename) {
          try {
            await fetch(getApiUrl(`${endpoint}${filename}`), {
              method: 'DELETE',
              headers: { ...apiClient.getAuthHeaders() },
              credentials: 'include'
            });
          } catch {
            // Silent catch
          }
        }
      }

      onMediaRemove();
      setUploadMeta(null);
      setUrlPreviewState({ status: 'idle' });
      setInputUrl('');
      setShowConfirmRemove(false);
      onShowToast(t('Background media removed successfully.', 'पृष्ठभूमि मिडिया सफलतापूर्वक हटाइयो।'));
    } finally {
      setIsDeleting(false);
    }
  };

  // Detected format & size display helper
  const isGif =
    mediaType === 'gif' ||
    mediaUrl?.toLowerCase().endsWith('.gif') ||
    mediaUrl?.toLowerCase().includes('.gif?') ||
    uploadMeta?.detectedType === 'gif';

  const cleanMediaUrl = mediaUrl?.trim() || '';
  const isCurrentUrl =
    sourceType === 'url' ||
    (Boolean(cleanMediaUrl) && (cleanMediaUrl.startsWith('http://') || cleanMediaUrl.startsWith('https://')));

  const displayFilename = isCurrentUrl
    ? t('External Media URL', 'बाह्य मिडिया URL')
    : uploadMeta?.fileName ||
      (cleanMediaUrl.startsWith('/api/about/file/')
        ? cleanMediaUrl.split('/').pop()
        : cleanMediaUrl.startsWith('data:')
        ? t('Uploaded Asset', 'अपलोड गरिएको फाइल')
        : 'background_media');

  return (
    <div id={id} className="space-y-2.5">
      {/* Lightbox Preview Modal */}
      {showLightbox && cleanMediaUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowLightbox(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{label || t('Background Media Preview', 'पृष्ठभूमि मिडिया पूर्वावलोकन')}</span>
                {isGif && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    GIF
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setShowLightbox(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden flex items-center justify-center bg-black/50 rounded-lg p-2">
              <img
                src={cleanMediaUrl}
                alt={label || 'Background Media'}
                className="max-h-full max-w-full object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-[11px] text-slate-400 text-center font-mono truncate">
              {displayFilename} • {isGif ? 'Animated GIF' : 'Image'} • {isCurrentUrl ? 'URL' : 'Uploaded'}
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Dialog Modal */}
      {showConfirmRemove && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowConfirmRemove(false)}
        >
          <div
            className="relative max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/40">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Remove Background Media?', 'पृष्ठभूमि मिडिया हटाउनुहुन्छ?')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t(
                    'Are you sure you want to remove this background media from the section card? The card will revert to a standard neutral institutional layout.',
                    'के तपाईं यो खण्ड कार्डबाट पृष्ठभूमि मिडिया हटाउन निश्चित हुनुहुन्छ? कार्ड सामान्य ढाँचामा फर्किनेछ।'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmRemove(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                {t('Cancel', 'रद्द गर्नुहोस्')}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmRemove}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? t('Removing...', 'हटाउँदैछ...') : t('Yes, Remove Media', 'हो, हटाउनुहोस्')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Field Header: Label and Format Specs */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <FileImage className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
          <span>{label || t('Background Media', 'पृष्ठभूमि मिडिया')}</span>
        </label>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
          JPG, PNG, GIF • Max {maxSizeMB} MB
        </span>
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {description}
        </p>
      )}

      {/* Existing Media State: Compact Summary Box */}
      {cleanMediaUrl ? (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Compact Thumbnail (~80px wide) */}
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowLightbox(true);
                  }
                }}
                onClick={() => setShowLightbox(true)}
                title={t('Click to enlarge preview', 'ठूलो तस्बिर हेर्न क्लिक गर्नुहोस्')}
                className="relative w-20 h-14 sm:w-22 sm:h-16 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 group cursor-pointer shrink-0 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={cleanMediaUrl}
                  alt={displayFilename}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {isGif && (
                  <span className="absolute bottom-1 right-1 px-1 py-0.2 text-[9px] font-bold rounded bg-amber-500 text-slate-950 shadow-xs">
                    GIF
                  </span>
                )}
              </div>

              {/* Information / Badges */}
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white truncate">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{displayFilename}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                    {isGif ? 'GIF' : 'IMAGE'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-300">
                    {isCurrentUrl ? t('External URL', 'बाह्य URL') : t('Uploaded', 'अपलोड गरिएको')}
                  </span>
                  {uploadMeta?.sizeKB && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      {uploadMeta.sizeKB} KB
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions: Replace / Change Source / Remove */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              {isCurrentUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('url');
                    setInputUrl(mediaUrl || '');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  title={t('Edit URL', 'URL सम्पादन गर्नुहोस्')}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{t('Edit URL', 'URL सम्पादन')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
                  title={t('Replace image/GIF', 'मिडिया बदल्नुहोस्')}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                  <span>{t('Replace', 'बदल्नुहोस्')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowConfirmRemove(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 transition cursor-pointer"
                title={t('Remove background media', 'पृष्ठभूमि हटाउनुहोस्')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('Remove', 'हटाउनुहोस्')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Source Selector Tabs + Compact Form Field */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 p-3 space-y-3">
          {/* Source Tabs: [ Upload Media ] [ Use URL ] */}
          <div className="flex items-center p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60 max-w-xs">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t('Upload Media', 'मिडिया अपलोड')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-slate-900 text-[#1E40AF] dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('Use URL', 'URL प्रयोग गर्नुहोस्')}</span>
            </button>
          </div>

          {/* Mode 1: Compact Upload Drop / File Box */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) processFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`p-3 rounded-xl border border-dashed transition-all flex items-center justify-between gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] ${
                isDragging
                  ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40'
                  : 'border-slate-300 dark:border-slate-700 hover:border-[#1E40AF]/60 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {isUploading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                    {isUploading
                      ? t('Uploading & verifying...', 'अपलोड तथा प्रमाणीकरण हुँदै...')
                      : t('Choose Image or GIF', 'तस्बिर वा GIF छान्नुहोस्')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    JPG, PNG, GIF • Max {maxSizeMB} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition shrink-0 pointer-events-none"
              >
                {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{isUploading ? t('Uploading...', 'अपलोड...') : t('Browse', 'खोल्नुहोस्')}</span>
              </button>
            </div>
          )}

          {/* Mode 2: Media URL Input & Compact Preview Area */}
          {activeTab === 'url' && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => {
                      setInputUrl(e.target.value);
                      if (urlPreviewState.status !== 'idle') {
                        setUrlPreviewState({ status: 'idle' });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePreviewUrl();
                      }
                    }}
                    placeholder="https://example.com/background.gif"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E40AF]/40 focus:border-[#1E40AF]"
                  />
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  type="button"
                  onClick={handlePreviewUrl}
                  disabled={urlPreviewState.status === 'loading' || !inputUrl.trim()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {urlPreviewState.status === 'loading' ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#1E40AF]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                  <span>{t('Preview', 'हेर्नुहोस्')}</span>
                </button>
              </div>

              {/* URL Preview State: Small Box (~80px) */}
              {urlPreviewState.status === 'success' && urlPreviewState.verifiedUrl && (
                <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-16 h-12 rounded overflow-hidden border border-emerald-300 dark:border-emerald-800 bg-slate-900 shrink-0 shadow-2xs">
                      <img
                        src={urlPreviewState.verifiedUrl}
                        alt="URL Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 truncate">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{t('Valid Media Verified', 'मान्य मिडिया प्रमाणित')}</span>
                      </p>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-mono truncate">
                        {urlPreviewState.width} × {urlPreviewState.height} px •{' '}
                        {urlPreviewState.detectedType === 'gif' ? 'GIF' : 'IMAGE'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('Use This Media', 'यो मिडिया प्रयोग गर्नुहोस्')}</span>
                  </button>
                </div>
              )}

              {/* URL Error state: Compact banner */}
              {urlPreviewState.status === 'error' && (
                <div className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 flex items-center gap-2 text-red-700 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {urlPreviewState.errorMsg || t('Unable to load this media URL.', 'यो मिडिया URL लोड गर्न सकिएन।')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Uploading */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
        className="hidden"
      />
    </div>
  );
};
