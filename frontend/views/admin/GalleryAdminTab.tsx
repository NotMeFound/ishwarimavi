import React, { useRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Image as ImageIcon, Loader2, Pencil, RefreshCw, Search, Trash2, Upload, X } from 'lucide-react';
import { Language, GalleryItem } from '../../types';
import { apiClient, getApiUrl } from '../../services/apiClient';
import { ConfirmationModal } from '../../components/ConfirmationModal';

interface GalleryAdminTabProps {
  lang: Language;
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => Promise<boolean>;
  onShowToast: (msg: string) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

interface SelectedPhoto {
  file: File;
  preview: string;
  title_en: string;
  title_np: string;
}

const MAX_IMAGE_SIZE = 1024 * 1024;
const ACCEPTED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/webp': '.webp'
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('The selected image could not be read.'));
    };
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function getImageUrl(item: GalleryItem): string {
  return item.image || item.url || '';
}

function getStoredImagePath(image: string): string | null {
  try {
    const pathname = new URL(image, window.location.origin).pathname;
    return /^\/api\/gallery\/file\/gallery-[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(pathname)
      ? pathname
      : null;
  } catch {
    return null;
  }
}

function isUnpublished(item: GalleryItem): boolean {
  return item.status === 'unpublished' || item.status === 'draft' ||
    item.published === false || item.is_published === false || item.is_enabled === false;
}

const GalleryThumbnail: React.FC<{ item: GalleryItem; className?: string }> = ({ item, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const image = getImageUrl(item);
  return image && !failed ? (
    <img
      src={getApiUrl(image)}
      alt={item.title_en || 'Gallery photo'}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
      <ImageIcon className="h-9 w-9" />
      <span className="text-xs">Image unavailable</span>
    </div>
  );
};

export const GalleryAdminTab: React.FC<GalleryAdminTabProps> = ({
  lang,
  gallery,
  onUpdateGallery,
  onShowToast,
  canCreate = true,
  canUpdate = true,
  canDelete = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const replacementTargetRef = useRef<GalleryItem | null>(null);
  const [selected, setSelected] = useState<SelectedPhoto[]>([]);
  const [category, setCategory] = useState<GalleryItem['category']>('academics');
  const [categoryFilter, setCategoryFilter] = useState<'all' | GalleryItem['category']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [replacingId, setReplacingId] = useState<GalleryItem['id'] | null>(null);
  const [replacementError, setReplacementError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const isNp = lang === 'np';
  const t = (en: string, np: string) => (isNp ? np : en);

  const releasePhoto = (photo: SelectedPhoto) => URL.revokeObjectURL(photo.preview);

  const addFiles = (files: FileList | File[]) => {
    const accepted: SelectedPhoto[] = [];
    const errors: string[] = [];
    for (const file of Array.from(files)) {
      const duplicate = [...selected, ...accepted].some((photo) =>
        photo.file.name === file.name &&
        photo.file.size === file.size &&
        photo.file.lastModified === file.lastModified
      );
      if (duplicate) continue;
      const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
      const mimeTypeAllowed = !file.type || Object.entries(ACCEPTED_IMAGE_TYPES).some(
        ([mime, extensions]) => mime === file.type && extensions.split(',').includes(extension)
      );
      const extensionAllowed = Object.values(ACCEPTED_IMAGE_TYPES).some((value) => value.split(',').includes(extension));
      if (!extensionAllowed || !mimeTypeAllowed) {
        errors.push(`${file.name}: ${t('choose a JPG, PNG, or WebP image', 'JPG, PNG वा WebP तस्बिर छान्नुहोस्')}`);
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: ${t('exceeds the 1 MB limit', '१ MB सीमा नाघेको छ')}`);
        continue;
      }
      accepted.push({
        file,
        preview: URL.createObjectURL(file),
        title_en: '',
        title_np: ''
      });
    }
    if (accepted.length) setSelected((previous) => [...previous, ...accepted]);
    setUploadError(errors.join('. '));
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeSelected = (index: number) => {
    setSelected((previous) => {
      const removed = previous[index];
      if (removed) releasePhoto(removed);
      return previous.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateSelectedCaption = (index: number, key: 'title_en' | 'title_np', value: string) => {
    setSelected((previous) => previous.map((photo, itemIndex) =>
      itemIndex === index ? { ...photo, [key]: value } : photo
    ));
  };

  const openReplacePicker = (item: GalleryItem) => {
    replacementTargetRef.current = item;
    setReplacementError('');
    replaceInputRef.current?.click();
  };

  const replacePhoto = async (item: GalleryItem, file: File) => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
    const extensionAllowed = Object.values(ACCEPTED_IMAGE_TYPES).some((value) => value.split(',').includes(extension));
    const mimeTypeAllowed = !file.type || Object.entries(ACCEPTED_IMAGE_TYPES).some(
      ([mime, extensions]) => mime === file.type && extensions.split(',').includes(extension)
    );
    if (!extensionAllowed || !mimeTypeAllowed) {
      setReplacementError(t('Choose a JPG, PNG, or WebP image.', 'JPG, PNG वा WebP तस्बिर छान्नुहोस्।'));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setReplacementError(t('The replacement image must be 1 MB or smaller.', 'प्रतिस्थापन तस्बिर १ MB वा कम हुनुपर्छ।'));
      return;
    }

    setReplacingId(item.id);
    setReplacementError('');
    let uploadedUrl = '';
    try {
      const uploaded = await apiClient.uploadFile({
        fileName: file.name,
        fileType: file.type,
        base64Data: await readFileAsDataUrl(file),
        category: 'gallery',
        operation: 'replace'
      });
      if (!uploaded.success || !uploaded.url) {
        setReplacementError(uploaded.error || t('The replacement photo could not be uploaded.', 'प्रतिस्थापन तस्बिर अपलोड भएन।'));
        return;
      }

      uploadedUrl = uploaded.url;
      const nextGallery = gallery.map((photo) => photo.id === item.id
        ? { ...photo, image: uploadedUrl, url: uploadedUrl }
        : photo);
      const saved = await onUpdateGallery(nextGallery);
      if (!saved) {
        const storedPath = getStoredImagePath(uploadedUrl);
        let cleanedUp = true;
        if (storedPath) {
          try {
            const response = await fetch(getApiUrl(storedPath), {
              method: 'DELETE',
              headers: { ...apiClient.getAuthHeaders() },
              credentials: 'include'
            });
            cleanedUp = response.ok;
          } catch {
            cleanedUp = false;
          }
        }
        setReplacementError(cleanedUp
          ? t('Could not save the replacement. Your original photo is unchanged; please retry.', 'प्रतिस्थापन सुरक्षित भएन। पुरानो तस्बिर यथावत् छ; पुनः प्रयास गर्नुहोस्।')
          : t('Could not save the replacement or clean up its upload. Your original photo is unchanged.', 'प्रतिस्थापन सुरक्षित वा अपलोड सफा गर्न सकिएन। पुरानो तस्बिर यथावत् छ।'));
        return;
      }

      const previousPath = getStoredImagePath(getImageUrl(item));
      const isShared = previousPath && gallery.some((photo) =>
        photo.id !== item.id && getStoredImagePath(getImageUrl(photo)) === previousPath
      );
      let oldFileRemoved = true;
      if (previousPath && !isShared) {
        try {
          const response = await fetch(getApiUrl(previousPath), {
            method: 'DELETE',
            headers: { ...apiClient.getAuthHeaders() },
            credentials: 'include'
          });
          oldFileRemoved = response.ok;
        } catch {
          oldFileRemoved = false;
        }
      }
      onShowToast(oldFileRemoved
        ? t('Photo replaced successfully.', 'तस्बिर सफलतापूर्वक प्रतिस्थापन गरियो।')
        : t('Photo replaced, but the old image file could not be removed.', 'तस्बिर प्रतिस्थापन भयो तर पुरानो फाइल हटाउन सकिएन।'));
    } catch (error) {
      let cleanupFailed = false;
      const storedPath = uploadedUrl ? getStoredImagePath(uploadedUrl) : null;
      if (storedPath) {
        try {
          const response = await fetch(getApiUrl(storedPath), {
            method: 'DELETE',
            headers: { ...apiClient.getAuthHeaders() },
            credentials: 'include'
          });
          cleanupFailed = !response.ok;
        } catch {
          cleanupFailed = true;
        }
      }
      setReplacementError([
        error instanceof Error ? error.message : t('The replacement photo could not be saved.', 'प्रतिस्थापन तस्बिर सुरक्षित भएन।'),
        cleanupFailed ? t('The uploaded file could not be cleaned up.', 'अपलोड गरिएको फाइल सफा गर्न सकिएन।') : ''
      ].filter(Boolean).join(' '));
    } finally {
      setReplacingId(null);
    }
  };

  const handleReplaceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const target = replacementTargetRef.current;
    replacementTargetRef.current = null;
    event.target.value = '';
    if (file && target) void replacePhoto(target, file);
  };

  const uploadSelected = async () => {
    if (!canCreate || isUploading || selected.length === 0) return;
    setIsUploading(true);
    setUploadError('');
    let currentGallery = gallery;
    const completed: SelectedPhoto[] = [];
    const errors: string[] = [];

    for (let index = 0; index < selected.length; index += 1) {
      const photo = selected[index];
      setUploadProgress(`${t('Uploading', 'अपलोड हुँदैछ')} ${index + 1}/${selected.length}: ${photo.file.name}`);
      let uploadedUrl: string | undefined;
      try {
        const base64Data = await readFileAsDataUrl(photo.file);
        const uploaded = await apiClient.uploadFile({
          fileName: photo.file.name,
          fileType: photo.file.type,
          base64Data,
          category: 'gallery'
        });
        if (!uploaded.success || !uploaded.url) {
          errors.push(`${photo.file.name}: ${uploaded.error || t('upload failed', 'अपलोड असफल भयो')}`);
          continue;
        }

        uploadedUrl = uploaded.url;
        const defaultTitle = photo.file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        let itemId = Date.now() * 1000 + index;
        while (currentGallery.some((item) => item.id === itemId)) itemId += 1;
        const newItem: GalleryItem = {
          id: itemId,
          title_en: photo.title_en.trim() || defaultTitle,
          title_np: photo.title_np.trim(),
          category,
          image: uploadedUrl,
          url: uploadedUrl,
          date: new Date().toISOString().slice(0, 10),
          status: 'published'
        };
        const nextGallery = [newItem, ...currentGallery];
        const saved = await onUpdateGallery(nextGallery);
        if (!saved) {
          const storedPath = getStoredImagePath(uploadedUrl);
          if (storedPath) {
            await fetch(getApiUrl(storedPath), {
              method: 'DELETE',
              headers: { ...apiClient.getAuthHeaders() },
              credentials: 'include'
            });
          }
          errors.push(`${photo.file.name}: ${t('photo record could not be saved', 'तस्बिरको विवरण सुरक्षित भएन')}`);
          continue;
        }
        currentGallery = nextGallery;
        completed.push(photo);
      } catch (error) {
        if (uploadedUrl) {
          const storedPath = getStoredImagePath(uploadedUrl);
          if (storedPath) {
            await fetch(getApiUrl(storedPath), {
              method: 'DELETE',
              headers: { ...apiClient.getAuthHeaders() },
              credentials: 'include'
            }).catch(() => undefined);
          }
        }
        errors.push(`${photo.file.name}: ${error instanceof Error ? error.message : t('upload failed', 'अपलोड असफल भयो')}`);
      }
    }

    completed.forEach(releasePhoto);
    setSelected((previous) => previous.filter((photo) => !completed.includes(photo)));
    setUploadProgress('');
    setIsUploading(false);
    setUploadError(errors.join('. '));
    if (completed.length) {
      onShowToast(`${completed.length} ${t('photo(s) uploaded and published.', 'तस्बिर अपलोड तथा प्रकाशित गरियो।')}`);
    }
  };

  const saveEdit = async () => {
    if (!editing || isSaving || !canUpdate) return;
    setIsSaving(true);
    const updated = gallery.map((item) => item.id === editing.id ? editing : item);
    const saved = await onUpdateGallery(updated);
    setIsSaving(false);
    if (saved) {
      onShowToast(t('Gallery photo updated.', 'ग्यालरी तस्बिर अद्यावधिक गरियो।'));
      setEditing(null);
    } else {
      onShowToast(t('Could not save the gallery changes. Please retry.', 'ग्यालरी परिवर्तन सुरक्षित भएन। पुनः प्रयास गर्नुहोस्।'));
    }
  };

  const togglePublished = async (item: GalleryItem) => {
    if (!canUpdate || isSaving) return;
    setIsSaving(true);
    const status: GalleryItem['status'] =
      item.status === 'unpublished' || item.status === 'draft' ||
      item.published === false || item.is_published === false || item.is_enabled === false
        ? 'published'
        : 'unpublished';
    const updated = gallery.map((photo) => photo.id === item.id
      ? {
          ...photo,
          status,
          published: status === 'published',
          is_published: status === 'published',
          is_enabled: status === 'published'
        }
      : photo);
    const saved = await onUpdateGallery(updated);
    setIsSaving(false);
    onShowToast(saved
      ? status === 'published' ? t('Photo published.', 'तस्बिर प्रकाशित गरियो।') : t('Photo unpublished.', 'तस्बिर अप्रकाशित गरियो।')
      : t('Could not update the photo status. Please retry.', 'तस्बिरको अवस्था अद्यावधिक भएन।'));
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting || !canDelete) return;
    setIsDeleting(true);
    const target = deleteTarget;
    const saved = await onUpdateGallery(gallery.filter((item) => item.id !== target.id));
    if (saved) {
      const storedPath = getStoredImagePath(getImageUrl(target));
      let imageRemoved = true;
      if (storedPath) {
        try {
          const response = await fetch(getApiUrl(storedPath), {
            method: 'DELETE',
            headers: { ...apiClient.getAuthHeaders() },
            credentials: 'include'
          });
          imageRemoved = response.ok;
        } catch {
          imageRemoved = false;
        }
      }
      onShowToast(imageRemoved
        ? t('Gallery photo deleted.', 'ग्यालरी तस्बिर मेटाइयो।')
        : t('Photo was removed from the gallery, but its image file could not be deleted.', 'तस्बिर हटाइयो तर फाइल मेटाउन सकिएन।'));
      setDeleteTarget(null);
    } else {
      onShowToast(t('Could not delete the photo. Please retry.', 'तस्बिर मेटाउन सकिएन। पुनः प्रयास गर्नुहोस्।'));
    }
    setIsDeleting(false);
  };

  const visibleGallery = gallery.filter((item) => {
    const unpublished = isUnpublished(item);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'unpublished' ? unpublished : !unpublished);
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    const matchesSearch = !normalizedQuery ||
      `${item.title_en} ${item.title_np} ${item.category}`.toLocaleLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        variant="delete"
        title={t('Delete gallery photo?', 'ग्यालरी तस्बिर मेटाउने?')}
        description={t('This removes the photo from the public gallery.', 'यसले सार्वजनिक ग्यालरीबाट तस्बिर हटाउँछ।')}
        itemName={deleteTarget?.title_en}
        confirmText={t('Delete photo', 'तस्बिर मेटाउनुहोस्')}
        isLoading={isDeleting}
      />

      {canUpdate && (
        <input
          ref={replaceInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={handleReplaceFileChange}
          className="hidden"
        />
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {canCreate ? t('Add Gallery Photos', 'ग्यालरीमा तस्बिर थप्नुहोस्') : t('Manage Gallery Photos', 'ग्यालरीका तस्बिर व्यवस्थापन')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {t('JPG, PNG, or WebP · up to 1 MB each', 'JPG, PNG वा WebP · प्रत्येक १ MB सम्म')}
            </p>
          </div>
          {canCreate && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span>{t('Album', 'श्रेणी')}</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as GalleryItem['category'])}
                disabled={isUploading}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="academics">Academics</option>
                <option value="science">Science & Tech</option>
                <option value="sports">Sports</option>
                <option value="culture">Culture</option>
                <option value="community">Community</option>
              </select>
            </label>
          )}
        </div>

        {canCreate && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={(event) => event.target.files && addFiles(event.target.files)}
              className="hidden"
            />
            <div
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-center transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
              }`}
            >
              <Upload className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  {t('Drop photos here or', 'तस्बिर यहाँ राख्नुहोस् वा')}
                </span>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {t('Choose Photos', 'तस्बिर छान्नुहोस्')}
                </button>
              </div>
            </div>
          </>
        )}

        {selected.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {selected.map((photo, index) => (
              <div key={`${photo.file.name}-${photo.file.lastModified}-${index}`} className="flex min-w-0 gap-2 rounded-lg border border-slate-200 p-2 dark:border-slate-700">
                <img src={photo.preview} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{photo.file.name}</p>
                  <input
                    value={photo.title_en}
                    onChange={(event) => updateSelectedCaption(index, 'title_en', event.target.value)}
                    placeholder={t('Optional English caption', 'वैकल्पिक अंग्रेजी शीर्षक')}
                    disabled={isUploading}
                    className="w-full rounded border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
                  />
                  <input
                    value={photo.title_np}
                    onChange={(event) => updateSelectedCaption(index, 'title_np', event.target.value)}
                    placeholder={t('Optional Nepali caption', 'वैकल्पिक नेपाली शीर्षक')}
                    disabled={isUploading}
                    className="w-full rounded border border-slate-200 bg-transparent px-2 py-1 text-xs dark:border-slate-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSelected(index)}
                  disabled={isUploading}
                  aria-label={t('Remove selected photo', 'छानिएको तस्बिर हटाउनुहोस्')}
                  className="self-start rounded p-1 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-950/30"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {(uploadError || uploadProgress) && (
          <p role={uploadError ? 'alert' : 'status'} className={`mt-3 flex items-center gap-2 text-xs ${uploadError ? 'text-red-600 dark:text-red-400' : 'text-blue-700 dark:text-blue-300'}`}>
            {uploadError && <AlertCircle className="h-4 w-4 shrink-0" />}
            {uploadProgress || uploadError}
          </p>
        )}
        {selected.length > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => void uploadSelected()}
              disabled={isUploading || selected.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {isUploading ? t('Uploading…', 'अपलोड हुँदैछ…') : t('Upload Photos', 'तस्बिर अपलोड गर्नुहोस्')}
            </button>
          </div>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('Photo library', 'तस्बिर सङ्ग्रह')}</h3>
            <p className="text-xs text-slate-500">
              {t(`${gallery.length} total · ${visibleGallery.length} shown`, `जम्मा ${gallery.length} · ${visibleGallery.length} देखाइएका`)}
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-3">
            <label className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('Search captions…', 'शीर्षक खोज्नुहोस्…')}
                aria-label={t('Search gallery photos', 'ग्यालरी तस्बिर खोज्नुहोस्')}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800 sm:min-w-48"
              />
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as 'all' | GalleryItem['category'])}
              aria-label={t('Filter by album', 'श्रेणी अनुसार छान्नुहोस्')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">{t('All albums', 'सबै श्रेणी')}</option>
              <option value="academics">Academics</option>
              <option value="science">Science & Tech</option>
              <option value="sports">Sports</option>
              <option value="culture">Culture</option>
              <option value="community">Community</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'published' | 'unpublished')}
              aria-label={t('Filter by publication status', 'प्रकाशन अवस्था अनुसार छान्नुहोस्')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="all">{t('All statuses', 'सबै अवस्था')}</option>
              <option value="published">{t('Published', 'प्रकाशित')}</option>
              <option value="unpublished">{t('Unpublished', 'अप्रकाशित')}</option>
            </select>
          </div>
        </div>
        {replacementError && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {replacementError}
          </p>
        )}
      </section>

      {gallery.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
          {t('No gallery photos yet.', 'ग्यालरीमा कुनै तस्बिर छैन।')}
        </div>
      ) : visibleGallery.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
          {t('No photos match these filters.', 'यी छनोटसँग मिल्ने तस्बिर भेटिएनन्।')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleGallery.map((item) => {
            const unpublished = isUnpublished(item);
            const isEditing = editing?.id === item.id;
            const isReplacing = replacingId === item.id;
            return (
              <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <GalleryThumbnail item={item} className="h-full w-full object-cover" />
                  <span className={`absolute left-2 top-2 rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${unpublished ? 'bg-slate-600' : 'bg-emerald-700'}`}>
                    {unpublished ? t('Unpublished', 'अप्रकाशित') : t('Published', 'प्रकाशित')}
                  </span>
                </div>
                <div className="space-y-3 p-3">
                  {isEditing && editing ? (
                    <div className="space-y-2">
                      <input
                        value={editing.title_en}
                        onChange={(event) => setEditing({ ...editing, title_en: event.target.value })}
                        aria-label={t('English photo caption', 'अंग्रेजी शीर्षक')}
                        className="w-full rounded-lg border border-slate-300 bg-transparent px-2.5 py-2 text-xs dark:border-slate-700"
                      />
                      <input
                        value={editing.title_np}
                        onChange={(event) => setEditing({ ...editing, title_np: event.target.value })}
                        aria-label={t('Nepali photo caption', 'नेपाली शीर्षक')}
                        className="w-full rounded-lg border border-slate-300 bg-transparent px-2.5 py-2 text-xs dark:border-slate-700"
                      />
                      <select
                        value={editing.category}
                        onChange={(event) => setEditing({ ...editing, category: event.target.value as GalleryItem['category'] })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                      >
                        <option value="academics">Academics</option>
                        <option value="science">Science & Tech</option>
                        <option value="sports">Sports</option>
                        <option value="culture">Culture</option>
                        <option value="community">Community</option>
                      </select>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditing(null)} disabled={isSaving} className="rounded px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {t('Cancel', 'रद्द')}
                        </button>
                        <button type="button" onClick={() => void saveEdit()} disabled={isSaving} className="rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
                          {isSaving ? t('Saving…', 'सुरक्षित हुँदैछ…') : t('Save', 'सुरक्षित')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title_en || item.title_np || item.category}</p>
                        {item.title_np && item.title_en && <p className="mt-0.5 text-xs text-slate-500">{item.title_np}</p>}
                        <p className="mt-1 text-[11px] capitalize text-slate-500">{item.category}</p>
                      </div>
                      <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                        {canUpdate && (
                          <>
                            <button type="button" onClick={() => setEditing({ ...item })} aria-label={t('Edit caption', 'शीर्षक सम्पादन')} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700 dark:hover:bg-slate-800">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openReplacePicker(item)}
                              disabled={replacingId !== null}
                              aria-label={t('Replace photo', 'तस्बिर प्रतिस्थापन गर्नुहोस्')}
                              title={t('Replace photo', 'तस्बिर प्रतिस्थापन गर्नुहोस्')}
                              className="inline-flex min-h-9 items-center gap-1 rounded px-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-950/40"
                            >
                              {isReplacing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                              <span>{isReplacing ? t('Replacing…', 'प्रतिस्थापन हुँदैछ…') : t('Replace', 'बदल्नुहोस्')}</span>
                            </button>
                            <button type="button" onClick={() => void togglePublished(item)} disabled={isSaving || replacingId !== null} aria-label={unpublished ? t('Publish photo', 'प्रकाशित गर्नुहोस्') : t('Unpublish photo', 'अप्रकाशित गर्नुहोस्')} className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700 disabled:opacity-50 dark:hover:bg-slate-800">
                              {unpublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </>
                        )}
                        {canDelete && (
                          <button type="button" onClick={() => setDeleteTarget(item)} aria-label={t('Delete photo', 'तस्बир मेटाउनुहोस्')} className="rounded p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryAdminTab;
