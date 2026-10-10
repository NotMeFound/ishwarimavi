import React from 'react';

export type CmsStatusType =
  | 'published'
  | 'draft'
  | 'unpublished'
  | 'pinned'
  | 'active'
  | 'inactive';

interface CmsStatusBadgeProps {
  status: CmsStatusType | string;
  label?: string;
  className?: string;
}

export const CmsStatusBadge: React.FC<CmsStatusBadgeProps> = ({
  status,
  label,
  className = ''
}) => {
  const norm = (status || '').toLowerCase().trim();

  // Restrained semantic styles with high contrast and subtle borders
  let badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  let dotStyle = 'bg-slate-400 dark:bg-slate-500';
  let defaultLabel = status;

  switch (norm) {
    case 'published':
    case 'active':
      badgeStyle = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      dotStyle = 'bg-emerald-600 dark:bg-emerald-400';
      defaultLabel = norm === 'published' ? 'Published' : 'Active';
      break;

    case 'draft':
      badgeStyle = 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      dotStyle = 'bg-amber-500 dark:bg-amber-400';
      defaultLabel = 'Draft';
      break;

    case 'unpublished':
    case 'inactive':
      badgeStyle = 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      dotStyle = 'bg-slate-400 dark:bg-slate-500';
      defaultLabel = norm === 'unpublished' ? 'Unpublished' : 'Inactive';
      break;

    case 'pinned':
      badgeStyle = 'bg-blue-50 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-300 border-blue-200 dark:border-blue-800';
      dotStyle = 'bg-[#1E40AF] dark:bg-blue-400';
      defaultLabel = 'Pinned';
      break;

    default:
      badgeStyle = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      dotStyle = 'bg-slate-400';
      defaultLabel = status;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${badgeStyle} ${className} select-none whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} aria-hidden="true" />
      <span>{label || defaultLabel}</span>
    </span>
  );
};
