import React, { useState, useEffect } from 'react';
import { Language, SiteCustomizerConfig, CampusWeatherConfig } from '../../types';
import { defaultWeatherConfig } from '../../data/schoolData';
import { getApiUrl } from '../../services/apiClient';
import { Weather } from '../../components/Weather';
import {
  CloudSun,
  Save,
  RotateCcw,
  Sliders,
  Compass,
  BellRing,
  Eye,
  Radio,
  Clock
} from 'lucide-react';

interface CampusWeatherManagerTabProps {
  lang: Language;
  siteConfig: SiteCustomizerConfig;
  onUpdateSiteConfig: (config: SiteCustomizerConfig) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onAddAuditLog?: (log: any) => void;
  isSuperAdmin?: boolean;
}

const PRESET_COORDINATES = [
  { name: 'Baijanath-5, Banke (Campus)', lat: 28.2167, lon: 81.6033 },
  { name: 'Nepalgunj City Center', lat: 28.0500, lon: 81.6167 },
  { name: 'Kohalpur Junction', lat: 28.1833, lon: 81.6833 }
];

export const CampusWeatherManagerTab: React.FC<CampusWeatherManagerTabProps> = ({
  lang,
  siteConfig,
  onUpdateSiteConfig,
  onShowToast,
  onAddAuditLog
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [form, setForm] = useState<CampusWeatherConfig>(() => ({
    ...defaultWeatherConfig,
    ...(siteConfig.weather || {})
  }));

  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (siteConfig.weather) {
      setForm({
        ...defaultWeatherConfig,
        ...siteConfig.weather
      });
    }
  }, [siteConfig.weather]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedConfig: SiteCustomizerConfig = {
        ...siteConfig,
        weather: form
      };
      onUpdateSiteConfig(updatedConfig);
      onShowToast(t('Campus Weather settings saved successfully!', 'क्याम्पस मौसम सेटिङ सफलतापूर्वक सुरक्षित गरियो!'), 'success');
      if (onAddAuditLog) {
        onAddAuditLog({
          action: 'UPDATE_WEATHER_CONFIG',
          module: 'SiteSettings',
          description: `Updated Campus Weather config (Enabled: ${form.enabled}, Lat: ${form.latitude}, Lon: ${form.longitude})`,
          severity: 'low'
        });
      }
    } catch (err: any) {
      onShowToast(t(`Failed to save: ${err?.message}`, `सुरक्षित गर्न सकिएन: ${err?.message}`), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultWeatherConfig });
    onShowToast(t('Reset to default Banke coordinates and configurations.', 'पूर्वनिर्धारित बाँके सेटिङमा पुनर्स्थापित गरियो।'), 'info');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const start = Date.now();
      // Try server proxy first
      const proxyUrl = getApiUrl(`/api/weather?latitude=${form.latitude}&longitude=${form.longitude}`);
      let res = await fetch(proxyUrl);
      let isProxy = true;

      if (!res.ok) {
        // Fallback to direct Open-Meteo
        isProxy = false;
        const directUrl = `https://api.open-meteo.com/v1/forecast?latitude=${form.latitude}&longitude=${form.longitude}&current=temperature_2m,relative_humidity_2m&timezone=Asia%2FKathmandu`;
        res = await fetch(directUrl);
      }

      const latency = Date.now() - start;
      if (res.ok) {
        const json = await res.json();
        const cur = json.data?.current || json.current;
        setTestResult(
          t(
            `Connection verified (${isProxy ? 'Server Proxy' : 'Direct API'})! Temp: ${cur?.temperature_2m}°C, Humidity: ${cur?.relative_humidity_2m}% (${latency}ms latency)`,
            `सम्पर्क सफल (${isProxy ? 'सर्भर प्रोक्सी' : 'प्रत्यक्ष एपीआई'})! वर्तमान तापक्रम: ${cur?.temperature_2m}°C, आद्रता: ${cur?.relative_humidity_2m}% (${latency}ms)`
          )
        );
        onShowToast(t('Weather connection verified successfully!', 'मौसम सेवा सम्पर्क सफल!'), 'success');
      } else {
        setTestResult(t(`Error: Service returned HTTP ${res.status}`, `त्रुटि: सेवाबाट HTTP ${res.status} प्राप्त भयो`));
        onShowToast(t('API test failed', 'जाँच असफल'), 'error');
      }
    } catch (err: any) {
      setTestResult(t(`Connection failed: ${err?.message}`, `सम्पर्क हुन सकेन: ${err?.message}`));
      onShowToast(t('Connection test failed', 'सम्पर्क जाँच असफल'), 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t('Campus Weather Management', 'क्याम्पस मौसम विजेट व्यवस्थापन')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${form.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                {form.enabled ? t('Active', 'सक्रिय') : t('Disabled', 'निष्क्रिय')}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              {t(
                'Configure live Open-Meteo atmospheric updates, campus coordinates, auto-refresh frequency, and severe weather emergency notices.',
                'विद्यालयको गृहपृष्ठमा देखिने प्रत्यक्ष मौसम, भौगोलिक निर्देशांक र मौसम संकट सूचना व्यवस्थापन गर्नुहोस्।'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Reset Defaults', 'पूर्वनिर्धारित')}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? t('Saving...', 'सुरक्षित गर्दै...') : t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्')}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Homepage Display & General Settings */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
              <span>{t('Display & Refresh Settings', 'प्रदर्शन तथा अद्यावधिक सेटिङ')}</span>
            </h3>

            {/* Toggle Enable */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {t('Enable Weather Widget on Homepage', 'गृहपृष्ठमा मौसम विजेट देखाउनुहोस्')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t('Displays real-time Banke weather in the notice board sidebar', 'सूचना पाटीको छेउमा प्रत्यक्ष मौसम देखाउँछ')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E40AF]" />
              </label>
            </div>

            {/* Temperature Unit & Auto Refresh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Temperature Unit', 'तापक्रम एकाइ')}
                </label>
                <select
                  value={form.temperatureUnit}
                  onChange={(e) => setForm(prev => ({ ...prev, temperatureUnit: e.target.value as any }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                >
                  <option value="celsius">Celsius (°C) - {t('Metric / Standard', 'नेपाल मानक')}</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#1E40AF] dark:text-blue-400" />
                  <span>{t('Auto-Refresh Frequency', 'स्वतः अद्यावधिक समय')}</span>
                </label>
                <select
                  value={form.autoRefreshMinutes}
                  onChange={(e) => setForm(prev => ({ ...prev, autoRefreshMinutes: Number(e.target.value) }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                >
                  <option value={15}>{t('Every 15 minutes', 'प्रत्येक १५ मिनेट')}</option>
                  <option value={30}>{t('Every 30 minutes (Recommended)', 'प्रत्येक ३० मिनेट (सिफारिस)')}</option>
                  <option value={60}>{t('Every 60 minutes', 'प्रत्येक १ घण्टा')}</option>
                </select>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showForecast}
                  onChange={(e) => setForm(prev => ({ ...prev, showForecast: e.target.checked }))}
                  className="rounded text-[#1E40AF]"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {t('Show 3-Day Forecast Strip', '३ दिने मौसम पूर्वानुमान पट्टी देखाउनुहोस्')}
                </span>
              </label>

              <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showAtmosphericDetails}
                  onChange={(e) => setForm(prev => ({ ...prev, showAtmosphericDetails: e.target.checked }))}
                  className="rounded text-[#1E40AF]"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {t('Show Humidity & Wind Speed', 'आद्रता र हावाको गति देखाउनुहोस्')}
                </span>
              </label>
            </div>
          </div>

          {/* Card 2: Campus Coordinates & Geographical Coordinates */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
                <span>{t('Campus Geographical Coordinates', 'भौगोलिक निर्देशांक तथा ठेगाना')}</span>
              </h3>
            </div>

            {/* Preset shortcuts */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 block">
                {t('Quick Presets:', 'द्रुत छनौट:')}
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COORDINATES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setForm(prev => ({ ...prev, latitude: preset.lat, longitude: preset.lon }));
                      onShowToast(t(`Applied coordinates for ${preset.name}`, `${preset.name} को निर्देशांक लागू गरियो`), 'info');
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-[#1E40AF] dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 transition cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Latitude (°N)', 'अक्षांश (Latitude)')}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.latitude}
                  onChange={(e) => setForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="28.2167"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Longitude (°E)', 'देशान्तर (Longitude)')}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.longitude}
                  onChange={(e) => setForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="81.6033"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Location Title (English)', 'स्थान नाम (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={form.locationNameEn}
                  onChange={(e) => setForm(prev => ({ ...prev, locationNameEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="Banke, Nepal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Location Title (Nepali)', 'स्थान नाम (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={form.locationNameNp}
                  onChange={(e) => setForm(prev => ({ ...prev, locationNameNp: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="बाँके, नेपाल"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Campus Area (English)', 'परिसर क्षेत्र (अंग्रेजी)')}
                </label>
                <input
                  type="text"
                  value={form.subLocationEn}
                  onChange={(e) => setForm(prev => ({ ...prev, subLocationEn: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="Baijanath-5 Campus Area"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t('Campus Area (Nepali)', 'परिसर क्षेत्र (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={form.subLocationNp}
                  onChange={(e) => setForm(prev => ({ ...prev, subLocationNp: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                  placeholder="बैजनाथ-५ विद्यालय परिसर"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Severe Weather & Emergency Notice Broadcast */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('Severe Weather & Campus Advisory Notice', 'मौसम संकट तथा आकस्मिक परामर्श सूचना')}</span>
            </h3>

            {/* Toggle show advisory */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {t('Broadcast Advisory Banner', 'मौसम सूचना ब्यानर प्रसारण गर्नुहोस्')}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t('Displays prominent advisory notice inside the weather widget', 'मौसम विजेटको माथिल्लो भागमा परामर्श सूचना देखाउँछ')}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.showAdvisory}
                  onChange={(e) => setForm(prev => ({ ...prev, showAdvisory: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>

            {form.showAdvisory && (
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {t('Advisory Alert Level', 'परामर्श सूचनाको स्तर')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'info', labelEn: 'Info (Blue)', labelNp: 'सामान्य सूचना', color: 'border-blue-500 text-blue-700' },
                      { id: 'warning', labelEn: 'Warning (Amber)', labelNp: 'मौसम चेतावनी', color: 'border-amber-500 text-amber-700' },
                      { id: 'emergency', labelEn: 'Emergency (Red)', labelNp: 'संकट / बिदा', color: 'border-red-500 text-red-700' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, advisoryType: type.id as any }))}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                          form.advisoryType === type.id
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750'
                        }`}
                      >
                        {t(type.labelEn, type.labelNp)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {t('Advisory Text (English)', 'परामर्श व्यहोरा (अंग्रेजी)')}
                  </label>
                  <input
                    type="text"
                    value={form.customAdvisoryNoticeEn || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, customAdvisoryNoticeEn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                    placeholder="e.g. Heavy rainfall forecasted. Morning assembly will be conducted inside the auditorium."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {t('Advisory Text (Nepali)', 'परामर्श व्यहोरा (नेपाली)')}
                  </label>
                  <input
                    type="text"
                    value={form.customAdvisoryNoticeNp || ''}
                    onChange={(e) => setForm(prev => ({ ...prev, customAdvisoryNoticeNp: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-[#1E40AF]"
                    placeholder="जस्तै: निरन्तर वर्षाको सम्भावना रहेकोले बिहानको प्रार्थना हलभित्र सञ्चालन हुनेछ।"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Preview & Endpoint Connectivity (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#1E40AF] dark:text-blue-400" />
                <span>{t('Live Interactive Widget Preview', 'प्रत्यक्ष विजेट पूर्वावलोकन')}</span>
              </h3>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 text-[#1E40AF] dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 transition disabled:opacity-50 cursor-pointer"
              >
                <Radio className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{t('Test API', 'एपीआई जाँच')}</span>
              </button>
            </div>

            {testResult && (
              <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-[#1E40AF] dark:text-blue-300">
                {testResult}
              </div>
            )}

            {/* Embedded Live Weather Component */}
            <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <Weather lang={lang} config={form} />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                {t('Open-Meteo Integration Notes:', 'मौसम सेवा विवरण:')}
              </span>
              <p className="leading-relaxed">
                {t(
                  'The weather widget uses the Open-Meteo free API without requiring any secret keys. It queries temperature, feels-like temperature, humidity, wind velocity, and a 3-day forecast based on your school coordinates.',
                  'यो विजेटले कुनै पनि एपीआई कुञ्जी (API key) विना खुला मौसम सेवा प्रयोग गर्दछ। विद्यालयको भौगोलिक निर्देशांक परिवर्तन गरेर जुनसुकै स्थानको प्रत्यक्ष मौसम हेर्न सकिन्छ।'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusWeatherManagerTab;
