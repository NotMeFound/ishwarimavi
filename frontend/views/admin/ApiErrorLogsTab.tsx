import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { apiClient, ApiErrorLogItem, ApiHealthStatus, getApiUrl } from '../../services/apiClient';
import {
  AlertTriangle,
  ServerCrash,
  RefreshCw,
  Trash2,
  Copy,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe,
  Radio,
  FileCode2,
  Play
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface ApiErrorLogsTabProps {
  lang: Language;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  isSuperAdmin?: boolean;
}

export const ApiErrorLogsTab: React.FC<ApiErrorLogsTabProps> = ({
  lang,
  onShowToast,
  isSuperAdmin = true
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [logs, setLogs] = useState<ApiErrorLogItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<ApiHealthStatus | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isRetryingEndpoint, setIsRetryingEndpoint] = useState<string | null>(null);

  // Subscribe to live error logs
  useEffect(() => {
    const unsubscribe = apiClient.onErrorLogsChange((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  const handleTestHealth = async () => {
    setIsTestingHealth(true);
    try {
      const res = await apiClient.testHealth();
      setHealthResult(res);
      if (res.status === 'connected') {
        onShowToast(t('Backend health check successful: API is online.', 'ब्याकइन्ड एपीआई सफल रूपमा सञ्चालनमा छ।'), 'success');
      } else {
        onShowToast(t(`Backend health check failed: ${res.message}`, `एपीआई जाँच असफल: ${res.message}`), 'error');
      }
    } catch (err: any) {
      onShowToast(t(`Health test error: ${err?.message}`, `जाँच त्रुटि: ${err?.message}`), 'error');
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleSimulateError = async () => {
    try {
      onShowToast(t('Simulating test API request to /api/diagnostics-test-404...', 'परीक्षण अनुरोध पठाउँदै...'), 'info');
      const testUrl = getApiUrl('/api/diagnostics-test-404');
      const res = await fetch(testUrl, { method: 'GET' });
      const snippet = await res.text();
      apiClient.recordErrorLog({
        endpoint: '/api/diagnostics-test-404',
        method: 'GET',
        status: res.status,
        statusText: res.statusText || 'Not Found',
        message: `HTTP ${res.status} Diagnostic Test Endpoint`,
        details: 'Simulated diagnostic call to test Vercel edge capturing and error log inspection.',
        responseBodySnippet: snippet.substring(0, 300)
      });
      onShowToast(t('Captured simulated request in error log.', 'परीक्षण अनुरोध त्रुटि लगमा दर्ता गरियो।'), 'success');
    } catch (err: any) {
      apiClient.recordErrorLog({
        endpoint: '/api/diagnostics-test-404',
        method: 'GET',
        status: 'NETWORK_ERROR',
        message: err?.message || 'Network connection failed',
        details: 'Browser could not establish connection to the endpoint.'
      });
      onShowToast(t('Captured network error in log.', 'नेटवर्क त्रुटि लगमा दर्ता गरियो।'), 'info');
    }
  };

  const handleRetryEndpoint = async (endpoint: string, method: string) => {
    setIsRetryingEndpoint(endpoint);
    try {
      const targetUrl = getApiUrl(endpoint);
      const res = await fetch(targetUrl, {
        method: method || 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const snippet = await res.text();
      if (res.ok) {
        onShowToast(t(`Live test passed: ${endpoint} returned HTTP ${res.status}`, `परीक्षण सफल: ${endpoint} ले HTTP ${res.status} दियो`), 'success');
      } else {
        apiClient.recordErrorLog({
          endpoint,
          method,
          status: res.status,
          statusText: res.statusText,
          message: `Live Retest: HTTP ${res.status}`,
          details: 'Retest initiated from API Error Log tab.',
          responseBodySnippet: snippet.substring(0, 300)
        });
        onShowToast(t(`Live test failed: ${endpoint} returned HTTP ${res.status}`, `परीक्षण असफल: ${endpoint} ले HTTP ${res.status} दियो`), 'error');
      }
    } catch (err: any) {
      apiClient.recordErrorLog({
        endpoint,
        method,
        status: 'NETWORK_ERROR',
        message: err?.message || 'Live Retest Failed',
        details: 'Network error while attempting to reach endpoint.'
      });
      onShowToast(t(`Connection error testing ${endpoint}`, `सम्पर्क त्रुटि`), 'error');
    } finally {
      setIsRetryingEndpoint(null);
    }
  };

  const handleCopyDiagnostics = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'Unknown',
      recentErrorsCount: logs.length,
      recentErrors: logs
    };
    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => onShowToast(t('Diagnostic report copied to clipboard!', 'निदान रिपोर्ट प्रतिलिपि गरियो!'), 'success'))
      .catch(() => onShowToast(t('Failed to copy to clipboard', 'प्रतिलिपि गर्न सकिएन'), 'error'));
  };

  const handleClearConfirm = () => {
    apiClient.clearErrorLogs();
    setShowClearModal(false);
    onShowToast(t('API Error logs cleared successfully.', 'एपीआई त्रुटि लग खाली गरियो।'), 'info');
  };

  const vercelErrorCount = logs.filter(l => l.isVercelError).length;

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Diagnostics Summary Bar */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('API Error Log & Vercel Diagnostics', 'एपीआई त्रुटि लग तथा डिबग')}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {t(`Last ${logs.length} Errors`, `पछिल्लो ${logs.length} त्रुटि`)}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {t(
                    'Real-time frontend capture of failed HTTP and network calls to diagnose Vercel edge 404s, CORS policies, and serverless bundle issues.',
                    'भर्सेल (Vercel) तथा ब्याकइन्डमा देखा परेका ४०४ र नेटवर्क त्रुटिहरूको विस्तृत विवरण।'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestHealth}
              disabled={isTestingHealth}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <Activity className={`w-3.5 h-3.5 ${isTestingHealth ? 'animate-spin' : ''}`} />
              <span>{t('Ping /api/health', 'हेल्थ परीक्षण')}</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateError}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title={t('Test error recording with a mock 404 request', 'परीक्षण ४०४ अनुरोध पठाउनुहोस्')}
            >
              <Play className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('Simulate 404', 'परीक्षण ४०४')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDiagnostics}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('Copy JSON', 'प्रतिलिपि')}</span>
            </button>

            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('Clear Logs', 'लग हटाउनुहोस्')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Diagnostic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t('Captured Failed Requests', 'दर्ता भएका त्रुटिहरू')}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                {logs.length}
              </span>
            </div>
            <div className={`p-2 rounded-lg ${logs.length > 0 ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}>
              <ServerCrash className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t('Vercel Edge 404 / Route Issues', 'भर्सेल ४०४ समस्याहरू')}
              </span>
              <span className={`text-xl font-bold font-mono ${vercelErrorCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                {vercelErrorCount}
              </span>
            </div>
            <div className={`p-2 rounded-lg ${vercelErrorCount > 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <Globe className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                {t('Backend Service Status', 'ब्याकइन्ड स्थिति')}
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${healthResult?.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                <span>{healthResult?.status === 'connected' ? t('Connected / Online', 'सञ्चालनमा छ') : t('Monitoring Active', 'सक्रिय निगरानी')}</span>
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Radio className="w-4 h-4" />
            </div>
          </div>
        </div>

        {healthResult && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${healthResult.status === 'connected' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
            <div className="flex items-center gap-2">
              {healthResult.status === 'connected' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{healthResult.message}</span>
            </div>
            {healthResult.timestamp && (
              <span className="text-[10px] font-mono opacity-75 shrink-0">
                {new Date(healthResult.timestamp).toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Vercel Architecture Reference Card */}
      <div className="p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3">
        <div className="flex items-start gap-2.5">
          <FileCode2 className="w-4 h-4 text-[#1E40AF] dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white">
              {t('How Vercel Routing & Serverless Execution Works', 'भर्सेल (Vercel) मा एपीआई तथा सर्भरलेस कार्यप्रणाली')}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {t(
                'On Vercel, requests to /api/* are served by pre-bundled serverless functions (api/index.js and api/[...slug].js). All non-API routes serve the SPA frontend via index.html. If an edge proxy returns "The page could not be found", this error log captures the raw response so you can verify if a function timed out or an endpoint was unreachable.',
                'भर्सेलमा /api/* अन्तर्गतका अनुरोधहरू pre-bundled serverless function बाट सञ्चालन हुन्छन्। यदि कहिले ४०४ वा "The page could not be found" आएमा, यस लगमा त्यसको वास्तविक प्राविधिक कारण हेर्न सकिन्छ।'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Error Log List (Last 10 Items) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('Recent Failed Requests (Max 10)', 'पछिल्लो असफल अनुरोधहरू (अधिकतम १०)')}
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {logs.length > 0 ? t(`${logs.length} records available`, `${logs.length} रेकर्डहरू`) : t('Log empty', 'लग खाली')}
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('No API Errors Recorded', 'कुनै एपीआई त्रुटि भेटिएन')}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t(
                  'All recent API calls to the backend have responded normally with HTTP 200/OK. Any upcoming failed requests will automatically be captured and inspected here.',
                  'सबै हालैका एपीआई कलहरू सफलतापूर्वक सम्पन्न भएका छन्।'
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.slice(0, 10).map((log, index) => {
              const isExpanded = expandedId === log.id;
              const is404 = String(log.status) === '404';
              const is500 = typeof log.status === 'number' && log.status >= 500;
              const isNetwork = log.status === 'NETWORK_ERROR';

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  {/* Card Header / Summary Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-400 w-5 shrink-0 text-center">
                        #{index + 1}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold shrink-0 ${
                          is404
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50'
                            : is500
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900/50'
                            : isNetwork
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isNetwork ? 'NET ERROR' : `HTTP ${log.status}`}
                      </span>

                      {/* Method + Endpoint */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            <span className="text-[#1E40AF] dark:text-blue-400 mr-1.5">{log.method}</span>
                            {log.endpoint}
                          </span>

                          {log.isVercelError && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40">
                              Vercel 404 / Edge
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-0.5">
                          {log.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs text-slate-400">
                      <span className="font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Diagnostic Detail Drawer */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3.5 text-xs">
                      {/* Technical Breakdown */}
                      <div className="space-y-1">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block">
                          {t('Diagnostic Root Cause Analysis:', 'प्राविधिक समस्या विश्लेषण:')}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                          {log.details || log.message}
                        </p>
                      </div>

                      {/* Request Payload Snippet if present */}
                      {log.requestPayloadSnippet && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">
                            {t('Request Parameters / Payload:', 'अनुरोध प्यारामिटरहरू:')}
                          </span>
                          <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto">
                            {log.requestPayloadSnippet}
                          </pre>
                        </div>
                      )}

                      {/* Raw Response Snippet if present */}
                      {log.responseBodySnippet && (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block">
                            {t('Raw Response Body Snippet:', 'सर्भरबाट प्राप्त प्रतिक्रिया:')}
                          </span>
                          <pre className="p-2.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-[10px] overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                            {log.responseBodySnippet}
                          </pre>
                        </div>
                      )}

                      {/* Action Bar for this error */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-mono text-slate-400">
                          ID: {log.id} • {new Date(log.timestamp).toISOString()}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRetryEndpoint(log.endpoint, log.method)}
                          disabled={isRetryingEndpoint === log.endpoint}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isRetryingEndpoint === log.endpoint ? 'animate-spin text-[#1E40AF]' : ''}`} />
                          <span>{t('Re-test Endpoint', 'पुनः परीक्षण')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clearing Error Logs */}
      <ConfirmationModal
        isOpen={showClearModal}
        title={t('Clear API Error Logs?', 'त्रुटि लग मेटाउने निश्चित हुनुहुन्छ?')}
        description={t(
          'Are you sure you want to clear all captured API error records? This action cannot be undone.',
          'के तपाईं हाल दर्ता भएका सबै एपीआई त्रुटि लगहरू मेटाउन चाहनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।'
        )}
        confirmText={t('Clear Logs', 'लग मेटाउनुहोस्')}
        cancelText={t('Cancel', 'रद्द गर्नुहोस्')}
        onConfirm={handleClearConfirm}
        onClose={() => setShowClearModal(false)}
        variant="delete"
      />
    </div>
  );
};

export default ApiErrorLogsTab;
