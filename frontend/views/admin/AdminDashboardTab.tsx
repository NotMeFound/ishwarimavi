import React from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  DocumentItem,
  ContactMessage,
  GalleryItem,
  SchoolEvent,
  SecurityAuditLogEntry,
  AdminRole,
  Vacancy,
  PermissionKey,
  SiteCustomizerConfig
} from '../../types';
import {
  Bell,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Image as ImageIcon,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  Shield,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AdminNavTabId } from './AdminSidebar';
import { CmsStatusBadge } from './CmsStatusBadge';

interface AdminDashboardTabProps {
  lang: Language;
  currentRole: AdminRole;
  currentUsername: string;
  school: SchoolData;
  notices: Notice[];
  documents: DocumentItem[];
  staff: StaffMember[];
  messages: ContactMessage[];
  gallery: GalleryItem[];
  events?: SchoolEvent[];
  vacancies?: Vacancy[];
  auditLogs?: SecurityAuditLogEntry[];
  adminCount?: number;
  can?: (perm: PermissionKey) => boolean;
  onNavigateTab: (tabId: AdminNavTabId) => void;
  siteConfig?: SiteCustomizerConfig;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  lang,
  currentRole,
  currentUsername,
  school,
  notices,
  documents,
  staff,
  messages,
  gallery,
  events = [],
  vacancies = [],
  auditLogs = [],
  can,
  onNavigateTab,
  siteConfig
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);
  const isSuperAdmin = currentRole === 'super_admin';

  const isAuthorized = (perm: PermissionKey) => {
    if (isSuperAdmin) return true;
    if (!can) return true;
    return can(perm);
  };

  const unreadMessages = messages.filter((m) => m.status === 'new').length;

  // Build the dashboard overview strictly from authorized modules.
  // Modules that the admin cannot access are completely omitted BEFORE rendering.
  const contentItems: Array<{
    id: string;
    title: string;
    description: string;
    count: number;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    tabId: AdminNavTabId;
    unread?: number;
  }> = [];

  if (isAuthorized('notice.view')) {
    contentItems.push({
      id: 'notices',
      title: t('Notices', 'सूचनाहरू'),
      description: t('Official announcements, exam routines, and circulars', 'सूचना, परीक्षा तालिका तथा सूचनापाटी'),
      count: notices.length,
      icon: Bell,
      tabId: 'content_notices'
    });
  }

  if (isAuthorized('career.view')) {
    contentItems.push({
      id: 'career',
      title: t('Career & Vacancies', 'रोजगारी तथा विज्ञापन'),
      description: t('Job recruitment, staff vacancies, and online applications', 'शिक्षक तथा कर्मचारी पदपूर्ति, दरखास्त र खुला विज्ञापन'),
      count: vacancies.length,
      icon: Briefcase,
      tabId: 'content_career'
    });
  }

  if (isAuthorized('document.view')) {
    contentItems.push({
      id: 'documents',
      title: t('Documents', 'दस्तावेजहरू'),
      description: t('Downloadable files, guidelines, and application forms', 'आवेदन फारम, पाठ्यक्रम तथा डाउनलोड योग्य फाइलहरू'),
      count: documents.length,
      icon: FileText,
      tabId: 'content_documents'
    });
  }

  if (isAuthorized('event.view')) {
    contentItems.push({
      id: 'events',
      title: t('Events', 'कार्यक्रमहरू'),
      description: t('School calendar events, celebrations, and schedules', 'शैक्षिक क्यालेन्डर, दिवस तथा अतिरिक्त क्रियाकलाप'),
      count: events.length,
      icon: Calendar,
      tabId: 'content_events'
    });
  }

  if (isAuthorized('teacher.view') || isAuthorized('staff.view')) {
    contentItems.push({
      id: 'staff',
      title: t('Staff & Faculty', 'शिक्षक तथा कर्मचारीहरू'),
      description: t('Teaching faculty, administrators, and committee members', 'शिक्षक, प्रशासनिक कर्मचारी र व्यवस्थापन समिति'),
      count: staff.length,
      icon: Users,
      tabId: 'gov_staff'
    });
  }

  if (isAuthorized('gallery.view')) {
    contentItems.push({
      id: 'gallery',
      title: t('Photo Gallery', 'फोटो ग्यालरी'),
      description: t('Campus photographs, ceremonies, and visual albums', 'विद्यालय गतिविधि तथा क्याम्पस फोटोहरू'),
      count: gallery.length,
      icon: ImageIcon,
      tabId: 'media_gallery'
    });
  }

  if (isAuthorized('message.view')) {
    contentItems.push({
      id: 'messages',
      title: t('Inquiries', 'सम्पर्क सोधपुछ'),
      description: t('Public contact form submissions and portal messages', 'नागरिक सोधपुछ तथा सन्देशहरू'),
      count: messages.length,
      unread: unreadMessages,
      icon: MessageSquare,
      tabId: 'comm_contact'
    });
  }

  // Authoritative administrative actions (only if authorized to view audit logs)
  const canViewAudit = isAuthorized('audit.view');
  const recentActivities = canViewAudit ? (auditLogs || []).slice(0, 7) : [];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Institutional Welcome & Profile Coordinates */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t(school.name_en, school.name_np)}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span>
              {t('Signed in as', 'लगइन खाता')}: <strong className="text-slate-800 dark:text-slate-200 font-semibold">@{currentUsername}</strong>
            </span>
            <span>•</span>
            <span className="capitalize">{currentRole.replace('_', ' ')}</span>
            <span>•</span>
            <span>{school.address_en || 'Nepal'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition"
          >
            <span>{t('View Public Website', 'वेबसाइट हेर्नुहोस्')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 23. CONTENT OVERVIEW (Minimalist, useful, no dozens of colorful cards) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Content Overview', 'सामग्री सिंहावलोकन')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('Live record counts published across the institutional portal.', 'विद्यालय पोर्टलमा प्रकाशित प्रत्यक्ष तथ्याङ्क।')}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Authoritative Data</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {contentItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onNavigateTab(item.tabId)}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">
                        {item.title}
                      </span>
                      {item.unread !== undefined && item.unread > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300">
                          {item.unread} {t('new', 'नयाँ')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md hidden sm:block">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white min-w-[28px] text-right">
                    {item.count}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1E40AF] group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 24. ADMIN CONTENT HEALTH (Actionable, compact health audit) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('Content Health', 'सामग्री स्वास्थ्य स्थिति')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('Institutional readiness and publication checklist. Click an item to manage.', 'पोर्टल तयारी तथा प्रकाशन स्थिति। आवश्यक खण्ड व्यवस्थापन गर्न क्लिक गर्नुहोस्।')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('content_health')}
            className="text-xs text-[#1E40AF] dark:text-blue-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{t('View Full Content Health Audit', 'पूरा स्वास्थ्य अडिट हेर्नुहोस्')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {[
            {
              id: 'identity',
              label: t('School Identity & Logo Configured', 'विद्यालयको पहिचान तथा लोगो'),
              passed: Boolean(school.name_en && school.logo_url),
              warningText: t('School identity or emblem missing', 'लोगो वा नाम अपूर्ण'),
              tabId: 'sys_settings' as AdminNavTabId
            },
            {
              id: 'contact',
              label: t('Official Contact Coordinates Configured', 'आधिकारिक सम्पर्क विवरण'),
              passed: Boolean(school.phone && school.email && school.address_en),
              warningText: t('Contact phone or email incomplete', 'सम्पर्क फोन वा इमेल अपूर्ण'),
              tabId: 'sys_settings' as AdminNavTabId
            },
            {
              id: 'notices',
              label: t('Latest Circulars & Notices Published', 'ताजा सार्वजनिक सूचनाहरू'),
              passed: notices.some(n => n.published !== false && n.is_published !== false && n.status !== 'draft'),
              warningText: t('No published public circulars', 'कुनै सूचना प्रकाशित छैन'),
              tabId: 'content_notices' as AdminNavTabId
            },
            {
              id: 'vacancies',
              label: t('Recruitment & Career Vacancies Active', 'पदपूर्ति तथा खुला विज्ञापन'),
              passed: vacancies.some(v => v.status === 'published'),
              warningText: t('No active public vacancy notice', 'कुनै खुला विज्ञापन छैन'),
              tabId: 'content_career' as AdminNavTabId
            },
            {
              id: 'academic_year',
              label: t('Current Academic Year Active', 'चालू शैक्षिक सत्र सक्रिय'),
              passed: Boolean(siteConfig?.academicYear?.isActive !== false),
              warningText: t('Academic year configuration inactive', 'शैक्षिक सत्र निष्क्रिय'),
              tabId: 'site_customizer' as AdminNavTabId
            },
            {
              id: 'faculty',
              label: t('Teaching Faculty Directory Published', 'शिक्षक तथा कर्मचारी विवरण'),
              passed: staff.length > 0,
              warningText: t('Faculty list is empty', 'शिक्षक नामावली खाली छ'),
              tabId: 'gov_staff' as AdminNavTabId
            },
            {
              id: 'documents',
              label: t('Citizen Charter & Official Documents Available', 'नागरिक वडापत्र तथा कागजात'),
              passed: documents.length > 0,
              warningText: t('No downloadable documents uploaded', 'कुनै कागजात अपलोड गरिएको छैन'),
              tabId: 'content_documents' as AdminNavTabId
            }
          ].map((check) => (
            <div
              key={check.id}
              onClick={() => onNavigateTab(check.tabId)}
              className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                {check.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                )}
                <span className={`font-medium ${check.passed ? 'text-slate-800 dark:text-slate-200' : 'text-amber-800 dark:text-amber-300'}`}>
                  {check.passed ? check.label : check.warningText}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition">
                <span className="text-[11px] font-medium hidden sm:inline">
                  {check.passed ? t('Review', 'पुनरावलोकन') : t('Configure', 'व्यवस्थापन')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 23. RECENT ACTIVITY (With latest actual Admin actions from backend, only rendered if authorized) */}
      {canViewAudit && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Recent Activity', 'भर्खरका प्रशासनिक कार्यहरू')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Chronological log of verified administrative operations and changes.', 'प्रमाणित प्रशासनिक परिवर्तन तथा लगइन विवरणहरू।')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('sys_audit')}
              className="text-xs text-[#1E40AF] dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              {t('View Full Audit Log', 'पूरा अडिट लग हेर्नुहोस्')}
            </button>
          </div>

          {recentActivities.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {t('No recent administrative actions recorded yet.', 'कुनै प्रशासनिक कार्य दर्ता भएको छैन।')}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {recentActivities.map((act) => {
                const formattedAction = act.action.replace(/_/g, ' ');
                return (
                  <div
                    key={act.id}
                    className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                            {formattedAction}
                          </span>
                          <CmsStatusBadge
                            status={act.status === 'success' ? 'active' : 'draft'}
                            label={act.status === 'success' ? 'Verified' : act.status}
                          />
                        </div>
                        {act.details && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl mt-0.5">
                            {act.details}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 self-end sm:self-auto font-mono">
                      <span>@{act.actor}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{act.timestamp}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
