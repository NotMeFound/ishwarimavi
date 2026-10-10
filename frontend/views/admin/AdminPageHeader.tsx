import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface AdminPageHeaderTab {
  id: string;
  label: string;
  count?: number;
}

export interface AdminPageHeaderAction {
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface AdminPageHeaderProps {
  breadcrumbs: { label: string; onClick?: () => void }[];
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  actions?: AdminPageHeaderAction[];
  tabs?: AdminPageHeaderTab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  breadcrumbs,
  title,
  subtitle,
  icon: Icon,
  actions,
  tabs,
  activeTabId,
  onTabChange
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 mb-6 px-4 sm:px-6 lg:px-8 pt-4 pb-0">
      {/* Breadcrumb Trail - subtle & compact */}
      {breadcrumbs && breadcrumbs.length > 1 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition cursor-pointer font-medium"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-slate-800 dark:text-slate-200' : ''}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title & Action Row: Consistent Standard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0" strokeWidth={1.8} />
            )}
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-3xl leading-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Primary and secondary actions */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {actions.map((act, i) => {
              const ActionIcon = act.icon;
              if (act.variant === 'secondary') {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={act.onClick}
                    disabled={act.disabled}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer disabled:opacity-50"
                  >
                    {ActionIcon && <ActionIcon className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{act.label}</span>
                  </button>
                );
              }
              if (act.variant === 'danger') {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={act.onClick}
                    disabled={act.disabled}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                  >
                    {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                    <span>{act.label}</span>
                  </button>
                );
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={act.onClick}
                  disabled={act.disabled}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sub-Tabs Row (if provided) */}
      {tabs && tabs.length > 0 && onTabChange && (
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 dark:border-slate-800 -mb-px pt-0.5 custom-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-[#1E40AF] text-[#1E40AF] dark:text-blue-400 dark:border-blue-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive
                      ? 'bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 font-bold'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
