import React, { useState } from 'react';
import {
  Language,
  SchoolData,
  StaffMember
} from '../../types';
import {
  UserCheck,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  User,
  X,
  AlertCircle
} from 'lucide-react';
import { StaffAdminTab } from './StaffAdminTab';
import { AdminCrudToolbar } from './AdminCrudToolbar';
import { AdminActionMenu } from './AdminActionMenu';
import { IconActionButton } from '../../components/IconActionButton';
import { CmsFormSection } from './CmsFormSection';
import { CmsFormActions } from './CmsFormActions';
import { CmsImageUploader } from './CmsImageUploader';
import { CmsDeleteModal } from './CmsDeleteModal';
import { CmsItemViewModal } from './CmsItemViewModal';
import { CmsStatusBadge } from './CmsStatusBadge';
import { CmsEmptyState } from './CmsEmptyState';

interface AdminGovernanceTabProps {
  lang: Language;
  activeSubTab: 'gov_smc' | 'gov_chairman' | 'gov_principal' | 'gov_staff';
  school: SchoolData;
  onUpdateSchool: (data: SchoolData) => void;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  onShowToast: (msg: string) => void;
  canCreateStaff: boolean;
  canUpdateStaff: boolean;
  canDeleteStaff: boolean;
}

export const AdminGovernanceTab: React.FC<AdminGovernanceTabProps> = ({
  lang,
  activeSubTab,
  school,
  onUpdateSchool,
  staff,
  onUpdateStaff,
  onShowToast,
  canCreateStaff,
  canUpdateStaff,
  canDeleteStaff
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // Loading States for Duplicate Submission Prevention (Requirement 14)
  const [isSavingChairman, setIsSavingChairman] = useState(false);
  const [isSavingPrincipal, setIsSavingPrincipal] = useState(false);
  const [isSavingSmc, setIsSavingSmc] = useState(false);
  const [isDeletingSmc, setIsDeletingSmc] = useState(false);

  // Validation Error States (Requirement 11 & 16)
  const [chairmanErrors, setChairmanErrors] = useState<{ [key: string]: string }>({});
  const [principalErrors, setPrincipalErrors] = useState<{ [key: string]: string }>({});
  const [smcErrors, setSmcErrors] = useState<{ [key: string]: string }>({});

  // 1. Chairman state
  const [isEditingChairman, setIsEditingChairman] = useState(false);
  const [viewingChairman, setViewingChairman] = useState(false);
  const [chairmanSearch, setChairmanSearch] = useState('');
  const [chairmanStatus, setChairmanStatus] = useState('all');
  const [chairmanForm, setChairmanForm] = useState({
    name_en: school.chairman_name_en || 'Mr. Lokendra Bahadur Shrestha',
    name_np: school.chairman_name_np || 'श्री लोकेन्द्र बहादुर श्रेष्ठ',
    designation_en: school.chairman_designation_en || 'Chairman, School Management Committee',
    designation_np: school.chairman_designation_np || 'अध्यक्ष, विद्यालय व्यवस्थापन समिति',
    address_en: school.chairman_address_en || school.address_en || 'Ward No. 4, Baijanath, Banke, Nepal',
    address_np: school.chairman_address_np || school.address_np || 'वडा नं. ४, बैजनाथ, बाँके, नेपाल',
    message_en: school.chairman_message_en || 'Ishwari Secondary School remains dedicated to quality, inclusion, and transparent school governance. We work closely with the community, parents, and municipality to ensure an optimal learning environment for every child.',
    message_np: school.chairman_message_np || 'ईश्वरी माध्यमिक विद्यालय गुणस्तरीय, समावेशी र पारदर्शी विद्यालय सुशासनमा सधैं प्रतिबद्ध छ। हामी समुदाय, अभिभावक र स्थानीय सरकारसँग हातेमालो गर्दै प्रत्येक बालबालिकाको उज्ज्वल भविष्यका लागि समर्पित छौं।',
    image: school.chairman_image || '',
    status: school.chairman_status || 'published'
  });

  // 2. Principal state
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false);
  const [viewingPrincipal, setViewingPrincipal] = useState(false);
  const [principalSearch, setPrincipalSearch] = useState('');
  const [principalStatus, setPrincipalStatus] = useState('all');
  const [principalForm, setPrincipalForm] = useState({
    name_en: school.principal_name_en || 'Mr. Narayan Prasad Koirala',
    name_np: school.principal_name_np || 'श्री नारायण प्रसाद कोइराला',
    designation_en: school.principal_designation_en || 'Headmaster / Principal (M.Ed, M.A.)',
    designation_np: school.principal_designation_np || 'प्रधानाध्यापक',
    address_en: school.principal_address_en || school.address_en || 'Ward No. 4, Baijanath, Banke, Nepal',
    address_np: school.principal_address_np || school.address_np || 'वडा नं. ४, बैजनाथ, बाँके, नेपाल',
    message_en: school.principal_message_en || 'Welcome to Ishwari Secondary School. For over four decades, our institution has stood as a beacon of public education, blending academic rigor with compassionate moral values.',
    message_np: school.principal_message_np || 'ईश्वरी माध्यमिक विद्यालयको आधिकारिक डिजिटल पोर्टलमा यहाँहरूलाई हार्दिक स्वागत छ। वि.सं. २०३५ सालदेखि यस भेगकै अग्रणी सामुदायिक नमुना विद्यालयको रूपमा हामीले विद्यार्थीहरूको चौतर्फी विकासमा जोड दिँदै आएका छौं।',
    image: school.principal_image || '',
    status: school.principal_status || 'published'
  });

  // 3. SMC Member state
  const smcMembers = staff.filter(s => s.role === 'smc_chair' || s.role === 'smc_member');
  const [smcSearch, setSmcSearch] = useState('');
  const [smcRoleFilter, setSmcRoleFilter] = useState('all');
  const [isEditingSmc, setIsEditingSmc] = useState(false);
  const [viewingSmcMember, setViewingSmcMember] = useState<StaffMember | null>(null);
  const [deletingSmcMemberId, setDeletingSmcMemberId] = useState<number | null>(null);

  const [smcForm, setSmcForm] = useState<Partial<StaffMember> & { status?: string }>({
    id: undefined,
    name_en: '',
    name_np: '',
    role: 'smc_member',
    designation_en: '',
    designation_np: '',
    experience: '',
    department_en: 'Management Committee',
    status: 'published'
  });

  // Save Chairman (Requirements 11, 13, 14, 15, 16)
  const handleSaveChairman = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!chairmanForm.name_en.trim()) {
      errors.name_en = t('Chairman name is required.', 'अध्यक्षको नाम अनिवार्य छ।');
    }

    if (Object.keys(errors).length > 0) {
      setChairmanErrors(errors);
      onShowToast(t('Unable to update Chairman. Please check the information and try again.', 'अध्यक्षको विवरण अद्यावधिक गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।'));
      return;
    }

    setChairmanErrors({});
    setIsSavingChairman(true);

    try {
      await onUpdateSchool({
        ...school,
        chairman_name_en: chairmanForm.name_en.trim(),
        chairman_name_np: chairmanForm.name_np.trim(),
        chairman_designation_en: chairmanForm.designation_en.trim(),
        chairman_designation_np: chairmanForm.designation_np.trim(),
        chairman_address_en: chairmanForm.address_en.trim(),
        chairman_address_np: chairmanForm.address_np.trim(),
        chairman_message_en: chairmanForm.message_en.trim(),
        chairman_message_np: chairmanForm.message_np.trim(),
        chairman_image: chairmanForm.image,
        chairman_status: (chairmanForm.status as 'published' | 'draft') || 'published'
      });

      setIsEditingChairman(false);
      onShowToast(t('Chairman updated successfully.', 'अध्यक्षको विवरण अद्यावधिक गरियो।'));
    } catch (err) {
      onShowToast(t('Unable to update Chairman. Please check the information and try again.', 'अध्यक्षको विवरण अद्यावधिक गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।'));
    } finally {
      setIsSavingChairman(false);
    }
  };

  // Save Principal (Requirements 11, 13, 14, 15, 16)
  const handleSavePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!principalForm.name_en.trim()) {
      errors.name_en = t('Principal name is required.', 'प्रधानाध्यापकको नाम अनिवार्य छ।');
    }

    if (Object.keys(errors).length > 0) {
      setPrincipalErrors(errors);
      onShowToast(t('Unable to update Principal. Please check the information and try again.', 'प्रधानाध्यापकको विवरण अद्यावधिक गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।'));
      return;
    }

    setPrincipalErrors({});
    setIsSavingPrincipal(true);

    try {
      await onUpdateSchool({
        ...school,
        principal_name_en: principalForm.name_en.trim(),
        principal_name_np: principalForm.name_np.trim(),
        principal_designation_en: principalForm.designation_en.trim(),
        principal_designation_np: principalForm.designation_np.trim(),
        principal_address_en: principalForm.address_en.trim(),
        principal_address_np: principalForm.address_np.trim(),
        principal_message_en: principalForm.message_en.trim(),
        principal_message_np: principalForm.message_np.trim(),
        principal_image: principalForm.image,
        principal_status: (principalForm.status as 'published' | 'draft') || 'published'
      });

      setIsEditingPrincipal(false);
      onShowToast(t('Principal updated successfully.', 'प्रधानाध्यापकको विवरण अद्यावधिक गरियो।'));
    } catch (err) {
      onShowToast(t('Unable to update Principal. Please check the information and try again.', 'प्रधानाध्यापकको विवरण अद्यावधिक गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।'));
    } finally {
      setIsSavingPrincipal(false);
    }
  };

  // Save SMC Member (Requirements 11, 13, 14, 15, 16)
  const handleSaveSmcMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!smcForm.name_en?.trim()) {
      errors.name_en = t('Member name is required.', 'सदस्यको नाम अनिवार्य छ।');
    }
    if (!smcForm.designation_en?.trim()) {
      errors.designation_en = t('Designation is required.', 'पद अनिवार्य छ।');
    }

    if (Object.keys(errors).length > 0) {
      setSmcErrors(errors);
      onShowToast(t('Unable to save member. Please check the required fields and try again.', 'विवरण सुरक्षित गर्न सकिएन। कृपया आवश्यक विवरण जाँच गर्नुहोस्।'));
      return;
    }

    setSmcErrors({});
    setIsSavingSmc(true);

    try {
      if (smcForm.id) {
        await onUpdateStaff(staff.map(s => s.id === smcForm.id ? { ...s, ...smcForm } as StaffMember : s));
        onShowToast(t('SMC member updated successfully.', 'वि.व्य.स. सदस्य अद्यावधिक गरियो।'));
      } else {
        const newMember: StaffMember = {
          id: Date.now(),
          name_en: smcForm.name_en?.trim() || '',
          name_np: smcForm.name_np?.trim() || smcForm.name_en?.trim() || '',
          role: smcForm.role || 'smc_member',
          designation_en: smcForm.designation_en?.trim() || 'SMC Member',
          designation_np: smcForm.designation_np?.trim() || 'सदस्य',
          department_en: 'Management Committee',
          department_np: 'व्यवस्थापन समिति',
          qualification_en: '',
          qualification_np: '',
          experience: smcForm.experience?.trim() || 'Tenure Active',
          image: ''
        };
        await onUpdateStaff([newMember, ...staff]);
        onShowToast(t('SMC member added successfully.', 'नयाँ वि.व्य.स. सदस्य थपियो।'));
      }

      setSmcForm({
        id: undefined,
        name_en: '',
        name_np: '',
        role: 'smc_member',
        designation_en: '',
        designation_np: '',
        experience: '',
        status: 'published'
      });
      setIsEditingSmc(false);
    } catch (err) {
      onShowToast(t('Unable to save SMC member. Please check the information and try again.', 'वि.व्य.स. सदस्य सुरक्षित गर्न सकिएन। कृपया पुन: प्रयास गर्नुहोस्।'));
    } finally {
      setIsSavingSmc(false);
    }
  };

  // Confirm Delete SMC Member (Requirements 14, 16, 17)
  const handleConfirmDeleteSmc = async () => {
    if (!deletingSmcMemberId) return;
    setIsDeletingSmc(true);

    try {
      await onUpdateStaff(staff.filter(s => s.id !== deletingSmcMemberId));
      onShowToast(t('SMC member deleted successfully.', 'वि.व्य.स. सदस्य हटाइयो।'));
      setDeletingSmcMemberId(null);
    } catch (err) {
      onShowToast(t('Unable to delete member. Please try again.', 'सदस्य हटाउन सकिएन। कृपया पुन: प्रयास गर्नुहोस्।'));
    } finally {
      setIsDeletingSmc(false);
    }
  };

  const filteredSmcMembers = smcMembers.filter(m => {
    const q = smcSearch.toLowerCase();
    const matchSearch = !q || m.name_en.toLowerCase().includes(q) || m.name_np.toLowerCase().includes(q) || m.designation_en.toLowerCase().includes(q);
    const matchRole = smcRoleFilter === 'all' || m.role === smcRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {/* 1. VIEW / READ MODE MODALS (Requirement 18) */}
      {viewingChairman && (
        <CmsItemViewModal
          isOpen={true}
          onClose={() => setViewingChairman(false)}
          onEdit={() => {
            setViewingChairman(false);
            setIsEditingChairman(true);
          }}
          title={t('Chairman Profile', 'वि.व्य.स. अध्यक्ष विवरण')}
          subtitle={t('School Management Committee Leadership', 'विद्यालय व्यवस्थापन समिति नेतृत्व')}
          photo={chairmanForm.image}
          photoAlt="Chairman Portrait"
          badge={{
            label: chairmanForm.status === 'draft' ? t('DRAFT', 'ड्राफ्ट') : t('PUBLISHED', 'प्रकाशित'),
            variant: chairmanForm.status === 'draft' ? 'draft' : 'published'
          }}
          fields={[
            { label: t('Full Name', 'पूरा नाम'), value: `${chairmanForm.name_en} (${chairmanForm.name_np})` },
            { label: t('Designation', 'पद'), value: `${chairmanForm.designation_en} / ${chairmanForm.designation_np}` },
            { label: t('Institutional Address', 'संस्थागत ठेगाना'), value: chairmanForm.address_en },
            { label: t('Official Message', 'आधिकारिक सन्देश'), value: chairmanForm.message_en, fullWidth: true }
          ]}
          editLabel={t('Edit', 'सम्पादन')}
          closeLabel={t('Close', 'बन्द')}
        />
      )}

      {viewingPrincipal && (
        <CmsItemViewModal
          isOpen={true}
          onClose={() => setViewingPrincipal(false)}
          onEdit={() => {
            setViewingPrincipal(false);
            setIsEditingPrincipal(true);
          }}
          title={t('Principal Profile', 'प्रधानाध्यापक विवरण')}
          subtitle={t('Academic & Institutional Head', 'शैक्षिक तथा संस्थागत प्रमुख')}
          photo={principalForm.image}
          photoAlt="Principal Portrait"
          badge={{
            label: principalForm.status === 'draft' ? t('DRAFT', 'ड्राफ्ट') : t('PUBLISHED', 'प्रकाशित'),
            variant: principalForm.status === 'draft' ? 'draft' : 'published'
          }}
          fields={[
            { label: t('Full Name', 'पूरा नाम'), value: `${principalForm.name_en} (${principalForm.name_np})` },
            { label: t('Designation & Qualifications', 'पद र योग्यता'), value: `${principalForm.designation_en} / ${principalForm.designation_np}` },
            { label: t('Institutional Address', 'संस्थागत ठेगाना'), value: principalForm.address_en },
            { label: t('Official Message', 'आधिकारिक सन्देश'), value: principalForm.message_en, fullWidth: true }
          ]}
          editLabel={t('Edit', 'सम्पादन')}
          closeLabel={t('Close', 'बन्द')}
        />
      )}

      {viewingSmcMember && (
        <CmsItemViewModal
          isOpen={true}
          onClose={() => setViewingSmcMember(null)}
          onEdit={() => {
            const memberToEdit = viewingSmcMember;
            setViewingSmcMember(null);
            setSmcForm(memberToEdit);
            setIsEditingSmc(true);
          }}
          title={t('SMC Member Profile', 'वि.व्य.स. सदस्य विवरण')}
          subtitle={t('School Management Committee', 'विद्यालय व्यवस्थापन समिति')}
          badge={{ label: t('ACTIVE', 'सक्रिय'), variant: 'active' }}
          fields={[
            { label: t('Full Name', 'पूरा नाम'), value: `${viewingSmcMember.name_en} (${viewingSmcMember.name_np || '—'})` },
            { label: t('Committee Designation', 'समिति पद'), value: viewingSmcMember.designation_en },
            { label: t('Role Category', 'भूमिका श्रेणी'), value: viewingSmcMember.role === 'smc_chair' ? 'SMC Chairman' : 'Committee Member' },
            { label: t('Tenure / Experience', 'अवधि / अनुभव'), value: viewingSmcMember.experience || 'Active Member' }
          ]}
          editLabel={t('Edit', 'सम्पादन')}
          closeLabel={t('Close', 'बन्द')}
        />
      )}

      {/* DELETE CONFIRMATION MODAL (Requirement 17) */}
      <CmsDeleteModal
        isOpen={deletingSmcMemberId !== null}
        onClose={() => {
          if (!isDeletingSmc) setDeletingSmcMemberId(null);
        }}
        onConfirm={handleConfirmDeleteSmc}
        title={t('Delete SMC Member?', 'वि.व्य.स. सदस्य हटाउने?')}
        description={t('This action cannot be undone.', 'यो कार्य पूर्ववत गर्न सकिँदैन।')}
        consequence={t('This will remove the member from the committee roster.', 'यसले सदस्यलाई समिति सूचीबाट हटाउनेछ।')}
        isLoading={isDeletingSmc}
        cancelLabel={t('Cancel', 'रद्द')}
        deleteLabel={t('Delete', 'मेटाउनुहोस्')}
      />

      {/* ========================================================================= */}
      {/* 1. CHAIRMAN MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'gov_chairman' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Chairman', 'वि.व्य.स. अध्यक्ष')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Manage School Management Committee Chairman profile and official address.', 'विद्यालय व्यवस्थापन समिति अध्यक्षको विवरण र आधिकारिक सन्देश व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setChairmanErrors({});
                setIsEditingChairman(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>{t('Edit Chairman Profile', 'अध्यक्ष विवरण सम्पादन')}</span>
            </button>
          </div>

          {/* EDIT CHAIRMAN FORM (Requirements 11, 12, 13, 14, 19) */}
          {isEditingChairman && (
            <form onSubmit={handleSaveChairman} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Chairman Profile', 'अध्यक्षको प्रोफाइल')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Update official details, institutional message, and public photo.', 'आधिकारिक विवरण, संस्थागत सन्देश तथा तस्वीर अद्यावधिक गर्नुहोस्।')}
                  </p>
                </div>
                <IconActionButton
                  action="close"
                  size="sm"
                  onClick={() => setIsEditingChairman(false)}
                  tooltip={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                  aria-label={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                />
              </div>

              {/* Section 1: Basic Information */}
              <CmsFormSection
                title={t('Basic Information', 'आधारभूत जानकारी')}
                description={t('Full legal name and official governance designation.', 'पूरा नाम र पद')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Name', 'नाम')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={chairmanForm.name_en}
                      onChange={e => {
                        setChairmanForm({ ...chairmanForm, name_en: e.target.value });
                        if (chairmanErrors.name_en) setChairmanErrors(prev => ({ ...prev, name_en: '' }));
                      }}
                      placeholder={t('e.g. Lokendra Bahadur Shrestha', 'जस्तै: लोकेन्द्र बहादुर श्रेष्ठ')}
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                        chairmanErrors.name_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                      }`}
                    />
                    {chairmanErrors.name_en && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{chairmanErrors.name_en}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('अध्यक्षको नाम (नेपाली)', 'अध्यक्षको नाम (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={chairmanForm.name_np}
                      onChange={e => setChairmanForm({ ...chairmanForm, name_np: e.target.value })}
                      placeholder="जस्तै: श्री लोकेन्द्र बहादुर श्रेष्ठ"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Designation', 'पद')}
                    </label>
                    <input
                      type="text"
                      value={chairmanForm.designation_en}
                      onChange={e => setChairmanForm({ ...chairmanForm, designation_en: e.target.value })}
                      placeholder={t('e.g. Chairman, School Management Committee', 'जस्तै: अध्यक्ष, वि.व्य.स.')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('पद (नेपाली)', 'पद (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={chairmanForm.designation_np}
                      onChange={e => setChairmanForm({ ...chairmanForm, designation_np: e.target.value })}
                      placeholder="जस्तै: अध्यक्ष, विद्यालय व्यवस्थापन समिति"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </CmsFormSection>

              {/* Section 2: Profile */}
              <CmsFormSection
                title={t('Profile', 'प्रोफाइल')}
                description={t('Institutional address, official message, and portrait photo.', 'ठेगाना, सन्देश र तस्वीर')}
              >
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Institutional Address', 'संस्थागत ठेगाना')}
                      </label>
                      <input
                        type="text"
                        value={chairmanForm.address_en}
                        onChange={e => setChairmanForm({ ...chairmanForm, address_en: e.target.value })}
                        placeholder={t('e.g. Baijanath-5, Banke, Nepal', 'जस्तै: बैजनाथ-५, बाँके, नेपाल')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('ठेगाना (नेपाली)', 'ठेगाना (नेपाली)')}
                      </label>
                      <input
                        type="text"
                        value={chairmanForm.address_np}
                        onChange={e => setChairmanForm({ ...chairmanForm, address_np: e.target.value })}
                        placeholder="जस्तै: बैजनाथ-५, बाँके, नेपाल"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Message', 'सन्देश')}
                    </label>
                    <textarea
                      rows={3}
                      value={chairmanForm.message_en}
                      onChange={e => setChairmanForm({ ...chairmanForm, message_en: e.target.value })}
                      placeholder={t('Enter official address or message from the Chairman...', 'अध्यक्षको आधिकारिक सन्देश...')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('सन्देश (नेपाली)', 'सन्देश (नेपाली)')}
                    </label>
                    <textarea
                      rows={3}
                      value={chairmanForm.message_np}
                      onChange={e => setChairmanForm({ ...chairmanForm, message_np: e.target.value })}
                      placeholder="अध्यक्षको आधिकारिक सन्देश नेपालीमा लेख्नुहोस्..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  {/* Standard Image Uploader (Requirement 19) */}
                  <CmsImageUploader
                    label={t('Profile Image', 'प्रोफाइल तस्वीर')}
                    value={chairmanForm.image}
                    onChange={(url) => setChairmanForm({ ...chairmanForm, image: url })}
                    onRemove={() => setChairmanForm({ ...chairmanForm, image: '' })}
                    aspectRatio="square"
                    maxSizeMb={2}
                  />
                </div>
              </CmsFormSection>

              {/* Section 3: Publication */}
              <CmsFormSection
                title={t('Publication', 'प्रकाशन')}
                description={t('Control public visibility of this profile.', 'सार्वजनिक दृश्यता नियन्त्रण गर्नुहोस्')}
              >
                <div className="max-w-xs text-xs">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Publication Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={chairmanForm.status}
                    onChange={e => setChairmanForm({ ...chairmanForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                  >
                    <option value="published">{t('Published', 'प्रकाशित')}</option>
                    <option value="draft">{t('Draft / Hidden', 'ड्राफ्ट / लुकाइएको')}</option>
                  </select>
                </div>
              </CmsFormSection>

              {/* Actions (Requirement 13 & 14) */}
              <CmsFormActions
                type="edit"
                onCancel={() => setIsEditingChairman(false)}
                isLoading={isSavingChairman}
                saveLabel={t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्')}
                cancelLabel={t('Cancel', 'रद्द')}
                loadingLabel={t('Saving...', 'सुरक्षित गर्दै...')}
              />
            </form>
          )}

          {/* Chairman Empty State (Requirement 22) */}
          {!school.chairman_name_en?.trim() ? (
            <CmsEmptyState
              title={t('No Chairman profile found.', 'कुनै अध्यक्षको प्रोफाइल फेला परेन।')}
              description={t(
                'Add the School Management Committee Chairman profile with official designation, address, and message.',
                'विद्यालय व्यवस्थापन समिति अध्यक्षको आधिकारिक विवरण तथा सन्देश थप्नुहोस्।'
              )}
              actionLabel={t('Add Chairman', 'अध्यक्ष थप्नुहोस्')}
              onAction={() => setIsEditingChairman(true)}
              icon={UserCheck}
            />
          ) : (
            <>
              {/* Compact Toolbar */}
              <AdminCrudToolbar
                searchValue={chairmanSearch}
                onSearchChange={setChairmanSearch}
                searchPlaceholder={t('Search chairman...', 'अध्यक्ष खोज्नुहोस्...')}
                statusValue={chairmanStatus}
                onStatusChange={setChairmanStatus}
                statusOptions={[
                  { label: t('All Status', 'सबै स्थिति'), value: 'all' },
                  { label: t('Published', 'प्रकाशित'), value: 'published' },
                  { label: t('Draft', 'ड्राफ्ट'), value: 'draft' }
                ]}
                totalCount={1}
                filteredCount={1}
              />

              {/* Standard CRUD Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">{t('Name', 'नाम')}</th>
                        <th className="px-4 py-3">{t('Designation', 'पद')}</th>
                        <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                        <th className="px-4 py-3">{t('Updated', 'अद्यावधिक')}</th>
                        <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr
                        onClick={() => setViewingChairman(true)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {chairmanForm.image && chairmanForm.image.trim() ? (
                                <img src={chairmanForm.image} alt="Chairman" className="w-full h-full object-cover" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                                {t(chairmanForm.name_en, chairmanForm.name_np)}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {chairmanForm.name_np}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {t(chairmanForm.designation_en, chairmanForm.designation_np)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <CmsStatusBadge
                            status={chairmanForm.status}
                            label={chairmanForm.status === 'draft' ? t('Draft', 'ड्राफ्ट') : t('Published', 'प्रकाशित')}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date().toISOString().split('T')[0]}
                          </span>
                        </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <AdminActionMenu
                        actions={[
                          {
                            id: 'edit',
                            label: t('Edit Profile', 'सम्पादन गर्नुहोस्'),
                            icon: Edit3,
                            onClick: () => {
                              setChairmanErrors({});
                              setIsEditingChairman(true);
                            }
                          }
                        ]}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )}

      {/* ========================================================================= */}
      {/* 2. PRINCIPAL MANAGEMENT PAGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'gov_principal' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Principal', 'प्रधानाध्यापक')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t("Manage Principal's official profile, message, and academic tenure.", 'प्रधानाध्यापकको सन्देश, योग्यता र आधिकारिक प्रोफाइल व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPrincipalErrors({});
                setIsEditingPrincipal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>{t('Edit Principal Profile', 'प्रधानाध्यापक सम्पादन')}</span>
            </button>
          </div>

          {/* EDIT PRINCIPAL FORM (Requirements 11, 12, 13, 14, 19) */}
          {isEditingPrincipal && (
            <form onSubmit={handleSavePrincipal} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('Principal Profile', 'प्रधानाध्यापकको प्रोफाइल')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('Update headmaster credentials, message to students, and institutional photo.', 'प्रधानाध्यापकको विवरण, सन्देश तथा तस्वीर अद्यावधिक गर्नुहोस्।')}
                  </p>
                </div>
                <IconActionButton
                  action="close"
                  size="sm"
                  onClick={() => setIsEditingPrincipal(false)}
                  tooltip={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                  aria-label={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                />
              </div>

              {/* Section 1: Basic Information */}
              <CmsFormSection
                title={t('Basic Information', 'आधारभूत जानकारी')}
                description={t('Principal official name and academic qualifications.', 'प्रधानाध्यापकको नाम र शैक्षिक योग्यता')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Name', 'नाम')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={principalForm.name_en}
                      onChange={e => {
                        setPrincipalForm({ ...principalForm, name_en: e.target.value });
                        if (principalErrors.name_en) setPrincipalErrors(prev => ({ ...prev, name_en: '' }));
                      }}
                      placeholder={t('e.g. Mr. Narayan Prasad Koirala', 'जस्तै: श्री नारायण प्रसाद कोइराला')}
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                        principalErrors.name_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                      }`}
                    />
                    {principalErrors.name_en && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{principalErrors.name_en}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('प्रधानाध्यापकको नाम (नेपाली)', 'प्रधानाध्यापकको नाम (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={principalForm.name_np}
                      onChange={e => setPrincipalForm({ ...principalForm, name_np: e.target.value })}
                      placeholder="जस्तै: श्री नारायण प्रसाद कोइराला"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Designation & Qualifications', 'पद तथा योग्यता')}
                    </label>
                    <input
                      type="text"
                      value={principalForm.designation_en}
                      onChange={e => setPrincipalForm({ ...principalForm, designation_en: e.target.value })}
                      placeholder={t('e.g. Headmaster / Principal (M.Ed, M.A.)', 'जस्तै: प्रधानाध्यापक (एम.एड.)')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('पद तथा योग्यता (नेपाली)', 'पद तथा योग्यता (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={principalForm.designation_np}
                      onChange={e => setPrincipalForm({ ...principalForm, designation_np: e.target.value })}
                      placeholder="जस्तै: प्रधानाध्यापक"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </CmsFormSection>

              {/* Section 2: Profile */}
              <CmsFormSection
                title={t('Profile', 'प्रोफाइल')}
                description={t('Institutional address, welcome message, and portrait photograph.', 'ठेगाना, स्वागत सन्देश र तस्वीर')}
              >
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('Institutional Address', 'संस्थागत ठेगाना')}
                      </label>
                      <input
                        type="text"
                        value={principalForm.address_en}
                        onChange={e => setPrincipalForm({ ...principalForm, address_en: e.target.value })}
                        placeholder={t('e.g. Baijanath-5, Banke, Nepal', 'जस्तै: बैजनाथ-५, बाँके, नेपाल')}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t('ठेगाना (नेपाली)', 'ठेगाना (नेपाली)')}
                      </label>
                      <input
                        type="text"
                        value={principalForm.address_np}
                        onChange={e => setPrincipalForm({ ...principalForm, address_np: e.target.value })}
                        placeholder="जस्तै: बैजनाथ-५, बाँके, नेपाल"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Official Message / Welcome Speech', 'आधिकारिक सन्देश')}
                    </label>
                    <textarea
                      rows={3}
                      value={principalForm.message_en}
                      onChange={e => setPrincipalForm({ ...principalForm, message_en: e.target.value })}
                      placeholder={t('Enter official welcome address from the Principal...', 'प्रधानाध्यापकको सन्देश...')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('सन्देश (नेपाली)', 'सन्देश (नेपाली)')}
                    </label>
                    <textarea
                      rows={3}
                      value={principalForm.message_np}
                      onChange={e => setPrincipalForm({ ...principalForm, message_np: e.target.value })}
                      placeholder="प्रधानाध्यापकको आधिकारिक सन्देश नेपालीमा लेख्नुहोस्..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  {/* Standard Image Uploader (Requirement 19) */}
                  <CmsImageUploader
                    label={t('Principal Photo', 'प्रधानाध्यापकको तस्वीर')}
                    value={principalForm.image}
                    onChange={(url) => setPrincipalForm({ ...principalForm, image: url })}
                    onRemove={() => setPrincipalForm({ ...principalForm, image: '' })}
                    aspectRatio="square"
                    maxSizeMb={2}
                  />
                </div>
              </CmsFormSection>

              {/* Section 3: Publication */}
              <CmsFormSection
                title={t('Publication', 'प्रकाशन')}
                description={t('Control public visibility of the Principal desk.', 'सार्वजनिक दृश्यता नियन्त्रण गर्नुहोस्')}
              >
                <div className="max-w-xs text-xs">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Publication Status', 'प्रकाशन स्थिति')}
                  </label>
                  <select
                    value={principalForm.status}
                    onChange={e => setPrincipalForm({ ...principalForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                  >
                    <option value="published">{t('Published', 'प्रकाशित')}</option>
                    <option value="draft">{t('Draft / Hidden', 'ड्राफ्ट / लुकाइएको')}</option>
                  </select>
                </div>
              </CmsFormSection>

              {/* Actions (Requirement 13 & 14) */}
              <CmsFormActions
                type="edit"
                onCancel={() => setIsEditingPrincipal(false)}
                isLoading={isSavingPrincipal}
                saveLabel={t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्')}
                cancelLabel={t('Cancel', 'रद्द')}
                loadingLabel={t('Saving...', 'सुरक्षित गर्दै...')}
              />
            </form>
          )}

          {/* Principal Empty State (Requirement 22) */}
          {!school.principal_name_en?.trim() ? (
            <CmsEmptyState
              title={t('No Principal profile found.', 'कुनै प्रधानाध्यापकको प्रोफाइल फेला परेन।')}
              description={t(
                'Add the Principal profile with official designation, address, and academic leadership message.',
                'प्रधानाध्यापकको आधिकारिक विवरण, योग्यता तथा सन्देश थप्नुहोस्।'
              )}
              actionLabel={t('Add Principal', 'प्रधानाध्यापक थप्नुहोस्')}
              onAction={() => setIsEditingPrincipal(true)}
              icon={GraduationCap}
            />
          ) : (
            <>
              {/* Compact Toolbar */}
              <AdminCrudToolbar
                searchValue={principalSearch}
                onSearchChange={setPrincipalSearch}
                searchPlaceholder={t('Search principal...', 'प्रधानाध्यापक खोज्नुहोस्...')}
                statusValue={principalStatus}
                onStatusChange={setPrincipalStatus}
                statusOptions={[
                  { label: t('All Status', 'सबै स्थिति'), value: 'all' },
                  { label: t('Published', 'प्रकाशित'), value: 'published' },
                  { label: t('Draft', 'ड्राफ्ट'), value: 'draft' }
                ]}
                totalCount={1}
                filteredCount={1}
              />

              {/* Standard CRUD Table */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">{t('Name', 'नाम')}</th>
                        <th className="px-4 py-3">{t('Designation', 'पद')}</th>
                        <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                        <th className="px-4 py-3">{t('Updated', 'अद्यावधिक')}</th>
                        <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      <tr
                        onClick={() => setViewingPrincipal(true)}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {principalForm.image && principalForm.image.trim() ? (
                                <img src={principalForm.image} alt="Principal" className="w-full h-full object-cover" />
                              ) : (
                                <GraduationCap className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white block truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                                {t(principalForm.name_en, principalForm.name_np)}
                              </span>
                              <span className="text-[10px] text-slate-400 block truncate">
                                {principalForm.name_np}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {t(principalForm.designation_en, principalForm.designation_np)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <CmsStatusBadge
                            status={principalForm.status}
                            label={principalForm.status === 'draft' ? t('Draft', 'ड्राफ्ट') : t('Published', 'प्रकाशित')}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date().toISOString().split('T')[0]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <AdminActionMenu
                            actions={[
                              {
                                id: 'edit',
                                label: t('Edit Profile', 'सम्पादन गर्नुहोस्'),
                                icon: Edit3,
                                onClick: () => {
                                  setPrincipalErrors({});
                                  setIsEditingPrincipal(true);
                                }
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SMC COMMITTEE ROSTER PAGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'gov_smc' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('SMC Committee Roster', 'वि.व्य.स. समिति सूची')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('Manage School Management Committee roster, parent delegates, and representatives.', 'विद्यालय व्यवस्थापन समिति पदाधिकारी, शिक्षक तथा अभिभावक प्रतिनिधिहरूको नामावली व्यवस्थापन गर्नुहोस्।')}
              </p>
            </div>
            {canCreateStaff && (
              <button
                type="button"
                onClick={() => {
                  setSmcErrors({});
                  setSmcForm({
                    id: undefined,
                    name_en: '',
                    name_np: '',
                    role: 'smc_member',
                    designation_en: '',
                    designation_np: '',
                    experience: 'Active Member',
                    status: 'published'
                  });
                  setIsEditingSmc(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>{t('+ Add Member', '+ सदस्य थप्नुहोस्')}</span>
              </button>
            )}
          </div>

          {/* EDIT / CREATE SMC MEMBER FORM (Requirements 11, 12, 13, 14) */}
          {isEditingSmc && (
            <form onSubmit={handleSaveSmcMember} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {smcForm.id ? t('Edit SMC Member', 'सदस्य विवरण सम्पादन') : t('Add SMC Member', 'नयाँ वि.व्य.स. सदस्य')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('School Management Committee representative coordinates and role category.', 'समिति सदस्यको भूमिका र विवरण।')}
                  </p>
                </div>
                <IconActionButton
                  action="close"
                  size="sm"
                  onClick={() => setIsEditingSmc(false)}
                  tooltip={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                  aria-label={t('Close Form', 'फारम बन्द गर्नुहोस्')}
                />
              </div>

              {/* Section 1: Member Information */}
              <CmsFormSection
                title={t('Member Information', 'सदस्य जानकारी')}
                description={t('Full legal name in English and Nepali.', 'नाम अंग्रेजी र नेपालीमा')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Name', 'नाम')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={smcForm.name_en || ''}
                      onChange={e => {
                        setSmcForm({ ...smcForm, name_en: e.target.value });
                        if (smcErrors.name_en) setSmcErrors(prev => ({ ...prev, name_en: '' }));
                      }}
                      placeholder={t('e.g. Lokendra Bahadur Shrestha', 'जस्तै: लोकेन्द्र बहादुर श्रेष्ठ')}
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                        smcErrors.name_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                      }`}
                    />
                    {smcErrors.name_en && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{smcErrors.name_en}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('नाम (नेपाली)', 'नाम (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={smcForm.name_np || ''}
                      onChange={e => setSmcForm({ ...smcForm, name_np: e.target.value })}
                      placeholder="जस्तै: लोकेन्द्र बहादुर श्रेष्ठ"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </CmsFormSection>

              {/* Section 2: Role & Designation */}
              <CmsFormSection
                title={t('Role & Designation', 'भूमिका तथा पद')}
                description={t('Committee position and representation details.', 'समिति पद र भूमिका')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Designation', 'पद')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={smcForm.designation_en || ''}
                      onChange={e => {
                        setSmcForm({ ...smcForm, designation_en: e.target.value });
                        if (smcErrors.designation_en) setSmcErrors(prev => ({ ...prev, designation_en: '' }));
                      }}
                      placeholder={t('e.g. Member / Parent Representative', 'जस्तै: सदस्य / अभिभावक प्रतिनिधि')}
                      className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                        smcErrors.designation_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                      }`}
                    />
                    {smcErrors.designation_en && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{smcErrors.designation_en}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('पद (नेपाली)', 'पद (नेपाली)')}
                    </label>
                    <input
                      type="text"
                      value={smcForm.designation_np || ''}
                      onChange={e => setSmcForm({ ...smcForm, designation_np: e.target.value })}
                      placeholder="जस्तै: सदस्य / अभिभावक प्रतिनिधि"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Role Category', 'भूमिका श्रेणी')}
                    </label>
                    <select
                      value={smcForm.role || 'smc_member'}
                      onChange={e => setSmcForm({ ...smcForm, role: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    >
                      <option value="smc_chair">{t('SMC Chairman', 'वि.व्य.स. अध्यक्ष')}</option>
                      <option value="smc_member">{t('SMC Member / Delegate', 'वि.व्य.स. सदस्य')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t('Tenure / Experience', 'अवधि / अनुभव')}
                    </label>
                    <input
                      type="text"
                      value={smcForm.experience || ''}
                      onChange={e => setSmcForm({ ...smcForm, experience: e.target.value })}
                      placeholder={t('e.g. 2081-2084 / 3 Years Tenure', 'जस्तै: २०८१-२०८४')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                    />
                  </div>
                </div>
              </CmsFormSection>

              {/* Section 3: Status */}
              <CmsFormSection
                title={t('Publication & Status', 'प्रकाशन र स्थिति')}
                description={t('Display status on official website.', 'वेबसाइटमा प्रदर्शन स्थिति')}
              >
                <div className="max-w-xs text-xs">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('Status', 'स्थिति')}
                  </label>
                  <select
                    value={smcForm.status || 'published'}
                    onChange={e => setSmcForm({ ...smcForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                  >
                    <option value="published">{t('Active / Published', 'सक्रिय / प्रकाशित')}</option>
                    <option value="draft">{t('Inactive / Hidden', 'निष्क्रिय / लुकाइएको')}</option>
                  </select>
                </div>
              </CmsFormSection>

              {/* Actions (Requirement 13 & 14) */}
              <CmsFormActions
                type={smcForm.id ? 'edit' : 'create'}
                onCancel={() => setIsEditingSmc(false)}
                isLoading={isSavingSmc}
                saveLabel={smcForm.id ? t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्') : t('Create', 'प्रविष्ट गर्नुहोस्')}
                cancelLabel={t('Cancel', 'रद्द')}
                loadingLabel={smcForm.id ? t('Saving...', 'सुरक्षित गर्दै...') : t('Creating...', 'प्रविष्ट गर्दै...')}
              />
            </form>
          )}

          {/* Compact Toolbar */}
          <AdminCrudToolbar
            searchValue={smcSearch}
            onSearchChange={setSmcSearch}
            searchPlaceholder={t('Search SMC members...', 'सदस्य खोज्नुहोस्...')}
            filterValue={smcRoleFilter}
            onFilterChange={setSmcRoleFilter}
            filterOptions={[
              { label: t('All Committee', 'सबै पदाधिकारी'), value: 'all' },
              { label: t('Chairman', 'अध्यक्ष'), value: 'smc_chair' },
              { label: t('Members', 'सदस्यहरू'), value: 'smc_member' }
            ]}
            totalCount={smcMembers.length}
            filteredCount={filteredSmcMembers.length}
          />

          {/* Standard CRUD Table */}
          {smcMembers.length === 0 ? (
            <CmsEmptyState
              title={t('No SMC members yet.', 'कुनै वि.व्य.स. सदस्यहरू छैनन्।')}
              description={t(
                'Add School Management Committee members and representatives to display on the public website.',
                'सार्वजनिक वेबसाइटमा देखाउन वि.व्य.स. पदाधिकारी तथा सदस्यहरू थप्नुहोस्।'
              )}
              actionLabel={t('Add Member', 'सदस्य थप्नुहोस्')}
              onAction={() => {
                setSmcErrors({});
                setSmcForm({
                  id: undefined,
                  name_en: '',
                  name_np: '',
                  role: 'smc_member',
                  designation_en: '',
                  designation_np: '',
                  experience: 'Active Member',
                  isActive: true
                });
                setIsEditingSmc(true);
              }}
              icon={UserCheck}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3">{t('Name', 'नाम')}</th>
                      <th className="px-4 py-3">{t('Designation', 'पद')}</th>
                      <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                      <th className="px-4 py-3">{t('Role Category', 'श्रेणी')}</th>
                      <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredSmcMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                          {t('No SMC members found matching your search.', 'कुनै वि.व्य.स. सदस्य फेला परेन।')}
                        </td>
                      </tr>
                    ) : (
                      filteredSmcMembers.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => setViewingSmcMember(m)}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                        >
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                              {t(m.name_en, m.name_np)}
                            </span>
                            {m.name_np && m.name_np !== m.name_en && (
                              <span className="text-[10px] text-slate-400 block truncate">{m.name_np}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {t(m.designation_en, m.designation_np)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <CmsStatusBadge
                              status={m.isActive === false ? 'inactive' : 'active'}
                              label={m.isActive === false ? t('Inactive', 'निष्क्रिय') : t('Active', 'सक्रिय')}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-mono text-slate-500">
                              {m.role === 'smc_chair' ? 'SMC Chairman' : 'Committee Member'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <AdminActionMenu
                              actions={[
                                ...(canUpdateStaff ? [{
                                  id: 'edit',
                                  label: t('Edit Member', 'सम्पादन गर्नुहोस्'),
                                  icon: Edit3,
                                  onClick: () => {
                                    setSmcErrors({});
                                    setSmcForm(m);
                                    setIsEditingSmc(true);
                                  }
                                }] : []),
                                ...(canDeleteStaff ? [{
                                  id: 'delete',
                                  label: t('Delete Member', 'मेटाउनुहोस्'),
                                  icon: Trash2,
                                  danger: true,
                                  onClick: () => setDeletingSmcMemberId(m.id)
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

      {/* ========================================================================= */}
      {/* 4. TEACHERS & STAFF PAGE */}
      {/* ========================================================================= */}
      {activeSubTab === 'gov_staff' && (
        <StaffAdminTab
          lang={lang}
          staff={staff}
          onUpdateStaff={onUpdateStaff}
          onShowToast={onShowToast}
          canCreate={canCreateStaff}
          canUpdate={canUpdateStaff}
          canDelete={canDeleteStaff}
        />
      )}
    </div>
  );
};
