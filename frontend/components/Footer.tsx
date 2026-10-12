import React, { useState } from 'react';
import { Language, SchoolData, SiteCustomizerConfig, UsefulLink } from '../types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Shield
} from 'lucide-react';
import { FooterPolicyModal } from './FooterPolicyModal';
import { EducationalBackground } from './EducationalBackground';

interface FooterProps {
  lang: Language;
  school: SchoolData;
  onRouteChange: (route: string) => void;
  siteConfig?: SiteCustomizerConfig;
}

const isSafeUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
    return false;
  }
  return /^https?:\/\//i.test(trimmed);
};

const defaultOfficialResources: UsefulLink[] = [
  {
    id: 'moest',
    titleEn: 'Ministry of Education, Science & Technology',
    titleNp: 'शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय',
    url: 'https://moest.gov.np',
    enabled: true,
    order: 1
  },
  {
    id: 'cdc',
    titleEn: 'Curriculum Development Centre (CDC)',
    titleNp: 'पाठ्यक्रम विकास केन्द्र',
    url: 'https://moecdc.gov.np',
    enabled: true,
    order: 2
  },
  {
    id: 'neb',
    titleEn: 'National Examination Board (NEB)',
    titleNp: 'राष्ट्रिय परीक्षा बोर्ड',
    url: 'https://neb.gov.np',
    enabled: true,
    order: 3
  },
  {
    id: 'cehrd',
    titleEn: 'Center for Education & Human Resource (CEHRD)',
    titleNp: 'शिक्षा तथा मानव स्रोत विकास केन्द्र',
    url: 'https://cehrd.gov.np',
    enabled: true,
    order: 4
  }
];

export const Footer: React.FC<FooterProps> = ({
  lang,
  school,
  onRouteChange,
  siteConfig,
}) => {
  const [policyModalOpen, setPolicyModalOpen] = useState<boolean>(false);
  const [policyTab, setPolicyTab] = useState<'privacy' | 'terms'>('privacy');

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Dynamic School Narrative
  const footerDescription = isNp
    ? (siteConfig?.footerDescNp || 'वि.सं. २०३५ देखि गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको अग्रणी नमुना सामुदायिक विद्यालय।')
    : (siteConfig?.footerDescEn || 'Committed to excellence, integrity, and social responsibility in public secondary education since 2028 B.S.');

  // Clean primary phone and email for tel:/mailto: links
  const primaryPhone = school.phone ? school.phone.split('/')[0].trim() : '';
  const primaryEmail = school.email ? school.email.trim() : '';

  // Column 2: Exactly 5 Quick Links with clean text (NO '>' or chevrons)
  const quickLinks = [
    { id: 'home', en: 'Home', np: 'गृहपृष्ठ' },
    { id: 'about', en: 'About', np: 'हाम्रो बारेमा' },
    { id: 'notices', en: 'Notice', np: 'सूचना तथा परिपत्र' },
    { id: 'curriculum', en: 'Curriculum Guidelines', np: 'पाठ्यक्रम निर्देशिका' },
    { id: 'contact', en: 'Contact', np: 'सम्पर्क' },
  ];

  // Column 3: Useful Resources (Dynamic admin-managed official government & education links)
  const rawResources = siteConfig?.usefulLinks && siteConfig.usefulLinks.length > 0
    ? siteConfig.usefulLinks
    : defaultOfficialResources;

  const usefulResources = rawResources
    .filter(item => item.enabled !== false && item.status !== 'draft' && isSafeUrl(item.url))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleOpenPolicy = (tab: 'privacy' | 'terms') => {
    setPolicyTab(tab);
    setPolicyModalOpen(true);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden w-full bg-[#020617] text-slate-400 border-t border-slate-800/80 mt-auto text-xs"
      aria-label={t('School Footer', 'विद्यालय पादपृष्ठ')}
    >
      {/* Educational Background Watermark (Graduation Cap / Academic Achievement) */}
      <EducationalBackground
        config={siteConfig?.educationalBackgrounds?.footer}
        defaultPreset="graduation_cap"
        placement="bottom-right"
        className="text-blue-200"
      />

      {/* Main Footer Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        {/* Compact 4-Column Grid (Desktop: 4 columns, Tablet: 2x2, Mobile: stacked) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 items-start">
          {/* Column 1: School Identity */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {school.logo_url && school.logo_url.trim() ? (
                <img
                  src={school.logo_url}
                  alt={t(school.name_en, school.name_np)}
                  className="h-10 sm:h-12 md:h-14 w-auto max-w-[160px] object-contain shrink-0"
                />
              ) : (
                <div className="h-10 sm:h-12 md:h-14 w-10 sm:w-12 md:w-14 rounded-lg bg-[#1E40AF] text-white flex items-center justify-center font-bold text-lg shrink-0">
                  <span>{school.name_en ? school.name_en.charAt(0) : 'I'}</span>
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-white font-bold text-sm leading-tight">
                  {t(school.name_en, school.name_np)}
                </h3>
                {Boolean(school.tagline_en || school.tagline_np) && (
                  <p className="text-[11px] text-blue-400 font-medium leading-tight mt-1">
                    {t(school.tagline_en, school.tagline_np)}
                  </p>
                )}
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
              {footerDescription}
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
              {school.code && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  EMIS: {school.code}
                </span>
              )}
              {(school.estd_bs || school.estd_ad) && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {t(
                    `Estd. ${school.estd_bs ? `${school.estd_bs} B.S.` : ''}${school.estd_ad ? ` (${school.estd_ad} A.D.)` : ''}`,
                    `स्था. ${school.estd_bs ? `${school.estd_bs} वि.सं.` : ''}${school.estd_ad ? ` (${school.estd_ad} ई.सं.)` : ''}`
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
              {t('Quick Links', 'द्रुत लिङ्कहरू')}
            </h4>
            <nav aria-label={t('Footer quick links', 'पादपृष्ठ द्रुत लिङ्कहरू')}>
              <ul className="space-y-1.5">
                {quickLinks.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onRouteChange(item.id)}
                      className="text-slate-400 hover:text-white transition-colors duration-150 text-xs text-left block py-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
                    >
                      {t(item.en, item.np)}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Useful Resources (Official educational & government portals) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
              {t('Useful Resources', 'महत्त्वपूर्ण स्रोतहरू')}
            </h4>
            <nav aria-label={t('Official Educational and Government Resources', 'महत्त्वपूर्ण शैक्षिक तथा सरकारी स्रोतहरू')}>
              <ul className="space-y-1.5">
                {usefulResources.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors duration-150 text-xs inline-flex items-center gap-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded group"
                      title={t(item.titleEn, item.titleNp || item.titleEn)}
                    >
                      <span className="truncate max-w-[210px]">{t(item.titleEn, item.titleNp || item.titleEn)}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400 shrink-0 stroke-[2]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider border-b border-slate-800/80 pb-2">
              {t('Contact', 'सम्पर्क')}
            </h4>

            <div className="space-y-2.5 text-xs">
              {/* Address */}
              <div className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <p className="text-slate-300 font-medium">
                    {t('Administrative Secretariat', 'प्रशासनिक सचिवालय')}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {t(school.address_en, school.address_np) || t('Ward No. 4, Nepal', 'वडा नं. ४, नेपाल')}
                  </p>
                </div>
              </div>

              {/* Phone */}
              {school.phone && (
                <div className="flex items-start gap-2.5 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <a
                    href={primaryPhone ? `tel:${primaryPhone}` : undefined}
                    className="hover:text-white transition-colors duration-150 font-mono leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
                  >
                    {school.phone}
                  </a>
                </div>
              )}

              {/* Email */}
              {school.email && (
                <div className="flex items-start gap-2.5 text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <a
                    href={primaryEmail ? `mailto:${primaryEmail}` : undefined}
                    className="hover:text-white transition-colors duration-150 break-all leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded"
                  >
                    {school.email}
                  </a>
                </div>
              )}

              {/* Opening Hours */}
              <div className="flex items-start gap-2.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-snug text-[11px]">
                  {t('Sun–Fri: 9:30 AM – 4:30 PM', 'आइतबार–शुक्रबार: बिहान ९:३०–४:३०')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="w-full bg-[#0B1220] border-t border-slate-800/70 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          {/* Left: Dynamic Year & Database-Driven School Name */}
          <div className="text-center sm:text-left">
            <p>
              © {currentYear} {t(school.name_en, school.name_np)}. {t('All Rights Reserved.', 'सर्वाधिकार सुरक्षित।')}
            </p>
          </div>

          {/* Right: Policy Links & Administrative Access */}
          <div className="flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => handleOpenPolicy('privacy')}
              className="text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded px-1"
            >
              {t('Privacy Policy', 'गोपनीयता नीति')}
            </button>
            <span className="text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => handleOpenPolicy('terms')}
              className="text-slate-400 hover:text-white transition-colors duration-150 cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded px-1"
            >
              {t('Terms & Conditions', 'प्रयोगका सर्तहरू')}
            </button>
            <span className="text-slate-700 select-none">•</span>
            <button
              type="button"
              onClick={() => onRouteChange('admin')}
              className="text-slate-400 hover:text-blue-300 transition-colors duration-150 cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-400 rounded px-1 inline-flex items-center gap-1 font-medium"
              title={t('Administrative CMS Portal', 'प्रशासनिक पोर्टल')}
            >
              <Shield className="w-3 h-3 text-slate-400" />
              <span>{t('Admin Portal', 'प्रशासन पोर्टल')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Institutional Policy Modal */}
      <FooterPolicyModal
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialTab={policyTab}
        lang={lang}
        school={school}
      />
    </footer>
  );
};
