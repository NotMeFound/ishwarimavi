import React, { useEffect } from 'react';
import { X, Edit3, User, Image as ImageIcon } from 'lucide-react';
import { IconActionButton } from '../../components/IconActionButton';

export interface ViewDetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export interface CmsItemViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: 'published' | 'draft' | 'active' | 'archived' | 'neutral' };
  photo?: string;
  photoAlt?: string;
  fields: ViewDetailField[];
  editLabel?: string;
  closeLabel?: string;
}

export const CmsItemViewModal: React.FC<CmsItemViewModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  title,
  subtitle,
  badge,
  photo,
  photoAlt = 'Profile photo',
  fields,
  editLabel = 'Edit',
  closeLabel = 'Close'
}) => {
  const [photoError, setPhotoError] = React.useState(false);

  useEffect(() => {
    setPhotoError(false);
  }, [photo]);

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

  const getBadgeStyle = () => {
    switch (badge?.variant) {
      case 'published':
      case 'active':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'draft':
      case 'archived':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 id="view-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getBadgeStyle()}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <IconActionButton
            action="close"
            appearance="ghost"
            size="sm"
            onClick={onClose}
            tooltip={closeLabel}
            aria-label={closeLabel}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Photo Section */}
          {Boolean(photo && photo.trim()) && (
            <div className="flex justify-center pb-1">
              <div className="w-28 h-28 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shadow-xs">
                {!photoError ? (
                  <img
                    src={photo}
                    alt={photoAlt}
                    onError={() => setPhotoError(true)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fields List with Clean Labels and Values */}
          <div className="space-y-3.5">
            {fields.map((f, i) => (
              <div key={i} className="space-y-1">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {f.label}
                </span>
                <div className="text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 leading-relaxed break-words whitespace-pre-line">
                  {f.value || <span className="text-slate-400 italic">Not provided</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions: Edit and Close */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{editLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
