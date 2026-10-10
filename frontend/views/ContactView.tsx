import React, { useState } from 'react';
import { Language, SchoolData, ContactMessage, SiteCustomizerConfig } from '../types';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Building2,
  HelpCircle,
  Share2,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { SocialMediaBar } from '../components/SocialMediaIcons';

interface ContactViewProps {
  lang: Language;
  school: SchoolData;
  siteConfig?: SiteCustomizerConfig;
  onSendMessage?: (msg: ContactMessage) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ lang, school, siteConfig, onSendMessage }) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const socialLinks = siteConfig?.socialLinks || [];
  const mapEmbedUrl = (siteConfig?.footerMapEmbedUrl || school.map_embed_url || '').trim();
  const mapDirectUrl =
    siteConfig?.footerMapUrl ||
    school.map_url ||
    `https://maps.google.com/?q=${encodeURIComponent(school.name_en + ' ' + school.address_en)}`;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'admission',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmedSubmit = () => {
    if (onSendMessage) {
      onSendMessage({
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        date: new Date().toISOString().split('T')[0],
        status: 'new',
      });
    }
    setFormSubmitted(true);
  };

  return (
    <div className="py-12 bg-white dark:bg-slate-950 relative">
      {/* Confirmation Modal for Transmitting Inquiry */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedSubmit}
        variant="create"
        title={t('Confirm Inquiry Submission', 'सन्देश पठाउन पुष्टि गर्नुहोस्')}
        description={t(
          'Are you sure you want to transmit this inquiry to Ishwari Secondary School administrative desk?',
          'के तपाईं यो सन्देश विद्यालय प्रशासनमा पठाउन निश्चित हुनुहुन्छ?'
        )}
        itemName={`${formData.name} (${formData.phone} • ${formData.subject})`}
        confirmText={t('Submit Inquiry', 'सन्देश पठाउनुहोस्')}
        cancelText={t('Review Form', 'फारम पुनरावलोकन गर्नुहोस्')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E40AF]">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('Official Communication Desk', 'सम्पर्क तथा सुझाव')}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('Contact & Grievance Redressal', 'सम्पर्क तथा पृष्ठपोषण')}
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
            {t(
              'Reach out for admission inquiries, academic verification, examination transcripts, or community feedback.',
              'भर्ना, चारित्रिक प्रमाणपत्र, परीक्षासम्बन्धी सोधपुछ वा सुझावका लागि विद्यालय प्रशासन शाखामा सम्पर्क गर्नुहोस्।'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official Contact Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-5 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Administrative Secretariat', 'प्रशासनिक सचिवालय')}</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t('Address', 'ठेगाना')}</p>
                    <p className="text-slate-500 mt-0.5">{t(school.address_en, school.address_np)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t('Telephone / Mobile', 'फोन तथा मोबाइल')}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{school.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t('Official Email', 'आधिकारिक इमेल')}</p>
                    <p className="text-slate-500 font-mono mt-0.5">{school.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#1E40AF]/10 text-[#1E40AF] shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{t('Office Hours', 'कार्यालय समय')}</p>
                    <p className="text-slate-500 mt-0.5">{t('Sunday – Friday: 9:30 AM to 4:30 PM', 'आइतबार देखि शुक्रबार: बिहान ९:३० देखि अपराह्न ४:३० सम्म')}</p>
                    <p className="text-slate-400 text-[11px]">{t('Saturday & Gazetted Holidays: Closed', 'शनिबार तथा सार्वजनिक बिदाका दिन बन्द')}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <p className="font-bold text-[#1E40AF] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('Information Officer (सूचना अधिकारी)', 'सूचना अधिकारी')}</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300 font-medium">{t('Mr. Krishna Bahadur Thapa (Lecturer)', 'श्री कृष्ण बहादुर थापा')}</p>
                <p className="text-slate-500 font-mono text-[11px]">+977-9841234567 • rti@ishwari.edu.np</p>
              </div>

              {/* Official Social Media Channels */}
              {socialLinks.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-bold">
                    <Share2 className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>{t('Official Social Channels', 'आधिकारिक सामाजिक सञ्जाल')}</span>
                  </div>
                  <SocialMediaBar
                    links={socialLinks}
                    lang={lang}
                    size="sm"
                    variant="card"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Online Inquiry & Citizen Feedback Form', 'अनलाइन सोधपुछ तथा नागरिक पृष्ठपोषण फारम')}</span>
              </h2>

              {formSubmitted ? (
                <div className="p-8 rounded-xl bg-[#1E40AF]/10 border border-[#1E40AF]/30 text-slate-900 dark:text-white space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1E40AF] text-white mx-auto flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base">
                    {t('Inquiry Dispatched Successfully!', 'तपाईंको सन्देश सफलतापूर्वक प्राप्त भयो!')}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    {t(
                      'Your inquiry has been stored securely in the school administration database. The administration team will review and respond soon.',
                      'तपाईंको सन्देश विद्यालयको प्रशासनिक प्रणालीमा सुरक्षित रूपमा प्रविष्ट भएको छ।'
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: '', phone: '', email: '', subject: 'admission', message: '' });
                    }}
                    className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white transition cursor-pointer"
                  >
                    {t('Send Another Inquiry', 'अर्को सन्देश पठाउनुहोस्')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Full Name *', 'पूरा नाम *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('e.g. Ram Bahadur Thapa', 'जस्तै: राम बहादुर थापा')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Contact Number *', 'सम्पर्क नम्बर *')}
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="98XXXXXXXX"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Email Address', 'इमेल ठेगाना')}
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Subject / Inquiry Type', 'विषय')}
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs"
                      >
                        <option value="admission">{t('Admission & Registration', 'भर्ना तथा फारम')}</option>
                        <option value="scholarship">{t('Scholarships & Support', 'छात्रवृत्ति')}</option>
                        <option value="transcripts">{t('Character Certificate / Transcripts', 'चारित्रिक प्रमाणपत्र / मार्कसिट')}</option>
                        <option value="general">{t('General Institutional Feedback', 'सामान्य सुझाव तथा पृष्ठपोषण')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Detailed Message / Inquiry *', 'विस्तृत सन्देश वा सोधपुछ *')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t(
                        'Please write your questions or details clearly...',
                        'कृपया आफ्नो सोधपुछ वा विवरण स्पष्ट रूपमा लेख्नुहोस्...'
                      )}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#1E40AF] text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg font-bold text-xs bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-md shadow-[#1E40AF]/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('Transmit Inquiry to Administration', 'सन्देश पठाउनुहोस्')}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Campus Location & Interactive Navigation Section */}
        <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Campus Location & Navigation Directions', 'विद्यालय अवस्थिति तथा दिशानिर्देश')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t(school.address_en, school.address_np)} • {t('Easily accessible by public transit and pedestrian routes.', 'सार्वजनिक यातायात तथा पदमार्गबाट सहज पहुँचयोग्य।')}
              </p>
            </div>
            <a
              href={mapDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{t('Open in Google Maps', 'गुगल म्याप्समा हेर्नुहोस्')}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          {mapEmbedUrl ? (
            <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner">
              <iframe
                title={t('Ishwari Secondary School Campus Map', 'ईश्वरी माध्यमिक विद्यालयको नक्सा')}
                src={mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
              <MapPin className="w-8 h-8 text-[#1E40AF] mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t(school.address_en, school.address_np)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t('Campus coordinates registered under EMIS ' + school.code, 'विद्यालयको EMIS कोड ' + school.code + ' अनुसार दर्ता गरिएको स्थान')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactView;
