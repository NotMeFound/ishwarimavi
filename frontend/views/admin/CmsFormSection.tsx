import React from 'react';

interface CmsFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const CmsFormSection: React.FC<CmsFormSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-3 pt-4 first:pt-0 ${className}`}>
      <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
          {title}
        </h4>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="pt-1">
        {children}
      </div>
    </div>
  );
};
