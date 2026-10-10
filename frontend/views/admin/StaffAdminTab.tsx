import React, { useState } from 'react';
import { Language, StaffMember } from '../../types';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  User,
  Users,
  AlertCircle
} from 'lucide-react';
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
import { AdminDrawer } from './AdminDrawer';

interface StaffAdminTabProps {
  lang: Language;
  staff: StaffMember[];
  onUpdateStaff: (staff: StaffMember[]) => void;
  onShowToast: (msg: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const StaffAdminTab: React.FC<StaffAdminTabProps> = ({
  lang,
  staff,
  onUpdateStaff,
  onShowToast,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewingStaff, setViewingStaff] = useState<StaffMember | null>(null);
  const [deletingStaffId, setDeletingStaffId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState<StaffMember>({
    id: 0,
    name_en: '',
    name_np: '',
    role: 'teacher',
    designation_en: '',
    designation_np: '',
    department_en: '',
    department_np: '',
    qualification_en: '',
    qualification_np: '',
    experience: '5 Years Experience',
    image: '',
  });

  const handleResetForm = () => {
    setForm({
      id: 0,
      name_en: '',
      name_np: '',
      role: 'teacher',
      designation_en: '',
      designation_np: '',
      department_en: '',
      department_np: '',
      qualification_en: '',
      qualification_np: '',
      experience: '5 Years Experience',
      image: '',
    });
    setFormErrors({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!form.name_en.trim()) {
      errors.name_en = t('Staff name is required.', 'शिक्षकको नाम अनिवार्य छ।');
    }
    if (!form.designation_en.trim()) {
      errors.designation_en = t('Designation is required.', 'पद अनिवार्य छ।');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      onShowToast(t('Unable to save staff member. Please check the required fields.', 'विवरण सुरक्षित गर्न सकिएन। कृपया विवरण जाँच गर्नुहोस्।'));
      return;
    }

    setFormErrors({});
    setIsSaving(true);

    try {
      const isExisting = form.id !== 0;
      if (isExisting) {
        await onUpdateStaff(staff.map(s => s.id === form.id ? form : s));
        onShowToast(t('Staff member updated successfully.', 'शिक्षक विवरण अद्यावधिक भयो।'));
      } else {
        const newMember: StaffMember = {
          ...form,
          id: Date.now()
        };
        await onUpdateStaff([newMember, ...staff]);
        onShowToast(t('Staff member added successfully.', 'नयाँ शिक्षक सफलतापूर्वक थपियो।'));
      }

      setIsEditing(false);
      handleResetForm();
    } catch (err) {
      onShowToast(t('Unable to save staff member. Please try again.', 'शिक्षक विवरण सुरक्षित गर्न सकिएन। पुन: प्रयास गर्नुहोस्।'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStaffId) return;
    setIsDeleting(true);

    try {
      await onUpdateStaff(staff.filter(s => s.id !== deletingStaffId));
      onShowToast(t('Staff member deleted successfully.', 'शिक्षक विवरण हटाइयो।'));
      setDeletingStaffId(null);
    } catch (err) {
      onShowToast(t('Unable to delete staff member. Please try again.', 'विवरण हटाउन सकिएन।'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staff
    .filter(s => {
      if (statusFilter === 'all') return true;
      return true;
    })
    .filter(s => {
      if (roleFilter === 'all') return true;
      return s.role === roleFilter;
    })
    .filter(s => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name_en.toLowerCase().includes(q) ||
        s.name_np.toLowerCase().includes(q) ||
        s.designation_en.toLowerCase().includes(q) ||
        (s.department_en && s.department_en.toLowerCase().includes(q))
      );
    });

  return (
    <div className="space-y-4">
      {/* View / Read Mode Modal (Requirement 18) */}
      {viewingStaff && (
        <CmsItemViewModal
          isOpen={true}
          onClose={() => setViewingStaff(null)}
          onEdit={canUpdate ? () => {
            const s = viewingStaff;
            setViewingStaff(null);
            setForm({ ...s });
            setFormErrors({});
            setIsEditing(true);
          } : undefined}
          title={t(viewingStaff.name_en, viewingStaff.name_np)}
          subtitle={t(viewingStaff.designation_en, viewingStaff.designation_np)}
          photo={viewingStaff.image}
          photoAlt="Staff portrait"
          badge={{
            label: viewingStaff.role.toUpperCase(),
            variant: viewingStaff.role === 'principal' ? 'draft' : 'active'
          }}
          fields={[
            { label: t('Full Name', 'पूरा नाम'), value: `${viewingStaff.name_en} (${viewingStaff.name_np || '—'})` },
            { label: t('Designation', 'पद'), value: `${viewingStaff.designation_en} / ${viewingStaff.designation_np || '—'}` },
            { label: t('Department', 'विभाग'), value: viewingStaff.department_en || 'General Academic' },
            { label: t('Academic Qualifications', 'शैक्षिक योग्यता'), value: viewingStaff.qualification_en || 'Standard Certified' },
            { label: t('Experience / Tenure', 'अनुभव / सेवा अवधि'), value: viewingStaff.experience || 'Active Service' },
            { label: t('Account Role', 'खाता भूमिका'), value: viewingStaff.role }
          ]}
          editLabel={t('Edit', 'सम्पादन')}
          closeLabel={t('Close', 'बन्द')}
        />
      )}

      {/* Delete Confirmation Dialog (Requirement 17) */}
      <CmsDeleteModal
        isOpen={deletingStaffId !== null}
        onClose={() => {
          if (!isDeleting) setDeletingStaffId(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t('Delete Staff Member?', 'शिक्षक विवरण हटाउने?')}
        description={t('This action cannot be undone.', 'यो कार्य पूर्ववत गर्न सकिँदैन।')}
        consequence={t('This will remove the faculty profile from public school rosters immediately.', 'यसले शिक्षकको प्रोफाइल विद्यालयको सार्वजनिक सूचीबाट तत्काल हटाउनेछ।')}
        isLoading={isDeleting}
        cancelLabel={t('Cancel', 'रद्द')}
        deleteLabel={t('Delete', 'मेटाउनुहोस्')}
      />

      {/* Standard Page Header (Requirement 5) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {t('Teachers & Staff', 'शिक्षक तथा कर्मचारी')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Manage academic faculty, department heads, and non-teaching personnel.', 'शिक्षक, विभाग प्रमुख र प्रशासनिक कर्मचारीहरूको विवरण व्यवस्थापन गर्नुहोस्।')}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => {
              handleResetForm();
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow-2xs transition cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span>{t('+ Add Teacher', '+ शिक्षक थप्नुहोस्')}</span>
          </button>
        )}
      </div>

      {/* Create / Edit Form Drawer (Requirements 10, 11, 12, 13, 14, 19) */}
      <AdminDrawer
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          handleResetForm();
        }}
        title={form.id ? t('Edit Faculty Member', 'शिक्षक सम्पादन') : t('Add Faculty Member', 'नयाँ शिक्षक प्रविष्ट')}
        subtitle={t('Enter credentials, teaching department, and passport photo.', 'विवरण, अध्यापन विभाग तथा पासपोर्ट फोटो प्रविष्ट गर्नुहोस्।')}
        icon={User}
        width="lg"
        onSave={handleSave}
        isSaving={isSaving}
        saveLabel={form.id ? t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्') : t('Create Member', 'प्रविष्ट गर्नुहोस्')}
        cancelLabel={t('Cancel', 'रद्द')}
      >
        <form id="staff-admin-drawer-form" onSubmit={handleSave} className="space-y-5 text-xs">
          {/* Section 1: Basic Information */}
          <CmsFormSection
            title={t('Basic Information', 'आधारभूत जानकारी')}
            description={t('Full legal name in English and Nepali.', 'नाम अंग्रेजी र नेपालीमा')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Name', 'नाम')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name_en}
                  onChange={e => {
                    setForm({ ...form, name_en: e.target.value });
                    if (formErrors.name_en) setFormErrors(prev => ({ ...prev, name_en: '' }));
                  }}
                  placeholder={t('e.g. Ramesh Karki', 'जस्तै: रमेश कार्की')}
                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                    formErrors.name_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                  }`}
                />
                {formErrors.name_en && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.name_en}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('नाम (नेपाली)', 'नाम (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={form.name_np}
                  onChange={e => setForm({ ...form, name_np: e.target.value })}
                  placeholder="जस्तै: रमेश कार्की"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                />
              </div>
            </div>
          </CmsFormSection>

          {/* Section 2: Role & Department */}
          <CmsFormSection
            title={t('Role & Designation', 'भूमिका तथा पद')}
            description={t('Academic responsibility, teaching subject, and rank.', 'जिम्मेवारी, पद र अध्यापन विभाग')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Designation', 'पद')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.designation_en}
                  onChange={e => {
                    setForm({ ...form, designation_en: e.target.value });
                    if (formErrors.designation_en) setFormErrors(prev => ({ ...prev, designation_en: '' }));
                  }}
                  placeholder={t('e.g. Secondary Teacher / Department Head', 'जस्तै: माध्यमिक शिक्षक')}
                  className={`w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
                    formErrors.designation_en ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
                  }`}
                />
                {formErrors.designation_en && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.designation_en}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('पद (नेपाली)', 'पद (नेपाली)')}
                </label>
                <input
                  type="text"
                  value={form.designation_np}
                  onChange={e => setForm({ ...form, designation_np: e.target.value })}
                  placeholder="जस्तै: माध्यमिक शिक्षक"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Role Category', 'भूमिका श्रेणी')}
                </label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                >
                  <option value="teacher">{t('Teaching Faculty', 'शिक्षक')}</option>
                  <option value="principal">{t('Principal / Leadership', 'प्रधानाध्यापक')}</option>
                  <option value="admin">{t('Administrative Staff', 'प्रशासनिक')}</option>
                  <option value="smc_member">{t('SMC Member', 'वि.व्य.स. सदस्य')}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Department / Subject', 'विभाग / विषय')}
                </label>
                <input
                  type="text"
                  value={form.department_en || ''}
                  onChange={e => setForm({ ...form, department_en: e.target.value })}
                  placeholder={t('e.g. Mathematics / Science', 'जस्तै: गणित / विज्ञान')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Qualification', 'शैक्षिक योग्यता')}
                </label>
                <input
                  type="text"
                  value={form.qualification_en || ''}
                  onChange={e => setForm({ ...form, qualification_en: e.target.value })}
                  placeholder={t('e.g. M.Ed / B.Sc', 'जस्तै: एम.एड / बी.एससी')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('Experience / Tenure', 'अनुभव / सेवा अवधि')}
                </label>
                <input
                  type="text"
                  value={form.experience || ''}
                  onChange={e => setForm({ ...form, experience: e.target.value })}
                  placeholder={t('e.g. 5 Years Experience', 'जस्तै: ५ वर्ष अनुभव')}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
                />
              </div>
            </div>
          </CmsFormSection>

          {/* Section 3: Profile Photo (Requirement 19) */}
          <CmsFormSection
            title={t('Profile Image', 'प्रोफाइल तस्वीर')}
            description={t('Passport format photo for public school roster.', 'विद्यालयको नामावलीका लागि पासपोर्ट आकारको फोटो')}
          >
            <CmsImageUploader
              label={t('Passport Photo', 'पासपोर्ट फोटो')}
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
              onRemove={() => setForm({ ...form, image: '' })}
              aspectRatio="avatar"
              maxSizeMb={2}
            />
          </CmsFormSection>
        </form>
      </AdminDrawer>

      {/* Compact Toolbar */}
      <AdminCrudToolbar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={t('Search teachers by name, subject...', 'नाम वा विषय खोज्नुहोस्...')}
        statusValue={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { label: t('All Status', 'सबै स्थिति'), value: 'all' },
          { label: t('Active', 'सक्रिय'), value: 'active' }
        ]}
        filterValue={roleFilter}
        onFilterChange={setRoleFilter}
        filterOptions={[
          { label: t('All Roles', 'सबै भूमिका'), value: 'all' },
          { label: t('Teachers', 'शिक्षक'), value: 'teacher' },
          { label: t('Principal', 'प्रधानाध्यापक'), value: 'principal' },
          { label: t('Administration', 'प्रशासनिक'), value: 'admin' },
          { label: t('SMC', 'वि.व्य.स.'), value: 'smc_member' }
        ]}
        totalCount={staff.length}
        filteredCount={filteredStaff.length}
      />

      {/* Standard CRUD Data Table */}
      {staff.length === 0 ? (
        <CmsEmptyState
          title={t('No staff members yet.', 'कुनै शिक्षक तथा कर्मचारी छैनन्।')}
          description={t(
            'Add faculty and staff members to display on the school website directory.',
            'विद्यालय निर्देशिकामा देखाउन शिक्षक तथा कर्मचारी थप्नुहोस्।'
          )}
          actionLabel={t('Add Faculty Member', 'कर्मचारी थप्नुहोस्')}
          onAction={() => {
            handleResetForm();
            setIsEditing(true);
          }}
          icon={Users}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">{t('Name / Faculty', 'नाम / शिक्षक')}</th>
                  <th className="px-4 py-3">{t('Designation / Department', 'पद / विभाग')}</th>
                  <th className="px-4 py-3">{t('Status', 'स्थिति')}</th>
                  <th className="px-4 py-3">{t('Experience / Qualification', 'अनुभव / योग्यता')}</th>
                  <th className="px-4 py-3 text-right">{t('Actions', 'कार्यहरू')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      {t('No faculty members found matching your search.', 'कुनै शिक्षक फेला परेन।')}
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => setViewingStaff(s)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {s.image && s.image.trim() ? (
                              <img src={s.image} alt={s.name_en} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 dark:text-white block truncate group-hover:text-[#1E40AF] dark:group-hover:text-blue-400 transition-colors">
                              {t(s.name_en, s.name_np)}
                            </span>
                            {s.name_np && s.name_np !== s.name_en && (
                              <span className="text-[10px] text-slate-400 block truncate">{s.name_np}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                            {t(s.designation_en, s.designation_np)}
                          </span>
                          {s.department_en && (
                            <span className="text-[10px] text-slate-400 block truncate">{s.department_en}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <CmsStatusBadge status="active" label={t('Active', 'सक्रिय')} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                          {s.qualification_en || s.experience || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <AdminActionMenu
                          actions={[
                            ...(canUpdate ? [{
                              id: 'edit',
                              label: t('Edit Profile', 'सम्पादन'),
                              icon: Edit3,
                              onClick: () => {
                                setForm({ ...s });
                                setFormErrors({});
                                setIsEditing(true);
                              }
                            }] : []),
                            ...(canDelete ? [{
                              id: 'delete',
                              label: t('Delete Profile', 'मेटाउनुहोस्'),
                              icon: Trash2,
                              danger: true,
                              onClick: () => setDeletingStaffId(s.id)
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
  );
};
