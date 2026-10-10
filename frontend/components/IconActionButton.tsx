import React from 'react';
import {
  Eye,
  Download,
  X,
  Trash2,
  Edit3,
  Plus,
  MapPin,
  Phone,
  Mail,
  LucideIcon
} from 'lucide-react';

export type ActionVariant =
  | 'view'
  | 'preview'
  | 'download'
  | 'close'
  | 'cancel'
  | 'clear'
  | 'edit'
  | 'delete'
  | 'add'
  | 'custom'
  | 'location'
  | 'phone'
  | 'email';

export type ActionSize = 'sm' | 'md' | 'lg';
export type ActionAppearance = 'subtle' | 'ghost';

export interface IconActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  action?: ActionVariant;
  icon?: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }>;
  size?: ActionSize;
  appearance?: ActionAppearance;
  label?: string;
  tooltip?: string;
  href?: string;
  download?: string | boolean;
  target?: string;
  rel?: string;
  children?: React.ReactNode;
}

const DEFAULT_ICONS: Record<ActionVariant, LucideIcon> = {
  view: Eye,
  preview: Eye,
  download: Download,
  close: X,
  cancel: X,
  clear: X,
  edit: Edit3,
  delete: Trash2,
  add: Plus,
  custom: Eye,
  location: MapPin,
  phone: Phone,
  email: Mail
};

const ACTION_LABELS: Record<ActionVariant, string> = {
  view: 'View',
  preview: 'Preview',
  download: 'Download',
  close: 'Close',
  cancel: 'Cancel',
  clear: 'Clear',
  edit: 'Edit',
  delete: 'Delete',
  add: 'Add',
  custom: 'Action',
  location: 'Open Location',
  phone: 'Call Phone',
  email: 'Send Email'
};

const INTERACTION_STYLES: Record<ActionVariant, string> = {
  view: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  preview: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  download: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  close: 'hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-red-200/80 active:bg-red-100 active:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-400 dark:hover:border-red-900/60 dark:active:bg-red-900/70 dark:active:text-red-300 focus-visible:ring-red-400/50',
  cancel: 'hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 active:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:hover:border-slate-600 focus-visible:ring-slate-400/50',
  clear: 'hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300 active:bg-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:hover:border-slate-600 focus-visible:ring-slate-400/50',
  edit: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  delete: 'hover:bg-[#FEF2F2] hover:text-[#DC2626] hover:border-red-200/80 active:bg-red-100 active:text-red-700 dark:hover:bg-red-950/60 dark:hover:text-red-400 dark:hover:border-red-900/60 dark:active:bg-red-900/70 dark:active:text-red-300 focus-visible:ring-red-400/50',
  add: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  custom: 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:border-slate-600 active:bg-slate-200 dark:active:bg-slate-700 focus-visible:ring-slate-400/50',
  location: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  phone: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50',
  email: 'hover:bg-[#EFF6FF] hover:text-[#1E40AF] hover:border-blue-200/80 active:bg-blue-100 active:text-blue-800 dark:hover:bg-blue-950/60 dark:hover:text-blue-400 dark:hover:border-blue-900/60 dark:active:bg-blue-900/70 dark:active:text-blue-300 focus-visible:ring-blue-400/50'
};

const SIZE_STYLES: Record<ActionSize, { container: string; icon: string }> = {
  sm: {
    container: 'w-9 h-9 min-w-[36px] min-h-[36px] rounded-lg',
    icon: 'w-3.5 h-3.5'
  },
  md: {
    container: 'w-10 h-10 min-w-[40px] min-h-[40px] rounded-xl',
    icon: 'w-4 h-4 sm:w-4.5 sm:h-4.5'
  },
  lg: {
    container: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl',
    icon: 'w-5 h-5'
  }
};

export const IconActionButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  IconActionButtonProps
>(({
  action = 'custom',
  icon: ExplicitIcon,
  size = 'md',
  appearance = 'subtle',
  label,
  tooltip,
  href,
  download,
  target,
  rel,
  className = '',
  disabled = false,
  type = 'button',
  children,
  ...restProps
}, ref) => {
  const IconComponent = ExplicitIcon || DEFAULT_ICONS[action] || Eye;
  const effectiveLabel = label || tooltip || (action ? ACTION_LABELS[action] : 'Action');
  const effectiveTitle = tooltip || label || (action ? ACTION_LABELS[action] : undefined);
  const sizeConfig = SIZE_STYLES[size];

  const baseClasses = [
    'inline-flex items-center justify-center shrink-0 cursor-pointer select-none touch-manipulation',
    'transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900',
    'active:scale-[0.98]',
    'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
    sizeConfig.container,
    appearance === 'subtle'
      ? 'border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 shadow-2xs'
      : 'border border-transparent bg-transparent text-slate-500 dark:text-slate-400',
    INTERACTION_STYLES[action],
    className
  ].filter(Boolean).join(' ');

  const iconElement = children || (
    <IconComponent
      className={`${sizeConfig.icon} stroke-[2] shrink-0 pointer-events-none`}
      strokeWidth={2}
      aria-hidden="true"
    />
  );

  if (href && !disabled) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        download={download}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : rel}
        title={effectiveTitle}
        aria-label={effectiveLabel}
        className={baseClasses}
      >
        {iconElement}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      title={effectiveTitle}
      aria-label={effectiveLabel}
      className={baseClasses}
      {...restProps}
    >
      {iconElement}
    </button>
  );
});

IconActionButton.displayName = 'IconActionButton';
export default IconActionButton;
