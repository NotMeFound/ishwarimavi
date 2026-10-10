import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { Language } from '../types';
import { getApiUrl } from '../utils/apiUrl';
import { apiClient } from '../services/apiClient';

interface CmsImageUploaderProps {
  lang: Language;
  label: string;
  description?: string;
  imageUrl?: string;
  onImageChange: (newUrl: string) => void;
  onImageRemove: () => void;
  maxSizeMB?: number;
  allowedFormats?: string[];
  category?: string;
  aspectRatioLabel?: string;
  onShowToast: (msg: string) => void;
  id?: string;
}

export const CmsImageUploader: React.FC<CmsImageUploaderProps> = ({
  lang,
  label,
  description,
  imageUrl,
  onImageChange,
  onImageRemove,
  maxSizeMB = 5,
  allowedFormats,
  category = 'image',
  aspectRatioLabel,
  onShowToast,
  id
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width?: number; height?: number; sizeKB?: number } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    // 1. Client-side size check
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      onShowToast(
        t(
          `Image size exceeds maximum ${maxSizeMB}MB limit (Current: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
          `तस्बिरको आकार अधिकतम ${maxSizeMB}MB भन्दा बढी भयो (हाल: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`
        )
      );
      return;
    }

    // 2. Format validation
    const validExtensions = allowedFormats && allowedFormats.length > 0
      ? allowedFormats.map(f => f.toLowerCase().replace(/^\./, ''))
      : ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      onShowToast(
        t(
          `Unsupported format. Supported: ${validExtensions.map(e => e.toUpperCase()).join(', ')}`,
          `असमर्थित ढाँचा। समर्थित: ${validExtensions.map(e => e.toUpperCase()).join(', ')}`
        )
      );
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        if (!base64Data) {
          setIsUploading(false);
          return;
        }

        // Measure image dimensions
        const img = new Image();
        img.onload = () => {
          setImageMeta({
            width: img.naturalWidth,
            height: img.naturalHeight,
            sizeKB: Math.round(file.size / 1024)
          });
        };
        img.src = base64Data;

        // Server-side upload and verification via authoritative apiClient
        try {
          const uploadRes = await apiClient.uploadFile({
            fileName: file.name,
            fileType: file.type,
            base64Data,
            category: category || 'general'
          });
          if (uploadRes.success) {
            onImageChange(uploadRes.url || base64Data);
            onShowToast(t('Image uploaded and verified successfully!', 'तस्बिर सफलतापूर्वक अपलोड तथा प्रमाणित गरियो!'));
            setIsUploading(false);
            return;
          } else if (uploadRes.error) {
            onShowToast(uploadRes.error);
            setIsUploading(false);
            return;
          }
        } catch {
          // Fallback to client base64 if offline/preview
        }

        // Direct fallback
        onImageChange(base64Data);
        onShowToast(t('Image loaded successfully!', 'तस्बिर सफलतापूर्वक लोड गरियो!'));
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        onShowToast(t('Failed to read file from disk', 'फाइल पढ्न असफल भयो'));
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      onShowToast(t('Error uploading image', 'तस्बिर अपलोड गर्दा त्रुटि भयो'));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value to allow re-uploading same filename
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id={id} className="space-y-2">
      {/* Lightbox Modal */}
      {showPreviewModal && imageUrl && imageUrl.trim() && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col gap-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{label}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto flex items-center justify-center bg-black/40 rounded-lg p-2">
              <img src={imageUrl} alt={label} className="max-h-full max-w-full object-contain rounded" />
            </div>
            {imageMeta && (
              <div className="text-[11px] text-slate-400 text-center font-mono">
                {imageMeta.width} × {imageMeta.height} px • {imageMeta.sizeKB} KB
              </div>
            )}
          </div>
        </div>
      )}

      {/* Label and Helper Text */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
          {label}
        </label>
        {aspectRatioLabel && (
          <span className="text-[11px] text-slate-500 font-mono">
            {aspectRatioLabel}
          </span>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}

      {/* Compact Uploader Box */}
      {imageUrl && imageUrl.trim() ? (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Small Thumbnail Preview (~80-90px) */}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setShowPreviewModal(true);
                }
              }}
              className="relative w-20 h-16 sm:w-22 sm:h-18 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-900 group cursor-pointer shrink-0 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              onClick={() => setShowPreviewModal(true)}
              title={t('Click to enlarge preview', 'ठूलो तस्बिर हेर्न क्लिक गर्नुहोस्')}
            >
              <img
                src={imageUrl}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            {/* Metadata and Details */}
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">
                  {imageUrl.startsWith('data:')
                    ? t('Background Image Ready', 'पृष्ठभूमि तस्बिर तयार')
                    : imageUrl.split('/').pop() || 'background.jpg'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {imageMeta && imageMeta.width && imageMeta.height
                  ? `${imageMeta.width} × ${imageMeta.height} px • ${imageMeta.sizeKB} KB`
                  : t(`Active Background • ≤ ${maxSizeMB} MB`, `सक्रिय पृष्ठभूमि • ≤ ${maxSizeMB} MB`)}
              </p>
            </div>
          </div>

          {/* Action buttons: Replace, Remove */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title={t('Replace image', 'तस्बिर बदल्नुहोस्')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
              <span>{t('Replace', 'बदल्नुहोस्')}</span>
            </button>

            <button
              type="button"
              onClick={onImageRemove}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-medium text-red-600 dark:text-red-400 transition cursor-pointer"
              title={t('Remove image', 'हटाउनुहोस्')}
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('Remove', 'हटाउनुहोस्')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
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
              : 'border-slate-300 dark:border-slate-700 hover:border-[#1E40AF]/60 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Small icon thumbnail box */}
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {isUploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                {isUploading ? t('Uploading...', 'अपलोड हुँदैछ...') : t('Upload Background Image', 'पृष्ठभूमि तस्बिर अपलोड गर्नुहोस्')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {allowedFormats ? allowedFormats.map(f => f.toUpperCase()).join(' / ') : 'JPG / PNG'} • ≤ {maxSizeMB} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer pointer-events-none"
          >
            {isUploading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>{isUploading ? t('Uploading...', 'अपलोड हुँदै...') : t('Upload', 'अपलोड')}</span>
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
