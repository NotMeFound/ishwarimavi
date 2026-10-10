import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface ImageMeta {
  name: string;
  sizeKb: number;
  type: string;
}

export interface CmsImageUploaderProps {
  label?: string;
  required?: boolean;
  value?: string;
  onChange: (imageUrl: string, meta?: ImageMeta) => void;
  onRemove?: () => void;
  maxSizeMb?: number;
  aspectRatio?: 'square' | 'avatar' | 'wide' | 'banner';
  meta?: ImageMeta;
  disabled?: boolean;
  className?: string;
}

export const CmsImageUploader: React.FC<CmsImageUploaderProps> = ({
  label = 'Profile Image',
  required = false,
  value,
  onChange,
  onRemove,
  maxSizeMb = 2,
  aspectRatio = 'square',
  meta,
  disabled = false,
  className = ''
}) => {
  const [error, setError] = useState<string>('');
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);
  const [fileDetails, setFileDetails] = useState<ImageMeta | null>(() => {
    if (meta) return meta;
    if (value) {
      return {
        name: 'image_asset.jpg',
        sizeKb: 180,
        type: 'image/jpeg'
      };
    }
    return null;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError('');

    // Check MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, JPEG, PNG, or WebP).');
      return;
    }

    // Check size limit
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image size exceeds the maximum allowed limit of ${maxSizeMb}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageLoadFailed(false);
      const newMeta: ImageMeta = {
        name: file.name,
        sizeKb: Math.round(file.size / 1024),
        type: file.type
      };
      setFileDetails(newMeta);
      onChange(result, newMeta);
    };
    reader.onerror = () => {
      setError('Failed to read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    setError('');
    setImageLoadFailed(false);
    setFileDetails(null);
    onChange('', undefined);
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewDimensions = () => {
    switch (aspectRatio) {
      case 'avatar':
        return 'w-24 h-24 sm:w-28 sm:h-28 rounded-xl';
      case 'wide':
        return 'w-full max-w-sm h-36 rounded-xl';
      case 'banner':
        return 'w-full h-44 rounded-xl';
      case 'square':
      default:
        return 'w-32 h-32 sm:w-36 sm:h-36 rounded-xl';
    }
  };

  const hasImage = Boolean(value && value.trim());

  return (
    <div className={`space-y-2 text-xs ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[11px] text-slate-400">
            JPG, JPEG or PNG (Max: {maxSizeMb}MB)
          </span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Inline Validation Error */}
      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {hasImage ? (
        /* Image Preview & Details Card */
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Image Preview Box */}
            <div
              className={`relative overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 ${previewDimensions()}`}
            >
              {!imageLoadFailed ? (
                <img
                  src={value}
                  alt={label}
                  onError={() => setImageLoadFailed(true)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400">
                  <ImageIcon className="w-6 h-6 mb-1 text-slate-400" />
                  <span className="text-[10px]">Preview unavailable</span>
                </div>
              )}
            </div>

            {/* Metadata & Actions */}
            <div className="flex-1 space-y-2 min-w-0">
              {fileDetails && (
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {fileDetails.name}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{fileDetails.sizeKb > 0 ? `${fileDetails.sizeKb} KB` : 'Image file'}</span>
                    <span>•</span>
                    <span className="uppercase">{fileDetails.type.replace('image/', '')}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Replace & Remove */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Replace</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E40AF] dark:hover:border-blue-500 rounded-xl p-5 text-center transition bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            Upload Image
          </button>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            JPG, JPEG or PNG • Maximum size: {maxSizeMb}MB
          </p>
        </div>
      )}
    </div>
  );
};
