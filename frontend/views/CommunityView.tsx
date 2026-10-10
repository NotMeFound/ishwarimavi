import React from 'react';
import { Language } from '../types';
import {
  Users,
  Handshake,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Award
} from 'lucide-react';

interface CommunityViewProps {
  lang: Language;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ lang }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  return (
    <div className="py-12 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            <Users className="w-3.5 h-3.5" />
            <span>{t('Social Engagement & Solidarity', 'समुदाय र सहकार्य')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Community, PTA & Alumni Network', 'अभिभावक-शिक्षक संघ तथा पूर्व विद्यार्थी समाज')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'Education thrives in close collaboration with parents, local leaders, and alumni who continually give back to the school.',
              'अभिभावक, स्थानीय समुदाय र पूर्व विद्यार्थीहरूको सक्रिय सहभागितामा अगाडि बढिरहेको हाम्रो विद्यालय।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Parent-Teacher Association (PTA)', 'अभिभावक-शिक्षक संघ')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Ensures constructive dialogue between guardians and teachers regarding learning outcomes, nutrition, and psychological support.',
                'विद्यार्थीको सिकाइ स्तर, अनुशासन र मानसिक विकासबारे नियमित परामर्श तथा त्रैमासिक अभिभावक भेला।'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Ishwari Alumni Association', 'पूर्व विद्यार्थी मञ्च')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Graduates across civil service, engineering, medicine, and entrepreneurship who sponsor merit scholarships and career mentoring.',
                'विगत चार दशकका पूर्व विद्यार्थीहरूद्वारा जेहेन्दार विद्यार्थीहरूलाई छात्रवृत्ति तथा करियर काउन्सिलिङ।'
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3 shadow-2xs hover:border-[#1E40AF]/40 transition">
            <div className="w-10 h-10 rounded-xl bg-[#1E40AF]/10 text-[#1E40AF] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Junior Red Cross & Scout Troop', 'जुनियर रेडक्रस तथा स्काउट')}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {t(
                'Training students in first-aid, disaster preparedness, civic hygiene, blood donation drives, and emergency leadership.',
                'प्राथमिक उपचार, विपद् व्यवस्थापन र सामाजिक सेवामा विद्यार्थीहरूलाई सक्षम बनाउन क्रियाशील।'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityView;
