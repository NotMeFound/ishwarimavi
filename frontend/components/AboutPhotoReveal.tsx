import React, { ReactNode, useState } from 'react';
import { Eye, EyeOff, ImageOff } from 'lucide-react';
import { getApiUrl } from '../utils/apiUrl';

interface AboutPhotoRevealProps {
  image?: string;
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageAlt: string;
  title: string;
  caption?: string;
  mode?: 'foreground' | 'background';
  lang: 'en' | 'np';
  className: string;
  children: ReactNode;
}

const imagePositionClasses: Record<NonNullable<AboutPhotoRevealProps['imagePosition']>, string> = {
  center: 'object-center',
  top: 'object-top',
  bottom: 'object-bottom',
  left: 'object-left',
  right: 'object-right'
};

export const AboutPhotoReveal: React.FC<AboutPhotoRevealProps> = ({
  image,
  imagePosition = 'center',
  imageAlt,
  title,
  caption,
  mode = 'foreground',
  lang,
  className,
  children
}) => {
  const [revealed, setRevealed] = useState(false);
  const [detailsFocused, setDetailsFocused] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(image?.trim());
  const isNepali = lang === 'np';
  const localizedCaption = caption?.trim();
  const isRevealed = revealed || detailsFocused;

  if (!hasImage) {
    return <div className={className}>{children}</div>;
  }

  if (mode === 'background') {

    return (
      <div className={`relative overflow-hidden ${className}`}>
        {!imageFailed && (
          <img
            src={getApiUrl(image!)}
            alt={imageAlt}
            className={`absolute inset-0 h-full w-full object-cover ${imagePositionClasses[imagePosition]}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        {imageFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400" aria-label="Image unavailable">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] dark:bg-slate-950/90" />
        <div className="relative z-10">{children}</div>
        {localizedCaption && (
          <span className="relative z-10 mt-4 block border-t border-slate-200/70 pt-3 text-xs italic text-slate-600 dark:border-slate-700/70 dark:text-slate-300">
            {localizedCaption}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden ${className}`}>
      {!imageFailed && (
        <img
          src={getApiUrl(image!)}
          alt={imageAlt}
          className={`absolute inset-0 h-full w-full object-cover ${imagePositionClasses[imagePosition]} transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.02]`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      )}
      {imageFailed && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-label="Image unavailable">
          <ImageOff className="h-8 w-8" />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/10 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 text-white transition-opacity duration-200 group-hover:opacity-0 motion-reduce:transition-none">
        <p className="text-base font-bold">{title}</p>
        {localizedCaption && <p className="mb-1 text-xs italic text-white/90">{localizedCaption}</p>}
        <p className="text-sm font-semibold">
          {isNepali ? 'थिच्नुहोस् वा होभर गर्नुहोस्: विवरण पढ्नुहोस्' : 'Tap or hover to read details'}
        </p>
      </div>

      <div
        className={`absolute inset-0 z-10 bg-white/95 backdrop-blur-sm transition-opacity duration-200 dark:bg-slate-950/95 motion-reduce:transition-none ${
          isRevealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-hidden="true"
      />
      <div
        className={`relative z-20 transition-opacity duration-200 motion-reduce:transition-none ${
          isRevealed
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'
        }`}
        onFocusCapture={() => setDetailsFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDetailsFocused(false);
          }
        }}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        aria-expanded={isRevealed}
        className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white shadow-sm backdrop-blur hover:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        {isRevealed
          ? (isNepali ? 'फोटो देखाउनुहोस्' : 'Show photo')
          : (isNepali ? 'विवरण देखाउनुहोस्' : 'Read details')}
      </button>
    </div>
  );
};
