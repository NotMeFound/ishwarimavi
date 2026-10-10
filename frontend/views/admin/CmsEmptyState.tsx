import React from 'react';
import { Plus } from 'lucide-react';

interface CmsEmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
}

export const CmsEmptyState: React.FC<CmsEmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon,
  className = ''
}) => {
  return (
    <div
      className={`p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center max-w-lg mx-auto my-6 space-y-3 ${className}`}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </div>
      )}

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer mt-2"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
