import React from 'react';
import { Language } from '../types';

interface PageLoadingSkeletonProps {
  lang: Language;
  variant: 'admin' | 'home' | 'content';
}

export const PageLoadingSkeleton: React.FC<PageLoadingSkeletonProps> = ({ lang, variant }) => {
  const label = lang === 'np' ? 'पृष्ठ लोड हुँदैछ' : 'Loading page';
  const cardCount = variant === 'admin' ? 4 : variant === 'home' ? 3 : 2;

  return (
    <div
      className="mx-auto min-h-[55vh] max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8"
      role="status"
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="h-8 w-2/3 max-w-lg rounded bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
        <div className="h-4 w-full max-w-2xl rounded bg-slate-100 dark:bg-slate-900 motion-safe:animate-pulse motion-reduce:animate-none" />
      </div>
      <div className={`grid gap-5 ${variant === 'admin' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`} aria-hidden="true">
        {Array.from({ length: cardCount }, (_, index) => (
          <div key={index} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-32 rounded-lg bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
            <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
            <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800 motion-safe:animate-pulse motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
};
