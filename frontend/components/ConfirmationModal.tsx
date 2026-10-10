import React, { useEffect } from 'react';
import {
  Trash2,
  PlusCircle,
  Save,
  Download,
  AlertTriangle,
  HelpCircle,
  X,
  Check
} from 'lucide-react';
import { IconActionButton } from './IconActionButton';

export type ConfirmationVariant = 'create' | 'update' | 'delete' | 'download' | 'reset' | 'warning' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  iconOnlyActions?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  isLoading = false,
  iconOnlyActions = false
}) => {
  // ESC key listener to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'delete':
        return {
          icon: <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-950/60 border-red-200 dark:border-red-900',
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-600/20',
          borderAccent: 'border-red-200 dark:border-red-900/40'
        };
      case 'create':
        return {
          icon: <PlusCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-emerald-600/20',
          borderAccent: 'border-emerald-200 dark:border-emerald-900/40'
        };
      case 'update':
        return {
          icon: <Save className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
          confirmBtn: 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white focus:ring-[#1E40AF] shadow-blue-600/20',
          borderAccent: 'border-blue-200 dark:border-blue-900/40'
        };
      case 'download':
        return {
          icon: <Download className="w-5 h-5 text-[#1E40AF] dark:text-blue-400" />,
          iconBg: 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
          confirmBtn: 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white focus:ring-[#1E40AF] shadow-blue-600/20',
          borderAccent: 'border-blue-200 dark:border-blue-900/40'
        };
      case 'reset':
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-amber-600/20',
          borderAccent: 'border-amber-200 dark:border-amber-900/40'
        };
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />,
          iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
          confirmBtn: 'bg-slate-900 hover:bg-slate-800 text-white focus:ring-slate-500 shadow-slate-900/20',
          borderAccent: 'border-slate-200 dark:border-slate-800'
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border ${style.borderAccent} overflow-hidden transform animate-in zoom-in-95 duration-150`}
      >
        {/* Modal Header & Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${style.iconBg}`}
            >
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {title}
                </h3>
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={onClose}
                  tooltip="Close modal"
                  aria-label="Close modal"
                />
              </div>

              {description && (
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Target Item Callout */}
          {itemName && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                Target Record:
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 break-words">
                {itemName}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          {iconOnlyActions ? (
            <>
              <IconActionButton
                action="cancel"
                onClick={onClose}
                disabled={isLoading}
                tooltip={cancelText}
                aria-label={cancelText}
              />
              <IconActionButton
                action={variant === 'download' ? 'download' : variant === 'delete' ? 'delete' : 'custom'}
                icon={variant === 'download' ? Download : (variant === 'delete' ? Trash2 : Check)}
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                disabled={isLoading}
                tooltip={confirmText}
                aria-label={confirmText}
              />
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${style.confirmBtn}`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
