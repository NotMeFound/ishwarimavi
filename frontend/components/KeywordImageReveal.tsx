import React, { useState } from 'react';
import { BookOpen, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import { useReducedMotion } from 'motion/react';

export type KeywordConcept = 'education' | 'excellence' | 'character' | 'achievement';

interface KeywordImageRevealProps {
  concept: KeywordConcept;
  children: React.ReactNode;
  className?: string;
}

export const KeywordImageReveal: React.FC<KeywordImageRevealProps> = ({
  concept,
  children,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Concept-specific subtle watermark motifs
  const getConceptVisual = () => {
    switch (concept) {
      case 'education':
        return (
          <div className="flex items-center gap-1 opacity-20 dark:opacity-25 text-blue-400">
            <BookOpen className="w-12 h-12 stroke-[1.2]" />
          </div>
        );
      case 'excellence':
        return (
          <div className="flex items-center gap-1 opacity-20 dark:opacity-25 text-amber-400">
            <GraduationCap className="w-12 h-12 stroke-[1.2]" />
          </div>
        );
      case 'character':
        return (
          <div className="flex items-center gap-1 opacity-20 dark:opacity-25 text-emerald-400">
            <ShieldCheck className="w-12 h-12 stroke-[1.2]" />
          </div>
        );
      case 'achievement':
        return (
          <div className="flex items-center gap-1 opacity-20 dark:opacity-25 text-amber-500">
            <Award className="w-12 h-12 stroke-[1.2]" />
          </div>
        );
    }
  };

  return (
    <span
      className={`relative inline-block group cursor-default ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      {/* Background Watermark/Image Reveal - low opacity, never covers text */}
      {!shouldReduceMotion && (
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out z-0 select-none ${
            isHovered
              ? 'opacity-100 scale-105'
              : 'opacity-0 scale-95'
          }`}
        >
          {getConceptVisual()}
        </span>
      )}

      {/* Foreground text - 100% readable and in front */}
      <span className="relative z-10">{children}</span>
    </span>
  );
};
