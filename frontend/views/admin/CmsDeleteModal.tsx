import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { IconActionButton } from '../../components/IconActionButton';

export interface CmsDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string; // e.g. "Delete Chairman?" or "Delete SMC Member?"
  description?: string; // default: "This action cannot be undone."
  consequence?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  isLoading?: boolean;
  iconOnlyActions?: boolean;
}

export const CmsDeleteModal: React.FC<CmsDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'This action cannot be undone.',
  consequence,
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  isLoading = false,
  iconOnlyActions = false
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 relative"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 id="delete-dialog-title" className="text-sm font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
              {consequence && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium pt-1">
                  {consequence}
                </p>
              )}
            </div>
          </div>
          <IconActionButton
            action="close"
            appearance="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            tooltip={cancelLabel}
            aria-label={cancelLabel}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {iconOnlyActions ? (
            <>
              <IconActionButton
                action="cancel"
                onClick={onClose}
                disabled={isLoading}
                tooltip={cancelLabel}
                aria-label={cancelLabel}
              />
              <IconActionButton
                action="delete"
                onClick={onConfirm}
                disabled={isLoading}
                tooltip={deleteLabel}
                aria-label={deleteLabel}
              />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLoading ? 'Deleting...' : deleteLabel}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
