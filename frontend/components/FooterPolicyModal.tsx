import React, { useEffect, useState } from 'react';
import { ShieldCheck, FileText, X, CheckCircle2 } from 'lucide-react';
import { Language, SchoolData } from '../types';
import { IconActionButton } from './IconActionButton';

interface FooterPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms';
  lang: Language;
  school: SchoolData;
}

export const FooterPolicyModal: React.FC<FooterPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy',
  lang,
  school,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="footer-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2
                id="footer-policy-title"
                className="text-base font-bold text-slate-900 dark:text-white"
              >
                {activeTab === 'privacy'
                  ? t('Institutional Privacy Policy', 'विद्यालयको गोपनीयता नीति')
                  : t('Website Terms & Information Access Policy', 'वेबसाइट प्रयोगका सर्त तथा सूचना पहुँच नीति')}
              </h2>
              <p className="text-xs text-slate-500">
                {t(school.name_en, school.name_np)} • {t('Official Public Portal Policy', 'आधिकारिक सार्वजनिक नीति')}
              </p>
            </div>
          </div>
          <IconActionButton
            action="close"
            appearance="ghost"
            size="sm"
            onClick={onClose}
            aria-label={t('Close modal', 'बन्द गर्नुहोस्')}
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('Privacy Policy & Data Protection', 'गोपनीयता तथा व्यक्तिगत विवरण संरक्षण')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-[#1E40AF] text-[#1E40AF]'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('Terms of Use & RTI Disclosure', 'प्रयोगका सर्त तथा सूचनाको हक')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('1. Commitment to Student & Community Privacy', '१. विद्यार्थी तथा समुदायको गोपनीयता प्रति प्रतिबद्धता')}
                </h3>
                <p>
                  {t(
                    `${school.name_en} respects the privacy of students, guardians, alumni, faculty, and public visitors. We are committed to safeguarding personal information collected through our official digital platform in strict adherence to national privacy regulations.`,
                    `${school.name_np} यस पोर्टलमा आबद्ध विद्यार्थी, अभिभावक, भूतपूर्व विद्यार्थी, शिक्षक तथा सर्वसाधारणको व्यक्तिगत विवरणको संरक्षण गर्न पूर्ण रूपमा प्रतिबद्ध छ।`
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('2. Information We Collect & Process', '२. सङ्कलन तथा प्रयोग गरिने विवरण')}
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    {t(
                      'Contact inquiries, citizen feedback, and admission information submitted voluntarily via forms.',
                      'सोधपुछ फारम, नागरिक पृष्ठपोषण तथा अनलाइन भर्ना आवेदन मार्फत स्वेच्छिक रूपमा प्रेषित विवरण।'
                    )}
                  </li>
                  <li>
                    {t(
                      'Standard web analytics and technical diagnostics (IP addresses, browser types, session timing) to maintain portal stability and cybersecurity.',
                      'पोर्टलको साइबर सुरक्षा तथा गुणस्तर सुधारका लागि प्रयोग हुने प्राविधिक विवरण।'
                    )}
                  </li>
                  <li>
                    {t(
                      'Academic notices, circulars, and student examination results published under statutory institutional guidelines.',
                      'सार्वजनिक सूचना, परीक्षाफल तथा प्रशासनिक निर्णयहरू।'
                    )}
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('3. Data Security & Storage Protocol', '३. सूचना सुरक्षा तथा भण्डारण प्रणाली')}
                </h3>
                <p>
                  {t(
                    'All sensitive administrative and academic records are protected using authenticated, encrypted cloud storage protocols. Information is never sold, leased, or disclosed to unauthorized commercial third parties.',
                    'सम्पूर्ण प्रशासनिक तथा शैक्षिक अभिलेखहरू सुरक्षित तथा इन्क्रिप्टेड सर्भरमा भण्डारण गरिन्छ। कुनै पनि व्यावसायिक संस्थालाई विवरण उपलब्ध गराइँदैन।'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('4. Contact Information Officer (RTI)', '४. सूचना अधिकारीसँगको सम्पर्क')}
                </h3>
                <p>
                  {t(
                    'For privacy inquiries, personal data corrections, or statutory verification requests, please contact the designated School Information Officer at our administrative desk.',
                    'गोपनीयता वा विवरण सच्याउनेसम्बन्धी कुनै पनि जिज्ञासाका लागि विद्यालयको सूचना अधिकारीसँग सिधै सम्पर्क गर्न सकिन्छ।'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('1. Ownership & Public Purpose', '१. स्वामित्व तथा सार्वजनिक उद्देश्य')}
                </h3>
                <p>
                  {t(
                    `This web portal is the official digital communication platform of ${school.name_en}. All curriculum guides, public notices, circulars, and administrative documents published here serve educational and institutional transparency purposes.`,
                    `यो वेबसाइट ${school.name_np}को आधिकारिक डिजिटल सञ्चार माध्यम हो। यहाँ प्रकाशित सम्पूर्ण सूचना, पाठ्यक्रम तथा सामग्रीहरू शैक्षिक पारदर्शिताका लागि उपलब्ध गराइएका हुन्।`
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('2. Right to Information (RTI) Compliance', '२. सूचनाको हक सम्बन्धी व्यवस्था')}
                </h3>
                <p>
                  {t(
                    'As a public secondary education institution, we adhere to the Right to Information Act of Nepal. Notices, academic curricula, citizen charters, and institutional reports published on this site are open public records.',
                    'सार्वजनिक शैक्षिक संस्था भएकाले हामी सूचनाको हक सम्बन्धी ऐनको पूर्ण पालना गर्दछौं। नागरिक वडापत्र तथा वार्षिक प्रगति विवरण सबैका लागि खुला छन्।'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('3. Accuracy & Acceptable Use', '३. आधिकारिकता तथा प्रयोगको दायरा')}
                </h3>
                <p>
                  {t(
                    'Visitors may view and download forms and educational guidelines for personal and non-commercial educational use. Tampering with digital content, unauthorized access attempts, or misrepresenting official institutional notices is strictly prohibited.',
                    'विद्यार्थी तथा अभिभावकले शैक्षिक प्रयोजनका लागि फारम तथा निर्देशिकाहरू निःशुल्क डाउनलोड गर्न सक्नुहुनेछ। अनाधिकृत फेरबदल वा दुरुपयोग कानुनतः निषेध गरिएको छ।'
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  {t('4. Jurisdiction & Governance', '४. कानुनी क्षेत्राधिकार')}
                </h3>
                <p>
                  {t(
                    `This portal is maintained in accordance with educational directives of the Ministry of Education, Science & Technology (MoEST) and applicable laws of Nepal.`,
                    `यस पोर्टलको सञ्चालन नेपाल सरकारको शिक्षा मन्त्रालय तथा प्रचलित कानुनको अधीनमा रही सम्पन्न गरिन्छ।`
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('Active Institutional Policy', 'लागू गरिएको आधिकारिक नीति')}</span>
          </div>
          <IconActionButton
            action="close"
            onClick={onClose}
            tooltip={t('Close modal', 'बन्द गर्नुहोस्')}
            aria-label={t('Close modal', 'बन्द गर्नुहोस्')}
          />
        </div>
      </div>
    </div>
  );
};
