import React, { useState, useRef } from 'react';
import { Language, GalleryItem } from '../../types';
import {
  Image as ImageIcon,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Upload,
  AlertCircle,
  FileCheck2,
  Calendar,
  Layers
} from 'lucide-react';
import { ConfirmationModal, ConfirmationVariant } from '../../components/ConfirmationModal';
import { IconActionButton } from '../../components/IconActionButton';
import { CmsEmptyState } from './CmsEmptyState';
import { AdminDrawer } from './AdminDrawer';

interface GalleryAdminTabProps {
  lang: Language;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
  onShowToast: (msg: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const GalleryAdminTab: React.FC<GalleryAdminTabProps> = ({
  lang,
  gallery,
  onUpdateGallery,
  onShowToast,
  canCreate = true,
  canUpdate = true,
  canDelete = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
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

  const [form, setForm] = useState<GalleryItem>({
    id: 0,
    title_en: '',
    title_np: '',
    category: 'academics',
    image: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [imageError, setImageError] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  // File validation and upload handler (< 1 MB, JPG/JPEG/PNG only)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. File extension validation
    const validExtensions = /\.(jpe?g|png)$/i;
    if (!validExtensions.test(file.name)) {
      setImageError(t('Invalid file extension! Only JPG, JPEG, and PNG are allowed.', 'अमान्य फाइल ढाँचा! केवल JPG, JPEG वा PNG मात्र स्वीकार्य छ।'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. MIME type validation
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      setImageError(t('Invalid MIME type! Please select a valid JPEG or PNG photo.', 'अमान्य MIME प्रकार! कृपया मान्य तस्बिर छान्नुहोस्।'));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. File size validation (< 1 MB = 1,048,576 bytes)
    const MAX_SIZE_BYTES = 1024 * 1024; // 1 MB
    if (file.size >= MAX_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageError(
        t(
          `File size exceeds 1 MB limit! Selected file is ${sizeMb} MB.`,
          `फाइल आकार १ MB भन्दा बढी छ! छनोट गरिएको फाइल ${sizeMb} MB छ।`
        )
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 4. Validity check: verify that image decodes properly
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64Url = loadEvent.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Successfully decoded
        setForm(prev => ({ ...prev, image: base64Url }));
        setImageFileName(file.name);
      };
      img.onerror = () => {
        setImageError(t('Corrupted or invalid image file. Please upload another photo.', 'विग्रिएको वा अमान्य तस्बिर फाइल। अर्को छनोट गर्नुहोस्।'));
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      img.src = base64Url;
    };
    reader.onerror = () => {
      setImageError(t('Failed to read image file.', 'तस्बिर पढ्न असफल भयो।'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
    setImageFileName('');
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en || !form.title_np) {
      onShowToast(t('Please fill in both titles.', 'कृपया दुबै भाषामा शीर्षक प्रविष्ट गर्नुहोस्।'));
      return;
    }

    const isUpdate = Boolean(form.id && form.id !== 0);

    if (isUpdate) {
      if (!canUpdate) {
        onShowToast(t('Permission denied: You cannot update gallery photos.', 'अनुमति छैन: तपाईं ग्यालरी अद्यावधिक गर्न सक्नुहुन्न।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'update',
        title: t('Confirm Photo Update', 'तस्बिर विवरण अद्यावधिक पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to save changes to this gallery entry?', 'के तपाईं यस तस्बिरका सम्पादित विवरण सुरक्षित गर्न चाहनुहुन्छ?'),
        itemName: `${form.title_en} (${form.title_np})`,
        confirmText: t('Save Changes', 'परिवर्तन सुरक्षित गर्नुहोस्'),
        action: () => {
          const updated = gallery.map(g => g.id === form.id ? form : g);
          onUpdateGallery(updated);
          onShowToast(t('Gallery photo updated successfully.', 'तस्बिर विवरण अद्यावधिक गरियो।'));
          setIsEditing(false);
          handleRemoveImage();
        }
      });
    } else {
      if (!canCreate) {
        onShowToast(t('Permission denied: You cannot create new gallery photos.', 'अनुमति छैन: तपाईं नयाँ तस्बिर थप्न सक्नुहुन्न।'));
        return;
      }

      setConfirmState({
        isOpen: true,
        variant: 'create',
        title: t('Confirm New Photo Addition', 'नयाँ तस्बिर थप्ने पुष्टि गर्नुहोस्'),
        description: t('Are you sure you want to add this photo to the campus gallery archive?', 'के तपाईं यो नयाँ तस्बिर ग्यालरीमा समावेश गर्न चाहनुहुन्छ?'),
        itemName: `${form.title_en} (${form.title_np})`,
        confirmText: t('Add to Gallery', 'ग्यालरीमा थप्नुहोस्'),
        action: () => {
          const newItem: GalleryItem = {
            ...form,
            id: Date.now(),
          };
          onUpdateGallery([newItem, ...gallery]);
          onShowToast(t('New photo record added to gallery.', 'ग्यालरीमा नयाँ तस्बिर थपियो।'));
          setIsEditing(false);
          handleRemoveImage();
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!canDelete) {
      onShowToast(t('Permission denied: You cannot delete gallery photos.', 'अनुमति छैन: तपाईं तस्बिर मेटाउन सक्नुहुन्न।'));
      return;
    }
    const targetItem = gallery.find(g => g.id === id);
    const itemName = targetItem ? `${targetItem.title_en} (${targetItem.title_np})` : `Photo #${id}`;

    setConfirmState({
      isOpen: true,
      variant: 'delete',
      title: t('Confirm Photo Deletion', 'तस्बिर हटाउने पुष्टि गर्नुहोस्'),
      description: t('Are you sure you want to permanently remove this photo from the campus gallery? This action cannot be undone.', 'के तपाईं यो तस्बिर ग्यालरीबाट सदाका लागि मेटाउन निश्चित हुनुहुन्छ?'),
      itemName,
      confirmText: t('Delete Photo', 'तस्बिर मेटाउनुहोस्'),
      action: () => {
        onUpdateGallery(gallery.filter(g => g.id !== id));
        onShowToast(t('Gallery photo removed.', 'तस्बिर रेकर्ड मेटाइयो।'));
      }
    });
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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#1E40AF]" />
            <span>{t('Manage Campus Photo Gallery', 'विद्यालय फोटो ग्यालरी व्यवस्थापन')}</span>
          </h3>
          <p className="text-xs text-slate-500">
            {t('Upload photographic archives (JPG, PNG < 1 MB) for academic and campus events.', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका तस्बिरहरू (JPG, PNG < १ MB) व्यवस्थापन।')}
          </p>
        </div>

        {!isEditing && canCreate && (
          <button
            type="button"
            onClick={() => {
              setForm({
                id: 0,
                title_en: '',
                title_np: '',
                category: 'academics',
                image: '',
                date: new Date().toISOString().split('T')[0],
              });
              setImageError('');
              setImageFileName('');
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('Upload New Photo', 'नयाँ तस्बिर अपलोड')}</span>
          </button>
        )}
      </div>

      {/* Upload/Edit Form Drawer (Requirements 10, 11) */}
      <AdminDrawer
        isOpen={isEditing}
        onClose={() => {
          setIsEditing(false);
          handleRemoveImage();
        }}
        title={form.id ? t('Edit Photo Information', 'तस्बिर विवरण सम्पादन') : t('Upload New Photo to Gallery', 'नयाँ तस्बिर अपलोड गर्नुहोस्')}
        subtitle={t('Upload photographic archives (JPG, PNG < 1 MB) with English and Nepali titles.', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका तस्बिरहरू व्यवस्थापन गर्नुहोस्।')}
        icon={Upload}
        width="lg"
        onSave={handleSave}
        saveLabel={form.id ? t('Update Photo', 'अद्यावधिक गर्नुहोस्') : t('Save to Gallery', 'ग्यालरीमा सुरक्षित गर्नुहोस्')}
        cancelLabel={t('Cancel', 'रद्द गर्नुहोस्')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Photo Title (English) *</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm(prev => ({ ...prev, title_en: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="e.g. Science Exhibition 2083"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">तस्बिर शीर्षक (नेपाली) *</label>
              <input
                type="text"
                value={form.title_np}
                onChange={(e) => setForm(prev => ({ ...prev, title_np: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="उदा. विज्ञान प्रदर्शनी २०८३"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as GalleryItem['category'] }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1E40AF]"
              >
                <option value="academics">Academics (शैक्षिक)</option>
                <option value="science">Science & Lab (विज्ञान)</option>
                <option value="sports">Sports & Athletics (खेलकुद)</option>
                <option value="culture">Culture & Arts (सांस्कृतिक)</option>
                <option value="community">Community (समुदाय)</option>
              </select>
            </div>

            {/* DIRECT IMAGE UPLOADER FIELD (Replaces Vector Icon Archetype) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('Upload Photo File', 'तस्बिर फाइल अपलोड गर्नुहोस्')}
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  JPG, JPEG, PNG (&lt; 1 MB)
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="gallery-photo-input"
                accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
                onChange={handleImageUpload}
                className="hidden"
              />

              {!form.image ? (
                <label
                  htmlFor="gallery-photo-input"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#1E40AF] bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50/50 text-xs text-slate-600 dark:text-slate-300 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#1E40AF]" />
                  <span className="font-semibold">{t('Choose Image File (< 1 MB)', 'तस्बिर फाइल छान्नुहोस् (< १ MB)')}</span>
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {imageFileName || 'Selected Photo'}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Valid Image Ready
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label
                      htmlFor="gallery-photo-input"
                      className="px-2 py-1 rounded text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {t('Change', 'फेर्नुहोस्')}
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                      title={t('Remove Photo', 'हटाउनुहोस्')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {imageError && (
                <p className="text-[11px] font-medium text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{imageError}</span>
                </p>
              )}
            </div>
          </div>

        </form>
      </AdminDrawer>

      {/* Gallery Cards Grid */}
      {gallery.length === 0 ? (
        <CmsEmptyState
          title={t('No gallery photos yet.', 'ग्यालरीमा कुनै तस्बिर छैन।')}
          description={t(
            'Upload school activity photos and achievements to show in the photo gallery.',
            'फोटो ग्यालरीमा देखाउन विद्यालयका कार्यक्रम तथा गतिविधिको तस्बिर थप्नुहोस्।'
          )}
          actionLabel={t('Add Photo to Gallery', 'तस्बिर थप्नुहोस्')}
          onAction={() => {
            setForm({
              id: 0,
              title_en: '',
              title_np: '',
              category: 'academics',
              image: '',
              date: new Date().toISOString().split('T')[0],
            });
            setIsEditing(true);
          }}
          icon={ImageIcon}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gallery.map(item => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs hover:border-slate-400 dark:hover:border-slate-700 transition flex flex-col group"
            >
              {/* Image Preview Container */}
              <div className="h-48 bg-slate-100 dark:bg-slate-800/80 relative overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
                {item.image && item.image.trim() ? (
                  <img
                    src={item.image}
                    alt={item.title_en}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 stroke-[1.5]" />
                    <span className="text-[10px] font-mono mt-1 uppercase text-slate-400">Archived Record</span>
                  </div>
                )}

                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {t(item.title_en, item.title_np)}
                  </h4>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: #{item.id}
                  </span>

                  <div className="flex items-center gap-1">
                    {canUpdate && (
                      <IconActionButton
                        action="edit"
                        size="sm"
                        onClick={() => {
                          setForm(item);
                          setImageFileName('');
                          setImageError('');
                          setIsEditing(true);
                        }}
                        tooltip={t('Edit photo details', 'सम्पादन गर्नुहोस्')}
                        aria-label={t('Edit photo details', 'सम्पादन गर्नुहोस्')}
                      />
                    )}
                    {canDelete && (
                      <IconActionButton
                        action="delete"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        tooltip={t('Delete photo', 'मेटाउनुहोस्')}
                        aria-label={t('Delete photo', 'मेटाउनुहोस्')}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
