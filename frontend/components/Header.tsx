import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, ThemeMode, SchoolData, SiteCustomizerConfig, SecurityConfig, Notice } from '../types';
import {
  Sun,
  Moon,
  Lock,
  Search,
  Menu,
  X,
  FileCode,
  Download,
  Calendar,
  Bell,
  Phone,
  Mail,
  GraduationCap,
  Building2,
  Users,
  Award,
  BookOpen,
  BookMarked,
  Image,
  MessageSquare,
  FileText,
  ShieldCheck,
  MapPin,
  ExternalLink,
  ChevronDown,
  Globe,
  Briefcase
} from 'lucide-react';
import { BlurSharpStatement, InteractiveCharacterHeading } from './InteractiveTypography';
import { AccessibilityControl } from './AccessibilityControl';

// Authentic crisp SVG flag for Great Britain (United Kingdom)
export const BritishFlag: React.FC<{ className?: string }> = ({ className = "w-4.5 h-3" }) => (
  <svg className={`${className} rounded-xs shadow-2xs shrink-0 inline-block overflow-hidden`} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="uk-flag-clip"><rect width="60" height="30" rx="1.5" /></clipPath>
    <g clipPath="url(#uk-flag-clip)">
      <rect width="60" height="30" fill="#012169"/>
      <path d="M0 0L60 30M60 0L0 30" stroke="#FFFFFF" strokeWidth="6"/>
      <path d="M0 0L60 30M60 0L0 30" stroke="#C8102E" strokeWidth="2"/>
      <path d="M30 0V30M0 15H60" stroke="#FFFFFF" strokeWidth="10"/>
      <path d="M30 0V30M0 15H60" stroke="#C8102E" strokeWidth="6"/>
    </g>
  </svg>
);

// High-Definition Official Large Nepal Flag with authentic celestial emblems, double-pennant proportions, elegant thin pole/stand, and natural wind fabric wave
export const LargeNepalFlag: React.FC<{
  className?: string;
  showStand?: boolean;
  wave?: boolean;
}> = ({
  className = "h-8 sm:h-9 w-auto",
  showStand = true,
  wave = true,
}) => (
  <div
    className="inline-flex items-center select-none shrink-0 filter drop-shadow-xs"
    title="National Flag of Nepal"
    aria-label="National Flag of Nepal"
  >
    {/* Subtle, proportional flag pole & stand */}
    {showStand && (
      <div className="flex flex-col items-center mr-0.5 shrink-0 select-none pointer-events-none self-center z-10">
        {/* Finial Spear Tip (Brass/Gold) */}
        <div className="w-1.5 h-1.5 bg-gradient-to-t from-amber-400 to-amber-200 rounded-full shadow-2xs" />
        {/* Clean, thin vertical pole */}
        <div className="w-[2px] h-9 sm:h-10 bg-gradient-to-b from-amber-300 via-slate-300 to-amber-600 rounded-full shadow-2xs -my-0.5" />
        {/* Weighted round base stand */}
        <div className="w-3 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full shadow-2xs" />
      </div>
    )}

    {/* Waving Fabric Container extending freely from the pole */}
    <div className={wave ? "animate-flag-wave shrink-0 flex items-center" : "shrink-0 flex items-center"}>
      <svg
        className={`${className} shrink-0 inline-block select-none overflow-visible`}
        viewBox="0 0 100 122"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ aspectRatio: '100 / 122' }}
        aria-label="National Flag of Nepal"
      >
        {/* Deep Blue Outer Border (#003893) */}
        <path
          d="M4 2 L96 56 L36 56 L92 118 L4 118 Z"
          fill="#003893"
          stroke="#003893"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Crimson Red Field (#DC143C) */}
        <path
          d="M10 9 L82 50 L30 50 L78 111 L10 111 Z"
          fill="#DC143C"
          stroke="#DC143C"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Upper Triangle: Radiant Crescent Moon with rays */}
        <path
          d="M20 33 A 14 14 0 0 0 46 33 A 12 12 0 0 1 20 33 Z"
          fill="#FFFFFF"
        />
        <circle cx="33" cy="27.5" r="3.2" fill="#FFFFFF" />
        {/* Radiant Moon Rays */}
        <polygon points="33,21 34.2,25 31.8,25" fill="#FFFFFF" />
        <polygon points="27,23 30,26 28.5,27.5" fill="#FFFFFF" />
        <polygon points="39,23 37.5,27.5 36,26" fill="#FFFFFF" />
        <polygon points="23,27 27,28.5 26.5,30.5" fill="#FFFFFF" />
        <polygon points="43,27 39.5,30.5 39,28.5" fill="#FFFFFF" />

        {/* Lower Triangle: 12-Ray Sun Symbol */}
        <circle cx="33" cy="81" r="7.5" fill="#FFFFFF" />
        {/* 12 Sharp Triangular Sun Rays at 30° increments */}
        <polygon points="33,69 31.2,74.5 34.8,74.5" fill="#FFFFFF" />
        <polygon points="39,70.6 34.8,75 37.8,77.2" fill="#FFFFFF" />
        <polygon points="43.4,75 37.2,77.2 38.8,80.5" fill="#FFFFFF" />
        <polygon points="45,81 39.5,79.2 39.5,82.8" fill="#FFFFFF" />
        <polygon points="43.4,87 38.8,81.5 37.2,84.8" fill="#FFFFFF" />
        <polygon points="39,91.4 37.8,84.8 34.8,87" fill="#FFFFFF" />
        <polygon points="33,93 34.8,87.5 31.2,87.5" fill="#FFFFFF" />
        <polygon points="27,91.4 31.2,87 28.2,84.8" fill="#FFFFFF" />
        <polygon points="22.6,87 28.8,84.8 27.2,81.5" fill="#FFFFFF" />
        <polygon points="21,81 26.5,82.8 26.5,79.2" fill="#FFFFFF" />
        <polygon points="22.6,75 27.2,80.5 28.8,77.2" fill="#FFFFFF" />
        <polygon points="27,70.6 28.2,77.2 31.2,75" fill="#FFFFFF" />
      </svg>
    </div>
  </div>
);

// Clean, Borderless Institutional Logo Component
export const InstitutionalLogo: React.FC<{
  school: SchoolData;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}> = ({ school, size = 'medium', className = '' }) => {
  // Enhanced, larger height presets adhering strictly to design guidelines:
  // Desktop: 76–96px | Tablet: 64–76px | Mobile: 52–64px
  const heightClass =
    size === 'large'
      ? 'h-16 sm:h-20 md:h-24 lg:h-24 max-h-24'
      : size === 'small'
      ? 'h-12 sm:h-14 md:h-16 lg:h-18 max-h-18'
      : 'h-14 sm:h-18 md:h-20 lg:h-[84px] max-h-[84px]'; // Medium default

  if (school.logo_url && school.logo_url.trim().length > 0) {
    return (
      <div className={`shrink-0 flex items-center justify-center bg-transparent border-0 ring-0 shadow-none outline-hidden select-none ${className}`}>
        {/* Borderless logo container preserving transparent backgrounds and aspect ratio without stretching */}
        <img
          src={school.logo_url}
          alt={school.name_en || 'School Logo'}
          className={`${heightClass} w-auto max-w-[140px] sm:max-w-[170px] md:max-w-[200px] lg:max-w-[230px] object-contain select-none transition-all duration-200 filter drop-shadow-xs`}
        />
      </div>
    );
  }

  // Borderless institutional fallback emblem when no custom logo is uploaded
  return (
    <div className={`shrink-0 flex items-center justify-center bg-transparent border-0 ring-0 shadow-none outline-hidden select-none ${className}`}>
      <div className={`${heightClass} aspect-square rounded-2xl bg-linear-to-br from-[#1E3A8A] via-[#1E40AF] to-[#0F172A] p-2.5 flex flex-col items-center justify-center text-white shadow-sm select-none border-0`}>
        <span className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-amber-300 leading-none drop-shadow-xs select-none">ई</span>
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-blue-100 font-bold uppercase mt-1 select-none">२०३५</span>
      </div>
    </div>
  );
};

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeRoute: string;
  onRouteChange: (route: string) => void;
  onOpenSearch: () => void;
  school: SchoolData;
  siteConfig?: SiteCustomizerConfig;
  securityConfig?: SecurityConfig;
  notices?: Notice[];
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  activeRoute,
  onRouteChange,
  onOpenSearch,
  school,
  siteConfig,
  securityConfig,
  notices = [],
}) => {
  const [bsTime, setBsTime] = useState<string>('');
  const [bsTimeCompact, setBsTimeCompact] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState<boolean>(false);
  const moreRef = React.useRef<HTMLDivElement>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Dynamic Header CMS Settings
  const headerCfg = siteConfig?.header;
  const showTopBar = headerCfg ? headerCfg.showTopBar : true;
  const showNationalFlag = headerCfg ? headerCfg.showNationalFlag : true;
  const flagMode = headerCfg?.flagMode || 'default_nepal';
  const customFlagImage = headerCfg?.customFlagImage || '';
  const flagSize = headerCfg?.flagSize || 'normal';
  const flagPosition = headerCfg?.flagPosition || 'after_theme';

  const showAlertTicker = headerCfg ? headerCfg.showAlertTicker : (siteConfig ? siteConfig.showAlertTicker : true);
  const tickerMode = headerCfg?.tickerMode || 'auto_pinned';
  const tickerBadgeText = isNp
    ? (headerCfg?.tickerTitleNp || 'ताजा समाचार')
    : (headerCfg?.tickerTitleEn || 'Latest News');
  const selectedNoticeId = headerCfg?.selectedNoticeId;

  const showAcademicYear = headerCfg?.showAcademicYear !== false;
  const academicYearLabel = isNp
    ? (headerCfg?.academicYearLabelNp || 'वार्षिक')
    : (headerCfg?.academicYearLabelEn || 'Annual');
  const academicYearValue = siteConfig?.academicYear?.currentYear || headerCfg?.academicYearValue || '2083 B.S.';
  const academicYearSeparator = headerCfg?.academicYearSeparator || '|';

  const showBsClock = headerCfg ? headerCfg.showBsClock : true;
  const showDate = headerCfg?.showDate !== false;
  const dateFormat = headerCfg?.dateFormat || 'full';
  const showTime = headerCfg?.showTime !== false;
  const timeFormat = headerCfg?.timeFormat || '12h';
  const showSeconds = headerCfg?.showSeconds !== false;
  const showWeekday = headerCfg?.showWeekday !== false;
  const showNepaliDate = headerCfg?.showNepaliDate !== false;

  const showSearchButton = headerCfg ? headerCfg.showSearchButton : true;
  const searchPlaceholderText = isNp
    ? (headerCfg?.searchPlaceholderNp || 'खोज्नुहोस्')
    : (headerCfg?.searchPlaceholderEn || 'Search');
  const showSearchShortcut = headerCfg?.showSearchShortcut !== false;

  const showLanguageToggle = headerCfg ? headerCfg.showLanguageToggle : true;
  const langLabelNp = headerCfg?.langLabelNp || 'नेपा';
  const langLabelEn = headerCfg?.langLabelEn || 'EN';

  const showThemeSwitch = headerCfg ? headerCfg.showThemeSwitch : true;
  const showSchoolBadges = headerCfg ? headerCfg.showSchoolBadges : true;
  const showTagline = headerCfg ? headerCfg.showTagline : true;
  const showAddress = headerCfg ? headerCfg.showAddress : true;
  const showAdmissionCta = headerCfg ? headerCfg.showAdmissionCta : true;
  const admissionCtaText = isNp
    ? (headerCfg?.admissionCtaTextNp || 'नयाँ भर्ना २०८३')
    : (headerCfg?.admissionCtaTextEn || 'Admission 2083');
  const admissionCtaRoute = headerCfg?.admissionCtaRoute || 'academics';
  const showHelpline = headerCfg ? headerCfg.showHelpline : true;
  const helplinePhone = headerCfg?.helplinePhone || school.phone.split('/')[0].trim();
  const isSticky = headerCfg ? headerCfg.stickyHeader : true;

  // School Header Identity & Appearance Controls (Admin Managed)
  const showLogo = (headerCfg?.showLogo !== undefined ? headerCfg.showLogo : school.show_logo) !== false;
  const showSchoolIdentity = (headerCfg?.showSchoolIdentity !== undefined ? headerCfg.showSchoolIdentity : school.show_school_identity) !== false;
  const showEmis = (headerCfg?.showEmis !== undefined ? headerCfg.showEmis : school.show_emis) !== false;
  const showEstd = (headerCfg?.showEstd !== undefined ? headerCfg.showEstd : school.show_estd) !== false;
  const showNepaliName = (headerCfg?.showNepaliName !== undefined ? headerCfg.showNepaliName : school.show_nepali_name) !== false;
  const logoSize = (headerCfg?.logoSize || school.logo_size || 'medium') as 'small' | 'medium' | 'large';
  const schoolNameSize = (headerCfg?.schoolNameSize || school.school_name_size || 'medium') as 'small' | 'medium' | 'large';
  const nepaliNameSize = (headerCfg?.nepaliNameSize || school.nepali_name_size || 'medium') as 'small' | 'medium' | 'large';
  const identityAlignment = (headerCfg?.headerIdentityAlignment || school.header_identity_alignment || 'center') as 'center' | 'left';

  const cleanEmisCode = (code: string) => {
    return code ? code.replace(/^EMIS:\s*/i, '').trim() : '';
  };

  // Typography responsive size class mappings
  const schoolNameSizeClass = {
    small: 'text-lg sm:text-xl md:text-2xl lg:text-[24px]',
    medium: 'text-xl sm:text-2xl md:text-[26px] lg:text-[28px]',
    large: 'text-2xl sm:text-[26px] md:text-[28px] lg:text-[32px]',
  }[schoolNameSize] || 'text-xl sm:text-2xl md:text-[26px] lg:text-[28px]';

  const nepaliNameSizeClass = {
    small: 'text-sm sm:text-base md:text-lg lg:text-[18px]',
    medium: 'text-base sm:text-lg md:text-xl lg:text-[20px]',
    large: 'text-lg sm:text-xl md:text-2xl lg:text-[24px]',
  }[nepaliNameSize] || 'text-base sm:text-lg md:text-xl lg:text-[20px]';

  // Automated Pinned, Selected, or Latest Notices Ticker
  const activeTickerNotices = tickerMode === 'latest_notices'
    ? notices.slice(0, 5)
    : (notices.filter(n => n.pinned).length > 0 ? notices.filter(n => n.pinned) : notices.slice(0, 4));

  let tickerItems: string[] = [];
  if (tickerMode === 'selected_notice' && selectedNoticeId) {
    const matchedNotice = notices.find(n => String(n.id) === String(selectedNoticeId));
    if (matchedNotice) {
      tickerItems = [isNp ? (matchedNotice.title_np || matchedNotice.title_en) : (matchedNotice.title_en || matchedNotice.title_np)];
    }
  }

  if (tickerItems.length === 0) {
    if (tickerMode === 'custom' || activeTickerNotices.length === 0) {
      tickerItems = [
        isNp
          ? (siteConfig?.alertTickerNp || 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका तथा नयाँ भर्ना सम्बन्धी सूचना')
          : (siteConfig?.alertTickerEn || 'Notice regarding Academic Session 2083 Annual Examination & Admissions')
      ];
    } else {
      tickerItems = activeTickerNotices.map(n => isNp ? (n.title_np || n.title_en) : (n.title_en || n.title_np));
    }
  }

  const tickerKey = `ticker-${tickerMode}-${selectedNoticeId || 'all'}-${activeTickerNotices.map(n => `${n.id}-${n.pinned}`).join('_')}-${isNp ? 'np' : 'en'}`;

  // Close "More" dropdown on route change or clicking outside
  useEffect(() => {
    setMoreMenuOpen(false);
  }, [activeRoute]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live ticking Bikram Sambat Date & Time Engine with Kathmandu Timezone
  useEffect(() => {
    const nepaliDigits: Record<string, string> = {
      '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
      '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };
    const weekdaysEnFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdaysEnShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdaysNpFull = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
    const weekdaysNpShort = ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      let dayIdx = now.getDay();

      try {
        const ktmParts = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kathmandu',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        }).formatToParts(now);

        for (const p of ktmParts) {
          if (p.type === 'hour') hours = parseInt(p.value, 10);
          if (p.type === 'minute') minutes = parseInt(p.value, 10);
          if (p.type === 'second') seconds = parseInt(p.value, 10);
        }
      } catch {
        // Fallback to local time
      }

      // Build Date Segment
      let datePart = '';
      let datePartCompact = '';
      if (showDate) {
        let weekdayPart = '';
        let weekdayPartShort = '';
        if (showWeekday) {
          if (isNp) {
            weekdayPart = dateFormat === 'short' ? weekdaysNpShort[dayIdx] : weekdaysNpFull[dayIdx];
            weekdayPartShort = weekdaysNpShort[dayIdx];
          } else {
            weekdayPart = dateFormat === 'short' ? weekdaysEnShort[dayIdx] : weekdaysEnFull[dayIdx];
            weekdayPartShort = weekdaysEnShort[dayIdx];
          }
        }

        let calDatePart = '';
        if (showNepaliDate) {
          calDatePart = isNp ? '२०८३ भाद्र २०' : 'Bhadra 20, 2083';
        } else {
          const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthsNp = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
          if (isNp) {
            const dStr = String(now.getDate()).split('').map(d => nepaliDigits[d] || d).join('');
            const yStr = String(now.getFullYear()).split('').map(d => nepaliDigits[d] || d).join('');
            calDatePart = `${yStr} ${monthsNp[now.getMonth()]} ${dStr}`;
          } else {
            calDatePart = `${monthsEn[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
          }
        }

        if (weekdayPart && calDatePart) {
          datePart = `${weekdayPart}, ${calDatePart}`;
        } else {
          datePart = weekdayPart || calDatePart;
        }

        if (weekdayPartShort && calDatePart) {
          datePartCompact = `${weekdayPartShort}, ${calDatePart}`;
        } else {
          datePartCompact = weekdayPartShort || calDatePart;
        }
      }

      // Build Time Segment
      let timePart = '';
      if (showTime) {
        const isAm = hours < 12;
        let displayHours = hours;
        let period = '';
        if (timeFormat === '12h') {
          displayHours = hours % 12 || 12;
          period = isNp ? (isAm ? 'पूर्वाह्न' : 'अपराह्न') : (isAm ? 'AM' : 'PM');
        }
        const hoursStr = String(displayHours).padStart(2, '0');
        const minStr = String(minutes).padStart(2, '0');
        const secStr = String(seconds).padStart(2, '0');

        if (isNp) {
          const npH = hoursStr.split('').map(d => nepaliDigits[d] || d).join('');
          const npM = minStr.split('').map(d => nepaliDigits[d] || d).join('');
          const npS = secStr.split('').map(d => nepaliDigits[d] || d).join('');
          timePart = showSeconds ? `${npH}:${npM}:${npS}` : `${npH}:${npM}`;
          if (period) timePart += ` ${period}`;
        } else {
          timePart = showSeconds ? `${hoursStr}:${minStr}:${secStr}` : `${hoursStr}:${minStr}`;
          if (period) timePart += ` ${period}`;
        }
      }

      if (datePart && timePart) {
        setBsTime(`${datePart} | ${timePart}`);
      } else {
        setBsTime(datePart || timePart);
      }

      if (datePartCompact && timePart) {
        setBsTimeCompact(`${datePartCompact} | ${timePart}`);
      } else {
        setBsTimeCompact(datePartCompact || timePart);
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isNp, showDate, dateFormat, showTime, timeFormat, showSeconds, showWeekday, showNepaliDate]);

  // Interface for type-safe nav definitions
  interface NavItemDef {
    id: string;
    labelEn: string;
    labelNp: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    descEn?: string;
    descNp?: string;
  }

  // Streamlined Primary Navigation (manageable 6 items)
  const primaryNavItems: NavItemDef[] = [
    { id: 'home', labelEn: 'Home', labelNp: 'गृहपृष्ठ', icon: GraduationCap },
    { id: 'about', labelEn: 'About', labelNp: 'हाम्रो बारेमा', icon: Building2 },
    { id: 'academics', labelEn: 'Academics', labelNp: 'शैक्षिक', icon: BookOpen, badge: '2083', badgeColor: 'bg-emerald-600' },
    { id: 'notice', labelEn: 'Notice', labelNp: 'सूचना', icon: Bell },
    { id: 'staff', labelEn: 'Faculty', labelNp: 'शिक्षक/कर्मचारी', icon: Users },
    { id: 'facilities', labelEn: 'Facilities', labelNp: 'पूर्वाधार', icon: Building2 },
  ];

  // Secondary Navigation grouped under "More / थप ▾" dropdown
  const moreNavItems: NavItemDef[] = [
    { id: 'academic-calendar', labelEn: 'Academic Calendar', labelNp: 'शैक्षिक क्यालेन्डर', icon: Calendar, badge: '2083', badgeColor: 'bg-blue-600', descEn: 'Annual Schedule & Events', descNp: 'वार्षिक क्यालेन्डर र कार्यक्रम' },
    { id: 'curriculum', labelEn: 'Curriculum Guidelines', labelNp: 'पाठ्यक्रम निर्देशिका', icon: BookMarked, badge: 'PDF', badgeColor: 'bg-blue-600', descEn: 'Guidelines & Syllabi', descNp: 'पाठ्यक्रम तथा अध्ययन सामग्री' },
    { id: 'achievements', labelEn: 'Achievements', labelNp: 'उपलब्धिहरू', icon: Award, badge: '★', badgeColor: 'bg-amber-600', descEn: 'Awards & Honors', descNp: 'विद्यालयका गौरवमय सफलता' },
    { id: 'documents', labelEn: 'Downloads Center', labelNp: 'कागजात तथा डाउनलोड', icon: Download, descEn: 'Forms, Charter & Reports', descNp: 'फारम, नागरिक वडापत्र र प्रतिवेदन' },
    { id: 'gallery', labelEn: 'Photo Gallery', labelNp: 'तस्बिर ग्यालरी', icon: Image, descEn: 'Campus Activities', descNp: 'कार्यक्रम तथा क्रियाकलाप' },
    { id: 'history', labelEn: 'School History', labelNp: 'ऐतिहासिक पृष्ठभूमि', icon: BookOpen, descEn: 'Since 2035 BS', descNp: 'वि.सं. २०३५ देखिको यात्रा' },
  ];

  const isMoreActive = moreNavItems.some(item => item.id === activeRoute);

  const contactNavItem: NavItemDef = { id: 'contact', labelEn: 'Contact', labelNp: 'सम्पर्क', icon: MessageSquare };

  // All nav items for mobile drawer
  const allNavItems: NavItemDef[] = [...primaryNavItems, ...moreNavItems, contactNavItem];

  return (
    <header className={`w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 ${isSticky ? 'sticky top-0' : 'relative'} z-50 shadow-sm transition-colors duration-200`}>
      {/* 1. TOP UTILITY & GOVERNMENT ACCREDITATION STRIP */}
      {showTopBar && (
        <div className="bg-[#0B1528] text-slate-200 border-b border-slate-800 text-xs">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-1 sm:py-1.5 flex items-center justify-between gap-2 sm:gap-3 min-h-[38px]">
            {/* Left: Latest News Automatic Continuous Ticker */}
            <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden flex-1 min-w-0">
              {/* Latest News Automatic Continuous Ticker with Dim Sky Blue Badge */}
              {showAlertTicker && (
                <div className="flex items-center gap-2 sm:gap-2.5 overflow-hidden min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-[#0284C7] dark:bg-sky-600 text-white tracking-wider shrink-0 shadow-xs uppercase">
                    <Bell className="w-2.5 h-2.5 animate-pulse text-white stroke-[2.2]" />
                    <span>{tickerBadgeText}</span>
                  </span>
                  <div
                    key={tickerKey}
                    onClick={() => onRouteChange('notice')}
                    className="overflow-hidden flex-1 relative cursor-pointer"
                    title={t('Click to view all notices', 'सबै सूचनाहरू हेर्न क्लिक गर्नुहोस्')}
                  >
                    <div className="animate-ticker-continuous flex items-center gap-8 py-0.5">
                      {/* Copy 1 */}
                      <div className="flex items-center gap-8 shrink-0">
                        {tickerItems.map((item, idx) => (
                          <span key={`ticker-1-${idx}`} className="text-slate-300 hover:text-white transition font-medium text-xs flex items-center gap-2.5">
                            <span>{item}</span>
                            <span className="text-amber-400 font-bold">•</span>
                          </span>
                        ))}
                      </div>
                      {/* Copy 2 for seamless continuous loop */}
                      <div className="flex items-center gap-8 shrink-0">
                        {tickerItems.map((item, idx) => (
                          <span key={`ticker-2-${idx}`} className="text-slate-300 hover:text-white transition font-medium text-xs flex items-center gap-2.5">
                            <span>{item}</span>
                            <span className="text-amber-400 font-bold">•</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Utilities: Academic Year + Live BS Clock + Compact Search + Language + Theme + Nepal Flag */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Academic Year / Annual Badge */}
              {showAcademicYear && (
                <div
                  className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-200 text-[11px] select-none shrink-0 font-sans"
                  title={t('Academic Year / Session', 'शैक्षिक सत्र / वार्षिक')}
                >
                  <span className="text-slate-400 font-medium">{academicYearLabel}</span>
                  <span className="text-slate-600 font-mono text-[10px]">{academicYearSeparator}</span>
                  <span className="text-amber-400 font-bold font-mono tracking-wide">{academicYearValue}</span>
                </div>
              )}

              {/* Live BS Clock Display: Compact Auto-Width Control (wraps tightly around content) */}
              {showBsClock && (showDate || showTime) && bsTime && (
                <div
                  className="hidden md:inline-flex items-center gap-1.5 w-fit min-w-fit shrink-0 px-2 py-1 rounded-md bg-slate-800/70 border border-slate-700/80 text-slate-200 font-mono text-[11px] leading-none select-none whitespace-nowrap"
                  title={isNp ? 'काठमाडौँ समय' : 'Kathmandu Time'}
                >
                  <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="tabular-nums tracking-normal">
                    <span className="hidden xl:inline">{bsTime}</span>
                    <span className="xl:hidden">{bsTimeCompact || bsTime}</span>
                  </span>
                </div>
              )}

              {/* Compact Search Trigger Button */}
              {showSearchButton && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition cursor-pointer select-none shrink-0"
                  title={t('Search website (Ctrl+K)', 'वेबसाइटमा खोज्नुहोस् (Ctrl+K)')}
                >
                  <Search className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="hidden sm:inline text-[11px] font-sans">{searchPlaceholderText}</span>
                  {showSearchShortcut && (
                    <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-900 text-[9px] font-mono text-slate-400 border border-slate-700">
                      ⌘K
                    </kbd>
                  )}
                </button>
              )}

              {/* Language Switcher: Standardized with Admin Panel Design Language */}
              {showLanguageToggle && (
                <button
                  type="button"
                  id="lang-single-toggle"
                  onClick={onToggleLang}
                  title={isNp ? t('Switch to English', 'अंग्रेजी भाषामा हेर्नुहोस्') : t('नेपालीमा हेर्नुहोस्', 'Switch to Nepali')}
                  aria-label={isNp ? 'Language is Nepali, click to switch to English' : 'Language is English, click to switch to Nepali'}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-700/80 hover:border-slate-600 bg-slate-800/70 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition cursor-pointer select-none shrink-0"
                >
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                  {headerCfg?.langDisplayMode === 'standard' ? (
                    <div className="flex items-center gap-0.5 text-[11px] font-mono tracking-wider">
                      <span className={isNp ? 'text-amber-300 font-bold' : 'text-slate-400 font-normal'}>
                        {langLabelNp}
                      </span>
                      <span className="text-slate-600 text-[9px] px-0.5">/</span>
                      <span className={!isNp ? 'text-amber-300 font-bold' : 'text-slate-400 font-normal'}>
                        {langLabelEn}
                      </span>
                    </div>
                  ) : (
                    <span>{isNp ? 'EN' : 'नेपाली'}</span>
                  )}
                </button>
              )}

              {/* Alternate Flag Position: If configured between Language and Theme */}
              {showNationalFlag && flagPosition === 'before_theme' && (
                <div
                  className="inline-flex items-center justify-center px-0.5 sm:px-1 shrink-0 select-none self-center"
                  title={t('National Flag of Nepal', 'नेपालको राष्ट्रिय झण्डा')}
                  aria-label="National Flag of Nepal"
                >
                  {flagMode === 'custom' && customFlagImage && customFlagImage.trim() ? (
                    <div className="animate-flag-wave shrink-0 flex items-center">
                      <img
                        src={customFlagImage}
                        alt="National Flag"
                        className={`${
                          flagSize === 'large'
                            ? 'h-8 sm:h-9 md:h-10'
                            : flagSize === 'compact'
                            ? 'h-6 sm:h-6.5 md:h-7'
                            : 'h-7 sm:h-7.5 md:h-8'
                        } w-auto object-contain align-middle drop-shadow-2xs`}
                      />
                    </div>
                  ) : (
                    <LargeNepalFlag
                      className={`${
                        flagSize === 'large'
                          ? 'h-8 sm:h-9 md:h-10'
                          : flagSize === 'compact'
                          ? 'h-6 sm:h-6.5 md:h-7'
                          : 'h-7 sm:h-7.5 md:h-8'
                      } w-auto drop-shadow-2xs`}
                    />
                  )}
                </div>
              )}

              {/* Dark/Light Theme Switcher: Standardized with Admin Panel Design Language */}
              {showThemeSwitch && (
                <button
                  type="button"
                  id="theme-toggle-switch"
                  onClick={onToggleTheme}
                  title={theme === 'dark' ? t('Switch to Light Mode', 'लाइट मोडमा जानुहोस्') : t('Switch to Dark Mode', 'डार्क मोडमा जानुहोस्')}
                  className="p-1.5 rounded-md border border-slate-700/80 hover:border-slate-600 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                  aria-label="Toggle color theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                  )}
                </button>
              )}

              {/* Quick Accessibility Widget (Aa) */}
              <AccessibilityControl isNp={isNp} />

              {/* Larger Nepal National Flag on Outer Right Edge (Recommended Hierarchy: ... Date/Time → Search → Language → Theme → Flag) */}
              {showNationalFlag && flagPosition !== 'before_theme' && (
                <div
                  className="inline-flex items-center justify-center pl-1 sm:pl-1.5 shrink-0 select-none self-center"
                  title={t('National Flag of Nepal', 'नेपालको राष्ट्रिय झण्डा')}
                  aria-label="National Flag of Nepal"
                >
                  {flagMode === 'custom' && customFlagImage && customFlagImage.trim() ? (
                    <div className="animate-flag-wave shrink-0 flex items-center">
                      <img
                        src={customFlagImage}
                        alt="National Flag"
                        className={`${
                          flagSize === 'large'
                            ? 'h-8 sm:h-9 md:h-10'
                            : flagSize === 'compact'
                            ? 'h-6 sm:h-6.5 md:h-7'
                            : 'h-7 sm:h-7.5 md:h-8'
                        } w-auto object-contain align-middle drop-shadow-2xs`}
                      />
                    </div>
                  ) : (
                    <LargeNepalFlag
                      className={`${
                        flagSize === 'large'
                          ? 'h-8 sm:h-9 md:h-10'
                          : flagSize === 'compact'
                          ? 'h-6 sm:h-6.5 md:h-7'
                          : 'h-7 sm:h-7.5 md:h-8'
                      } w-auto drop-shadow-2xs`}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. INSTITUTIONAL BRAND HEADER BAR - CENTERED IDENTITY WITH LARGER BORDERLESS LOGO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Desktop Symmetrical 3-Area Grid (>= lg): Perfectly balanced side anchors ensure true optical centering */}
        <div className="hidden lg:grid lg:grid-cols-[240px_1fr_240px] xl:grid-cols-[280px_1fr_280px] items-center gap-4">
          {/* LEFT: School Logo (Anchored on Left, Larger, Completely Borderless) */}
          <div className="flex items-center justify-start shrink-0">
            {showLogo && (
              <button
                onClick={() => onRouteChange('home')}
                className="cursor-pointer focus:outline-hidden hover:opacity-95 transition-opacity inline-flex items-center bg-transparent border-0 p-0"
                aria-label="Go to homepage"
              >
                <InstitutionalLogo school={school} size={logoSize} />
              </button>
            )}
          </div>

          {/* CENTER: Mathematically & Optically Centered Institutional Identity Block */}
          {showSchoolIdentity ? (
            <div className={`flex flex-col ${identityAlignment === 'left' ? 'items-start text-left' : 'items-center text-center'} justify-center w-full px-2`}>
              {/* 1. Main English School Name (Authoritative academic typography with alive character-level reaction) */}
              <h1 className={`${schoolNameSizeClass} font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-sans transition-all`}>
                <InteractiveCharacterHeading
                  text={school.name_en || 'Ishwari Secondary School'}
                  onClick={() => onRouteChange('home')}
                  className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition cursor-pointer text-inherit"
                  highlightHex="#F59E0B"
                  maxLift={3.2}
                  maxScale={0.03}
                />
              </h1>

              {/* 2. Nepali School Name (Prominent Devanagari typography with alive character-level reaction) */}
              {showNepaliName && (
                <h2 className={`${nepaliNameSizeClass} font-bold text-slate-800 dark:text-slate-100 leading-snug tracking-normal mt-0.5 font-['Noto_Sans_Devanagari','Mukta',sans-serif] transition-all`}>
                  <InteractiveCharacterHeading
                    text={school.name_np || 'ईश्वरी माध्यमिक विद्यालय'}
                    onClick={() => onRouteChange('home')}
                    className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition cursor-pointer text-inherit"
                    highlightHex="#F59E0B"
                    maxLift={3.0}
                    maxScale={0.025}
                  />
                </h2>
              )}

              {/* 3 & 4. Tagline & Institutional Address */}
              {(showTagline || showAddress) && (
                <p className="text-[13px] lg:text-[14px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-center gap-1.5 mt-1 leading-normal">
                  {showTagline && (
                    <BlurSharpStatement as="span" className="font-normal text-slate-600 dark:text-slate-300">
                      {t(school.tagline_en, school.tagline_np) || 'Center for Academic Excellence & Character Building'}
                    </BlurSharpStatement>
                  )}
                  {showTagline && showAddress && (
                    <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                  )}
                  {showAddress && (
                    <span className="font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                      <span>{t(school.address_en, school.address_np) || 'Ward No. 4, Nepal'}</span>
                    </span>
                  )}
                </p>
              )}

              {/* 5. EMIS & Established Information (Prestige metadata pill badges) */}
              {(showEmis || showEstd) && (
                <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {showEmis && school.code && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">EMIS:</span>
                      <span className="font-bold">{cleanEmisCode(school.code)}</span>
                    </span>
                  )}
                  {showEmis && showEstd && school.code && school.estd_bs && (
                    <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                  )}
                  {showEstd && school.estd_bs && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium border border-slate-200/70 dark:border-slate-700/70 shadow-2xs">
                      <span className="text-slate-400 dark:text-slate-500 font-semibold">{t('Estd.', 'स्थापना:')}</span>
                      <span className="font-bold">{isNp ? `वि.सं. ${school.estd_bs.replace(/[^०-९0-9]/g, '') || school.estd_bs}` : (school.estd_bs.includes('B.S.') ? school.estd_bs : `${school.estd_bs} B.S.`)}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* RIGHT: Quick Action Cluster (Admission CTA + Hotline) */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            {showAdmissionCta && (
              <button
                onClick={() => onRouteChange(admissionCtaRoute)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all hover:shadow-sm transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                </span>
                <span>{admissionCtaText}</span>
              </button>
            )}

            {showHelpline && (
              <a
                href={`tel:${helplinePhone}`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-right text-xs transition cursor-pointer shrink-0"
                title="Official Phone Hotline"
              >
                <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-blue-900 dark:text-blue-300 justify-end">
                  <Phone className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400 shrink-0" />
                  <span>{helplinePhone}</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {t('Helpdesk Hotline', 'सोधपुछ केन्द्र')}
                </div>
              </a>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Layout (< lg) */}
        <div className="lg:hidden flex items-center justify-between gap-3">
          {/* Mobile Left: Logo */}
          {showLogo && (
            <button
              onClick={() => onRouteChange('home')}
              className="cursor-pointer focus:outline-hidden hover:opacity-95 transition-opacity shrink-0 inline-flex items-center bg-transparent border-0 p-0"
              aria-label="Go to homepage"
            >
              <InstitutionalLogo school={school} size={logoSize} />
            </button>
          )}

          {/* Mobile Center: Responsive Centered Identity Block */}
          {showSchoolIdentity && (
            <div className="flex-1 min-w-0 text-center px-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug font-sans">
                <InteractiveCharacterHeading
                  text={school.name_en || 'Ishwari Secondary School'}
                  onClick={() => onRouteChange('home')}
                  className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition cursor-pointer text-inherit"
                  highlightHex="#F59E0B"
                  maxLift={2.5}
                  maxScale={0.025}
                />
              </h1>

              {showNepaliName && (
                <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-slate-100 leading-snug tracking-normal font-['Noto_Sans_Devanagari','Mukta',sans-serif]">
                  <InteractiveCharacterHeading
                    text={school.name_np || 'ईश्वरी माध्यमिक विद्यालय'}
                    onClick={() => onRouteChange('home')}
                    className="hover:text-[#1E40AF] dark:hover:text-blue-400 transition cursor-pointer text-inherit"
                    highlightHex="#F59E0B"
                    maxLift={2.2}
                    maxScale={0.02}
                  />
                </h2>
              )}

              {/* Tagline & Address on Tablet / larger mobile */}
              {(showTagline || showAddress) && (
                <p className="hidden sm:flex text-[11px] text-slate-500 dark:text-slate-400 items-center justify-center gap-1 mt-0.5 truncate">
                  {showTagline && <BlurSharpStatement as="span">{t(school.tagline_en, school.tagline_np)}</BlurSharpStatement>}
                  {showTagline && showAddress && <span>•</span>}
                  {showAddress && <span>{t(school.address_en, school.address_np)}</span>}
                </p>
              )}

              {/* EMIS / Estd on Tablet */}
              {(showEmis || showEstd) && (
                <div className="flex items-center justify-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {showEmis && school.code && <span>EMIS: {cleanEmisCode(school.code)}</span>}
                  {showEmis && showEstd && school.code && school.estd_bs && <span>•</span>}
                  {showEstd && school.estd_bs && <span>{t('Estd.', 'स्थापना:')} {isNp ? `वि.सं. ${school.estd_bs.replace(/[^०-९0-9]/g, '') || school.estd_bs}` : (school.estd_bs.includes('B.S.') ? school.estd_bs : `${school.estd_bs} B.S.`)}</span>}
                </div>
              )}
            </div>
          )}

          {/* Mobile Right: Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#1E40AF] cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. STREAMLINED NAVBAR WITH DEEP ACADEMIC NAVY BACKGROUND & FLUID SPRING ACTIVE INDICATOR */}
      <nav className="bg-[#1E3A8A] dark:bg-[#0A1120] border-t border-blue-500/20 dark:border-slate-800 hidden lg:block shadow-md relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Primary Nav Items with Smooth Gliding Active Pill */}
            <div className="flex items-center space-x-1 py-1.5" role="tablist">
              {primaryNavItems.map((item) => {
                const isActive = activeRoute === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onRouteChange(item.id)}
                    className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
                  >
                    {/* Soft, Faint Translucent Active Indicator with Golden Accent Notch */}
                    {isActive && (
                      <motion.div
                        layoutId="active-navbar-indicator"
                        className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      >
                        {/* Prestigious institutional gold underline accent */}
                        <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                      </motion.div>
                    )}

                    {/* Button Foreground Icon & Label */}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                        isActive
                          ? 'text-white font-bold'
                          : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                      }`}
                    >
                      <IconComponent
                        className={`w-3.5 h-3.5 transition-all duration-200 ease-out ${
                          isActive
                            ? 'text-amber-300'
                            : 'text-blue-200/80 group-hover:text-blue-100 group-hover:-translate-y-0.5'
                        }`}
                      />
                      <span className="relative inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                        {t(item.labelEn, item.labelNp)}
                        {!isActive && (
                          <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-blue-200/90 dark:bg-blue-300/90 group-hover:w-full transition-all duration-250 ease-out rounded-full pointer-events-none" />
                        )}
                      </span>
                      {item.badge && (
                        <span
                          className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-2xs transition-transform duration-200 ease-out group-hover:-translate-y-0.5 ${
                            item.badgeColor || 'bg-blue-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}

              {/* "More / थप ▾" Resource Dropdown */}
              <div ref={moreRef} className="relative">
                <button
                  id="nav-more-dropdown"
                  type="button"
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setMoreMenuOpen((prev) => !prev)}
                  className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
                >
                  {isMoreActive && (
                    <motion.div
                      layoutId="active-navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    >
                      <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                    </motion.div>
                  )}

                  <span
                    className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                      isMoreActive
                        ? 'text-white font-bold'
                        : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                    }`}
                  >
                    <span className="relative inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                      {t('More', 'थप')}
                      {!isMoreActive && (
                        <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-blue-200/90 dark:bg-blue-300/90 group-hover:w-full transition-all duration-250 ease-out rounded-full pointer-events-none" />
                      )}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        moreMenuOpen ? 'rotate-180 text-amber-300' : 'text-blue-200/80 group-hover:text-blue-100 group-hover:-translate-y-0.5'
                      }`}
                    />
                  </span>
                </button>

                {/* Animated Dropdown Menu */}
                <AnimatePresence>
                  {moreMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 mb-1">
                        {t('Explore School Info', 'थप जानकारी तथा विवरण')}
                      </div>
                      {moreNavItems.map((subItem) => {
                        const isSubActive = activeRoute === subItem.id;
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              onRouteChange(subItem.id);
                              setMoreMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer group ${
                              isSubActive
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-[#1E3A8A] dark:text-blue-300 font-bold border-l-3 border-[#1E3A8A] dark:border-blue-400'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <SubIcon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  isSubActive ? 'text-[#1E40AF] dark:text-amber-400' : 'text-slate-400 dark:text-slate-400'
                                }`}
                              />
                              <div>
                                <span className="block leading-tight transition-transform duration-200 ease-out group-hover:translate-x-1">{t(subItem.labelEn, subItem.labelNp)}</span>
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                                  {t(subItem.descEn, subItem.descNp)}
                                </span>
                              </div>
                            </div>
                            {subItem.badge && (
                              <span
                                className={`ml-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white shadow-2xs ${
                                  subItem.badgeColor || 'bg-amber-600'
                                }`}
                              >
                                {subItem.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Tab */}
              <button
                id={`nav-${contactNavItem.id}`}
                role="tab"
                aria-selected={activeRoute === contactNavItem.id}
                onClick={() => onRouteChange(contactNavItem.id)}
                className="relative inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none group"
              >
                {activeRoute === contactNavItem.id && (
                  <motion.div
                    layoutId="active-navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-white/12 dark:bg-white/10 border border-white/20 dark:border-white/15 shadow-xs"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  >
                    <span className="absolute bottom-0 left-2.5 right-2.5 h-[2.5px] rounded-full bg-linear-to-r from-amber-400 via-amber-300 to-amber-400 shadow-xs shadow-amber-400/50" />
                  </motion.div>
                )}
                <span
                  className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                    activeRoute === contactNavItem.id
                      ? 'text-white font-bold'
                      : 'text-blue-100/90 group-hover:text-white group-hover:bg-white/8 rounded-md px-0.5'
                  }`}
                >
                  <MessageSquare
                    className={`w-3.5 h-3.5 transition-all duration-200 ease-out ${
                      activeRoute === contactNavItem.id
                        ? 'text-amber-300'
                        : 'text-blue-200/80 group-hover:text-blue-100 group-hover:-translate-y-0.5'
                    }`}
                  />
                  <span className="relative inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5">
                    {t(contactNavItem.labelEn, contactNavItem.labelNp)}
                    {activeRoute !== contactNavItem.id && (
                      <span className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 bg-blue-200/90 dark:bg-blue-300/90 group-hover:w-full transition-all duration-250 ease-out rounded-full pointer-events-none" />
                    )}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER / MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-3 shadow-lg">
          {/* Latest News Pill for Mobile */}
          {(siteConfig ? siteConfig.showAlertTicker : true) && (
            <div
              onClick={() => {
                onRouteChange('notice');
                setMobileMenuOpen(false);
              }}
              className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs flex items-center gap-2 text-amber-900 dark:text-amber-300 cursor-pointer overflow-hidden"
            >
              <span className="px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-950 font-bold text-[9px] uppercase tracking-wider shrink-0">
                {t('Latest News', 'ताजा समाचार')}
              </span>
              <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                {tickerItems[0]}
              </span>
            </div>
          )}

          {/* Live BS Clock Display for Mobile */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 select-none">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="tabular-nums font-medium">{bsTime}</span>
          </div>

          {/* Quick Search Mobile */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSearch();
            }}
            className="w-full text-left px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Search site...', 'खोजी गर्नुहोस्...')}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Ctrl+K</span>
          </button>

          {/* Nav Grid for Mobile */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {allNavItems.map((item) => {
              const isActive = activeRoute === item.id;
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white font-bold shadow-xs border-l-4 border-amber-400 pl-2.5'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{t(item.labelEn, item.labelNp)}</span>
                  </span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white ${item.badgeColor || 'bg-blue-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                onRouteChange('academics');
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>{t('Online Admission 2083 Open', 'नयाँ भर्ना २०८३ खुला')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

