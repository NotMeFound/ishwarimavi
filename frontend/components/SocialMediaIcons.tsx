import React from 'react';
import { SocialMediaLink, SocialPlatform, Language } from '../types';

/**
 * Validates social URLs strictly for safety and valid external protocols.
 * Only HTTP and HTTPS schemes are allowed.
 * Rejects executable protocols (javascript:, data:, vbscript:, etc.)
 */
export function isValidSocialUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Strictly disallow unsafe executable schemes
  if (/^(javascript|data|vbscript|file|blob):/i.test(trimmed)) {
    return false;
  }
  // Must begin with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Clean 20px-22px SVG icons with consistent 2px stroke / vector weight
 * matching the institutional design language of the school website.
 */
export const SocialPlatformIcon: React.FC<{
  platform: SocialPlatform;
  className?: string;
}> = ({ platform, className = 'w-5 h-5' }) => {
  switch (platform) {
    case 'facebook':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'instagram':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeWidth="2.5" />
        </svg>
      );

    case 'x':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Official clean vector X geometry with 2px optical match */}
          <path d="M4 4l6.75 8.75L4 20h2.5l5.35-6.17L16.2 20H20l-7.05-9.15L19.5 4h-2.5l-5.05 5.82L7.8 4H4z" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          <path d="M9.5 9.5a1.5 1.5 0 0 0-1.5 1.5c0 2.5 2 4.5 4.5 4.5a1.5 1.5 0 0 0 1.5-1.5v-.5l-1.5-.5-.8.8a4.8 4.8 0 0 1-2-2l.8-.8-.5-1.5z" fill="currentColor" stroke="none" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      );

    case 'website':
    default:
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
};

/**
 * Platform default display names and theme classes for subtle,
 * institutional hover/focus/active states.
 */
export const PLATFORM_INFO: Record<
  SocialPlatform,
  {
    nameEn: string;
    nameNp: string;
    hoverClasses: string;
    focusClasses: string;
    accentColor: string;
  }
> = {
  facebook: {
    nameEn: 'Facebook',
    nameNp: 'फेसबुक',
    hoverClasses: 'hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 hover:text-[#1877F2] dark:hover:text-[#4294FF]',
    focusClasses: 'focus-visible:ring-[#1877F2]/40 focus-visible:border-[#1877F2]/50',
    accentColor: '#1877F2'
  },
  youtube: {
    nameEn: 'YouTube',
    nameNp: 'युट्युब',
    hoverClasses: 'hover:bg-[#FF0000]/10 hover:border-[#FF0000]/30 hover:text-[#FF0000] dark:hover:text-[#FF4D4D]',
    focusClasses: 'focus-visible:ring-[#FF0000]/40 focus-visible:border-[#FF0000]/50',
    accentColor: '#FF0000'
  },
  instagram: {
    nameEn: 'Instagram',
    nameNp: 'इन्स्टाग्राम',
    hoverClasses: 'hover:bg-[#E4405F]/10 hover:border-[#E4405F]/30 hover:text-[#E4405F] dark:hover:text-[#FF6685]',
    focusClasses: 'focus-visible:ring-[#E4405F]/40 focus-visible:border-[#E4405F]/50',
    accentColor: '#E4405F'
  },
  x: {
    nameEn: 'X (Twitter)',
    nameNp: 'एक्स (ट्विटर)',
    hoverClasses: 'hover:bg-slate-800/80 hover:border-slate-500 hover:text-white dark:hover:bg-slate-800 dark:hover:text-white',
    focusClasses: 'focus-visible:ring-slate-400 focus-visible:border-slate-400',
    accentColor: '#0F1419'
  },
  linkedin: {
    nameEn: 'LinkedIn',
    nameNp: 'लिंक्डइन',
    hoverClasses: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30 hover:text-[#0A66C2] dark:hover:text-[#3B82F6]',
    focusClasses: 'focus-visible:ring-[#0A66C2]/40 focus-visible:border-[#0A66C2]/50',
    accentColor: '#0A66C2'
  },
  whatsapp: {
    nameEn: 'WhatsApp',
    nameNp: 'ह्वाट्सएप',
    hoverClasses: 'hover:bg-[#25D366]/10 hover:border-[#25D366]/30 hover:text-[#25D366] dark:hover:text-[#34D399]',
    focusClasses: 'focus-visible:ring-[#25D366]/40 focus-visible:border-[#25D366]/50',
    accentColor: '#25D366'
  },
  tiktok: {
    nameEn: 'TikTok',
    nameNp: 'टिकटक',
    hoverClasses: 'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-400',
    focusClasses: 'focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/50',
    accentColor: '#06B6D4'
  },
  website: {
    nameEn: 'Official Portal',
    nameNp: 'आधिकारिक पोर्टल',
    hoverClasses: 'hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-600 dark:hover:text-blue-400',
    focusClasses: 'focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50',
    accentColor: '#2563EB'
  }
};

export interface SocialMediaBarProps {
  links?: SocialMediaLink[];
  lang?: Language;
  size?: 'sm' | 'md';
  variant?: 'footer' | 'card' | 'preview';
  className?: string;
  isInteractiveInPreview?: boolean;
}

/**
 * Institutional Social Media Bar
 * Features:
 * - Admin-controlled platforms, URLs, and display order
 * - Completely filters out unconfigured or disabled items
 * - Clean SVG icons (20px) with matching optical weight
 * - 36px-40px touch-friendly container with subtle neutral default state
 * - Platform-specific hover/focus/active states (smooth 150ms-200ms transition)
 * - Strict URL validation ensuring only safe external URLs (https://)
 * - Accessible aria-labels and keyboard focus rings
 * - Natural responsive wrapping to prevent overflow on 320px-1920px viewports
 */
export const SocialMediaBar: React.FC<SocialMediaBarProps> = ({
  links = [],
  lang = 'en',
  size = 'md',
  variant = 'footer',
  className = '',
  isInteractiveInPreview = false
}) => {
  const isNp = lang === 'np';

  // Filter only enabled links with valid, safe URLs and sort by admin order
  const validLinks = links
    .filter(item => item && item.enabled && isValidSocialUrl(item.url))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (validLinks.length === 0) {
    return null;
  }

  // Sizing definitions:
  // Recommended desktop size: 20px icon, 36-40px button container, 8-12px gap
  const containerSize = size === 'sm'
    ? 'w-9 h-9 min-w-[36px] min-h-[36px] sm:min-w-[38px] sm:min-h-[38px]'
    : 'w-10 h-10 min-w-[40px] min-h-[40px]';
  const iconSize = 'w-5 h-5';

  // Base styling: neutral, monochrome default state with subtle container
  const baseClasses = variant === 'footer'
    ? 'bg-slate-900/60 dark:bg-slate-900/80 border border-slate-800/80 text-slate-400 dark:text-slate-400 shadow-2xs'
    : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 shadow-2xs';

  return (
    <div
      className={`flex flex-wrap items-center gap-2 sm:gap-2.5 ${className}`}
      role="list"
      aria-label={isNp ? 'विद्यालयका सामाजिक सञ्जाल लिङ्कहरू' : 'School Official Social Media Links'}
    >
      {validLinks.map((item) => {
        const info = PLATFORM_INFO[item.platform] || PLATFORM_INFO.website;
        const displayName = isNp
          ? (item.labelNp || info.nameNp)
          : (item.labelEn || info.nameEn);

        const tooltipText = isNp
          ? `${displayName} (आधिकारिक पृष्ठ खोल्नुहोस्)`
          : `${displayName} (Official School Channel)`;

        const interactiveClasses = `${info.hoverClasses} ${info.focusClasses} active:scale-95`;

        return (
          <a
            key={item.id || item.platform}
            href={isInteractiveInPreview ? undefined : item.url}
            target={isInteractiveInPreview ? undefined : '_blank'}
            rel={isInteractiveInPreview ? undefined : 'noopener noreferrer'}
            role="listitem"
            aria-label={displayName}
            title={tooltipText}
            className={`
              inline-flex items-center justify-center rounded-xl cursor-pointer
              transition-all duration-150 ease-out select-none
              focus-visible:outline-hidden focus-visible:ring-2
              ${containerSize}
              ${baseClasses}
              ${interactiveClasses}
            `}
          >
            <SocialPlatformIcon platform={item.platform} className={iconSize} />
          </a>
        );
      })}
    </div>
  );
};
