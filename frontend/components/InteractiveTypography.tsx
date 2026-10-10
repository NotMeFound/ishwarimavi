import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Unicode-safe grapheme segmenter for Nepali (Devanagari conjuncts & matras) and English.
 * Guarantees combined characters like 'त्कृ', 'ष्ट', 'श्री', 'ई' are never fragmented.
 */
export function getGraphemeSegments(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    try {
      const segmenter = new (Intl as any).Segmenter(undefined, { granularity: 'grapheme' });
      return Array.from(segmenter.segment(text), (s: any) => s.segment);
    } catch {
      return Array.from(text);
    }
  }
  return Array.from(text);
}

/**
 * Color utility: parse hex color into [r, g, b]
 */
export function parseHexToRgb(hex: string, fallback: [number, number, number] = [245, 158, 11]): [number, number, number] {
  if (!hex || typeof hex !== 'string') return fallback;
  if (hex.startsWith('#')) {
    const clean = hex.replace('#', '');
    const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
    if (isNaN(num)) return fallback;
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
  return fallback;
}

/**
 * Color utility: parse computed CSS rgb/rgba into [r, g, b]
 */
export function parseComputedColor(computed: string, fallback: [number, number, number] = [255, 255, 255]): [number, number, number] {
  if (!computed) return fallback;
  const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return fallback;
}

export interface ProximityCharItem {
  x: number;
  y: number;
  el: HTMLElement;
}

/**
 * Core proximity calculation:
 * - Distance <= maxRadius triggers response.
 * - Closest letters receive strongest orange (#F59E0B), subtle upward lift (-2px to -5px), and subtle scale (1.00 -> 1.038).
 * - Reaction decays smoothly with distance.
 * - CSS transition provides fluid magnetic feel without abrupt snapping.
 */
export function applyProximityToLetters(
  clientX: number,
  clientY: number,
  chars: ProximityCharItem[],
  baseRgb: [number, number, number],
  targetRgb: [number, number, number] = [245, 158, 11],
  maxRadius: number = 72,
  maxLift: number = 4.5,
  maxScale: number = 0.038
) {
  for (let i = 0; i < chars.length; i++) {
    const item = chars[i];
    if (!item.el) continue;
    const dx = clientX - item.x;
    const dy = clientY - item.y;
    const dist = Math.hypot(dx, dy);

    if (dist < maxRadius) {
      const ratio = 1 - dist / maxRadius;
      // Exponential decay: concentrated peak near pointer, smooth dropoff towards perimeter
      const influence = Math.pow(ratio, 1.35);

      if (influence > 0.025) {
        const r = Math.round(baseRgb[0] + (targetRgb[0] - baseRgb[0]) * influence);
        const g = Math.round(baseRgb[1] + (targetRgb[1] - baseRgb[1]) * influence);
        const b = Math.round(baseRgb[2] + (targetRgb[2] - baseRgb[2]) * influence);
        item.el.style.color = `rgb(${r}, ${g}, ${b})`;

        const lift = -influence * maxLift;
        const scale = 1 + influence * maxScale;
        item.el.style.transform = `translateY(${lift.toFixed(2)}px) scale(${scale.toFixed(3)})`;
      } else {
        if (item.el.style.color) item.el.style.color = '';
        if (item.el.style.transform) item.el.style.transform = '';
      }
    } else {
      if (item.el.style.color) item.el.style.color = '';
      if (item.el.style.transform) item.el.style.transform = '';
    }
  }
}

/**
 * Resets all letters to normal appearance.
 * CSS transition handles the smooth return animation.
 */
export function resetProximityLetters(chars: Array<HTMLElement | null>) {
  for (let i = 0; i < chars.length; i++) {
    const el = chars[i];
    if (el) {
      if (el.style.color) el.style.color = '';
      if (el.style.transform) el.style.transform = '';
    }
  }
}

/**
 * 1. HERO TYPOGRAPHY: Staggered Word Reveal with Interactive Letter Proximity
 * Smooth upward movement (translateY 20px -> 0) + opacity (0 -> 1) on load.
 * Once entrance completes, activates pointer proximity interaction:
 * - Letters near cursor turn elegant orange (#F59E0B)
 * - Subtle upward magnetic lift (-2px to -5px) and subtle scale (1.00 -> 1.038)
 * - Fluidly follows pointer movement
 * - Smoothly glides back on pointer leave
 * - Mobile touch drag support without interfering with vertical scroll
 */
export interface StaggeredHeroHeadingProps {
  text: string;
  className?: string;
  delay?: number;
  interactiveIllumination?: boolean;
  highlightHex?: string;
  radius?: number;
  maxLift?: number;
  maxScale?: number;
}

export const StaggeredHeroHeading: React.FC<StaggeredHeroHeadingProps> = ({
  text,
  className = '',
  delay = 0.05,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={`inline-block select-text ${className}`}>{text}</span>;
  }

  return (
    <motion.span
      className={`inline-block select-text ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {text}
    </motion.span>
  );
};

/**
 * 2. SECTION HEADING REVEALS: Scroll-triggered subtle reveal
 * Opacity 0 -> 1, translateY 12-20px -> 0, subtle blur 2-3px -> 0px
 * Duration ~600-650ms within the institutional window.
 */
interface ScrollRevealHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  subtleBlur?: boolean;
  delay?: number;
}

export const ScrollRevealHeading: React.FC<ScrollRevealHeadingProps> = ({
  children,
  className = '',
  as = 'h2',
  subtleBlur = true,
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  if (shouldReduceMotion) {
    const Fallback = as;
    return <Fallback className={className}>{children}</Fallback>;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const animY = isMobile ? 10 : 18;

  return (
    <Component
      initial={{
        opacity: 0,
        y: animY,
        filter: subtleBlur ? (isMobile ? 'blur(2px)' : 'blur(3px)') : 'blur(0px)',
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

/**
 * 3. PREMIUM BLUR -> SHARP TYPOGRAPHY
 * For selected major institutional statements (tagline, mission statement, principal quote).
 * filter: blur(8px), opacity: 0 -> filter: blur(0px), opacity: 1.
 */
interface BlurSharpStatementProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'blockquote' | 'h3';
  delay?: number;
}

export const BlurSharpStatement: React.FC<BlurSharpStatementProps> = ({
  children,
  className = '',
  as = 'p',
  delay = 0.08,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const Component = motion[as];

  if (shouldReduceMotion) {
    const Fallback = as;
    return <Fallback className={className}>{children}</Fallback>;
  }

  return (
    <Component
      initial={{
        opacity: 0,
        filter: 'blur(8px)',
      }}
      whileInView={{
        opacity: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.75,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

/**
 * 4. STATISTICS / NUMBERS: Smooth Count-Up Effect
 * Triggers only once when entering viewport, respects reduced-motion,
 * never hardcodes values, and always finishes with the exact database string.
 */
interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

function parseStatValue(raw: string) {
  if (!raw) return null;
  const hasNepali = /[०-९]/.test(raw);
  let normalized = raw;
  if (hasNepali) {
    nepaliDigits.forEach((np, i) => {
      normalized = normalized.split(np).join(String(i));
    });
  }

  const match = normalized.match(/([0-9,.]+)/);
  if (!match) return null;

  const numStr = match[1].replace(/,/g, '');
  const targetNum = parseFloat(numStr);
  if (isNaN(targetNum)) return null;

  const matchIndex = normalized.indexOf(match[1]);
  const prefix = raw.slice(0, matchIndex);
  const suffix = raw.slice(matchIndex + match[1].length);
  const hasCommas = match[1].includes(',');
  const isDecimal = numStr.includes('.');
  const decimals = isDecimal ? numStr.split('.')[1].length : 0;

  return {
    targetNum,
    prefix,
    suffix,
    hasCommas,
    hasNepali,
    decimals,
    original: raw,
  };
}

function formatValue(
  val: number,
  hasCommas: boolean,
  hasNepali: boolean,
  decimals: number,
  prefix: string,
  suffix: string
): string {
  let formatted = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString();

  if (hasCommas) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }

  if (hasNepali) {
    formatted = formatted
      .split('')
      .map((ch) => {
        const num = parseInt(ch, 10);
        return !isNaN(num) && nepaliDigits[num] ? nepaliDigits[num] : ch;
      })
      .join('');
  }

  return `${prefix}${formatted}${suffix}`;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = '',
  duration = 1400,
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-30px' });
  const shouldReduceMotion = useReducedMotion();
  const prevValueRef = useRef<string>(value);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    // If reduced motion, show exact value immediately
    if (shouldReduceMotion) return value;
    const parsed = parseStatValue(value);
    if (!parsed) return value;
    return formatValue(0, parsed.hasCommas, parsed.hasNepali, parsed.decimals, parsed.prefix, parsed.suffix);
  });
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);

  // Dynamic CMS Compatibility: If admin updates metric in database/state, immediately sync
  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setDisplayValue(value);
      setHasCompleted(true);
    }
  }, [value]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      setHasCompleted(true);
      return;
    }

    if (!isInView || hasCompleted) return;

    const parsed = parseStatValue(value);
    if (!parsed) {
      setDisplayValue(value);
      setHasCompleted(true);
      return;
    }

    let startTime: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth institutional easeOutCubic curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parsed.targetNum * eased;

      if (progress < 1) {
        setDisplayValue(
          formatValue(current, parsed.hasCommas, parsed.hasNepali, parsed.decimals, parsed.prefix, parsed.suffix)
        );
        animId = requestAnimationFrame(animate);
      } else {
        // ALWAYS finish with the exact database string to guarantee 100% fidelity
        setDisplayValue(value);
        setHasCompleted(true);
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isInView, value, duration, shouldReduceMotion, hasCompleted]);

  return (
    <span ref={containerRef} className={className}>
      {hasCompleted || shouldReduceMotion ? value : displayValue}
    </span>
  );
};

/**
 * 5. TYPOGRAPHIC BACKGROUND ELEMENT
 * Very large, low-contrast typography behind selected sections (e.g. "ISHWARI", "ESTD 2035", "EXCELLENCE").
 * Requirements:
 * - Very low visual contrast (opacity 0.03 - 0.06 in light mode, 0.03 - 0.05 in dark mode)
 * - Must not interfere with content (pointer-events-none, absolute z-0, select-none)
 * - Must remain responsive across 320px - 1920px (clamp / viewport-relative sizing)
 * - Must not create horizontal overflow (overflow-hidden container, max-w-full)
 * - Does not affect document layout
 */
interface TypographicBackgroundProps {
  text: string;
  className?: string;
  position?: 'center' | 'top-right' | 'bottom-right' | 'left' | 'top-left';
  align?: 'center' | 'left' | 'right';
  opacityClass?: string;
}

export const TypographicBackground: React.FC<TypographicBackgroundProps> = ({
  text,
  className = '',
  position = 'center',
  align = 'center',
  opacityClass = 'text-slate-900/[0.03] dark:text-white/[0.025]',
}) => {
  let positionClasses = 'items-center justify-center';
  if (position === 'top-right') positionClasses = 'items-start justify-end pt-2 pr-4';
  if (position === 'bottom-right') positionClasses = 'items-end justify-end pb-2 pr-4';
  if (position === 'left') positionClasses = 'items-center justify-start pl-4';
  if (position === 'top-left') positionClasses = 'items-start justify-start pt-2 pl-4';

  let alignClass = 'text-center';
  if (align === 'left') alignClass = 'text-left';
  if (align === 'right') alignClass = 'text-right';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 z-0 overflow-hidden pointer-events-none select-none flex ${positionClasses} ${className}`}
    >
      <span
        className={`font-black uppercase tracking-[0.18em] sm:tracking-[0.22em] lg:tracking-[0.25em] leading-none whitespace-nowrap ${opacityClass} ${alignClass} text-[clamp(2.5rem,10vw,10.5rem)]`}
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {text}
      </span>
    </div>
  );
};

/**
 * 6. HOVER TYPOGRAPHY: Restrained Micro-Interactions
 * For important links, institutional cards, and action text.
 * Effects:
 * - text shifts 2px upward or rightward
 * - smooth underline expanding from left to right (h-[1.5px] w-0 -> w-full)
 * - subtle opacity transition
 * - subtle letter-spacing adjustment
 * - touch safe (only triggers on devices with hover)
 */
interface HoverInteractiveLinkProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  underlineColor?: string;
  direction?: 'up' | 'right';
  active?: boolean;
}

export const HoverInteractiveLink: React.FC<HoverInteractiveLinkProps> = ({
  children,
  onClick,
  className = '',
  underlineColor = 'bg-[#1E40AF] dark:bg-blue-400',
  direction = 'up',
  active = false,
}) => {
  const transformClass =
    direction === 'up'
      ? '@media(hover:hover){group-hover:-translate-y-0.5}'
      : '@media(hover:hover){group-hover:translate-x-1}';

  return (
    <span
      onClick={onClick}
      className={`relative inline-flex items-center group cursor-pointer ${className}`}
    >
      <span
        className={`relative inline-block transition-all duration-200 ease-out transform ${
          direction === 'up'
            ? 'sm:group-hover:-translate-y-0.5'
            : 'sm:group-hover:translate-x-1'
        } sm:group-hover:tracking-wide`}
      >
        {children}
        <span
          className={`absolute left-0 -bottom-0.5 h-[1.5px] rounded-full transition-all duration-250 ease-out pointer-events-none ${underlineColor} ${
            active ? 'w-full' : 'w-0 sm:group-hover:w-full'
          }`}
        />
      </span>
    </span>
  );
};

/**
 * 6. EDUCATOR & STAFF NAME TYPOGRAPHY & ANIMATION
 * Provides distinguished, academic styling with subtle entrance animations
 * and refined hover dynamics for faculty, leadership, and administration names.
 * Fully compatible with dynamic CMS content updates and reduced motion.
 */
export interface EducatorNameTypographyProps {
  name: string;
  role?: 'principal' | 'teacher' | 'admin' | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  as?: 'h2' | 'h3' | 'h4' | 'span' | 'p';
  align?: 'center' | 'left' | 'right';
  className?: string;
  enableHoverEffect?: boolean;
  animatedEntry?: boolean;
  delay?: number;
  highlightUnderline?: boolean;
}

export const EducatorNameTypography: React.FC<EducatorNameTypographyProps> = ({
  name,
  role = 'teacher',
  size = 'md',
  as = 'h2',
  align = 'center',
  className = '',
  enableHoverEffect = true,
  animatedEntry = true,
  delay = 0,
  highlightUnderline = true,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const sizeClasses: Record<string, string> = {
    xs: 'text-xs font-semibold',
    sm: 'text-xs sm:text-sm font-bold',
    md: 'text-sm sm:text-base font-bold',
    lg: 'text-base sm:text-lg font-extrabold',
    xl: 'text-lg sm:text-xl md:text-2xl font-extrabold',
  };

  const alignClasses: Record<string, string> = {
    center: 'text-center items-center justify-center',
    left: 'text-left items-start justify-start',
    right: 'text-right items-end justify-end',
  };

  const underlinePositionClasses: Record<string, string> = {
    center: 'left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 sm:w-0 sm:group-hover:w-4/5',
    left: 'left-0 w-0 group-hover:w-full',
    right: 'right-0 w-0 group-hover:w-full',
  };

  // Distinguished gradient line based on faculty role
  const underlineColor =
    role === 'principal'
      ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 dark:from-amber-400 dark:via-yellow-300 dark:to-amber-500'
      : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400';

  const hoverColorClass =
    role === 'principal'
      ? 'group-hover:text-amber-700 dark:group-hover:text-amber-300'
      : 'group-hover:text-[#1E40AF] dark:group-hover:text-blue-300';

  const Component = as;

  if (shouldReduceMotion || !animatedEntry) {
    return (
      <Component
        className={`relative inline-flex flex-col ${alignClasses[align]} group/name text-slate-900 dark:text-white ${sizeClasses[size]} ${className}`}
      >
        <span
          className={`relative inline-block transition-colors duration-200 ${
            enableHoverEffect ? hoverColorClass : ''
          }`}
        >
          {name}
          {highlightUnderline && (
            <span
              className={`absolute -bottom-1 h-[2px] rounded-full transition-all duration-300 ease-out pointer-events-none ${underlineColor} ${underlinePositionClasses[align]}`}
            />
          )}
        </span>
      </Component>
    );
  }

  return (
    <Component
      className={`relative inline-flex flex-col ${alignClasses[align]} group/name text-slate-900 dark:text-white ${sizeClasses[size]} ${className}`}
    >
      <motion.span
        key={name}
        className={`relative inline-block transition-all duration-300 ease-out ${
          enableHoverEffect
            ? `sm:group-hover:-translate-y-0.5 sm:group-hover:tracking-wide ${hoverColorClass}`
            : ''
        }`}
        initial={{ opacity: 0, y: isMobile ? 6 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {name}
        {highlightUnderline && (
          <span
            className={`absolute -bottom-1 h-[2px] rounded-full transition-all duration-300 ease-out pointer-events-none ${underlineColor} ${underlinePositionClasses[align]}`}
          />
        )}
      </motion.span>
    </Component>
  );
};

/**
 * 8. POINTER & TOUCH RESPONSIVE ILLUMINATED TEXT (Specifications #1, #2, #3, #4, #5, #6, #7, #8)
 *
 * Combines an entrance animation (blur -> sharp or fade-up) with interactive letter proximity:
 * - After entrance completes, pointer/touch tracks distance to each character.
 * - Distance <= radius receives orange color (#F59E0B), subtle upward lift, and subtle scale.
 * - Non-linear decay: peak orange & lift at cursor center, smoothly softening outwards.
 * - On pointer leave / touch end: smoothly restores original state without stuck letters.
 * - Preserves complete Nepali / English unicode grapheme integrity.
 * - Non-blocking touch handling keeps normal mobile scrolling buttery-smooth.
 * - Respects prefers-reduced-motion.
 */
export interface PointerIlluminatedTextProps {
  text: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3';
  className?: string;
  entranceType?: 'blur' | 'fade-up' | 'none';
  entranceDelay?: number;
  highlightHex?: string;
  radius?: number;
  maxLift?: number;
  maxScale?: number;
}

export const PointerIlluminatedText: React.FC<PointerIlluminatedTextProps> = ({
  text,
  as: Component = 'p',
  className = '',
  entranceType = 'blur',
  entranceDelay = 0.15,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || entranceType === 'none') {
    return <Component className={`select-text ${className}`}>{text}</Component>;
  }

  const MotionComponent = motion[Component as 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3'];

  return (
    <MotionComponent
      className={`inline-block select-text ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: entranceDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {text}
    </MotionComponent>
  );
};

export interface InteractiveSectionHeadingProps {
  title: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  icon?: React.ReactNode;
  delay?: number;
  highlightHex?: string;
  radius?: number;
  maxLift?: number;
  maxScale?: number;
}

export const InteractiveSectionHeading: React.FC<InteractiveSectionHeadingProps> = ({
  title,
  as: Component = 'h2',
  className = '',
  icon,
  delay = 0,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const Tag = Component as any;
    return (
      <Tag className={`inline-flex items-center gap-2 select-text ${className}`}>
        {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
        <span>{title}</span>
      </Tag>
    );
  }

  const MotionComponent = motion[Component as 'h1' | 'h2' | 'h3' | 'h4' | 'div'];

  return (
    <MotionComponent
      className={`relative inline-flex items-center gap-2 select-text ${className}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{
        duration: 0.55,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{title}</span>
    </MotionComponent>
  );
};

export interface InteractiveCharacterHeadingProps {
  text: string;
  onClick?: () => void;
  className?: string;
  highlightHex?: string;
  radius?: number;
  maxLift?: number;
  maxScale?: number;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'button' | 'div';
}

export const InteractiveCharacterHeading: React.FC<InteractiveCharacterHeadingProps> = ({
  text,
  onClick,
  className = '',
  as: Component = 'span',
}) => {
  const Tag = Component as any;

  return (
    <Tag
      onClick={onClick}
      className={`inline-block ${onClick ? 'cursor-pointer' : ''} select-text transition-colors duration-150 ${className}`}
    >
      {text}
    </Tag>
  );
};

/**
 * Reusable Standard Utility Aliases (Specifications #11 & #12)
 * Ensuring maximum developer ergonomics without duplicating animation systems.
 */
export const RevealText = ScrollRevealHeading;
export const ScrollReveal = ScrollRevealHeading;
export const StaggerText = StaggeredHeroHeading;
export const BlurReveal = BlurSharpStatement;
export const AnimatedNumber = AnimatedCounter;
export const TextHover = HoverInteractiveLink;
export const StaffName = EducatorNameTypography;
export const TeacherName = EducatorNameTypography;
export const EducatorNameReveal = EducatorNameTypography;
export const PointerResponsiveText = PointerIlluminatedText;
export const IlluminatedText = PointerIlluminatedText;
export const PointerIlluminatedTagline = PointerIlluminatedText;
export const TaglineIllumination = PointerIlluminatedText;
export const InteractiveHeading = InteractiveSectionHeading;
export const InteractiveTitle = InteractiveSectionHeading;
export const ScrollRevealInteractiveHeading = InteractiveSectionHeading;
export const InteractiveBrandHeading = InteractiveCharacterHeading;
export const InteractiveBrandText = InteractiveCharacterHeading;




