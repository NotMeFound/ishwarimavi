import React, { useRef, useState } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  StaffMember,
  Facility,
  AcademicProgram,
  DocumentItem,
  ContactMessage,
  SchoolEvent,
  Achievement,
  HistoryItem,
  GalleryItem,
  SiteCustomizerConfig,
  SecurityConfig
} from '../../types';
import {
  Download,
  Upload,
  Database,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  FileJson
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';

interface BackupRestoreTabProps {
  lang: Language;
  school: SchoolData;
  notices: Notice[];
  staff: StaffMember[];
  facilities: Facility[];
  programs: AcademicProgram[];
  documents: DocumentItem[];
  messages: ContactMessage[];
  events: SchoolEvent[];
  achievements: Achievement[];
  history: HistoryItem[];
  gallery: GalleryItem[];
  siteConfig: SiteCustomizerConfig;
  securityConfig: SecurityConfig;
  onRestoreAllData: (data: any) => void;
  onResetFactory: () => void;
  onShowToast: (msg: string) => void;
}

export const BackupRestoreTab: React.FC<BackupRestoreTabProps> = ({
  lang,
  school,
  notices,
  staff,
  facilities,
  programs,
  documents,
  messages,
  events,
  achievements,
  history,
  gallery,
  siteConfig,
  securityConfig,
  onRestoreAllData,
  onResetFactory,
  onShowToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

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

  const executeExportJson = () => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      institution: school.name_en,
      school,
      notices,
      staff,
      facilities,
      programs,
      documents,
      messages,
      events,
      achievements,
      history,
      gallery,
      siteConfig,
      securityConfig,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ishwari_school_full_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast(t('Complete JSON database exported!', 'पूर्ण डाटाबेस JSON फाइल डाउनलोड गरियो!'));
  };

  const handleExportJson = () => {
    setConfirmState({
      isOpen: true,
      variant: 'download',
      title: t('Confirm Database Backup Download', 'डाटाबेस ब्याकअप डाउनलोड पुष्टि गर्नुहोस्'),
      description: t(
        'Are you sure you want to generate and download a complete JSON backup archive of all institutional school records?',
        'के तपाईं विद्यालयका सबै अभिलेख र विवरणहरूको पूर्ण ब्याकअप फाइल डाउनलोड गर्न निश्चित हुनुहुन्छ?'
      ),
      itemName: `ishwari_school_full_backup_${new Date().toISOString().split('T')[0]}.json`,
      confirmText: t('Download Backup', 'ब्याकअप डाउनलोड गर्नुहोस्'),
      action: executeExportJson
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.school && !parsed.notices) {
          throw new Error('Invalid schema format');
        }

        setConfirmState({
          isOpen: true,
          variant: 'update',
          title: t('Confirm Database Restoration', 'डाटाबेस पुनःस्थापना पुष्टि गर्नुहोस्'),
          description: t(
            'Restoring this backup will replace current school data, notices, faculty records, and configurations with the contents of this JSON file. Do you wish to proceed?',
            'यस ब्याकअपलाई पुनःस्थापना गर्दा वर्तमान विद्यालयको सम्पूर्ण तथ्याङ्क प्रतिस्थापन हुनेछ। के तपाईं अगाडि बढ्न चाहनुहुन्छ?'
          ),
          itemName: file.name,
          confirmText: t('Restore Database Now', 'डाटाबेस रिस्टोर गर्नुहोस्'),
          action: () => {
            onRestoreAllData(parsed);
            onShowToast(t('Full database restored successfully!', 'डाटाबेस सफलतापूर्वक पुनःस्थापना गरियो!'));
          }
        });
      } catch (err) {
        onShowToast(t('Failed to parse JSON file. Please ensure valid database backup file.', 'फाइल पढ्न सकिएन। कृपया मान्य JSON डाटाबेस फाइल छान्नुहोस्।'));
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be selected again
    e.target.value = '';
  };

  const handlePromptFactoryReset = () => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Complete Institutional Factory Reset', 'सम्पूर्ण फ्याक्ट्री रिसेट पुष्टि गर्नुहोस्'),
      description: t(
        'CRITICAL WARNING: This will reset all notices, staff profiles, gallery images, achievements, events, and configurations back to default factory settings. Are you absolutely certain?',
        'अत्यन्त संवेदनशील: यस कार्यले सबै सूचना, शिक्षक, ग्यालरी, कार्यक्रम तथा सेटिङहरूलाई सुरुवाती अवस्थामा फर्काउनेछ। के तपाईं साँच्चै निश्चित हुनुहुन्छ?'
      ),
      itemName: t('ALL SYSTEM DATA & RECORDS', 'सम्पूर्ण प्रणाली तथ्याङ्क तथा अभिलेख'),
      confirmText: t('Reset Everything to Defaults', 'सम्पूर्ण डाटा रिसेट गर्नुहोस्'),
      action: () => {
        onResetFactory();
        onShowToast(t('All data reset to initial institutional defaults.', 'सबै तथ्याङ्क सुरुवाती अवस्थामा फर्काइयो।'));
      }
    });
  };

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
      {/* SECTION 1: FULL DATA EXPORT & IMPORT */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3.5">
          <Database className="w-4 h-4 text-[#1E40AF]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('Institutional Data Backup & Restore Engine', 'डाटाबेस ब्याकअप तथा रिस्टोर इन्जिन')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Export or restore all website content, notices, staff, records, configurations and logs with 1 click.', 'सम्पूर्ण वेबसाइटका सामग्री, सूचना, शिक्षक विवरण र सेटिङ १ क्लिकमा सुरक्षित वा रिस्टोर गर्नुहोस्।')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Export Box */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <FileJson className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Export Complete Database (JSON)', 'पूर्ण डाटाबेस डाउनलोड (JSON)')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Generates a standardized JSON package containing school profiles, notices, faculty, programs, events, gallery, and security settings.',
                'विद्यालयको सम्पूर्ण तथ्याङ्क, सूचना, शिक्षक, फोटो र सुरक्षा कन्फिगरेसनलाई एउटै JSON फाइलमा डाउनलोड गर्दछ।'
              )}
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Download Backup (.json)', 'ब्याकअप डाउनलोड गर्नुहोस्')}</span>
            </button>
          </div>

          {/* Import Box */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>{t('Restore Database from Backup', 'ब्याकअपबाट डाटाबेस रिस्टोर')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Upload a previously exported .json file to restore all school records and configurations immediately.',
                'पहिले सुरक्षित गरिएको .json फाइल छनोट गरी सम्पूर्ण तथ्याङ्क तुरुन्त पुनःस्थापना गर्नुहोस्।'
              )}
            </p>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('Select & Restore JSON File', 'JSON फाइल छान्नुहोस्')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: FACTORY RESET DANGER ZONE */}
      <div className="p-6 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
            {t('Danger Zone: Institutional Factory Reset', 'फ्याक्ट्री रिसेट (सावधानी)')}
          </h3>
        </div>
        <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">
          {t(
            'This action resets all edited notices, staff profiles, facilities, achievements, and custom configurations back to original seed data. This cannot be undone unless you have exported a backup JSON file.',
            'यसले सबै सम्पादित सूचना, शिक्षक, फोटो र सेटिङलाई सुरुवाती अवस्थामा फर्काउँछ। यो कार्य गर्नुअघि माथिको ब्याकअप JSON डाउनलोड गर्न सिफारिस गरिन्छ।'
          )}
        </p>

        <button
          type="button"
          onClick={handlePromptFactoryReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('Reset Everything to Defaults', 'सम्पूर्ण डाटा रिसेट गर्नुहोस्')}</span>
        </button>
      </div>
    </div>
  );
};
