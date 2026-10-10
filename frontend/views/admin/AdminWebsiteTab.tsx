import React, { useState, useEffect } from 'react';
import {
  Language,
  SchoolData,
  SiteCustomizerConfig,
  HeaderConfig,
  Notice,
  SocialMediaLink,
  SocialPlatform,
  UsefulLink,
  EducationalBgPreset,
  EducationalBgStyle,
  EducationalBgInteraction,
  EducationalSectionBgConfig,
  HomepageSectionItem,
  QuickAccessItem
} from '../../types';
import { initialSocialLinks, initialUsefulLinks, defaultHomepageSections, defaultQuickAccessItems } from '../../data/schoolData';
import {
  SocialMediaBar,
  SocialPlatformIcon,
  PLATFORM_INFO,
  isValidSocialUrl
} from '../../components/SocialMediaIcons';
import {
  Building2,
  Layout,
  PanelTop,
  Menu as MenuIcon,
  PanelBottom,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Bell,
  Phone,
  Mail,
  Globe,
  Clock,
  Search,
  Compass,
  Info,
  Palette,
  Layers,
  Flag,
  Calendar,
  Sun,
  Moon,
  Type,
  Sliders,
  Check,
  HelpCircle,
  Image as ImageIcon,
  Monitor,
  Tablet,
  Smartphone,
  AlignCenter,
  AlignLeft,
  MapPin,
  Share2,
  Plus,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Globe2,
  Navigation,
  BookOpen,
  GraduationCap,
  BookMarked,
  Briefcase,
  Award,
  Download,
  Users,
  Link2,
  ListFilter,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { CmsImageUploader } from '../../components/CmsImageUploader';
import { InstitutionalLogo } from '../../components/Header';
import { CmsMediaBackgroundControl } from '../../components/CmsMediaBackgroundControl';
import { AdminNavTabId } from './AdminSidebar';
import { LargeNepalFlag, BritishFlag } from '../../components/Header';

const defaultHeaderConfig: HeaderConfig = {
  showTopBar: true,
  showNationalFlag: true,
  flagMode: 'default_nepal',
  customFlagImage: '',
  flagSize: 'normal',
  flagPosition: 'after_theme',
  showAlertTicker: true,
  tickerMode: 'auto_pinned',
  tickerTitleEn: 'Latest News',
  tickerTitleNp: 'ताजा समाचार',
  selectedNoticeId: '',
  showAcademicYear: true,
  academicYearLabelEn: 'Annual',
  academicYearLabelNp: 'वार्षिक',
  academicYearValue: '2083',
  academicYearSeparator: '|',
  showBsClock: true,
  showDate: true,
  dateFormat: 'full',
  showTime: true,
  timeFormat: '12h',
  showSeconds: true,
  showWeekday: true,
  showNepaliDate: true,
  timezone: 'Asia/Kathmandu',
  showSearchButton: true,
  searchPlaceholderEn: 'Search',
  searchPlaceholderNp: 'खोज्नुहोस्',
  showSearchShortcut: true,
  showLanguageToggle: true,
  defaultLanguage: 'en',
  langLabelEn: 'EN',
  langLabelNp: 'नेपा',
  langDisplayMode: 'compact',
  showThemeSwitch: true,
  defaultTheme: 'light',
  showSchoolBadges: true,
  showTagline: true,
  showAddress: true,
  showAdmissionCta: true,
  admissionCtaTextEn: 'Admission 2083',
  admissionCtaTextNp: 'नयाँ भर्ना २०८३',
  admissionCtaRoute: 'academics',
  showHelpline: true,
  helplinePhone: '+977-21-420123',
  stickyHeader: true,
  showLogo: true,
  showSchoolIdentity: true,
  showEmis: true,
  showEstd: true,
  showNepaliName: true,
  logoSize: 'medium',
  schoolNameSize: 'medium',
  nepaliNameSize: 'medium',
  headerIdentityAlignment: 'center',
};

interface AdminWebsiteTabProps {
  lang: Language;
  activeSubTab: 'website_identity' | 'website_homepage' | 'website_header' | 'website_navigation' | 'website_footer';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  onShowToast: (msg: string) => void;
  notices?: Notice[];
}

export const AdminWebsiteTab: React.FC<AdminWebsiteTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  siteConfig,
  onUpdateSiteConfig,
  onShowToast,
  notices = []
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [schoolForm, setSchoolForm] = useState<SchoolData>({ ...school });
  const [siteForm, setSiteForm] = useState<SiteCustomizerConfig>(() => ({
    ...siteConfig,
    socialLinks: siteConfig.socialLinks || initialSocialLinks,
    usefulLinks: siteConfig.usefulLinks || initialUsefulLinks,
    homepageSections: siteConfig.homepageSections && siteConfig.homepageSections.length > 0
      ? siteConfig.homepageSections
      : defaultHomepageSections,
    quickAccessItems: siteConfig.quickAccessItems && siteConfig.quickAccessItems.length > 0
      ? siteConfig.quickAccessItems
      : defaultQuickAccessItems,
    showFooterMap: siteConfig.showFooterMap !== undefined ? siteConfig.showFooterMap : true,
    footerMapEmbedUrl: siteConfig.footerMapEmbedUrl || school.map_embed_url || '',
    footerMapUrl: siteConfig.footerMapUrl || school.map_url || ''
  }));
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    setSiteForm(prev => ({
      ...siteConfig,
      socialLinks: siteConfig.socialLinks || prev.socialLinks || initialSocialLinks,
      usefulLinks: siteConfig.usefulLinks || prev.usefulLinks || initialUsefulLinks,
      homepageSections: siteConfig.homepageSections && siteConfig.homepageSections.length > 0
        ? siteConfig.homepageSections
        : (prev.homepageSections && prev.homepageSections.length > 0 ? prev.homepageSections : defaultHomepageSections),
      quickAccessItems: siteConfig.quickAccessItems && siteConfig.quickAccessItems.length > 0
        ? siteConfig.quickAccessItems
        : (prev.quickAccessItems && prev.quickAccessItems.length > 0 ? prev.quickAccessItems : defaultQuickAccessItems),
      showFooterMap: siteConfig.showFooterMap !== undefined ? siteConfig.showFooterMap : (prev.showFooterMap ?? true),
      footerMapEmbedUrl: siteConfig.footerMapEmbedUrl || prev.footerMapEmbedUrl || school.map_embed_url || '',
      footerMapUrl: siteConfig.footerMapUrl || prev.footerMapUrl || school.map_url || ''
    }));
  }, [siteConfig, school]);

  const handleToggleSocial = (id: string) => {
    setSiteForm(prev => {
      const current = prev.socialLinks || initialSocialLinks;
      const updated = current.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      return { ...prev, socialLinks: updated };
    });
  };

  const handleUpdateSocial = (id: string, partial: Partial<SocialMediaLink>) => {
    setSiteForm(prev => {
      const current = prev.socialLinks || initialSocialLinks;
      const updated = current.map(item =>
        item.id === id ? { ...item, ...partial } : item
      );
      return { ...prev, socialLinks: updated };
    });
  };

  const handleMoveSocial = (index: number, direction: 'up' | 'down') => {
    const list = (siteForm.socialLinks || initialSocialLinks).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const itemA = list[index];
    const itemB = list[targetIndex];
    const tempOrder = itemA.order;
    itemA.order = itemB.order;
    itemB.order = tempOrder;

    const sorted = [...list].sort((a, b) => a.order - b.order).map((it, idx) => ({
      ...it,
      order: idx + 1
    }));

    setSiteForm(prev => ({ ...prev, socialLinks: sorted }));
  };

  const handleAddSocial = () => {
    const current = siteForm.socialLinks || initialSocialLinks;
    const existingPlatforms = new Set(current.map(i => i.platform));
    const availablePlatforms: SocialPlatform[] = [
      'facebook',
      'youtube',
      'instagram',
      'x',
      'linkedin',
      'whatsapp',
      'tiktok',
      'website'
    ];
    const nextPlatform = availablePlatforms.find(p => !existingPlatforms.has(p)) || 'website';
    const info = PLATFORM_INFO[nextPlatform] || PLATFORM_INFO.website;

    const newItem: SocialMediaLink = {
      id: `soc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      platform: nextPlatform,
      url: '',
      labelEn: info.nameEn,
      labelNp: info.nameNp,
      enabled: true,
      order: current.length + 1
    };

    setSiteForm(prev => ({
      ...prev,
      socialLinks: [...current, newItem]
    }));
  };

  const handleDeleteSocial = (id: string) => {
    setSiteForm(prev => {
      const current = prev.socialLinks || initialSocialLinks;
      const filtered = current
        .filter(item => item.id !== id)
        .map((it, idx) => ({ ...it, order: idx + 1 }));
      return { ...prev, socialLinks: filtered };
    });
  };

  const handleResetSocial = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Social Media Channels', 'सामाजिक सञ्जाल रिसेट गर्नुहोस्'),
      description: t(
        'Restore the official school social media links (Facebook, YouTube, X, Instagram) to their standard institutional values?',
        'के तपाईं सामाजिक सञ्जालका लिङ्कहरू पूर्वनिर्धारित मानमा फर्काउन चाहनुहुन्छ?'
      ),
      itemName: t('Social Media Channels', 'सामाजिक सञ्जाल'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        setSiteForm(prev => ({
          ...prev,
          socialLinks: JSON.parse(JSON.stringify(initialSocialLinks))
        }));
        onShowToast(t('Social media channels restored to default!', 'सामाजिक सञ्जाल पूर्वनिर्धारितमा रिसेट गरियो!'));
      }
    });
  };

  const handleToggleUsefulLink = (id: string) => {
    setSiteForm(prev => {
      const current = prev.usefulLinks || initialUsefulLinks;
      const updated = current.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      return { ...prev, usefulLinks: updated };
    });
  };

  const handleUpdateUsefulLink = (id: string, partial: Partial<UsefulLink>) => {
    setSiteForm(prev => {
      const current = prev.usefulLinks || initialUsefulLinks;
      const updated = current.map(item =>
        item.id === id ? { ...item, ...partial } : item
      );
      return { ...prev, usefulLinks: updated };
    });
  };

  const handleMoveUsefulLink = (index: number, direction: 'up' | 'down') => {
    const list = (siteForm.usefulLinks || initialUsefulLinks).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const itemA = list[index];
    const itemB = list[targetIndex];
    const tempOrder = itemA.order;
    itemA.order = itemB.order;
    itemB.order = tempOrder;

    const sorted = [...list].sort((a, b) => a.order - b.order).map((it, idx) => ({
      ...it,
      order: idx + 1
    }));

    setSiteForm(prev => ({ ...prev, usefulLinks: sorted }));
  };

  const handleAddUsefulLink = () => {
    const current = siteForm.usefulLinks || initialUsefulLinks;
    const newItem: UsefulLink = {
      id: `ul-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      titleEn: '',
      titleNp: '',
      url: 'https://',
      descriptionEn: '',
      descriptionNp: '',
      enabled: true,
      order: current.length + 1
    };

    setSiteForm(prev => ({
      ...prev,
      usefulLinks: [...current, newItem]
    }));
  };

  const handleDeleteUsefulLink = (id: string) => {
    setSiteForm(prev => {
      const current = prev.usefulLinks || initialUsefulLinks;
      const filtered = current
        .filter(item => item.id !== id)
        .map((it, idx) => ({ ...it, order: idx + 1 }));
      return { ...prev, usefulLinks: filtered };
    });
  };

  const handleResetUsefulLinks = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Useful Links', 'महत्त्वपूर्ण लिङ्कहरू रिसेट गर्नुहोस्'),
      description: t(
        'Restore the official educational and government portal links to their standard values?',
        'के तपाईं शैक्षिक तथा सरकारी पोर्टलका लिङ्कहरू पूर्वनिर्धारित मानमा फर्काउन चाहनुहुन्छ?'
      ),
      itemName: t('Useful Links', 'महत्त्वपूर्ण लिङ्कहरू'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        setSiteForm(prev => ({
          ...prev,
          usefulLinks: JSON.parse(JSON.stringify(initialUsefulLinks))
        }));
        onShowToast(t('Useful links restored to default!', 'महत्त्वपूर्ण लिङ्कहरू पूर्वनिर्धारितमा रिसेट गरियो!'));
      }
    });
  };

  const currentHeaderConfig: HeaderConfig = {
    ...defaultHeaderConfig,
    ...(siteForm.header || {})
  };

  const updateHeaderConfig = (partial: Partial<HeaderConfig>) => {
    setSiteForm(prev => {
      const updated = {
        ...defaultHeaderConfig,
        ...(prev.header || {}),
        ...partial
      };
      return {
        ...prev,
        header: updated,
        showAlertTicker: updated.showAlertTicker
      };
    });
  };

  // Real-time Kathmandu BS time preview clock
  const [previewTimeStr, setPreviewTimeStr] = useState<string>('');
  useEffect(() => {
    const updatePreviewClock = () => {
      const now = new Date();
      const showDate = currentHeaderConfig.showDate !== false;
      const showTime = currentHeaderConfig.showTime !== false;
      const showSec = currentHeaderConfig.showSeconds !== false;
      const showWd = currentHeaderConfig.showWeekday !== false;
      const is12 = currentHeaderConfig.timeFormat !== '24h';
      const isNepali = currentHeaderConfig.showNepaliDate !== false;

      let datePart = '';
      if (showDate) {
        if (isNepali) {
          const bsMonth = isNp ? 'भाद्र' : 'Bhadra';
          const bsDay = isNp ? '२०' : '20';
          const weekday = isNp ? (showWd ? 'आइतबार, ' : '') : (showWd ? 'Sunday, ' : '');
          datePart = currentHeaderConfig.dateFormat === 'short'
            ? `${bsMonth} ${bsDay}`
            : `${weekday}${isNp ? '२०८३' : '2083'} ${bsMonth} ${bsDay}`;
        } else {
          const month = isNp ? 'सेप्टेम्बर' : 'Sep';
          const weekday = showWd ? (isNp ? 'आइतबार, ' : 'Sun, ') : '';
          datePart = currentHeaderConfig.dateFormat === 'short'
            ? `${month} 13`
            : `${weekday}Sep 13, 2026`;
        }
      }

      let timePart = '';
      if (showTime) {
        const h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        if (is12) {
          const h12 = h % 12 || 12;
          const period = isNp ? (h < 12 ? 'पूर्वाह्न' : 'अपराह्न') : (h < 12 ? 'AM' : 'PM');
          timePart = showSec ? `${h12}:${m}:${s} ${period}` : `${h12}:${m} ${period}`;
        } else {
          const h24 = String(h).padStart(2, '0');
          timePart = showSec ? `${h24}:${m}:${s}` : `${h24}:${m}`;
        }
      }

      setPreviewTimeStr(datePart && timePart ? `${datePart} | ${timePart}` : datePart || timePart);
    };

    updatePreviewClock();
    const interval = setInterval(updatePreviewClock, 1000);
    return () => clearInterval(interval);
  }, [
    isNp,
    currentHeaderConfig.showDate,
    currentHeaderConfig.dateFormat,
    currentHeaderConfig.showTime,
    currentHeaderConfig.timeFormat,
    currentHeaderConfig.showSeconds,
    currentHeaderConfig.showWeekday,
    currentHeaderConfig.showNepaliDate
  ]);

  const handleResetHeader = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Top Bar & Header Settings', 'शीर्ष पट्टी र हेडर सेटिङ रिसेट गर्नुहोस्'),
      description: t(
        'Are you sure you want to reset all Top Bar and Header settings to default institutional values? This will restore the standard flag, Kathmandu clock, live notice ticker, and utility button settings.',
        'के तपाईं शीर्ष पट्टी र हेडरका सबै सेटिङहरू पूर्वनिर्धारित मानहरूमा फर्काउन चाहनुहुन्छ?'
      ),
      itemName: t('Top Bar & Header Configuration', 'शीर्ष पट्टी तथा हेडर सेटिङ'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        const resetHeader = { ...defaultHeaderConfig };
        setSiteForm(prev => ({
          ...prev,
          header: resetHeader,
          showAlertTicker: true
        }));
        onUpdateSiteConfig({
          ...siteForm,
          header: resetHeader,
          showAlertTicker: true
        });
        onShowToast(t('Top Bar and Header reset to factory defaults!', 'शीर्ष पट्टी र हेडर सफलतापूर्वक रिसेट गरियो!'));
      }
    });
  };

  const handleFlagUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      onShowToast(t('Flag image must be under 1MB', 'झण्डाको फोटो १MB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      updateHeaderConfig({
        flagMode: 'custom',
        customFlagImage: dataUrl
      });
      onShowToast(t('Custom flag image uploaded successfully!', 'कस्टम झण्डा सफलतापूर्वक अपलोड गरियो!'));
    };
    reader.readAsDataURL(file);
  };

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName: string;
    confirmText: string;
    variant: ConfirmationVariant;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    itemName: '',
    confirmText: 'Confirm',
    variant: 'update',
    action: () => {}
  });

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Site Identity & Header Settings', 'वेबसाइट पहिचान तथा हेडर सेटिङ सुरक्षित गर्नुहोस्'),
      description: t(
        'Apply school names, tagline, code, established dates, address, logo, and header appearance configuration to the live portal?',
        'विद्यालयको नाम, आदर्श वाक्य, कोड, स्थापना वर्ष, ठेगाना, लोगो तथा हेडर बनावट लागू गर्न चाहनुहुन्छ?'
      ),
      itemName: t('Site Identity Configuration', 'वेबसाइट पहिचान सेटिङ'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        const updatedSchool: SchoolData = {
          ...schoolForm,
          show_logo: currentHeaderConfig.showLogo,
          show_school_identity: currentHeaderConfig.showSchoolIdentity,
          show_emis: currentHeaderConfig.showEmis,
          show_estd: currentHeaderConfig.showEstd,
          show_tagline: currentHeaderConfig.showTagline,
          show_address: currentHeaderConfig.showAddress,
          show_nepali_name: currentHeaderConfig.showNepaliName,
          logo_size: currentHeaderConfig.logoSize,
          school_name_size: currentHeaderConfig.schoolNameSize,
          nepali_name_size: currentHeaderConfig.nepaliNameSize,
          header_identity_alignment: currentHeaderConfig.headerIdentityAlignment
        };
        onUpdateSchool(updatedSchool);
        onUpdateSiteConfig(siteForm);
        onShowToast(t('Site identity and header settings saved successfully!', 'विद्यालय पहिचान तथा हेडर सेटिङ सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleResetIdentity = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Site Identity', 'वेबसाइट पहिचान रिसेट गर्नुहोस्'),
      description: t(
        'Reset school identity fields and header appearance to default institutional values?',
        'विद्यालयको पहिचान र हेडर सेटिङहरू पूर्वनिर्धारित मानहरूमा रिसेट गर्न चाहनुहुन्छ?'
      ),
      itemName: t('Site Identity', 'वेबसाइट पहिचान'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        setSchoolForm({ ...school });
        const resetHeaderProps: Partial<HeaderConfig> = {
          showLogo: true,
          showSchoolIdentity: true,
          showEmis: true,
          showEstd: true,
          showTagline: true,
          showAddress: true,
          showNepaliName: true,
          logoSize: 'medium',
          schoolNameSize: 'medium',
          nepaliNameSize: 'medium',
          headerIdentityAlignment: 'center',
        };
        updateHeaderConfig(resetHeaderProps);
        onShowToast(t('Site identity settings reset.', 'पहिचान सेटिङहरू रिसेट गरियो।'));
      }
    });
  };

  const handleSaveHomepage = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Homepage Configuration', 'गृहपृष्ठ सेटिङ सुरक्षित गर्नुहोस्'),
      description: t('Apply headline, hero background, and section visibility changes to the public homepage?', 'गृहपृष्ठको ब्यानर, पृष्ठभूमि र सेक्सन भिजिबिलिटी लागू गर्न चाहनुहुन्छ?'),
      itemName: t('Homepage Configuration', 'गृहपृष्ठ बनावट'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onUpdateSchool(schoolForm);
        onShowToast(t('Homepage settings saved successfully!', 'गृहपृष्ठ सेटिङ सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Header Settings', 'हेडर सेटिङ सुरक्षित गर्नुहोस्'),
      description: t('Update the top announcement ticker and header contact information?', 'शीर्ष सूचना पट्टी र हेडर सम्पर्क विवरण अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t('Header & Announcement Ticker', 'हेडर तथा सूचना पट्टी'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onUpdateSchool(schoolForm);
        onShowToast(t('Header settings updated successfully!', 'हेडर सेटिङ सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleSaveFooter = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate social links: Ensure enabled links with URLs are valid HTTPS URLs
    const socialLinks = siteForm.socialLinks || [];
    const invalidLink = socialLinks.find(
      link => link.enabled && link.url && !isValidSocialUrl(link.url)
    );
    if (invalidLink) {
      onShowToast(
        t(
          `Invalid URL for ${invalidLink.platform}. Please use a valid https:// web address.`,
          `${invalidLink.platform} को लागि अमान्य लिङ्क। कृपया मान्य https:// ठेगाना राख्नुहोस्।`
        )
      );
      return;
    }

    // Validate useful links
    const usefulLinks = siteForm.usefulLinks || [];
    const unsafeUseful = usefulLinks.find(
      link => link.url && /^(javascript:|data:|vbscript:)/i.test(link.url.trim())
    );
    if (unsafeUseful) {
      onShowToast(
        t(
          `Unsafe scheme detected in useful link "${unsafeUseful.titleEn || 'Link'}". javascript:, data:, and vbscript: are strictly prohibited.`,
          `"${unsafeUseful.titleEn || 'लिङ्क'}" मा असुरक्षित scheme फेला पर्यो। केवल सुरक्षित ठेगाना प्रयोग गर्नुहोस्।`
        )
      );
      return;
    }

    const invalidUseful = usefulLinks.find(
      link => link.enabled && link.url && !/^https?:\/\//i.test(link.url.trim())
    );
    if (invalidUseful) {
      onShowToast(
        t(
          `Invalid URL for useful link "${invalidUseful.titleEn || 'Link'}". URLs must start with https:// or http://.`,
          `"${invalidUseful.titleEn || 'लिङ्क'}" को लागि अमान्य ठेगाना। ठेगाना https:// बाट सुरु हुनुपर्छ।`
        )
      );
      return;
    }

    // Validate map embed URL
    if (siteForm.footerMapEmbedUrl && /^(javascript:|data:|vbscript:)/i.test(siteForm.footerMapEmbedUrl.trim())) {
      onShowToast(t('Dangerous URL detected in map embed.', 'नक्सा इम्बेडमा असुरक्षित URL भेटियो।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Footer Settings', 'फुटर सेटिङ सुरक्षित गर्नुहोस्'),
      description: t(
        'Update the institutional footer description, copyright lines, useful links, campus map, and social media channels on the live website?',
        'फुटर विवरण, प्रतिलिपि अधिकार, उपयोगी लिङ्कहरू, नक्सा तथा सामाजिक सञ्जाल सार्वजनिक वेबसाइटमा अद्यावधिक गर्न चाहनुहुन्छ?'
      ),
      itemName: t('Footer Configuration', 'फुटर कन्फिगरेसन'),
      confirmText: t('Save Changes', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSiteConfig(siteForm);
        onShowToast(t('Footer settings saved successfully!', 'फुटर विवरण सफलतापूर्वक सुरक्षित गरियो!'));
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800 * 1024) {
      onShowToast(t('Logo image must be under 800KB', 'लोगो फाइल ८००KB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSchoolForm(prev => ({ ...prev, logo_url: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      onShowToast(t('Background image must be under 1.5MB', 'पृष्ठभूमि फाइल १.५MB भन्दा कम हुनुपर्छ'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSchoolForm(prev => ({ ...prev, home_bg_image: dataUrl, home_bg_enabled: true }));
      setSiteForm(prev => ({ ...prev, heroBackgroundImage: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const toggleSection = (key: keyof SiteCustomizerConfig['sectionVisibility']) => {
    setSiteForm(prev => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [key]: !prev.sectionVisibility[key]
      }
    }));
  };

  // Homepage Sections Management (Homepage Builder)
  const handleToggleHomepageSection = (id: string) => {
    setSiteForm(prev => {
      const current = prev.homepageSections && prev.homepageSections.length > 0
        ? prev.homepageSections
        : defaultHomepageSections;
      const updated = current.map(sec =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      );
      const legacyKey = id as keyof typeof prev.sectionVisibility;
      const legacyUpdate = legacyKey in prev.sectionVisibility
        ? { [legacyKey]: !prev.sectionVisibility[legacyKey] }
        : {};
      return {
        ...prev,
        homepageSections: updated,
        sectionVisibility: { ...prev.sectionVisibility, ...legacyUpdate }
      };
    });
  };

  const handleMoveHomepageSection = (index: number, direction: 'up' | 'down') => {
    setSiteForm(prev => {
      const list = [...(prev.homepageSections && prev.homepageSections.length > 0 ? prev.homepageSections : defaultHomepageSections)]
        .sort((a, b) => a.order - b.order);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      const reindexed = list.map((item, idx) => ({
        ...item,
        order: idx + 1
      }));

      return {
        ...prev,
        homepageSections: reindexed
      };
    });
  };

  const handleUpdateHomepageSection = (id: string, patch: Partial<HomepageSectionItem>) => {
    setSiteForm(prev => {
      const current = prev.homepageSections && prev.homepageSections.length > 0
        ? prev.homepageSections
        : defaultHomepageSections;
      const updated = current.map(sec =>
        sec.id === id ? { ...sec, ...patch } : sec
      );
      return {
        ...prev,
        homepageSections: updated
      };
    });
  };

  const handleResetHomepageSections = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Homepage Builder Layout', 'गृहपृष्ठ सेक्सन क्रम रिसेट गर्नुहोस्'),
      description: t(
        'Restore the standard institutional homepage sections layout and ordering to default?',
        'के तपाईं गृहपृष्ठका सम्पूर्ण सेक्सनहरू पूर्वनिर्धारित क्रममा फर्काउन चाहनुहुन्छ?'
      ),
      itemName: t('Homepage Sections Ordering', 'गृहपृष्ठ बनावट तथा क्रम'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        setSiteForm(prev => ({
          ...prev,
          homepageSections: JSON.parse(JSON.stringify(defaultHomepageSections))
        }));
        onShowToast(t('Homepage sections restored to default layout.', 'गृहपृष्ठ सेक्सनहरू पूर्वनिर्धारित क्रममा फर्काइयो।'));
      }
    });
  };

  // Quick Access Hub Management
  const handleToggleQuickAccess = (id: string) => {
    setSiteForm(prev => {
      const current = prev.quickAccessItems && prev.quickAccessItems.length > 0
        ? prev.quickAccessItems
        : defaultQuickAccessItems;
      const updated = current.map(item =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      );
      return {
        ...prev,
        quickAccessItems: updated
      };
    });
  };

  const handleMoveQuickAccess = (index: number, direction: 'up' | 'down') => {
    setSiteForm(prev => {
      const list = [...(prev.quickAccessItems && prev.quickAccessItems.length > 0 ? prev.quickAccessItems : defaultQuickAccessItems)]
        .sort((a, b) => a.order - b.order);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      const reindexed = list.map((item, idx) => ({
        ...item,
        order: idx + 1
      }));

      return {
        ...prev,
        quickAccessItems: reindexed
      };
    });
  };

  const handleUpdateQuickAccess = (id: string, patch: Partial<QuickAccessItem>) => {
    setSiteForm(prev => {
      const current = prev.quickAccessItems && prev.quickAccessItems.length > 0
        ? prev.quickAccessItems
        : defaultQuickAccessItems;
      const updated = current.map(item =>
        item.id === id ? { ...item, ...patch } : item
      );
      return {
        ...prev,
        quickAccessItems: updated
      };
    });
  };

  const handleAddQuickAccess = () => {
    const current = siteForm.quickAccessItems && siteForm.quickAccessItems.length > 0
      ? siteForm.quickAccessItems
      : defaultQuickAccessItems;
    const newItem: QuickAccessItem = {
      id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      icon: 'Compass',
      title_en: 'New Information Link',
      title_np: 'नयाँ सूचना लिङ्क',
      desc_en: 'Direct access to institutional resource',
      desc_np: 'संस्थागत स्रोतमा द्रुत पहुँच',
      route: 'documents',
      enabled: true,
      order: current.length + 1
    };
    setSiteForm(prev => ({
      ...prev,
      quickAccessItems: [...current, newItem]
    }));
    onShowToast(t('Added new Quick Access item.', 'नयाँ द्रुत पहुँच लिङ्क थपियो।'));
  };

  const handleDeleteQuickAccess = (id: string) => {
    setSiteForm(prev => {
      const current = prev.quickAccessItems && prev.quickAccessItems.length > 0
        ? prev.quickAccessItems
        : defaultQuickAccessItems;
      const filtered = current
        .filter(item => item.id !== id)
        .map((item, idx) => ({ ...item, order: idx + 1 }));
      return {
        ...prev,
        quickAccessItems: filtered
      };
    });
  };

  const handleResetQuickAccess = () => {
    setConfirmState({
      isOpen: true,
      variant: 'reset',
      title: t('Reset Quick Access Hub', 'द्रुत पहुँच केन्द्र रिसेट गर्नुहोस्'),
      description: t(
        'Restore the official quick access items (Notices, Calendar, Curriculum, Downloads, Events, Careers, Honors, Faculty, Contact) to standard institutional defaults?',
        'के तपाईं द्रुत पहुँच केन्द्रका सम्पूर्ण सामग्रीहरू पूर्वनिर्धारित मानमा फर्काउन चाहनुहुन्छ?'
      ),
      itemName: t('Quick Access Hub Items', 'द्रुत पहुँच सामग्रीहरू'),
      confirmText: t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्'),
      action: () => {
        setSiteForm(prev => ({
          ...prev,
          quickAccessItems: JSON.parse(JSON.stringify(defaultQuickAccessItems))
        }));
        onShowToast(t('Quick access items restored to default!', 'द्रुत पहुँच सामग्रीहरू रिसेट गरियो!'));
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmState.action}
        variant={confirmState.variant}
        title={confirmState.title}
        description={confirmState.description}
        itemName={confirmState.itemName}
        confirmText={confirmState.confirmText}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
      />

      {/* 1. SITE IDENTITY SUB-TAB */}
      {activeSubTab === 'website_identity' && (
        <form onSubmit={handleSaveIdentity} className="space-y-6">
          {/* Header Action & Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Site Identity & Institutional Branding', 'वेबसाइट पहिचान तथा संस्थागत ब्रान्डिङ')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Manage official school names, tagline, code, established year, address, logo, and header presentation without hardcoded values.', 'विद्यालयको आधिकारिक नाम, नारा, कोड, स्थापना वर्ष, ठेगाना, लोगो तथा हेडर बनावट व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetIdentity}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title={t('Reset identity and header appearance to default settings', 'पूर्वनिर्धारित मानहरूमा रिसेट गर्नुहोस्')}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट')}</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>
          </div>

          {/* COMPACT LIVE HEADER IDENTITY PREVIEW */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#1E40AF]" />
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('Live Header Identity Preview', 'हेडर पहिचान लाइभ पूर्वावलोकन')}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {t('Reflects unsaved changes in real time', 'वास्तविक समयमा पूर्वावलोकन')}
              </span>
            </div>

            {/* Preview Stage - Styled like public header */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-6 transition-all overflow-hidden">
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left Logo in Preview */}
                <div className="shrink-0 flex items-center justify-center">
                  {currentHeaderConfig.showLogo !== false ? (
                    <div className="inline-flex items-center justify-center bg-transparent border-0 p-0">
                      <InstitutionalLogo
                        school={{ ...school, logo_url: schoolForm.logo_url }}
                        size={currentHeaderConfig.logoSize || 'medium'}
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic px-2 py-1 rounded bg-slate-200/50 dark:bg-slate-800/50">
                      {t('(Logo Hidden)', '(लोगो लुकाइएको)')}
                    </div>
                  )}
                </div>

                {/* Center Identity Block in Preview */}
                {currentHeaderConfig.showSchoolIdentity !== false ? (
                  <div
                    className={`flex-1 min-w-0 flex flex-col ${
                      currentHeaderConfig.headerIdentityAlignment === 'left'
                        ? 'items-start text-left'
                        : 'items-center text-center'
                    } justify-center px-2`}
                  >
                    {/* English Name */}
                    <h4
                      className={`font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-sans transition-all ${
                        currentHeaderConfig.schoolNameSize === 'small'
                          ? 'text-lg sm:text-xl'
                          : currentHeaderConfig.schoolNameSize === 'large'
                          ? 'text-xl sm:text-2xl lg:text-[26px]'
                          : 'text-xl sm:text-2xl'
                      }`}
                    >
                      {schoolForm.name_en || 'Ishwari Secondary School'}
                    </h4>

                    {/* Nepali Name */}
                    {currentHeaderConfig.showNepaliName !== false && (
                      <h5
                        className={`font-semibold text-slate-700 dark:text-slate-200 leading-snug mt-0.5 font-['Noto_Sans_Devanagari',sans-serif] transition-all ${
                          currentHeaderConfig.nepaliNameSize === 'small'
                            ? 'text-sm sm:text-base'
                            : currentHeaderConfig.nepaliNameSize === 'large'
                            ? 'text-base sm:text-lg lg:text-[20px]'
                            : 'text-sm sm:text-lg'
                        }`}
                      >
                        {schoolForm.name_np || 'ईश्वरी माध्यमिक विद्यालय'}
                      </h5>
                    )}

                    {/* Tagline & Address */}
                    {(currentHeaderConfig.showTagline !== false || currentHeaderConfig.showAddress !== false) && (
                      <p className="text-[12px] sm:text-[13px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center justify-center gap-1.5 mt-1 leading-normal">
                        {currentHeaderConfig.showTagline !== false && (
                          <span className="font-normal">
                            {t(schoolForm.tagline_en, schoolForm.tagline_np) || 'Center for Academic Excellence & Character Building'}
                          </span>
                        )}
                        {currentHeaderConfig.showTagline !== false && currentHeaderConfig.showAddress !== false && (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                        )}
                        {currentHeaderConfig.showAddress !== false && (
                          <span className="font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 inline" />
                            <span>{t(schoolForm.address_en, schoolForm.address_np) || 'Ward No. 4, Nepal'}</span>
                          </span>
                        )}
                      </p>
                    )}

                    {/* EMIS & Estd Badges */}
                    {(currentHeaderConfig.showEmis !== false || currentHeaderConfig.showEstd !== false) && (
                      <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {currentHeaderConfig.showEmis !== false && schoolForm.code && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-300/60 dark:border-slate-700">
                            <span className="text-slate-400 font-semibold">EMIS:</span>
                            <span>{schoolForm.code.replace(/^EMIS:\s*/i, '').trim()}</span>
                          </span>
                        )}
                        {currentHeaderConfig.showEmis !== false && currentHeaderConfig.showEstd !== false && schoolForm.code && schoolForm.estd_bs && (
                          <span className="text-slate-300 dark:text-slate-600 font-bold">•</span>
                        )}
                        {currentHeaderConfig.showEstd !== false && schoolForm.estd_bs && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-300/60 dark:border-slate-700">
                            <span className="text-slate-400 font-semibold">{t('Estd.', 'स्थापना:')}</span>
                            <span>{schoolForm.estd_bs.includes('B.S.') ? schoolForm.estd_bs : `${schoolForm.estd_bs} B.S.`}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    {t('(School Identity Hidden)', '(विद्यालय पहिचान लुकाइएको)')}
                  </div>
                )}

                {/* Right Placeholder Cluster */}
                <div className="hidden lg:flex items-center gap-2 opacity-50 shrink-0 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-[11px] font-bold">
                    {t('Apply Online', 'भर्ना आवेदन')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 1. OFFICIAL SCHOOL INFORMATION */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Institutional Details & Identity Content', 'संस्थागत विवरण तथा पहिचान सामाग्री')}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('School Name (English) *', 'विद्यालयको नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.name_en}
                  onChange={e => setSchoolForm({ ...schoolForm, name_en: e.target.value })}
                  placeholder="e.g. Ishwari Secondary School"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('School Name (Nepali) *', 'विद्यालयको नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  required
                  value={schoolForm.name_np}
                  onChange={e => setSchoolForm({ ...schoolForm, name_np: e.target.value })}
                  placeholder="उदा. ईश्वरी माध्यमिक विद्यालय"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Motto / Tagline (English)', 'आदर्श वाक्य / नारा (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={schoolForm.tagline_en}
                  onChange={e => setSchoolForm({ ...schoolForm, tagline_en: e.target.value })}
                  placeholder="e.g. Center for Academic Excellence & Character Building"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Motto / Tagline (Nepali)', 'आदर्श वाक्य / नारा (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={schoolForm.tagline_np}
                  onChange={e => setSchoolForm({ ...schoolForm, tagline_np: e.target.value })}
                  placeholder="उदा. शैक्षिक उत्कृष्टता र चरित्र निर्माणको केन्द्र"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('EMIS Identification Number', 'आधिकारिक EMIS कोड')}
                </label>
                <input
                  type="text"
                  value={schoolForm.code}
                  onChange={e => setSchoolForm({ ...schoolForm, code: e.target.value })}
                  placeholder="e.g. 48012004"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Estd. (B.S.)', 'स्थापना (वि.सं.)')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.estd_bs}
                    onChange={e => setSchoolForm({ ...schoolForm, estd_bs: e.target.value })}
                    placeholder="e.g. 2035 B.S."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Estd. (A.D.)', 'स्थापना (ई.सं.)')}
                  </label>
                  <input
                    type="text"
                    value={schoolForm.estd_ad}
                    onChange={e => setSchoolForm({ ...schoolForm, estd_ad: e.target.value })}
                    placeholder="e.g. 1978"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('School Address (English)', 'विद्यालयको ठेगाना (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={schoolForm.address_en}
                  onChange={e => setSchoolForm({ ...schoolForm, address_en: e.target.value })}
                  placeholder="e.g. Ward No. 4, Nepal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('School Address (Nepali)', 'विद्यालयको ठेगाना (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={schoolForm.address_np}
                  onChange={e => setSchoolForm({ ...schoolForm, address_np: e.target.value })}
                  placeholder="उदा. वडा नं. ४, नेपाल"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Affiliation / Accreditation', 'सम्बन्धन / मान्यता')}
                </label>
                <input
                  type="text"
                  value={schoolForm.affiliation_en}
                  onChange={e => setSchoolForm({ ...schoolForm, affiliation_en: e.target.value })}
                  placeholder="e.g. Government of Nepal, Ministry of Education"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                />
              </div>
            </div>
          </div>

          {/* 2. LOGO MANAGEMENT (UPLOAD, PREVIEW, REPLACE, REMOVE) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Official School Logo / Emblem Management', 'विद्यालयको आधिकारिक लोगो व्यवस्थापन')}</span>
            </h4>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center gap-5">
              {/* Logo Preview Stage with checkerboard background to reveal transparency */}
              <div
                className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-300/80 dark:border-slate-700 relative shadow-inner"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
                }}
                title={t('Logo Preview (Transparency shown over grid)', 'लोगो पूर्वावलोकन')}
              >
                {schoolForm.logo_url && schoolForm.logo_url.trim() ? (
                  <img
                    src={schoolForm.logo_url}
                    alt="Official School Logo"
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <InstitutionalLogo school={school} size="large" />
                )}
              </div>

              {/* Controls */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('Borderless Institutional Emblem', 'बोर्डररहित आधिकारिक लोगो')}
                  </span>
                  {schoolForm.logo_url ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {t('Custom Logo Uploaded', 'कस्टम लोगो सक्रिय')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {t('Default Emblem Active', 'पूर्वनिर्धारित चिन्ह')}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 max-w-xl">
                  {t(
                    'The public header renders the logo with full transparency, larger proportional scale, and no artificial enclosing borders or shadow boxes. PNG with transparent background is recommended.',
                    'सार्वजनिक हेडरमा लोगो बोर्डररहित, पारदर्शी र ठूलो आकारमा प्रस्तुत हुन्छ। पारदर्शी पृष्ठभूमि भएको PNG ढाँचा सिफारिस गरिन्छ।'
                  )}
                </p>

                {/* Upload & Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1 justify-center sm:justify-start">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>{schoolForm.logo_url ? t('Replace Logo', 'लोगो परिवर्तन गर्नुहोस्') : t('Upload Logo', 'लोगो अपलोड')}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>

                  {schoolForm.logo_url && (
                    <button
                      type="button"
                      onClick={() => setSchoolForm(prev => ({ ...prev, logo_url: '' }))}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('Remove Logo', 'लोगो हटाउनुहोस्')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. HEADER APPEARANCE & VISIBILITY SETTINGS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Header Appearance & Visibility Controls', 'हेडर दृश्यता तथा प्रस्तुतीकरण नियन्त्रण')}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {t('Control which institutional identity elements appear publicly', 'सार्वजनिक हेडरमा देखिने कम्पोनेन्टहरू छनोट')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Logo Display Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('School Logo', 'विद्यालय लोगो')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showLogo !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showLogo: currentHeaderConfig.showLogo === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showLogo !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle School Logo"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showLogo !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* School Identity Block Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('School Identity Block', 'विद्यालय पहिचान खण्ड')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showSchoolIdentity !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showSchoolIdentity: currentHeaderConfig.showSchoolIdentity === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showSchoolIdentity !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle School Identity Block"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showSchoolIdentity !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Nepali School Name Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('Nepali School Name', 'नेपाली नाम')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showNepaliName !== false ? t('Show', 'देखाइने') : t('Hide', 'लुकाइने')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showNepaliName: currentHeaderConfig.showNepaliName === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showNepaliName !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Nepali School Name"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showNepaliName !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* EMIS Code Badge Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('EMIS Number Badge', 'EMIS कोड ब्याज')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showEmis !== false ? t('Show', 'देखाइने') : t('Hide', 'लुकाइने')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showEmis: currentHeaderConfig.showEmis === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showEmis !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle EMIS Badge"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showEmis !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Established Year Badge Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('Established Year Badge', 'स्थापना वर्ष ब्याज')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showEstd !== false ? t('Show', 'देखाइने') : t('Hide', 'लुकाइने')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showEstd: currentHeaderConfig.showEstd === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showEstd !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Established Year Badge"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showEstd !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Tagline / Motto Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('Tagline / Motto', 'आदर्श वाक्य / नारा')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showTagline !== false ? t('Show', 'देखाइने') : t('Hide', 'लुकाइने')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showTagline: currentHeaderConfig.showTagline === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showTagline !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Tagline"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showTagline !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Institutional Address Toggle */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t('Institutional Address', 'विद्यालय ठेगाना')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {currentHeaderConfig.showAddress !== false ? t('Show', 'देखाइने') : t('Hide', 'लुकाइने')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({ showAddress: currentHeaderConfig.showAddress === false })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    currentHeaderConfig.showAddress !== false ? 'bg-[#1E40AF]' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle Address"
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      currentHeaderConfig.showAddress !== false ? 'transform translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. TYPOGRAPHY & SIZING SETTINGS */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Typography & Sizing Controls', 'टाइपोग्राफी तथा साइज नियन्त्रण')}</span>
              </h4>
              <span className="text-[11px] text-slate-500">
                {t('Clean responsive size presets (mapped smoothly to standard CSS)', 'सटीक उत्तरदायी आकार विकल्पहरू')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* School Name Size */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('School Name Size', 'विद्यालय नामको आकार')}
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {(['small', 'medium', 'large'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHeaderConfig({ schoolNameSize: sz })}
                      className={`py-1.5 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                        (currentHeaderConfig.schoolNameSize || 'medium') === sz
                          ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t(sz, sz === 'small' ? 'सानो' : sz === 'medium' ? 'मध्यम' : 'ठूलो')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nepali Name Size */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Nepali Name Size', 'नेपाली नामको आकार')}
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {(['small', 'medium', 'large'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHeaderConfig({ nepaliNameSize: sz })}
                      className={`py-1.5 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                        (currentHeaderConfig.nepaliNameSize || 'medium') === sz
                          ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t(sz, sz === 'small' ? 'सानो' : sz === 'medium' ? 'मध्यम' : 'ठूलो')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Size Control */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Logo Size', 'लोगोको आकार')}
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {(['small', 'medium', 'large'] as const).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateHeaderConfig({ logoSize: sz })}
                      className={`py-1.5 text-xs font-semibold rounded-md capitalize transition cursor-pointer ${
                        (currentHeaderConfig.logoSize || 'medium') === sz
                          ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t(sz, sz === 'small' ? 'सानो' : sz === 'medium' ? 'मध्यम' : 'ठूलो')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Identity Alignment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Identity Alignment', 'पहिचान अलाइनमेन्ट')}
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => updateHeaderConfig({ headerIdentityAlignment: 'center' })}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition cursor-pointer ${
                      (currentHeaderConfig.headerIdentityAlignment || 'center') === 'center'
                        ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>{t('Center', 'केन्द्रित')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateHeaderConfig({ headerIdentityAlignment: 'left' })}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1 transition cursor-pointer ${
                      currentHeaderConfig.headerIdentityAlignment === 'left'
                        ? 'bg-white dark:bg-slate-700 text-[#1E40AF] dark:text-blue-300 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>{t('Left', 'बायाँ')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleResetIdentity}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('Reset Defaults', 'पूर्वनिर्धारितमा रिसेट')}</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Site Identity', 'वेबसाइट पहिचान सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. HOMEPAGE SUB-TAB */}
      {activeSubTab === 'website_homepage' && (
        <form onSubmit={handleSaveHomepage} className="space-y-6">
          {/* Hero Section Copy */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layout className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Hero Section Headline & Messaging', 'गृहपृष्ठ मुख्य ब्यानर (Hero Section)')}</span>
                </h3>
                <p className="text-xs text-slate-500">{t('Customize primary welcoming copy and calls to action', 'मुख्य शीर्षक र उपशीर्षक व्यवस्थापन')}</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Homepage', 'सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Badge Pill Text (English)', 'ब्याड्ज पाठ (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={siteForm.heroBadgeEn}
                  onChange={e => setSiteForm({ ...siteForm, heroBadgeEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Badge Pill Text (Nepali)', 'ब्याड्ज पाठ (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={siteForm.heroBadgeNp}
                  onChange={e => setSiteForm({ ...siteForm, heroBadgeNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Main Headline (English) *', 'मुख्य शीर्षक (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={siteForm.heroTitleEn}
                  onChange={e => setSiteForm({ ...siteForm, heroTitleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Main Headline (Nepali) *', 'मुख्य शीर्षक (नेपाली) *')}
                </label>
                <input
                  type="text"
                  required
                  value={siteForm.heroTitleNp}
                  onChange={e => setSiteForm({ ...siteForm, heroTitleNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Subtitle / Mission Description (English)', 'उपशीर्षक / ध्येय (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitleEn}
                  onChange={e => setSiteForm({ ...siteForm, heroSubtitleEn: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Subtitle / Mission Description (Nepali)', 'उपशीर्षक / ध्येय (नेपाली)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.heroSubtitleNp}
                  onChange={e => setSiteForm({ ...siteForm, heroSubtitleNp: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* HOMEPAGE HERO BACKGROUND IMAGE MANAGEMENT & LIVE PREVIEW */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Homepage Hero Background Image & Overlay Controls', 'गृहपृष्ठ मुख्य ब्यानर पृष्ठभूमि तस्बिर तथा ओभरले')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Upload an institutional campus or school photo, configure sizing, positioning, and contrast overlay', 'विद्यालयको पृष्ठभूमि तस्बिर अपलोड, साइज, पोजिसन र ओभरले कन्ट्रास्ट नियन्त्रण गर्नुहोस्')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={siteForm.homeBgEnabled ?? true}
                    onChange={e => {
                      const enabled = e.target.checked;
                      setSiteForm(prev => ({ ...prev, homeBgEnabled: enabled }));
                      setSchoolForm(prev => ({ ...prev, home_bg_enabled: enabled }));
                    }}
                    className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                  />
                  <span>{t('Enable Background Image', 'पृष्ठभूमि तस्बिर सक्रिय')}</span>
                </label>
              </div>
            </div>

            {/* Image Uploader */}
            <CmsImageUploader
              lang={lang}
              label={t('Homepage Hero Background Photo', 'गृहपृष्ठ मुख्य ब्यानर पृष्ठभूमि तस्बिर')}
              description={t('Upload a high-resolution landscape photo of Ishwari Secondary School campus, building, or academic atmosphere (Max 5MB).', 'ईश्वरी माध्यमिक विद्यालयको भवन, परिसर वा शैक्षिक वातावरण झल्कने उच्च गुणस्तरीय फोटो अपलोड गर्नुहोस्।')}
              imageUrl={siteForm.homeBgImage}
              aspectRatioLabel={t('Recommended: 1920 × 1080 px (16:9)', 'सिफारिस: १९२० × १०८० px (१६:९)')}
              maxSizeMB={5}
              onImageChange={(url) => {
                setSiteForm(prev => ({ ...prev, homeBgImage: url, homeBgEnabled: true }));
                setSchoolForm(prev => ({ ...prev, home_bg_image: url, home_bg_enabled: true }));
              }}
              onImageRemove={() => {
                setSiteForm(prev => ({ ...prev, homeBgImage: '', homeBgEnabled: false }));
                setSchoolForm(prev => ({ ...prev, home_bg_image: '', home_bg_enabled: false }));
                onShowToast(t('Background image removed. Default institutional color applied.', 'पृष्ठभूमि तस्बिर हटाइयो। पूर्वनिर्धारित रङ लागू गरियो।'));
              }}
              onShowToast={onShowToast}
            />

            {/* Position, Sizing & Overlay Configuration Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              {/* Background Sizing */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Image Sizing (Background Size)', 'तस्बिरको साइज (Size)')}
                </label>
                <select
                  value={siteForm.homeBgSize || 'cover'}
                  onChange={e => {
                    const val = e.target.value as 'cover' | 'contain';
                    setSiteForm(prev => ({ ...prev, homeBgSize: val }));
                    setSchoolForm(prev => ({ ...prev, home_bg_size: val }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="cover">{t('Cover (Full Width & Crop - Recommended)', 'कभर (सम्पूर्ण भाग भर्ने - सिफारिस)')}</option>
                  <option value="contain">{t('Contain (Fit Entire Image)', 'कन्टेन (सम्पूर्ण तस्बिर देखाउने)')}</option>
                </select>
              </div>

              {/* Background Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Image Alignment (Position)', 'तस्बिरको स्थिति (Position)')}
                </label>
                <select
                  value={siteForm.homeBgPosition || 'center'}
                  onChange={e => {
                    const val = e.target.value as 'center' | 'top' | 'bottom' | 'custom';
                    setSiteForm(prev => ({ ...prev, homeBgPosition: val }));
                    setSchoolForm(prev => ({ ...prev, home_bg_position: val }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="center">{t('Center (Default)', 'बीचमा (Center)')}</option>
                  <option value="top">{t('Top Aligned', 'माथिल्लो भाग (Top)')}</option>
                  <option value="bottom">{t('Bottom Aligned', 'तल्लो भाग (Bottom)')}</option>
                  <option value="custom">{t('Custom Coordinates', 'कस्टम संयोजन (Custom)')}</option>
                </select>
              </div>

              {/* Custom Position Coordinates */}
              {siteForm.homeBgPosition === 'custom' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Custom Coordinates (CSS)', 'कस्टम संयोजन मान (CSS)')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 50% 30% or center top"
                    value={siteForm.homeBgCustomPosition || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setSiteForm(prev => ({ ...prev, homeBgCustomPosition: val }));
                      setSchoolForm(prev => ({ ...prev, home_bg_custom_position: val }));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Overlay Enabled Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Contrast Dark Overlay', 'गाढा कन्ट्रास्ट ओभरले')}
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteForm.homeBgOverlayEnabled ?? true}
                    onChange={e => {
                      const val = e.target.checked;
                      setSiteForm(prev => ({ ...prev, homeBgOverlayEnabled: val }));
                      setSchoolForm(prev => ({ ...prev, home_bg_overlay_enabled: val }));
                    }}
                    className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {siteForm.homeBgOverlayEnabled ?? true
                      ? t('Overlay Active', 'ओभरले सक्रिय')
                      : t('Overlay Disabled', 'ओभरले निष्क्रिय')}
                  </span>
                </label>
              </div>

              {/* Overlay Opacity Slider */}
              {(siteForm.homeBgOverlayEnabled ?? true) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('Overlay Darkness (Strength)', 'ओभरले गाढापन (Darkness)')}
                    </label>
                    <span className="text-xs font-mono font-bold text-[#1E40AF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {siteForm.homeBgOverlayOpacity ?? 85}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    step="5"
                    value={siteForm.homeBgOverlayOpacity ?? 85}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setSiteForm(prev => ({ ...prev, homeBgOverlayOpacity: val }));
                      setSchoolForm(prev => ({ ...prev, home_bg_overlay_opacity: val }));
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1E40AF]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>10% (Subtle)</span>
                    <span>85% (Optimal)</span>
                    <span>95% (Dense)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Institutional Fallback Notification */}
            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">
                  {t('Institutional Fallback Mode: ', 'पूर्वनिर्धारित रङ मोड: ')}
                </span>
                <span>
                  {t(
                    'When background image is disabled or removed, the homepage hero seamlessly falls back to the clean, high-contrast institutional dark slate background with mathematical grid watermark.',
                    'पृष्ठभूमि तस्बिर निष्क्रिय वा खाली हुँदा, गृहपृष्ठको ब्यानर स्वचालित रूपमा उच्च कन्ट्रास्ट भएको गाढा संस्थागत रङ र ग्रिड वाटरमार्कमा प्रस्तुत हुन्छ।'
                  )}
                </span>
              </div>
            </div>

            {/* LIVE DEVICE PREVIEW OF HERO BANNER */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>{t('Live Hero Banner Responsive Preview', 'ब्यानर प्रत्यक्ष उत्तरदायी पूर्वावलोकन')}</span>
                </span>
                {/* Device Switcher Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#1E40AF] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>{t('Desktop', 'डेस्कटप')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      previewDevice === 'tablet'
                        ? 'bg-[#1E40AF] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>{t('Tablet (768px)', 'ट्याब्लेट')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#1E40AF] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t('Mobile (375px)', 'मोबाइल')}</span>
                  </button>
                </div>
              </div>

              {/* Preview Container */}
              <div className="flex justify-center p-4 bg-slate-950/20 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <div
                  className={`transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 relative bg-slate-950 text-white shadow-lg ${
                    previewDevice === 'desktop'
                      ? 'w-full'
                      : previewDevice === 'tablet'
                      ? 'w-[768px]'
                      : 'w-[375px]'
                  }`}
                >
                  {/* Simulated Background */}
                  {siteForm.homeBgEnabled !== false && siteForm.homeBgImage ? (
                    <>
                      <div
                        className="absolute inset-0 bg-no-repeat transition-all"
                        style={{
                          backgroundImage: `url(${siteForm.homeBgImage})`,
                          backgroundPosition: siteForm.homeBgPosition === 'custom' ? siteForm.homeBgCustomPosition || 'center' : siteForm.homeBgPosition || 'center',
                          backgroundSize: siteForm.homeBgSize || 'cover'
                        }}
                      />
                      {(siteForm.homeBgOverlayEnabled ?? true) && (
                        <div
                          className="absolute inset-0 bg-slate-950 transition-opacity"
                          style={{ opacity: (siteForm.homeBgOverlayOpacity ?? 85) / 100 }}
                        />
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />
                  )}

                  {/* Simulated Hero Copy */}
                  <div className="relative z-10 p-6 sm:p-10 space-y-4">
                    {siteForm.heroBadgeEn && (
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-blue-300 text-[10px] font-bold tracking-wider uppercase">
                        {t(siteForm.heroBadgeEn, siteForm.heroBadgeNp)}
                      </span>
                    )}
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                      {t(siteForm.heroTitleEn, siteForm.heroTitleNp)}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 max-w-xl">
                      {t(siteForm.heroSubtitleEn, siteForm.heroSubtitleNp)}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <span className="px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-[11px] font-bold">
                        {t('Explore Academics', 'शैक्षिक कार्यक्रम')}
                      </span>
                      <span className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-200 text-[11px]">
                        {t('Contact School', 'सम्पर्क गर्नुहोस्')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SCHOOL HISTORY PAGE BACKGROUND IMAGE MANAGEMENT */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('School History Page Background & Overlay Controls', 'विद्यालय इतिहास पृष्ठको पृष्ठभूमि तथा ओभरले')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Manage background photo, positioning, and contrast for the School History page banner', 'इतिहास पृष्ठको ब्यानरका लागि पृष्ठभूमि तस्बिर, साइज र कन्ट्रास्ट व्यवस्थापन')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={siteForm.historyBgEnabled ?? false}
                    onChange={e => {
                      const enabled = e.target.checked;
                      setSiteForm(prev => ({ ...prev, historyBgEnabled: enabled }));
                      setSchoolForm(prev => ({ ...prev, history_bg_enabled: enabled }));
                    }}
                    className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                  />
                  <span>{t('Enable History Background', 'इतिहास पृष्ठभूमि सक्रिय')}</span>
                </label>
              </div>
            </div>

            {/* History Media Background Control */}
            <CmsMediaBackgroundControl
              lang={lang}
              label={t('History Page Background', 'इतिहास पृष्ठ पृष्ठभूमि')}
              description={t(
                'Upload JPG, PNG, or animated GIF up to 2MB, or provide an external image/GIF URL.',
                '२MB सम्मको JPG, PNG वा एनिमेटेड GIF अपलोड गर्नुहोस्, वा सुरक्षित URL राख्नुहोस्।'
              )}
              mediaUrl={siteForm.historyBgImage || schoolForm.history_bg_image || ''}
              sourceType={siteForm.historyBgSource || schoolForm.history_bg_source || 'upload'}
              mediaType={siteForm.historyBgMediaType || schoolForm.history_bg_media_type || 'image'}
              maxSizeMB={2}
              category="history_bg"
              allowedFormats={['jpg', 'jpeg', 'png', 'gif']}
              onMediaChange={(url, source, type) => {
                setSiteForm(prev => ({
                  ...prev,
                  historyBgImage: url,
                  historyBgEnabled: true,
                  historyBgSource: source,
                  historyBgMediaType: type
                }));
                setSchoolForm(prev => ({
                  ...prev,
                  history_bg_image: url,
                  history_bg_enabled: true,
                  history_bg_source: source,
                  history_bg_media_type: type
                }));
              }}
              onMediaRemove={() => {
                setSiteForm(prev => ({
                  ...prev,
                  historyBgImage: '',
                  historyBgEnabled: false,
                  historyBgSource: 'upload',
                  historyBgMediaType: 'image'
                }));
                setSchoolForm(prev => ({
                  ...prev,
                  history_bg_image: '',
                  history_bg_enabled: false,
                  history_bg_source: 'upload',
                  history_bg_media_type: 'image'
                }));
                onShowToast(t('History background image removed. Default institutional gradient applied.', 'इतिहास पृष्ठभूमि तस्बिर हटाइयो। पूर्वनिर्धारित ग्रेडिएन्ट लागू गरियो।'));
              }}
              onShowToast={onShowToast}
            />

            {/* History Position, Sizing & Overlay Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Image Sizing', 'तस्बिर साइज')}
                </label>
                <select
                  value={siteForm.historyBgSize || 'cover'}
                  onChange={e => {
                    const val = e.target.value as 'cover' | 'contain';
                    setSiteForm(prev => ({ ...prev, historyBgSize: val }));
                    setSchoolForm(prev => ({ ...prev, history_bg_size: val }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="cover">{t('Cover (Full Width & Crop)', 'कभर (Cover)')}</option>
                  <option value="contain">{t('Contain (Fit Entire Image)', 'कन्टेन (Contain)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Image Position', 'तस्बिर स्थिति')}
                </label>
                <select
                  value={siteForm.historyBgPosition || 'center'}
                  onChange={e => {
                    const val = e.target.value as 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
                    setSiteForm(prev => ({ ...prev, historyBgPosition: val }));
                    setSchoolForm(prev => ({ ...prev, history_bg_position: val }));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="center">{t('Center (Default)', 'बीचमा (Center)')}</option>
                  <option value="top">{t('Top Aligned', 'माथिल्लो भाग (Top)')}</option>
                  <option value="bottom">{t('Bottom Aligned', 'तल्लो भाग (Bottom)')}</option>
                  <option value="left">{t('Left Aligned', 'बायाँ भाग (Left)')}</option>
                  <option value="right">{t('Right Aligned', 'दायाँ भाग (Right)')}</option>
                  <option value="custom">{t('Custom Coordinates', 'कस्टम संयोजन (Custom)')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Dark Overlay', 'कन्ट्रास्ट ओभरले')}
                </label>
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteForm.historyBgOverlayEnabled ?? true}
                    onChange={e => {
                      const val = e.target.checked;
                      setSiteForm(prev => ({ ...prev, historyBgOverlayEnabled: val }));
                      setSchoolForm(prev => ({ ...prev, history_bg_overlay_enabled: val }));
                    }}
                    className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                  />
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    {siteForm.historyBgOverlayEnabled ?? true
                      ? t('Overlay Active', 'ओभरले सक्रिय')
                      : t('Overlay Disabled', 'ओभरले निष्क्रिय')}
                  </span>
                </label>
              </div>

              {(siteForm.historyBgOverlayEnabled ?? true) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('Overlay Darkness', 'ओभरले गाढापन')}
                    </label>
                    <span className="text-xs font-mono font-bold text-[#1E40AF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                      {siteForm.historyBgOverlayOpacity ?? 80}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    step="5"
                    value={siteForm.historyBgOverlayOpacity ?? 80}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setSiteForm(prev => ({ ...prev, historyBgOverlayOpacity: val }));
                      setSchoolForm(prev => ({ ...prev, history_bg_overlay_opacity: val }));
                    }}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1E40AF]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Educational Background Visual System Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
                  <span>{t('Educational Background Visual System', 'शैक्षिक पृष्ठभूमि दृश्य व्यवस्था')}</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(
                    'Configure living, subtle educational watermarks and interaction dynamics (ambient motion, pointer proximity, touch response).',
                    'मन्द शैक्षिक वाटरमार्क र जीवित अन्तरक्रिया प्रणाली (सुस्त चाल, कर्सर निकटता, स्पर्श प्रतिक्रिया) व्यवस्थापन गर्नुहोस्।'
                  )}
                </p>
              </div>

              {/* Global Quick-Action Helpers */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSiteForm(prev => {
                      const updated: Record<string, EducationalSectionBgConfig> = {};
                      ['hero', 'principal', 'facilities', 'academics', 'about_intro', 'footer'].forEach(secKey => {
                        const cur = prev.educationalBackgrounds?.[secKey] || {
                          enabled: true,
                          mode: 'preset',
                          preset: 'open_books',
                          opacity: 4,
                          placement: 'right'
                        };
                        updated[secKey] = {
                          ...cur,
                          enabled: true,
                          interaction: 'interactive',
                          style: 'subtle',
                          opacity: 4
                        };
                      });
                      return { ...prev, educationalBackgrounds: updated };
                    });
                    onShowToast(t('Living interactive mode applied to all sections!', 'सबै सेक्सनहरूमा जीवित अन्तरक्रियात्मक मोड लागू गरियो!'));
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
                >
                  {t('Set All to Interactive', 'सबैमा अन्तरक्रिया सक्रिय')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSiteForm(prev => {
                      const updated: Record<string, EducationalSectionBgConfig> = {};
                      ['hero', 'principal', 'facilities', 'academics', 'about_intro', 'footer'].forEach(secKey => {
                        const cur = prev.educationalBackgrounds?.[secKey] || {
                          enabled: true,
                          mode: 'preset',
                          preset: 'open_books',
                          opacity: 4,
                          placement: 'right'
                        };
                        updated[secKey] = {
                          ...cur,
                          interaction: 'static'
                        };
                      });
                      return { ...prev, educationalBackgrounds: updated };
                    });
                    onShowToast(t('Static mode applied to all backgrounds.', 'सबै पृष्ठभूमिहरू स्थिर मोडमा सेट गरियो।'));
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  {t('Set All to Static', 'सबै स्थिर राख्नुहोस्')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'hero', nameEn: 'Homepage Hero Banner', nameNp: 'गृहपृष्ठ मुख्य ब्यानर', defaultPreset: 'school_building' as EducationalBgPreset },
                { key: 'principal', nameEn: "Principal's Desk Message", nameNp: 'प्रधानाध्यापकको सन्देश', defaultPreset: 'classroom' as EducationalBgPreset },
                { key: 'facilities', nameEn: 'Campus Infrastructure & Labs', nameNp: 'पूर्वाधार तथा प्रयोगशाला', defaultPreset: 'science_lab' as EducationalBgPreset },
                { key: 'academics', nameEn: 'Academic Programs & Streams', nameNp: 'शैक्षिक कार्यक्रम तथा संकाय', defaultPreset: 'open_books' as EducationalBgPreset },
                { key: 'about_intro', nameEn: 'About Us Institutional Profile', nameNp: 'हाम्रो बारेमा संस्थागत चिनारी', defaultPreset: 'library_books' as EducationalBgPreset },
                { key: 'footer', nameEn: 'Institutional Public Footer', nameNp: 'सार्वजनिक पादपृष्ठ (फुटर)', defaultPreset: 'graduation_cap' as EducationalBgPreset }
              ].map(sec => {
                const currentBg: EducationalSectionBgConfig = siteForm.educationalBackgrounds?.[sec.key] || {
                  enabled: true,
                  mode: 'preset',
                  preset: sec.defaultPreset,
                  opacity: 4,
                  placement: 'right',
                  style: 'subtle',
                  interaction: 'interactive'
                };

                const updateBg = (patch: Partial<EducationalSectionBgConfig>) => {
                  setSiteForm(prev => {
                    const existing = prev.educationalBackgrounds || {};
                    return {
                      ...prev,
                      educationalBackgrounds: {
                        ...existing,
                        [sec.key]: {
                          ...currentBg,
                          ...patch
                        }
                      }
                    };
                  });
                };

                return (
                  <div
                    key={sec.key}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t(sec.nameEn, sec.nameNp)}
                        </span>
                      </div>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentBg.enabled}
                          onChange={e => updateBg({ enabled: e.target.checked })}
                          className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                        />
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {currentBg.enabled ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                        </span>
                      </label>
                    </div>

                    {currentBg.enabled && (
                      <div className="space-y-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        {/* Preset & Placement */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {t('Theme Preset', 'थिम ढाँचा')}
                            </label>
                            <select
                              value={currentBg.preset || sec.defaultPreset}
                              onChange={e => updateBg({ preset: e.target.value as EducationalBgPreset, mode: 'preset' })}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            >
                              <option value="open_books">{t('Open Books', 'खुला पुस्तक')}</option>
                              <option value="school_building">{t('School Building / Facade', 'विद्यालय भवन')}</option>
                              <option value="students_studying">{t('Students Studying', 'विद्यार्थी अध्ययन')}</option>
                              <option value="graduation_cap">{t('Graduation Cap & Laurels', 'दीक्षान्त टोपी')}</option>
                              <option value="globe">{t('Globe & Geography', 'ग्लोब तथा भूगोल')}</option>
                              <option value="mathematics">{t('Mathematics & Geometry', 'गणित तथा ज्यामिति')}</option>
                              <option value="science_lab">{t('Science & Laboratory', 'विज्ञान प्रयोगशाला')}</option>
                              <option value="microscope">{t('Microscope & Optics', 'सूक्ष्मदर्शक यन्त्र')}</option>
                              <option value="pencil">{t('Pencil & Drafting Tools', 'सिसाकलम तथा रेखाचित्र')}</option>
                              <option value="classroom">{t('Classroom & Podium', 'कक्षाकोठा')}</option>
                              <option value="library_books">{t('Library & Bookshelf', 'पुस्तकालय')}</option>
                              <option value="academic_patterns">{t('Academic Crest & Patterns', 'संस्थागत प्रतीक तथा ढाँचा')}</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {t('Placement', 'स्थान')}
                            </label>
                            <select
                              value={currentBg.placement || 'right'}
                              onChange={e => updateBg({ placement: e.target.value as any })}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            >
                              <option value="right">{t('Right Side', 'दायाँतर्फ')}</option>
                              <option value="left">{t('Left Side', 'बायाँतर्फ')}</option>
                              <option value="center">{t('Center Watermark', 'केन्द्रमा')}</option>
                              <option value="top-right">{t('Top Right', 'माथि दायाँ')}</option>
                              <option value="bottom-right">{t('Bottom Right', 'तल दायाँ')}</option>
                              <option value="top-left">{t('Top Left', 'माथि बायाँ')}</option>
                              <option value="bottom-left">{t('Bottom Left', 'तल बायाँ')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Visual Style & Interaction Mode */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {t('Visual Style', 'दृश्य शैली')}
                            </label>
                            <select
                              value={currentBg.style || 'subtle'}
                              onChange={e => {
                                const style = e.target.value as EducationalBgStyle;
                                const defaultOpacities: Record<EducationalBgStyle, number> = {
                                  none: 0,
                                  subtle: 4,
                                  soft: 7,
                                  medium: 10
                                };
                                updateBg({
                                  style,
                                  opacity: defaultOpacities[style] ?? currentBg.opacity
                                });
                              }}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            >
                              <option value="subtle">{t('Subtle (~4%)', 'अति मन्द (~४%)')}</option>
                              <option value="soft">{t('Soft (~7%)', 'हल्का (~७%)')}</option>
                              <option value="medium">{t('Medium (~10%)', 'मध्यम (~१०%)')}</option>
                              <option value="none">{t('None (Hidden)', 'कुनै पनि होइन')}</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                              {t('Interaction Dynamics', 'अन्तरक्रिया प्रणाली')}
                            </label>
                            <select
                              value={currentBg.interaction || 'interactive'}
                              onChange={e => updateBg({ interaction: e.target.value as EducationalBgInteraction })}
                              className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                            >
                              <option value="interactive">{t('Interactive (Alive + Proximity)', 'जीवित अन्तरक्रियात्मक (कर्सर+चाल)')}</option>
                              <option value="gentle_motion">{t('Gentle Motion (Ambient Only)', 'सुस्त चाल (परिवेश मात्र)')}</option>
                              <option value="static">{t('Static (No Movement)', 'स्थिर (चालविहीन)')}</option>
                            </select>
                          </div>
                        </div>

                        {/* Fine Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 mb-1">
                            <span>{t('Fine Opacity Calibration', 'सूक्ष्म पारदर्शिता क्यालिब्रेसन')}</span>
                            <span className="font-mono font-bold text-[#1E40AF] dark:text-blue-400">
                              {currentBg.opacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            step="1"
                            value={currentBg.opacity}
                            onChange={e => updateBg({ opacity: parseInt(e.target.value, 10) })}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1E40AF]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOMEPAGE SECTION BUILDER (Requirement 3) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Homepage Section Builder & Architecture', 'गृहपृष्ठ सेक्सन व्यवस्थापक तथा क्रम')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Control section ordering, visibility, headline titles, and subtitles across the dynamic school portal.', 'सार्वजनिक गृहपृष्ठका प्रत्येक सेक्सनको क्रम, दृश्यता, शीर्षक र उपशीर्षक नियन्त्रण गर्नुहोस्।')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetHomepageSections}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Reset Section Order', 'पूर्वनिर्धारित क्रम')}</span>
                </button>
              </div>
            </div>

            {/* List of Managed Sections */}
            <div className="space-y-3">
              {[...(siteForm.homepageSections && siteForm.homepageSections.length > 0 ? siteForm.homepageSections : defaultHomepageSections)]
                .sort((a, b) => a.order - b.order)
                .map((sec, idx, arr) => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-xl border transition-all ${
                      sec.enabled !== false
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs'
                        : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      {/* Left: Reorder & Status & Section Name */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Order Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveHomepageSection(idx, 'up')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title={t('Move Up', 'माथि सार्नुहोस्')}
                          >
                            <ChevronUp className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs text-[#1E40AF] dark:text-blue-400">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveHomepageSection(idx, 'down')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title={t('Move Down', 'तल सार्नुहोस्')}
                          >
                            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>

                        {/* Identification */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {t(sec.nameEn, sec.nameNp)}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {sec.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 truncate block">
                            {sec.layout ? `Layout: ${sec.layout}` : 'Standard Safe Layout'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Visibility Switch */}
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={sec.enabled !== false}
                            onChange={() => handleToggleHomepageSection(sec.id)}
                            className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                          />
                          <span className={`text-xs font-semibold ${sec.enabled !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {sec.enabled !== false ? t('Visible on Home', 'गृहपृष्ठमा सक्रिय') : t('Hidden / Disabled', 'निष्क्रिय')}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Section Titles Editing (Shown when enabled) */}
                    {sec.enabled !== false && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t('Section Title (English)', 'सेक्सन शीर्षक (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={sec.title_en || ''}
                            onChange={e => handleUpdateHomepageSection(sec.id, { title_en: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="e.g. Official Announcements"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t('Section Title (Nepali)', 'सेक्सन शीर्षक (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={sec.title_np || ''}
                            onChange={e => handleUpdateHomepageSection(sec.id, { title_np: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="उदा: आधिकारिक सूचनाहरू"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t('Subtitle (English)', 'उपशीर्षक (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={sec.subtitle_en || ''}
                            onChange={e => handleUpdateHomepageSection(sec.id, { subtitle_en: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Short explanatory subtext"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            {t('Subtitle (Nepali)', 'उपशीर्षक (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={sec.subtitle_np || ''}
                            onChange={e => handleUpdateHomepageSection(sec.id, { subtitle_np: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="संक्षिप्त विवरण"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* QUICK ACCESS / INFORMATION HUB MANAGER (Requirement 4) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Quick Access / Information Hub Items', 'द्रुत पहुँच तथा सूचना केन्द्र व्यवस्थापन')}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('Manage institutional shortcuts with thin-line SVG icons, labels, descriptions, and target routes.', 'गृहपृष्ठमा देखिने द्रुत सेवा, क्यालेन्डर, पाठ्यक्रम र डाउनलोडका सर्टकट लिङ्कहरू व्यवस्थापन गर्नुहोस्।')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetQuickAccess}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/60 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Reset Quick Links', 'पूर्वनिर्धारित लिङ्क')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddQuickAccess}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add New Shortcut', 'नयाँ सर्टकट थप्नुहोस्')}</span>
                </button>
              </div>
            </div>

            {/* List of Quick Access Items */}
            <div className="space-y-3">
              {[...(siteForm.quickAccessItems && siteForm.quickAccessItems.length > 0 ? siteForm.quickAccessItems : defaultQuickAccessItems)]
                .sort((a, b) => a.order - b.order)
                .map((item, idx, arr) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.enabled !== false
                        ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                        : 'border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Reorder & Icon & Title */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveQuickAccess(idx, 'up')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title={t('Move Up', 'माथि')}
                          >
                            <ChevronUp className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <span className="w-5 text-center font-mono font-bold text-xs text-[#1E40AF] dark:text-blue-400">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={() => handleMoveQuickAccess(idx, 'down')}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                            title={t('Move Down', 'तल')}
                          >
                            <ChevronDown className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>

                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {t(item.title_en, item.title_np)}
                          </h5>
                          <span className="text-[11px] font-mono text-slate-500">
                            Route: /{item.route}
                          </span>
                        </div>
                      </div>

                      {/* Right: Actions & Visibility */}
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.enabled !== false}
                            onChange={() => handleToggleQuickAccess(item.id)}
                            className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                          />
                          <span className={`text-xs font-semibold ${item.enabled !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {item.enabled !== false ? t('Active', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuickAccess(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title={t('Remove Shortcut', 'हटाउनुहोस्')}
                        >
                          <Trash2 className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </div>
                    </div>

                    {/* Editable fields */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Icon (Thin SVG)', 'आइकन')}
                        </label>
                        <select
                          value={item.icon || 'Compass'}
                          onChange={e => handleUpdateQuickAccess(item.id, { icon: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="Bell">Bell (सूचना)</option>
                          <option value="Calendar">Calendar (क्यालेन्डर)</option>
                          <option value="BookMarked">BookMarked (पाठ्यक्रम)</option>
                          <option value="Download">Download (डाउनलोड)</option>
                          <option value="Clock">Clock (कार्यक्रम तालिका)</option>
                          <option value="Briefcase">Briefcase (रोजगारी)</option>
                          <option value="Award">Award (उपलब्धि/सम्मान)</option>
                          <option value="Users">Users (शिक्षक/कर्मचारी)</option>
                          <option value="Building2">Building (पूर्वाधार)</option>
                          <option value="PhoneCall">Phone (सम्पर्क)</option>
                          <option value="Image">Image (ग्यालरी)</option>
                          <option value="Compass">Compass (मार्गदर्शन)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Target Route', 'गन्तव्य मार्ग')}
                        </label>
                        <select
                          value={item.route}
                          onChange={e => handleUpdateQuickAccess(item.id, { route: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                        >
                          <option value="notices">/notices (Notice Board)</option>
                          <option value="academic-calendar">/academic-calendar (Calendar)</option>
                          <option value="curriculum">/curriculum (Curriculum & Resources)</option>
                          <option value="documents">/documents (Downloads Center)</option>
                          <option value="events">/events (Events & Programs)</option>
                          <option value="notice">/notice (Vacancies / Circulars)</option>
                          <option value="achievements">/achievements (Student Honors)</option>
                          <option value="staff">/staff (Faculty Directory)</option>
                          <option value="facilities">/facilities (Campus Facilities)</option>
                          <option value="contact">/contact (Helpdesk & Inquiry)</option>
                          <option value="academics">/academics (Academic Programs)</option>
                          <option value="about">/about (Institutional Profile)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Title (English)', 'शीर्षक (अंग्रेजी)')}
                        </label>
                        <input
                          type="text"
                          value={item.title_en}
                          onChange={e => handleUpdateQuickAccess(item.id, { title_en: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Title (Nepali)', 'शीर्षक (नेपाली)')}
                        </label>
                        <input
                          type="text"
                          value={item.title_np}
                          onChange={e => handleUpdateQuickAccess(item.id, { title_np: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Short Description (English)', 'संक्षिप्त विवरण (अंग्रेजी)')}
                        </label>
                        <input
                          type="text"
                          value={item.desc_en || ''}
                          onChange={e => handleUpdateQuickAccess(item.id, { desc_en: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          {t('Short Description (Nepali)', 'संक्षिप्त विवरण (नेपाली)')}
                        </label>
                        <input
                          type="text"
                          value={item.desc_np || ''}
                          onChange={e => handleUpdateQuickAccess(item.id, { desc_np: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bottom Sticky/Prominent Save Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              {t('Ensure all headline copy, background photos, and section toggles are configured accurately before saving.', 'सबै शीर्षक, पृष्ठभूमि तस्बिर र सेक्सनहरू जाँच गरी सुरक्षित गर्नुहोस्।')}
            </p>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-sm transition cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save All Homepage Settings', 'सबै गृहपृष्ठ सेटिङ सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. HEADER & TOP BAR SUB-TAB */}
      {activeSubTab === 'website_header' && (
        <form onSubmit={handleSaveHeader} className="space-y-6">
          {/* Header Action & Summary Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PanelTop className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Public Top Bar & Header Management', 'सार्वजनिक शीर्ष पट्टी तथा हेडर व्यवस्थापन')}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('Manage the existing public top bar elements (flag, news ticker, academic year, live clock, search, language, theme) without duplicating components.', 'सार्वजनिक शीर्ष पट्टीका सम्पूर्ण कम्पोनेन्टहरू (झण्डा, सूचना, शैक्षिक सत्र, घडी, खोजी, भाषा, थिम) व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetHeader}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                title={t('Reset top bar & header to default settings', 'पूर्वनिर्धारित मानहरूमा रिसेट गर्नुहोस्')}
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('Reset to Default', 'पूर्वनिर्धारितमा रिसेट')}</span>
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Changes', 'परिवर्तनहरू सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>
          </div>

          {/* REAL-TIME LIVE PREVIEW: Sleek Dark Navy Public Top Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs bg-slate-950">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-2 text-[11px] uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('Real-Time Live Preview — Public Top Bar', 'प्रत्यक्ष पूर्वावलोकन — सार्वजनिक शीर्ष पट्टी')}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentHeaderConfig.showTopBar ? t('● Status: Active & Visible', '● अवस्था: सक्रिय तथा दृश्यमान') : t('○ Status: Disabled / Hidden', '○ अवस्था: निष्क्रिय')}
              </span>
            </div>

            {currentHeaderConfig.showTopBar ? (
              <div className="bg-[#0B1528] text-slate-200 text-xs px-4 py-2 border-b border-slate-800/80 min-h-[42px] flex items-center">
                <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
                  {/* Left: News */}
                  <div className="flex items-center space-x-2.5 overflow-hidden flex-1 min-w-0">
                    {currentHeaderConfig.showAlertTicker !== false && (
                      <div className="flex items-center space-x-2 overflow-hidden min-w-0 flex-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold bg-[#0284C7] text-white tracking-wider shrink-0 uppercase">
                          <Bell className="w-2.5 h-2.5 animate-pulse text-white stroke-[2.2]" />
                          <span>{isNp ? (currentHeaderConfig.tickerTitleNp || 'ताजा समाचार') : (currentHeaderConfig.tickerTitleEn || 'Latest News')}</span>
                        </span>
                        <div className="overflow-hidden truncate text-slate-300 text-xs flex items-center gap-2">
                          <span>
                            {currentHeaderConfig.tickerMode === 'custom'
                              ? (isNp ? (siteForm.alertTickerNp || 'शैक्षिक सत्र २०८३ को नयाँ भर्ना खुल्यो।') : (siteForm.alertTickerEn || 'Admissions open for Class 11 Science & Management 2083'))
                              : currentHeaderConfig.tickerMode === 'selected_notice' && currentHeaderConfig.selectedNoticeId
                              ? (notices.find(n => n.id === currentHeaderConfig.selectedNoticeId)?.title_en || 'Selected Circular / Notice')
                              : notices.length > 0
                              ? (isNp ? notices[0].title_np || notices[0].title_en : notices[0].title_en)
                              : 'Institutional notice circular feed from database'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Academic Year + Clock + Search + Language + Larger Flag + Theme */}
                  <div className="flex items-center space-x-2 sm:space-x-2.5 shrink-0">
                    {currentHeaderConfig.showAcademicYear !== false && (
                      <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/80 text-slate-200 text-[11px] select-none shrink-0 font-sans">
                        <span className="text-slate-400 font-medium">
                          {isNp ? (currentHeaderConfig.academicYearLabelNp || 'वार्षिक') : (currentHeaderConfig.academicYearLabelEn || 'Annual')}
                        </span>
                        <span className="text-slate-600 font-mono text-[10px]">{currentHeaderConfig.academicYearSeparator || '|'}</span>
                        <span className="text-amber-400 font-bold font-mono tracking-wide">{currentHeaderConfig.academicYearValue || '2083'}</span>
                      </div>
                    )}

                    {currentHeaderConfig.showBsClock !== false && (currentHeaderConfig.showDate !== false || currentHeaderConfig.showTime !== false) && previewTimeStr && (
                      <div className="hidden md:inline-flex items-center gap-1.5 w-fit min-w-fit px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/80 text-slate-200 font-mono text-[11px] leading-none whitespace-nowrap">
                        <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="tabular-nums">{previewTimeStr}</span>
                      </div>
                    )}

                    {currentHeaderConfig.showSearchButton !== false && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/70 text-slate-300 border border-slate-700/80 text-xs">
                        <Search className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="hidden sm:inline text-[11px]">
                          {isNp ? (currentHeaderConfig.searchPlaceholderNp || 'खोज्नुहोस्') : (currentHeaderConfig.searchPlaceholderEn || 'Search')}
                        </span>
                        {currentHeaderConfig.showSearchShortcut !== false && (
                          <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-slate-900 text-[9px] font-mono text-slate-400 border border-slate-700">⌘K</kbd>
                        )}
                      </div>
                    )}

                    {currentHeaderConfig.showLanguageToggle !== false && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/80 text-xs font-semibold text-slate-200">
                        <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                        {currentHeaderConfig.langDisplayMode === 'standard' ? (
                          <div className="flex items-center gap-0.5 text-[11px] font-mono tracking-wider">
                            <span className="text-amber-300 font-bold">{currentHeaderConfig.langLabelNp || 'नेपा'}</span>
                            <span className="text-slate-600 text-[9px]">/</span>
                            <span className="text-slate-400">{currentHeaderConfig.langLabelEn || 'EN'}</span>
                          </div>
                        ) : (
                          <span>{isNp ? 'EN' : 'नेपाली'}</span>
                        )}
                      </div>
                    )}

                    {/* Larger Nepal Flag on the Right (if before_theme) */}
                    {currentHeaderConfig.showNationalFlag !== false && currentHeaderConfig.flagPosition === 'before_theme' && (
                      <div className="inline-flex items-center px-1 shrink-0 select-none self-center" title="Larger Nepal Flag">
                        {currentHeaderConfig.flagMode === 'custom' && currentHeaderConfig.customFlagImage && currentHeaderConfig.customFlagImage.trim() ? (
                          <img
                            src={currentHeaderConfig.customFlagImage}
                            alt="Custom Flag"
                            className={`${
                              currentHeaderConfig.flagSize === 'large'
                                ? 'h-8'
                                : currentHeaderConfig.flagSize === 'compact'
                                ? 'h-6'
                                : 'h-7'
                            } w-auto object-contain align-middle`}
                          />
                        ) : (
                          <LargeNepalFlag
                            className={`${
                              currentHeaderConfig.flagSize === 'large'
                                ? 'h-8'
                                : currentHeaderConfig.flagSize === 'compact'
                                ? 'h-6'
                                : 'h-7'
                            } w-auto`}
                          />
                        )}
                      </div>
                    )}

                    {currentHeaderConfig.showThemeSwitch !== false && (
                      <div className="p-1 rounded-md border border-slate-700/80 bg-slate-800/70 text-slate-300">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    )}

                    {/* Outer Right Edge Flag Placement (Recommended) */}
                    {currentHeaderConfig.showNationalFlag !== false && currentHeaderConfig.flagPosition !== 'before_theme' && (
                      <div className="inline-flex items-center pl-1 shrink-0 select-none self-center" title="Larger Nepal Flag">
                        {currentHeaderConfig.flagMode === 'custom' && currentHeaderConfig.customFlagImage && currentHeaderConfig.customFlagImage.trim() ? (
                          <img
                            src={currentHeaderConfig.customFlagImage}
                            alt="Custom Flag"
                            className={`${
                              currentHeaderConfig.flagSize === 'large'
                                ? 'h-8'
                                : currentHeaderConfig.flagSize === 'compact'
                                ? 'h-6'
                                : 'h-7'
                            } w-auto object-contain align-middle`}
                          />
                        ) : (
                          <LargeNepalFlag
                            className={`${
                              currentHeaderConfig.flagSize === 'large'
                                ? 'h-8'
                                : currentHeaderConfig.flagSize === 'compact'
                                ? 'h-6'
                                : 'h-7'
                            } w-auto`}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 italic bg-slate-900/50">
                {t('Top Bar is currently disabled. It will not be rendered on the public website.', 'शीर्ष पट्टी हाल निष्क्रिय गरिएको छ।')}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 1: TOP BAR GENERAL SETTINGS & MASTER TOGGLES         */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#1E40AF]" />
                  <span>{t('1. Top Bar General Settings & Master Toggles', '१. शीर्ष पट्टी सामान्य सेटिङ तथा मास्टर टगल')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Enable or disable the entire public top bar and individual components with instant sync to database', 'सार्वजनिक शीर्ष पट्टी र यसका मुख्य कम्पोनेन्टहरू सक्रिय वा निष्क्रिय गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showTopBar ? t('Top Bar Enabled', 'शीर्ष पट्टी सक्रिय') : t('Top Bar Disabled', 'शीर्ष पट्टी निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showTopBar}
                  onChange={e => updateHeaderConfig({ showTopBar: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showTopBar && (
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  {t('Component Visibility Toggles', 'कम्पोनेन्टहरूको दृश्यता (Show / Hide)')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* 1. National Flag (Right Side) */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showNationalFlag !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Flag className="w-4 h-4 text-red-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('National Flag (Right)', 'राष्ट्रिय झण्डा (दायाँ)')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showNationalFlag !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showNationalFlag !== false}
                      onChange={e => updateHeaderConfig({ showNationalFlag: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 2. Latest News */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showAlertTicker !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-sky-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Latest News', 'ताजा समाचार')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showAlertTicker !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showAlertTicker !== false}
                      onChange={e => updateHeaderConfig({ showAlertTicker: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 3. Academic Year */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showAcademicYear !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Academic Year', 'शैक्षिक सत्र / वार्षिक')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showAcademicYear !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showAcademicYear !== false}
                      onChange={e => updateHeaderConfig({ showAcademicYear: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 4. Date & Live Time */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showBsClock !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Date & Time', 'मिति र घडी')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showBsClock !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showBsClock !== false}
                      onChange={e => updateHeaderConfig({ showBsClock: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 5. Search */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showSearchButton !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Search (⌘K)', 'खोज बटन')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showSearchButton !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showSearchButton !== false}
                      onChange={e => updateHeaderConfig({ showSearchButton: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 6. Language Switcher */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showLanguageToggle !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Language Switcher', 'भाषा स्विच (नेपा/EN)')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showLanguageToggle !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showLanguageToggle !== false}
                      onChange={e => updateHeaderConfig({ showLanguageToggle: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* 7. Theme Toggle */}
                  <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    currentHeaderConfig.showThemeSwitch !== false
                      ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">{t('Theme Toggle', 'थिम स्विच (लाइट/डार्क)')}</div>
                        <div className="text-[10px] text-slate-500">{currentHeaderConfig.showThemeSwitch !== false ? t('Visible', 'दृश्यमान') : t('Hidden', 'लुकेको')}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showThemeSwitch !== false}
                      onChange={e => updateHeaderConfig({ showThemeSwitch: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: NEPAL NATIONAL FLAG SETTINGS                     */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5 text-red-600" />
                  <span>{t('2. Nepal National Flag Settings', '२. नेपालको राष्ट्रिय झण्डा सेटिङ')}</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {t('Manage the prominent waving Nepal national flag on the right side of the top bar', 'शीर्ष पट्टीको दायाँ भागमा देखिने मुख्य लहरिँदो राष्ट्रिय झण्डा व्यवस्थापन गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showNationalFlag !== false ? t('Right Flag Enabled', 'दायाँ झण्डा सक्रिय') : t('Right Flag Disabled', 'दायाँ झण्डा निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showNationalFlag !== false}
                  onChange={e => updateHeaderConfig({ showNationalFlag: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {/* Live Visual Preview & Restore Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-16 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {currentHeaderConfig.showNationalFlag !== false ? (
                    currentHeaderConfig.flagMode === 'custom' && currentHeaderConfig.customFlagImage && currentHeaderConfig.customFlagImage.trim() ? (
                      <img
                        src={currentHeaderConfig.customFlagImage}
                        alt="Custom Flag"
                        className={`${
                          currentHeaderConfig.flagSize === 'large'
                            ? 'h-10'
                            : currentHeaderConfig.flagSize === 'compact'
                            ? 'h-7'
                            : 'h-8'
                        } w-auto object-contain`}
                      />
                    ) : (
                      <LargeNepalFlag
                        className={`${
                          currentHeaderConfig.flagSize === 'large'
                            ? 'h-10'
                            : currentHeaderConfig.flagSize === 'compact'
                            ? 'h-7'
                            : 'h-8'
                        } w-auto`}
                      />
                    )
                  ) : (
                    <EyeOff className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{t('Right-Side National Flag Preview', 'दायाँ राष्ट्रिय झण्डा पूर्वावलोकन')}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-normal bg-slate-800 text-amber-300 border border-slate-700">
                      {currentHeaderConfig.flagSize === 'large'
                        ? 'Large (38–40px)'
                        : currentHeaderConfig.flagSize === 'compact'
                        ? 'Compact (26–28px)'
                        : 'Normal (32–36px)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentHeaderConfig.showNationalFlag !== false
                      ? (currentHeaderConfig.flagMode === 'custom' ? t('Custom uploaded image flag', 'कस्टम अपलोड गरिएको झण्डा') : t('Official authentic double-pennant Nepal flag', 'आधिकारिक द्वित्रिकोण नेपालको राष्ट्रिय झण्डा'))
                      : t('National flag is currently hidden from top bar', 'राष्ट्रिय झण्डा हाल शीर्ष पट्टीबाट लुकाइएको छ')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateHeaderConfig({
                    showNationalFlag: true,
                    flagMode: 'default_nepal',
                    customFlagImage: '',
                    flagSize: 'normal',
                    flagPosition: 'after_theme',
                  })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
                  title={t('Restore default Nepal flag and positions', 'पूर्वनिर्धारित झण्डा र स्थितिमा फर्काउनुहोस्')}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('Restore Default Flag', 'पूर्वनिर्धारितमा फर्काउनुहोस्')}</span>
                </button>
              </div>
            </div>

            {/* Main Controls Grid */}
            <div className="space-y-4">
              {/* Flag Size Adjustment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('Flag Size (Clearly Visible & Institutional)', 'झण्डाको आकार (स्पष्ट र व्यावसायिक)')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    (currentHeaderConfig.flagSize || 'normal') === 'normal'
                      ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}>
                    <input
                      type="radio"
                      name="flagSize"
                      value="normal"
                      checked={(currentHeaderConfig.flagSize || 'normal') === 'normal'}
                      onChange={() => updateHeaderConfig({ flagSize: 'normal' })}
                      className="text-[#1E40AF]"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{t('Normal (32–36px)', 'सामान्य (३२–३६px)')}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold uppercase">{t('Recommended', 'सिफारिस')}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t('Clearly visible, balanced institutional height', 'स्पष्ट देखिने, सन्तुलित उचाइ')}</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    currentHeaderConfig.flagSize === 'large'
                      ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}>
                    <input
                      type="radio"
                      name="flagSize"
                      value="large"
                      checked={currentHeaderConfig.flagSize === 'large'}
                      onChange={() => updateHeaderConfig({ flagSize: 'large' })}
                      className="text-[#1E40AF]"
                    />
                    <div>
                      <div className="text-xs font-bold">{t('Large (38–40px)', 'ठूलो (३८–४०px)')}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t('Maximum visibility for high prominence', 'उच्च प्रमुखताका लागि अधिकतम आकार')}</div>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    currentHeaderConfig.flagSize === 'compact'
                      ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}>
                    <input
                      type="radio"
                      name="flagSize"
                      value="compact"
                      checked={currentHeaderConfig.flagSize === 'compact'}
                      onChange={() => updateHeaderConfig({ flagSize: 'compact' })}
                      className="text-[#1E40AF]"
                    />
                    <div>
                      <div className="text-xs font-bold">{t('Compact (26–28px)', 'कम्प्याक्ट (२६–२८px)')}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t('Subtle, space-saving display', 'सुरुचिपूर्ण, सानो आकार')}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Flag Right-Side Placement / Position */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('Right-Side Flag Position', 'दायाँ भागमा झण्डाको स्थान')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    (currentHeaderConfig.flagPosition || 'after_theme') === 'after_theme'
                      ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}>
                    <input
                      type="radio"
                      name="flagPosition"
                      value="after_theme"
                      checked={(currentHeaderConfig.flagPosition || 'after_theme') === 'after_theme'}
                      onChange={() => updateHeaderConfig({ flagPosition: 'after_theme' })}
                      className="text-[#1E40AF] mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        <span>{t('Outer Right Edge', 'अन्तिम दायाँ छेउमा')}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold uppercase">{t('Recommended', 'सिफारिस')}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono text-[10px]">
                        ... Search | Language | Theme Switch | 🇳🇵 Nepal Flag
                      </div>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                    currentHeaderConfig.flagPosition === 'before_theme'
                      ? 'border-[#1E40AF] bg-blue-50/60 dark:bg-blue-950/40 text-slate-900 dark:text-white shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}>
                    <input
                      type="radio"
                      name="flagPosition"
                      value="before_theme"
                      checked={currentHeaderConfig.flagPosition === 'before_theme'}
                      onChange={() => updateHeaderConfig({ flagPosition: 'before_theme' })}
                      className="text-[#1E40AF] mt-0.5"
                    />
                    <div>
                      <div className="text-xs font-bold">{t('Between Language & Theme Switch', 'भाषा र थिम स्विचको बीचमा')}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono text-[10px]">
                        ... Search | Language | 🇳🇵 Nepal Flag | Theme Switch
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Flag Mode Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t('Flag Graphic Source', 'झण्डाको स्रोत (आधिकारिक वा कस्टम)')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    (currentHeaderConfig.flagMode || 'default_nepal') === 'default_nepal'
                      ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="flagMode"
                      value="default_nepal"
                      checked={(currentHeaderConfig.flagMode || 'default_nepal') === 'default_nepal'}
                      onChange={() => updateHeaderConfig({ flagMode: 'default_nepal' })}
                      className="text-[#1E40AF]"
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center">
                        <LargeNepalFlag className="h-6 w-auto" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t('Official Nepal Flag (Vector Double-Pennant)', 'आधिकारिक नेपालको झण्डा (भेक्टर द्वित्रिकोण)')}</div>
                        <div className="text-[10px] text-slate-500">{t('Mathematically accurate double-pennant with 12-ray sun and radiant moon', 'सटिक कोण र चन्द्रादित्य प्रतीक')}</div>
                      </div>
                    </div>
                  </label>

                  <label className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    currentHeaderConfig.flagMode === 'custom'
                      ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="flagMode"
                      value="custom"
                      checked={currentHeaderConfig.flagMode === 'custom'}
                      onChange={() => updateHeaderConfig({ flagMode: 'custom' })}
                      className="text-[#1E40AF]"
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t('Custom Flag / Pennant Image', 'कस्टम झण्डा वा तस्बिर')}</div>
                        <div className="text-[10px] text-slate-500">{t('Upload or link a customized institution or ceremonial flag', 'आफ्नो अनुकूल झण्डा तस्बिर अपलोड गर्नुहोस्')}</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Custom Flag Upload / Management (if custom mode) */}
              {currentHeaderConfig.flagMode === 'custom' && (
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {currentHeaderConfig.customFlagImage && currentHeaderConfig.customFlagImage.trim() ? (
                        <div className="p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-900 shrink-0">
                          <img
                            src={currentHeaderConfig.customFlagImage}
                            alt="Custom Flag"
                            className="h-9 w-auto max-w-[52px] object-contain rounded-xs"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                          <Flag className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentHeaderConfig.customFlagImage ? t('Custom Flag Image Configured', 'कस्टम झण्डा लोड भयो') : t('Upload Custom Flag Image', 'कस्टम झण्डा फोटो अपलोड गर्नुहोस्')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {t('PNG, SVG or JPEG up to 1MB. Transparent background recommended to avoid border artifacts.', 'PNG, SVG वा JPEG (अधिकतम १MB)। पारदर्शी पृष्ठभूमि सिफारिस गरिन्छ।')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold cursor-pointer shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t('Upload Flag', 'अपलोड गर्नुहोस्')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFlagUpload}
                          className="hidden"
                        />
                      </label>
                      {currentHeaderConfig.customFlagImage && (
                        <button
                          type="button"
                          onClick={() => updateHeaderConfig({ customFlagImage: '', flagMode: 'default_nepal' })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 text-xs font-semibold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{t('Remove & Restore Nepal Flag', 'हटाउनुहोस्')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 3: LATEST NEWS SETTINGS                              */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-sky-500" />
                  <span>{t('3. Latest News Settings & Content Source', '३. ताजा समाचार तथा सूचना सेटिङ')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Control badge text, content feed mode (live pinned notices, chronological database notices, or pinned circular)', 'सूचना ब्याज पाठ र समाचारको स्रोत डेटाबेससँग सिङ्क गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showAlertTicker !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showAlertTicker !== false}
                  onChange={e => updateHeaderConfig({ showAlertTicker: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showAlertTicker !== false && (
              <div className="space-y-4">
                {/* Badge Label Customization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Ticker Badge Label (English)', 'ब्याज पाठ (अंग्रेजी)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.tickerTitleEn || ''}
                      onChange={e => updateHeaderConfig({ tickerTitleEn: e.target.value })}
                      placeholder="e.g., Latest News / Urgent Notice"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Ticker Badge Label (Nepali)', 'ब्याज पाठ (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.tickerTitleNp || ''}
                      onChange={e => updateHeaderConfig({ tickerTitleNp: e.target.value })}
                      placeholder="जस्तै: ताजा समाचार / जरुरी सूचना"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* News Source Mode Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('News Content Source Mode', 'समाचार स्रोत मोड')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Auto Pinned Notices */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      (currentHeaderConfig.tickerMode || 'auto_pinned') === 'auto_pinned'
                        ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="tickerMode"
                        value="auto_pinned"
                        checked={(currentHeaderConfig.tickerMode || 'auto_pinned') === 'auto_pinned'}
                        onChange={() => updateHeaderConfig({ tickerMode: 'auto_pinned' })}
                        className="text-[#1E40AF]"
                      />
                      <div>
                        <div className="text-xs font-bold">{t('Pinned Notices from Database (Priority)', 'पिन गरिएका सूचनाहरू (प्राथमिकता)')}</div>
                        <div className="text-[10px] text-slate-500">{t('Streams active pinned notices from the database with auto-fallback', 'पिन गरिएका मुख्य सूचनाहरू घुम्छन्')}</div>
                      </div>
                    </label>

                    {/* Latest Published Notices */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      currentHeaderConfig.tickerMode === 'latest_notices'
                        ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="tickerMode"
                        value="latest_notices"
                        checked={currentHeaderConfig.tickerMode === 'latest_notices'}
                        onChange={() => updateHeaderConfig({ tickerMode: 'latest_notices' })}
                        className="text-[#1E40AF]"
                      />
                      <div>
                        <div className="text-xs font-bold">{t('Latest Published Notices (Chronological)', 'ताजा प्रकाशित सूचनाहरू (कालक्रमानुसार)')}</div>
                        <div className="text-[10px] text-slate-500">{t('Always pulls the newest published notices automatically', 'सधैं भर्खरै प्रकाशित सूचनाहरू देखाउँछ')}</div>
                      </div>
                    </label>

                    {/* Specific Selected Notice */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      currentHeaderConfig.tickerMode === 'selected_notice'
                        ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="tickerMode"
                        value="selected_notice"
                        checked={currentHeaderConfig.tickerMode === 'selected_notice'}
                        onChange={() => updateHeaderConfig({ tickerMode: 'selected_notice' })}
                        className="text-[#1E40AF]"
                      />
                      <div>
                        <div className="text-xs font-bold">{t('Select Specific Published Notice', 'विशेष प्रकाशित सूचना छनोट गर्नुहोस्')}</div>
                        <div className="text-[10px] text-slate-500">{t('Pin a specific database notice headline to the top bar', 'डेटाबेसको कुनै निश्चित सूचना पिन गर्नुहोस्')}</div>
                      </div>
                    </label>

                    {/* Custom Copy */}
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                      currentHeaderConfig.tickerMode === 'custom'
                        ? 'border-[#1E40AF] bg-blue-50/50 dark:bg-blue-950/30 text-[#1E40AF] dark:text-blue-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="tickerMode"
                        value="custom"
                        checked={currentHeaderConfig.tickerMode === 'custom'}
                        onChange={() => updateHeaderConfig({ tickerMode: 'custom' })}
                        className="text-[#1E40AF]"
                      />
                      <div>
                        <div className="text-xs font-bold">{t('Custom Administrative Announcement', 'प्रशासकीय अनुकूल घोषणा')}</div>
                        <div className="text-[10px] text-slate-500">{t('Type manual text for urgent emergency banners', 'हातले लेखिएको अनुकूल आपतकालीन सूचना')}</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Dropdown if specific notice selected */}
                {currentHeaderConfig.tickerMode === 'selected_notice' && (
                  <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('Choose Notice to Feature in Top Bar', 'शीर्ष पट्टीमा देखाउने सूचना छनोट गर्नुहोस्')}
                    </label>
                    <select
                      value={currentHeaderConfig.selectedNoticeId || ''}
                      onChange={e => updateHeaderConfig({ selectedNoticeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">{t('-- Choose a published notice from database --', '-- डेटाबेसबाट सूचना छान्नुहोस् --')}</option>
                      {notices.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.pinned ? '★ [PINNED] ' : ''}{n.title_en} ({n.date_np || n.date_en || '2083'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-500">
                      {t('The selected notice headline will be streamed on the top bar in real time.', 'छनोट गरिएको सूचनाको शीर्षक शीर्ष पट्टीमा प्रत्यक्ष देखिनेछ।')}
                    </p>
                  </div>
                )}

                {/* Textarea if custom mode */}
                {currentHeaderConfig.tickerMode === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Announcement Copy (English)', 'सूचना पाठ (अंग्रेजी)')}
                      </label>
                      <textarea
                        rows={2}
                        value={siteForm.alertTickerEn || ''}
                        onChange={e => setSiteForm({ ...siteForm, alertTickerEn: e.target.value })}
                        placeholder="e.g., Admissions open for Class 11 Science & Management 2083"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Announcement Copy (Nepali)', 'सूचना पाठ (नेपाली)')}
                      </label>
                      <textarea
                        rows={2}
                        value={siteForm.alertTickerNp || ''}
                        onChange={e => setSiteForm({ ...siteForm, alertTickerNp: e.target.value })}
                        placeholder="जस्तै: शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका तथा नयाँ भर्ना सम्बन्धी सूचना।"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 4: ACADEMIC YEAR SETTINGS                            */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('4. Academic Year / Annual Badge Settings', '४. शैक्षिक सत्र / वार्षिक ब्याज सेटिङ')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Configure the institutional session pill (e.g. Annual | 2083) displayed in the top bar', 'शीर्ष पट्टीमा देखिने वार्षिक शैक्षिक सत्र ट्याग नियन्त्रण गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showAcademicYear !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showAcademicYear !== false}
                  onChange={e => updateHeaderConfig({ showAcademicYear: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showAcademicYear !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Label English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Label (English)', 'लेबल (अंग्रेजी)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.academicYearLabelEn || ''}
                      onChange={e => updateHeaderConfig({ academicYearLabelEn: e.target.value })}
                      placeholder="e.g., Annual / Session"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Label Nepali */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Label (Nepali)', 'लेबल (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.academicYearLabelNp || ''}
                      onChange={e => updateHeaderConfig({ academicYearLabelNp: e.target.value })}
                      placeholder="जस्तै: वार्षिक / शैक्षिक सत्र"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Academic Year Text */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Academic Year Text', 'शैक्षिक सत्र वर्ष')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.academicYearValue || ''}
                      onChange={e => updateHeaderConfig({ academicYearValue: e.target.value })}
                      placeholder="e.g., 2083 or 2083-2084"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Separator Symbol */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Separator Symbol', 'विभाजक चिन्ह')}
                    </label>
                    <select
                      value={currentHeaderConfig.academicYearSeparator || '|'}
                      onChange={e => updateHeaderConfig({ academicYearSeparator: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                    >
                      <option value="|">Vertical Bar ( | )</option>
                      <option value="•">Bullet Point ( • )</option>
                      <option value="–">En-Dash ( – )</option>
                      <option value="/">Slash ( / )</option>
                      <option value=":">Colon ( : )</option>
                    </select>
                  </div>
                </div>

                {/* Preview Badge */}
                <div className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold">{t('Top Bar Rendering Sample:', 'शीर्ष पट्टीमा देखिने रूप:')}</span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs">
                    <span className="text-slate-400 font-medium">{isNp ? (currentHeaderConfig.academicYearLabelNp || 'वार्षिक') : (currentHeaderConfig.academicYearLabelEn || 'Annual')}</span>
                    <span className="text-slate-600 font-mono text-[10px]">{currentHeaderConfig.academicYearSeparator || '|'}</span>
                    <span className="text-amber-400 font-bold font-mono tracking-wide">{currentHeaderConfig.academicYearValue || '2083'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 5: DATE & TIME SETTINGS                              */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t('5. Date & Time Display Settings (Kathmandu Timezone)', '५. मिति तथा लाइभ घडी सेटिङ (काठमाडौँ समय)')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Real-time clock computed in Asia/Kathmandu (UTC+5:45) timezone with Bikram Sambat and Nepali numerals support', 'एसिया/काठमाडौँ समय क्षेत्रमा चल्ने प्रत्यक्ष बिक्रम संवत् मिति र समय घडी')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showBsClock !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showBsClock !== false}
                  onChange={e => updateHeaderConfig({ showBsClock: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showBsClock !== false && (
              <div className="space-y-4">
                {/* Timezone Info Pill */}
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{t('Timezone Target: ', 'समय क्षेत्र: ')}</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Asia/Kathmandu (Nepal Time, UTC +05:45)</span>
                    <span className="text-slate-500 text-[11px] ml-2">{t('— Updates automatically every second', '— प्रत्येक सेकेन्डमा अपडेट हुन्छ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Show Date */}
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Show Date', 'मिति देखाउनुहोस्')}</div>
                      <div className="text-[10px] text-slate-500">{t('Display calendar date', 'पात्रो मिति देखाउने')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showDate !== false}
                      onChange={e => updateHeaderConfig({ showDate: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* Date Format (Full vs Short) */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {t('Date Length', 'मितिको लम्बाइ')}
                    </label>
                    <select
                      value={currentHeaderConfig.dateFormat || 'full'}
                      onChange={e => updateHeaderConfig({ dateFormat: e.target.value as 'full' | 'short' })}
                      className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="full">{t('Full (e.g. 2083 Bhadra 20)', 'पूर्ण (२०८३ भाद्र २०)')}</option>
                      <option value="short">{t('Short (e.g. Bhadra 20)', 'छोटो (भाद्र २०)')}</option>
                    </select>
                  </div>

                  {/* Show Weekday */}
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Show Day of Week', 'बार देखाउनुहोस्')}</div>
                      <div className="text-[10px] text-slate-500">{t('e.g. Sunday / आइतबार', 'आइतबार, सोमबार...')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showWeekday !== false}
                      onChange={e => updateHeaderConfig({ showWeekday: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* Show Bikram Sambat Date */}
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Bikram Sambat (BS)', 'बिक्रम संवत् मिति')}</div>
                      <div className="text-[10px] text-slate-500">{t('Nepali national calendar format', 'नेपाली वि.सं. क्यालेन्डर')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showNepaliDate !== false}
                      onChange={e => updateHeaderConfig({ showNepaliDate: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* Show Time */}
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Show Live Time', 'समय घडी देखाउनुहोस्')}</div>
                      <div className="text-[10px] text-slate-500">{t('Display clock digits', 'घडीको समय देखाउने')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showTime !== false}
                      onChange={e => updateHeaderConfig({ showTime: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>

                  {/* Time Format (12h vs 24h) */}
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {t('Time Format', 'समय ढाँचा')}
                    </label>
                    <select
                      value={currentHeaderConfig.timeFormat || '12h'}
                      onChange={e => updateHeaderConfig({ timeFormat: e.target.value as '12h' | '24h' })}
                      className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="12h">{t('12-Hour (with AM/PM / पूर्वाह्न)', '१२ घण्टा (पूर्वाह्न/अपराह्न)')}</option>
                      <option value="24h">{t('24-Hour (Railway 00:00 - 23:59)', '२४ घण्टा (००:०० - २३:५९)')}</option>
                    </select>
                  </div>

                  {/* Show Seconds */}
                  <label className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Show Seconds (:ss)', 'सेकेन्ड देखाउनुहोस्')}</div>
                      <div className="text-[10px] text-slate-500">{t('Include live ticking seconds', 'प्रत्येक सेकेन्डको टिक-टिक')}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showSeconds !== false}
                      onChange={e => updateHeaderConfig({ showSeconds: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 6: SEARCH SETTINGS                                   */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t('6. Search Button Settings', '६. खोजी बटन सेटिङ')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Configure the quick search trigger that opens the global institutional site search modal', 'वेबसाइट खोजी बटन र किबोर्ड सर्टकट संकेत नियन्त्रण')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showSearchButton !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showSearchButton !== false}
                  onChange={e => updateHeaderConfig({ showSearchButton: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showSearchButton !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Placeholder English */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Button Label (English)', 'बटन लेबल (अंग्रेजी)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.searchPlaceholderEn || ''}
                      onChange={e => updateHeaderConfig({ searchPlaceholderEn: e.target.value })}
                      placeholder="e.g., Search"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Placeholder Nepali */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Button Label (Nepali)', 'बटन लेबल (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.searchPlaceholderNp || ''}
                      onChange={e => updateHeaderConfig({ searchPlaceholderNp: e.target.value })}
                      placeholder="जस्तै: खोज्नुहोस्"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Show Keyboard Shortcut */}
                  <div className="flex items-end">
                    <label className="p-3 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('Show ⌘K Hint', 'किबोर्ड सर्टकट (⌘K) देखाउने')}</div>
                        <div className="text-[10px] text-slate-500">{t('Display shortcut badge', 'सर्टकट बक्स देखिने')}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={currentHeaderConfig.showSearchShortcut !== false}
                        onChange={e => updateHeaderConfig({ showSearchShortcut: e.target.checked })}
                        className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 7: LANGUAGE SWITCHER SETTINGS                        */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t('7. Language Switcher Settings', '७. भाषा स्विच (नेपाली / अंग्रेजी) सेटिङ')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Manage language switcher visibility, labels, and default portal language', 'वेबसाइटको भाषा स्विच बटन र पूर्वनिर्धारित भाषा छनोट गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showLanguageToggle !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showLanguageToggle !== false}
                  onChange={e => updateHeaderConfig({ showLanguageToggle: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showLanguageToggle !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Default Language */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Default Language for Visitors', 'आगन्तुकका लागि पूर्वनिर्धारित भाषा')}
                    </label>
                    <select
                      value={currentHeaderConfig.defaultLanguage || 'en'}
                      onChange={e => updateHeaderConfig({ defaultLanguage: e.target.value as 'en' | 'np' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="en">{t('English (Default)', 'अंग्रेजी (English)')}</option>
                      <option value="np">{t('Nepali (नेपाली)', 'नेपाली (Nepali)')}</option>
                    </select>
                  </div>

                  {/* Nepali Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Nepali Label Text', 'नेपाली लेबल पाठ')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.langLabelNp || ''}
                      onChange={e => updateHeaderConfig({ langLabelNp: e.target.value })}
                      placeholder="e.g., नेपा or नेपाली"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* English Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('English Label Text', 'अंग्रेजी लेबल पाठ')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.langLabelEn || ''}
                      onChange={e => updateHeaderConfig({ langLabelEn: e.target.value })}
                      placeholder="e.g., EN or English"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Display Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Button Format', 'बटन ढाँचा')}
                    </label>
                    <select
                      value={currentHeaderConfig.langDisplayMode || 'compact'}
                      onChange={e => updateHeaderConfig({ langDisplayMode: e.target.value as 'compact' | 'standard' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="compact">{t('Compact Pill (Flag + नेपा/EN)', 'कम्प्याक्ट पिल (झण्डा + नेपा/EN)')}</option>
                      <option value="standard">{t('Standard Text (Full Labels)', 'विस्तृत पाठ')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 8: THEME TOGGLE SETTINGS                             */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('8. Theme Toggle Settings (Light / Dark Mode)', '८. थिम स्विच सेटिङ (लाइट / डार्क मोड)')}</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {t('Control public light/dark mode switch availability and default visitor color theme', 'आगन्तुकका लागि लाइट वा डार्क मोडको उपस्थिति नियन्त्रण गर्नुहोस्')}
                </p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {currentHeaderConfig.showThemeSwitch !== false ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                </span>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showThemeSwitch !== false}
                  onChange={e => updateHeaderConfig({ showThemeSwitch: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {currentHeaderConfig.showThemeSwitch !== false && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Default Theme */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Default Theme Mode', 'पूर्वनिर्धारित थिम')}
                    </label>
                    <select
                      value={currentHeaderConfig.defaultTheme || 'light'}
                      onChange={e => updateHeaderConfig({ defaultTheme: e.target.value as 'light' | 'dark' | 'system' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="light">{t('Light Mode (Institutional White)', 'लाइट मोड (सेतो पृष्ठभूमि)')}</option>
                      <option value="dark">{t('Dark Mode (Deep Navy Slate)', 'डार्क मोड (गाढा स्लेट)')}</option>
                      <option value="system">{t('System Preference (Auto)', 'सिस्टम अनुसार (अटो)')}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* SECTION 9: INSTITUTIONAL BRAND HEADER & NAVIGATION           */}
          {/* ============================================================ */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                <span>{t('9. Main Institutional Brand Header Controls', '९. मुख्य हेडर ब्रान्डिङ तथा नियन्त्रण')}</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                {t('Control sticky header behavior, school identity badges, tagline, hotline, and admission button', 'लोगो, कोड, नारा, ठेगाना, हटलाइन तथा स्टिकी हेडर नियन्त्रण')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Sticky Header */}
              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                currentHeaderConfig.stickyHeader
                  ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
              }`}>
                <div>
                  <div className="text-xs font-bold">{t('Sticky Header', 'स्टिकी हेडर')}</div>
                  <div className="text-[10px] text-slate-500">{t('Stick on scroll', 'स्क्रोल गर्दा अडिने')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.stickyHeader}
                  onChange={e => updateHeaderConfig({ stickyHeader: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>

              {/* School Badges (Code + Estd) */}
              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                currentHeaderConfig.showSchoolBadges
                  ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
              }`}>
                <div>
                  <div className="text-xs font-bold">{t('EMIS & Estd Badges', 'EMIS कोड र स्थापना')}</div>
                  <div className="text-[10px] text-slate-500">{t('Amber & blue badges', 'शीर्ष परिचय ट्याग')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showSchoolBadges}
                  onChange={e => updateHeaderConfig({ showSchoolBadges: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>

              {/* Tagline / Motto */}
              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                currentHeaderConfig.showTagline
                  ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
              }`}>
                <div>
                  <div className="text-xs font-bold">{t('Motto / Tagline', 'आदर्श वाक्य')}</div>
                  <div className="text-[10px] text-slate-500">{t('Official school motto', 'आधिकारिक नारा')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showTagline}
                  onChange={e => updateHeaderConfig({ showTagline: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>

              {/* School Address */}
              <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                currentHeaderConfig.showAddress
                  ? 'border-[#1E40AF]/40 bg-blue-50/30 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-400'
              }`}>
                <div>
                  <div className="text-xs font-bold">{t('Location Address', 'ठेगाना विवरण')}</div>
                  <div className="text-[10px] text-slate-500">{t('Display school municipality', 'पालिका र जिल्ला')}</div>
                </div>
                <input
                  type="checkbox"
                  checked={currentHeaderConfig.showAddress}
                  onChange={e => updateHeaderConfig({ showAddress: e.target.checked })}
                  className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                />
              </label>
            </div>

            {/* Admission CTA & Hotline Row */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admission CTA Settings */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('Admission / Registration Action Button', 'नयाँ भर्ना / आवेदन बटन')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t('High-contrast emerald CTA button with pulsing signal', 'ब्यानरको प्रमुख कार्य बटन')}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currentHeaderConfig.showAdmissionCta ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                    </span>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showAdmissionCta}
                      onChange={e => updateHeaderConfig({ showAdmissionCta: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>
                </div>

                {currentHeaderConfig.showAdmissionCta && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('CTA Text (English)', 'बटन पाठ (अंग्रेजी)')}
                      </label>
                      <input
                        type="text"
                        value={currentHeaderConfig.admissionCtaTextEn || ''}
                        onChange={e => updateHeaderConfig({ admissionCtaTextEn: e.target.value })}
                        placeholder="e.g., Admission 2083"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('CTA Text (Nepali)', 'बटन पाठ (नेपाली)')}
                      </label>
                      <input
                        type="text"
                        value={currentHeaderConfig.admissionCtaTextNp || ''}
                        onChange={e => updateHeaderConfig({ admissionCtaTextNp: e.target.value })}
                        placeholder="जस्तै: नयाँ भर्ना २०८३"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Helpline Hotline Settings */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('Direct Helpline Hotline Badge', 'प्रत्यक्ष सोधपुछ हटलाइन')}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {t('Click-to-call telephone hotline displayed beside admission CTA', 'एक क्लिकमै फोन लाग्ने हटलाइन बक्स')}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {currentHeaderConfig.showHelpline ? t('Enabled', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
                    </span>
                    <input
                      type="checkbox"
                      checked={currentHeaderConfig.showHelpline}
                      onChange={e => updateHeaderConfig({ showHelpline: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded focus:ring-[#1E40AF]"
                    />
                  </label>
                </div>

                {currentHeaderConfig.showHelpline && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Hotline Phone Number', 'हटलाइन फोन नम्बर')}
                    </label>
                    <input
                      type="text"
                      value={currentHeaderConfig.helplinePhone || ''}
                      onChange={e => updateHeaderConfig({ helplinePhone: e.target.value })}
                      placeholder="+977-21-420123"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* 4. NAVIGATION SUB-TAB */}
      {activeSubTab === 'website_navigation' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MenuIcon className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Public Navigation Bar Structure', 'वेबसाइटको मुख्य मेनु (Navigation)')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Standard institutional navigation bar items visible to students and public visitors', 'सार्वजनिक पोर्टलमा देखिने मुख्य मेनु लिङ्कहरू')}
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { id: 'home', labelEn: 'Home', labelNp: 'गृहपृष्ठ', path: '/' },
              { id: 'about', labelEn: 'About Us', labelNp: 'हाम्रो बारेमा', path: '/about' },
              { id: 'notices', labelEn: 'Notices', labelNp: 'सूचनाहरू', path: '/notices' },
              { id: 'academics', labelEn: 'Academics', labelNp: 'शैक्षिक कार्यक्रम', path: '/academics' },
              { id: 'staff', labelEn: 'Faculty & Staff', labelNp: 'शिक्षक तथा कर्मचारी', path: '/staff' },
              { id: 'governance', labelEn: 'Governance (SMC)', labelNp: 'व्यवस्थापन समिति', path: '/governance' },
              { id: 'documents', labelEn: 'Downloads & Charter', labelNp: 'दस्तावेज तथा फारम', path: '/documents' },
              { id: 'gallery', labelEn: 'Gallery', labelNp: 'ग्यालरी', path: '/gallery' },
              { id: 'contact', labelEn: 'Contact', labelNp: 'सम्पर्क', path: '/contact' }
            ].map((item, idx) => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {t(item.labelEn, item.labelNp)}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      Target Anchor: {item.path}
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FOOTER SUB-TAB */}
      {activeSubTab === 'website_footer' && (
        <form onSubmit={handleSaveFooter} className="space-y-6">
          {/* Card 1: Footer Narrative & Copyright */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PanelBottom className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Footer Copy, Accreditation & Copyright', 'फुटर विवरण, सम्बन्धन र प्रतिलिपि अधिकार')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Configure institutional footer narrative, legal accreditation, and copyright lines', 'फुटरमा देखिने संस्थागत परिचय र कानुनी विवरण')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Footer & Social Links', 'फुटर र सञ्जाल सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Footer Description (English)', 'फुटर संस्थागत परिचय (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.footerDescEn || ''}
                  onChange={e => setSiteForm({ ...siteForm, footerDescEn: e.target.value })}
                  placeholder="Committed to excellence, integrity, and social responsibility in public secondary education since 2035 B.S."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Footer Description (Nepali)', 'फुटर संस्थागत परिचय (नेपाली)')}
                </label>
                <textarea
                  rows={2}
                  value={siteForm.footerDescNp || ''}
                  onChange={e => setSiteForm({ ...siteForm, footerDescNp: e.target.value })}
                  placeholder="वि.सं. २०३५ देखि गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षा प्रदान गर्दै आइरहेको अग्रणी नमुना सामुदायिक विद्यालय।"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Copyright Line (English)', 'प्रतिलिपि अधिकार (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={siteForm.copyrightTextEn || ''}
                  onChange={e => setSiteForm({ ...siteForm, copyrightTextEn: e.target.value })}
                  placeholder="© 2026 Ishwari Secondary School. All rights reserved."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Copyright Line (Nepali)', 'प्रतिलिपि अधिकार (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={siteForm.copyrightTextNp || ''}
                  onChange={e => setSiteForm({ ...siteForm, copyrightTextNp: e.target.value })}
                  placeholder="ईश्वरी माध्यमिक विद्यालय। सर्वाधिकार सुरक्षित।"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Useful Links / Important Resources Management */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Useful Links & External Resources', 'महत्त्वपूर्ण लिङ्क तथा बाह्य स्रोत व्यवस्थापन')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'Manage educational portals, ministry links, and resource websites displayed in the footer. Empty or inactive links are automatically hidden.',
                    'फुटरमा देखिने मन्त्रालय, पाठ्यक्रम तथा परीक्षा सम्बन्धी बाह्य लिङ्कहरू व्यवस्थापन गर्नुहोस्।'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetUsefulLinks}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                  title={t('Reset to standard educational portals', 'पूर्वनिर्धारित शैक्षिक लिङ्कहरूमा रिसेट गर्नुहोस्')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Reset', 'रिसेट')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddUsefulLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#1E40AF] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add Useful Link', 'नयाँ लिङ्क थप्नुहोस्')}</span>
                </button>
              </div>
            </div>

            {/* Useful Links List */}
            <div className="space-y-3">
              {(() => {
                const list = (siteForm.usefulLinks || initialUsefulLinks).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <Globe2 className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        {t('No useful links configured yet. The useful links column in the footer will remain hidden.', 'कुनै लिङ्क थपिएको छैन। फुटरमा यो स्तम्भ स्वतः लुक्नेछ।')}
                      </p>
                      <button
                        type="button"
                        onClick={handleAddUsefulLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-bold shadow-xs hover:bg-[#1D4ED8] transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('Add Useful Link', 'नयाँ लिङ्क थप्नुहोस्')}</span>
                      </button>
                    </div>
                  );
                }

                return list.map((item, idx) => {
                  const isUrlValid = Boolean(item.url && /^https?:\/\//i.test(item.url.trim()));
                  const isNotEmpty = Boolean(item.url?.trim());

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        item.enabled
                          ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-2xs'
                          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUsefulLink(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                              title={t('Move Up', 'माथि सार्नुहोस्')}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveUsefulLink(idx, 'down')}
                              disabled={idx === list.length - 1}
                              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                              title={t('Move Down', 'तल सार्नुहोस्')}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-mono text-xs text-slate-400">#{item.order}</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                            {t(item.titleEn || 'Untitled Link', item.titleNp || item.titleEn || 'शीर्षकविहीन लिङ्क')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleUsefulLink(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                              item.enabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {item.enabled ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t('Active (ON)', 'सक्रिय (ON)')}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>{t('Hidden (OFF)', 'निष्क्रिय (OFF)')}</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUsefulLink(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                            title={t('Remove Link', 'लिङ्क हटाउनुहोस्')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Title (English)', 'शीर्षक (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={item.titleEn || ''}
                            onChange={e => handleUpdateUsefulLink(item.id, { titleEn: e.target.value })}
                            placeholder="e.g. Ministry of Education"
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Title (Nepali)', 'शीर्षक (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={item.titleNp || ''}
                            onChange={e => handleUpdateUsefulLink(item.id, { titleNp: e.target.value })}
                            placeholder="उदा. शिक्षा तथा मानव स्रोत विकास केन्द्र"
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>{t('Web URL (HTTPS)', 'वेब लिङ्क (HTTPS)')}</span>
                          </label>
                          {isNotEmpty ? (
                            isUrlValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('Valid URL', 'मान्य ठेगाना')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{t('Must start with https://', 'https:// बाट सुरु हुनुपर्छ')}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">
                              {t('Empty (URL required to display)', 'खाली (देखाउन URL आवश्यक)')}
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          value={item.url || ''}
                          onChange={e => handleUpdateUsefulLink(item.id, { url: e.target.value })}
                          placeholder="https://moest.gov.np"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Brief Subtitle / Description (English)', 'छोटो विवरण (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={item.descriptionEn || ''}
                            onChange={e => handleUpdateUsefulLink(item.id, { descriptionEn: e.target.value })}
                            placeholder="Government of Nepal Federal Ministry"
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Brief Subtitle / Description (Nepali)', 'छोटो विवरण (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={item.descriptionNp || ''}
                            onChange={e => handleUpdateUsefulLink(item.id, { descriptionNp: e.target.value })}
                            placeholder="नेपाल सरकार संघीय मन्त्रालय"
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Category', 'श्रेणी')}
                          </label>
                          <select
                            value={item.category || 'government'}
                            onChange={e => handleUpdateUsefulLink(item.id, { category: e.target.value })}
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="government">{t('Government Ministry / Dept', 'सरकारी निकाय / मन्त्रालय')}</option>
                            <option value="examination">{t('Examination Board', 'परीक्षा बोर्ड')}</option>
                            <option value="curriculum">{t('Curriculum Centre', 'पाठ्यक्रम केन्द्र')}</option>
                            <option value="educational">{t('Educational Portal', 'शैक्षिक पोर्टल')}</option>
                            <option value="other">{t('Other Official Source', 'अन्य आधिकारिक स्रोत')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Publishing Status', 'प्रकाशन स्थिति')}
                          </label>
                          <select
                            value={item.status || (item.enabled ? 'published' : 'draft')}
                            onChange={e => {
                              const s = e.target.value as 'published' | 'draft';
                              handleUpdateUsefulLink(item.id, { status: s, enabled: s === 'published' });
                            }}
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="published">{t('Published (Publicly Visible)', 'प्रकाशित (सार्वजनिक)')}</option>
                            <option value="draft">{t('Draft (Hidden / Unlisted)', 'मस्यौदा (अदृश्य)')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Card 3: Campus Map & Location Configuration */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Campus Location & Google Maps Configuration', 'विद्यालय अवस्थिति र गुगल म्याप्स सेटिङ')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'Configure interactive map iframe embed and directions link. Sized proportionally so it never dominates footer content.',
                    'फुटरमा देखिने कम्प्याक्ट म्याप र दिशानिर्देश लिङ्क व्यवस्थापन गर्नुहोस्।'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSiteForm(prev => ({ ...prev, showFooterMap: !(prev.showFooterMap ?? true) }))}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
                  siteForm.showFooterMap !== false
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                {siteForm.showFooterMap !== false ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('Map Display: ON', 'नक्सा दृश्यता: सक्रिय')}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{t('Map Display: OFF (Shows Text Address)', 'नक्सा दृश्यता: निष्क्रिय (ठेगाना मात्र देखाउने)')}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Google Maps Embed iframe URL', 'गुगल म्याप्स इम्बेड URL (iframe src)')}
                </label>
                <input
                  type="url"
                  value={siteForm.footerMapEmbedUrl || ''}
                  onChange={e => setSiteForm({ ...siteForm, footerMapEmbedUrl: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('Copy the iframe "src" URL from Google Maps Share > Embed a map. If left blank, the footer safely falls back to standard text address display.', 'गुगल म्याप्सको Embed बाट src लिङ्क यहाँ राख्नुहोस्। खाली भएमा स्वतः सामान्य ठेगाना कार्ड देखिन्छ।')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Direct Directions / Google Maps URL', 'सिधा गुगल म्याप्स लिङ्क (दिशानिर्देशको लागि)')}
                </label>
                <input
                  type="url"
                  value={siteForm.footerMapUrl || ''}
                  onChange={e => setSiteForm({ ...siteForm, footerMapUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('Used when users click "Directions" or "Enlarge Map".', 'प्रयोगकर्ताले "दिशानिर्देश" वा "ठूलो नक्सा" क्लिक गर्दा यो लिङ्क खुल्छ।')}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Official Social Media Channels */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('Official Social Media Channels', 'आधिकारिक सामाजिक सञ्जाल व्यवस्थापन')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'Control official handles, ordering, and public visibility in the footer and contact sections',
                    'फुटर र सम्पर्क सेक्सनमा देखिने सामाजिक सञ्जालका लिङ्कहरू, क्रम र दृश्यता नियन्त्रण गर्नुहोस्'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSocial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                  title={t('Reset to standard school links', 'पूर्वनिर्धारितमा रिसेट गर्नुहोस्')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('Reset', 'रिसेट')}</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSocial}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-[#1E40AF] dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add Channel', 'नयाँ सञ्जाल थप्नुहोस्')}</span>
                </button>
              </div>
            </div>

            {/* Public Footer Live Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    {t('Live Public Footer Preview', 'सार्वजनिक फुटर प्रत्यक्ष पूर्वावलोकन')}
                  </span>
                </div>
                {(() => {
                  const activeCount = (siteForm.socialLinks || []).filter(
                    l => l.enabled && l.url && isValidSocialUrl(l.url)
                  ).length;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        activeCount > 0
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                      }`}
                    >
                      {activeCount > 0
                        ? t(`${activeCount} Active on Public Site`, `${activeCount} च्यानलहरू सार्वजनिक रूपमा सक्रिय`)
                        : t('Section Automatically Hidden (0 Active)', 'सार्वजनिक रूपमा लुकाइएको (० सक्रिय)')}
                    </span>
                  );
                })()}
              </div>

              <div className="py-2">
                <SocialMediaBar
                  links={siteForm.socialLinks || []}
                  lang={lang}
                  size="sm"
                  variant="footer"
                  isInteractiveInPreview
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t(
                  'Icons appear with neutral styling by default and reveal refined institutional brand colors upon hover/focus. Only active channels with valid HTTPS links are displayed publicly.',
                  'सञ्जालका आइकनहरू सामान्य अवस्थामा सौम्य देखिन्छन् र कर्सर लैजाँदा सम्बन्धित रङमा परिवर्तन हुन्छन्। केवल मान्य https:// लिङ्क भएका सक्रिय सञ्जालहरू मात्र सार्वजनिक रूपमा देखिन्छन्।'
                )}
              </p>
            </div>

            {/* Social Links Management List */}
            <div className="space-y-3">
              {(() => {
                const list = (siteForm.socialLinks || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                if (list.length === 0) {
                  return (
                    <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                      <Share2 className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500">
                        {t('No social media channels configured yet.', 'कुनै सामाजिक सञ्जाल लिङ्कहरू थपिएका छैनन्।')}
                      </p>
                      <button
                        type="button"
                        onClick={handleAddSocial}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-bold shadow-xs hover:bg-[#1D4ED8] transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('Add First Social Channel', 'पहिलो सामाजिक सञ्जाल थप्नुहोस्')}</span>
                      </button>
                    </div>
                  );
                }

                const platformsList: { id: SocialPlatform; label: string }[] = [
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'x', label: 'X (Twitter)' },
                  { id: 'linkedin', label: 'LinkedIn' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'website', label: 'Official Portal / Website' }
                ];

                return list.map((item, idx) => {
                  const isUrlValid = isValidSocialUrl(item.url);
                  const isNotEmpty = Boolean(item.url?.trim());

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        item.enabled
                          ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-2xs'
                          : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                      }`}
                    >
                      {/* Top Row: Re-ordering, Platform Selection, Status Toggle, Delete */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {/* Order Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveSocial(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                              title={t('Move Up', 'माथि सार्नुहोस्')}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveSocial(idx, 'down')}
                              disabled={idx === list.length - 1}
                              className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition"
                              title={t('Move Down', 'तल सार्नुहोस्')}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            #{idx + 1}
                          </span>

                          {/* Platform Preview Icon */}
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200">
                            <SocialPlatformIcon platform={item.platform} className="w-4 h-4" />
                          </div>

                          {/* Platform Selector */}
                          <select
                            value={item.platform}
                            onChange={(e) => {
                              const newPlat = e.target.value as SocialPlatform;
                              const platInfo = PLATFORM_INFO[newPlat] || PLATFORM_INFO.website;
                              handleUpdateSocial(item.id, {
                                platform: newPlat,
                                labelEn: item.labelEn || platInfo.nameEn,
                                labelNp: item.labelNp || platInfo.nameNp
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                          >
                            {platformsList.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Right: Visibility Switch & Delete */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleSocial(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                              item.enabled
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                            }`}
                          >
                            {item.enabled ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t('Active (ON)', 'सक्रिय (ON)')}</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>{t('Hidden (OFF)', 'निष्क्रिय (OFF)')}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSocial(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                            title={t('Remove Channel', 'च्यानल हटाउनुहोस्')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Row: Target URL Input & Validation Status */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>{t('Official Channel Web Address (URL)', 'आधिकारिक वेब ठेगाना (URL)')}</span>
                          </label>
                          {isNotEmpty ? (
                            isUrlValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{t('Valid HTTPS URL', 'मान्य HTTPS ठेगाना')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{t('Requires https:// prefix', 'https:// आवश्यक छ')}</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">
                              {t('Empty (URL required to display)', 'खाली (देखाउन URL आवश्यक)')}
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          value={item.url || ''}
                          onChange={e => handleUpdateSocial(item.id, { url: e.target.value })}
                          placeholder={`https://${item.platform === 'x' ? 'x.com' : item.platform}.com/school_username`}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-800 ${
                            isNotEmpty && !isUrlValid
                              ? 'border-amber-400 dark:border-amber-600 focus:ring-amber-400'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        />
                      </div>

                      {/* Bottom Row: Optional English & Nepali Display Labels */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Label (English)', 'लेबल (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={item.labelEn || ''}
                            onChange={e => handleUpdateSocial(item.id, { labelEn: e.target.value })}
                            placeholder={PLATFORM_INFO[item.platform]?.nameEn || 'Platform Name'}
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                            {t('Label (Nepali)', 'लेबल (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={item.labelNp || ''}
                            onChange={e => handleUpdateSocial(item.id, { labelNp: e.target.value })}
                            placeholder={PLATFORM_INFO[item.platform]?.nameNp || 'सञ्जालको नाम'}
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Bottom Save Action in Card 2 */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                {t('Changes sync directly to the database and update the public website immediately upon saving.', 'परिवर्तनहरू सिधै डेटाबेसमा सुरक्षित हुन्छन् र सार्वजनिक साइटमा तत्काल देखिन्छन्।')}
              </p>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t('Save Footer & Social Links', 'फुटर र सञ्जाल सुरक्षित गर्नुहोस्')}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
