export type Language = 'en' | 'np';
export type ThemeMode = 'light' | 'dark';

export interface SchoolData {
  name_en: string;
  name_np: string;
  tagline_en: string;
  tagline_np: string;
  affiliation_en: string;
  affiliation_np: string;
  code: string;
  estd_bs: string;
  estd_ad: string;
  phone: string;
  email: string;
  contact_phone?: string;
  contact_email?: string;
  address_en: string;
  address_np: string;
  location_en?: string;
  location_np?: string;
  map_embed_url?: string;
  map_url?: string;
  principal_name_en: string;
  principal_name_np: string;
  principal_designation_en?: string;
  principal_designation_np?: string;
  principal_message_en: string;
  principal_message_np: string;
  principal_address_en?: string;
  principal_address_np?: string;
  principal_status?: 'published' | 'draft';
  principal_image?: string;
  chairman_name_en?: string;
  chairman_name_np?: string;
  chairman_designation_en?: string;
  chairman_designation_np?: string;
  chairman_address_en?: string;
  chairman_address_np?: string;
  chairman_status?: 'published' | 'draft';
  chairman_message_en?: string;
  chairman_message_np?: string;
  chairman_image?: string;
  home_bg_image?: string;
  home_bg_enabled?: boolean;
  home_bg_position?: 'center' | 'top' | 'bottom' | 'custom';
  home_bg_custom_position?: string;
  home_bg_size?: 'cover' | 'contain';
  home_bg_overlay_enabled?: boolean;
  home_bg_overlay_opacity?: number;
  history_bg_image?: string;
  history_bg_source?: 'upload' | 'url';
  history_bg_media_type?: 'image' | 'gif';
  history_bg_enabled?: boolean;
  history_bg_position?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
  history_bg_custom_position?: string;
  history_bg_size?: 'cover' | 'contain';
  history_bg_overlay_enabled?: boolean;
  history_bg_overlay_opacity?: number;
  logo_url?: string;
  favicon_url?: string;
  show_logo?: boolean;
  show_school_identity?: boolean;
  show_emis?: boolean;
  show_estd?: boolean;
  show_tagline?: boolean;
  show_address?: boolean;
  show_nepali_name?: boolean;
  logo_size?: 'small' | 'medium' | 'large';
  school_name_size?: 'small' | 'medium' | 'large';
  nepali_name_size?: 'small' | 'medium' | 'large';
  header_identity_alignment?: 'center' | 'left';
}

export interface AcademicYearConfig {
  currentYear: string; // e.g., '2083 B.S.'
  previousYear?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

export interface Notice {
  id: number;
  title_en: string;
  title_np: string;
  date_en: string;
  date_np: string;
  category: 'academic' | 'exam' | 'scholarship' | 'admin' | 'event';
  pinned: boolean;
  published?: boolean;
  is_published?: boolean;
  status?: 'published' | 'draft';
  file_name: string;
  file_data?: string;
  file_size_kb?: number;
  description_en: string;
  description_np: string;
  qr_code_enabled?: boolean;
  show_qr?: boolean;
  reference_no?: string;
  academic_year?: string;
  updated_at?: string;
}

export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Temporary' | 'Other';
export type VacancyStatus = 'draft' | 'published' | 'closed';

export interface Vacancy {
  id: string;
  // Basic Information
  title_en: string;
  title_np?: string;
  department: string;
  employment_type: EmploymentType;
  positions_count: number;
  academic_level?: string;
  location?: string;

  // Description
  short_description_en: string;
  short_description_np?: string;
  description_en: string;
  description_np?: string;
  responsibilities?: string[];
  qualifications?: string[];
  experience?: string;
  skills?: string[];

  // Application & Apply Now control
  application_method: 'google_form' | 'email' | 'in_person';
  application_url?: string;
  apply_now_enabled?: boolean;
  application_deadline: string; // YYYY-MM-DD or ISO string
  application_instructions?: string;
  application_email?: string;

  // Attached Vacancy PDF
  pdf_url?: string;
  pdf_filename?: string;
  pdf_size_bytes?: number;

  // Publishing & Lifecycle
  status: VacancyStatus;
  is_open?: boolean;
  publish_date: string;
  display_order: number;
  featured: boolean;

  created_at: string;
  updated_at: string;
  qr_code_enabled?: boolean;
  academic_year?: string;
}

export interface StaffMember {
  id: number;
  name_en: string;
  name_np: string;
  role: 'principal' | 'teacher' | 'admin' | 'support' | 'smc_chair' | 'smc_member';
  designation_en: string;
  designation_np: string;
  experience: string;
  image?: string; // passport-size photograph (base64 or URL)
  department_en?: string;
  department_np?: string;
  qualification_en?: string;
  qualification_np?: string;
  subject_en?: string;
  subject_np?: string;
  bio_en?: string;
  bio_np?: string;
  contact_email?: string;
  contact_phone?: string;
  display_order?: number;
  isActive?: boolean;
  published?: boolean;
}

export interface Facility {
  id: number;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
  icon: string;
  detailed_desc_en?: string;
  detailed_desc_np?: string;
  image?: string;
  bg_image?: string;
  gallery?: string[];
  featured?: boolean;
  status?: 'published' | 'draft';
  display_order?: number;
}

export type EventCategory =
  | 'examination'
  | 'holiday'
  | 'admission'
  | 'academic'
  | 'meeting'
  | 'event'
  | 'sports'
  | 'program'
  | 'other';

export interface SchoolEvent {
  id: number;
  title_en: string;
  title_np: string;
  date_en: string;
  date_np: string;
  time: string;
  start_time?: string;
  end_time?: string;
  venue_en: string;
  venue_np: string;
  desc_en: string;
  desc_np: string;
  category?: EventCategory;
  academic_year?: string;
  image?: string;
  gallery?: string[];
  status?: 'published' | 'draft';
  featured?: boolean;
  display_order?: number;
  external_url?: string;
}

export type AchievementCategory =
  | 'academic'
  | 'sports'
  | 'arts'
  | 'competition'
  | 'science'
  | 'cultural'
  | 'other';

export interface Achievement {
  id: number;
  year: string;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
  student_name_en?: string;
  student_name_np?: string;
  category?: AchievementCategory;
  position_rank?: string;
  image?: string;
  featured?: boolean;
  published?: boolean;
  display_order?: number;
}

export interface HistoryItem {
  id?: string | number;
  year: string;
  title_en: string;
  title_np: string;
  desc_en: string;
  desc_np: string;
  image?: string;
  image_caption_en?: string;
  image_caption_np?: string;
  display_order?: number;
  status?: 'published' | 'unpublished';
  is_enabled?: boolean;
}

export type DocumentCategory =
  | 'notices'
  | 'forms'
  | 'curriculum'
  | 'guidelines'
  | 'routines'
  | 'publications'
  | 'academic'
  | 'reports'
  | 'magazines'
  | 'newsletters'
  | 'other';

export interface DocumentItem {
  id: number;
  title_en: string;
  title_np: string;
  description_en?: string;
  description_np?: string;
  status?: 'published' | 'draft' | 'unpublished';
  type: string;
  size: string;
  date: string;
  file_name?: string;
  file_data?: string;
  file_size_kb?: number;
  category?: DocumentCategory;
  academic_year?: string;
  cover_image?: string;
  featured?: boolean;
  display_order?: number;
}

export type PublicationType =
  | 'annual_report'
  | 'magazine'
  | 'newsletter'
  | 'prospectus'
  | 'institutional_report'
  | 'other';

export interface PublicationItem {
  id: string | number;
  title_en: string;
  title_np: string;
  publication_type: PublicationType;
  academic_year: string;
  description_en?: string;
  description_np?: string;
  cover_image?: string;
  pdf_url?: string;
  file_name?: string;
  file_size_kb?: number;
  publish_date: string;
  status: 'published' | 'draft';
  featured?: boolean;
  display_order?: number;
}

export type ResourceType =
  | 'curriculum'
  | 'syllabus'
  | 'guidelines'
  | 'notes'
  | 'question_paper'
  | 'routine'
  | 'reference'
  | 'other';

export interface CurriculumGuideline {
  id: string | number;
  title_en: string;
  title_np: string;
  subject: string;
  academic_level_id?: string;
  class_level: string; // e.g., 'Grade 10', 'Grade 9-10', 'Grade 11-12', 'Grade 6-8', 'Grade 1-5'
  description_en?: string;
  description_np?: string;
  academic_year?: string; // e.g. '2083 B.S.'
  resource_type?: ResourceType;
  pdf_path: string;
  file_url?: string;
  original_filename: string;
  file_size_bytes: number;
  file_size_formatted: string;
  mime_type: string;
  status: 'published' | 'unpublished';
  display_order: number;
  created_at: string;
  updated_at: string;
  file_data?: string;
}

export interface AboutSection {
  id: string;
  title_en: string;
  title_np: string;
  category?: 'overview' | 'mission' | 'vision' | 'values' | 'history' | 'governance' | 'custom';
  content_en: string;
  content_np: string;
  image?: string;
  image_caption_en?: string;
  image_caption_np?: string;
  image_position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  background_source?: 'upload' | 'url';
  background_media_type?: 'image' | 'gif';
  display_order: number;
  status: 'published' | 'draft';
  is_enabled: boolean;
  icon?: string;
}

export interface AcademicProgram {
  id: number;
  title_en: string;
  title_np: string;
  level: string;
  duration: string;
  intake: number;
  desc_en: string;
  desc_np: string;
  streams?: string[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface GalleryItem {
  id: number;
  title_en: string;
  title_np: string;
  category: 'science' | 'sports' | 'academics' | 'culture' | 'community';
  iconType?: 'science' | 'sports' | 'academics' | 'culture' | 'community' | 'camera';
  image?: string; // base64 or URL (< 1MB)
  url?: string;
  date?: string;
}

export type AdminRole = 'super_admin' | 'admin';

export type PermissionKey =
  // Main Menus (Parent Level)
  | 'menu.website'
  | 'menu.content'
  | 'menu.governance'
  | 'menu.media'
  | 'menu.communication'
  | 'menu.system'

  // Submenus (Child Navigation Level)
  // Website Submenus
  | 'submenu.website_identity'
  | 'submenu.website_homepage'
  | 'submenu.website_header'
  | 'submenu.website_navigation'
  | 'submenu.website_footer'
  // Content Submenus
  | 'submenu.content_about'
  | 'submenu.content_notices'
  | 'submenu.content_career'
  | 'submenu.content_documents'
  | 'submenu.content_curriculum'
  | 'submenu.content_events'
  | 'submenu.content_achievements'
  | 'submenu.content_history'
  // Governance Submenus
  | 'submenu.gov_chairman'
  | 'submenu.gov_principal'
  | 'submenu.gov_staff'
  // Media Submenus
  | 'submenu.media_gallery'
  // Communication Submenus
  | 'submenu.comm_contact'
  // System Submenus
  | 'submenu.sys_admins'
  | 'submenu.sys_roles'
  | 'submenu.sys_settings'
  | 'submenu.sys_audit'

  // Actions (Granular Operation Level)
  | 'notice.view'
  | 'notice.create'
  | 'notice.update'
  | 'notice.delete'
  | 'teacher.view'
  | 'teacher.create'
  | 'teacher.update'
  | 'teacher.delete'
  | 'staff.view'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'gallery.view'
  | 'gallery.create'
  | 'gallery.update'
  | 'gallery.delete'
  | 'program.view'
  | 'program.create'
  | 'program.update'
  | 'program.delete'
  | 'facility.view'
  | 'facility.create'
  | 'facility.update'
  | 'facility.delete'
  | 'event.view'
  | 'event.create'
  | 'event.update'
  | 'event.delete'
  | 'achievement.view'
  | 'achievement.create'
  | 'achievement.update'
  | 'achievement.delete'
  | 'document.view'
  | 'document.create'
  | 'document.update'
  | 'document.delete'
  | 'curriculum.view'
  | 'curriculum.create'
  | 'curriculum.update'
  | 'curriculum.delete'
  | 'career.view'
  | 'career.create'
  | 'career.update'
  | 'career.delete'
  | 'message.view'
  | 'message.delete'
  | 'school.view'
  | 'school.update'
  | 'about.view'
  | 'about.update'
  | 'history.view'
  | 'history.create'
  | 'history.update'
  | 'history.delete'
  | 'document.upload'
  | 'settings.view'
  | 'settings.update'
  | 'admin.view'
  | 'admin.create'
  | 'admin.update'
  | 'admin.delete'
  | 'admin.manage'
  | 'audit.view'
  | 'security.view'
  | 'security.update'
  | 'backup.create'
  | 'backup.restore';

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: AdminRole;
  passwordHash: string;
  salt: string;
  status: 'active' | 'suspended' | 'inactive';
  isActive?: boolean;
  permissions: PermissionKey[];
  lastLogin?: string;
  createdAt: string;
}

export interface HeaderConfig {
  // Top Bar Master
  showTopBar: boolean;

  // Nepal Flag
  showNationalFlag: boolean;
  flagMode?: 'default_nepal' | 'custom';
  customFlagImage?: string;
  flagSize?: 'compact' | 'normal' | 'large';
  flagPosition?: 'before_theme' | 'after_theme';
  showWavingStand?: boolean;

  // Latest News
  showAlertTicker: boolean;
  tickerMode: 'auto_pinned' | 'custom' | 'selected_notice' | 'latest_notices';
  tickerTitleEn?: string;
  tickerTitleNp?: string;
  selectedNoticeId?: number | string;

  // Academic Year / Annual
  showAcademicYear?: boolean;
  academicYearLabelEn?: string;
  academicYearLabelNp?: string;
  academicYearValue?: string;
  academicYearSeparator?: string;

  // Date & Live Time
  showBsClock: boolean;
  showDate?: boolean;
  dateFormat?: 'full' | 'short';
  showTime?: boolean;
  timeFormat?: '12h' | '24h';
  showSeconds?: boolean;
  showWeekday?: boolean;
  showNepaliDate?: boolean;
  timezone?: string;

  // Search
  showSearchButton: boolean;
  searchPlaceholderEn?: string;
  searchPlaceholderNp?: string;
  showSearchShortcut?: boolean;

  // Language Switcher
  showLanguageToggle: boolean;
  defaultLanguage?: 'en' | 'np';
  langLabelEn?: string;
  langLabelNp?: string;
  langDisplayMode?: 'compact' | 'standard';

  // Theme
  showThemeSwitch: boolean;
  defaultTheme?: 'light' | 'dark' | 'system';

  // Main Header & Branding
  showSchoolBadges: boolean;
  showTagline: boolean;
  showAddress: boolean;
  showAdmissionCta: boolean;
  admissionCtaTextEn: string;
  admissionCtaTextNp: string;
  admissionCtaRoute: string;
  showHelpline: boolean;
  helplinePhone?: string;
  stickyHeader: boolean;

  // School Header Identity & Appearance Controls (Admin Managed)
  showLogo?: boolean;
  showSchoolIdentity?: boolean;
  showEmis?: boolean;
  showEstd?: boolean;
  showNepaliName?: boolean;
  logoSize?: 'small' | 'medium' | 'large';
  schoolNameSize?: 'small' | 'medium' | 'large';
  nepaliNameSize?: 'small' | 'medium' | 'large';
  headerIdentityAlignment?: 'center' | 'left';
}

export interface SiteCustomizerConfig {
  primaryColor: string; // e.g. '#1E40AF'
  primaryColorName: string;
  header?: HeaderConfig;
  showAlertTicker: boolean;
  tickerMode?: 'auto_pinned' | 'custom';
  alertTickerEn: string;
  alertTickerNp: string;
  heroBadgeEn: string;
  heroBadgeNp: string;
  heroTitleEn: string;
  heroTitleNp: string;
  heroSubtitleEn: string;
  heroSubtitleNp: string;
  homeBgImage?: string;
  homeBgEnabled?: boolean;
  homeBgPosition?: 'center' | 'top' | 'bottom' | 'custom';
  homeBgCustomPosition?: string;
  homeBgSize?: 'cover' | 'contain';
  homeBgOverlayEnabled?: boolean;
  homeBgOverlayOpacity?: number; // 0 to 100
  historyBgImage?: string;
  historyBgSource?: 'upload' | 'url';
  historyBgMediaType?: 'image' | 'gif';
  historyBgEnabled?: boolean;
  historyBgPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'custom';
  historyBgCustomPosition?: string;
  historyBgSize?: 'cover' | 'contain';
  historyBgOverlayEnabled?: boolean;
  historyBgOverlayOpacity?: number; // 0 to 100
  stats: {
    students: string;
    studentsLabelEn: string;
    studentsLabelNp: string;
    staff: string;
    staffLabelEn: string;
    staffLabelNp: string;
    years: string;
    yearsLabelEn: string;
    yearsLabelNp: string;
    successRate: string;
    successLabelEn: string;
    successLabelNp: string;
  };
  sectionVisibility: {
    hero: boolean;
    quickAccess?: boolean;
    stats: boolean;
    notices: boolean;
    principal: boolean;
    facilities: boolean;
    academics: boolean;
    programs?: boolean;
    about?: boolean;
    leadership?: boolean;
    smc?: boolean;
    events: boolean;
    achievements: boolean;
    history: boolean;
    documents: boolean;
    gallery: boolean;
    community: boolean;
    contact: boolean;
  };
  footerDescEn?: string;
  footerDescNp?: string;
  copyrightTextEn?: string;
  copyrightTextNp?: string;
  socialLinks?: SocialMediaLink[];
  usefulLinks?: UsefulLink[];
  footerMapEmbedUrl?: string;
  footerMapUrl?: string;
  showFooterMap?: boolean;
  showPrivacyPolicy?: boolean;
  showTermsPolicy?: boolean;
  educationalBgGlobalStyle?: EducationalBgStyle;
  educationalBgGlobalInteraction?: EducationalBgInteraction;
  educationalBackgrounds?: Record<string, EducationalSectionBgConfig>;
  academicYear?: AcademicYearConfig;
  homepageSections?: HomepageSectionItem[];
  quickAccessItems?: QuickAccessItem[];
  showSchoolAtAGlance?: boolean;
  showTodayAtSchool?: boolean;
}

export interface QuickAccessItem {
  id: string;
  icon: string; // lucide icon identifier e.g. 'Bell', 'BookMarked', 'Download', 'Calendar', 'Briefcase', 'Award', 'Image', 'Users', 'PhoneCall'
  title_en: string;
  title_np: string;
  desc_en?: string;
  desc_np?: string;
  route: string; // e.g. 'notices', 'calendar', 'curriculum', 'documents', 'staff', 'facilities', 'contact'
  is_external?: boolean;
  external_url?: string;
  enabled: boolean;
  order: number;
}

export interface HomepageSectionItem {
  id: string; // 'hero' | 'notices' | 'quick_access' | 'today' | 'glance' | 'about' | 'principal' | 'stats' | 'events' | 'facilities' | 'achievements' | 'curriculum' | 'downloads' | 'gallery' | 'contact'
  nameEn: string;
  nameNp: string;
  title_en: string;
  title_np: string;
  subtitle_en?: string;
  subtitle_np?: string;
  enabled: boolean;
  order: number;
  layout?: 'default' | 'compact' | 'grid' | 'cards';
}

export type EducationalBgPreset =
  | 'open_books'
  | 'school_building'
  | 'students_studying'
  | 'graduation_cap'
  | 'globe'
  | 'mathematics'
  | 'science_lab'
  | 'microscope'
  | 'pencil'
  | 'classroom'
  | 'library_books'
  | 'academic_patterns';

export type EducationalBgStyle = 'none' | 'subtle' | 'soft' | 'medium';
export type EducationalBgInteraction = 'static' | 'gentle_motion' | 'interactive';

export interface EducationalSectionBgConfig {
  enabled: boolean;
  mode: 'preset' | 'custom_url';
  preset?: EducationalBgPreset;
  customImageUrl?: string;
  opacity: number; // 1 to 20 percent (subtle)
  placement: 'left' | 'right' | 'center' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'full';
  style?: EducationalBgStyle;
  interaction?: EducationalBgInteraction;
}

export interface UsefulLink {
  id: string;
  titleEn: string;
  titleNp?: string;
  url: string;
  descriptionEn?: string;
  descriptionNp?: string;
  category?: 'government' | 'examination' | 'curriculum' | 'educational' | 'portal' | 'other' | string;
  icon?: string;
  status?: 'published' | 'draft';
  enabled: boolean;
  order: number;
}

export type SocialPlatform =
  | 'facebook'
  | 'youtube'
  | 'instagram'
  | 'x'
  | 'linkedin'
  | 'whatsapp'
  | 'tiktok'
  | 'website';

export interface SocialMediaLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  labelEn?: string;
  labelNp?: string;
  enabled: boolean;
  order: number;
}

export interface SecurityConfig {
  adminUsername: string;
  adminPassword?: string;
  adminPasswordHash: string;
  recoveryPin: string;
  emergencyPin?: string;
  lockoutThreshold: number;
  maxLoginAttempts?: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;
  adminRouteSlug: string; // default 'admin-portal'
  hideAdminLinkInHeader: boolean;
}

export interface SecurityAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  role?: string;
  module?: string;
  result?: 'success' | 'failed' | 'denied';
  ipAddress?: string;
  status: 'success' | 'warning' | 'danger' | 'failed' | 'denied';
  severity?: 'success' | 'warning' | 'danger' | 'info';
  details: string;
}

