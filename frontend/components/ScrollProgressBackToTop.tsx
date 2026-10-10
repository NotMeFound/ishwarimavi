import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

interface ScrollProgressBackToTopProps {
  threshold?: number;
  className?: string;
  lang?: 'en' | 'np';
}

export const ScrollProgressBackToTop: React.FC<ScrollProgressBackToTopProps> = ({
  threshold = 280,
  className = '',
  lang = 'en',
}) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const handleScroll = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight > 0) {
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }

    setIsVisible(scrollTop > threshold);
  }, [threshold]);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
    });
  };

  const percentage = Math.round(scrollProgress * 100);
  const isNp = lang === 'np';
  const label = isNp
    ? `माथि जानुहोस् (${percentage}%)`
    : `Scroll to top (${percentage}%)`;

  // SVG Circle geometry
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  if (!isVisible) return null;

  return (
    <button
      id="scroll-progress-back-to-top"
      type="button"
      onClick={scrollToTop}
      title={label}
      aria-label={label}
      className={`fixed bottom-6 right-6 z-40 group flex items-center justify-center w-11 h-11 rounded-full bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-400 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-amber-400/60 ${className}`}
    >
      {/* Background & Progress SVG ring */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-0.5"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        {/* Subtle background track */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-slate-200 dark:text-slate-800"
        />
        {/* Animated dynamic progress indicator with institutional amber accent */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-150 ease-out"
        />
      </svg>

      {/* Up Arrow Icon */}
      <ArrowUp
        className="w-4 h-4 stroke-[2.2] text-slate-700 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-150"
      />

      {/* Subtle Accessible Percentage Badge (reveals on hover on desktop) */}
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="absolute -top-7 right-1/2 translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap"
      >
        {percentage}%
      </span>
    </button>
  );
};
