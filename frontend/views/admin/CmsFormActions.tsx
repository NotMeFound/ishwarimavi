import React from 'react';
import { Loader2 } from 'lucide-react';

export interface CmsFormActionsProps {
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'create' | 'edit' | 'upload' | 'custom';
  saveLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const CmsFormActions: React.FC<CmsFormActionsProps> = ({
  onCancel,
  isLoading = false,
  type = 'edit',
  saveLabel,
  cancelLabel = 'Cancel',
  loadingLabel,
  disabled = false,
  className = ''
}) => {
  // Determine standard default labels based on user specifications
  const getDefaultSaveLabel = () => {
    switch (type) {
      case 'create':
        return 'Create';
      case 'upload':
        return 'Upload Document';
      case 'edit':
      default:
        return 'Save Changes';
    }
  };

  const getDefaultLoadingLabel = () => {
    switch (type) {
      case 'create':
        return 'Creating...';
      case 'upload':
        return 'Uploading...';
      case 'edit':
      default:
        return 'Saving...';
    }
  };

  const effectiveSaveLabel = saveLabel || getDefaultSaveLabel();
  const effectiveLoadingLabel = loadingLabel || getDefaultLoadingLabel();

  return (
    <div className={`flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 ${className}`}>
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {cancelLabel}
      </button>

      <button
        type="submit"
        disabled={isLoading || disabled}
        className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>{isLoading ? effectiveLoadingLabel : effectiveSaveLabel}</span>
      </button>
    </div>
  );
};
