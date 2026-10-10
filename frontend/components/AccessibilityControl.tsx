import React, { useState, useEffect, useRef } from 'react';
import { safeStorage } from '../utils/storage';
import { Type, Check } from 'lucide-react';

export type TextSizeOption = 'sm' | 'normal' | 'lg';
export type ContrastOption = 'normal' | 'high';
export type MotionOption = 'normal' | 'reduced';

interface AccessibilityControlProps {
  isNp?: boolean;
}

export const AccessibilityControl: React.FC<AccessibilityControlProps> = ({ isNp = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [textSize, setTextSize] = useState<TextSizeOption>(() => {
    return (safeStorage.getItem('ishwari_a11y_text_size') as TextSizeOption) || 'normal';
  });

  const [contrast, setContrast] = useState<ContrastOption>(() => {
    return (safeStorage.getItem('ishwari_a11y_contrast') as ContrastOption) || 'normal';
  });

  const [motion, setMotion] = useState<MotionOption>(() => {
    return (safeStorage.getItem('ishwari_a11y_motion') as MotionOption) || 'normal';
  });

  // Apply to documentElement
  useEffect(() => {
    safeStorage.setItem('ishwari_a11y_text_size', textSize);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('text-size-sm', 'text-size-lg');
      if (textSize === 'sm') root.classList.add('text-size-sm');
      if (textSize === 'lg') root.classList.add('text-size-lg');
    }
  }, [textSize]);

  useEffect(() => {
    safeStorage.setItem('ishwari_a11y_contrast', contrast);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (contrast === 'high') {
        root.classList.add('high-contrast');
      } else {
        root.classList.remove('high-contrast');
      }
    }
  }, [contrast]);

  useEffect(() => {
    safeStorage.setItem('ishwari_a11y_motion', motion);
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (motion === 'reduced') {
        root.classList.add('reduce-motion');
      } else {
        root.classList.remove('reduce-motion');
      }
    }
  }, [motion]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Compact Aa Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('Accessibility settings', 'पहुँचयोग्यता सेटिङ')}
        aria-expanded={isOpen}
        className={`inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
          isOpen || textSize !== 'normal' || contrast !== 'normal' || motion !== 'normal'
            ? 'border-[#1E40AF] bg-blue-50/70 text-[#1E40AF] dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
        }`}
        title={t('Accessibility (Text Size, Contrast, Motion)', 'पहुँचयोग्यता (अक्षरको साइज, कन्ट्रास्ट, मोशन)')}
      >
        <span className="font-serif tracking-tight text-xs">Aa</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{t('Accessibility', 'पहुँचयोग्यता')}</span>
              <span className="text-[10px] text-slate-400 font-mono">Options</span>
            </h4>
          </div>

          {/* Text Size: A-, A, A+ */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
              {t('Text Size', 'अक्षरको आकार')}
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTextSize('sm')}
                className={`py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                  textSize === 'sm'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Smaller text"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setTextSize('normal')}
                className={`py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                  textSize === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Default text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setTextSize('lg')}
                className={`py-1 rounded text-center font-bold text-xs transition cursor-pointer ${
                  textSize === 'lg'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Larger text"
              >
                A+
              </button>
            </div>
          </div>

          {/* Contrast: Normal, High */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
              {t('Contrast', 'रंग कन्ट्रास्ट')}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setContrast('normal')}
                className={`py-1 rounded text-center font-semibold text-[11px] transition cursor-pointer ${
                  contrast === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('Normal', 'सामान्य')}
              </button>
              <button
                type="button"
                onClick={() => setContrast('high')}
                className={`py-1 rounded text-center font-semibold text-[11px] transition cursor-pointer ${
                  contrast === 'high'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('High Contrast', 'उच्च कन्ट्रास्ट')}
              </button>
            </div>
          </div>

          {/* Motion: Normal, Reduced */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
              {t('Animation Motion', 'एनिमेसन गति')}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMotion('normal')}
                className={`py-1 rounded text-center font-semibold text-[11px] transition cursor-pointer ${
                  motion === 'normal'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('Normal', 'सामान्य')}
              </button>
              <button
                type="button"
                onClick={() => setMotion('reduced')}
                className={`py-1 rounded text-center font-semibold text-[11px] transition cursor-pointer ${
                  motion === 'reduced'
                    ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {t('Reduced', 'कम चाल')}
              </button>
            </div>
          </div>

          {/* Reset Action */}
          {(textSize !== 'normal' || contrast !== 'normal' || motion !== 'normal') && (
            <button
              type="button"
              onClick={() => {
                setTextSize('normal');
                setContrast('normal');
                setMotion('normal');
              }}
              className="w-full text-center text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline pt-1 cursor-pointer"
            >
              {t('Reset to default', 'पूर्वनिर्धारितमा फर्काउनुहोस्')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
