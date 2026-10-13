import React, { useState } from 'react';
import { Language, SecurityConfig, SecurityAuditLogEntry } from '../../types';
import {
  ShieldCheck,
  Clock,
  Save,
  ListFilter,
  Trash2,
  Download,
  Link as LinkIcon
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface SecurityTabProps {
  lang: Language;
  securityConfig: SecurityConfig;
  onUpdateSecurityConfig: (config: SecurityConfig) => void;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onShowToast: (msg: string) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  lang,
  securityConfig,
  onUpdateSecurityConfig,
  auditLogs,
  onClearAuditLogs,
  onShowToast,
}) => {
  const [configForm, setConfigForm] = useState<SecurityConfig>({ ...securityConfig });

  // Audit filter
  const [auditFilter, setAuditFilter] = useState<'all' | 'success' | 'warning' | 'danger'>('all');

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
    variant: 'warning',
    action: () => {}
  });

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Confirm Security Configuration Updates', 'सुरक्षा कन्फिगरेसन अद्यावधिक पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to apply these security policies, lockout durations, and secret routing rules?', 'के तपाईं सुरक्षा नियम, लकआउट समय र गुप्त रुटिङ कन्फिगरेसन लागू गर्न निश्चित हुनुहुन्छ?'),
      itemName: t('Security & Access Rules', 'सुरक्षा तथा पहुँच नियम'),
      confirmText: t('Save Security Settings', 'सुरक्षा नियम सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSecurityConfig(configForm);
        onShowToast(t('Security policies & routing configuration saved.', 'सुरक्षा नियम तथा रुटिङ कन्फिगरेसन सुरक्षित गरियो।'));
      }
    });
  };

  const handleExportAuditLogs = () => {
    setConfirmState({
      isOpen: true,
      variant: 'download',
      title: t('Confirm Audit Log Export', 'अडिट लग डाउनलोड पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to export and download the complete security audit trail as JSON?', 'के तपाईं सुरक्षा अडिट लगको सम्पूर्ण फाइल JSON मा डाउनलोड गर्न चाहनुहुन्छ?'),
      itemName: `ishwari_security_audit_${new Date().toISOString().split('T')[0]}.json (${auditLogs.length} entries)`,
      confirmText: t('Download Log Archive', 'लग डाउनलोड गर्नुहोस्'),
      action: () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `ishwari_security_audit_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        onShowToast(t('Security audit logs downloaded.', 'अडिट लग डाउनलोड गरियो।'));
      }
    });
  };

  const handleClearAuditLogsPrompt = () => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Security Audit Log Clear', 'सुरक्षा अडिट लग मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently clear all security audit records? This cannot be recovered.', 'के तपाईं सबै सुरक्षा अडिट लगहरू मेटाउन निश्चित हुनुहुन्छ?'),
      itemName: `${auditLogs.length} ${t('Audit Entries', 'अडिट लगहरू')}`,
      confirmText: t('Clear All Logs', 'लग सफा गर्नुहोस्'),
      action: () => {
        onClearAuditLogs();
        onShowToast(t('Audit logs cleared.', 'अडिट लगहरू मेटाइयो।'));
      }
    });
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.severity === auditFilter;
  });

  return (
    <div className="space-y-8 relative">
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

      {/* SECURITY OVERVIEW BANNER */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4D6BFE]/20 border border-[#4D6BFE]/40 flex items-center justify-center text-[#4D6BFE] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">
              {t('Institutional Grade Security & Access Gateways', 'सुरक्षा तथा पहुँच नियन्त्रण केन्द्र')}
            </h3>
            <p className="text-xs text-slate-400">
              {t('Brute-force protection, configurable admin routing, environment-managed recovery, and an access-controlled audit trail.', 'आक्रमण सुरक्षा, अनुकूलित रुटिङ, वातावरणबाट व्यवस्थापन गरिएको रिकभरी र सुरक्षित अडिट लग।')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/80 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">{t('256-Bit TLS Guard Active', '२५६-बिट सुरक्षा सक्रिय')}</span>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
        <h3 className="font-semibold">{t('Administrator credentials are managed securely', 'प्रशासक प्रमाणहरू सुरक्षित रूपमा व्यवस्थापन गरिन्छ')}</h3>
        <p className="mt-1 text-xs leading-relaxed text-blue-800 dark:text-blue-200">
          {t(
            'Change account passwords through the administrator account controls. The Super Admin recovery secret is configured only in the server environment and is never stored in CMS settings.',
            'खाता नियन्त्रणबाट प्रशासक पासवर्ड परिवर्तन गर्नुहोस्। सुपर एडमिन रिकभरी गोप्य साँचो सर्भर वातावरणमा मात्र राखिन्छ र CMS सेटिङमा सुरक्षित हुँदैन।'
          )}
        </p>
      </div>

      {/* 2. DEDICATED ADMIN ROUTING & STEALTH ACCESS */}
      <form onSubmit={handleSaveSecuritySettings} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <LinkIcon className="w-4 h-4 text-[#4D6BFE]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Custom Admin Route & Stealth Login Link', 'अनुकूलित प्रशासकीय रुटिङ तथा गोप्य लगइन लिङ्क')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure the exact link/hash used to access the admin portal and choose whether it appears in the public header.', 'वेबसाइटमा एडमिन पोर्टल कुन लिङ्कबाट खुल्ने र हेडरमा देखाउने वा नदेखाउने छनोट गर्नुहोस्।')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('Custom Admin Route Slug', 'एडमिन रुट स्लग (Route Slug)')}
              </label>
              <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 overflow-hidden font-mono text-xs">
                <span className="px-3 py-2 text-slate-400 bg-slate-100 dark:bg-slate-900/60 border-r border-slate-300 dark:border-slate-700">
                  yoursite.com/#/
                </span>
                <input
                  type="text"
                  value={configForm.adminRouteSlug}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, adminRouteSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') }))}
                  placeholder="admin-portal"
                  className="w-full px-3 py-2 bg-transparent text-slate-900 dark:text-white focus:outline-hidden font-bold"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {t('Direct link for admin: ', 'एडमिन सिधै लगइन गर्न: ')}
                <span className="font-mono text-[#4D6BFE] font-bold">#{configForm.adminRouteSlug}</span>
              </p>
            </div>

          </div>

          {/* Stealth Mode Checkbox */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-3">
            <input
              type="checkbox"
              id="hide-admin-check"
              checked={configForm.hideAdminLinkInHeader}
              onChange={(e) => setConfigForm(prev => ({ ...prev, hideAdminLinkInHeader: e.target.checked }))}
              className="mt-0.5 w-4 h-4 text-[#4D6BFE] rounded focus:ring-[#4D6BFE]"
            />
            <label htmlFor="hide-admin-check" className="text-xs cursor-pointer space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white block">
                {t('Stealth Mode: Hide Admin Button from Public Header & Navigation', 'गोप्य मोड: सर्वसाधारण प्रयोगकर्ताको हेडरबाट एडमिन बटन लुकाउनुहोस्')}
              </span>
              <span className="text-slate-500 block">
                {t(
                  'When checked, regular visitors will not see the Admin Login button. Only you can access it via URL hash (e.g. #/' + configForm.adminRouteSlug + ') or pressing Ctrl+Shift+A.',
                  'यो विकल्प छान्दा सर्वसाधारणले हेडरमा एडमिन बटन देख्ने छैनन्। केवल प्रत्यक्ष लिङ्क वा Ctrl+Shift+A थिचेर मात्र प्रवेश गर्न सकिनेछ।'
                )}
              </span>
            </label>
          </div>
        </div>

        {/* 3. BRUTE FORCE & SESSION POLICIES */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <Clock className="w-4 h-4 text-[#4D6BFE]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Brute-Force Lockout & Session Policies', 'सुरक्षा थ्रेसहोल्ड तथा सत्र समाप्ति नियम')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('Failed Attempts Threshold', 'असफल प्रयास सीमा')}
              </label>
              <select
                value={configForm.lockoutThreshold}
                onChange={(e) => setConfigForm(prev => ({ ...prev, lockoutThreshold: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={3}>3 Failed Attempts</option>
                <option value={5}>5 Failed Attempts (Recommended)</option>
                <option value={10}>10 Failed Attempts</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('Lockout Penalty Duration', 'खाता लक रहने समय')}
              </label>
              <select
                value={configForm.lockoutDurationMinutes}
                onChange={(e) => setConfigForm(prev => ({ ...prev, lockoutDurationMinutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={3}>3 Minutes</option>
                <option value={5}>5 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('Auto-Logout Inactivity Timeout', 'स्वतः लगआउट समय')}
              </label>
              <select
                value={configForm.sessionTimeoutMinutes}
                onChange={(e) => setConfigForm(prev => ({ ...prev, sessionTimeoutMinutes: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes (Standard)</option>
                <option value={60}>60 Minutes</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4D6BFE] hover:bg-[#3A54E8] text-white text-xs font-bold shadow-md shadow-[#4D6BFE]/25 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Security Policies & Slugs', 'सुरक्षा सेटिङहरू सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 4. REAL-TIME SECURITY AUDIT LOG VIEWER */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-[#4D6BFE]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Live Security & Activity Audit Trail', 'सुरक्षा अडिट लग तथा गतिविधि विवरण')}
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {auditLogs.length} Events
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportAuditLogs}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Export Logs (JSON)', 'लग निर्यात')}</span>
            </button>
            <button
              type="button"
              onClick={handleClearAuditLogsPrompt}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('Clear Logs', 'लग सफा गर्नुहोस्')}</span>
            </button>
          </div>
        </div>

        {/* Audit Filter Pill Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">{t('Filter:', 'फिल्टर:')}</span>
          {(['all', 'success', 'warning', 'danger'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setAuditFilter(sev)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition cursor-pointer ${
                auditFilter === sev
                  ? 'bg-[#4D6BFE] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                <th className="px-4 py-2.5 font-semibold">Actor</th>
                <th className="px-4 py-2.5 font-semibold">Action</th>
                <th className="px-4 py-2.5 font-semibold">Details</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {log.actor}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[#4D6BFE] whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">
                    {log.details}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.severity === 'success'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
