import React, { useEffect, useState } from 'react';
import { X, Loader2, AlertCircle, Eye, FileText, Check } from 'lucide-react';
import { IconActionButton } from '../../components/IconActionButton';

export interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
  onSave?: (e: React.FormEvent) => void;
  isSaving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  isDirty?: boolean;
  onSaveDraft?: (e: React.FormEvent) => void;
  onPreview?: () => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: IconComponent,
  children,
  footerActions,
  width = 'lg',
  onSave,
  isSaving = false,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
  isDirty = false,
  onSaveDraft,
  onPreview
}) => {
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);

  // Attempt to close safely
  const handleAttemptClose = () => {
    if (isDirty) {
      setShowDiscardPrompt(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardPrompt(false);
    onClose();
  };

  // ESC key listener to dismiss drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDiscardPrompt) {
          setShowDiscardPrompt(false);
        } else {
          handleAttemptClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showDiscardPrompt, isDirty]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setShowDiscardPrompt(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'w-full sm:max-w-md',
    lg: 'w-full sm:max-w-lg lg:max-w-xl',
    xl: 'w-full sm:max-w-xl lg:max-w-2xl'
  }[width];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={handleAttemptClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className={`relative ${widthClasses} bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 animate-in slide-in-from-right duration-250 ease-out`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {IconComponent && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 flex items-center justify-center text-[#1E40AF] dark:text-blue-400 shrink-0">
                <IconComponent className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <IconActionButton
            action="close"
            size="sm"
            onClick={handleAttemptClose}
            tooltip="Close drawer (Esc)"
            aria-label="Close drawer"
          />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {children}
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 z-10 px-5 py-3.5 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0 shadow-xs">
          <div className="flex items-center gap-2">
            {onSaveDraft && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Save Draft</span>
              </button>
            )}
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Preview</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {footerActions ? (
              footerActions
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  disabled={isSaving}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                {onSave && (
                  <button
                    type="button"
                    onClick={onSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{saveLabel}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      {showDiscardPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Unsaved Changes
              </h4>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              You have unsaved changes in this form. If you close now, your edits will be discarded.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardPrompt(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              >
                Stay
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-xs transition cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
