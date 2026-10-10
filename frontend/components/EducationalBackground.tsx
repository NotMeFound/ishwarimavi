import React, { useEffect, useRef } from 'react';
import {
  EducationalBgPreset,
  EducationalBgStyle,
  EducationalBgInteraction,
  EducationalSectionBgConfig
} from '../types';

export interface EducationalBackgroundProps {
  config?: EducationalSectionBgConfig;
  className?: string;
  defaultPreset?: EducationalBgPreset;
  defaultStyle?: EducationalBgStyle;
  defaultInteraction?: EducationalBgInteraction;
  /**
   * Optional placement override or fallback if config.placement is unset
   */
  placement?: 'center' | 'left' | 'right' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'full';
  /**
   * If true, defaults enabled to true even if config is undefined,
   * provided defaultPreset is given.
   */
  defaultEnabled?: boolean;
}

// Crisp, institutional SVG watermark vectors for academic presets
const renderPresetIllustration = (preset: EducationalBgPreset) => {
  switch (preset) {
    case 'open_books':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Subtle open book drawing */}
          <path d="M200 80 V240 M200 240 C160 210 110 210 60 220 V60 C110 50 160 50 200 80 C240 50 290 50 340 60 V220 C290 210 240 210 200 240 Z" />
          {/* Subtle pages curve */}
          <path d="M60 100 C110 90 160 90 200 120" strokeDasharray="3 3" />
          <path d="M60 140 C110 130 160 130 200 160" strokeDasharray="3 3" />
          <path d="M340 100 C290 90 240 90 200 120" strokeDasharray="3 3" />
          <path d="M340 140 C290 130 240 130 200 160" strokeDasharray="3 3" />
          {/* Bookmark ribbon */}
          <path d="M200 80 V180 L208 170 L216 180 V80" />
        </svg>
      );

    case 'school_building':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Neoclassical academic facade */}
          <path d="M80 260 H320" />
          <path d="M90 260 V140 H310 V260" />
          {/* Triangular pediment / roof */}
          <path d="M70 140 L200 60 L330 140 Z" />
          {/* Clock tower / belfry */}
          <path d="M175 60 V35 H225 V60" />
          <path d="M170 35 L200 15 L230 35 Z" />
          <circle cx="200" cy="46" r="6" />
          {/* Classical academic pillars */}
          <line x1="120" y1="140" x2="120" y2="260" />
          <line x1="140" y1="140" x2="140" y2="260" />
          <line x1="180" y1="140" x2="180" y2="260" />
          <line x1="220" y1="140" x2="220" y2="260" />
          <line x1="260" y1="140" x2="260" y2="260" />
          <line x1="280" y1="140" x2="280" y2="260" />
          {/* Central portal arch */}
          <path d="M185 260 V200 C185 190 215 190 215 200 V260" />
        </svg>
      );

    case 'students_studying':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Collaborative study table silhouette */}
          <ellipse cx="200" cy="220" rx="140" ry="20" />
          {/* Student 1 (left) */}
          <circle cx="120" cy="120" r="16" />
          <path d="M95 180 C95 150 145 150 145 180 V210 H95 Z" />
          <path d="M125 180 L155 195" />
          {/* Student 2 (center/rear) */}
          <circle cx="200" cy="100" r="16" />
          <path d="M175 160 C175 130 225 130 225 160 V200 H175 Z" />
          {/* Student 3 (right) */}
          <circle cx="280" cy="120" r="16" />
          <path d="M255 180 C255 150 305 150 305 180 V210 H255 Z" />
          <path d="M275 180 L245 195" />
          {/* Books & Notebook on desk */}
          <path d="M180 205 L200 200 L220 205 L200 210 Z" />
          <path d="M140 210 L165 205" />
        </svg>
      );

    case 'graduation_cap':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Mortarboard rhomboid */}
          <path d="M200 70 L340 120 L200 170 L60 120 Z" />
          {/* Cap skull cap under */}
          <path d="M120 145 V200 C120 225 280 225 280 200 V145" />
          {/* Tassel ribbon */}
          <path d="M200 120 L280 150 V215" />
          <circle cx="280" cy="218" r="4" />
          <path d="M276 222 L274 240 M284 222 L286 240" />
          {/* Laurel branch ornament */}
          <path d="M100 250 C140 265 260 265 300 250" strokeDasharray="4 4" />
        </svg>
      );

    case 'globe':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Globe Sphere */}
          <circle cx="200" cy="130" r="70" />
          <ellipse cx="200" cy="130" rx="35" ry="70" />
          <ellipse cx="200" cy="130" rx="60" ry="24" />
          <line x1="130" y1="130" x2="270" y2="130" />
          {/* Meridian Arc */}
          <path d="M200 45 C255 45 285 85 285 130 C285 175 255 215 200 215" strokeWidth="1.8" />
          {/* Stand axis and base */}
          <line x1="165" y1="40" x2="235" y2="220" strokeDasharray="3 3" />
          <path d="M200 215 V255" strokeWidth="2" />
          <ellipse cx="200" cy="258" rx="42" ry="8" strokeWidth="1.5" />
          {/* Continental outline hints */}
          <path d="M175 100 Q190 90 205 105 T220 125" strokeDasharray="2 2" />
          <path d="M165 140 Q180 155 195 145 T215 170" strokeDasharray="2 2" />
        </svg>
      );

    case 'mathematics':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Geometry Compass */}
          <path d="M130 190 L180 80 L230 190" />
          <path d="M150 140 C170 145 190 145 210 140" />
          <circle cx="180" cy="80" r="5" />
          {/* Golden spiral / mathematical curves */}
          <path d="M70 230 C90 120 200 90 280 130 C330 160 330 220 290 240 C260 255 220 240 220 210" strokeDasharray="3 3" />
          {/* Math symbols */}
          <text x="75" y="80" fontSize="24" fontFamily="serif" fill="currentColor" stroke="none">∑</text>
          <text x="290" y="90" fontSize="24" fontFamily="serif" fill="currentColor" stroke="none">π</text>
          <text x="90" y="160" fontSize="22" fontFamily="serif" fill="currentColor" stroke="none">√x</text>
          <text x="310" y="180" fontSize="22" fontFamily="serif" fill="currentColor" stroke="none">∞</text>
          <text x="140" y="240" fontSize="20" fontFamily="serif" fill="currentColor" stroke="none">∫ f(x)dx</text>
          {/* Protractor arc */}
          <path d="M250 240 A50 50 0 0 0 350 240 Z" />
        </svg>
      );

    case 'science_lab':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Erlenmeyer flask */}
          <path d="M120 70 H150 V110 L100 220 C95 230 102 240 115 240 H155 C168 240 175 230 170 220 L120 110 V70" />
          <line x1="110" y1="180" x2="160" y2="180" strokeDasharray="2 2" />
          <circle cx="130" cy="205" r="4" />
          <circle cx="145" cy="215" r="3" />
          {/* Atom orbital rings */}
          <ellipse cx="270" cy="140" rx="60" ry="22" transform="rotate(-30 270 140)" />
          <ellipse cx="270" cy="140" rx="60" ry="22" transform="rotate(30 270 140)" />
          <ellipse cx="270" cy="140" rx="60" ry="22" transform="rotate(90 270 140)" />
          <circle cx="270" cy="140" r="7" fill="currentColor" />
          {/* Microscope outline */}
          <path d="M200 240 H240 M220 240 V190 L195 165" />
          <circle cx="190" cy="160" r="6" />
        </svg>
      );

    case 'microscope':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Base */}
          <ellipse cx="200" cy="255" rx="65" ry="12" strokeWidth="1.8" />
          <path d="M150 255 C150 240 250 240 250 255" />
          {/* Curved Arm */}
          <path d="M235 245 C265 210 265 120 220 100 L200 110" strokeWidth="2.2" />
          {/* Optical Tube & Eyepiece */}
          <path d="M170 50 L195 65" strokeWidth="2" />
          <rect x="180" y="60" width="30" height="75" rx="3" transform="rotate(-30 195 97)" />
          {/* Objective Revolving Nosepiece */}
          <circle cx="160" cy="155" r="14" />
          <line x1="150" y1="165" x2="140" y2="185" strokeWidth="2" />
          <line x1="165" y1="168" x2="162" y2="190" strokeWidth="1.8" />
          {/* Stage */}
          <line x1="115" y1="195" x2="195" y2="195" strokeWidth="2.5" />
          {/* Slide Glass & Specimen */}
          <line x1="135" y1="193" x2="175" y2="193" strokeWidth="1" />
          <circle cx="155" cy="193" r="2.5" fill="currentColor" />
          {/* Coarse / Fine Focus Knob */}
          <circle cx="230" cy="150" r="11" />
          <circle cx="230" cy="150" r="6" strokeDasharray="2 2" />
          {/* Substage Condenser & Light Mirror */}
          <ellipse cx="155" cy="225" rx="14" ry="7" transform="rotate(25 155 225)" />
        </svg>
      );

    case 'pencil':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Angled Drafting Pencil */}
          <path d="M90 70 L270 210 L260 225 L80 85 Z" />
          <line x1="85" y1="77" x2="265" y2="217" strokeDasharray="3 3" />
          {/* Sharpened Cone & Tip */}
          <polygon points="270,210 260,225 295,235" />
          <polygon points="288,232 281,228 295,235" fill="currentColor" />
          {/* Eraser Ferrule */}
          <line x1="95" y1="65" x2="75" y2="90" />
          <path d="M90 70 L75 58 C68 52 58 64 65 72 L80 85" />
          {/* 30-60 Drafting Set Square */}
          <polygon points="120,240 310,240 310,80" strokeWidth="1.5" />
          <polygon points="155,225 290,225 290,135" strokeDasharray="3 3" />
          {/* Measurement Ticks */}
          <line x1="150" y1="240" x2="150" y2="234" />
          <line x1="180" y1="240" x2="180" y2="232" />
          <line x1="210" y1="240" x2="210" y2="234" />
          <line x1="240" y1="240" x2="240" y2="232" />
          <line x1="270" y1="240" x2="270" y2="234" />
          <line x1="300" y1="240" x2="300" y2="232" />
        </svg>
      );

    case 'academic_patterns':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Concentric Institutional Crest Rings */}
          <circle cx="200" cy="150" r="95" strokeDasharray="4 4" />
          <circle cx="200" cy="150" r="85" />
          <circle cx="200" cy="150" r="65" strokeDasharray="2 2" />
          {/* Laurel Wreaths */}
          <path d="M130 180 C110 130 140 85 180 75 M125 150 C115 135 125 120 135 125" />
          <path d="M270 180 C290 130 260 85 220 75 M275 150 C285 135 275 120 265 125" />
          {/* Torch of Knowledge in center */}
          <path d="M193 185 L190 145 H210 L207 185 Z" />
          <path d="M190 145 C190 130 200 120 200 110 C200 120 210 130 210 145 Z" />
          {/* Star / Radiant Rays */}
          <line x1="200" y1="50" x2="200" y2="40" />
          <line x1="200" y1="260" x2="200" y2="250" />
          <line x1="95" y1="150" x2="85" y2="150" />
          <line x1="305" y1="150" x2="315" y2="150" />
          <line x1="125" y1="75" x2="118" y2="68" />
          <line x1="275" y1="75" x2="282" y2="68" />
          <line x1="125" y1="225" x2="118" y2="232" />
          <line x1="275" y1="225" x2="282" y2="232" />
          {/* Open Book Leaf Motif */}
          <path d="M165 215 C185 205 200 212 200 212 C200 212 215 205 235 215" strokeWidth="1.5" />
        </svg>
      );

    case 'library_books':
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Bookshelf row */}
          <line x1="50" y1="240" x2="350" y2="240" strokeWidth="2" />
          <line x1="50" y1="120" x2="350" y2="120" strokeWidth="2" />
          {/* Stacked books on upper shelf */}
          <rect x="70" y="60" width="22" height="60" rx="2" />
          <rect x="94" y="50" width="26" height="70" rx="2" />
          <rect x="122" y="55" width="20" height="65" rx="2" />
          <path d="M145 65 L165 72 L160 120 L140 120 Z" />
          {/* Open globe */}
          <circle cx="260" cy="75" r="28" />
          <ellipse cx="260" cy="75" rx="14" ry="28" />
          <line x1="232" y1="75" x2="288" y2="75" />
          <path d="M260 103 V120 M250 120 H270" />
          {/* Lower shelf row */}
          <rect x="70" y="160" width="28" height="80" rx="2" />
          <rect x="100" y="150" width="24" height="90" rx="2" />
          <rect x="126" y="170" width="30" height="70" rx="2" />
          <rect x="158" y="155" width="22" height="85" rx="2" />
          {/* Scroll / diploma */}
          <path d="M230 180 C230 170 290 170 290 180 V230 C290 240 230 240 230 230 Z" />
          <path d="M230 180 C230 190 290 190 290 180" />
        </svg>
      );

    case 'classroom':
    default:
      return (
        <svg
          viewBox="0 0 400 300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Blackboard / smartboard */}
          <rect x="90" y="50" width="220" height="130" rx="6" />
          <rect x="100" y="60" width="200" height="110" rx="3" strokeDasharray="3 3" />
          {/* Chalkboard content */}
          <line x1="120" y1="85" x2="190" y2="85" />
          <line x1="120" y1="100" x2="170" y2="100" />
          <circle cx="230" cy="110" r="16" />
          <path d="M255 95 L275 125 H235 Z" />
          {/* Teacher podium & desk */}
          <path d="M70 240 V190 H120 V240" />
          <line x1="60" y1="190" x2="130" y2="190" strokeWidth="2" />
          {/* Classroom student desks */}
          <path d="M160 240 V205 H220 V240" />
          <line x1="150" y1="205" x2="230" y2="205" strokeWidth="2" />
          <path d="M270 240 V205 H330 V240" />
          <line x1="260" y1="205" x2="340" y2="205" strokeWidth="2" />
        </svg>
      );
  }
};

/**
 * Maps alignment and placement to standard CSS classes.
 */
function getPlacementClasses(placement: EducationalSectionBgConfig['placement'] = 'right') {
  switch (placement) {
    case 'left':
      return 'items-center justify-start -left-12 sm:left-4';
    case 'right':
      return 'items-center justify-end -right-12 sm:right-4';
    case 'center':
      return 'items-center justify-center inset-0';
    case 'top-right':
      return 'items-start justify-end pt-4 -right-8 sm:right-6';
    case 'bottom-right':
      return 'items-end justify-end pb-4 -right-8 sm:right-6';
    case 'top-left':
      return 'items-start justify-start pt-4 -left-8 sm:left-6';
    case 'bottom-left':
      return 'items-end justify-start pb-4 -left-8 sm:left-6';
    case 'full':
      return 'items-center justify-center inset-0';
    default:
      return 'items-center justify-end -right-12 sm:right-4';
  }
}

/**
 * Calculates baseline watermark opacity based on configured style or raw percentage
 */
function resolveBaseOpacity(
  rawOpacity: number | undefined,
  style: EducationalBgStyle | undefined
): number {
  if (style === 'none') return 0;
  if (rawOpacity !== undefined && rawOpacity > 0) {
    return Math.max(0.01, Math.min(0.20, rawOpacity / 100));
  }
  switch (style) {
    case 'soft':
      return 0.07;
    case 'medium':
      return 0.10;
    case 'subtle':
    default:
      return 0.04;
  }
}

/**
 * EducationalBackground Component
 * Renders subtle, living academic visual watermarks behind section content without
 * participating in normal document flow.
 *
 * Guaranteed constraints & features:
 * - position: absolute; inset: 0; pointer-events: none; select-none; z-0
 * - Subtle ambient floating & breathing (extremely slow, calm period of 8-12 seconds)
 * - Pointer parallax shift (2-6px) and proximity brightening (approaching increases opacity by +2-2.5%)
 * - Smooth easing via requestAnimationFrame lerp interpolation
 * - Passive, non-blocking touch support with micro-reaction on mobile
 * - Automatically respects prefers-reduced-motion: reduce
 * - Strict GPU acceleration (translate3d and opacity only, never touches layout dimensions)
 * - Full screen-reader accessibility with aria-hidden="true"
 */
export const EducationalBackground: React.FC<EducationalBackgroundProps> = ({
  config,
  className = '',
  defaultPreset = 'open_books',
  defaultStyle = 'subtle',
  defaultInteraction = 'interactive',
  placement: propPlacement,
  defaultEnabled = true
}) => {
  // Container refs for tracking and direct GPU transform manipulation
  const containerRef = useRef<HTMLDivElement | null>(null);
  const watermarkRef = useRef<HTMLDivElement | null>(null);

  // Animation and interaction state refs
  const rafIdRef = useRef<number | null>(null);
  const isPointerInsideRef = useRef(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Current and target interpolated values for ultra-smooth easing
  const currentXRef = useRef(0);
  const currentYRef = useRef(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);

  const currentProximityRef = useRef(0);
  const targetProximityRef = useRef(0);

  // Check if enabled
  const isEnabled = config?.enabled !== undefined ? config.enabled : defaultEnabled;
  const styleMode: EducationalBgStyle = config?.style || defaultStyle;
  const interactionMode: EducationalBgInteraction = config?.interaction || defaultInteraction;

  const mode = config?.mode || 'preset';
  const preset = config?.preset || defaultPreset;
  const placement = config?.placement || propPlacement || 'right';
  const baseOpacity = resolveBaseOpacity(config?.opacity, styleMode);

  // If placement is 'full' (common for photograph/URL backgrounds), render cover
  const isFullCover = placement === 'full';

  // Sizing of watermark vector
  const watermarkSizeClass = isFullCover
    ? 'w-full h-full object-cover'
    : 'w-[280px] h-[210px] sm:w-[380px] sm:h-[285px] lg:w-[480px] lg:h-[360px] max-w-full';

  // Custom image or URL mode
  const customImageUrl = config?.customImageUrl?.trim();

  useEffect(() => {
    if (!isEnabled || baseOpacity === 0) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isReducedMotion = mediaQuery.matches;

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (isReducedMotion && watermarkRef.current) {
        watermarkRef.current.style.transform = 'translate3d(0, 0, 0)';
        watermarkRef.current.style.opacity = `${baseOpacity}`;
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    // If reduced motion is requested or interaction is static, apply static style and exit early
    if (isReducedMotion || interactionMode === 'static') {
      if (watermarkRef.current) {
        watermarkRef.current.style.transform = 'translate3d(0, 0, 0)';
        watermarkRef.current.style.opacity = `${baseOpacity}`;
      }
      return () => {
        mediaQuery.removeEventListener('change', handleMotionChange);
      };
    }

    // Determine parent container for capturing section pointer events
    const sectionElement = containerRef.current?.parentElement || containerRef.current;
    if (!sectionElement) return;

    const isMobile = window.innerWidth < 640;
    const maxShift = isMobile ? 1.5 : 3.5;
    const floatAmplitudeX = isMobile ? 0.8 : 1.6;
    const floatAmplitudeY = isMobile ? 1.0 : 2.2;
    const proximityRadius = isMobile ? 180 : 280;

    let startTime = performance.now();

    // Event handlers for pointer tracking
    const handlePointerMove = (e: PointerEvent) => {
      if (interactionMode !== 'interactive' || isReducedMotion) return;
      isPointerInsideRef.current = true;
      pointerPosRef.current = { x: e.clientX, y: e.clientY };

      const rect = sectionElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Parallax shift calculation (gentle 2-5px offset)
      const relX = (e.clientX - centerX) / (rect.width / 2 || 1);
      const relY = (e.clientY - centerY) / (rect.height / 2 || 1);
      targetXRef.current = Math.max(-1, Math.min(1, relX)) * maxShift;
      targetYRef.current = Math.max(-1, Math.min(1, relY)) * maxShift;

      // Proximity calculation relative to watermark center
      if (watermarkRef.current) {
        const wmRect = watermarkRef.current.getBoundingClientRect();
        const wmCenterX = wmRect.left + wmRect.width / 2;
        const wmCenterY = wmRect.top + wmRect.height / 2;
        const dist = Math.hypot(e.clientX - wmCenterX, e.clientY - wmCenterY);

        if (dist < proximityRadius) {
          const influence = Math.pow(1 - dist / proximityRadius, 1.35);
          targetProximityRef.current = influence * 0.025; // Subtle +2.5% opacity max
        } else {
          targetProximityRef.current = 0;
        }
      }
    };

    const handlePointerLeave = () => {
      isPointerInsideRef.current = false;
      targetXRef.current = 0;
      targetYRef.current = 0;
      targetProximityRef.current = 0;
    };

    // Mobile touch interaction: gentle micro-reaction without blocking scrolls
    const handleTouchStart = (e: TouchEvent) => {
      if (interactionMode !== 'interactive' || isReducedMotion || !e.touches[0]) return;
      isPointerInsideRef.current = true;
      targetProximityRef.current = 0.018; // Gentle tap response
    };

    const handleTouchEnd = () => {
      isPointerInsideRef.current = false;
      targetProximityRef.current = 0;
      targetXRef.current = 0;
      targetYRef.current = 0;
    };

    // Attach passive listeners to section
    sectionElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    sectionElement.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    sectionElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    sectionElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    sectionElement.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Main animation frame loop
    const animate = (time: number) => {
      if (isReducedMotion) return;

      const elapsed = time - startTime;

      // Subtle ambient floating and breathing (8-12 second cycle)
      const floatX = Math.sin(elapsed * 0.0006) * floatAmplitudeX;
      const floatY = Math.cos(elapsed * 0.0008) * floatAmplitudeY;
      const breathOpacity = Math.sin(elapsed * 0.0005) * 0.004; // ±0.4% pulsation

      // Smooth lerp interpolation towards targets
      const lerpFactor = 0.06;
      currentXRef.current += (targetXRef.current - currentXRef.current) * lerpFactor;
      currentYRef.current += (targetYRef.current - currentYRef.current) * lerpFactor;
      currentProximityRef.current +=
        (targetProximityRef.current - currentProximityRef.current) * 0.08;

      const totalX = currentXRef.current + floatX;
      const totalY = currentYRef.current + floatY;
      const totalOpacity = Math.max(
        0.005,
        Math.min(0.25, baseOpacity + breathOpacity + currentProximityRef.current)
      );

      if (watermarkRef.current) {
        watermarkRef.current.style.transform = `translate3d(${totalX.toFixed(2)}px, ${totalY.toFixed(2)}px, 0)`;
        watermarkRef.current.style.opacity = `${totalOpacity.toFixed(4)}`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      mediaQuery.removeEventListener('change', handleMotionChange);
      sectionElement.removeEventListener('pointermove', handlePointerMove);
      sectionElement.removeEventListener('pointerleave', handlePointerLeave);
      sectionElement.removeEventListener('touchstart', handleTouchStart);
      sectionElement.removeEventListener('touchend', handleTouchEnd);
      sectionElement.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isEnabled, baseOpacity, interactionMode]);

  if (!isEnabled || baseOpacity === 0) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 z-0 pointer-events-none select-none overflow-hidden flex ${getPlacementClasses(
        placement
      )} ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {/* Visual Living Watermark Layer */}
      {mode === 'custom_url' && customImageUrl ? (
        <div
          ref={watermarkRef}
          className={`relative will-change-transform ${
            isFullCover ? 'w-full h-full' : 'w-2/3 max-w-xl h-4/5'
          }`}
          style={{
            opacity: baseOpacity,
            transform: 'translate3d(0, 0, 0)',
            transition: 'opacity 300ms ease-out'
          }}
        >
          <img
            src={customImageUrl}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter grayscale contrast-125 pointer-events-none select-none"
          />
          {/* Subtle gradient fader edges so image melts seamlessly into the background */}
          <div className="absolute inset-0 bg-radial from-transparent to-white dark:to-slate-950" />
        </div>
      ) : (
        <div
          ref={watermarkRef}
          className={`${watermarkSizeClass} text-slate-800 dark:text-blue-100 will-change-transform`}
          style={{
            opacity: baseOpacity,
            transform: 'translate3d(0, 0, 0)'
          }}
        >
          {renderPresetIllustration(preset)}
        </div>
      )}
    </div>
  );
};
