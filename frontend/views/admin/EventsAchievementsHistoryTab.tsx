import React, { useState } from 'react';
import { Language, SchoolEvent, Achievement, HistoryItem, SchoolData } from '../../types';
import {
  CalendarDays,
  Trophy,
  History,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';
import { CmsEmptyState } from './CmsEmptyState';
import { CmsImageUploader } from '../../components/CmsImageUploader';
import { CmsMediaBackgroundControl } from '../../components/CmsMediaBackgroundControl';

interface EventsAchievementsHistoryTabProps {
  lang: Language;
  school?: SchoolData;
  onUpdateSchool?: (data: SchoolData) => void;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  onShowToast: (msg: string) => void;
  activeCategory?: 'events' | 'achievements' | 'history';
}

export const EventsAchievementsHistoryTab: React.FC<EventsAchievementsHistoryTabProps> = ({
  lang,
  school,
  onUpdateSchool,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  onShowToast,
  activeCategory,
}) => {
  const [subSection, setSubSection] = useState<'events' | 'achievements' | 'history'>(activeCategory || 'events');

  React.useEffect(() => {
    if (activeCategory) {
      setSubSection(activeCategory);
    }
  }, [activeCategory]);

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

  // Event Edit / Create State
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [eventForm, setEventForm] = useState<SchoolEvent>({
    id: 0,
    title_en: '',
    title_np: '',
    date_en: '',
    date_np: '',
    time: '10:00 AM - 04:00 PM',
    venue_en: 'School Main Auditorium',
    venue_np: 'विद्यालयको मुख्य प्रेक्षालय',
    desc_en: '',
    desc_np: '',
    category: 'event',
    academic_year: '2083 B.S.',
    status: 'published',
    featured: false,
    display_order: 1
  });

  const [previewEvent, setPreviewEvent] = useState<SchoolEvent | null>(null);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('all');

  // Achievement Edit / Create State
  const [isEditingAchievement, setIsEditingAchievement] = useState(false);
  const [achievementForm, setAchievementForm] = useState<Achievement>({
    id: 0,
    year: '2083 B.S.',
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
    student_name_en: '',
    student_name_np: '',
    category: 'academic',
    position_rank: '',
    featured: false,
    published: true,
    display_order: 1
  });

  const [previewAchievement, setPreviewAchievement] = useState<Achievement | null>(null);
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState('all');

  // History Edit / Create State
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [editingHistoryIndex, setEditingHistoryIndex] = useState<number | null>(null);
  const [historyForm, setHistoryForm] = useState<HistoryItem>({
    year: '2035 BS',
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
  });

  const [previewHistory, setPreviewHistory] = useState<HistoryItem | null>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const handleTogglePublishEvent = (id: number) => {
    const updated = events.map(ev => {
      if (ev.id === id) {
        const nextStatus = ev.status === 'draft' ? 'published' : 'draft';
        return { ...ev, status: nextStatus as 'published' | 'draft' };
      }
      return ev;
    });
    onUpdateEvents(updated);
    onShowToast(t('Event status updated.', 'कार्यक्रमको स्थिति परिवर्तन गरियो।'));
  };

  const handleTogglePublishAchievement = (id: number) => {
    const updated = achievements.map(a => {
      if (a.id === id) {
        return { ...a, published: a.published === false ? true : false };
      }
      return a;
    });
    onUpdateAchievements(updated);
    onShowToast(t('Achievement publication updated.', 'उपलब्धि प्रकाशन स्थिति परिवर्तन गरियो।'));
  };

  // === EVENT HANDLERS ===
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title_en || !eventForm.title_np) {
      onShowToast(t('Please enter both English and Nepali event titles.', 'कृपया नेपाली र अंग्रेजी दुवै शीर्षकहरू प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(eventForm.id && eventForm.id !== 0);

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Event Update', 'कार्यक्रम अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Event', 'नयाँ कार्यक्रम पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this school event?', 'के तपाईं यस कार्यक्रमका विवरणहरू अद्यावधिक गर्न चाहनुहुन्छ?')
        : t('Are you sure you want to publish this new event to the institutional calendar?', 'के तपाईं यो नयाँ कार्यक्रम पात्रोमा थप्न चाहनुहुन्छ?'),
      itemName: `${eventForm.title_en} (${eventForm.title_np})`,
      confirmText: isUpdate ? t('Save Event', 'कार्यक्रम सुरक्षित गर्नुहोस्') : t('Create Event', 'कार्यक्रम सिर्जना गर्नुहोस्'),
      action: () => {
        if (isUpdate) {
          const updated = events.map(ev => ev.id === eventForm.id ? eventForm : ev);
          onUpdateEvents(updated);
          onShowToast(t('Event updated successfully.', 'कार्यक्रम विवरण अद्यावधिक गरियो।'));
        } else {
          const newEvent: SchoolEvent = {
            ...eventForm,
            id: Date.now(),
          };
          onUpdateEvents([newEvent, ...events]);
          onShowToast(t('New event created.', 'नयाँ कार्यक्रम थपियो।'));
        }
        setIsEditingEvent(false);
      }
    });
  };

  const handleDeleteEvent = (id: number) => {
    const target = events.find(e => e.id !== id ? false : true);
    const itemName = target ? `${target.title_en} (${target.title_np})` : `Event #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Event Deletion', 'कार्यक्रम मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this event? This action cannot be undone.', 'के तपाईं यो कार्यक्रम सदाका लागि मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Event', 'कार्यक्रम मेटाउनुहोस्'),
      action: () => {
        onUpdateEvents(events.filter(e => e.id !== id));
        onShowToast(t('Event deleted.', 'कार्यक्रम मेटाइयो।'));
      }
    });
  };

  // === ACHIEVEMENT HANDLERS ===
  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title_en || !achievementForm.title_np) {
      onShowToast(t('Please enter achievement title.', 'कृपया उपलब्धिको शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(achievementForm.id && achievementForm.id !== 0);

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Achievement Update', 'उपलब्धि अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Achievement', 'नयाँ उपलब्धि पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this achievement award?', 'के तपाईं यो उपलब्धि विवरण सुरक्षित गर्न निश्चित हुनुहुन्छ?')
        : t('Are you sure you want to add this student achievement to the public recognition board?', 'के तपाईं यो नयाँ उपलब्धि सम्मान सूचीमा थप्न चाहनुहुन्छ?'),
      itemName: `${achievementForm.title_en} (${achievementForm.title_np})`,
      confirmText: isUpdate ? t('Save Achievement', 'उपलब्धि सुरक्षित गर्नुहोस्') : t('Add Achievement', 'उपलब्धि थप्नुहोस्'),
      action: () => {
        if (isUpdate) {
          const updated = achievements.map(a => a.id === achievementForm.id ? achievementForm : a);
          onUpdateAchievements(updated);
          onShowToast(t('Achievement updated.', 'उपलब्धि अद्यावधिक गरियो।'));
        } else {
          const newAch: Achievement = {
            ...achievementForm,
            id: Date.now(),
          };
          onUpdateAchievements([newAch, ...achievements]);
          onShowToast(t('New student achievement added.', 'नयाँ उपलब्धि थपियो।'));
        }
        setIsEditingAchievement(false);
      }
    });
  };

  const handleDeleteAchievement = (id: number) => {
    const target = achievements.find(a => a.id === id);
    const itemName = target ? `${target.title_en} (${target.title_np})` : `Achievement #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Achievement Deletion', 'उपलब्धि मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this student achievement?', 'के तपाईं यो उपलब्धि विवरण मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Achievement', 'उपलब्धि मेटाउनुहोस्'),
      action: () => {
        onUpdateAchievements(achievements.filter(a => a.id !== id));
        onShowToast(t('Achievement deleted.', 'उपलब्धि मेटाइयो।'));
      }
    });
  };

  // === HISTORY HANDLERS ===
  const handleSaveHistory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!historyForm.title_en || !historyForm.title_np) {
      onShowToast(t('Please enter title.', 'कृपया शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = editingHistoryIndex !== null;

    setConfirmState({
      isOpen: true,
      variant: isUpdate ? 'update' : 'create',
      title: isUpdate ? t('Confirm Milestone Update', 'इतिहास स्तम्भ अद्यावधिक पुष्टि गर्नुहोस्') : t('Confirm New Milestone', 'नयाँ इतिहास स्तम्भ पुष्टि गर्नुहोस्'),
      description: isUpdate
        ? t('Are you sure you want to save modifications to this historical milestone?', 'के तपाईं यो ऐतिहासिक कोसेढुङ्गा सम्पादन गर्न चाहनुहुन्छ?')
        : t('Are you sure you want to add this milestone to the school chronology?', 'के तपाईं यो ऐतिहासिक कोसेढुङ्गा विद्यालय इतिहासमा थप्न चाहनुहुन्छ?'),
      itemName: `${historyForm.year}: ${historyForm.title_en}`,
      confirmText: isUpdate ? t('Save Milestone', 'इतिहास सुरक्षित गर्नुहोस्') : t('Add Milestone', 'इतिहास थप्नुहोस्'),
      action: () => {
        if (editingHistoryIndex !== null) {
          const updated = [...history];
          updated[editingHistoryIndex] = historyForm;
          onUpdateHistory(updated);
          onShowToast(t('Historical milestone updated.', 'ऐतिहासिक स्तम्भ अद्यावधिक गरियो।'));
        } else {
          onUpdateHistory([historyForm, ...history]);
          onShowToast(t('New historical milestone added.', 'नयाँ ऐतिहासिक कोसेढुङ्गा थपियो।'));
        }
        setIsEditingHistory(false);
        setEditingHistoryIndex(null);
      }
    });
  };

  const handleDeleteHistory = (idx: number) => {
    const target = history[idx];
    const itemName = target ? `${target.year}: ${target.title_en}` : `Milestone #${idx}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Milestone Deletion', 'इतिहास स्तम्भ मेटाउन पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently delete this milestone from school history?', 'के तपाईं यो ऐतिहासिक विवरण मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Milestone', 'इतिहास मेटाउनुहोस्'),
      action: () => {
        onUpdateHistory(history.filter((_, i) => i !== idx));
        onShowToast(t('Milestone removed.', 'इतिहास मेटाइयो।'));
      }
    });
  };

  const handleTogglePublishHistory = (idx: number) => {
    const updated = [...history];
    const item = updated[idx];
    const isCurrentlyPublished = item.status !== 'unpublished' && item.is_enabled !== false;
    const nextStatus = isCurrentlyPublished ? 'unpublished' : 'published';

    updated[idx] = {
      ...item,
      status: nextStatus,
      is_enabled: nextStatus === 'published'
    };

    onUpdateHistory(updated);
    onShowToast(
      nextStatus === 'published'
        ? t('Milestone published to public timeline.', 'कोसेढुङ्गा सार्वजनिक इतिहासमा प्रकाशित गरियो।')
        : t('Milestone unpublished (saved as draft).', 'कोसेढुङ्गा अप्रकाशित (मस्यौदा) गरियो।')
    );
  };

  return (
    <div className="space-y-6 relative">
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
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 w-fit">
        <button
          type="button"
          onClick={() => { setSubSection('events'); setIsEditingEvent(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'events'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>{t('School Events & Routines', 'कार्यक्रम तथा तालिका')} ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSubSection('achievements'); setIsEditingAchievement(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'achievements'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>{t('Student Honors & Achievements', 'गौरवमय उपलब्धिहरू')} ({achievements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setSubSection('history'); setIsEditingHistory(false); }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            subSection === 'history'
              ? 'bg-[#1E40AF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t('Institutional History & Milestones', 'इतिहास तथा कोसेढुङ्गा')} ({history.length})</span>
        </button>
      </div>

      {/* SECTION 1: EVENTS CRUD */}
      {subSection === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Academic Calendar & Events', 'वार्षिक क्यालेन्डर तथा कार्यक्रम व्यवस्थापन')}</span>
            </h3>
            {!isEditingEvent && (
              <button
                type="button"
                onClick={() => {
                  setEventForm({
                    id: 0,
                    title_en: '',
                    title_np: '',
                    date_en: 'April 2026',
                    date_np: 'बैशाख २०८३',
                    time: '10:00 AM - 04:00 PM',
                    venue_en: 'School Main Auditorium',
                    venue_np: 'विद्यालयको मुख्य प्रेक्षालय',
                    desc_en: '',
                    desc_np: '',
                  });
                  setIsEditingEvent(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Event', 'नयाँ कार्यक्रम थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* Event Editor Form */}
          {isEditingEvent && (
            <form onSubmit={handleSaveEvent} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {eventForm.id ? t('Edit Event', 'कार्यक्रम सम्पादन') : t('Create New Event', 'नयाँ कार्यक्रम सिर्जना')}
                </span>
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setIsEditingEvent(false)}
                  tooltip={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={eventForm.title_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Annual Science Olympiad"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={eventForm.title_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: वार्षिक विज्ञान प्रदर्शनी"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                  <select
                    value={eventForm.category || 'event'}
                    onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="examination">Examination (परीक्षा)</option>
                    <option value="holiday">Holiday (सार्वजनिक बिदा)</option>
                    <option value="admission">Admission (विद्यार्थी भर्ना)</option>
                    <option value="academic">Academic (शैक्षिक गतिविधि)</option>
                    <option value="meeting">Meeting / Assembly (बैठक)</option>
                    <option value="event">Program / Ceremony (समारोह)</option>
                    <option value="sports">Sports & Athletics (खेलकुद)</option>
                    <option value="program">Extra-Curricular (अतिरिक्त क्रियाकलाप)</option>
                    <option value="other">Other (विविध)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Academic Year</label>
                  <input
                    type="text"
                    value={eventForm.academic_year || '2083 B.S.'}
                    onChange={(e) => setEventForm(prev => ({ ...prev, academic_year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 2083 B.S."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date (English)</label>
                  <input
                    type="text"
                    value={eventForm.date_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Aswin 02, 2083"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date (Nepali / BS)</label>
                  <input
                    type="text"
                    value={eventForm.date_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: २०८३ असोज ०२"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Time / Hours</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 10:00 AM - 04:00 PM"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Venue (EN & NP)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={eventForm.venue_en}
                      onChange={(e) => setEventForm(prev => ({ ...prev, venue_en: e.target.value }))}
                      className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                      placeholder="Venue EN"
                    />
                    <input
                      type="text"
                      value={eventForm.venue_np}
                      onChange={(e) => setEventForm(prev => ({ ...prev, venue_np: e.target.value }))}
                      className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                      placeholder="स्थान NP"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status & Priority</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={eventForm.status !== 'draft'}
                        onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))}
                        className="rounded text-[#1E40AF]"
                      />
                      <span>Published (सार्वजनिक)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(eventForm.featured)}
                        onChange={(e) => setEventForm(prev => ({ ...prev, featured: e.target.checked }))}
                        className="rounded text-amber-500"
                      />
                      <span>Featured (विशेष)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
                  <input
                    type="number"
                    value={eventForm.display_order || 1}
                    onChange={(e) => setEventForm(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (English)</label>
                  <textarea
                    rows={2}
                    value={eventForm.desc_en}
                    onChange={(e) => setEventForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (Nepali)</label>
                  <textarea
                    rows={2}
                    value={eventForm.desc_np}
                    onChange={(e) => setEventForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingEvent(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          )}

          {/* Event Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={eventSearchQuery}
                onChange={(e) => setEventSearchQuery(e.target.value)}
                placeholder={t('Search events by title or venue...', 'कार्यक्रम खोज्नुहोस्...')}
                className="w-full max-w-sm px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
              {eventSearchQuery && (
                <button
                  type="button"
                  onClick={() => setEventSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="all">{t('All Categories', 'सबै विधा')}</option>
                <option value="examination">Examination (परीक्षा)</option>
                <option value="holiday">Holiday (सार्वजनिक बिदा)</option>
                <option value="admission">Admission (विद्यार्थी भर्ना)</option>
                <option value="academic">Academic (शैक्षिक गतिविधि)</option>
                <option value="meeting">Meeting / Assembly (बैठक)</option>
                <option value="event">Program / Ceremony (समारोह)</option>
                <option value="sports">Sports & Athletics (खेलकुद)</option>
                <option value="program">Extra-Curricular (अतिरिक्त)</option>
                <option value="other">Other (विविध)</option>
              </select>
            </div>
          </div>

          {/* Events List */}
          {events.length === 0 ? (
            <CmsEmptyState
              title={t('No events scheduled yet.', 'कुनै कार्यक्रम तालिका छैन।')}
              description={t(
                'Create school events, programs, and annual functions to display on the public calendar.',
                'वार्षिक कार्यक्रम तथा गतिविधिहरू सार्वजनिक क्यालेन्डरमा देखाउन कार्यक्रम थप्नुहोस्।'
              )}
              actionLabel={t('Add Event', 'कार्यक्रम थप्नुहोस्')}
              onAction={() => {
                setEventForm({
                  id: 0,
                  title_en: '',
                  title_np: '',
                  date_en: '',
                  date_np: '',
                  time: '',
                  venue_en: '',
                  venue_np: '',
                  desc_en: '',
                  desc_np: '',
                  category: 'event',
                  academic_year: '2083 B.S.',
                  status: 'published',
                  featured: false,
                  display_order: 1
                });
                setIsEditingEvent(true);
              }}
              icon={CalendarDays}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {events
                .filter(ev => {
                  if (eventCategoryFilter !== 'all' && (ev.category || 'event') !== eventCategoryFilter) return false;
                  if (eventSearchQuery.trim()) {
                    const q = eventSearchQuery.toLowerCase();
                    const match = (ev.title_en?.toLowerCase() || '').includes(q) ||
                      (ev.title_np?.toLowerCase() || '').includes(q) ||
                      (ev.venue_en?.toLowerCase() || '').includes(q);
                    if (!match) return false;
                  }
                  return true;
                })
                .map(ev => (
                <div
                  key={ev.id}
                  onClick={() => setPreviewEvent(ev)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs hover:border-[#1E40AF]/40 transition cursor-pointer group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-[#1E40AF] dark:text-blue-300 uppercase">
                          {ev.category || 'event'}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          ev.status !== 'draft'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {ev.status !== 'draft' ? t('Published', 'सार्वजनिक') : t('Draft', 'ड्राफ्ट')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ev.time}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">{t(ev.title_en, ev.title_np)}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{t(ev.desc_en, ev.desc_np)}</p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-0.5">
                      <span className="flex items-center gap-1 text-[#1E40AF]">
                        <Calendar className="w-3 h-3" />
                        <span>{ev.date_np || ev.date_en}</span>
                      </span>
                      {ev.academic_year && <span>• {ev.academic_year}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{t(ev.venue_en, ev.venue_np)}</span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleTogglePublishEvent(ev.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          ev.status !== 'draft'
                            ? 'text-emerald-600 hover:text-amber-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            : 'text-amber-500 hover:text-emerald-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                        title={ev.status !== 'draft' ? t('Unpublish Event', 'अप्रकाशित गर्नुहोस्') : t('Publish Event', 'प्रकाशित गर्नुहोस्')}
                      >
                        {ev.status !== 'draft' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>

                      <IconActionButton
                        action="edit"
                        size="sm"
                        onClick={() => {
                          setEventForm(ev);
                          setIsEditingEvent(true);
                        }}
                        tooltip={t('Edit Event', 'सम्पादन गर्नुहोस्')}
                        aria-label={t('Edit Event', 'सम्पादन गर्नुहोस्')}
                      />
                      <IconActionButton
                        action="delete"
                        size="sm"
                        onClick={() => handleDeleteEvent(ev.id)}
                        tooltip={t('Delete Event', 'हटाउनुहोस्')}
                        aria-label={t('Delete Event', 'हटाउनुहोस्')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: ACHIEVEMENTS CRUD */}
      {subSection === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Student Honors & Board Results', 'उपलब्धि तथा सम्मान व्यवस्थापन')}</span>
            </h3>
            {!isEditingAchievement && (
              <button
                type="button"
                onClick={() => {
                  setAchievementForm({
                    id: 0,
                    year: '2083 BS',
                    title_en: '',
                    title_np: '',
                    desc_en: '',
                    desc_np: '',
                  });
                  setIsEditingAchievement(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Achievement', 'नयाँ उपलब्धि थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* Achievement Editor */}
          {isEditingAchievement && (
            <form onSubmit={handleSaveAchievement} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {achievementForm.id ? t('Edit Achievement', 'उपलब्धि सम्पादन') : t('Add Achievement', 'नयाँ उपलब्धि थप्नुहोस्')}
                </span>
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setIsEditingAchievement(false)}
                  tooltip={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Year / Session</label>
                  <input
                    type="text"
                    value={achievementForm.year}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 2083 BS / 2026 AD"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={achievementForm.title_en}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. District First in SEE Board Examination"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={achievementForm.title_np}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: एसईई परीक्षामा जिल्लाभर उत्कृष्ट स्थान"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description (EN & NP)</label>
                  <textarea
                    rows={2}
                    value={achievementForm.desc_en}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 mb-2"
                    placeholder="Description in English..."
                  />
                  <textarea
                    rows={2}
                    value={achievementForm.desc_np}
                    onChange={(e) => setAchievementForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="विवरण नेपालीमा..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAchievement(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold"
                >
                  Save Achievement
                </button>
              </div>
            </form>
          )}

          {/* Achievement List */}
          {achievements.length === 0 ? (
            <CmsEmptyState
              title={t('No achievements recorded yet.', 'कुनै उपलब्धि विवरण छैन।')}
              description={t(
                'Add student and institutional awards, recognitions, and athletic milestones.',
                'विद्यार्थी तथा विद्यालयका पुरस्कार, सम्मान र उपलब्धिहरू थप्नुहोस्।'
              )}
              actionLabel={t('Add Achievement', 'उपलब्धि थप्नुहोस्')}
              onAction={() => {
                setAchievementForm({
                  id: 0,
                  title_en: '',
                  title_np: '',
                  year: new Date().getFullYear().toString(),
                  desc_en: '',
                  desc_np: '',
                });
                setIsEditingAchievement(true);
              }}
              icon={Trophy}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono">
                      {a.year}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">{t(a.title_en, a.title_np)}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{t(a.desc_en, a.desc_np)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <IconActionButton
                      action="edit"
                      size="sm"
                      onClick={() => { setAchievementForm(a); setIsEditingAchievement(true); }}
                      tooltip={t('Edit Achievement', 'सम्पादन गर्नुहोस्')}
                      aria-label={t('Edit Achievement', 'सम्पादन गर्नुहोस्')}
                    />
                    <IconActionButton
                      action="delete"
                      size="sm"
                      onClick={() => handleDeleteAchievement(a.id)}
                      tooltip={t('Delete Achievement', 'हटाउनुहोस्')}
                      aria-label={t('Delete Achievement', 'हटाउनुहोस्')}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: HISTORY & MILESTONES CRUD */}
      {subSection === 'history' && (
        <div className="space-y-6">
          {/* HISTORY PAGE BACKGROUND MEDIA CONTROL */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('History Page Background', 'इतिहास पृष्ठ पृष्ठभूमि')}</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {t(
                    'Manage the hero banner background media for More → School History page (JPG, PNG, GIF, or HTTPS URL, Max 2MB).',
                    'थप → विद्यालय इतिहास पृष्ठको मुख्य ब्यानरको पृष्ठभूमि मिडिया व्यवस्थापन गर्नुहोस् (अधिकतम २MB)।'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {school?.history_bg_image ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('Custom Background Active', 'कस्टम पृष्ठभूमि सक्रिय')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    <span>{t('Default Heritage Gradient', 'पूर्वनिर्धारित ग्रेडिएन्ट')}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Media Background Control (Upload / URL / GIF / Image / Preview / Replace / Remove) */}
              <div className="lg:col-span-8">
                <CmsMediaBackgroundControl
                  lang={lang}
                  label={t('Background Media', 'पृष्ठभूमि मिडिया')}
                  description={t(
                    'Upload JPG, PNG, or animated GIF up to 2MB, or provide a secure image/GIF URL.',
                    '२MB सम्मको JPG, PNG वा एनिमेटेड GIF अपलोड गर्नुहोस्, वा सुरक्षित URL राख्नुहोस्।'
                  )}
                  mediaUrl={school?.history_bg_image || ''}
                  sourceType={school?.history_bg_source || (school?.history_bg_image?.startsWith('http') ? 'url' : 'upload')}
                  mediaType={school?.history_bg_media_type || (school?.history_bg_image?.toLowerCase().endsWith('.gif') ? 'gif' : 'image')}
                  maxSizeMB={2}
                  category="history_bg"
                  allowedFormats={['jpg', 'jpeg', 'png', 'gif']}
                  onMediaChange={(url, source, type) => {
                    if (onUpdateSchool && school) {
                      onUpdateSchool({
                        ...school,
                        history_bg_image: url,
                        history_bg_enabled: true,
                        history_bg_source: source,
                        history_bg_media_type: type
                      });
                    }
                  }}
                  onMediaRemove={() => {
                    if (onUpdateSchool && school) {
                      onUpdateSchool({
                        ...school,
                        history_bg_image: '',
                        history_bg_enabled: false,
                        history_bg_source: 'upload',
                        history_bg_media_type: 'image'
                      });
                    }
                  }}
                  onShowToast={onShowToast}
                />
              </div>

              {/* Background Position & Overlay Contrast Settings */}
              <div className="lg:col-span-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 space-y-4">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                  <Layers className="w-3.5 h-3.5 text-[#1E40AF]" />
                  <span>{t('Position & Contrast Settings', 'स्थिति तथा कन्ट्रास्ट')}</span>
                </h5>

                {/* Position setting: Center, Top, Bottom, Left, Right */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('Background Position', 'पृष्ठभूमि स्थिति')}
                  </label>
                  <select
                    value={school?.history_bg_position || 'center'}
                    onChange={(e) => {
                      if (onUpdateSchool && school) {
                        onUpdateSchool({
                          ...school,
                          history_bg_position: e.target.value as any
                        });
                        onShowToast(t('Background position updated.', 'पृष्ठभूमि स्थिति परिवर्तन गरियो।'));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="center">{t('Center (Default)', 'बीचमा (Center)')}</option>
                    <option value="top">{t('Top Aligned', 'माथिल्लो भाग (Top)')}</option>
                    <option value="bottom">{t('Bottom Aligned', 'तल्लो भाग (Bottom)')}</option>
                    <option value="left">{t('Left Aligned', 'बायाँ भाग (Left)')}</option>
                    <option value="right">{t('Right Aligned', 'दायाँ भाग (Right)')}</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {t('Controls focal point of background on varying displays.', 'विभिन्न स्क्रिनमा तस्बिरको मुख्य भाग प्रदर्शन गर्न।')}
                  </p>
                </div>

                {/* Contrast Overlay Slider */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {t('Overlay Contrast', 'ओभरले कन्ट्रास्ट')}
                    </label>
                    <span className="text-xs font-mono font-bold text-[#1E40AF]">
                      {school?.history_bg_overlay_opacity ?? 75}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="95"
                    step="5"
                    value={school?.history_bg_overlay_opacity ?? 75}
                    onChange={(e) => {
                      if (onUpdateSchool && school) {
                        onUpdateSchool({
                          ...school,
                          history_bg_overlay_opacity: parseInt(e.target.value, 10),
                          history_bg_overlay_enabled: true
                        });
                      }
                    }}
                    className="w-full accent-[#1E40AF] cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    {t('Ensures text and historical badges stay legible over media.', 'इतिहासका विवरण तथा तथ्यांक प्रष्ट पढ्न सकिने बनाउँछ।')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#1E40AF]" />
              <span>{t('Manage Institutional Timeline & Milestones', 'इतिहास तथा कोसेढुङ्गा व्यवस्थापन')}</span>
            </h3>
            {!isEditingHistory && (
              <button
                type="button"
                onClick={() => {
                  setHistoryForm({
                    year: '2083 BS',
                    title_en: '',
                    title_np: '',
                    desc_en: '',
                    desc_np: '',
                  });
                  setEditingHistoryIndex(null);
                  setIsEditingHistory(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('Add New Milestone', 'नयाँ इतिहास थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* History Editor Form */}
          {isEditingHistory && (
            <form onSubmit={handleSaveHistory} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-[#1E40AF]">
                  {editingHistoryIndex !== null ? t('Edit Milestone', 'कोसेढुङ्गा सम्पादन') : t('Add Milestone', 'नयाँ स्तम्भ थप्नुहोस्')}
                </span>
                <IconActionButton
                  action="close"
                  appearance="ghost"
                  size="sm"
                  onClick={() => setIsEditingHistory(false)}
                  tooltip={t('Close', 'बन्द')}
                  aria-label={t('Close', 'बन्द')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Year / Era</label>
                  <input
                    type="text"
                    value={historyForm.year}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. 2035 BS"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (English)</label>
                  <input
                    type="text"
                    value={historyForm.title_en}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="e.g. Upgradation to Secondary Level"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title (Nepali)</label>
                  <input
                    type="text"
                    value={historyForm.title_np}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, title_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="उदा: माध्यमिक तहमा स्तरोन्नति"
                    required
                  />
                </div>
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Historical Description (EN & NP)</label>
                  <textarea
                    rows={2}
                    value={historyForm.desc_en}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, desc_en: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800 mb-2"
                    placeholder="Description in English..."
                  />
                  <textarea
                    rows={2}
                    value={historyForm.desc_np}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, desc_np: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="विवरण नेपालीमा..."
                  />
                </div>

                {/* Milestone Image Uploader */}
                <div className="sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <CmsImageUploader
                    lang={lang}
                    label={t('Milestone Archival Photo (Optional)', 'ऐतिहासिक तस्बिर (वैकल्पिक)')}
                    description={t('Upload a historical photo, building inauguration, or archival document.', 'ऐतिहासिक तस्बिर, भवन उद्घाटन वा अभिलेख तस्बिर अपलोड गर्नुहोस्।')}
                    imageUrl={historyForm.image || ''}
                    onImageChange={(url) => setHistoryForm(prev => ({ ...prev, image: url }))}
                    onImageRemove={() => setHistoryForm(prev => ({ ...prev, image: '' }))}
                    aspectRatioLabel="4:3 / 16:9"
                    onShowToast={onShowToast}
                  />
                </div>

                {historyForm.image && (
                  <>
                    <div className="space-y-1 sm:col-span-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('Photo Caption (English)', 'तस्बिर क्याप्सन (अंग्रेजी)')}
                      </label>
                      <input
                        type="text"
                        value={historyForm.image_caption_en || ''}
                        onChange={(e) => setHistoryForm(prev => ({ ...prev, image_caption_en: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                        placeholder="e.g. Inauguration ceremony in 2035 BS"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {t('Photo Caption (Nepali)', 'तस्बिर क्याप्सन (नेपाली)')}
                      </label>
                      <input
                        type="text"
                        value={historyForm.image_caption_np || ''}
                        onChange={(e) => setHistoryForm(prev => ({ ...prev, image_caption_np: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                        placeholder="उदा: वि.सं. २०३५ को उद्घाटन समारोह"
                      />
                    </div>
                  </>
                )}

                {/* Display Order & Publication Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('Chronological Order', 'क्रम सङ्ख्या')}</span>
                  </label>
                  <input
                    type="number"
                    value={historyForm.display_order ?? 1}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, display_order: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('Publication Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={historyForm.status || 'published'}
                    onChange={(e) => setHistoryForm(prev => ({ ...prev, status: e.target.value as 'published' | 'unpublished' }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="published">{t('Published (Public)', 'प्रकाशित (सार्वजनिक)')}</option>
                    <option value="unpublished">{t('Unpublished (Draft)', 'अप्रकाशित (मस्यौदा)')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingHistory(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-[#1E40AF] text-white font-bold cursor-pointer hover:bg-blue-700"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          {/* History List */}
          {history.length === 0 ? (
            <CmsEmptyState
              title={t('No historical milestones yet.', 'कुनै ऐतिहासिक कोसेढुङ्गा छैन।')}
              description={t(
                'Document important historical events, founding moments, and institutional milestones.',
                'विद्यालयको स्थापना, विकास र मुख्य ऐतिहासिक क्षणहरू थप्नुहोस्।'
              )}
              actionLabel={t('Add Milestone', 'कोसेढुङ्गा थप्नुहोस्')}
              onAction={() => {
                setHistoryForm({
                  year: new Date().getFullYear().toString(),
                  title_en: '',
                  title_np: '',
                  desc_en: '',
                  desc_np: '',
                  image: '',
                  image_caption_en: '',
                  image_caption_np: '',
                  display_order: history.length + 1,
                  status: 'published',
                  is_enabled: true
                });
                setEditingHistoryIndex(null);
                setIsEditingHistory(true);
              }}
              icon={History}
            />
          ) : (
            <div className="space-y-3">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewHistory(h)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4 shadow-2xs hover:border-[#1E40AF]/40 transition cursor-pointer group"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {h.image ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition">
                        <img
                          src={h.image}
                          alt={h.title_en}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-800/50 text-slate-400">
                        <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                      </div>
                    )}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1E40AF] px-2 py-0.5 rounded bg-[#1E40AF]/10">
                          {h.year}
                        </span>
                        {h.status === 'unpublished' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                            {t('Draft', 'मस्यौदा')}
                          </span>
                        )}
                        {h.display_order && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            #{h.display_order}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">{t(h.title_en, h.title_np)}</h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{t(h.desc_en, h.desc_np)}</p>
                      {h.image && (
                        <p className="text-[11px] text-slate-400 italic">
                          📷 {t(h.image_caption_en || 'Archival Photo', h.image_caption_np || 'ऐतिहासिक तस्बिर')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleTogglePublishHistory(idx)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        h.status === 'unpublished' || h.is_enabled === false
                          ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                      title={
                        h.status === 'unpublished' || h.is_enabled === false
                          ? t('Publish Milestone (Live)', 'प्रकाशित गर्नुहोस्')
                          : t('Unpublish Milestone (Draft)', 'अप्रकाशित (मस्यौदा) गर्नुहोस्')
                      }
                      aria-label={t('Toggle publication', 'प्रकाशन स्थिति फेर्नुहोस्')}
                    >
                      {h.status === 'unpublished' || h.is_enabled === false ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <IconActionButton
                      action="edit"
                      size="sm"
                      onClick={() => {
                        setHistoryForm(h);
                        setEditingHistoryIndex(idx);
                        setIsEditingHistory(true);
                      }}
                      tooltip={t('Edit Milestone', 'सम्पादन गर्नुहोस्')}
                      aria-label={t('Edit Milestone', 'सम्पादन गर्नुहोस्')}
                    />
                    <IconActionButton
                      action="delete"
                      size="sm"
                      onClick={() => handleDeleteHistory(idx)}
                      tooltip={t('Delete Milestone', 'हटाउनुहोस्')}
                      aria-label={t('Delete Milestone', 'हटाउनुहोस्')}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Milestone Preview Modal */}
      {previewHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1E40AF] px-2.5 py-1 rounded bg-[#1E40AF]/10">
                  {previewHistory.year}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  previewHistory.status === 'unpublished' || previewHistory.is_enabled === false
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                }`}>
                  {previewHistory.status === 'unpublished' || previewHistory.is_enabled === false
                    ? t('Draft (Staged)', 'मस्यौदा')
                    : t('Published (Live)', 'प्रकाशित')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewHistory.image && (
              <div className="max-h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={previewHistory.image}
                  alt={previewHistory.title_en}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t(previewHistory.title_en, previewHistory.title_np)}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {t(previewHistory.desc_en, previewHistory.desc_np)}
              </p>
              {previewHistory.image && (
                <p className="text-[11px] text-slate-400 italic">
                  📷 {t(previewHistory.image_caption_en || 'Archival record photo', previewHistory.image_caption_np || 'ऐतिहासिक अभिलेख तस्बिर')}
                </p>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewHistory(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1E40AF] text-white hover:bg-blue-700 transition"
              >
                {t('Close Preview', 'बन्द गर्नुहोस्')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
