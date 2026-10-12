import React, { useCallback, useEffect, useState } from 'react';
import { Language, GalleryItem } from '../types';
import {
  Image as ImageIcon,
  Camera,
  FlaskConical,
  Trophy,
  BookOpen,
  Heart,
  Cpu,
  Layers,
  X
} from 'lucide-react';
import { IconActionButton } from '../components/IconActionButton';
import { getApiUrl } from '../services/apiClient';

interface GalleryViewProps {
  lang: Language;
  items?: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ lang }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(() => new Set());
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [hasLoadedGallery, setHasLoadedGallery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const refreshGallery = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch(getApiUrl('/api/gallery'), {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache, no-store',
        Pragma: 'no-cache'
      },
      signal
    });
    if (!response.ok) {
      throw new Error(`Gallery request failed (HTTP ${response.status})`);
    }
    const result = await response.json() as { success?: boolean; data?: GalleryItem[]; error?: string };
    if (!result.success || !Array.isArray(result.data)) {
      throw new Error(result.error || 'The gallery response was invalid.');
    }
    setGalleryItems(result.data);
    setHasLoadedGallery(true);
    setFailedImages(new Set());
    setLoadError('');
  }, []);

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let timer: number | undefined;
    let controller: AbortController | undefined;

    const load = async () => {
      if (inFlight || !active) return;
      inFlight = true;
      controller = new AbortController();
      try {
        await refreshGallery(controller.signal);
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === 'AbortError')) {
          setLoadError(error instanceof Error ? error.message : 'Could not load the public gallery.');
        }
      } finally {
        inFlight = false;
        if (active) {
          setIsLoading(false);
          timer = window.setTimeout(() => void load(), 15000);
        }
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        if (timer !== undefined) window.clearTimeout(timer);
        void load();
      }
    };

    void load();
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener('focus', refreshWhenVisible);

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
      controller?.abort();
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [refreshGallery, retryCount]);

  const safeItems = (hasLoadedGallery ? galleryItems : []).filter((item) =>
    item.status !== 'unpublished' &&
    item.status !== 'draft' &&
    item.published !== false &&
    item.is_published !== false &&
    item.is_enabled !== false
  );
  const renderIcon = (type: string) => {
    switch (type) {
      case 'science':
        return <FlaskConical className="w-12 h-12 text-[#1E40AF]" />;
      case 'sports':
        return <Trophy className="w-12 h-12 text-[#1E40AF]" />;
      case 'academics':
        return <BookOpen className="w-12 h-12 text-[#1E40AF]" />;
      case 'culture':
        return <Heart className="w-12 h-12 text-[#1E40AF]" />;
      case 'community':
        return <Layers className="w-12 h-12 text-[#1E40AF]" />;
      default:
        return <Camera className="w-12 h-12 text-[#1E40AF]" />;
    }
  };

  const filtered = activeCategory === 'all' ? safeItems : safeItems.filter(i => i.category === activeCategory);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{t('Visual Archive & Photo Gallery', 'तस्बिर पुस्तिका')}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {t('Campus Life & Activities Gallery', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका झलकहरू')}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'all', en: 'All Media', np: 'सबै' },
              { id: 'science', en: 'Science & Tech', np: 'विज्ञान' },
              { id: 'sports', en: 'Sports', np: 'खेलकुद' },
              { id: 'academics', en: 'Academics', np: 'शिक्षा' },
              { id: 'culture', en: 'Culture', np: 'संस्कृति' },
              { id: 'community', en: 'Community', np: 'समुदाय' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t(cat.en, cat.np)}
              </button>
            ))}
          </div>
        </div>

        {loadError && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <span>
              {hasLoadedGallery
                ? t('Could not refresh the gallery. Showing the last loaded photos.', 'ग्यालरी ताजा गर्न सकिएन। पछिल्लो लोड भएका तस्बिरहरू देखाइँदैछन्।')
                : t('The gallery could not be loaded.', 'ग्यालरी लोड गर्न सकिएन।')}
            </span>
            <button
              type="button"
              onClick={() => {
                setLoadError('');
                setIsLoading(!hasLoadedGallery);
                setRetryCount((count) => count + 1);
              }}
              className="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40"
            >
              {t('Retry', 'पुनः प्रयास')}
            </button>
          </div>
        )}

        {isLoading && !hasLoadedGallery ? (
          <div role="status" aria-live="polite" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <span className="sr-only">{t('Loading gallery photos…', 'ग्यालरीका तस्बिर लोड हुँदैछन्…')}</span>
            {[0, 1, 2].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasLoadedGallery && loadError ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {t('Retry to load published gallery photos.', 'प्रकाशित तस्बिर लोड गर्न पुनः प्रयास गर्नुहोस्।')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('No published photos in this gallery yet.', 'यस ग्यालरीमा प्रकाशित तस्बिरहरू छैनन्।')}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const image = item.image || item.url || '';
            const imageFailed = failedImages.has(item.id);
            return (
            <div
              key={item.id}
              onClick={() => setPreviewItem(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setPreviewItem(item);
                }
              }}
              className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-2xs flex flex-col hover:border-[#1E40AF]/40 transition group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF]"
            >
              <div className="h-48 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center border-b border-slate-200 dark:border-slate-800 overflow-hidden relative">
                {image && !imageFailed ? (
                  <img
                    src={getApiUrl(image)}
                    alt={item.title_en || item.title_np || t('School gallery photo', 'विद्यालय ग्यालरी तस्बिर')}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailedImages((previous) => new Set(previous).add(item.id))}
                  />
                ) : (
                  <div className="group-hover:scale-105 transition-transform duration-300 flex flex-col items-center gap-2">
                    {renderIcon(item.iconType || 'camera')}
                    {imageFailed && <span className="text-xs text-slate-500">{t('Image unavailable', 'तस्बिर उपलब्ध छैन')}</span>}
                  </div>
                )}
              </div>
              <div className="p-5 space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                  {item.category}
                </span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                  {t(item.title_en || item.title_np || 'School activity', item.title_np || item.title_en || 'विद्यालय गतिविधि')}
                </h2>
              </div>
            </div>
            );
          })}
        </div>
        )}

        {/* Gallery Image Preview Lightbox */}
        {previewItem && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setPreviewItem(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                    {previewItem.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {t(previewItem.title_en, previewItem.title_np)}
                  </h3>
                </div>
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                  tooltip={t('Close preview', 'बन्द गर्नुहोस्')}
                  aria-label={t('Close preview', 'बन्द गर्नुहोस्')}
                />
              </div>

              <div className="px-4 pb-4">
                <div className="max-h-[65vh] w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  {(previewItem.image || previewItem.url) && !failedImages.has(previewItem.id) ? (
                    <img
                      src={getApiUrl(previewItem.image || previewItem.url || '')}
                      alt={previewItem.title_en || previewItem.title_np || t('School gallery photo', 'विद्यालय ग्यालरी तस्बिर')}
                      className="max-h-[65vh] w-full object-contain"
                      onError={() => setFailedImages((previous) => new Set(previous).add(previewItem.id))}
                    />
                  ) : (
                    <div className="py-20">
                      {renderIcon(previewItem.iconType || 'camera')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;
