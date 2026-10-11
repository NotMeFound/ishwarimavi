import bcrypt from 'bcryptjs';
import { AdminAccount, PermissionKey } from '../types';
import { safeStorage, safeSessionStorage } from './storage';

// Modern bcrypt password hashing using 10 rounds
export function hashPasswordBcrypt(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPasswordBcrypt(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    try {
      return bcrypt.compareSync(password, hash);
    } catch {
      return false;
    }
  }
  return password === hash;
}

// SHA-256 password hashing with salt using standard Web Crypto API (legacy helper)
export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback simple hash for non-crypto environments
    let hash = 0;
    const str = password + ':' + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(64, '0');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${salt}`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate random salt
export function generateSalt(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export interface ActionDef {
  key: PermissionKey;
  labelEn: string;
  labelNp: string;
  descEn: string;
}

export interface SubmenuHierarchyDef {
  key: PermissionKey;
  tabId: string;
  labelEn: string;
  labelNp: string;
  descEn: string;
  actions: ActionDef[];
}

export interface MainMenuHierarchyDef {
  key: PermissionKey;
  id: string;
  labelEn: string;
  labelNp: string;
  descEn: string;
  submenus: SubmenuHierarchyDef[];
}

export const MAIN_MENU_HIERARCHY: MainMenuHierarchyDef[] = [
  {
    key: 'menu.website',
    id: 'website',
    labelEn: 'Website',
    labelNp: 'वेबसाइट',
    descEn: 'Public portal layout, branding, headers, navigation, and footers',
    submenus: [
      {
        key: 'submenu.website_identity',
        tabId: 'website_identity',
        labelEn: 'Site Identity & Logo',
        labelNp: 'पहिचान तथा लोगो',
        descEn: 'School branding, crest logo, EMIS code, and motto',
        actions: [
          { key: 'settings.view', labelEn: 'View Identity', labelNp: 'पहिचान हेर्नुहोस्', descEn: 'Can view identity settings' },
          { key: 'settings.update', labelEn: 'Edit Identity', labelNp: 'पहिचान सम्पादन', descEn: 'Can update logo, EMIS code, and motto' },
        ]
      },
      {
        key: 'submenu.website_homepage',
        tabId: 'website_homepage',
        labelEn: 'Homepage Layout',
        labelNp: 'गृहपृष्ठ बनावट',
        descEn: 'Hero slider, welcome banner, and homepage section order',
        actions: [
          { key: 'settings.view', labelEn: 'View Homepage Layout', labelNp: 'गृहपृष्ठ बनावट हेर्नुहोस्', descEn: 'Can view homepage layout' },
          { key: 'settings.update', labelEn: 'Edit Homepage Layout', labelNp: 'गृहपृष्ठ बनावट सम्पादन', descEn: 'Can customize hero and sections' },
        ]
      },
      {
        key: 'submenu.website_header',
        tabId: 'website_header',
        labelEn: 'Header & Ticker',
        labelNp: 'हेडर तथा सूचना पट्टी',
        descEn: 'Top bar notification ticker, hotline number, and header options',
        actions: [
          { key: 'settings.view', labelEn: 'View Header Settings', labelNp: 'हेडर सेटिङ हेर्नुहोस्', descEn: 'Can view header configuration' },
          { key: 'settings.update', labelEn: 'Edit Header Settings', labelNp: 'हेडर सेटिङ सम्पादन', descEn: 'Can customize announcement ticker and phone' },
        ]
      },
      {
        key: 'submenu.website_navigation',
        tabId: 'website_navigation',
        labelEn: 'Navigation Menu',
        labelNp: 'नेभिगेसन मेनु',
        descEn: 'Header menu links, order, and portal routing',
        actions: [
          { key: 'settings.view', labelEn: 'View Navigation', labelNp: 'नेभिगेसन हेर्नुहोस्', descEn: 'Can view navigation structure' },
          { key: 'settings.update', labelEn: 'Edit Navigation', labelNp: 'नेभिगेसन सम्पादन', descEn: 'Can customize public portal navigation' },
        ]
      },
      {
        key: 'submenu.website_footer',
        tabId: 'website_footer',
        labelEn: 'Footer Settings',
        labelNp: 'फुटर सेटिङ',
        descEn: 'Footer columns, copyright, and emergency contact coordinates',
        actions: [
          { key: 'settings.view', labelEn: 'View Footer Settings', labelNp: 'फुटर सेटिङ हेर्नुहोस्', descEn: 'Can view footer configuration' },
          { key: 'settings.update', labelEn: 'Edit Footer Settings', labelNp: 'फुटर सेटिङ सम्पादन', descEn: 'Can update footer text and social links' },
        ]
      },
    ]
  },
  {
    key: 'menu.content',
    id: 'content',
    labelEn: 'Content',
    labelNp: 'सामग्री',
    descEn: 'Notices, downloads, curriculum, events, achievements, and vacancies',
    submenus: [
      {
        key: 'submenu.content_about',
        tabId: 'content_about',
        labelEn: 'About School',
        labelNp: 'विद्यालय परिचय',
        descEn: 'Mission, vision, history summary, programs, and facilities',
        actions: [
          { key: 'about.view', labelEn: 'View About Info', labelNp: 'परिचय हेर्नुहोस्', descEn: 'Can view about information' },
          { key: 'about.update', labelEn: 'Edit About Info', labelNp: 'परिचय सम्पादन', descEn: 'Can update school overview and programs' },
        ]
      },
      {
        key: 'submenu.content_notices',
        tabId: 'content_notices',
        labelEn: 'Notices',
        labelNp: 'सूचनाहरू',
        descEn: 'Official notices, exam schedules, and PDF circulars',
        actions: [
          { key: 'notice.view', labelEn: 'View Notices', labelNp: 'सूचना हेर्नुहोस्', descEn: 'Can browse administrative notices' },
          { key: 'notice.create', labelEn: 'Create Notice', labelNp: 'सूचना सिर्जना', descEn: 'Can publish new official notices and PDF circulars' },
          { key: 'notice.update', labelEn: 'Edit Notice', labelNp: 'सूचना सम्पादन', descEn: 'Can modify notice title, dates, attachments, and pinned status' },
          { key: 'notice.delete', labelEn: 'Delete Notice', labelNp: 'सूचना मेटाउनुहोस्', descEn: 'Can remove notices from portal' },
        ]
      },
      {
        key: 'submenu.content_career',
        tabId: 'content_career',
        labelEn: 'Career & Vacancies',
        labelNp: 'रोजगारी तथा विज्ञापन',
        descEn: 'Job recruitment, staff vacancies, and online application links',
        actions: [
          { key: 'career.view', labelEn: 'View Vacancies', labelNp: 'विज्ञापन हेर्नुहोस्', descEn: 'Can view recruitment listings' },
          { key: 'career.create', labelEn: 'Create Vacancy', labelNp: 'विज्ञापन सिर्जना', descEn: 'Can post new job and teacher vacancies' },
          { key: 'career.update', labelEn: 'Edit Vacancy', labelNp: 'विज्ञापन सम्पादन', descEn: 'Can modify vacancy details and set active/closed status' },
          { key: 'career.delete', labelEn: 'Delete Vacancy', labelNp: 'विज्ञापन मेटाउनुहोस्', descEn: 'Can delete vacancy records' },
        ]
      },
      {
        key: 'submenu.content_documents',
        tabId: 'content_documents',
        labelEn: 'Documents & Downloads',
        labelNp: 'दस्तावेज तथा डाउनलोड',
        descEn: 'Downloadable forms, curriculum guides, and school policies',
        actions: [
          { key: 'document.view', labelEn: 'View Documents', labelNp: 'दस्तावेज हेर्नुहोस्', descEn: 'Can browse public documents' },
          { key: 'document.upload', labelEn: 'Upload Document', labelNp: 'दस्तावेज अपलोड', descEn: 'Can upload and publish new PDF documents' },
          { key: 'document.delete', labelEn: 'Delete Document', labelNp: 'दस्तावेज मेटाउनुहोस्', descEn: 'Can remove published documents' },
        ]
      },
      {
        key: 'submenu.content_curriculum',
        tabId: 'content_curriculum',
        labelEn: 'Curriculum Guidelines',
        labelNp: 'पाठ्यक्रम निर्देशिका',
        descEn: 'Official syllabus, grade-wise guidelines, and evaluation grids',
        actions: [
          { key: 'curriculum.view', labelEn: 'View Guidelines', labelNp: 'निर्देशिका हेर्नुहोस्', descEn: 'Can browse curriculum guidelines' },
          { key: 'curriculum.create', labelEn: 'Add Guideline', labelNp: 'निर्देशिका थप्नुहोस्', descEn: 'Can upload subject curriculum guides (PDF up to 10MB)' },
          { key: 'curriculum.update', labelEn: 'Edit Guideline', labelNp: 'निर्देशिका सम्पादन', descEn: 'Can update curriculum metadata and attachments' },
          { key: 'curriculum.delete', labelEn: 'Delete Guideline', labelNp: 'निर्देशिका मेटाउनुहोस्', descEn: 'Can remove curriculum guidelines' },
        ]
      },
      {
        key: 'submenu.content_events',
        tabId: 'content_events',
        labelEn: 'Events & Routines',
        labelNp: 'कार्यक्रम तथा तालिका',
        descEn: 'Academic calendar, routine schedules, and school celebrations',
        actions: [
          { key: 'event.view', labelEn: 'View Events', labelNp: 'कार्यक्रम हेर्नुहोस्', descEn: 'Can view calendar events' },
          { key: 'event.create', labelEn: 'Create Event', labelNp: 'कार्यक्रम थप्नुहोस्', descEn: 'Can schedule new academic events' },
          { key: 'event.update', labelEn: 'Edit Event', labelNp: 'कार्यक्रम सम्पादन', descEn: 'Can modify event dates and venues' },
          { key: 'event.delete', labelEn: 'Delete Event', labelNp: 'कार्यक्रम मेटाउनुहोस्', descEn: 'Can delete scheduled events' },
        ]
      },
      {
        key: 'submenu.content_achievements',
        tabId: 'content_achievements',
        labelEn: 'Achievements & Awards',
        labelNp: 'उपलब्धि तथा पुरस्कार',
        descEn: 'Academic honors, sports medals, and institutional achievements',
        actions: [
          { key: 'achievement.view', labelEn: 'View Achievements', labelNp: 'उपलब्धि हेर्नुहोस्', descEn: 'Can browse student honors' },
          { key: 'achievement.create', labelEn: 'Add Achievement', labelNp: 'उपलब्धि थप्नुहोस्', descEn: 'Can record new awards and medals' },
          { key: 'achievement.update', labelEn: 'Edit Achievement', labelNp: 'उपलब्धि सम्पादन', descEn: 'Can update achievement details' },
          { key: 'achievement.delete', labelEn: 'Delete Achievement', labelNp: 'उपलब्धि मेटाउनुहोस्', descEn: 'Can remove achievement records' },
        ]
      },
      {
        key: 'submenu.content_history',
        tabId: 'content_history',
        labelEn: 'History & Milestones',
        labelNp: 'इतिहास तथा कोसेढुङ्गा',
        descEn: 'Institutional establishment, milestones, and historical archive',
        actions: [
          { key: 'history.view', labelEn: 'View History', labelNp: 'इतिहास हेर्नुहोस्', descEn: 'Can view timeline records' },
          { key: 'history.create', labelEn: 'Add Milestone', labelNp: 'कोसेढुङ्गा थप्नुहोस्', descEn: 'Can add milestone dates and narratives' },
          { key: 'history.update', labelEn: 'Edit Milestone', labelNp: 'कोसेढुङ्गा सम्पादन', descEn: 'Can update historical milestone details' },
          { key: 'history.delete', labelEn: 'Delete Milestone', labelNp: 'कोसेढुङ्गा मेटाउनुहोस्', descEn: 'Can delete history records' },
        ]
      },
      {
        key: 'submenu.content_faq',
        tabId: 'content_faq',
        labelEn: 'FAQs & Q&A',
        labelNp: 'प्रायः सोधिने प्रश्नहरू (FAQ)',
        descEn: 'Public Q&A, admissions guidance, and common school information',
        actions: [
          { key: 'about.view', labelEn: 'View FAQs', labelNp: 'FAQ हेर्नुहोस्', descEn: 'Can view published FAQs' },
          { key: 'about.update', labelEn: 'Manage FAQs', labelNp: 'FAQ व्यवस्थापन', descEn: 'Can add, edit, and publish FAQs' },
        ]
      },
    ]
  },
  {
    key: 'menu.governance',
    id: 'governance',
    labelEn: 'Governance',
    labelNp: 'सुशासन',
    descEn: 'Leadership, SMC members, and teaching faculty directory',
    submenus: [
      {
        key: 'submenu.gov_chairman',
        tabId: 'gov_smc',
        labelEn: 'Chairman / SMC',
        labelNp: 'वि.व्य.स. तथा अध्यक्ष',
        descEn: 'School Management Committee leadership and chairman desk',
        actions: [
          { key: 'teacher.view', labelEn: 'View SMC', labelNp: 'वि.व्य.स. हेर्नुहोस्', descEn: 'Can view committee members' },
          { key: 'teacher.update', labelEn: 'Edit SMC', labelNp: 'वि.व्य.स. सम्पादन', descEn: 'Can update chairman profile and message' },
        ]
      },
      {
        key: 'submenu.gov_principal',
        tabId: 'gov_principal',
        labelEn: 'Principal',
        labelNp: 'प्रधानाध्यापक',
        descEn: 'Principal desk message, profile, and administrative leadership',
        actions: [
          { key: 'teacher.view', labelEn: 'View Principal', labelNp: 'प्र.अ. हेर्नुहोस्', descEn: 'Can view principal message' },
          { key: 'teacher.update', labelEn: 'Edit Principal', labelNp: 'प्र.अ. सम्पादन', descEn: 'Can update principal profile and message' },
        ]
      },
      {
        key: 'submenu.gov_staff',
        tabId: 'gov_staff',
        labelEn: 'Teachers & Staff',
        labelNp: 'शिक्षक तथा कर्मचारी',
        descEn: 'Teaching faculty, department heads, and administrative personnel',
        actions: [
          { key: 'teacher.view', labelEn: 'View Faculty', labelNp: 'शिक्षक हेर्नुहोस्', descEn: 'Can view faculty directory' },
          { key: 'teacher.create', labelEn: 'Add Faculty', labelNp: 'नयाँ शिक्षक थप्नुहोस्', descEn: 'Can add teachers with passport photos' },
          { key: 'teacher.update', labelEn: 'Edit Faculty', labelNp: 'शिक्षक सम्पादन', descEn: 'Can update teacher profiles and photos' },
          { key: 'teacher.delete', labelEn: 'Delete Faculty', labelNp: 'शिक्षक मेटाउनुहोस्', descEn: 'Can remove teacher records' },
          { key: 'staff.view', labelEn: 'View Admin Staff', labelNp: 'कर्मचारी हेर्नुहोस्', descEn: 'Can view administrative staff' },
          { key: 'staff.create', labelEn: 'Add Admin Staff', labelNp: 'कर्मचारी थप्नुहोस्', descEn: 'Can add administrative staff' },
          { key: 'staff.update', labelEn: 'Edit Admin Staff', labelNp: 'कर्मचारी सम्पादन', descEn: 'Can update staff profiles' },
          { key: 'staff.delete', labelEn: 'Delete Admin Staff', labelNp: 'कर्मचारी मेटाउनुहोस्', descEn: 'Can remove staff profiles' },
        ]
      },
    ]
  },
  {
    key: 'menu.media',
    id: 'media',
    labelEn: 'Media',
    labelNp: 'मिडिया',
    descEn: 'Photo galleries, ceremonies, campus visual archive',
    submenus: [
      {
        key: 'submenu.media_gallery',
        tabId: 'media_gallery',
        labelEn: 'Gallery',
        labelNp: 'फोटो ग्यालरी',
        descEn: 'Visual galleries, photo albums, and ceremonies',
        actions: [
          { key: 'gallery.view', labelEn: 'View Gallery', labelNp: 'ग्यालरी हेर्नुहोस्', descEn: 'Can browse gallery archive' },
          { key: 'gallery.create', labelEn: 'Upload Photos', labelNp: 'तस्बिर अपलोड', descEn: 'Can upload JPG/PNG photos' },
          { key: 'gallery.update', labelEn: 'Edit Photo Records', labelNp: 'तस्बिर सम्पादन', descEn: 'Can edit photo captions and categories' },
          { key: 'gallery.delete', labelEn: 'Delete Photos', labelNp: 'तस्बिर मेटाउनुहोस्', descEn: 'Can delete photos' },
        ]
      },
    ]
  },
  {
    key: 'menu.communication',
    id: 'communication',
    labelEn: 'Communication',
    labelNp: 'सञ्चार',
    descEn: 'Parent and citizen inquiries, public contact inbox',
    submenus: [
      {
        key: 'submenu.comm_contact',
        tabId: 'comm_contact',
        labelEn: 'Contact',
        labelNp: 'सम्पर्क सोधपुछ',
        descEn: 'Public contact submissions, parental queries, and portal messages',
        actions: [
          { key: 'message.view', labelEn: 'View Inquiries', labelNp: 'सन्देश हेर्नुहोस्', descEn: 'Can view incoming portal messages' },
          { key: 'message.delete', labelEn: 'Delete Inquiries', labelNp: 'सन्देश मेटाउनुहोस्', descEn: 'Can delete or archive messages' },
        ]
      },
    ]
  },
  {
    key: 'menu.system',
    id: 'system',
    labelEn: 'System',
    labelNp: 'प्रणाली',
    descEn: 'Administrators management, role permissions, audit trails, and site recovery',
    submenus: [
      {
        key: 'submenu.sys_admins',
        tabId: 'sys_admins',
        labelEn: 'Administrators',
        labelNp: 'प्रशासकहरू',
        descEn: 'Admin user provisioning, credential changes, and account statuses',
        actions: [
          { key: 'admin.view', labelEn: 'View Admin Accounts', labelNp: 'प्रशासक हेर्नुहोस्', descEn: 'Can view administrator accounts' },
          { key: 'admin.create', labelEn: 'Create Admin Account', labelNp: 'नयाँ प्रशासक बनाउनुहोस्', descEn: 'Can create administrator accounts' },
          { key: 'admin.update', labelEn: 'Edit Admin Account', labelNp: 'प्रशासक सम्पादन', descEn: 'Can modify permissions and statuses' },
          { key: 'admin.delete', labelEn: 'Delete Admin Account', labelNp: 'प्रशासक मेटाउनुहोस्', descEn: 'Can delete subordinate accounts' },
        ]
      },
      {
        key: 'submenu.sys_roles',
        tabId: 'sys_roles',
        labelEn: 'Roles & Permissions',
        labelNp: 'भूमिका र अनुमति',
        descEn: 'Granular access control matrix and permission assignments',
        actions: [
          { key: 'admin.manage', labelEn: 'Manage Roles & Matrix', labelNp: 'अनुमति म्याट्रिक्स व्यवस्थापन', descEn: 'Can manage RBAC matrix' },
        ]
      },
      {
        key: 'submenu.sys_audit',
        tabId: 'sys_audit',
        labelEn: 'Audit Logs',
        labelNp: 'अडिट लग',
        descEn: 'Security activity trail, login logs, and administrative event auditing',
        actions: [
          { key: 'audit.view', labelEn: 'View Audit Logs', labelNp: 'अडिट लग हेर्नुहोस्', descEn: 'Can review immutable security audit trail' },
        ]
      },
      {
        key: 'submenu.sys_settings',
        tabId: 'sys_settings',
        labelEn: 'System Settings',
        labelNp: 'प्रणाली सेटिङ',
        descEn: 'Global school settings, session security, and disaster recovery',
        actions: [
          { key: 'settings.view', labelEn: 'View System Settings', labelNp: 'सेटिङ हेर्नुहोस्', descEn: 'Can view system parameters' },
          { key: 'settings.update', labelEn: 'Modify System Settings', labelNp: 'सेटिङ सम्पादन', descEn: 'Can update system settings' },
          { key: 'security.view', labelEn: 'View Security Settings', labelNp: 'सुरक्षा हेर्नुहोस्', descEn: 'Can inspect security configurations' },
          { key: 'security.update', labelEn: 'Modify Security Settings', labelNp: 'सुरक्षा सम्पादन', descEn: 'Can update lockout and recovery settings' },
        ]
      },
    ]
  },
];

// Mapping lookup tables for fast O(1) hierarchical resolution
export const SUBMENU_TO_MENU_MAP: Record<string, PermissionKey> = {};
export const ACTION_TO_SUBMENU_MAP: Record<string, PermissionKey> = {};

for (const menu of MAIN_MENU_HIERARCHY) {
  for (const sub of menu.submenus) {
    SUBMENU_TO_MENU_MAP[sub.key] = menu.key;
    for (const act of sub.actions) {
      ACTION_TO_SUBMENU_MAP[act.key] = sub.key;
    }
  }
}

// Flat catalog of all permissions for display and matrix purposes
export const ALL_PERMISSIONS: { key: PermissionKey; group: string; labelEn: string; labelNp: string; descEn: string; level: 'menu' | 'submenu' | 'action' }[] = [];

for (const menu of MAIN_MENU_HIERARCHY) {
  ALL_PERMISSIONS.push({
    key: menu.key,
    group: menu.labelEn,
    labelEn: `[Main Menu] ${menu.labelEn}`,
    labelNp: `[मुख्य मेनु] ${menu.labelNp}`,
    descEn: menu.descEn,
    level: 'menu'
  });

  for (const sub of menu.submenus) {
    ALL_PERMISSIONS.push({
      key: sub.key,
      group: menu.labelEn,
      labelEn: `[Submenu] ${sub.labelEn}`,
      labelNp: `[उप-मेनु] ${sub.labelNp}`,
      descEn: sub.descEn,
      level: 'submenu'
    });

    for (const act of sub.actions) {
      if (!ALL_PERMISSIONS.some(p => p.key === act.key)) {
        ALL_PERMISSIONS.push({
          key: act.key,
          group: menu.labelEn,
          labelEn: act.labelEn,
          labelNp: act.labelNp,
          descEn: act.descEn,
          level: 'action'
        });
      }
    }
  }
}

// Upgrade legacy flat action permissions to full 3-tier hierarchy (used for backward compatibility with old storage)
export function upgradeLegacyPermissions(perms: PermissionKey[]): PermissionKey[] {
  const result = new Set<PermissionKey>(perms);
  for (const perm of perms) {
    const subKey = ACTION_TO_SUBMENU_MAP[perm];
    if (subKey) {
      result.add(subKey);
      const menuKey = SUBMENU_TO_MENU_MAP[subKey];
      if (menuKey) {
        result.add(menuKey);
      }
    }
  }
  return Array.from(result);
}

// Initial seeded accounts with modern bcrypt password hashes and explicit hierarchical permissions
export const initialAdminAccounts: AdminAccount[] = [
  {
    id: 'usr_superadmin',
    username: 'ishwari-superadmin',
    fullName: 'Master System Administrator (विद्यालय प्रमुख / प्रणाली प्रशासक)',
    email: 'superadmin@ishwari.edu.np',
    role: 'super_admin',
    // bcrypt hash for Ishwari12@
    passwordHash: '$2b$10$US8/qhy4fZH.GJu5US/g9eEhvTVvB6eQNlnbyK/9t8Ue8jyiZoJ56',
    salt: 'salt_ishwari_super',
    status: 'active',
    permissions: ALL_PERMISSIONS.map(p => p.key),
    createdAt: '2083-01-01',
    lastLogin: '2083-05-15 09:30 AM',
  },
  {
    id: 'usr_admin',
    username: 'ishwari',
    fullName: 'School Operations Officer (प्रशासन अधिकृत)',
    email: 'admin@ishwari.edu.np',
    role: 'admin',
    // bcrypt hash for Ishwari12@
    passwordHash: '$2b$10$US8/qhy4fZH.GJu5US/g9eEhvTVvB6eQNlnbyK/9t8Ue8jyiZoJ56',
    salt: 'salt_ishwari_admin',
    status: 'active',
    permissions: [
      // 1. Website (Identity only)
      'menu.website',
      'submenu.website_identity',
      'settings.view',

      // 2. Content (Notices & Curriculum Guidelines)
      'menu.content',
      'submenu.content_notices',
      'notice.view', 'notice.create', 'notice.update', 'notice.delete',
      'submenu.content_curriculum',
      'curriculum.view', 'curriculum.create', 'curriculum.update', 'curriculum.delete',

      // 3. Governance (Teachers & Staff)
      'menu.governance',
      'submenu.gov_staff',
      'teacher.view', 'teacher.create', 'teacher.update',
      'staff.view', 'staff.create', 'staff.update',

      // 4. Media (Photo Gallery)
      'menu.media',
      'submenu.media_gallery',
      'gallery.view', 'gallery.create', 'gallery.update', 'gallery.delete'
    ],
    createdAt: '2083-02-10',
    lastLogin: '2083-05-14 04:15 PM',
  },
];

/**
 * Strict Hierarchical Permission Verification
 *
 * Enforces:
 * NO MAIN MENU PERMISSION -> All submenus and actions DENIED
 * MAIN MENU GRANTED -> Check Submenu permissions
 * SUBMENU NOT GRANTED -> All actions under that submenu DENIED
 * SUBMENU GRANTED -> Check Action permissions
 */
export function hasPermission(account: AdminAccount | null, permission: PermissionKey): boolean {
  if (!account) return false;
  if (account.status !== 'active') return false;
  if (account.role === 'super_admin') return true;

  let perms = account.permissions || [];

  // Backward compatibility: If an existing account only has legacy action permissions without any menu keys, upgrade it
  const hasAnyMenuKey = perms.some(p => p.startsWith('menu.'));
  if (!hasAnyMenuKey) {
    perms = upgradeLegacyPermissions(perms);
  }

  // 1. MAIN MENU level check
  if (permission.startsWith('menu.')) {
    return perms.includes(permission);
  }

  // 2. SUBMENU level check
  if (permission.startsWith('submenu.')) {
    const parentMenu = SUBMENU_TO_MENU_MAP[permission];
    // Main Menu Gate: If parent menu is not granted, submenu is completely blocked
    if (parentMenu && !perms.includes(parentMenu)) {
      return false;
    }
    return perms.includes(permission);
  }

  // 3. ACTION level check
  const parentSubmenu = ACTION_TO_SUBMENU_MAP[permission];
  if (parentSubmenu) {
    const parentMenu = SUBMENU_TO_MENU_MAP[parentSubmenu];
    // Must have parent Main Menu
    if (parentMenu && !perms.includes(parentMenu)) {
      return false;
    }
    // Must have parent Submenu
    if (!perms.includes(parentSubmenu)) {
      return false;
    }
  }

  return perms.includes(permission);
}

// Verify input password using bcrypt
export async function verifyPassword(inputPassword: string, storedHashOrPlain: string, salt: string): Promise<boolean> {
  if (!inputPassword || !storedHashOrPlain) return false;
  if (storedHashOrPlain.startsWith('$2a$') || storedHashOrPlain.startsWith('$2b$') || storedHashOrPlain.startsWith('$2y$')) {
    return verifyPasswordBcrypt(inputPassword, storedHashOrPlain);
  }
  if (inputPassword === storedHashOrPlain) {
    return true;
  }
  const hashedInput = await hashPasswordWithSalt(inputPassword, salt);
  return hashedInput === storedHashOrPlain;
}

// Storage helpers
export function loadAdminAccounts(): AdminAccount[] {
  // Database API (/api/cms/state) is the authoritative persistence for admin accounts.
  // Fall back cleanly to initialAdminAccounts in memory without using localStorage as authoritative storage.
  return initialAdminAccounts;
}

// Single Active Session Lock Helpers (Ensures only ONE admin / superadmin can be logged in at once)
export interface ActiveSessionLock {
  sessionId: string;
  userId: string;
  username: string;
  role: 'super_admin' | 'admin';
  fullName: string;
  loginTimestamp: number;
  lastHeartbeat: number;
}

const SESSION_LOCK_KEY = 'ishwari_active_session_lock';
const SESSION_HEARTBEAT_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins timeout if inactive

export function getActiveSessionLock(): ActiveSessionLock | null {
  try {
    const raw = safeStorage.getItem(SESSION_LOCK_KEY);
    if (!raw) return null;
    const session: ActiveSessionLock = JSON.parse(raw);
    if (Date.now() - session.lastHeartbeat > SESSION_HEARTBEAT_TIMEOUT_MS) {
      safeStorage.removeItem(SESSION_LOCK_KEY);
      return null;
    }
    return session;
  } catch (e) {
    safeStorage.removeItem(SESSION_LOCK_KEY);
    return null;
  }
}

export function acquireSessionLock(account: AdminAccount, forceTakeover: boolean = true): {
  success: boolean;
  activeSession?: ActiveSessionLock;
  sessionId?: string;
} {
  const current = getActiveSessionLock();
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');

  // If there's an active session belonging to someone else and forceTakeover is not requested
  if (!forceTakeover && current && (!mySessionId || current.sessionId !== mySessionId) && current.userId !== account.id) {
    return {
      success: false,
      activeSession: current
    };
  }

  const newSessionId =
    mySessionId ||
    (typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

  const newLock: ActiveSessionLock = {
    sessionId: newSessionId,
    userId: account.id,
    username: account.username,
    role: account.role,
    fullName: account.fullName,
    loginTimestamp: Date.now(),
    lastHeartbeat: Date.now()
  };

  safeStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(newLock));
  safeSessionStorage.setItem('ishwari_my_session_id', newSessionId);
  return { success: true, sessionId: newSessionId };
}

export function refreshSessionHeartbeat(): boolean {
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (current && mySessionId && current.sessionId === mySessionId) {
    current.lastHeartbeat = Date.now();
    safeStorage.setItem(SESSION_LOCK_KEY, JSON.stringify(current));
    return true;
  }
  return false;
}

export function releaseSessionLock(): void {
  const mySessionId = safeSessionStorage.getItem('ishwari_my_session_id');
  const current = getActiveSessionLock();
  if (!current || !mySessionId || current.sessionId === mySessionId) {
    safeStorage.removeItem(SESSION_LOCK_KEY);
  }
  safeSessionStorage.removeItem('ishwari_my_session_id');
}

export function forceClearSessionLock(): void {
  safeStorage.removeItem(SESSION_LOCK_KEY);
  safeSessionStorage.removeItem('ishwari_my_session_id');
}

export function saveAdminAccounts(_accounts: AdminAccount[]): void {
  // Authoritative admin account persistence is handled strictly by the database API (/api/cms/sync and /api/admin/accounts)
}



