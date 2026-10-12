import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { EventEmitter } from 'events';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, runTransaction, Firestore } from 'firebase/firestore';
import {
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  ContactMessage,
  DocumentItem,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig,
  SecurityAuditLogEntry,
  AdminAccount,
  PermissionKey,
  AboutSection,
  CurriculumGuideline,
  Vacancy,
  SchoolFAQItem
} from './types';
import {
  initialSchoolData,
  initialNotices,
  initialStaff,
  initialFacilities,
  initialEvents,
  initialAchievements,
  initialHistory,
  initialDocuments,
  initialPrograms,
  initialMessages,
  initialGallery,
  initialSiteConfig,
  initialSecurityConfig,
  initialAuditLogs,
  initialCurriculumGuidelines,
  initialVacancies,
  initialFAQs
} from '../frontend/data/schoolData';
import { initialAdminAccounts, ALL_PERMISSIONS } from '../frontend/utils/security';

export const defaultAboutSections: AboutSection[] = [
  {
    id: 'about-intro',
    title_en: 'About Ishwari Secondary School',
    title_np: 'ईश्वरी माध्यमिक विद्यालयको बारेमा',
    category: 'overview',
    content_en: `Shree Ishwari Secondary School was established in 2028 B.S. and has continued to provide quality, accessible education to students across the community.

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:Main School Academic Block|caption:Shree Ishwari Secondary School Academic Campus Block]]

Over the decades, the institution has steadily expanded its educational programs, infrastructure, and learning environment. Through generous community collaboration and dedicated governmental support, the school has developed modern multimedia classrooms, fully-equipped science and computer laboratories, and sports grounds.

Today, Ishwari Secondary School stands as a model community learning center where academic rigor, ethical discipline, and scientific inquiry are nurtured together.`,
    content_np: `श्री ईश्वरी माध्यमिक विद्यालय वि.सं. २०२८ सालमा स्थापित भई यस भेगका बालबालिकाहरूलाई गुणस्तरीय, सुलभ र व्यावहारिक शिक्षा प्रदान गर्दै आइरहेको एक ऐतिहासिक सामुदायिक शैक्षिक संस्था हो।

[[image:https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80|align:right|size:medium|alt:विद्यालयको मुख्य शैक्षिक भवन|caption:श्री ईश्वरी माध्यमिक विद्यालयको शैक्षिक परिसर]]

स्थापनाकालदेखि नै विद्यालयले आफ्ना शैक्षिक कार्यक्रमहरू, आधुनिक भौतिक पूर्वाधार तथा प्रविधिमैत्री सिकाइ वातावरणलाई निरन्तर सुदृढ बनाउँदै लगेको छ। समुदायको प्रत्यक्ष सहभागिता, अनुभवी शिक्षक मण्डली र विद्यार्थीहरूको लगनशीलताले विद्यालयलाई नमुना विद्यालयको रूपमा स्थापित गरेको छ।

आज यस विद्यालयमा आधुनिक विज्ञान प्रयोगशाला, कम्प्युटर ल्याब, सुसज्जित पुस्तकालय तथा खेलकुद मैदान उपलब्ध छन् जहाँ विद्यार्थीहरूको सर्वाङ्गीण विकासलाई प्राथमिकता दिइन्छ।`,
    image: '',
    image_caption_en: 'Main Academic Campus & Grounds',
    image_caption_np: 'विद्यालयको मुख्य शैक्षिक भवन तथा प्राङ्गण',
    display_order: 1,
    status: 'published',
    is_enabled: true,
    icon: 'Compass'
  },
  {
    id: 'about-mission',
    title_en: 'Our Mission',
    title_np: 'हाम्रो उद्देश्य',
    category: 'mission',
    content_en: 'To empower every learner with strong academic foundations, critical thinking abilities, digital literacy, and civic values.',
    content_np: 'प्रत्येक विद्यार्थीलाई आधारभूत शैक्षिक ज्ञान, सिर्जनशीलता, प्रविधिमैत्री सीप र उच्च नैतिक संस्कार प्रदान गर्नु।',
    display_order: 2,
    status: 'published',
    is_enabled: true,
    icon: 'Target'
  },
  {
    id: 'about-vision',
    title_en: 'Our Vision',
    title_np: 'हाम्रो दृष्टिकोण',
    category: 'vision',
    content_en: 'To establish Ishwari as a premier national model school delivering accessible, internationally competitive education in Nepal.',
    content_np: 'नेपालको अग्रणी नमुना सामुदायिक विद्यालयको रूपमा विकास गरी राष्ट्रिय तथा अन्तर्राष्ट्रिय स्तरमा प्रतिस्पर्धी जनशक्ति तयार पार्नु।',
    display_order: 3,
    status: 'published',
    is_enabled: true,
    icon: 'Eye'
  },
  {
    id: 'about-values',
    title_en: 'Core Values',
    title_np: 'हाम्रा मुख्य मान्यताहरू',
    category: 'values',
    content_en: 'Academic Integrity, Social Inclusion, Scientific Temper, Environmental Stewardship, and Community Trust.',
    content_np: 'शैक्षिक निष्ठा, सामाजिक समावेशिता, वैज्ञानिक चेतना, वातावरण संरक्षण र पूर्ण अनुशासन।',
    display_order: 4,
    status: 'published',
    is_enabled: true,
    icon: 'Scale'
  },
  {
    id: 'about-governance',
    title_en: 'School Management Committee (SMC) & Governance',
    title_np: 'विद्यालय व्यवस्थापन समिति (SMC) तथा सुशासन',
    category: 'governance',
    content_en: 'Under the Education Act of Nepal, the School Management Committee oversees institutional policy, educational equity, resource allocation, and annual social audits with active community participation.',
    content_np: 'शिक्षा ऐन तथा नियमावली अनुसार अभिभावक, स्थानीय तहका प्रतिनिधि र शिक्षाप्रेमीहरूको सहभागितामा गठित विद्यालय व्यवस्थापन समितिले नीतिगत निर्णय, पारदर्शिता र शैक्षिक गुणस्तर अभिवृद्धिमा नेतृत्वदायी भूमिका निर्वाह गर्दछ।',
    display_order: 5,
    status: 'published',
    is_enabled: true,
    icon: 'Building2'
  }
];

export interface CMSDatabaseState {
  version: number;
  lastModified: string;
  school: SchoolData;
  aboutSections: AboutSection[];
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  curriculumGuidelines: CurriculumGuideline[];
  vacancies: Vacancy[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  faqs?: SchoolFAQItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  auditLogs: SecurityAuditLogEntry[];
  adminAccounts: AdminAccount[];
}

export interface ServerSession {
  token: string;
  userId: string;
  username: string;
  fullName: string;
  role: 'super_admin' | 'admin';
  permissions: PermissionKey[];
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

export interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockoutUntil: number;
}

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

export const FIREBASE_CONFIG = {
  projectId: 'imposing-practice-w6tvw',
  appId: '1:801110298190:web:8caf18bf341076c7a8bd1f',
  apiKey: 'AIzaSyA6bwICa7vuwur1g0MoYxdTtH2Kl1QOImI',
  authDomain: 'imposing-practice-w6tvw.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-ishwarisecondary-62e4059d-8fd8-48dc-9660-818a91224b4e',
  storageBucket: 'imposing-practice-w6tvw.firebasestorage.app',
  messagingSenderId: '801110298190',
  measurementId: '',
  oAuthClientId: '801110298190-k04n444nd7c7n5hi6igjbei3e4iuni1h.apps.googleusercontent.com',
  recaptchaSiteKey: ''
};

export function getFirestoreDb(): Firestore {
  const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApps()[0];
  return getFirestore(app, FIREBASE_CONFIG.firestoreDatabaseId);
}

const CMS_MODULE_KEYS = [
  'school',
  'aboutSections',
  'notices',
  'staff',
  'facilities',
  'programs',
  'documents',
  'curriculumGuidelines',
  'vacancies',
  'messages',
  'events',
  'achievements',
  'history',
  'gallery',
  'faqs',
  'siteConfig',
  'securityConfig',
  'auditLogs',
  'adminAccounts'
] as const;

const outdatedSeedStaffNames = new Set([
  'Mr. Narayan Prasad Koirala',
  'Mrs. Sharada Devi Sharma',
  'Mr. Rameshwor Gautam',
  'Ms. Binita Thapa',
  'Mr. Lokendra Bahadur Thapa',
  'Ms. Kamala Adhikari'
]);
const SCHOOL_FACTS_MIGRATION_VERSION = 'school-facts-2028-v1';
function migrateSchoolFacts(state: CMSDatabaseState): Set<keyof CMSDatabaseState> {
  const changedModules = new Set<keyof CMSDatabaseState>();
  const school = state.school;
  const setSchoolValue = <K extends keyof SchoolData>(key: K, value: SchoolData[K]) => {
    if (school[key] !== value) {
      school[key] = value;
      changedModules.add('school');
    }
  };

  if (school.estd_bs === '2035 B.S.') setSchoolValue('estd_bs', '2028 B.S.');
  if (school.estd_ad === '1978 A.D.') setSchoolValue('estd_ad', '');

  setSchoolValue('chairman_name_en', 'Jhakabir Khatri');
  setSchoolValue('chairman_name_np', 'झकबिर खत्री');
  setSchoolValue('chairman_designation_en', 'Chairman, School Management Committee');
  setSchoolValue('chairman_designation_np', 'अध्यक्ष, विद्यालय व्यवस्थापन समिति');
  setSchoolValue('chairman_message_en', school.chairman_message_en || 'Ishwari Secondary School is committed to quality, inclusion, and transparent school governance.');
  setSchoolValue('chairman_message_np', school.chairman_message_np || 'ईश्वरी माध्यमिक विद्यालय गुणस्तरीय, समावेशी र पारदर्शी विद्यालय सुशासनमा प्रतिबद्ध छ।');
  setSchoolValue('chairman_status', school.chairman_status || 'published');

  setSchoolValue('principal_name_en', 'Mangal Khatri');
  setSchoolValue('principal_name_np', 'मंगल खत्री');
  setSchoolValue('principal_designation_en', 'Principal');
  setSchoolValue('principal_designation_np', 'प्रधानाध्यापक');
  if (/2035|four decades/i.test(school.principal_message_en || '')) {
    setSchoolValue('principal_message_en', 'Welcome to Ishwari Secondary School. We are committed to supporting student learning and development.');
  }
  if (/२०३५|चार दशक/.test(school.principal_message_np || '')) {
    setSchoolValue('principal_message_np', 'ईश्वरी माध्यमिक विद्यालयको आधिकारिक डिजिटल पोर्टलमा हार्दिक स्वागत छ। विद्यार्थीहरूको सिकाइ र सर्वाङ्गीण विकासमा हामी प्रतिबद्ध छौं।');
  }

  const existingStaff = Array.isArray(state.staff) ? state.staff : [];
  const nextStaff = existingStaff
    .filter(member => !outdatedSeedStaffNames.has(member.name_en.trim()) || member.role === 'principal')
    .map(member => {
      if (member.role !== 'principal') return member;
      if (
        member.name_en === 'Mangal Khatri' &&
        member.name_np === 'मंगल खत्री' &&
        member.designation_en === 'Principal' &&
        member.designation_np === 'प्रधानाध्यापक'
      ) return member;
      return {
        ...member,
        name_en: 'Mangal Khatri',
        name_np: 'मंगल खत्री',
        designation_en: 'Principal',
        designation_np: 'प्रधानाध्यापक'
      };
    });
  if (!nextStaff.some(member => member.role === 'principal')) {
    nextStaff.push({ ...initialStaff[0], id: Math.max(0, ...nextStaff.map(member => member.id)) + 1 });
  }
  if (!nextStaff.some(member => member.name_en === 'Bhim Bahadur Khatri')) {
    nextStaff.push({ ...initialStaff[1], id: Math.max(0, ...nextStaff.map(member => member.id)) + 1 });
  }
  if (nextStaff.length !== existingStaff.length || nextStaff.some((member, index) => member !== existingStaff[index])) {
    state.staff = nextStaff;
    changedModules.add('staff');
  }

  const intro = state.aboutSections?.find(section => section.id === 'about-intro');
  if (intro) {
    const updatedContentEn = intro.content_en.replace(/2035 B\.S\./g, '2028 B.S.');
    const updatedContentNp = intro.content_np.replace(/वि\.सं\. २०३५/g, 'वि.सं. २०२८');
    if (updatedContentEn !== intro.content_en || updatedContentNp !== intro.content_np) {
      intro.content_en = updatedContentEn;
      intro.content_np = updatedContentNp;
      changedModules.add('aboutSections');
    }
  }

  const foundingMilestone = state.history?.find(item =>
    item.year.startsWith('2035 B.S.') && /founding|establishment/i.test(item.title_en)
  );
  if (foundingMilestone) {
    foundingMilestone.year = '2028 B.S.';
    changedModules.add('history');
  }

  const siteConfig = state.siteConfig;
  if (siteConfig) {
    const heroTitleEn = 'Cultivating Academic Excellence & Responsible Citizens Since 2028 B.S.';
    const heroTitleNp = 'वि.सं. २०२८ देखि शैक्षिक उत्कृष्टता र नैतिक चरित्र निर्माणमा समर्पित।';
    if ((siteConfig.heroTitleEn || '').includes('2035 B.S.')) {
      siteConfig.heroTitleEn = heroTitleEn;
      changedModules.add('siteConfig');
    }
    if ((siteConfig.heroTitleNp || '').includes('चार दशक')) {
      siteConfig.heroTitleNp = heroTitleNp;
      changedModules.add('siteConfig');
    }
    if (siteConfig.footerDescEn?.includes('2035 B.S.')) {
      siteConfig.footerDescEn = siteConfig.footerDescEn.replace('2035 B.S.', '2028 B.S.');
      changedModules.add('siteConfig');
    }
    if (siteConfig.stats?.years === '48') {
      siteConfig.stats.years = '2028 B.S.';
      siteConfig.stats.yearsLabelEn = 'Established';
      siteConfig.stats.yearsLabelNp = 'स्थापना';
      changedModules.add('siteConfig');
    }
  }

  return changedModules;
}

class CMSDatabaseManager {
  private firestore: Firestore;
  private state: CMSDatabaseState;
  private emitter = new EventEmitter();
  private isInitialLoadDone = false;
  private loadPromise: Promise<CMSDatabaseState> | null = null;

  // Rate-limiting / brute force protection
  private loginAttempts = new Map<string, RateLimitEntry>();

  constructor() {
    this.firestore = getFirestoreDb();
    this.state = this.getDefaultState();
    this.ensureLoaded().catch((err) => {
      console.warn('[CMS Firestore] Initial load error:', err);
    });
  }

  private getDefaultState(): CMSDatabaseState {
    const secureAdminAccounts: AdminAccount[] = initialAdminAccounts.map((acc) => {
      const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
      return {
        ...acc,
        passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash)
      };
    });

    return {
      version: 1,
      lastModified: new Date().toISOString(),
      school: { ...initialSchoolData },
      aboutSections: [...defaultAboutSections],
      notices: [...initialNotices],
      staff: [...initialStaff],
      facilities: [...initialFacilities],
      programs: [...initialPrograms],
      documents: [...initialDocuments],
      curriculumGuidelines: [...initialCurriculumGuidelines],
      vacancies: [...initialVacancies],
      messages: [...initialMessages],
      events: [...initialEvents],
      achievements: [...initialAchievements],
      history: [...initialHistory],
      gallery: [...initialGallery],
      faqs: [...initialFAQs],
      siteConfig: { ...initialSiteConfig },
      securityConfig: { ...initialSecurityConfig },
      auditLogs: [...initialAuditLogs],
      adminAccounts: secureAdminAccounts
    };
  }

  /**
   * Authoritative loader:
   * Connects directly to Firestore to guarantee that Vercel serverless containers
   * always use the true persistent database state as single source of truth.
   */
  public async ensureLoaded(forceFresh = false): Promise<CMSDatabaseState> {
    if (this.loadPromise && !forceFresh) {
      return this.loadPromise;
    }

    this.loadPromise = (async () => {
      try {
        const metaRef = doc(this.firestore, 'cms_modules', '_metadata');
        const metaSnap = await getDoc(metaRef);

        if (!metaSnap.exists()) {
          // Cold initial seed to Firestore if collection does not exist
          const defaultState = this.getDefaultState();
          for (const key of CMS_MODULE_KEYS) {
            await setDoc(doc(this.firestore, 'cms_modules', key), {
              moduleId: key,
              data: (defaultState as any)[key],
              updatedAt: new Date().toISOString()
            });
          }
          await setDoc(metaRef, {
            version: defaultState.version,
            lastModified: defaultState.lastModified,
            schoolFactsMigration: SCHOOL_FACTS_MIGRATION_VERSION
          });
          this.state = defaultState;
          this.isInitialLoadDone = true;
          return this.state;
        }

        const remoteMeta = metaSnap.data() as {
          version: number;
          lastModified: string;
          schoolFactsMigration?: string;
        };
        const remoteVersion = remoteMeta?.version || 1;

        if (this.isInitialLoadDone && !forceFresh && this.state && this.state.version >= remoteVersion) {
          return this.state;
        }

        // Fetch all modules from Firestore in parallel
        const moduleSnaps = await Promise.all(
          CMS_MODULE_KEYS.map((key) => getDoc(doc(this.firestore, 'cms_modules', key)))
        );

        const loadedState: Partial<CMSDatabaseState> = {
          version: remoteVersion,
          lastModified: remoteMeta.lastModified || new Date().toISOString()
        };

        const defaultFallback = this.getDefaultState();

        moduleSnaps.forEach((snap, idx) => {
          const key = CMS_MODULE_KEYS[idx];
          if (snap.exists()) {
            const docData = snap.data();
            (loadedState as any)[key] = docData.data !== undefined ? docData.data : (defaultFallback as any)[key];
          } else {
            (loadedState as any)[key] = (defaultFallback as any)[key];
          }
        });

        if (remoteMeta.schoolFactsMigration !== SCHOOL_FACTS_MIGRATION_VERSION) {
          const migratedModules = migrateSchoolFacts(loadedState as CMSDatabaseState);
          const migrationTimestamp = new Date().toISOString();
          const migratedVersion = remoteVersion + (migratedModules.size > 0 ? 1 : 0);
          if (migratedModules.size > 0) {
            await Promise.all(
              [...migratedModules].map(moduleKey =>
                setDoc(doc(this.firestore, 'cms_modules', moduleKey), {
                  moduleId: moduleKey,
                  data: (loadedState as any)[moduleKey],
                  updatedAt: migrationTimestamp
                })
              )
            );
            loadedState.version = migratedVersion;
            loadedState.lastModified = migrationTimestamp;
          }
          await setDoc(metaRef, {
            ...remoteMeta,
            version: migratedVersion,
            lastModified: loadedState.lastModified,
            schoolFactsMigration: SCHOOL_FACTS_MIGRATION_VERSION
          });
        }

        this.state = loadedState as CMSDatabaseState;
        this.isInitialLoadDone = true;
        return this.state;
      } catch (err) {
        console.error('[CMS Firestore] Failed to refresh authoritative state:', err);
        if (!this.state) {
          this.state = this.getDefaultState();
        }
        throw err;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  public init(): CMSDatabaseState {
    return this.state;
  }

  public getState(): CMSDatabaseState {
    return this.state;
  }

  public getVersion(): { version: number; lastModified: string } {
    return { version: this.state.version, lastModified: this.state.lastModified };
  }

  public getPublicState(): Omit<CMSDatabaseState, 'adminAccounts' | 'securityConfig'> & {
    securityConfig: Partial<SecurityConfig>;
  } {
    const s = this.getState();
    const { recoveryPin, ...publicSecConfig } = s.securityConfig;
    return {
      version: s.version,
      lastModified: s.lastModified,
      school: s.school,
      aboutSections: s.aboutSections || defaultAboutSections,
      notices: (s.notices || initialNotices).filter((item: any) => item.published !== false && item.is_published !== false),
      staff: s.staff,
      facilities: s.facilities,
      programs: s.programs,
      documents: s.documents,
      curriculumGuidelines: (s.curriculumGuidelines || []).filter((item) => item.status === 'published'),
      vacancies: (s.vacancies || initialVacancies).filter((item: any) => item.status === 'published' && item.is_open !== false),
      messages: s.messages,
      events: s.events,
      achievements: s.achievements,
      history: (s.history || []).filter((item: any) => item.status !== 'unpublished' && item.is_enabled !== false),
      gallery: s.gallery,
      faqs: (s.faqs || initialFAQs).filter((item: any) => item.status !== 'draft'),
      siteConfig: s.siteConfig,
      securityConfig: publicSecConfig,
      auditLogs: s.auditLogs
    };
  }

  public subscribe(listener: (payload: { module: string; version: number; lastModified: string }) => void) {
    this.emitter.on('change', listener);
    return () => {
      this.emitter.off('change', listener);
    };
  }

  /* ---------------- SESSION MANAGEMENT ---------------- */

  public async createSession(account: AdminAccount, ip: string, userAgent: string): Promise<ServerSession | null> {
    const timeoutMinutes = this.state.securityConfig?.sessionTimeoutMinutes || 60;
    const now = Date.now();
    const sessionDurationMs = Math.max(1, timeoutMinutes) * 60 * 1000;
    const expiresAt = now + sessionDurationMs;

    const sessionData: Omit<ServerSession, 'token'> = {
      userId: account.id,
      username: account.username,
      fullName: account.fullName,
      role: account.role,
      permissions: account.role === 'super_admin' ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      ip,
      userAgent
    };

    const token = `iss2.${crypto.randomBytes(32).toString('base64url')}`;
    const session: ServerSession = { ...sessionData, token };
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const lockRef = doc(this.firestore, 'session_role_locks', account.role);
    const sessionRef = doc(this.firestore, 'sessions', tokenHash);
    const claimed = await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshot = await transaction.get(lockRef);
      const existingLock = lockSnapshot.exists() ? lockSnapshot.data() : undefined;
      let existingSessionSnapshot;
      const existingTokenHash =
        typeof existingLock?.tokenHash === 'string' && /^[a-f0-9]{64}$/i.test(existingLock.tokenHash)
          ? existingLock.tokenHash
          : undefined;
      if (existingTokenHash) {
        existingSessionSnapshot = await transaction.get(
          doc(this.firestore, 'sessions', existingTokenHash)
        );
      }

      const existingSession = existingSessionSnapshot?.exists()
        ? existingSessionSnapshot.data()
        : undefined;
      const existingAccount = existingSession
        ? this.state.adminAccounts.find((item) => item.id === existingSession.userId)
        : undefined;
      const hasValidExistingSession =
        existingLock &&
        existingSession &&
        existingLock.tokenHash === existingTokenHash &&
        existingLock.userId === existingSession.userId &&
        Number(existingLock.expiresAt) > now &&
        Number(existingSession.expiresAt) > now &&
        existingSession.role === account.role &&
        existingAccount?.status === 'active' &&
        existingAccount.role === account.role;

      if (hasValidExistingSession) return false;

      if (existingTokenHash) {
        transaction.delete(doc(this.firestore, 'sessions', existingTokenHash));
      }
      transaction.set(sessionRef, sessionData);
      transaction.set(lockRef, {
        tokenHash,
        userId: account.id,
        username: account.username,
        role: account.role,
        expiresAt,
        updatedAt: now
      });
      return true;
    });

    if (!claimed) return null;

    return session;
  }

  public async validateSession(token: string | undefined): Promise<ServerSession | null> {
    if (!token) return null;

    const now = Date.now();
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const sessionRef = doc(this.firestore, 'sessions', tokenHash);
    const sessionData = await runTransaction(this.firestore, async (transaction) => {
      const sessionSnapshot = await transaction.get(sessionRef);
      if (!sessionSnapshot.exists()) return null;
      const storedSession = sessionSnapshot.data();
      if (
        typeof storedSession.userId !== 'string' ||
        typeof storedSession.username !== 'string' ||
        !Number.isFinite(Number(storedSession.createdAt)) ||
        !Number.isFinite(Number(storedSession.expiresAt))
      ) return null;
      if (storedSession.token && storedSession.token !== token) return null;
      if (!storedSession.token && !token.startsWith('iss2.')) return null;
      if (!['admin', 'super_admin'].includes(storedSession.role)) return null;

      const lockRef = doc(this.firestore, 'session_role_locks', storedSession.role);
      const lockSnapshot = await transaction.get(lockRef);
      if (!lockSnapshot.exists()) return null;
      const roleLock = lockSnapshot.data();
      if (
        roleLock.tokenHash !== tokenHash ||
        roleLock.userId !== storedSession.userId ||
        Number(roleLock.expiresAt) <= now ||
        Number(storedSession.expiresAt) <= now
      ) return null;

      return storedSession;
    });
    if (!sessionData) return null;

    const s = this.state;
    const account = s.adminAccounts.find(
      (a) => a.id === sessionData.userId || a.username.toLowerCase() === sessionData.username.toLowerCase()
    );
    if (!account || account.status !== 'active') {
      await this.destroySession(token);
      return null;
    }

    if (account.role !== sessionData.role) {
      await this.destroySession(token);
      return null;
    }

    const session: ServerSession = {
      token,
      userId: sessionData.userId,
      username: sessionData.username,
      fullName: sessionData.fullName,
      role: account.role,
      permissions: account.role === 'super_admin' ? ALL_PERMISSIONS.map((p) => p.key) : account.permissions,
      createdAt: Number(sessionData.createdAt),
      lastActivity: now,
      expiresAt: Number(sessionData.expiresAt),
      ip: sessionData.ip || '127.0.0.1',
      userAgent: sessionData.userAgent || 'Unknown Browser'
    };
    return session;
  }

  public async refreshSession(token: string | undefined): Promise<ServerSession | null> {
    const session = await this.validateSession(token);
    if (!session || !token) return null;

    const now = Date.now();
    const timeoutMinutes = this.state.securityConfig?.sessionTimeoutMinutes || 60;
    const expiresAt = now + Math.max(1, timeoutMinutes) * 60 * 1000;
    const refreshedSessionData: Omit<ServerSession, 'token'> = {
      userId: session.userId,
      username: session.username,
      fullName: session.fullName,
      role: session.role,
      permissions: session.permissions,
      createdAt: session.createdAt,
      lastActivity: now,
      expiresAt,
      ip: session.ip,
      userAgent: session.userAgent
    };
    const refreshedSession: ServerSession = {
      ...refreshedSessionData,
      token: `iss2.${crypto.randomBytes(32).toString('base64url')}`
    };

    const previousTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const refreshedTokenHash = crypto.createHash('sha256').update(refreshedSession.token).digest('hex');
    const lockRef = doc(this.firestore, 'session_role_locks', session.role);
    const previousSessionRef = doc(this.firestore, 'sessions', previousTokenHash);
    const refreshedSessionRef = doc(this.firestore, 'sessions', refreshedTokenHash);
    const claimed = await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshot = await transaction.get(lockRef);
      const sessionSnapshot = await transaction.get(previousSessionRef);
      const existingLock = lockSnapshot.exists() ? lockSnapshot.data() : undefined;
      const existingSession = sessionSnapshot.exists() ? sessionSnapshot.data() : undefined;
      if (
        !existingLock ||
        !existingSession ||
        existingLock.tokenHash !== previousTokenHash ||
        existingLock.userId !== session.userId ||
        existingSession.userId !== session.userId ||
        existingSession.role !== session.role ||
        (existingSession.token && existingSession.token !== token) ||
        Number(existingLock.expiresAt) <= now ||
        Number(existingSession.expiresAt) <= now
      ) {
        return false;
      }

      transaction.delete(previousSessionRef);
      transaction.set(refreshedSessionRef, refreshedSessionData);
      transaction.set(lockRef, {
        ...existingLock,
        tokenHash: refreshedTokenHash,
        userId: session.userId,
        expiresAt,
        updatedAt: now
      });
      return true;
    });
    if (!claimed) return null;

    return refreshedSession;
  }

  public async destroySession(token: string | undefined): Promise<boolean> {
    if (!token) return false;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const sessionRef = doc(this.firestore, 'sessions', tokenHash);
    const roleLockRefs = ['admin', 'super_admin'].map((role) =>
      doc(this.firestore, 'session_role_locks', role)
    );
    await runTransaction(this.firestore, async (transaction) => {
      const lockSnapshots = await Promise.all(roleLockRefs.map((lockRef) => transaction.get(lockRef)));
      transaction.delete(sessionRef);
      lockSnapshots.forEach((lockSnapshot, index) => {
        if (lockSnapshot.exists() && lockSnapshot.data().tokenHash === tokenHash) {
          transaction.delete(roleLockRefs[index]);
        }
      });
    });
    return true;
  }

  /* ---------------- BRUTE FORCE & RATE LIMITING ---------------- */

  public checkRateLimit(identifier: string): { isLocked: boolean; remainingSeconds: number } {
    const entry = this.loginAttempts.get(identifier);
    if (!entry) return { isLocked: false, remainingSeconds: 0 };

    const now = Date.now();
    if (entry.lockoutUntil > now) {
      return {
        isLocked: true,
        remainingSeconds: Math.ceil((entry.lockoutUntil - now) / 1000)
      };
    }

    if (entry.lockoutUntil > 0 && entry.lockoutUntil <= now) {
      this.loginAttempts.delete(identifier);
    }
    return { isLocked: false, remainingSeconds: 0 };
  }

  public recordFailedAttempt(identifier: string): {
    isLocked: boolean;
    remainingAttempts: number;
    remainingSeconds: number;
  } {
    const s = this.state;
    const threshold = s.securityConfig?.lockoutThreshold || 5;
    const durationMinutes = s.securityConfig?.lockoutDurationMinutes || 5;
    const now = Date.now();

    const entry = this.loginAttempts.get(identifier) || {
      attempts: 0,
      lastAttempt: now,
      lockoutUntil: 0
    };

    entry.attempts += 1;
    entry.lastAttempt = now;

    if (entry.attempts >= threshold) {
      entry.lockoutUntil = now + durationMinutes * 60 * 1000;
      this.loginAttempts.set(identifier, entry);
      return {
        isLocked: true,
        remainingAttempts: 0,
        remainingSeconds: durationMinutes * 60
      };
    }

    this.loginAttempts.set(identifier, entry);
    return {
      isLocked: false,
      remainingAttempts: Math.max(0, threshold - entry.attempts),
      remainingSeconds: 0
    };
  }

  public recordSuccessfulAttempt(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /* ---------------- SERVER-SIDE RBAC CHECKS ---------------- */

  public checkPermission(session: ServerSession, moduleKey: string): { allowed: boolean; reason?: string } {
    if (session.role === 'super_admin') {
      return { allowed: true };
    }

    if (session.role === 'admin') {
      if (moduleKey === 'adminAccounts') {
        return { allowed: false, reason: 'Super Admin privilege required to manage administrator accounts.' };
      }
      if (moduleKey === 'securityConfig') {
        return { allowed: false, reason: 'Super Admin privilege required to modify security configuration.' };
      }
      if (moduleKey === 'reset') {
        return { allowed: false, reason: 'Super Admin privilege required to reset CMS data.' };
      }

      const perms = session.permissions || [];
      const hasExplicitMenus = perms.some((p) => p.startsWith('menu.'));

      const checkHierarchy = (menuKey: PermissionKey, submenuKey: PermissionKey, actionCheck: () => boolean): boolean => {
        if (hasExplicitMenus) {
          if (!perms.includes(menuKey)) return false;
          if (!perms.includes(submenuKey)) return false;
        }
        return actionCheck();
      };

      if (moduleKey === 'notices') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_notices', () =>
          perms.some((p) => p.startsWith('notice.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Notice management permissions required.' };
      }

      if (moduleKey === 'vacancies' || moduleKey === 'career') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_career', () =>
          perms.some((p) => p.startsWith('career.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Career management permissions required.' };
      }

      if (moduleKey === 'documents') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_documents', () =>
          perms.some((p) => p.startsWith('document.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Document management permissions required.' };
      }

      if (moduleKey === 'curriculumGuidelines' || moduleKey === 'curriculum') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_curriculum', () =>
          perms.some((p) => p.startsWith('curriculum.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Curriculum guidelines permissions required.' };
      }

      if (moduleKey === 'events') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_events', () =>
          perms.some((p) => p.startsWith('event.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Events management permissions required.' };
      }

      if (moduleKey === 'achievements') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_achievements', () =>
          perms.some((p) => p.startsWith('achievement.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and Achievements permissions required.' };
      }

      if (moduleKey === 'history') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_history', () =>
          perms.some((p) => p.startsWith('history.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and History permissions required.' };
      }

      if (moduleKey === 'faqs') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_faq', () =>
          perms.some((p) => p.startsWith('faq.') || p.startsWith('content.')) || true
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and FAQ permissions required.' };
      }

      if (moduleKey === 'aboutSections' || moduleKey === 'about' || moduleKey === 'facilities' || moduleKey === 'programs') {
        const allowed = checkHierarchy('menu.content', 'submenu.content_about', () =>
          perms.some((p) => p.startsWith('about.') || p.startsWith('facility.') || p.startsWith('program.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Content menu and School profile permissions required.' };
      }

      if (moduleKey === 'staff') {
        const allowed = checkHierarchy('menu.governance', 'submenu.gov_staff', () =>
          perms.some((p) => p.startsWith('teacher.') || p.startsWith('staff.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Governance menu and Faculty / staff permissions required.' };
      }

      if (moduleKey === 'gallery') {
        const allowed = checkHierarchy('menu.media', 'submenu.media_gallery', () =>
          perms.some((p) => p.startsWith('gallery.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Media menu and Gallery permissions required.' };
      }

      if (moduleKey === 'messages') {
        const allowed = checkHierarchy('menu.communication', 'submenu.comm_contact', () =>
          perms.some((p) => p.startsWith('message.'))
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'Communication menu and Contact inquiries permissions required.' };
      }

      if (moduleKey === 'siteConfig' || moduleKey === 'school') {
        if (hasExplicitMenus && !perms.includes('menu.website') && !perms.includes('menu.system')) {
          return { allowed: false, reason: 'Website or System menu permission required.' };
        }
        const hasSettings = perms.includes('settings.update') || perms.includes('settings.view');
        return hasSettings ? { allowed: true } : { allowed: false, reason: 'Site configuration permission required.' };
      }

      if (moduleKey === 'auditLogs') {
        const allowed = checkHierarchy('menu.system', 'submenu.sys_audit', () =>
          perms.includes('audit.view')
        );
        return allowed ? { allowed: true } : { allowed: false, reason: 'System menu and Audit log viewing permissions required.' };
      }
    }

    return { allowed: false, reason: 'Insufficient privileges for this action.' };
  }

  /* ---------------- CMS DATABASE OPERATIONS ---------------- */

  public async updateModule(
    moduleKey: keyof Omit<CMSDatabaseState, 'version' | 'lastModified'>,
    data: any,
    actor = 'Admin',
    ipAddress = '127.0.0.1',
    minVersion?: number
  ): Promise<{ version: number; lastModified: string }> {
    await this.ensureLoaded();
    const s = this.state;

    // If updating adminAccounts, ensure all accounts have bcrypt-hashed passwords
    if (moduleKey === 'adminAccounts' && Array.isArray(data)) {
      data = data.map((acc: AdminAccount) => {
        const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || 'Ishwari@Secure2026')
        };
      });
    }

    const newVersion = Math.max(s.version || 1, minVersion || 0) + 1;
    const nowIso = new Date().toISOString();

    (s as any)[moduleKey] = data;
    s.version = newVersion;
    s.lastModified = nowIso;

    let newLogs = s.auditLogs;
    if (moduleKey !== 'auditLogs') {
      const newLog: SecurityAuditLogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        timestamp: nowIso.replace('T', ' ').substring(0, 19),
        action: `CMS Module Update [${String(moduleKey)}]`,
        actor,
        ipAddress,
        status: 'success',
        result: 'success',
        severity: 'info',
        details: `Updated ${String(moduleKey)} content in authoritative Firestore database`
      };
      newLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];
      s.auditLogs = newLogs;
    }

    // Persist directly to Firestore
    const writes: Promise<any>[] = [
      setDoc(doc(this.firestore, 'cms_modules', String(moduleKey)), {
        moduleId: String(moduleKey),
        data,
        updatedAt: nowIso
      })
    ];

    if (moduleKey !== 'auditLogs') {
      writes.push(
        setDoc(doc(this.firestore, 'cms_modules', 'auditLogs'), {
          moduleId: 'auditLogs',
          data: newLogs,
          updatedAt: nowIso
        })
      );
    }

    await Promise.all(writes);
    await setDoc(doc(this.firestore, 'cms_modules', '_metadata'), {
      version: newVersion,
      lastModified: nowIso
    });

    this.emitter.emit('change', { module: String(moduleKey), version: newVersion, lastModified: nowIso });
    return { version: newVersion, lastModified: nowIso };
  }

  public async updateBatch(
    batch: Partial<Omit<CMSDatabaseState, 'version' | 'lastModified'>>,
    actor = 'Super Admin',
    ipAddress = '127.0.0.1',
    minVersion?: number
  ): Promise<{ version: number; lastModified: string }> {
    await this.ensureLoaded();
    const s = this.state;

    if (batch.adminAccounts && Array.isArray(batch.adminAccounts)) {
      batch.adminAccounts = batch.adminAccounts.map((acc: AdminAccount) => {
        const isBcrypt = acc.passwordHash?.startsWith('$2b$') || acc.passwordHash?.startsWith('$2a$');
        return {
          ...acc,
          passwordHash: isBcrypt ? acc.passwordHash : hashPasswordBcrypt(acc.passwordHash || 'Ishwari@Secure2026')
        };
      });
    }

    const newVersion = Math.max(s.version || 1, minVersion || 0) + 1;
    const nowIso = new Date().toISOString();

    for (const key of Object.keys(batch) as (keyof typeof batch)[]) {
      if (key in s && batch[key] !== undefined) {
        (s as any)[key] = batch[key];
      }
    }
    s.version = newVersion;
    s.lastModified = nowIso;

    const newLog: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: nowIso.replace('T', ' ').substring(0, 19),
      action: `CMS Batch Update [${Object.keys(batch).join(', ')}]`,
      actor,
      ipAddress,
      status: 'success',
      result: 'success',
      severity: 'info',
      details: `Batch synchronization applied across ${Object.keys(batch).length} modules`
    };
    s.auditLogs = [newLog, ...(s.auditLogs || []).slice(0, 199)];

    // Persist all batch modules to Firestore
    const writes: Promise<any>[] = Object.keys(batch).map((key) =>
      setDoc(doc(this.firestore, 'cms_modules', key), {
        moduleId: key,
        data: (s as any)[key],
        updatedAt: nowIso
      })
    );

    writes.push(
      setDoc(doc(this.firestore, 'cms_modules', 'auditLogs'), {
        moduleId: 'auditLogs',
        data: s.auditLogs,
        updatedAt: nowIso
      })
    );

    await Promise.all(writes);
    await setDoc(doc(this.firestore, 'cms_modules', '_metadata'), {
      version: newVersion,
      lastModified: nowIso
    });

    this.emitter.emit('change', { module: 'batch', version: newVersion, lastModified: nowIso });
    return { version: newVersion, lastModified: nowIso };
  }

  public async addContactMessage(message: Omit<ContactMessage, 'id' | 'date' | 'status'> & { id?: number }): Promise<ContactMessage> {
    await this.ensureLoaded();
    const s = this.state;
    const newMsg: ContactMessage = {
      id: message.id || Date.now(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      date: new Date().toISOString().split('T')[0],
      status: 'new'
    };

    s.messages = [newMsg, ...(s.messages || [])];
    s.version = (s.version || 1) + 1;
    s.lastModified = new Date().toISOString();

    await Promise.all([
      setDoc(doc(this.firestore, 'cms_modules', 'messages'), {
        moduleId: 'messages',
        data: s.messages,
        updatedAt: s.lastModified
      })
    ]);
    await setDoc(doc(this.firestore, 'cms_modules', '_metadata'), {
      version: s.version,
      lastModified: s.lastModified
    });

    this.emitter.emit('change', { module: 'messages', version: s.version, lastModified: s.lastModified });
    return newMsg;
  }

  public async appendAuditLog(entry: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    await this.ensureLoaded();
    const s = this.state;
    const newEntry: SecurityAuditLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...entry
    };
    s.auditLogs = [newEntry, ...(s.auditLogs || []).slice(0, 199)];

    await setDoc(doc(this.firestore, 'cms_modules', 'auditLogs'), {
      moduleId: 'auditLogs',
      data: s.auditLogs,
      updatedAt: new Date().toISOString()
    }).catch((err) => console.warn('[CMS Firestore] appendAuditLog error:', err));
  }

  public async resetToDefaults(actor = 'Super Admin', ipAddress = '127.0.0.1'): Promise<{ version: number; lastModified: string }> {
    const defaultState = this.getDefaultState();
    defaultState.version = Date.now();
    defaultState.lastModified = new Date().toISOString();

    const newLog: SecurityAuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: defaultState.lastModified.replace('T', ' ').substring(0, 19),
      action: 'CMS Database Factory Reset',
      actor,
      ipAddress,
      status: 'warning',
      result: 'success',
      severity: 'warning',
      details: 'All modules restored to initial authoritative baseline in Firestore'
    };
    defaultState.auditLogs = [newLog];

    const writes: Promise<any>[] = CMS_MODULE_KEYS.map((key) =>
      setDoc(doc(this.firestore, 'cms_modules', key), {
        moduleId: key,
        data: (defaultState as any)[key],
        updatedAt: defaultState.lastModified
      })
    );

    await Promise.all(writes);
    await setDoc(doc(this.firestore, 'cms_modules', '_metadata'), {
      version: defaultState.version,
      lastModified: defaultState.lastModified
    });

    this.state = defaultState;
    this.emitter.emit('change', { module: 'all', version: defaultState.version, lastModified: defaultState.lastModified });
    return { version: defaultState.version, lastModified: defaultState.lastModified };
  }

  /* ---------------- DURABLE OBJECT/FILE STORAGE IN FIRESTORE ---------------- */

  public async saveUploadedFile(
    filename: string,
    category: string,
    mimeType: string,
    base64Data: string,
    size: number
  ): Promise<void> {
    try {
      const fileRef = doc(this.firestore, 'uploaded_files', filename);
      await setDoc(fileRef, {
        filename,
        category,
        mimeType,
        base64Data,
        size,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[CMS Firestore] Error saving uploaded file to Firestore:', filename, err);
    }
  }

  public async getUploadedFile(filename: string): Promise<{ base64Data: string; mimeType: string; size: number } | null> {
    try {
      const fileRef = doc(this.firestore, 'uploaded_files', filename);
      const snap = await getDoc(fileRef);
      if (snap.exists()) {
        const d = snap.data();
        return {
          base64Data: d.base64Data,
          mimeType: d.mimeType || 'application/pdf',
          size: d.size || 0
        };
      }
    } catch (err) {
      console.warn('[CMS Firestore] Error retrieving uploaded file from Firestore:', filename, err);
    }
    return null;
  }

  public async deleteUploadedFile(filename: string): Promise<void> {
    try {
      const fileRef = doc(this.firestore, 'uploaded_files', filename);
      await deleteDoc(fileRef);
    } catch (err) {
      console.warn('[CMS Firestore] Error deleting uploaded file from Firestore:', filename, err);
    }
  }

  public async checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unavailable';
    latencyMs: number;
    errorCategory?: string;
    details?: string;
  }> {
    const start = Date.now();
    try {
      await this.ensureLoaded();
      // Probe connectivity to Firestore
      const probeRef = doc(this.firestore, 'cms_modules', 'school');
      const snap = await getDoc(probeRef);
      const latencyMs = Date.now() - start;

      if (snap.exists() || this.isInitialLoadDone) {
        return {
          status: 'healthy',
          latencyMs,
          details: 'Firestore connection and memory state verified'
        };
      }

      return {
        status: 'degraded',
        latencyMs,
        details: 'Memory cache available but probe document absent'
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      const isNetwork = err?.code === 'unavailable' || err?.message?.includes('offline') || err?.message?.includes('fetch failed');
      const isAuth = err?.code === 'permission-denied';

      return {
        status: this.state ? 'degraded' : 'unavailable',
        latencyMs,
        errorCategory: isNetwork ? 'NETWORK_UNREACHABLE' : isAuth ? 'PERMISSION_DENIED' : 'DATABASE_ERROR',
        details: err?.message || 'Database connection probe failed'
      };
    }
  }
}

export const db = new CMSDatabaseManager();
