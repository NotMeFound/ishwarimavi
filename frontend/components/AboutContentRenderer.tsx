import React, { useState } from 'react';
import { Language } from '../types';

export interface InlineImageData {
  url: string;
  align: 'left' | 'right' | 'center' | 'full';
  size: 'small' | 'medium' | 'large' | 'full';
  alt: string;
  caption?: string;
}

interface AboutContentRendererProps {
  content?: string;
  lang?: Language;
  className?: string;
}

/**
 * Parses content containing text, markdown formatting, and inline images:
 * Syntax supported:
 * 1. Shortcode: [[image:URL|align:left|size:medium|alt:Alt text|caption:Optional caption]]
 * 2. Markdown image: ![Alt text](URL "Optional caption")
 * 3. Markdown with attributes: ![Alt text](URL){align=right size=medium caption="Caption"}
 */
export const AboutContentRenderer: React.FC<AboutContentRendererProps> = ({
  content = '',
  lang = 'en',
  className = ''
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!content || !content.trim()) {
    return null;
  }

  // Tokenize the content into text blocks and inline image tokens
  const tokens: Array<
    | { type: 'text'; text: string }
    | { type: 'image'; data: InlineImageData }
  > = [];

  // Combined regex for [[image:...]] and ![alt](url)
  const regex = /\[\[image:(.+?)\]\]|!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(?:\{([^}]+)\})?/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // Push preceding text if any
    if (match.index > lastIndex) {
      const textChunk = content.slice(lastIndex, match.index);
      if (textChunk.trim()) {
        tokens.push({ type: 'text', text: textChunk });
      }
    }

    if (match[1]) {
      // Shortcode format: [[image:URL|align:left|size:medium|alt:...|caption:...]]
      const parts = match[1].split('|').map((p) => p.trim());
      const rawUrl = parts[0].replace(/^url:/i, '').trim();
      let align: 'left' | 'right' | 'center' | 'full' = 'center';
      let size: 'small' | 'medium' | 'large' | 'full' = 'medium';
      let alt = 'Ishwari Secondary School photograph';
      let caption = '';

      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (/^align:/i.test(part)) {
          const val = part.replace(/^align:/i, '').trim().toLowerCase();
          if (val === 'left' || val === 'right' || val === 'center' || val === 'full') {
            align = val;
          }
        } else if (/^size:/i.test(part)) {
          const val = part.replace(/^size:/i, '').trim().toLowerCase();
          if (val === 'small' || val === 'medium' || val === 'large' || val === 'full') {
            size = val;
          }
        } else if (/^alt:/i.test(part)) {
          alt = part.replace(/^alt:/i, '').trim();
        } else if (/^caption:/i.test(part)) {
          caption = part.replace(/^caption:/i, '').trim();
        }
      }

      if (rawUrl) {
        tokens.push({
          type: 'image',
          data: { url: rawUrl, align, size, alt, caption }
        });
      }
    } else if (match[3]) {
      // Markdown format: ![alt](url "caption"){attrs}
      const alt = match[2] || 'Ishwari Secondary School photograph';
      const url = match[3];
      let caption = match[4] || '';
      let align: 'left' | 'right' | 'center' | 'full' = 'center';
      let size: 'small' | 'medium' | 'large' | 'full' = 'medium';

      const attrStr = match[5];
      if (attrStr) {
        const alignMatch = attrStr.match(/align\s*=\s*(["']?)(left|right|center|full)\1/i);
        if (alignMatch) align = alignMatch[2].toLowerCase() as any;

        const sizeMatch = attrStr.match(/size\s*=\s*(["']?)(small|medium|large|full)\1/i);
        if (sizeMatch) size = sizeMatch[2].toLowerCase() as any;

        const captionMatch = attrStr.match(/caption\s*=\s*(["'])(.*?)\1/i);
        if (captionMatch) caption = captionMatch[2];
      }

      if (url) {
        tokens.push({
          type: 'image',
          data: { url, align, size, alt, caption }
        });
      }
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  if (lastIndex < content.length) {
    const textChunk = content.slice(lastIndex);
    if (textChunk.trim()) {
      tokens.push({ type: 'text', text: textChunk });
    }
  }

  // Helper to format inline markdown spans (bold, italic, links)
  const renderFormattedText = (raw: string) => {
    // Process markdown headings if line starts with ### or ##
    const lines = raw.split('\n');
    return lines.map((line, lIdx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={lIdx} className="h-3" aria-hidden="true" />;
      }

      if (trimmed.startsWith('### ')) {
        return (
          <h3
            key={lIdx}
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2 tracking-tight"
          >
            {trimmed.slice(4)}
          </h3>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2
            key={lIdx}
            className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2 tracking-tight"
          >
            {trimmed.slice(3)}
          </h2>
        );
      }

      // Check if bullet point
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        return (
          <div key={lIdx} className="flex items-start gap-2.5 my-1 pl-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF] mt-2 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {trimmed.slice(2)}
            </span>
          </div>
        );
      }

      // Parse bold **text** and *italic*
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p
          key={lIdx}
          className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-3 last:mb-0"
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-bold text-slate-900 dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={pIdx} className="italic text-slate-800 dark:text-slate-200">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Helper to render image element with responsive alignment & sizing
  const renderInlineImage = (img: InlineImageData, idx: number) => {
    if (!img.url || !img.url.trim() || failedImages[img.url]) {
      // Gracefully handle missing or broken images without showing broken icons or empty boxes
      return null;
    }

    // Size constraints
    let sizeClasses = 'w-full md:max-w-md';
    if (img.size === 'small') {
      sizeClasses = 'w-full md:max-w-[260px]';
    } else if (img.size === 'medium') {
      sizeClasses = 'w-full md:max-w-[400px]';
    } else if (img.size === 'large') {
      sizeClasses = 'w-full md:max-w-[560px]';
    } else if (img.size === 'full') {
      sizeClasses = 'w-full';
    }

    // Alignment & Responsive behavior (CRITICAL requirement):
    // Desktop: Left or Right floats allow text wrap.
    // Mobile: Automatically switches to stacked layout to prevent cramped text around tiny images!
    let containerClasses = '';
    if (img.align === 'left') {
      containerClasses = `float-none md:float-left md:mr-6 md:mb-4 mb-5 clear-both md:clear-left ${sizeClasses}`;
    } else if (img.align === 'right') {
      containerClasses = `float-none md:float-right md:ml-6 md:mb-4 mb-5 clear-both md:clear-right ${sizeClasses}`;
    } else if (img.align === 'full') {
      containerClasses = 'w-full my-6 clear-both block';
    } else {
      // Center
      containerClasses = `mx-auto my-6 clear-both block text-center ${sizeClasses}`;
    }

    return (
      <figure
        key={`img-${idx}`}
        className={`group ${containerClasses} transition-all duration-200`}
        aria-label={img.alt}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900 shadow-2xs">
          <img
            src={img.url}
            alt={img.alt || 'School photograph'}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => {
              setFailedImages((prev) => ({ ...prev, [img.url]: true }));
            }}
            className="w-full h-auto object-cover max-h-[500px] mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Subtle, professional caption - only render if caption exists */}
        {img.caption && img.caption.trim() && (
          <figcaption className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic text-center leading-normal px-2">
            <span className="font-semibold text-slate-400 dark:text-slate-500 not-italic mr-1.5">📷</span>
            {img.caption.trim()}
          </figcaption>
        )}
      </figure>
    );
  };

  return (
    <div className={`about-content-flow clearfix prose-slate dark:prose-invert max-w-none ${className}`}>
      {tokens.map((token, idx) => {
        if (token.type === 'image') {
          return renderInlineImage(token.data, idx);
        }
        return <div key={`txt-${idx}`}>{renderFormattedText(token.text)}</div>;
      })}
      {/* Clear floats at the end of content */}
      <div className="clear-both" />
    </div>
  );
};
