import React from 'react';
import { Search } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface AdminCrudToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  filterOptions?: FilterOption[];
  totalCount?: number;
  filteredCount?: number;
  rightElement?: React.ReactNode;
}

export const AdminCrudToolbar: React.FC<AdminCrudToolbarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusValue,
  onStatusChange,
  statusOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder = 'Filter',
  filterOptions,
  totalCount,
  filteredCount,
  rightElement
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 py-2.5 px-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
        {/* Search input */}
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>

        {/* Status Filter */}
        {statusOptions && onStatusChange && (
          <div className="shrink-0">
            <select
              value={statusValue || ''}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Secondary Filter (Type / Category / Level) */}
        {filterOptions && onFilterChange && (
          <div className="shrink-0">
            <select
              value={filterValue || ''}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Element or Count */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {totalCount !== undefined && (
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            {filteredCount !== undefined && filteredCount !== totalCount
              ? `${filteredCount} of ${totalCount}`
              : `${totalCount} records`}
          </span>
        )}
        {rightElement}
      </div>
    </div>
  );
};
