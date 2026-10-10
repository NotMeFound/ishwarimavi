import React, { useState } from 'react';
import {
  Language,
  SecurityAuditLogEntry
} from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  RotateCcw,
  UserCheck,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface AdminAuditLogsTabProps {
  lang: Language;
  auditLogs: SecurityAuditLogEntry[];
  onClearAuditLogs: () => void;
  onAddAuditLog: (log: Omit<SecurityAuditLogEntry, 'id' | 'timestamp'>) => void;
  onShowToast: (msg: string) => void;
  isSuperAdmin: boolean;
  currentUsername: string;
}

export const AdminAuditLogsTab: React.FC<AdminAuditLogsTabProps> = ({
  lang,
  auditLogs,
  onClearAuditLogs,
  onAddAuditLog,
  onShowToast,
  isSuperAdmin,
  currentUsername
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'success' | 'warning' | 'danger'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

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

  // Modules list from existing logs
  const modules = Array.from(new Set(auditLogs.map(l => l.module || 'SYSTEM').filter(Boolean)));

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    if (severityFilter !== 'all' && log.status !== severityFilter) return false;
    if (moduleFilter !== 'all' && (log.module || 'SYSTEM') !== moduleFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.module && log.module.toLowerCase().includes(q))
    );
  });

  // Calculate telemetry stats
  const totalCount = auditLogs.length;
  const successCount = auditLogs.filter(l => l.status === 'success').length;
  const warningCount = auditLogs.filter(l => l.status === 'warning').length;
  const dangerCount = auditLogs.filter(l => l.status === 'danger').length;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(t('Audit logs exported as JSON archive.', 'अडिट लग JSON फाइलमा डाउनलोड भयो।'));
  };

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Module', 'Status', 'Details'];
    const rows = auditLogs.map(l => [
      `"${l.timestamp || ''}"`,
      `"${l.actor || ''}"`,
      `"${l.role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.module || ''}"`,
      `"${l.status || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `security_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(t('Audit logs exported as CSV spreadsheet.', 'अडिट लग CSV फाइलमा डाउनलोड भयो।'));
  };

  const handleConfirmClearLogs = () => {
    if (!isSuperAdmin) {
      onShowToast(t('Only Super Administrators are permitted to purge audit logs.', 'सुपर प्रशासकले मात्र लग मेटाउन सक्छन्।'));
      return;
    }

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Purge Audit Log Trail', 'अडिट लग इतिहास मेटाउनुहोस्'),
      description: t(
        'Are you sure you want to completely purge all recorded security audit records? This action cannot be reversed.',
        'के तपाईं सबै सुरक्षा अडिट लगहरू पूर्ण रूपमा मेटाउन निश्चित हुनुहुन्छ? यो कार्य उल्टाउन सकिँदैन।'
      ),
      itemName: `${auditLogs.length} audit records`,
      confirmText: t('Purge All Logs', 'सबै लग मेटाउनुहोस्'),
      action: () => {
        onClearAuditLogs();
        onAddAuditLog({
          action: 'AUDIT_LOG_PURGED',
          actor: currentUsername,
          role: 'super_admin',
          module: 'AUDIT_TRAIL',
          status: 'warning',
          result: 'success',
          details: `Super Administrator @${currentUsername} purged the security audit trail.`
        });
        onShowToast(t('Audit log trail purged successfully.', 'अडिट लग सफलतापूर्वक मेटाइयो।'));
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#1E40AF]" />
            <span>{t('Security Audit Logs & Compliance Trail', 'सुरक्षा अडिट लग तथा अनुपालन इतिहास')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Real-time tamper-evident tracking of all administrator logins, content edits, and system events.',
              'सम्पूर्ण प्रशासक गतिविधि, सामग्री सम्पादन र प्रणाली परिवर्तनहरूको आधिकारिक अडिट लग।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('Export JSON', 'JSON डाउनलोड')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('Export CSV', 'CSV डाउनलोड')}</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleConfirmClearLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold transition border border-red-200 dark:border-red-800/80 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('Purge Logs', 'लग मेटाउनुहोस्')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{t('Total Events', 'कुल लग संख्या')}</span>
            <Activity className="w-4 h-4 text-[#1E40AF]" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{t('Successful Ops', 'सफल कार्यहरू')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{successCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{t('Warnings', 'चेतावनीहरू')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">{warningCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">{t('Security Alerts', 'सुरक्षा सतर्कता')}</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 font-mono">{dangerCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('Search by action, actor, or details...', 'खोजी गर्नुहोस्...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setSeverityFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                severityFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('All Severity', 'सबै')}
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('success')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                severityFilter === 'success'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('Success', 'सफल')}
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('warning')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                severityFilter === 'warning'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('Warning', 'चेतावनी')}
            </button>
            <button
              type="button"
              onClick={() => setSeverityFilter('danger')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                severityFilter === 'danger'
                  ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('Alert', 'खतरा')}
            </button>
          </div>

          {/* Module Filter */}
          {modules.length > 0 && (
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              aria-label="Filter audit logs by module"
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            >
              <option value="all">{t('All Modules', 'सबै मोड्युलहरू')}</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <ClipboardList className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {t('No audit entries match the current filter.', 'कुनै अडिट लग भेटिएन।')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3">{t('Timestamp', 'समय')}</th>
                  <th className="px-4 py-3">{t('Actor', 'प्रयोगकर्ता')}</th>
                  <th className="px-4 py-3">{t('Action', 'कार्य')}</th>
                  <th className="px-4 py-3">{t('Module', 'मोड्युल')}</th>
                  <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                  <th className="px-4 py-3">{t('Details', 'विवरण')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        @{log.actor}
                      </span>
                      {log.role && (
                        <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {log.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-[#1E40AF] dark:text-blue-400">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                        {log.module || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : log.status === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === 'success'
                              ? 'bg-emerald-500'
                              : log.status === 'warning'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-300 text-xs">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
