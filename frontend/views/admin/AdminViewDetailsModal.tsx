import React from 'react';
import { IconActionButton } from '../../components/IconActionButton';

interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface AdminViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: { label: string; variant?: 'success' | 'warning' | 'info' | 'neutral' };
  fields: DetailField[];
  image?: string;
  actions?: React.ReactNode;
}

export const AdminViewDetailsModal: React.FC<AdminViewDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  fields,
  image,
  actions
}) => {
  if (!isOpen) return null;

  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {title}
              </h3>
              {badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeStyles[badge.variant || 'neutral']}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
          <IconActionButton
            action="close"
            appearance="ghost"
            size="sm"
            onClick={onClose}
            tooltip="Close"
            aria-label="Close"
          />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {Boolean(image && image.trim()) && (
            <div className="flex justify-center pb-2">
              <img
                src={image}
                alt={title}
                className="w-28 h-28 object-cover rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f, i) => (
              <div key={i} className={f.fullWidth ? 'sm:col-span-2' : ''}>
                <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  {f.label}
                </span>
                <div className="text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  {f.value || <span className="text-slate-400 italic">None</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
