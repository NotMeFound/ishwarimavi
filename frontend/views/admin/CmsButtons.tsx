import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isLoading?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-semibold rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-2xs transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2.2} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  icon: Icon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-1.5 min-h-[40px] px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${className}`}
    >
      {isLoading ? (
        <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-slate-700 dark:border-t-slate-200 rounded-full animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={2} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export { IconActionButton, type IconActionButtonProps, type ActionVariant } from '../../components/IconActionButton';

