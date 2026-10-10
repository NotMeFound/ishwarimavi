import React from 'react';
import { Language, AdminAccount, SecurityAuditLogEntry, SecurityConfig } from '../../types';
import {
  Settings,
  ShieldCheck,
  KeyRound,
  ClipboardList,
  Shield,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Users,
  Server,
  CheckCircle2
} from 'lucide-react';
import { AdminNavTabId } from './AdminSidebar';
import { ALL_PERMISSIONS } from '../../utils/security';

interface AdminSystemHubTabProps {
  lang: Language;
  accounts: AdminAccount[];
  securityConfig: SecurityConfig;
  auditLogs: SecurityAuditLogEntry[];
  onNavigateTab: (tabId: AdminNavTabId) => void;
  isSuperAdmin: boolean;
}

export const AdminSystemHubTab: React.FC<AdminSystemHubTabProps> = ({
  lang,
  accounts,
  securityConfig,
  auditLogs,
  onNavigateTab,
  isSuperAdmin
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const superAdminsCount = accounts.filter(a => a.role === 'super_admin').length;
  const standardAdminsCount = accounts.filter(a => a.role === 'admin').length;
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1E40AF]" />
          <span>{t('System & Governance Control Center', 'प्रणाली तथा सुशासन नियन्त्रण केन्द्र')}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t(
            'Central management hub for administrator accounts, RBAC permissions, security policies, and audit logs.',
            'प्रशासक खाता, भूमिका र अनुमति, सुरक्षा नीति तथा अडिट लगहरूको एकीकृत नियन्त्रण कक्ष।'
          )}
        </p>
      </div>

      {/* 4 Core Pillars of System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1: Administrators */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#1E40AF]/50 transition space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E40AF] dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {accounts.length} {t('Accounts', 'खाता')}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Administrators Management', 'प्रशासक खाता व्यवस्थापन')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Provision, suspend, reset passwords, and oversee school staff administrative accounts.',
                  'प्रशासकीय खाता सिर्जना, निलम्बन, पासवर्ड रिसेट तथा अनुगमन गर्नुहोस्।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 font-mono">
              <span>{superAdminsCount} Super Admins</span>
              <span>•</span>
              <span>{standardAdminsCount} Staff Admins</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('sys_admins')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#1E40AF] hover:text-white dark:bg-slate-800 dark:hover:bg-[#1E40AF] text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('Manage Administrators', 'प्रशासकहरू व्यवस्थापन गर्नुहोस्')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 2: Roles & Permissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#1E40AF]/50 transition space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                {ALL_PERMISSIONS.length} {t('Permissions', 'अनुमति')}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Roles & Permissions (RBAC)', 'भूमिका र अनुमतिहरू (RBAC)')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Fine-tune granular privileges for Notices, Faculty, Gallery, and Site Settings across roles.',
                  'सूचना, शिक्षक, ग्यालरी र सेटिङहरूमा कर्मचारीहरूको पहुँच नियन्त्रण गर्नुहोस्।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>Super Admin (Full)</span>
              <span>•</span>
              <span>Standard Admin (Scoped)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('sys_roles')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#1E40AF] hover:text-white dark:bg-slate-800 dark:hover:bg-[#1E40AF] text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('View Permissions Matrix', 'अनुमति म्याट्रिक्स हेर्नुहोस्')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 3: Site Settings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#1E40AF]/50 transition space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {securityConfig.sessionTimeoutMinutes}m {t('Timeout', 'सत्र')}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Site Settings & Database Backup', 'साइट सेटिङ तथा ब्याकअप')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Configure session security rules, emergency PIN, and download authoritative JSON backups.',
                  'सत्र समयसीमा, आपतकालीन पिन, र सम्पूर्ण डाटाबेस ब्याकअप व्यवस्थापन गर्नुहोस्।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 font-mono">
              <span>Lockout: {securityConfig.maxLoginAttempts} attempts</span>
              <span>•</span>
              <span>100% JSON Backup Ready</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('sys_settings')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#1E40AF] hover:text-white dark:bg-slate-800 dark:hover:bg-[#1E40AF] text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('Open Site Settings & Backup', 'साइट सेटिङ खोल्नुहोस्')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pillar 4: Audit Logs */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-[#1E40AF]/50 transition space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                {auditLogs.length} {t('Logs Recorded', 'लग रेकर्ड')}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Security Audit Logs & Trail', 'सुरक्षा अडिट लग तथा इतिहास')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t(
                  'Inspect all authentication events, administrative actions, and data changes in real time.',
                  'प्रशासक लगइन, सामग्री परिवर्तन र प्रणाली घटनाहरूको पूर्ण अडिट लग।'
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1 font-mono">
              <span>Real-Time Audit Trail</span>
              <span>•</span>
              <span>Export to JSON / CSV</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('sys_audit')}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#1E40AF] hover:text-white dark:bg-slate-800 dark:hover:bg-[#1E40AF] text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('View Audit Logs', 'अडिट लग हेर्नुहोस्')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Security Activity Stream */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1E40AF]" />
            <span>{t('Recent Security & System Events', 'ताजा प्रणाली तथा सुरक्षा गतिविधि')}</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('sys_audit')}
            className="text-xs font-bold text-[#1E40AF] hover:underline"
          >
            {t('View All Audit Logs →', 'सबै अडिट लग हेर्नुहोस् →')}
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentLogs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    log.status === 'success'
                      ? 'bg-emerald-500'
                      : log.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                  @{log.actor}
                </span>
                <span className="font-mono text-[11px] text-[#1E40AF] dark:text-blue-400">
                  {log.action}
                </span>
                <span className="text-slate-500 truncate hidden sm:inline">
                  {log.details}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
