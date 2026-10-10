import React from 'react';
import {
  LayoutDashboard,
  Globe,
  Sliders,
  FileText,
  Bell,
  Briefcase,
  Users,
  Image as ImageIcon,
  FolderDown,
  Mail,
  Settings,
  Shield,
  KeyRound,
  ClipboardList,
  User,
  Building2,
  CalendarDays,
  Award,
  History,
  GraduationCap,
  UserCheck,
  BookOpen,
  Navigation,
  PanelBottom,
  BookMarked,
  Activity,
  ShieldCheck,
  ServerCrash,
  CloudSun,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { PermissionKey } from '../../types';

export type AdminNavTabId =
  | 'dashboard'
  | 'super_admin_control'
  // Website
  | 'website_identity'
  | 'website_homepage'
  | 'website_weather'
  | 'website_header'
  | 'website_navigation'
  | 'website_footer'
  // Content
  | 'content_health'
  | 'content_about'
  | 'content_notices'
  | 'content_career'
  | 'content_documents'
  | 'content_curriculum'
  | 'content_events'
  | 'content_achievements'
  | 'content_history'
  | 'content_faq'
  // Governance
  | 'gov_smc'
  | 'gov_chairman'
  | 'gov_principal'
  | 'gov_staff'
  | 'gov_leadership'
  // Media
  | 'media_gallery'
  // Communication
  | 'comm_contact'
  // System
  | 'sys_admins'
  | 'sys_roles'
  | 'sys_settings'
  | 'sys_audit'
  | 'sys_api_errors'
  // Account
  | 'account_profile'
  | 'account_security';

export interface NavItem {
  id: AdminNavTabId;
  labelEn: string;
  labelNp: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  id: string;
  titleEn: string;
  titleNp: string;
  icon: LucideIcon;
  defaultTab: AdminNavTabId;
  items: NavItem[];
}

/**
 * Builds the Admin Sidebar and Page Registry strictly using effective permissions.
 *
 * CRITICAL DIRECTIVE (UI ISOLATION & HIERARCHICAL ACCESS):
 * - Evaluates MAIN MENU permissions before instantiating or inspecting child submenus.
 * - If Main Menu permission is revoked or missing, the entire group is completely absent.
 * - Evaluates SUBMENU permissions for each child page.
 * - If all submenus in a Main Menu are revoked, the Main Menu is completely absent (no empty headers).
 * - Unauthorized modules and actions are never instantiated in the array (zero CSS hiding).
 */
export function buildAuthorizedNavigation(
  can: (perm: PermissionKey) => boolean,
  isSuperAdmin: boolean,
  effectiveBadges: Record<string, number | undefined> = {}
): NavGroup[] {
  const groups: NavGroup[] = [];

  // Helper permission checkers
  const checkMenu = (menuKey: PermissionKey) => {
    if (isSuperAdmin) return true;
    return can(menuKey);
  };

  const checkSubmenu = (menuKey: PermissionKey, submenuKey: PermissionKey) => {
    if (isSuperAdmin) return true;
    return can(menuKey) && can(submenuKey);
  };

  // 1. WEBSITE GROUP
  if (checkMenu('menu.website')) {
    const websiteItems: NavItem[] = [];
    if (checkSubmenu('menu.website', 'submenu.website_identity')) {
      websiteItems.push({ id: 'website_identity', labelEn: 'Site Identity & Logo', labelNp: 'पहिचान तथा लोगो', icon: Building2 });
    }
    if (checkSubmenu('menu.website', 'submenu.website_homepage')) {
      websiteItems.push({ id: 'website_homepage', labelEn: 'Homepage Builder', labelNp: 'गृहपृष्ठ बनावट (Builder)', icon: Sliders });
      websiteItems.push({ id: 'website_weather', labelEn: 'Campus Weather', labelNp: 'क्याम्पस मौसम विजेट', icon: CloudSun });
    }
    if (checkSubmenu('menu.website', 'submenu.website_header')) {
      websiteItems.push({ id: 'website_header', labelEn: 'Header & Ticker', labelNp: 'हेडर / शीर्ष पट्टी', icon: Navigation });
    }
    if (checkSubmenu('menu.website', 'submenu.website_navigation')) {
      websiteItems.push({ id: 'website_navigation', labelEn: 'Navigation Menu', labelNp: 'नेभिगेसन मेनु', icon: Globe });
    }
    if (checkSubmenu('menu.website', 'submenu.website_footer')) {
      websiteItems.push({ id: 'website_footer', labelEn: 'Footer Settings', labelNp: 'फुटर सेटिङ', icon: PanelBottom });
    }

    if (websiteItems.length > 0) {
      groups.push({
        id: 'website',
        titleEn: 'Website',
        titleNp: 'वेबसाइट',
        icon: Globe,
        defaultTab: websiteItems[0].id,
        items: websiteItems
      });
    }
  }

  // 2. CONTENT GROUP
  if (checkMenu('menu.content')) {
    const contentItems: NavItem[] = [];
    contentItems.push({
      id: 'content_health',
      labelEn: 'Content Health',
      labelNp: 'सामग्री स्वास्थ्य',
      icon: Activity
    });
    if (checkSubmenu('menu.content', 'submenu.content_about')) {
      contentItems.push({ id: 'content_about', labelEn: 'About School', labelNp: 'विद्यालय परिचय', icon: Building2 });
    }
    if (checkSubmenu('menu.content', 'submenu.content_notices')) {
      contentItems.push({
        id: 'content_notices',
        labelEn: 'Notices',
        labelNp: 'सूचनाहरू',
        icon: Bell,
        badge: effectiveBadges.notices
      });
    }
    if (checkSubmenu('menu.content', 'submenu.content_career')) {
      contentItems.push({
        id: 'content_career',
        labelEn: 'Career & Vacancies',
        labelNp: 'रोजगारी तथा विज्ञापन',
        icon: Briefcase,
        badge: effectiveBadges.vacancies
      });
    }
    if (checkSubmenu('menu.content', 'submenu.content_documents')) {
      contentItems.push({
        id: 'content_documents',
        labelEn: 'Downloads Center',
        labelNp: 'डाउनलोड केन्द्र तथा दस्तावेज',
        icon: FolderDown,
        badge: effectiveBadges.documents
      });
    }
    if (checkSubmenu('menu.content', 'submenu.content_curriculum')) {
      contentItems.push({
        id: 'content_curriculum',
        labelEn: 'Digital Resource Center',
        labelNp: 'पाठ्यक्रम तथा डिजिटल स्रोत',
        icon: BookMarked,
        badge: effectiveBadges.curriculum
      });
    }
    if (checkSubmenu('menu.content', 'submenu.content_events')) {
      contentItems.push({ id: 'content_events', labelEn: 'Academic Calendar & Events', labelNp: 'शैक्षिक क्यालेन्डर तथा कार्यक्रम', icon: CalendarDays });
    }
    if (checkSubmenu('menu.content', 'submenu.content_achievements')) {
      contentItems.push({ id: 'content_achievements', labelEn: 'Achievements & Awards', labelNp: 'उपलब्धि तथा पुरस्कार', icon: Award });
    }
    if (checkSubmenu('menu.content', 'submenu.content_history')) {
      contentItems.push({ id: 'content_history', labelEn: 'History & Timeline', labelNp: 'इतिहास तथा कोसेढुङ्गा', icon: History });
    }
    if (checkSubmenu('menu.content', 'submenu.content_about') || checkSubmenu('menu.content', 'submenu.content_notices')) {
      contentItems.push({
        id: 'content_faq',
        labelEn: 'FAQs & Q&A',
        labelNp: 'प्रायः सोधिने प्रश्नहरू (FAQ)',
        icon: HelpCircle
      });
    }

    if (contentItems.length > 0) {
      groups.push({
        id: 'content',
        titleEn: 'Content',
        titleNp: 'सामग्री',
        icon: FileText,
        defaultTab: contentItems[0].id,
        items: contentItems
      });
    }
  }

  // 3. GOVERNANCE GROUP
  if (checkMenu('menu.governance')) {
    const govItems: NavItem[] = [];
    if (checkSubmenu('menu.governance', 'submenu.gov_chairman')) {
      govItems.push({ id: 'gov_smc', labelEn: 'SMC / Chairman', labelNp: 'वि.व्य.स. / अध्यक्ष', icon: UserCheck });
    }
    if (checkSubmenu('menu.governance', 'submenu.gov_principal')) {
      govItems.push({ id: 'gov_principal', labelEn: 'Principal', labelNp: 'प्रधानाध्यापक', icon: GraduationCap });
    }
    if (checkSubmenu('menu.governance', 'submenu.gov_staff')) {
      govItems.push({ id: 'gov_staff', labelEn: 'Teachers & Staff', labelNp: 'शिक्षक तथा कर्मचारी', icon: Users, badge: effectiveBadges.staff });
    }

    if (govItems.length > 0) {
      groups.push({
        id: 'governance',
        titleEn: 'Governance',
        titleNp: 'सुशासन',
        icon: Users,
        defaultTab: govItems[0].id,
        items: govItems
      });
    }
  }

  // 4. MEDIA GROUP
  if (checkMenu('menu.media')) {
    const mediaItems: NavItem[] = [];
    if (checkSubmenu('menu.media', 'submenu.media_gallery')) {
      mediaItems.push({
        id: 'media_gallery',
        labelEn: 'Photo Gallery',
        labelNp: 'फोटो ग्यालरी',
        icon: ImageIcon,
        badge: effectiveBadges.gallery
      });
    }

    if (mediaItems.length > 0) {
      groups.push({
        id: 'media',
        titleEn: 'Media',
        titleNp: 'मिडिया',
        icon: ImageIcon,
        defaultTab: mediaItems[0].id,
        items: mediaItems
      });
    }
  }

  // 5. COMMUNICATION GROUP
  if (checkMenu('menu.communication')) {
    const commItems: NavItem[] = [];
    if (checkSubmenu('menu.communication', 'submenu.comm_contact')) {
      commItems.push({
        id: 'comm_contact',
        labelEn: 'Contact Inquiries',
        labelNp: 'सम्पर्क सोधपुछ',
        icon: Mail,
        badge: effectiveBadges.messages
      });
    }

    if (commItems.length > 0) {
      groups.push({
        id: 'communication',
        titleEn: 'Communication',
        titleNp: 'सञ्चार',
        icon: Mail,
        defaultTab: commItems[0].id,
        items: commItems
      });
    }
  }

  // 6. SYSTEM GROUP (Admin manage, audit, settings)
  if (checkMenu('menu.system')) {
    const systemItems: NavItem[] = [];
    if (checkSubmenu('menu.system', 'submenu.sys_admins')) {
      systemItems.push({ id: 'sys_admins', labelEn: 'Administrators', labelNp: 'प्रशासकहरू', icon: Shield, badge: effectiveBadges.admins });
    }
    if (checkSubmenu('menu.system', 'submenu.sys_roles')) {
      systemItems.push({ id: 'sys_roles', labelEn: 'Roles & Permissions', labelNp: 'भूमिका र अनुमति', icon: KeyRound });
    }
    if (checkSubmenu('menu.system', 'submenu.sys_settings')) {
      systemItems.push({ id: 'sys_settings', labelEn: 'Site Settings', labelNp: 'साइट सेटिङ', icon: Sliders });
    }
    if (checkSubmenu('menu.system', 'submenu.sys_audit')) {
      systemItems.push({ id: 'sys_audit', labelEn: 'Audit Logs', labelNp: 'अडिट लग', icon: ClipboardList });
    }
    systemItems.push({
      id: 'sys_api_errors',
      labelEn: 'API Error Log',
      labelNp: 'एपीआई त्रुटि लग',
      icon: ServerCrash,
      badge: effectiveBadges.apiErrors
    });

    if (systemItems.length > 0) {
      groups.push({
        id: 'system',
        titleEn: 'System',
        titleNp: 'प्रणाली',
        icon: Settings,
        defaultTab: systemItems[0].id,
        items: systemItems
      });
    }
  }

  // 7. ACCOUNT GROUP (Always available for logged in user)
  groups.push({
    id: 'account',
    titleEn: 'Account',
    titleNp: 'खाता',
    icon: User,
    defaultTab: 'account_profile',
    items: [
      { id: 'account_profile', labelEn: 'Profile', labelNp: 'प्रोफाइल', icon: User },
      { id: 'account_security', labelEn: 'Account / Security', labelNp: 'खाता सुरक्षा', icon: ShieldCheck }
    ]
  });

  return groups;
}

/**
 * Extracts a Set of all authorized Tab IDs.
 */
export function getAuthorizedTabIds(navGroups: NavGroup[]): Set<AdminNavTabId | string> {
  const set = new Set<AdminNavTabId | string>();
  set.add('dashboard'); // Dashboard is universal for authenticated admins
  for (const group of navGroups) {
    for (const item of group.items) {
      set.add(item.id);
    }
  }
  return set;
}

/**
 * Validates if a tab is authorized.
 */
export function isTabAuthorized(tabId: string, authorizedTabs: Set<AdminNavTabId | string>): boolean {
  return authorizedTabs.has(tabId as any);
}
