import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  Notice,
  DocumentItem,
  AcademicProgram,
  Facility,
  SchoolEvent,
  Achievement,
  HistoryItem,
  AboutSection,
  PermissionKey
} from '../../types';
import { initialAboutSections } from '../../data/schoolData';
import {
  FileText,
  Bell,
  FileDown,
  Calendar,
  Award,
  History,
  Building2,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Save,
  Pin,
  Upload,
  Search,
  CheckCircle2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Compass,
  Target,
  Scale,
  X,
  FileCheck
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';
import { EventsAchievementsHistoryTab } from './EventsAchievementsHistoryTab';
import { AdminCrudToolbar } from './AdminCrudToolbar';
import { AdminActionMenu } from './AdminActionMenu';
import { AdminViewDetailsModal } from './AdminViewDetailsModal';
import { CmsStatusBadge } from './CmsStatusBadge';
import { CmsEmptyState } from './CmsEmptyState';
import { CmsDocumentUploader } from './CmsDocumentUploader';
import { AboutContentEditor } from '../../components/AboutContentEditor';
import { CmsImageUploader } from '../../components/CmsImageUploader';
import { CmsMediaBackgroundControl } from '../../components/CmsMediaBackgroundControl';
import { AdminDrawer } from './AdminDrawer';

interface AdminContentTabProps {
  lang: Language;
  activeSubTab: 'content_about' | 'content_notices' | 'content_documents' | 'content_events' | 'content_achievements' | 'content_history';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  documents: DocumentItem[];
  onUpdateDocuments: (docs: DocumentItem[]) => void;
  programs: AcademicProgram[];
  onUpdatePrograms: (programs: AcademicProgram[]) => void;
  facilities: Facility[];
  onUpdateFacilities: (facilities: Facility[]) => void;
  events: SchoolEvent[];
  onUpdateEvents: (events: SchoolEvent[]) => void;
  achievements: Achievement[];
  onUpdateAchievements: (achievements: Achievement[]) => void;
  history: HistoryItem[];
  onUpdateHistory: (history: HistoryItem[]) => void;
  aboutSections?: AboutSection[];
  onUpdateAboutSections?: (sections: AboutSection[]) => void;
  onShowToast: (msg: string) => void;
  can?: (perm: PermissionKey) => boolean;
}

export const AdminContentTab: React.FC<AdminContentTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  notices,
  onUpdateNotices,
  documents,
  onUpdateDocuments,
  programs,
  onUpdatePrograms,
  facilities,
  onUpdateFacilities,
  events,
  onUpdateEvents,
  achievements,
  onUpdateAchievements,
  history,
  onUpdateHistory,
  aboutSections = [],
  onUpdateAboutSections,
  onShowToast,
  can = () => true
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const canCreateNotice = can('notice.create');
  const canUpdateNotice = can('notice.update');
  const canDeleteNotice = can('notice.delete');
  const canUploadDoc = can('document.upload');
  const canDeleteDoc = can('document.delete');
  const canUpdateAbout = can('about.update');

  // Authoritative fallback for about sections
  const effectiveAboutSections: AboutSection[] = aboutSections && aboutSections.length > 0
    ? aboutSections
    : initialAboutSections;

  // ABOUT SECTION FORM STATE
  const [aboutForm, setAboutForm] = useState<Partial<AboutSection>>({
    title_en: '',
    title_np: '',
    category: 'overview',
    content_en: '',
    content_np: '',
    image: '',
    background_source: 'upload',
    background_media_type: 'image',
    image_caption_en: '',
    image_caption_np: '',
    image_position: 'center',
    display_order: (effectiveAboutSections.length + 1),
    status: 'published',
    is_enabled: true,
    icon: 'Compass'
  });
  const [editingAboutId, setEditingAboutId] = useState<string | null>(null);
  const [aboutImageError, setAboutImageError] = useState<string>('');

  // NOTICE FORM STATE
  const [noticeForm, setNoticeForm] = useState<Partial<Notice>>({
    title_en: '',
    title_np: '',
    category: 'academic',
    pinned: false,
    file_name: '',
    file_data: '',
    file_size_kb: 0,
    description_en: '',
    description_np: ''
  });
  const [noticeFileError, setNoticeFileError] = useState('');
  const [noticeSearch, setNoticeSearch] = useState('');
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [noticeStatusFilter, setNoticeStatusFilter] = useState('all');
  const [noticeCategoryFilter, setNoticeCategoryFilter] = useState('all');
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null);

  // DOCUMENT FORM STATE
  const [docForm, setDocForm] = useState<Partial<DocumentItem>>({
    title_en: '',
    title_np: '',
    type: 'PDF',
    size: '100 KB',
    date: '2083-05-15',
    file_name: '',
    file_data: '',
    file_size_kb: 0
  });
  const [docFileError, setDocFileError] = useState<string>('');
  const [docSearch, setDocSearch] = useState('');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [docStatusFilter, setDocStatusFilter] = useState('all');
  const [docCategoryFilter, setDocCategoryFilter] = useState('all');
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);

  // PROGRAM FORM STATE
  const [programForm, setProgramForm] = useState<Partial<AcademicProgram>>({
    title_en: '',
    title_np: '',
    level: '+2 Higher Secondary',
    duration: '2 Years',
    intake: 45,
    desc_en: '',
    desc_np: ''
  });
  const [isEditingProgram, setIsEditingProgram] = useState(false);
  const [programSearch, setProgramSearch] = useState('');
  const [viewingProgram, setViewingProgram] = useState<AcademicProgram | null>(null);

  // FACILITY FORM STATE
  const [facilityForm, setFacilityForm] = useState<Partial<Facility>>({
    title_en: '',
    title_np: '',
    desc_en: '',
    desc_np: '',
    icon: '🔬'
  });
  const [isEditingFacility, setIsEditingFacility] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [viewingFacility, setViewingFacility] = useState<Facility | null>(null);

  // ABOUT SECTION STATE
  const [isAddingAbout, setIsAddingAbout] = useState(false);
  const [aboutSearch, setAboutSearch] = useState('');
  const [aboutStatusFilter, setAboutStatusFilter] = useState('all');
  const [viewingAboutSection, setViewingAboutSection] = useState<AboutSection | null>(null);

  // Confirmation modal state
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

  // NOTICE HANDLERS
  const handleNoticeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setNoticeFileError(t('Only official PDF files allowed.', 'केवल PDF फाइलहरू मात्र स्वीकार्य छन्।'));
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 200) {
      setNoticeFileError(
        t(
          `File size is ${sizeKb}KB. Maximum allowed is 200KB.`,
          `फाइल साइज ${sizeKb}KB छ। अधिकतम २००KB मात्र अनुमति छ।`
        )
      );
      return;
    }

    setNoticeFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setNoticeForm(prev => ({
        ...prev,
        file_name: file.name,
        file_data: event.target?.result as string,
        file_size_kb: sizeKb
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeForm.title_en) return;

    if (noticeForm.id) {
      // Update
      const updated = notices.map(n => n.id === noticeForm.id ? ({ ...n, ...noticeForm } as Notice) : n);
      onUpdateNotices(updated);
      onShowToast(t('Notice updated successfully!', 'सूचना अद्यावधिक गरियो!'));
    } else {
      // Create
      const newNotice: Notice = {
        id: Date.now(),
        title_en: noticeForm.title_en || '',
        title_np: noticeForm.title_np || noticeForm.title_en || '',
        category: noticeForm.category || 'academic',
        date_en: 'Bhadra 24, 2083',
        date_np: '२०८३ भाद्र २४',
        pinned: noticeForm.pinned || false,
        file_name: noticeForm.file_name || '',
        file_data: noticeForm.file_data || '',
        file_size_kb: noticeForm.file_size_kb || 0,
        description_en: noticeForm.description_en || '',
        description_np: noticeForm.description_np || ''
      };
      onUpdateNotices([newNotice, ...notices]);
      onShowToast(t('Notice published successfully!', 'सूचना प्रकाशित गरियो!'));
    }

    setIsEditingNotice(false);
    setNoticeForm({
      title_en: '',
      title_np: '',
      category: 'academic',
      pinned: false,
      file_name: '',
      file_data: '',
      file_size_kb: 0,
      description_en: '',
      description_np: ''
    });
  };

  const handleDeleteNotice = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Notice', 'सूचना मेटाउनुहोस्'),
      description: t('Are you sure you want to permanently delete this notice from the database?', 'के तपाईं यस सूचनालाई हटाउन निश्चित हुनुहुन्छ?'),
      itemName: t('Notice Entry', 'सूचना'),
      confirmText: t('Delete Notice', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateNotices(notices.filter(n => n.id !== id));
        onShowToast(t('Notice deleted.', 'सूचना मेटाइयो।'));
      }
    });
  };

  const handleTogglePinNotice = (id: number) => {
    const updated = notices.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    onUpdateNotices(updated);
    onShowToast(t('Notice pin status toggled.', 'सूचनाको पिन अवस्था परिवर्तन गरियो।'));
  };

  const handleTogglePublishNotice = (id: number) => {
    const updated = notices.map(n => {
      if (n.id === id) {
        const isCurrentlyDraft = n.status === 'draft' || n.published === false || n.is_published === false;
        const newStatus: 'published' | 'draft' = isCurrentlyDraft ? 'published' : 'draft';
        return {
          ...n,
          status: newStatus,
          published: newStatus === 'published',
          is_published: newStatus === 'published'
        };
      }
      return n;
    });
    onUpdateNotices(updated);
    const target = updated.find(n => n.id === id);
    onShowToast(
      target?.status === 'published'
        ? t('Notice published to public portal.', 'सूचना सार्वजनिक रूपमा प्रकाशित गरियो।')
        : t('Notice unpublished and saved to drafts.', 'सूचना अप्रकाशित गरी मस्यौदामा राखियो।')
    );
    if (viewingNotice && viewingNotice.id === id && target) {
      setViewingNotice(target);
    }
  };

  // ABOUT SECTION HANDLERS
  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setAboutImageError(t('Supported formats: JPG, JPEG, PNG, WEBP', 'स्वीकार्य ढाँचाहरू: JPG, JPEG, PNG, WEBP'));
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 2048) {
      setAboutImageError(t(`Image size is ${sizeKb}KB. Maximum allowed is 2MB (2048KB).`, `फोटो साइज ${sizeKb}KB छ। अधिकतम २MB मात्र अनुमति छ।`));
      return;
    }

    setAboutImageError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setAboutForm(prev => ({
        ...prev,
        image: event.target?.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAboutSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutForm.title_en || !onUpdateAboutSections) return;

    const currentList = [...effectiveAboutSections];

    if (editingAboutId) {
      const updated = currentList.map(item =>
        item.id === editingAboutId
          ? {
              ...item,
              ...aboutForm,
              id: editingAboutId,
              title_en: aboutForm.title_en || item.title_en,
              title_np: aboutForm.title_np || aboutForm.title_en || item.title_np,
              background_source: aboutForm.background_source ?? item.background_source ?? (aboutForm.image?.startsWith('http') ? 'url' : 'upload'),
              background_media_type: aboutForm.background_media_type ?? item.background_media_type ?? (aboutForm.image?.toLowerCase().endsWith('.gif') ? 'gif' : 'image'),
              display_order: Number(aboutForm.display_order) || item.display_order
            } as AboutSection
          : item
      );
      updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      onUpdateAboutSections(updated);
      onShowToast(t('About section updated successfully!', 'परिचय खण्ड अद्यावधिक गरियो!'));
      setEditingAboutId(null);
    } else {
      const newSection: AboutSection = {
        id: `about-${Date.now()}`,
        title_en: aboutForm.title_en || '',
        title_np: aboutForm.title_np || aboutForm.title_en || '',
        category: (aboutForm.category as any) || 'custom',
        content_en: aboutForm.content_en || '',
        content_np: aboutForm.content_np || '',
        image: aboutForm.image || '',
        background_source: aboutForm.background_source || (aboutForm.image?.startsWith('http') ? 'url' : 'upload'),
        background_media_type: aboutForm.background_media_type || (aboutForm.image?.toLowerCase().endsWith('.gif') ? 'gif' : 'image'),
        image_caption_en: aboutForm.image_caption_en || '',
        image_caption_np: aboutForm.image_caption_np || '',
        image_position: aboutForm.image_position || 'center',
        display_order: Number(aboutForm.display_order) || (currentList.length + 1),
        status: aboutForm.status || 'published',
        is_enabled: aboutForm.is_enabled !== undefined ? aboutForm.is_enabled : true,
        icon: aboutForm.icon || 'Compass'
      };
      const updated = [...currentList, newSection];
      updated.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      onUpdateAboutSections(updated);
      onShowToast(t('New about section created successfully!', 'नयाँ परिचय खण्ड सिर्जना गरियो!'));
    }

    setAboutForm({
      title_en: '',
      title_np: '',
      category: 'custom',
      content_en: '',
      content_np: '',
      image: '',
      background_source: 'upload',
      background_media_type: 'image',
      image_caption_en: '',
      image_caption_np: '',
      image_position: 'center',
      display_order: effectiveAboutSections.length + 2,
      status: 'published',
      is_enabled: true,
      icon: 'Compass'
    });
    setAboutImageError('');
    setIsAddingAbout(false);
  };

  const handleEditAboutSection = (section: AboutSection) => {
    setIsAddingAbout(false);
    setEditingAboutId(section.id);
    setAboutForm({
      ...section,
      background_source: section.background_source || (section.image?.startsWith('http') ? 'url' : 'upload'),
      background_media_type: section.background_media_type || (section.image?.toLowerCase().endsWith('.gif') ? 'gif' : 'image')
    });
    setAboutImageError('');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEditAbout = () => {
    setIsAddingAbout(false);
    setEditingAboutId(null);
    setAboutForm({
      title_en: '',
      title_np: '',
      category: 'custom',
      content_en: '',
      content_np: '',
      image: '',
      background_source: 'upload',
      background_media_type: 'image',
      image_caption_en: '',
      image_caption_np: '',
      display_order: effectiveAboutSections.length + 1,
      status: 'published',
      is_enabled: true,
      icon: 'Compass'
    });
    setAboutImageError('');
  };

  const handleDeleteAboutSection = (id: string) => {
    if (!onUpdateAboutSections) return;
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete About Section', 'परिचय खण्ड मेटाउनुहोस्'),
      description: t('Are you sure you want to delete this section from the public About page?', 'के तपाईं यस खण्डलाई परिचय पृष्ठबाट हटाउन निश्चित हुनुहुन्छ?'),
      itemName: t('About Section', 'परिचय खण्ड'),
      confirmText: t('Delete Section', 'मेटाउनुहोस्'),
      action: () => {
        const updated = effectiveAboutSections.filter(s => s.id !== id);
        onUpdateAboutSections(updated);
        onShowToast(t('About section deleted.', 'परिचय खण्ड मेटाइयो।'));
      }
    });
  };

  const handleToggleAboutStatus = (section: AboutSection) => {
    if (!onUpdateAboutSections) return;
    const newStatus: 'published' | 'draft' = section.status === 'published' ? 'draft' : 'published';
    const updated = effectiveAboutSections.map(s => s.id === section.id ? { ...s, status: newStatus } : s);
    onUpdateAboutSections(updated);
    onShowToast(t(`Section marked as ${newStatus}.`, `खण्ड ${newStatus === 'published' ? 'प्रकाशित' : 'मस्यौदा'} गरियो।`));
  };

  const handleToggleAboutEnabled = (section: AboutSection) => {
    if (!onUpdateAboutSections) return;
    const updated = effectiveAboutSections.map(s => s.id === section.id ? { ...s, is_enabled: !s.is_enabled } : s);
    onUpdateAboutSections(updated);
    onShowToast(t('Section visibility toggled.', 'खण्डको प्रदर्शन अवस्था परिवर्तन गरियो।'));
  };

  const handleMoveAboutOrder = (id: string, direction: 'up' | 'down') => {
    if (!onUpdateAboutSections) return;
    const sorted = [...effectiveAboutSections].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const index = sorted.findIndex(s => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = sorted[index];
    sorted[index] = sorted[targetIndex];
    sorted[targetIndex] = temp;

    const reordered = sorted.map((s, idx) => ({ ...s, display_order: idx + 1 }));
    onUpdateAboutSections(reordered);
    onShowToast(t('Section order re-arranged.', 'खण्डको क्रम परिवर्तन गरियो।'));
  };

  // DOCUMENT HANDLERS
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setDocFileError(t('Only official PDF files allowed (.pdf).', 'केवल आधिकारिक PDF फाइलहरू मात्र स्वीकार्य छन् (.pdf)।'));
      return;
    }

    const sizeKb = Math.round(file.size / 1024);
    if (sizeKb > 200) {
      setDocFileError(
        t(
          `File size is ${sizeKb}KB. Maximum allowed threshold is 200KB.`,
          `फाइल साइज ${sizeKb}KB छ। अधिकतम सीमा २००KB मात्र अनुमति छ।`
        )
      );
      return;
    }

    setDocFileError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setDocForm(prev => ({
        ...prev,
        file_name: file.name,
        file_data: dataUrl,
        file_size_kb: sizeKb,
        size: `${sizeKb} KB`,
        type: 'PDF'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title_en) return;

    if (docForm.id) {
      const updated = documents.map(d => d.id === docForm.id ? ({ ...d, ...docForm } as DocumentItem) : d);
      onUpdateDocuments(updated);
      onShowToast(t('Document updated successfully.', 'दस्तावेज अद्यावधिक गरियो।'));
    } else {
      const newDoc: DocumentItem = {
        id: Date.now(),
        title_en: docForm.title_en || '',
        title_np: docForm.title_np || docForm.title_en || '',
        type: docForm.type || 'PDF',
        size: docForm.size || (docForm.file_size_kb ? `${docForm.file_size_kb} KB` : '100 KB'),
        date: docForm.date || '2083-05-15',
        file_name: docForm.file_name || '',
        file_data: docForm.file_data || '',
        file_size_kb: docForm.file_size_kb || 0
      };
      onUpdateDocuments([newDoc, ...documents]);
      onShowToast(t('Document uploaded successfully.', 'दस्तावेज सफलतापूर्वक अपलोड गरियो।'));
    }

    setIsEditingDoc(false);
    setDocForm({
      title_en: '',
      title_np: '',
      type: 'PDF',
      size: '100 KB',
      date: '2083-05-15',
      file_name: '',
      file_data: '',
      file_size_kb: 0
    });
    setDocFileError('');
  };

  const handleDeleteDocument = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Document', 'दस्तावेज मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this downloadable document?', 'के तपाईं यस दस्तावेजलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Document Entry', 'दस्तावेज'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateDocuments(documents.filter(d => d.id !== id));
        onShowToast(t('Document deleted.', 'दस्तावेज मेटाइयो।'));
      }
    });
  };

  // ACADEMIC PROGRAM HANDLERS
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title_en) return;

    if (programForm.id) {
      const updated = programs.map(p => p.id === programForm.id ? ({ ...p, ...programForm } as AcademicProgram) : p);
      onUpdatePrograms(updated);
      onShowToast(t('Academic program updated.', 'शैक्षिक कार्यक्रम अद्यावधिक गरियो।'));
    } else {
      const newProg: AcademicProgram = {
        id: Date.now(),
        title_en: programForm.title_en || '',
        title_np: programForm.title_np || programForm.title_en || '',
        level: programForm.level || '+2 Higher Secondary',
        duration: programForm.duration || '2 Years',
        intake: programForm.intake || 40,
        desc_en: programForm.desc_en || '',
        desc_np: programForm.desc_np || ''
      };
      onUpdatePrograms([...programs, newProg]);
      onShowToast(t('Academic program added.', 'शैक्षिक कार्यक्रम थपियो।'));
    }

    setProgramForm({
      title_en: '',
      title_np: '',
      level: '+2 Higher Secondary',
      duration: '2 Years',
      intake: 45,
      desc_en: '',
      desc_np: ''
    });
  };

  const handleDeleteProgram = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Academic Program', 'कार्यक्रम मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this academic program?', 'के तपाईं यस शैक्षिक कार्यक्रमलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Academic Program', 'शैक्षिक कार्यक्रम'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdatePrograms(programs.filter(p => p.id !== id));
        onShowToast(t('Academic program removed.', 'कार्यक्रम हटाइयो।'));
      }
    });
  };

  // FACILITY HANDLERS
  const handleSaveFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityForm.title_en) return;

    if (facilityForm.id) {
      const updated = facilities.map(f => f.id === facilityForm.id ? ({ ...f, ...facilityForm } as Facility) : f);
      onUpdateFacilities(updated);
      onShowToast(t('Facility updated.', 'पूर्वाधार अद्यावधिक गरियो।'));
    } else {
      const newFacility: Facility = {
        id: Date.now(),
        title_en: facilityForm.title_en || '',
        title_np: facilityForm.title_np || facilityForm.title_en || '',
        desc_en: facilityForm.desc_en || '',
        desc_np: facilityForm.desc_np || '',
        icon: facilityForm.icon || '🔬'
      };
      onUpdateFacilities([...facilities, newFacility]);
      onShowToast(t('New facility added.', 'पूर्वाधार थपियो।'));
    }

    setFacilityForm({
      title_en: '',
      title_np: '',
      desc_en: '',
      desc_np: '',
      icon: '🔬'
    });
  };

  const handleDeleteFacility = (id: number) => {
    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Delete Facility', 'पूर्वाधार मेटाउनुहोस्'),
      description: t('Are you sure you want to remove this facility from campus list?', 'के तपाईं यस पूर्वाधारलाई हटाउन चाहनुहुन्छ?'),
      itemName: t('Campus Facility', 'पूर्वाधार'),
      confirmText: t('Delete', 'मेटाउनुहोस्'),
      action: () => {
        onUpdateFacilities(facilities.filter(f => f.id !== id));
        onShowToast(t('Facility removed.', 'पूर्वाधार हटाइयो।'));
      }
    });
  };

  const filteredNotices = notices
    .filter(n => {
      const isDraft = n.status === 'draft' || n.published === false || n.is_published === false;
      if (noticeStatusFilter === 'published') return !isDraft;
      if (noticeStatusFilter === 'draft') return isDraft;
      if (noticeStatusFilter === 'pinned') return n.pinned && !isDraft;
      if (noticeStatusFilter === 'regular') return !n.pinned && !isDraft;
      return true;
    })
    .filter(n => {
      if (noticeCategoryFilter === 'all') return true;
      return n.category.toLowerCase() === noticeCategoryFilter.toLowerCase();
    })
    .filter(n => {
      if (!noticeSearch) return true;
      const q = noticeSearch.toLowerCase();
      return (
        n.title_en.toLowerCase().includes(q) ||
        n.title_np.includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });

  const filteredDocuments = documents
    .filter(d => {
      if (docCategoryFilter === 'pdf') return d.type.toLowerCase().includes('pdf');
      if (docCategoryFilter === 'form') return !d.type.toLowerCase().includes('pdf') || d.title_en.toLowerCase().includes('form');
      return true;
    })
    .filter(d => {
      if (!docSearch) return true;
      const q = docSearch.toLowerCase();
      return (
        d.title_en.toLowerCase().includes(q) ||
        d.title_np.includes(q) ||
        d.type.toLowerCase().includes(q) ||
        (d.file_name && d.file_name.toLowerCase().includes(q))
      );
    });

  const filteredAboutSections = effectiveAboutSections
    .filter(s => {
      if (aboutStatusFilter === 'published') return s.status === 'published';
      if (aboutStatusFilter === 'draft') return s.status === 'draft';
      return true;
    })
    .filter(s => {
      if (!aboutSearch) return true;
      const q = aboutSearch.toLowerCase();
      return (
        s.title_en.toLowerCase().includes(q) ||
        s.title_np.includes(q) ||
        (s.content_en && s.content_en.toLowerCase().includes(q)) ||
        (s.category && s.category.toLowerCase().includes(q))
      );
    });

  const filteredFacilities = facilities.filter(f => {
    if (!facilitySearch) return true;
    const q = facilitySearch.toLowerCase();
    return (
      f.title_en.toLowerCase().includes(q) ||
      f.title_np.includes(q) ||
      (f.desc_en && f.desc_en.toLowerCase().includes(q))
    );
  });

  const filteredPrograms = programs.filter(p => {
    if (!programSearch) return true;
    const q = programSearch.toLowerCase();
    return (
      p.title_en.toLowerCase().includes(q) ||
      p.title_np.includes(q) ||
      (p.desc_en && p.desc_en.toLowerCase().includes(q)) ||
      (p.level && p.level.toLowerCase().includes(q))
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

      {/* 1. ABOUT & ACADEMICS & FACILITIES */}
      {activeSubTab === 'content_about' && (
        <div className="space-y-6">
          {/* Dedicated About Page Management UI */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1E40AF]" />
                  <span>{t('About Page Content', 'परिचय पृष्ठ सामग्री')}</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t(
                    'Manage institutional overview, mission, vision, core values, and custom narrative sections.',
                    'संस्थागत परिचय, उद्देश्य, दृष्टिकोण, मुख्य मान्यताहरू तथा अन्य खण्डहरू व्यवस्थापन गर्नुहोस्।'
                  )}
                </p>
              </div>
              {!isAddingAbout && !editingAboutId && (
                <button
                  type="button"
                  onClick={() => {
                    setAboutForm({
                      title_en: '',
                      title_np: '',
                      category: 'overview',
                      content_en: '',
                      content_np: '',
                      image: '',
                      image_caption_en: '',
                      image_caption_np: '',
                      display_order: effectiveAboutSections.length + 1,
                      status: 'published',
                      is_enabled: true,
                      icon: 'Compass'
                    });
                    setEditingAboutId(null);
                    setIsAddingAbout(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-xs transition shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Add Section', 'नयाँ खण्ड थप्नुहोस्')}</span>
                </button>
              )}
            </div>

            {/* About Section Form */}
            {(isAddingAbout || editingAboutId) && (
              <form onSubmit={handleSaveAboutSection} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-[#1E40AF]" />
                      <span>
                        {editingAboutId
                          ? t('Edit About Section', 'परिचय खण्ड सम्पादन गर्नुहोस्')
                          : t('Add New About Section', 'नयाँ परिचय खण्ड थप्नुहोस्')}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editingAboutId
                        ? t(`Editing: ${aboutForm.title_en || 'Section'}`, `सम्पादन: ${aboutForm.title_np || aboutForm.title_en}`)
                        : t('Add rich text, image, category, and display sequence for public view', 'सामग्री, फोटो, वर्ग र प्रदर्शन क्रम प्रविष्ट गर्नुहोस्')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEditAbout}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      {t('Cancel', 'रद्द गर्नुहोस्')}
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
                    >
                      <Save className="w-4 h-4" />
                    <span>
                      {editingAboutId
                        ? t('Update Section', 'अद्यावधिक गर्नुहोस्')
                        : t('Save & Publish Section', 'सुरक्षित गर्नुहोस्')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Responsive Layout: 2-Column on Desktop (lg+), Stacked on Tablet & Mobile */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                {/* Left Column: Titles, Category, Display Order, Narrative Content */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Section Title (English) *', 'खण्डको शीर्षक (अंग्रेजी) *')}
                      </label>
                      <input
                        type="text"
                        required
                        value={aboutForm.title_en || ''}
                        onChange={e => setAboutForm({ ...aboutForm, title_en: e.target.value })}
                        placeholder="e.g., Institutional Heritage & Foundation"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('खण्डको शीर्षक (नेपाली) *', 'खण्डको शीर्षक (नेपाली) *')}
                      </label>
                      <input
                        type="text"
                        value={aboutForm.title_np || ''}
                        onChange={e => setAboutForm({ ...aboutForm, title_np: e.target.value })}
                        placeholder="जस्तै: संस्थागत इतिहास तथा स्थापना"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Section Category / Function', 'खण्डको वर्ग / प्रकार')}
                      </label>
                      <select
                        value={aboutForm.category || 'custom'}
                        onChange={e => setAboutForm({ ...aboutForm, category: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="overview">{t('Institutional Overview (परिचय)', 'Institutional Overview (परिचय)')}</option>
                        <option value="mission">{t('Mission & Purpose (उद्देश्य)', 'Mission & Purpose (उद्देश्य)')}</option>
                        <option value="vision">{t('Vision & Horizon (दृष्टिकोण)', 'Vision & Horizon (दृष्टिकोण)')}</option>
                        <option value="values">{t('Core Values (मुख्य मान्यता)', 'Core Values (मुख्य मान्यता)')}</option>
                        <option value="governance">{t('Governance & SMC (व्यवस्थापन समिति)', 'Governance & SMC (व्यवस्थापन समिति)')}</option>
                        <option value="history">{t('Historical Legacy (इतिहास)', 'Historical Legacy (इतिहास)')}</option>
                        <option value="custom">{t('Custom Content Section (विशेष खण्ड)', 'Custom Content Section (विशेष खण्ड)')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Display Order (Sort Index)', 'प्रदर्शन क्रम (नम्बर)')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={aboutForm.display_order ?? 1}
                        onChange={e => setAboutForm({ ...aboutForm, display_order: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Status', 'अवस्था')}
                      </label>
                      <select
                        value={aboutForm.status || 'published'}
                        onChange={e => setAboutForm({ ...aboutForm, status: e.target.value as 'published' | 'draft' })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="published">{t('Published (सार्वजनिक)', 'Published (सार्वजनिक)')}</option>
                        <option value="draft">{t('Draft (मस्यौदा)', 'Draft (मस्यौदा)')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <input
                      type="checkbox"
                      id="about-enabled-toggle"
                      checked={aboutForm.is_enabled !== false}
                      onChange={e => setAboutForm({ ...aboutForm, is_enabled: e.target.checked })}
                      className="w-4 h-4 text-[#1E40AF] rounded border-slate-300 focus:ring-[#1E40AF]"
                    />
                    <label htmlFor="about-enabled-toggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      {t('Enable Section on Public About Page', 'यस खण्डलाई सार्वजनिक परिचय पृष्ठमा सक्रिय गर्नुहोस्')}
                    </label>
                  </div>

                  {/* Institutional Story & Body Content with INLINE IMAGE SUPPORT */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <AboutContentEditor
                      valueEn={aboutForm.content_en || ''}
                      valueNp={aboutForm.content_np || ''}
                      onChangeEn={(val) => setAboutForm({ ...aboutForm, content_en: val })}
                      onChangeNp={(val) => setAboutForm({ ...aboutForm, content_np: val })}
                      lang={lang}
                      onShowToast={onShowToast}
                      labelEn={t('Section Story & Narrative (English)', 'खण्डको विवरण तथा कथा (अंग्रेजी)')}
                      labelNp={t('खण्डको विवरण तथा कथा (नेपाली)', 'खण्डको विवरण तथा कथा (नेपाली)')}
                    />
                  </div>
                </div>

                {/* Right Column: Background Media (Image, GIF, URL) & Position Controls */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#1E40AF] dark:text-blue-400" />
                        <span>{t('Background Media', 'खण्डको पृष्ठभूमि मिडिया')}</span>
                      </label>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[#1E40AF] dark:text-blue-300">
                        {t('Cover Layer', 'कभर तह')}
                      </span>
                    </div>

                    <CmsMediaBackgroundControl
                      lang={lang}
                      label={t('Card Background Media', 'कार्डको पृष्ठभूमि मिडिया')}
                      description={t('Upload JPG, PNG, GIF (≤1 MB) or use external HTTPS media URL.', 'JPG, PNG, GIF (≤१ MB) अपलोड गर्नुहोस् वा HTTPS URL प्रयोग गर्नुहोस्।')}
                      mediaUrl={aboutForm.image}
                      sourceType={aboutForm.background_source || (aboutForm.image?.startsWith('http') ? 'url' : 'upload')}
                      mediaType={aboutForm.background_media_type || (aboutForm.image?.toLowerCase().endsWith('.gif') ? 'gif' : 'image')}
                      onMediaChange={(url, source, type) => {
                        setAboutForm({
                          ...aboutForm,
                          image: url,
                          background_source: source,
                          background_media_type: type
                        });
                      }}
                      onMediaRemove={() => {
                        setAboutForm({
                          ...aboutForm,
                          image: '',
                          background_source: 'upload',
                          background_media_type: 'image',
                          image_caption_en: '',
                          image_caption_np: ''
                        });
                      }}
                      maxSizeMB={1}
                      allowedFormats={['jpg', 'jpeg', 'png', 'gif']}
                      category="about_image"
                      onShowToast={onShowToast}
                    />

                    {aboutForm.image && (
                      <div className="space-y-3 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('Background Position', 'पृष्ठभूमि स्थिति')}
                          </label>
                          <select
                            value={aboutForm.image_position || 'center'}
                            onChange={e => setAboutForm({ ...aboutForm, image_position: e.target.value as any })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          >
                            <option value="center">{t('Center (Default)', 'केन्द्र (पूर्वनिर्धारित)')}</option>
                            <option value="top">{t('Top', 'माथि')}</option>
                            <option value="bottom">{t('Bottom', 'तल')}</option>
                            <option value="left">{t('Left', 'बायाँ')}</option>
                            <option value="right">{t('Right', 'दायाँ')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('Banner Caption (English)', 'क्याप्सन (अंग्रेजी)')}
                          </label>
                          <input
                            type="text"
                            value={aboutForm.image_caption_en || ''}
                            onChange={e => setAboutForm({ ...aboutForm, image_caption_en: e.target.value })}
                            placeholder={t('Caption for section banner', 'क्याप्सन लेख्नुहोस्')}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('क्याप्सन (नेपाली)', 'क्याप्सन (नेपाली)')}
                          </label>
                          <input
                            type="text"
                            value={aboutForm.image_caption_np || ''}
                            onChange={e => setAboutForm({ ...aboutForm, image_caption_np: e.target.value })}
                            placeholder={t('क्याप्सन लेख्नुहोस्', 'क्याप्सन लेख्नुहोस्')}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* About Sections List */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {t('Configured About Sections (Display Sequence)', 'व्यवस्थित परिचय खण्डहरू (क्रम अनुसार)')}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t('Use Up / Down buttons to reorder how sections appear on the public About page.', 'माथि / तल बटनहरू प्रयोग गरी खण्डहरूको क्रम परिवर्तन गर्नुहोस्।')}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300">
                  {effectiveAboutSections.length} {t('Sections', 'खण्डहरू')}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {effectiveAboutSections.map((section, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === effectiveAboutSections.length - 1;

                  return (
                    <div
                      key={section.id}
                      className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                        editingAboutId === section.id
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 -mx-4 px-4 rounded-xl'
                          : ''
                      }`}
                    >
                      {/* Left side: Order controls + Image preview + Title & Details */}
                      <div
                        onClick={() => setViewingAboutSection(section)}
                        className="flex items-start gap-3 cursor-pointer group flex-1 min-w-0"
                        title={t('Click to preview section', 'पूर्वावलोकन गर्न थिच्नुहोस्')}
                      >
                        {/* Order adjustment buttons */}
                        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMoveAboutOrder(section.id, 'up')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            title={t('Move Up', 'माथि सार्नुहोस्')}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            #{section.display_order ?? (idx + 1)}
                          </span>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMoveAboutOrder(section.id, 'down')}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            title={t('Move Down', 'तल सार्नुहोस्')}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Image or Icon thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center group-hover:scale-105 transition">
                          {section.image && section.image.trim() ? (
                            <img
                              src={section.image}
                              alt={section.title_en}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Compass className="w-6 h-6 text-[#1E40AF] opacity-60" />
                          )}
                        </div>

                        {/* Text info */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {t(section.title_en, section.title_np)}
                            </h5>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-[#1E40AF] dark:bg-blue-900/40 dark:text-blue-300 uppercase">
                              {section.category || 'section'}
                            </span>
                            {section.status === 'published' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                {t('Published', 'प्रकाशित')}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                {t('Draft', 'मस्यौदा')}
                              </span>
                            )}
                            {section.is_enabled === false && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                                {t('Disabled', 'निष्क्रिय')}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 max-w-xl">
                            {t(section.content_en, section.content_np) || t('No narrative text provided.', 'कुनै सामग्री प्रविष्ट गरिएको छैन।')}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Action controls */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        {/* Toggle Status (Publish/Draft) */}
                        <button
                          type="button"
                          onClick={() => handleToggleAboutStatus(section)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                            section.status === 'published'
                              ? 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                              : 'border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                          }`}
                          title={t('Toggle Published / Draft', 'प्रकाशित वा मस्यौदा परिवर्तन गर्नुहोस्')}
                        >
                          {section.status === 'published' ? t('Unpublish', 'अप्रकाशित') : t('Publish', 'प्रकाशित गर्नुहोस्')}
                        </button>

                        {/* Toggle Visibility Enable / Disable */}
                        <IconActionButton
                          action="view"
                          size="sm"
                          icon={section.is_enabled !== false ? Eye : EyeOff}
                          onClick={() => handleToggleAboutEnabled(section)}
                          tooltip={section.is_enabled !== false ? t('Disable Section', 'निष्क्रिय गर्नुहोस्') : t('Enable Section', 'सक्रिय गर्नुहोस्')}
                          aria-label={section.is_enabled !== false ? t('Disable Section', 'निष्क्रिय गर्नुहोस्') : t('Enable Section', 'सक्रिय गर्नुहोस्')}
                        />

                        {/* Edit Section */}
                        <IconActionButton
                          action="edit"
                          size="sm"
                          onClick={() => handleEditAboutSection(section)}
                          tooltip={t('Edit Section', 'सम्पादन गर्नुहोस्')}
                          aria-label={t('Edit Section', 'सम्पादन गर्नुहोस्')}
                        />

                        {/* Delete Section */}
                        <IconActionButton
                          action="delete"
                          size="sm"
                          onClick={() => handleDeleteAboutSection(section.id)}
                          tooltip={t('Delete Section', 'मेटाउनुहोस्')}
                          aria-label={t('Delete Section', 'मेटाउनुहोस्')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Facilities CRUD */}
          <form onSubmit={handleSaveFacility} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1E40AF]" />
                  <span>{facilityForm.id ? t('Edit Campus Facility', 'पूर्वाधार सम्पादन') : t('Add Campus Facility / Laboratory', 'नयाँ पूर्वाधार तथा प्रयोगशाला थप्नुहोस्')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Manage specialized science laboratories, ICT labs, library, and sports complexes', 'विज्ञान प्रयोगशाला, कम्प्युटर ल्याब, पुस्तकालय तथा खेल मैदान')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{facilityForm.id ? t('Update Facility', 'अपडेट गर्नुहोस्') : t('Add Facility', 'थप्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Facility Name (English) *', 'पूर्वाधार नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={facilityForm.title_en || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, title_en: e.target.value })}
                  placeholder="e.g., Optical Fiber ICT Studio"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('पूर्वाधार नाम (नेपाली) *', 'पूर्वाधार नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  value={facilityForm.title_np || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, title_np: e.target.value })}
                  placeholder="जस्तै: सूचना तथा प्रविधि (ICT) केन्द्र"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Technical Specifications & Overview (English)', 'विवरण (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={facilityForm.desc_en || ''}
                  onChange={e => setFacilityForm({ ...facilityForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </form>

          {/* Facility Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {facilities.map((f) => (
              <div key={f.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xl">{f.icon}</span>
                  <div className="flex items-center gap-1">
                    <IconActionButton
                      action="edit"
                      size="sm"
                      onClick={() => {
                        setFacilityForm(f);
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                      }}
                      tooltip={t('Edit Facility', 'पूर्वाधार सम्पादन')}
                      aria-label={t('Edit Facility', 'पूर्वाधार सम्पादन')}
                    />
                    <IconActionButton
                      action="delete"
                      size="sm"
                      onClick={() => handleDeleteFacility(f.id)}
                      tooltip={t('Delete Facility', 'मेटाउनुहोस्')}
                      aria-label={t('Delete Facility', 'मेटाउनुहोस्')}
                    />
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(f.title_en, f.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(f.desc_en, f.desc_np)}
                </p>
              </div>
            ))}
          </div>

          {/* Academic Programs CRUD */}
          <form onSubmit={handleSaveProgram} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xs mt-8">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#1E40AF]" />
                  <span>{programForm.id ? t('Edit Academic Program', 'शैक्षिक कार्यक्रम सम्पादन') : t('Add Academic Program', 'नयाँ शैक्षिक कार्यक्रम थप्नुहोस्')}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Curriculum levels: Secondary (Grades 1-10) and Higher Secondary (+2 Science & Management)', 'माध्यमिक तथा उच्च माध्यमिक (+२) शैक्षिक कार्यक्रम व्यवस्थापन')}
                </p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>{programForm.id ? t('Update Program', 'अपडेट गर्नुहोस्') : t('Create Program', 'थप्नुहोस्')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Program Title (English) *', 'कार्यक्रमको नाम (अंग्रेजी) *')}
                </label>
                <input
                  type="text"
                  required
                  value={programForm.title_en || ''}
                  onChange={e => setProgramForm({ ...programForm, title_en: e.target.value })}
                  placeholder="e.g., Higher Secondary (+2 Computer Science)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('कार्यक्रमको नाम (नेपाली) *', 'कार्यक्रमको नाम (नेपाली) *')}
                </label>
                <input
                  type="text"
                  value={programForm.title_np || ''}
                  onChange={e => setProgramForm({ ...programForm, title_np: e.target.value })}
                  placeholder="जस्तै: उच्च माध्यमिक (+२ कम्प्युटर विज्ञान)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Academic Level', 'तह')}
                </label>
                <input
                  type="text"
                  value={programForm.level || ''}
                  onChange={e => setProgramForm({ ...programForm, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Annual Student Intake Capacity', 'वार्षिक सिट संख्या')}
                </label>
                <input
                  type="number"
                  value={programForm.intake || 40}
                  onChange={e => setProgramForm({ ...programForm, intake: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Curriculum Description (English)', 'पाठ्यक्रम विवरण (अंग्रेजी)')}
                </label>
                <textarea
                  rows={2}
                  value={programForm.desc_en || ''}
                  onChange={e => setProgramForm({ ...programForm, desc_en: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </form>

          {/* Program Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {programs.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#1E40AF] bg-[#1E40AF]/10 px-2 py-0.5 rounded">
                    Intake: {p.intake} Students
                  </span>
                  <div className="flex items-center gap-1">
                    <IconActionButton
                      action="edit"
                      size="sm"
                      onClick={() => {
                        setProgramForm(p);
                        window.scrollTo({ top: 500, behavior: 'smooth' });
                      }}
                      tooltip={t('Edit Program', 'कार्यक्रम सम्पादन')}
                      aria-label={t('Edit Program', 'कार्यक्रम सम्पादन')}
                    />
                    <IconActionButton
                      action="delete"
                      size="sm"
                      onClick={() => handleDeleteProgram(p.id)}
                      tooltip={t('Delete Program', 'मेटाउनुहोस्')}
                      aria-label={t('Delete Program', 'मेटाउनुहोस्')}
                    />
                  </div>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {t(p.title_en, p.title_np)}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {t(p.desc_en, p.desc_np)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details View Modals */}
      {viewingNotice && (
        <AdminViewDetailsModal
          isOpen={true}
          onClose={() => setViewingNotice(null)}
          title={t(viewingNotice.title_en, viewingNotice.title_np)}
          subtitle={`${viewingNotice.category.toUpperCase()} • ${t(viewingNotice.date_en, viewingNotice.date_np)}`}
          badge={{
            label: (viewingNotice.status === 'draft' || viewingNotice.published === false) ? 'DRAFT' : viewingNotice.pinned ? 'PINNED' : 'PUBLISHED',
            variant: (viewingNotice.status === 'draft' || viewingNotice.published === false) ? 'warning' : viewingNotice.pinned ? 'warning' : 'success'
          }}
          fields={[
            { label: t('Title (English)', 'शीर्षक (अंग्रेजी)'), value: viewingNotice.title_en },
            { label: t('Title (Nepali)', 'शीर्षक (नेपाली)'), value: viewingNotice.title_np },
            { label: t('Category', 'श्रेणी'), value: viewingNotice.category },
            { label: t('Lifecycle Status', 'प्रकाशन स्थिति'), value: (viewingNotice.status === 'draft' || viewingNotice.published === false) ? t('Draft (Staging)', 'मस्यौदा') : t('Published (Public)', 'प्रकाशित (सार्वजनिक)') },
            { label: t('Date', 'मिति'), value: `${viewingNotice.date_en} (${viewingNotice.date_np})` },
            { label: t('Pinned to Banner', 'ब्यानर पिन'), value: viewingNotice.pinned ? t('Yes (Pinned)', 'हो') : t('No', 'होइन') },
            { label: t('Attached File', 'संलग्न फाइल'), value: viewingNotice.file_name ? `${viewingNotice.file_name} (${viewingNotice.file_size_kb} KB)` : t('None', 'कुनै छैन') },
            { label: t('Content (English)', 'विवरण (अंग्रेजी)'), value: viewingNotice.description_en, fullWidth: true },
            { label: t('Content (Nepali)', 'विवरण (नेपाली)'), value: viewingNotice.description_np, fullWidth: true }
          ]}
          actions={(
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTogglePublishNotice(viewingNotice.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  (viewingNotice.status === 'draft' || viewingNotice.published === false)
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {(viewingNotice.status === 'draft' || viewingNotice.published === false)
                  ? t('Publish Notice', 'प्रकाशित गर्नुहोस्')
                  : t('Unpublish (Move to Draft)', 'अप्रकाशित (मस्यौदा) गर्नुहोस्')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const n = viewingNotice;
                  setViewingNotice(null);
                  setNoticeForm(n);
                  setIsEditingNotice(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
              >
                {t('Edit Notice', 'सम्पादन गर्नुहोस्')}
              </button>
            </div>
          )}
        />
      )}

      {viewingAboutSection && (
        <AdminViewDetailsModal
          isOpen={true}
          onClose={() => setViewingAboutSection(null)}
          title={t(viewingAboutSection.title_en, viewingAboutSection.title_np)}
          subtitle={`${viewingAboutSection.category.toUpperCase()} • ${t('Order', 'क्रम')}: ${viewingAboutSection.display_order}`}
          badge={{
            label: viewingAboutSection.status === 'published' ? 'PUBLISHED' : 'DRAFT',
            variant: viewingAboutSection.status === 'published' ? 'success' : 'warning'
          }}
          fields={[
            { label: t('Title (English)', 'शीर्षक (अंग्रेजी)'), value: viewingAboutSection.title_en },
            { label: t('Title (Nepali)', 'शीर्षक (नेपाली)'), value: viewingAboutSection.title_np },
            { label: t('Category', 'श्रेणी'), value: viewingAboutSection.category },
            { label: t('Display Order', 'क्रम सङ्ख्या'), value: String(viewingAboutSection.display_order) },
            { label: t('Lifecycle Status', 'प्रकाशन स्थिति'), value: viewingAboutSection.status === 'published' ? t('Published', 'प्रकाशित') : t('Draft', 'मस्यौदा') },
            { label: t('Visibility', 'दृश्यता'), value: viewingAboutSection.is_enabled !== false ? t('Enabled (Visible)', 'सक्रिय') : t('Disabled (Hidden)', 'निष्क्रिय') },
            { label: t('Media Asset', 'मिडिया'), value: viewingAboutSection.image ? viewingAboutSection.image : t('None', 'कुनै छैन') },
            { label: t('Content (English)', 'विवरण (अंग्रेजी)'), value: viewingAboutSection.content_en, fullWidth: true },
            { label: t('Content (Nepali)', 'विवरण (नेपाली)'), value: viewingAboutSection.content_np, fullWidth: true }
          ]}
          actions={(
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleToggleAboutStatus(viewingAboutSection);
                  setViewingAboutSection({
                    ...viewingAboutSection,
                    status: viewingAboutSection.status === 'published' ? 'draft' : 'published'
                  });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  viewingAboutSection.status === 'published'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {viewingAboutSection.status === 'published'
                  ? t('Unpublish (Draft)', 'अप्रकाशित (मस्यौदा) गर्नुहोस्')
                  : t('Publish Section', 'प्रकाशित गर्नुहोस्')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const s = viewingAboutSection;
                  setViewingAboutSection(null);
                  handleEditAboutSection(s);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
              >
                {t('Edit Section', 'सम्पादन गर्नुहोस्')}
              </button>
            </div>
          )}
        />
      )}

      {viewingDoc && (
        <AdminViewDetailsModal
          isOpen={true}
          onClose={() => setViewingDoc(null)}
          title={t(viewingDoc.title_en, viewingDoc.title_np)}
          subtitle={`${viewingDoc.type} • ${viewingDoc.size}`}
          badge={{ label: 'AVAILABLE', variant: 'info' }}
          fields={[
            { label: t('Document Title (English)', 'शीर्षक (अंग्रेजी)'), value: viewingDoc.title_en },
            { label: t('Document Title (Nepali)', 'शीर्षक (नेपाली)'), value: viewingDoc.title_np },
            { label: t('File Format', 'ढाँचा'), value: viewingDoc.type },
            { label: t('File Size', 'साइज'), value: viewingDoc.size },
            { label: t('Publish Date', 'प्रकाशन मिति'), value: viewingDoc.date },
            { label: t('File Name', 'फाइल नाम'), value: viewingDoc.file_name || t('Institutional Resource', 'विद्यालय स्रोत') }
          ]}
          actions={(
            <button
              type="button"
              onClick={() => {
                const d = viewingDoc;
                setViewingDoc(null);
                setDocForm(d);
                setIsEditingDoc(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#1E40AF] text-white text-xs font-semibold hover:bg-[#1D4ED8] cursor-pointer"
            >
              {t('Edit Document', 'सम्पादन गर्नुहोस्')}
            </button>
          )}
        />
      )}

      {/* 2. NOTICES & CIRCULARS */}
      {activeSubTab === 'content_notices' && (
        <div className="space-y-4">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Notices', 'सूचना तथा परिपत्र')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Manage school circulars, academic notices, and official announcements.', 'विद्यालयका सूचना, परीक्षा तालिका र परिपत्रहरू व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
              {canCreateNotice && (
                <button
                  type="button"
                  onClick={() => {
                    setNoticeForm({
                      title_en: '',
                      title_np: '',
                      category: 'academic',
                      pinned: false,
                      show_qr: false,
                      reference_no: '',
                      file_name: '',
                      file_data: '',
                      file_size_kb: 0,
                      description_en: '',
                      description_np: ''
                    });
                    setIsEditingNotice(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                  <span>{t('+ Add Notice', '+ नयाँ सूचना थप्नुहोस्')}</span>
                </button>
              )}
          </div>

          {/* Edit / Create Form Drawer (Requirements 10, 11) */}
          <AdminDrawer
            isOpen={isEditingNotice}
            onClose={() => setIsEditingNotice(false)}
            title={noticeForm.id ? t('Edit Notice', 'सूचना सम्पादन') : t('Publish New Circular / Notice', 'नयाँ सूचना प्रकाशित गर्नुहोस्')}
            subtitle={t('Manage circular title, bilingual details, attachment, and alert pinning.', 'सूचना विवरण, वर्ग, संलग्न कागजात तथा गृहपृष्ठ पिन व्यवस्थापन।')}
            icon={Bell}
            width="lg"
            onSave={handleSaveNotice}
            saveLabel={noticeForm.id ? t('Update Notice', 'अद्यावधिक') : t('Publish Notice', 'प्रकाशित गर्नुहोस्')}
            cancelLabel={t('Cancel', 'रद्द')}
          >
            <form onSubmit={handleSaveNotice} id="notice-drawer-form" className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Notice Title (English) *', 'सूचना शीर्षक (अंग्रेजी) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeForm.title_en || ''}
                    onChange={e => setNoticeForm({ ...noticeForm, title_en: e.target.value })}
                    placeholder="e.g., Annual Examination Routine 2083"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सूचना शीर्षक (नेपाली) *', 'सूचना शीर्षक (नेपाली) *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={noticeForm.title_np || ''}
                    onChange={e => setNoticeForm({ ...noticeForm, title_np: e.target.value })}
                    placeholder="जस्तै: वार्षिक परीक्षा तालिका २०८३"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Category', 'वर्गीकरण')}
                  </label>
                  <select
                    value={noticeForm.category || 'academic'}
                    onChange={e => setNoticeForm({ ...noticeForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  >
                    <option value="academic">{t('Academic (शैक्षिक)', 'शैक्षिक')}</option>
                    <option value="exam">{t('Exam Routine (परीक्षा तालिका)', 'परीक्षा')}</option>
                    <option value="scholarship">{t('Scholarship (छात्रवृत्ति)', 'छात्रवृत्ति')}</option>
                    <option value="admin">{t('Administrative (प्रशासनिक)', 'प्रशासनिक')}</option>
                    <option value="event">{t('Events (कार्यक्रम)', 'कार्यक्रम')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Publication Lifecycle Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={noticeForm.status || (noticeForm.published === false ? 'draft' : 'published')}
                    onChange={e => setNoticeForm({
                      ...noticeForm,
                      status: e.target.value as 'published' | 'draft',
                      published: e.target.value === 'published',
                      is_published: e.target.value === 'published'
                    })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  >
                    <option value="published">{t('Published (Live on Public Portal)', 'प्रकाशित (सार्वजनिक)')}</option>
                    <option value="draft">{t('Draft (Internal Staging Only)', 'मस्यौदा (आन्तरिक)')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Attach PDF Document (Max 200KB)', 'संलग्न PDF फाइल (अधिकतम २००KB)')}
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('Upload PDF', 'PDF छान्नुहोस्')}</span>
                      <input type="file" accept="application/pdf" onChange={handleNoticeFileUpload} className="hidden" />
                    </label>
                    {noticeForm.file_name && (
                      <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                        {noticeForm.file_name} ({noticeForm.file_size_kb}KB)
                      </span>
                    )}
                  </div>
                  {noticeFileError && <p className="text-[10px] text-red-500 mt-1">{noticeFileError}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Notice Full Content (English)', 'विस्तृत व्यहोरा (अंग्रेजी)')}
                  </label>
                  <textarea
                    rows={3}
                    value={noticeForm.description_en || ''}
                    onChange={e => setNoticeForm({ ...noticeForm, description_en: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('विस्तृत व्यहोरा (नेपाली)', 'विस्तृत व्यहोरा (नेपाली)')}
                  </label>
                  <textarea
                    rows={3}
                    value={noticeForm.description_np || ''}
                    onChange={e => setNoticeForm({ ...noticeForm, description_np: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Official Notice Reference Number (Optional)', 'आधिकारिक चलानी / सन्दर्भ नम्बर (ऐच्छिक)')}
                  </label>
                  <input
                    type="text"
                    value={noticeForm.reference_no || ''}
                    onChange={e => setNoticeForm({ ...noticeForm, reference_no: e.target.value })}
                    placeholder="e.g., ISS-NOTICE-001 or ISS-EXAM-001"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('Leave blank to automatically display record identifier (e.g. ISS-NOTICE-001)', 'खाली राखेमा स्वचालित रुपमा ISS-NOTICE-001 ढाँचामा देखाइनेछ')}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={noticeForm.pinned || false}
                        onChange={e => setNoticeForm({ ...noticeForm, pinned: e.target.checked })}
                        className="w-4 h-4 text-[#1E40AF] rounded"
                      />
                      <span>{t('Pin notice to homepage top alert banner', 'यस सूचनालाई गृहपृष्ठको शीर्ष भागमा पिन गर्नुहोस्')}</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(noticeForm.show_qr || noticeForm.qr_code_enabled)}
                        onChange={e => setNoticeForm({
                          ...noticeForm,
                          show_qr: e.target.checked,
                          qr_code_enabled: e.target.checked
                        })}
                        className="w-4 h-4 text-[#1E40AF] rounded"
                      />
                      <div>
                        <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                          {t('Show QR Code (Default: OFF)', 'QR कोड देखाउनुहोस् (डिफल्ट: निष्क्रिय)')}
                        </span>
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {t('Encodes official public notice link for physical boards, PDFs, and verification', 'भौतिक सूचना पाटी वा प्रिन्टको लागि आधिकारिक सार्वजनिक लिङ्क')}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </AdminDrawer>

          {/* Compact Toolbar */}
          <AdminCrudToolbar
            searchValue={noticeSearch}
            onSearchChange={setNoticeSearch}
            searchPlaceholder={t('Search notices by title...', 'सूचना शीर्षक खोज्नुहोस्...')}
            statusValue={noticeStatusFilter}
            onStatusChange={setNoticeStatusFilter}
            statusOptions={[
              { label: t('All Status', 'सबै स्थिति'), value: 'all' },
              { label: t('Published', 'प्रकाशित'), value: 'published' },
              { label: t('Draft', 'मस्यौदा'), value: 'draft' },
              { label: t('Pinned', 'पिन गरिएका'), value: 'pinned' },
              { label: t('Regular', 'सामान्य'), value: 'regular' }
            ]}
            filterValue={noticeCategoryFilter}
            onFilterChange={setNoticeCategoryFilter}
            filterOptions={[
              { label: t('All Categories', 'सबै वर्ग'), value: 'all' },
              { label: t('Academic', 'शैक्षिक'), value: 'academic' },
              { label: t('Exam', 'परीक्षा'), value: 'exam' },
              { label: t('Scholarship', 'छात्रवृत्ति'), value: 'scholarship' },
              { label: t('Administrative', 'प्रशासनिक'), value: 'admin' },
              { label: t('Events', 'कार्यक्रम'), value: 'event' }
            ]}
            totalCount={notices.length}
            filteredCount={filteredNotices.length}
          />

          {/* Empty State (Requirement 22: When a module has no records) */}
          {notices.length === 0 ? (
            <CmsEmptyState
              title={t('No notices published yet.', 'कुनै सूचना प्रकाशित गरिएको छैन।')}
              description={t(
                'Publish your first official school notice, exam routine, or academic announcement.',
                'आधिकारिक विद्यालय सूचना, परीक्षा तालिका वा शैक्षिक घोषणा प्रकाशित गर्नुहोस्।'
              )}
              actionLabel={t('+ Add Notice', '+ नयाँ सूचना थप्नुहोस्')}
              onAction={() => {
                setNoticeForm({
                  title_en: '',
                  title_np: '',
                  date_en: new Date().toISOString().split('T')[0],
                  date_np: '२०८३-०५-१५',
                  category: 'academic',
                  description_en: '',
                  description_np: '',
                  file_name: '',
                  file_data: '',
                  file_size_kb: 0,
                  pinned: false
                });
                setIsEditingNotice(true);
              }}
              icon={Bell}
            />
          ) : (
            /* Standard CRUD Table */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('Title / Circular', 'शीर्षक / सूचना')}</th>
                      <th className="px-4 py-3">{t('Category / Type', 'श्रेणी / प्रकार')}</th>
                      <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                      <th className="px-4 py-3">{t('Date', 'मिति')}</th>
                      <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredNotices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          {t('No notices found matching search criteria.', 'कुनै सूचना फेला परेन।')}
                        </td>
                      </tr>
                    ) : (
                      filteredNotices.map((n) => (
                        <tr
                          key={n.id}
                          onClick={() => setViewingNotice(n)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white truncate block max-w-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {t(n.title_en, n.title_np)}
                              </span>
                              {n.file_name && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 font-mono shrink-0">
                                  <FileText className="w-2.5 h-2.5" />
                                  <span>PDF</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                              {n.category}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {n.status === 'draft' || n.published === false ? (
                              <CmsStatusBadge status="draft" label={t('Draft', 'मस्यौदा')} />
                            ) : n.pinned ? (
                              <CmsStatusBadge status="pinned" label={t('Pinned', 'पिन गरिएको')} />
                            ) : (
                              <CmsStatusBadge status="published" label={t('Published', 'प्रकाशित')} />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono text-slate-500">
                              {t(n.date_en, n.date_np)}
                            </span>
                          </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <AdminActionMenu
                            actions={[
                              ...(canUpdateNotice ? [
                                {
                                  id: 'toggle-publish',
                                  label: (n.status === 'draft' || n.published === false)
                                    ? t('Publish Notice', 'प्रकाशित गर्नुहोस्')
                                    : t('Unpublish (Draft)', 'अप्रकाशित (मस्यौदा) गर्नुहोस्'),
                                  icon: (n.status === 'draft' || n.published === false) ? CheckCircle2 : EyeOff,
                                  onClick: () => handleTogglePublishNotice(n.id)
                                },
                                {
                                  id: 'edit',
                                  label: t('Edit Notice', 'सम्पादन गर्नुहोस्'),
                                  icon: Edit3,
                                  onClick: () => {
                                    setNoticeForm(n);
                                    setIsEditingNotice(true);
                                  }
                                },
                                {
                                  id: 'pin',
                                  label: n.pinned ? t('Unpin Notice', 'अनपिन गर्नुहोस्') : t('Pin to Top', 'शीर्षमा पिन गर्नुहोस्'),
                                  icon: Pin,
                                  onClick: () => handleTogglePinNotice(n.id)
                                }
                              ] : []),
                              ...(n.file_data ? [{
                                id: 'download',
                                label: t('Download PDF', 'PDF डाउनलोड'),
                                icon: FileDown,
                                onClick: () => {
                                  const link = document.createElement('a');
                                  link.href = n.file_data || '';
                                  link.download = n.file_name || 'notice.pdf';
                                  link.click();
                                }
                              }] : []),
                              ...(canDeleteNotice ? [{
                                id: 'delete',
                                label: t('Delete Notice', 'मेटाउनुहोस्'),
                                icon: Trash2,
                                danger: true,
                                onClick: () => handleDeleteNotice(n.id)
                              }] : [])
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

      {/* 3. DOCUMENTS & DOWNLOADS */}
      {activeSubTab === 'content_documents' && (
        <div className="space-y-4">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Documents', 'दस्तावेज तथा फारम')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Manage school documents, application forms, syllabi, and downloadable files.', 'विद्यालयका आवेदन फारम, निर्देशिका, पाठ्यक्रम र नागरिक बडापत्र व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            {canUploadDoc && (
              <button
                type="button"
                onClick={() => {
                  setDocForm({
                    title_en: '',
                    title_np: '',
                    type: 'PDF',
                    size: '100 KB',
                    date: '2083-05-15',
                    file_name: '',
                    file_data: '',
                    file_size_kb: 0
                  });
                  setIsEditingDoc(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>{t('+ Upload Document', '+ दस्तावेज थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* Edit / Upload Document Modal (Requirement 20: Document Upload UI) */}
          {isEditingDoc && (
            <div className="mb-6">
              <CmsDocumentUploader
                initialData={docForm}
                onCancel={() => {
                  setIsEditingDoc(false);
                  setDocForm({
                    title_en: '',
                    title_np: '',
                    type: 'PDF',
                    size: '100 KB',
                    date: '2083-05-15',
                    file_name: '',
                    file_data: '',
                    file_size_kb: 0,
                    status: 'published'
                  });
                }}
                onSave={async (uploaded) => {
                  if (docForm.id) {
                    const updated = documents.map((d) =>
                      d.id === docForm.id
                        ? ({
                            ...d,
                            title_en: uploaded.title_en,
                            title_np: uploaded.title_np,
                            description_en: uploaded.description_en,
                            type: 'PDF',
                            size: `${uploaded.file_size_kb} KB`,
                            file_name: uploaded.file_name,
                            file_data: uploaded.file_data,
                            file_size_kb: uploaded.file_size_kb,
                            status: uploaded.status
                          } as DocumentItem)
                        : d
                    );
                    await onUpdateDocuments(updated);
                    onShowToast(t('Document updated successfully.', 'दस्तावेज अद्यावधिक गरियो।'));
                  } else {
                    const newDoc: DocumentItem = {
                      id: Date.now(),
                      title_en: uploaded.title_en,
                      title_np: uploaded.title_np || uploaded.title_en,
                      description_en: uploaded.description_en,
                      type: 'PDF',
                      size: `${uploaded.file_size_kb} KB`,
                      date: new Date().toISOString().split('T')[0],
                      file_name: uploaded.file_name,
                      file_data: uploaded.file_data,
                      file_size_kb: uploaded.file_size_kb,
                      status: uploaded.status
                    };
                    await onUpdateDocuments([newDoc, ...documents]);
                    onShowToast(t('Document uploaded successfully.', 'दस्तावेज सफलतापूर्वक अपलोड गरियो।'));
                  }
                  setIsEditingDoc(false);
                }}
              />
            </div>
          )}

          {/* Compact Toolbar */}
          <AdminCrudToolbar
            searchValue={docSearch}
            onSearchChange={setDocSearch}
            searchPlaceholder={t('Search documents...', 'दस्तावेज खोज्नुहोस्...')}
            statusValue={docStatusFilter}
            onStatusChange={setDocStatusFilter}
            statusOptions={[
              { label: t('All Status', 'सबै स्थिति'), value: 'all' },
              { label: t('Available', 'उपलब्ध'), value: 'available' }
            ]}
            filterValue={docCategoryFilter}
            onFilterChange={setDocCategoryFilter}
            filterOptions={[
              { label: t('All Formats', 'सबै ढाँचा'), value: 'all' },
              { label: t('PDF Files', 'PDF फाइल'), value: 'pdf' },
              { label: t('Forms & Applications', 'फारम तथा निवेदन'), value: 'form' }
            ]}
            totalCount={documents.length}
            filteredCount={filteredDocuments.length}
          />

          {/* Empty State (Requirement 22: When a module has no records) */}
          {documents.length === 0 ? (
            <CmsEmptyState
              title={t('No documents yet.', 'कुनै दस्तावेजहरू छैनन्।')}
              description={t(
                'Upload your first school document to make it available on the public website.',
                'सार्वजनिक वेबसाइटमा उपलब्ध गराउन आफ्नो पहिलो विद्यालय दस्तावेज अपलोड गर्नुहोस्।'
              )}
              actionLabel={t('Upload Document', 'दस्तावेज अपलोड गर्नुहोस्')}
              onAction={() => {
                setDocForm({
                  title_en: '',
                  title_np: '',
                  type: 'PDF',
                  size: '100 KB',
                  date: '2083-05-15',
                  file_name: '',
                  file_data: '',
                  file_size_kb: 0,
                  status: 'published'
                });
                setIsEditingDoc(true);
              }}
              icon={FileText}
            />
          ) : (
            /* Standard CRUD Table */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('Title / Resource', 'शीर्षक / दस्तावेज')}</th>
                      <th className="px-4 py-3">{t('Type / Format', 'ढाँचा')}</th>
                      <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                      <th className="px-4 py-3">{t('File Size / Date', 'साइज / मिति')}</th>
                      <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          {t('No documents matching search criteria.', 'खोजिएका मापदण्ड अनुसार कुनै दस्तावेज फेला परेन।')}
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((d) => (
                        <tr
                          key={d.id}
                          onClick={() => setViewingDoc(d)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white truncate block max-w-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {t(d.title_en, d.title_np)}
                              </span>
                              {d.file_data && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 font-mono shrink-0">
                                  <FileCheck className="w-2.5 h-2.5" />
                                  <span>PDF</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase font-mono">
                              {d.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <CmsStatusBadge status={d.status || 'published'} />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono text-slate-500">
                              {d.size} • {d.date}
                            </span>
                          </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <AdminActionMenu
                            actions={[
                              ...(canUploadDoc ? [{
                                id: 'edit',
                                label: t('Edit Document', 'सम्पादन गर्नुहोस्'),
                                icon: Edit3,
                                onClick: () => {
                                  setDocForm(d);
                                  setIsEditingDoc(true);
                                }
                              }] : []),
                              ...(d.file_data ? [{
                                id: 'download',
                                label: t('Download File', 'फाइल डाउनलोड'),
                                icon: FileDown,
                                onClick: () => {
                                  const link = document.createElement('a');
                                  link.href = d.file_data || '';
                                  link.download = d.file_name || `${d.title_en}.pdf`;
                                  link.click();
                                }
                              }] : []),
                              ...(canDeleteDoc ? [{
                                id: 'delete',
                                label: t('Delete Document', 'मेटाउनुहोस्'),
                                icon: Trash2,
                                danger: true,
                                onClick: () => handleDeleteDocument(d.id)
                              }] : [])
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

      {/* 4. EVENTS, ACHIEVEMENTS & HISTORY */}
      {(activeSubTab === 'content_events' || activeSubTab === 'content_achievements' || activeSubTab === 'content_history') && (
        <EventsAchievementsHistoryTab
          lang={lang}
          school={school}
          onUpdateSchool={onUpdateSchool}
          events={events}
          onUpdateEvents={onUpdateEvents}
          achievements={achievements}
          onUpdateAchievements={onUpdateAchievements}
          history={history}
          onUpdateHistory={onUpdateHistory}
          onShowToast={onShowToast}
          activeCategory={
            activeSubTab === 'content_events' ? 'events' :
            activeSubTab === 'content_achievements' ? 'achievements' : 'history'
          }
        />
      )}
    </div>
  );
};
