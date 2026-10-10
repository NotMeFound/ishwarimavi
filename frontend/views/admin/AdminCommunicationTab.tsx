import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  ContactMessage
} from '../../types';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Trash2,
  CheckCircle2,
  Save,
  MessageSquare,
  Search,
  Filter
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';

interface AdminCommunicationTabProps {
  lang: Language;
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  messages: ContactMessage[];
  onUpdateMessages: (msgs: ContactMessage[]) => void;
  onShowToast: (msg: string) => void;
}

export const AdminCommunicationTab: React.FC<AdminCommunicationTabProps> = ({
  lang,
  school,
  onUpdateSchool,
  messages,
  onUpdateMessages,
  onShowToast
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [activeSection, setActiveSection] = useState<'inbox' | 'coordinates'>('inbox');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // School contact form state
  const [contactForm, setContactForm] = useState({
    phone: school.phone,
    email: school.email,
    address_en: school.address_en,
    address_np: school.address_np,
    location_en: school.location_en || 'Ward No. 4, Bagmati Province, Nepal',
    location_np: school.location_np || 'वडा नं. ४, बागमती प्रदेश, नेपाल'
  });

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
    variant: 'delete',
    action: () => {}
  });

  const handleUpdateMessageStatus = (id: number, status: 'reviewed' | 'resolved') => {
    const updated = messages.map(m => m.id === id ? { ...m, status } : m);
    onUpdateMessages(updated);
    onShowToast(t(`Message marked as ${status}.`, `सन्देशको अवस्था ${status} गरियो।`));
  };

  const handleDeleteMessage = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Message', 'सन्देश मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this contact message from the inbox?', 'के तपाईं यस सन्देशलाई इनबक्सबाट हटाउन चाहनुहुन्छ?'),
      itemName: t('Contact Message', 'सम्पर्क सन्देश'),
      confirmText: t('Delete Message', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateMessages(messages.filter(m => m.id !== id));
        onShowToast(t('Message deleted from inbox.', 'सन्देश इनबक्सबाट हटाइयो।'));
      }
    });
  };

  const handleSaveContactCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmState({
      isOpen: true,
      variant: 'update',
      title: t('Save Contact Coordinates', 'सम्पर्क विवरण सुरक्षित गर्नुहोस्'),
      description: t('Update official phone numbers, email address, and physical location on the website?', 'विद्यालयको फोन नम्बर, इमेल र ठेगाना अद्यावधिक गर्न चाहनुहुन्छ?'),
      itemName: t('Contact Information', 'सम्पर्क विवरण'),
      confirmText: t('Save Coordinates', 'सुरक्षित गर्नुहोस्'),
      action: () => {
        onUpdateSchool({
          ...school,
          ...contactForm
        });
        onShowToast(t('Official contact coordinates updated!', 'सम्पर्क विवरण सफलतापूर्वक अद्यावधिक गरियो!'));
      }
    });
  };

  const filteredMessages = messages.filter(m => {
    const matchesFilter = filterStatus === 'all' || m.status === filterStatus;
    if (!matchesFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

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

      {/* Sub navigation pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveSection('inbox')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeSection === 'inbox'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{t('Inquiries Inbox', 'सन्देश इनबक्स')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/20 text-white">
            {messages.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('coordinates')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeSection === 'coordinates'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t('Official Contact Details', 'आधिकारिक सम्पर्क विवरण')}</span>
        </button>
      </div>

      {/* 1. INBOX SECTION */}
      {activeSection === 'inbox' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Public Contact & Admission Inquiries Inbox', 'सार्वजनिक सोधपुछ तथा सन्देशहरू')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Submissions received from students and parents through the official contact portal', 'सार्वजनिक पोर्टलबाट प्राप्त सन्देशहरू')}
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5">
              {(['all', 'new', 'reviewed', 'resolved'] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold capitalize font-mono transition ${
                    filterStatus === st
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('Search inquiries by sender, email, phone or subject...', 'सन्देश खोज्नुहोस्...')}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Messages list */}
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              {t('No inquiries match the selected filter.', 'छानिएको अवस्था अनुसार कुनै सन्देश छैन।')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                        m.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                        m.status === 'reviewed' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {m.status}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{m.name}</h5>
                      <span className="text-[11px] text-slate-400 font-mono">({m.email} / {m.phone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
                      <IconActionButton
                        action="delete"
                        size="sm"
                        onClick={() => handleDeleteMessage(m.id)}
                        tooltip={t('Delete Message', 'सन्देश मेटाउनुहोस्')}
                        aria-label={t('Delete Message', 'सन्देश मेटाउनुहोस्')}
                      />
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-[#1E40AF]">{m.subject}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                    {m.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    {m.status !== 'reviewed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(m.id, 'reviewed')}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 transition"
                      >
                        {t('Mark Reviewed', 'समीक्षा गरियो')}
                      </button>
                    )}
                    {m.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateMessageStatus(m.id, 'resolved')}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] text-white transition"
                      >
                        {t('Mark Resolved', 'समाधान गरियो')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. OFFICIAL COORDINATES */}
      {activeSection === 'coordinates' && (
        <form onSubmit={handleSaveContactCoordinates} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1E40AF]" />
                <span>{t('Official Institutional Contact Coordinates', 'आधिकारिक सम्पर्क विवरण')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {t('Configure telephone lines, email addresses, and physical postal address', 'विद्यालयको फोन, इमेल र ठेगाना व्यवस्थापन')}
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
            >
              <Save className="w-4 h-4" />
              <span>{t('Save Details', 'सुरक्षित गर्नुहोस्')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Primary Telephone Numbers *', 'सम्पर्क फोन नम्बरहरू *')}
              </label>
              <input
                type="text"
                required
                value={contactForm.phone}
                onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Official Inquiries Email *', 'आधिकारिक इमेल *')}
              </label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Postal Address (English) *', 'भौतिक ठेगाना (अंग्रेजी) *')}
              </label>
              <input
                type="text"
                required
                value={contactForm.address_en}
                onChange={e => setContactForm({ ...contactForm, address_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('भौतिक ठेगाना (नेपाली) *', 'भौतिक ठेगाना (नेपाली) *')}
              </label>
              <input
                type="text"
                required
                value={contactForm.address_np}
                onChange={e => setContactForm({ ...contactForm, address_np: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {t('Geographical Province / District / Ward Information', 'प्रादेशिक तथा स्थानीय निकाय विवरण')}
              </label>
              <input
                type="text"
                value={contactForm.location_en}
                onChange={e => setContactForm({ ...contactForm, location_en: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
