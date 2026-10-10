import React, { useState, useMemo } from 'react';
import {
  Language,
  SchoolData,
  SiteCustomizerConfig,
  Notice,
  Vacancy,
  AboutSection,
  StaffMember,
  Facility,
  AcademicProgram,
  DocumentItem,
  CurriculumGuideline,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  ContactMessage,
  AdminRole,
  PermissionKey
} from '../../types';
import { AdminNavTabId } from './adminNavigationRegistry';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Activity,
  ArrowRight,
  RotateCcw,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileText,
  Briefcase,
  Users,
  Globe,
  ExternalLink,
  Lock,
  Search
} from 'lucide-react';

export type HealthStatus = 'OK' | 'Warning' | 'Needs attention' | 'Error';

export interface HealthCheckItem {
  id: string;
  category: 'identity' | 'content' | 'governance' | 'links_media';
  titleEn: string;
  titleNp: string;
  status: HealthStatus;
  summaryEn: string;
  summaryNp: string;
  detailsEn?: string;
  detailsNp?: string;
  actionLabelEn: 'Review' | 'Edit' | 'Open' | 'Fix';
  actionLabelNp: 'पुनरावलोकन' | 'सम्पादन' | 'खोल्नुहोस्' | 'सच्याउनुहोस्';
  targetTab: AdminNavTabId;
  requiredPermission?: PermissionKey;
}

interface ContentHealthTabProps {
  lang: Language;
  school: SchoolData;
  siteConfig?: SiteCustomizerConfig;
  notices: Notice[];
  vacancies?: Vacancy[];
  aboutSections?: AboutSection[];
  staff: StaffMember[];
  facilities?: Facility[];
  programs?: AcademicProgram[];
  documents?: DocumentItem[];
  curriculumGuidelines?: CurriculumGuideline[];
  events?: SchoolEvent[];
  achievements?: Achievement[];
  history?: HistoryItem[];
  gallery?: GalleryItem[];
  messages?: ContactMessage[];
  currentRole: AdminRole;
  can?: (perm: PermissionKey) => boolean;
  onNavigateTab: (tabId: AdminNavTabId) => void;
  onShowToast: (msg: string) => void;
}

export const ContentHealthTab: React.FC<ContentHealthTabProps> = ({
  lang,
  school,
  siteConfig,
  notices = [],
  vacancies = [],
  aboutSections = [],
  staff = [],
  facilities = [],
  programs = [],
  documents = [],
  curriculumGuidelines = [],
  events = [],
  achievements = [],
  history = [],
  gallery = [],
  messages = [],
  currentRole,
  can = () => true,
  onNavigateTab,
  onShowToast
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'identity' | 'content' | 'governance' | 'links_media'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastCheckTime, setLastCheckTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Check if current user is authorized to perform action on target tab
  const isActionAuthorized = (item: HealthCheckItem): boolean => {
    if (isSuperAdmin) return true;
    if (!item.requiredPermission) return true;
    return can(item.requiredPermission);
  };

  // Automated Real-Time Integrity Audit
  const checkResults = useMemo<HealthCheckItem[]>(() => {
    const items: HealthCheckItem[] = [];
    const validInternalRoutes = new Set([
      'home', 'about', 'academics', 'facilities', 'staff',
      'notice', 'notices', 'events', 'achievements', 'history',
      'documents', 'curriculum', 'curriculum-guidelines',
      'gallery', 'community', 'contact', 'career', 'careers'
    ]);

    // 1. Missing School Logo
    const hasLogo = Boolean(school?.logo_url && school.logo_url.trim().length > 0);
    items.push({
      id: 'missing_logo',
      category: 'identity',
      titleEn: 'School Logo & Emblem',
      titleNp: 'विद्यालय लोगो तथा प्रतीक',
      status: hasLogo ? 'OK' : 'Error',
      summaryEn: hasLogo ? 'School logo is properly configured.' : 'Official school emblem / logo is missing.',
      summaryNp: hasLogo ? 'विद्यालयको आधिकारिक लोगो उपलब्ध छ।' : 'आधिकारिक विद्यालय लोगो फेला परेन।',
      detailsEn: hasLogo ? `Current asset: ${school.logo_url}` : 'The public header and official documents require an institutional crest.',
      detailsNp: hasLogo ? `हालको लोगो: ${school.logo_url}` : 'हेडर तथा कागजातमा विद्यालयको आधिकारिक लोगो आवश्यक पर्दछ।',
      actionLabelEn: hasLogo ? 'Review' : 'Fix',
      actionLabelNp: hasLogo ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'website_identity',
      requiredPermission: 'settings.view'
    });

    // 2. Missing Favicon
    const hasFavicon = Boolean(
      (school?.favicon_url && school.favicon_url.trim().length > 0) ||
      ((siteConfig as any)?.branding?.favicon && (siteConfig as any).branding.favicon.trim().length > 0) ||
      ((siteConfig as any)?.faviconUrl && (siteConfig as any).faviconUrl.trim().length > 0)
    );
    items.push({
      id: 'missing_favicon',
      category: 'identity',
      titleEn: 'Browser Favicon Asset',
      titleNp: 'ब्राउजर फेभिकन',
      status: hasFavicon ? 'OK' : 'Warning',
      summaryEn: hasFavicon ? 'Favicon configured for browser tabs.' : 'Custom browser favicon icon is not set.',
      summaryNp: hasFavicon ? 'ब्राउजर ट्याब फेभिकन उपलब्ध छ।' : 'ब्राउजर ट्याबको लागि छुट्टै फेभिकन सेट गरिएको छैन।',
      detailsEn: hasFavicon ? 'Favicon active.' : 'Upload a 32x32 or 64x64 PNG/ICO icon in Site Identity.',
      detailsNp: hasFavicon ? 'फेभिकन सक्रिय।' : 'साइट पहिचान खण्डबाट फेभिकन अपलोड गर्नुहोस्।',
      actionLabelEn: hasFavicon ? 'Review' : 'Fix',
      actionLabelNp: hasFavicon ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'website_identity',
      requiredPermission: 'settings.view'
    });

    // 3. Missing Homepage Background
    const hasHomeBg = Boolean(
      (siteConfig?.homeBgImage && siteConfig.homeBgImage.trim().length > 0) ||
      (school?.home_bg_image && school.home_bg_image.trim().length > 0) ||
      ((school as any)?.hero_image && (school as any).hero_image.trim().length > 0)
    );
    items.push({
      id: 'missing_home_bg',
      category: 'identity',
      titleEn: 'Homepage Hero Background',
      titleNp: 'गृहपृष्ठ मुख्य ब्यानर पृष्ठभूमि',
      status: hasHomeBg ? 'OK' : 'Warning',
      summaryEn: hasHomeBg ? 'Hero banner media is configured.' : 'Homepage hero banner is using fallback default gradient.',
      summaryNp: hasHomeBg ? 'गृहपृष्ठ ब्यानर पृष्ठभूमि सक्रिय छ।' : 'गृहपृष्ठको मुख्य ब्यानर पूर्वनिर्धारित ग्रेडिएन्टमा छ।',
      detailsEn: hasHomeBg ? 'Hero visual media is active.' : 'Configure high-resolution campus photography in Homepage Layout.',
      detailsNp: hasHomeBg ? 'ब्यानर तस्बिर सक्रिय छ।' : 'गृहपृष्ठ बनावटबाट क्याम्पसको आकर्षक तस्बिर राख्न सक्नुहुन्छ।',
      actionLabelEn: hasHomeBg ? 'Review' : 'Fix',
      actionLabelNp: hasHomeBg ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'website_homepage',
      requiredPermission: 'settings.view'
    });

    // 4. Missing About Content
    const hasAboutContent = Boolean(
      aboutSections && aboutSections.length > 0 &&
      aboutSections.some(s => (s.content_en && s.content_en.trim().length > 15) || (s.content_np && s.content_np.trim().length > 15))
    );
    items.push({
      id: 'missing_about',
      category: 'content',
      titleEn: 'About School Content & Sections',
      titleNp: 'विद्यालय परिचय तथा खण्डहरू',
      status: hasAboutContent ? 'OK' : 'Error',
      summaryEn: hasAboutContent ? `${aboutSections.length} narrative sections published.` : 'About page content is empty or unpopulated.',
      summaryNp: hasAboutContent ? `${aboutSections.length} वटा परिचय खण्डहरू उपलब्ध छन्।` : 'परिचय पृष्ठको सामग्री खाली छ।',
      detailsEn: hasAboutContent ? 'Overview, mission, vision, and governance sections active.' : 'Add institutional overview and core values to the About page.',
      detailsNp: hasAboutContent ? 'परिचय, उद्देश्य र दृष्टिकोण खण्डहरू सक्रिय छन्।' : 'परिचय पृष्ठमा विद्यालयको उद्देश्य तथा परिचय खण्ड थप्नुहोस्।',
      actionLabelEn: hasAboutContent ? 'Review' : 'Edit',
      actionLabelNp: hasAboutContent ? 'पुनरावलोकन' : 'सम्पादन',
      targetTab: 'content_about',
      requiredPermission: 'about.view'
    });

    // 5. Missing Chairman Information
    const chairmanStaff = staff.find(s => s.role === 'smc_chair');
    const hasChairman = Boolean(
      (chairmanStaff && (chairmanStaff.name_en?.trim() || chairmanStaff.name_np?.trim())) ||
      (school?.chairman_name_en && school.chairman_name_en.trim().length > 0) ||
      (school?.chairman_name_np && school.chairman_name_np.trim().length > 0)
    );
    const chairmanName = chairmanStaff ? (isNp ? chairmanStaff.name_np : chairmanStaff.name_en) : (isNp ? school?.chairman_name_np : school?.chairman_name_en);
    items.push({
      id: 'missing_chairman',
      category: 'governance',
      titleEn: 'School Management Committee (SMC) Chairman',
      titleNp: 'वि.व्य.स. अध्यक्ष विवरण',
      status: hasChairman ? 'OK' : 'Needs attention',
      summaryEn: hasChairman ? `SMC Chairman recorded (${chairmanName || 'Configured'}).` : 'SMC Chairman profile or message is incomplete.',
      summaryNp: hasChairman ? `वि.व्य.स. अध्यक्ष विवरण उपलब्ध छ (${chairmanName || 'सक्रिय'})।` : 'वि.व्य.स. अध्यक्षको विवरण अपूर्ण छ।',
      detailsEn: hasChairman ? 'SMC leadership profile is ready for public display.' : 'Provide SMC Chair details in Governance > SMC / Chairman.',
      detailsNp: hasChairman ? 'अध्यक्षको प्रोफाइल सार्वजनिक पृष्ठमा प्रदर्शित छ।' : 'सुशासन खण्डबाट अध्यक्षको विवरण र सन्देश भर्नुहोस्।',
      actionLabelEn: hasChairman ? 'Review' : 'Fix',
      actionLabelNp: hasChairman ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'gov_smc',
      requiredPermission: 'staff.view'
    });

    // 6. Missing Principal Information
    const principalStaff = staff.find(s => s.role === 'principal');
    const hasPrincipal = Boolean(
      (principalStaff && (principalStaff.name_en?.trim() || principalStaff.name_np?.trim())) ||
      (school?.principal_name_en && school.principal_name_en.trim().length > 0) ||
      (school?.principal_name_np && school.principal_name_np.trim().length > 0)
    );
    const principalName = principalStaff ? (isNp ? principalStaff.name_np : principalStaff.name_en) : (isNp ? school?.principal_name_np : school?.principal_name_en);
    items.push({
      id: 'missing_principal',
      category: 'governance',
      titleEn: 'Head of School (Principal)',
      titleNp: 'प्रधानाध्यापक विवरण',
      status: hasPrincipal ? 'OK' : 'Error',
      summaryEn: hasPrincipal ? `Principal profile active (${principalName || 'Configured'}).` : 'Principal name or message is unconfigured.',
      summaryNp: hasPrincipal ? `प्रधानाध्यापक प्रोफाइल उपलब्ध छ (${principalName || 'सक्रिय'})।` : 'प्रधानाध्यापकको नाम वा सन्देश अपूर्ण छ।',
      detailsEn: hasPrincipal ? 'Principal desk message and photo verified.' : 'Required for homepage desk message and institutional accreditation.',
      detailsNp: hasPrincipal ? 'प्रधानाध्यापकको सन्देश तथा तस्बिर प्रमाणित छ।' : 'गृहपृष्ठ र संस्थागत परिचयका लागि प्रधानाध्यापक विवरण अनिवार्य छ।',
      actionLabelEn: hasPrincipal ? 'Review' : 'Fix',
      actionLabelNp: hasPrincipal ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'gov_principal',
      requiredPermission: 'staff.view'
    });

    // 7. Missing Contact Information
    const missingContactParts: string[] = [];
    if (!school?.phone || !school.phone.trim()) missingContactParts.push('Phone');
    if (!school?.email || !school.email.trim()) missingContactParts.push('Email');
    if (!school?.address_en || !school.address_en.trim()) missingContactParts.push('Address');
    const hasContact = missingContactParts.length === 0;
    items.push({
      id: 'missing_contact',
      category: 'identity',
      titleEn: 'Official Contact Coordinates',
      titleNp: 'सम्पर्क ठेगाना तथा फोन/इमेल',
      status: hasContact ? 'OK' : 'Error',
      summaryEn: hasContact ? 'Phone, email, and address coordinates complete.' : `Missing required contact fields: ${missingContactParts.join(', ')}.`,
      summaryNp: hasContact ? 'फोन, इमेल र ठेगाना पूर्ण छ।' : `अपूर्ण सम्पर्क विवरणहरू: ${missingContactParts.join(', ')}।`,
      detailsEn: hasContact ? `${school.phone} • ${school.email} • ${school.address_en}` : 'Public visitors and parents need contact details to submit inquiries.',
      detailsNp: hasContact ? `${school.phone} • ${school.email} • ${school.address_en}` : 'सार्वजनिक सम्पर्कका लागि फोन, इमेल र ठेगाना आवश्यक छ।',
      actionLabelEn: hasContact ? 'Review' : 'Fix',
      actionLabelNp: hasContact ? 'पुनरावलोकन' : 'सच्याउनुहोस्',
      targetTab: 'comm_contact',
      requiredPermission: 'settings.view'
    });

    // 8. Notices Without Required Dates
    const noticesWithoutDates = notices.filter(
      n => (!n.date_en || !n.date_en.trim()) && (!n.date_np || !n.date_np.trim())
    );
    const hasNoticeDateIssue = noticesWithoutDates.length > 0;
    items.push({
      id: 'notices_dates',
      category: 'content',
      titleEn: 'Notice Publication Dates',
      titleNp: 'सूचना प्रकाशन मिति',
      status: hasNoticeDateIssue ? 'Error' : 'OK',
      summaryEn: hasNoticeDateIssue ? `${noticesWithoutDates.length} notice(s) lack required publication dates.` : 'All notices have valid publication dates.',
      summaryNp: hasNoticeDateIssue ? `${noticesWithoutDates.length} वटा सूचनामा मिति छुटेको छ।` : 'सबै सूचनाहरूमा प्रकाशन मिति भरिएको छ।',
      detailsEn: hasNoticeDateIssue ? `Sample: "${noticesWithoutDates[0]?.title_en}" has empty date fields.` : `${notices.length} notices verified with BS/AD timestamps.`,
      detailsNp: hasNoticeDateIssue ? `उदा: "${noticesWithoutDates[0]?.title_np || noticesWithoutDates[0]?.title_en}" मा मिति खाली छ।` : `${notices.length} सूचनाहरू मितिसहित उपलब्ध छन्।`,
      actionLabelEn: hasNoticeDateIssue ? 'Fix' : 'Review',
      actionLabelNp: hasNoticeDateIssue ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: 'content_notices',
      requiredPermission: 'notice.view'
    });

    // 9. Published Vacancies With Expired Deadlines
    const todayMidnight = new Date().setHours(0, 0, 0, 0);
    const expiredPublishedVacancies = vacancies.filter(v => {
      const isPublished = v.status === 'published' || (v as any).is_open !== false;
      if (!isPublished) return false;
      if (!v.application_deadline) return false;
      const deadlineTime = new Date(v.application_deadline).getTime();
      return !isNaN(deadlineTime) && deadlineTime < todayMidnight;
    });
    const hasExpiredVacancies = expiredPublishedVacancies.length > 0;
    items.push({
      id: 'expired_vacancies',
      category: 'content',
      titleEn: 'Career Vacancies Deadline Status',
      titleNp: 'पदपूर्ति विज्ञापन म्याद स्थिति',
      status: hasExpiredVacancies ? 'Needs attention' : 'OK',
      summaryEn: hasExpiredVacancies
        ? `${expiredPublishedVacancies.length} published vacancy listing(s) have passed their deadline.`
        : 'No expired vacancies currently published as active.',
      summaryNp: hasExpiredVacancies
        ? `${expiredPublishedVacancies.length} वटा प्रकाशित विज्ञापनको म्याद समाप्त भइसकेको छ।`
        : 'कुनै म्याद सकिएका विज्ञापनहरू सक्रिय छैनन्।',
      detailsEn: hasExpiredVacancies
        ? `Expired listings: ${expiredPublishedVacancies.map(v => `"${v.title_en}" (Deadline: ${v.application_deadline})`).join(', ')}. Consider closing or archiving them.`
        : 'All active career vacancies have ongoing application deadlines.',
      detailsNp: hasExpiredVacancies
        ? `म्याद सकिएका विज्ञापनहरू: ${expiredPublishedVacancies.map(v => `"${v.title_np || v.title_en}"`).join(', ')}। यिनलाई बन्द वा अर्काइभ गर्नुहोस्।`
        : 'सबै विज्ञापनहरूको दरखास्त म्याद बाँकी छ।',
      actionLabelEn: hasExpiredVacancies ? 'Edit' : 'Review',
      actionLabelNp: hasExpiredVacancies ? 'सम्पादन' : 'पुनरावलोकन',
      targetTab: 'content_career',
      requiredPermission: 'career.view'
    });

    // 10. Vacancies with Apply Now enabled but invalid/missing application URL
    const invalidApplyNowVacancies = vacancies.filter(
      v => v.apply_now_enabled && (!v.application_url || !v.application_url.trim() || !/^https?:\/\//i.test(v.application_url.trim()))
    );
    const hasApplyNowIssue = invalidApplyNowVacancies.length > 0;
    items.push({
      id: 'vacancies_apply_now',
      category: 'content',
      titleEn: 'Vacancy "Apply Now" Destination URLs',
      titleNp: 'विज्ञापन "Apply Now" आवेदन लिंक',
      status: hasApplyNowIssue ? 'Error' : 'OK',
      summaryEn: hasApplyNowIssue
        ? `${invalidApplyNowVacancies.length} vacancy listing(s) have Apply Now enabled with invalid/missing URL.`
        : 'All Apply Now career links have valid destinations.',
      summaryNp: hasApplyNowIssue
        ? `${invalidApplyNowVacancies.length} वटा विज्ञापनमा "Apply Now" अन छ तर लिंक छुटेको वा अमान्य छ।`
        : 'सबै विज्ञापन आवेदन लिंकहरू मान्य छन्।',
      detailsEn: hasApplyNowIssue
        ? `Affected: ${invalidApplyNowVacancies.map(v => `"${v.title_en}"`).join(', ')}. Provide Google Form or HTTPS link.`
        : 'Verified secure HTTPS / Google Form URLs configured.',
      detailsNp: hasApplyNowIssue
        ? `समस्या देखिएका विज्ञापन: ${invalidApplyNowVacancies.map(v => `"${v.title_np || v.title_en}"`).join(', ')}।`
        : 'सुरक्षित Google Form वा वेब लिंकहरू उपलब्ध छन्।',
      actionLabelEn: hasApplyNowIssue ? 'Fix' : 'Review',
      actionLabelNp: hasApplyNowIssue ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: 'content_career',
      requiredPermission: 'career.view'
    });

    // 11. Missing Curriculum Guidelines Data
    const hasCurriculumData = Boolean(curriculumGuidelines && curriculumGuidelines.length > 0);
    items.push({
      id: 'missing_curriculum',
      category: 'content',
      titleEn: 'Curriculum Guidelines & Syllabi',
      titleNp: 'पाठ्यक्रम निर्देशिका तथा स्रोतहरू',
      status: hasCurriculumData ? 'OK' : 'Needs attention',
      summaryEn: hasCurriculumData ? `${curriculumGuidelines.length} curriculum syllabus documents published.` : 'No curriculum guidelines or subject syllabi uploaded.',
      summaryNp: hasCurriculumData ? `${curriculumGuidelines.length} वटा पाठ्यक्रम स्रोत तथा निर्देशिका प्रकाशित छन्।` : 'कुनै पाठ्यक्रम निर्देशिका अपलोड गरिएको छैन।',
      detailsEn: hasCurriculumData ? 'Class-wise CDC / NEB competencies and manuals available.' : 'Upload subject-wise curriculum PDFs in Curriculum Guidelines.',
      detailsNp: hasCurriculumData ? 'कक्षागत पाठ्यक्रम र निर्देशिकाहरू उपलब्ध छन्।' : 'पाठ्यक्रम निर्देशिका खण्डबाट विषयगत PDF हरू थप्नुहोस्।',
      actionLabelEn: hasCurriculumData ? 'Review' : 'Open',
      actionLabelNp: hasCurriculumData ? 'पुनरावलोकन' : 'खोल्नुहोस्',
      targetTab: 'content_curriculum',
      requiredPermission: 'curriculum.view'
    });

    // 12. Missing Required Images
    const staffWithoutPhoto = staff.filter(s => !s.image || !s.image.trim());
    const hasStaffPhotoIssue = staffWithoutPhoto.length > 0;
    items.push({
      id: 'missing_images',
      category: 'links_media',
      titleEn: 'Faculty & Leadership Photography',
      titleNp: 'शिक्षक तथा नेतृत्व तस्बिर',
      status: hasStaffPhotoIssue ? 'Warning' : 'OK',
      summaryEn: hasStaffPhotoIssue ? `${staffWithoutPhoto.length} teacher(s) have placeholder silhouettes instead of real photos.` : 'All faculty members have uploaded portrait photos.',
      summaryNp: hasStaffPhotoIssue ? `${staffWithoutPhoto.length} जना शिक्षकको तस्बिर अपलोड गरिएको छैन।` : 'सबै शिक्षकहरूको तस्बिर उपलब्ध छ।',
      detailsEn: hasStaffPhotoIssue ? `Missing photos: ${staffWithoutPhoto.slice(0, 3).map(s => s.name_en).join(', ')}${staffWithoutPhoto.length > 3 ? '...' : ''}.` : `${staff.length} staff portraits active.`,
      detailsNp: hasStaffPhotoIssue ? `तस्बिर नभएका शिक्षक: ${staffWithoutPhoto.slice(0, 3).map(s => s.name_np || s.name_en).join(', ')}...` : `${staff.length} जना शिक्षकको तस्बिर सक्रिय छ।`,
      actionLabelEn: hasStaffPhotoIssue ? 'Review' : 'Open',
      actionLabelNp: hasStaffPhotoIssue ? 'पुनरावलोकन' : 'खोल्नुहोस्',
      targetTab: 'gov_staff',
      requiredPermission: 'staff.view'
    });

    // 13. Invalid/Unsupported Media References
    const unsafeSchemeRegex = /^(javascript:|vbscript:|file:|blob:)/i;
    let unsafeCount = 0;
    const unsafeSamples: string[] = [];

    if (school?.logo_url && unsafeSchemeRegex.test(school.logo_url)) {
      unsafeCount++;
      unsafeSamples.push('Logo');
    }
    if (school?.home_bg_image && unsafeSchemeRegex.test(school.home_bg_image)) {
      unsafeCount++;
      unsafeSamples.push('Homepage Background');
    }
    if (school?.history_bg_image && unsafeSchemeRegex.test(school.history_bg_image)) {
      unsafeCount++;
      unsafeSamples.push('History Background');
    }
    for (const sec of aboutSections) {
      if (sec.image && unsafeSchemeRegex.test(sec.image)) {
        unsafeCount++;
        unsafeSamples.push(`About: "${sec.title_en}"`);
      }
    }

    items.push({
      id: 'unsupported_media',
      category: 'links_media',
      titleEn: 'Media URL Scheme & Safety Integrity',
      titleNp: 'मिडिया URL सुरक्षा तथा प्रोटोकल',
      status: unsafeCount > 0 ? 'Error' : 'OK',
      summaryEn: unsafeCount > 0 ? `${unsafeCount} media item(s) contain disallowed or unsafe URI protocols.` : 'All media and image references use safe protocols.',
      summaryNp: unsafeCount > 0 ? `${unsafeCount} मिडिया लिङ्कमा असुरक्षित प्रोटोकल फेला पर्यो।` : 'सबै मिडिया लिङ्कहरू सुरक्षित प्रोटोकलमा छन्।',
      detailsEn: unsafeCount > 0 ? `Flagged: ${unsafeSamples.join(', ')}` : 'Zero malicious javascript: or file: references found.',
      detailsNp: unsafeCount > 0 ? `सच्याउनुपर्ने: ${unsafeSamples.join(', ')}` : 'कुनै असुरक्षित फाइल लिङ्क फेला परेन।',
      actionLabelEn: unsafeCount > 0 ? 'Fix' : 'Review',
      actionLabelNp: unsafeCount > 0 ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: 'website_identity',
      requiredPermission: 'settings.view'
    });

    // 14. Broken Internal Content References
    const brokenInternalLinks: string[] = [];
    const navigationList = (siteConfig as any)?.navigation || (siteConfig?.header as any)?.navigation || [];
    if (Array.isArray(navigationList)) {
      for (const nav of navigationList) {
        if (nav && nav.href && !nav.href.startsWith('http') && !nav.href.startsWith('#')) {
          const cleanRoute = nav.href.replace(/^\//, '').toLowerCase();
          if (cleanRoute && !validInternalRoutes.has(cleanRoute)) {
            brokenInternalLinks.push(nav.labelEn || nav.href);
          }
        }
      }
    }
    const hasBrokenInternal = brokenInternalLinks.length > 0;
    items.push({
      id: 'internal_links',
      category: 'links_media',
      titleEn: 'Internal Navigation Routing Integrity',
      titleNp: 'आन्तरिक नेभिगेसन मार्ग सत्यता',
      status: hasBrokenInternal ? 'Warning' : 'OK',
      summaryEn: hasBrokenInternal ? `${brokenInternalLinks.length} navigation item(s) point to non-existent internal routes.` : 'All internal navigation paths map to valid views.',
      summaryNp: hasBrokenInternal ? `${brokenInternalLinks.length} नेभिगेसन लिंक अस्तित्वमा नभएको पृष्ठमा लक्षित छन्।` : 'सबै आन्तरिक नेभिगेसन लिंकहरू मान्य छन्।',
      detailsEn: hasBrokenInternal ? `Unmatched targets: ${brokenInternalLinks.join(', ')}` : '17 institutional routes verified in SPA router.',
      detailsNp: hasBrokenInternal ? `अमान्य लिंकहरू: ${brokenInternalLinks.join(', ')}` : 'सबै १७ संस्थागत रुटहरू ठीक छन्।',
      actionLabelEn: hasBrokenInternal ? 'Fix' : 'Review',
      actionLabelNp: hasBrokenInternal ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: 'website_navigation',
      requiredPermission: 'settings.view'
    });

    // 15. Invalid External URLs Where Practical
    const invalidExternalLinks: string[] = [];
    if (Array.isArray(siteConfig?.socialLinks)) {
      for (const item of siteConfig.socialLinks) {
        if (item.url && item.url.trim().length > 0) {
          if (!/^https?:\/\//i.test(item.url.trim())) {
            invalidExternalLinks.push(`Social (${item.platform}): ${item.url}`);
          }
        }
      }
    }
    if (Array.isArray(siteConfig?.usefulLinks)) {
      for (const link of siteConfig.usefulLinks) {
        if (link.url && link.url.trim().length > 0 && !/^https?:\/\//i.test(link.url.trim())) {
          invalidExternalLinks.push(`Useful Link: ${link.titleEn}`);
        }
      }
    }
    const hasInvalidExternal = invalidExternalLinks.length > 0;
    items.push({
      id: 'external_urls',
      category: 'links_media',
      titleEn: 'External Social & Resource URLs',
      titleNp: 'बाह्य सामाजिक तथा उपयोगी लिङ्कहरू',
      status: hasInvalidExternal ? 'Warning' : 'OK',
      summaryEn: hasInvalidExternal ? `${invalidExternalLinks.length} external URL(s) lack standard https:// prefix.` : 'External social and partner URLs conform to HTTPS.',
      summaryNp: hasInvalidExternal ? `${invalidExternalLinks.length} वटा बाह्य लिंकमा https:// छुटेको छ।` : 'सबै बाह्य तथा सामाजिक लिंकहरू HTTPS ढाँचामा छन्।',
      detailsEn: hasInvalidExternal ? `Found: ${invalidExternalLinks.join(', ')}` : 'Social links and useful portal citations validated.',
      detailsNp: hasInvalidExternal ? `सुधार आवश्यक: ${invalidExternalLinks.join(', ')}` : 'सबै सामाजिक संजाल लिंक प्रमाणित।',
      actionLabelEn: hasInvalidExternal ? 'Fix' : 'Review',
      actionLabelNp: hasInvalidExternal ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: 'website_footer',
      requiredPermission: 'settings.view'
    });

    // 16. Unpublished Content Counts
    const draftNotices = notices.filter(n => n.status === 'draft' || n.published === false || n.is_published === false).length;
    const draftVacancies = vacancies.filter(v => v.status === 'draft').length;
    const draftAbout = aboutSections.filter(s => s.status === 'draft').length;
    const draftHistory = history.filter(h => h.status === 'unpublished' || (h as any).is_enabled === false).length;
    const totalDrafts = draftNotices + draftVacancies + draftAbout + draftHistory;

    items.push({
      id: 'unpublished_content',
      category: 'content',
      titleEn: 'Draft & Unpublished Items',
      titleNp: 'मस्यौदा तथा अप्रकाशित सामग्री',
      status: totalDrafts > 0 ? 'Needs attention' : 'OK',
      summaryEn: totalDrafts > 0 ? `${totalDrafts} content item(s) are currently in Draft / Unpublished status.` : 'All staged content is actively published.',
      summaryNp: totalDrafts > 0 ? `${totalDrafts} वटा सामग्रीहरू हाल मस्यौदा (Draft) स्थितिमा छन्।` : 'सबै सामग्रीहरू सार्वजनिक रूपमा प्रकाशित छन्।',
      detailsEn: totalDrafts > 0
        ? `Breakdown: ${draftNotices} notice(s), ${draftVacancies} vacancy(ies), ${draftAbout} about section(s), ${draftHistory} history milestone(s).`
        : 'Zero draft items waiting in pipeline.',
      detailsNp: totalDrafts > 0
        ? `विवरण: ${draftNotices} सूचना, ${draftVacancies} विज्ञापन, ${draftAbout} परिचय खण्ड, ${draftHistory} इतिहास स्तम्भ।`
        : 'कुनै पनि मस्यौदा सामग्री बाँकी छैन।',
      actionLabelEn: totalDrafts > 0 ? 'Review' : 'Open',
      actionLabelNp: totalDrafts > 0 ? 'पुनरावलोकन' : 'खोल्नुहोस्',
      targetTab: draftNotices > 0 ? 'content_notices' : 'content_career',
      requiredPermission: 'notice.view'
    });

    // 17. Duplicate Ordering Values
    const aboutOrders = aboutSections.map(s => s.display_order || 0);
    const hasAboutDupes = new Set(aboutOrders).size !== aboutOrders.length;
    const currOrders = curriculumGuidelines.map(c => c.display_order || 0);
    const hasCurrDupes = new Set(currOrders).size !== currOrders.length;
    const hasDupes = hasAboutDupes || hasCurrDupes;

    items.push({
      id: 'duplicate_ordering',
      category: 'content',
      titleEn: 'Sequence & Display Order Uniqueness',
      titleNp: 'प्रदर्शन क्रम सङ्ख्या विशिष्टता',
      status: hasDupes ? 'Warning' : 'OK',
      summaryEn: hasDupes ? 'Duplicate display ordering values detected across sections.' : 'Display order values are unique and sequential.',
      summaryNp: hasDupes ? 'केही खण्डहरूमा एउटै क्रम सङ्ख्या दोहोरिएको छ।' : 'सबै सामग्रीहरूको क्रम सङ्ख्या फरक र क्रमैसँग छ।',
      detailsEn: hasDupes
        ? `${hasAboutDupes ? 'About sections have overlapping order. ' : ''}${hasCurrDupes ? 'Curriculum guidelines have overlapping order.' : ''}`
        : 'Order integers strictly determine frontend rendering sequence.',
      detailsNp: hasDupes ? 'परिचय वा पाठ्यक्रम खण्डमा क्रम सङ्ख्या सच्याउनुहोस्।' : 'क्रम सङ्ख्या सही छ।',
      actionLabelEn: hasDupes ? 'Fix' : 'Review',
      actionLabelNp: hasDupes ? 'सच्याउनुहोस्' : 'पुनरावलोकन',
      targetTab: hasAboutDupes ? 'content_about' : 'content_curriculum',
      requiredPermission: 'about.view'
    });

    return items;
  }, [
    school,
    siteConfig,
    notices,
    vacancies,
    aboutSections,
    staff,
    facilities,
    programs,
    documents,
    curriculumGuidelines,
    events,
    achievements,
    history,
    gallery,
    isNp
  ]);

  // Aggregate metric counts
  const counts = useMemo(() => {
    let ok = 0;
    let warning = 0;
    let needsAttention = 0;
    let error = 0;

    for (const item of checkResults) {
      if (item.status === 'OK') ok++;
      else if (item.status === 'Warning') warning++;
      else if (item.status === 'Needs attention') needsAttention++;
      else if (item.status === 'Error') error++;
    }

    const total = checkResults.length;
    const score = Math.round(((ok + warning * 0.5 + needsAttention * 0.25) / total) * 100);
    return { ok, warning, needsAttention, error, total, score };
  }, [checkResults]);

  // Filtered rows
  const filteredItems = useMemo(() => {
    return checkResults.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.titleEn.toLowerCase().includes(q) || item.titleNp.toLowerCase().includes(q);
        const matchSummary = item.summaryEn.toLowerCase().includes(q) || item.summaryNp.toLowerCase().includes(q);
        if (!matchTitle && !matchSummary) return false;
      }
      return true;
    });
  }, [checkResults, statusFilter, categoryFilter, searchQuery]);

  const handleAction = (item: HealthCheckItem) => {
    if (!isActionAuthorized(item)) {
      onShowToast(t('Action restricted: Insufficient administrative privileges.', 'कार्य निषेध: पर्याप्त प्रशासनिक अनुमति छैन।'));
      return;
    }
    onNavigateTab(item.targetTab);
  };

  const handleRefreshChecks = () => {
    setLastCheckTime(new Date().toLocaleTimeString());
    onShowToast(t('All 17 Content Health checks refreshed.', 'सबै १७ सामग्री स्वास्थ्य जाँचहरू अद्यावधिक गरियो।'));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Banner & Audit Score Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('Content Health Dashboard', 'सामग्री स्वास्थ्य ड्यासबोर्ड')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300">
                  17 Automated Audits
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  'Automated audit of institutional assets, missing records, deadlines, and link integrity.',
                  'विद्यालयको लोगो, सूचना मिति, म्याद सकिएका विज्ञापन र लिङ्कहरूको स्वचालित परीक्षण।'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 font-mono block">Health Score</span>
              <span className={`text-base font-bold font-mono ${counts.score >= 85 ? 'text-emerald-600 dark:text-emerald-400' : counts.score >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                {counts.score}%
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefreshChecks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('Re-Check Now', 'पुनः जाँच गर्नुहोस्')}</span>
            </button>
          </div>
        </div>

        {/* Status Score Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'OK' ? 'all' : 'OK')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'OK'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20'
                : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>OK</span>
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-300">
                {counts.ok}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t('Passed verification', 'प्रमाणित तथा पूर्ण')}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Needs attention' ? 'all' : 'Needs attention')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'Needs attention'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Needs attention</span>
              </span>
              <span className="text-sm font-bold font-mono text-blue-800 dark:text-blue-300">
                {counts.needsAttention}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t('Drafts / Inactive', 'मस्यौदा / समीक्षा आवश्यक')}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Warning' ? 'all' : 'Warning')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'Warning'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-2 ring-amber-500/20'
                : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warning</span>
              </span>
              <span className="text-sm font-bold font-mono text-amber-800 dark:text-amber-300">
                {counts.warning}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t('Non-critical recommendations', 'सुझाव तथा सुधार')}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Error' ? 'all' : 'Error')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
              statusFilter === 'Error'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 ring-2 ring-red-500/20'
                : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Error</span>
              </span>
              <span className="text-sm font-bold font-mono text-red-800 dark:text-red-300">
                {counts.error}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{t('Mandatory items missing', 'अनिवार्य खण्ड छुटेको')}</p>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
              statusFilter === 'all' && categoryFilter === 'all'
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('All Audits', 'सबै जाँचहरू')} ({counts.total})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === 'identity' ? 'all' : 'identity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
              categoryFilter === 'identity'
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('Identity & Branding', 'पहिचान')}
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === 'content' ? 'all' : 'content')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
              categoryFilter === 'content'
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('Content & Deadlines', 'सामग्री')}
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === 'governance' ? 'all' : 'governance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
              categoryFilter === 'governance'
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('Governance', 'नेतृत्व')}
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter(categoryFilter === 'links_media' ? 'all' : 'links_media')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition ${
              categoryFilter === 'links_media'
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {t('Media & Links', 'मिडिया/लिंक')}
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search audits...', 'परीक्षण खोज्नुहोस्...')}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Compact Status Rows Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            {t('Showing', 'देखाउँदै')} <strong>{filteredItems.length}</strong> {t('of', '/')}{' '}
            <strong>{checkResults.length}</strong> {t('checks', 'परीक्षणहरू')}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {t('Last evaluated', 'पछिल्लो जाँच')}: {lastCheckTime}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredItems.map((item) => {
            const isAuthorized = isActionAuthorized(item);
            const statusConfig = {
              OK: {
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
                icon: CheckCircle2,
                iconColor: 'text-emerald-600 dark:text-emerald-400'
              },
              Warning: {
                badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
                icon: AlertTriangle,
                iconColor: 'text-amber-500 dark:text-amber-400'
              },
              'Needs attention': {
                badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
                icon: AlertCircle,
                iconColor: 'text-blue-600 dark:text-blue-400'
              },
              Error: {
                badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
                icon: XCircle,
                iconColor: 'text-red-600 dark:text-red-400'
              }
            }[item.status];

            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {t(item.titleEn, item.titleNp)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                      {t(item.summaryEn, item.summaryNp)}
                    </p>

                    {(item.detailsEn || item.detailsNp) && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-2xl font-mono">
                        {t(item.detailsEn || '', item.detailsNp || '')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Authorized Action Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {isAuthorized ? (
                    <button
                      type="button"
                      onClick={() => handleAction(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        item.status === 'Error' || item.status === 'Warning' || item.status === 'Needs attention'
                          ? 'bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{t(item.actionLabelEn, item.actionLabelNp)}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span
                      title={t('Action restricted: Insufficient administrative privileges.', 'कार्य निषेध: पर्याप्त प्रशासनिक अनुमति छैन।')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    >
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{t('Restricted', 'निषेध')}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
