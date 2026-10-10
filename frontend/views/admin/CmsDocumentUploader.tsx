import React, { useState, useRef } from 'react';
import { FileText, Upload, AlertCircle, X, Check } from 'lucide-react';
import { DocumentItem } from '../../types';

interface CmsDocumentUploaderProps {
  initialData?: Partial<DocumentItem>;
  onSave: (doc: {
    title_en: string;
    title_np?: string;
    description_en?: string;
    file_name: string;
    file_data: string;
    file_size_kb: number;
    status: 'published' | 'draft' | 'unpublished';
  }) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CmsDocumentUploader: React.FC<CmsDocumentUploaderProps> = ({
  initialData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [title, setTitle] = useState(initialData?.title_en || '');
  const [titleNp, setTitleNp] = useState(initialData?.title_np || '');
  const [description, setDescription] = useState(initialData?.description_en || '');
  const [status, setStatus] = useState<'published' | 'draft' | 'unpublished'>(
    initialData?.status || 'published'
  );

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeKb: number;
    dataUrl: string;
  } | null>(
    initialData?.file_name
      ? {
          name: initialData.file_name,
          sizeKb: initialData.file_size_kb || 0,
          dataUrl: initialData.file_data || ''
        }
      : null
  );

  const [titleError, setTitleError] = useState('');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Strictly validate PDF format
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      setFileError('Invalid format. PDF files only are accepted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Strictly validate 200 KB limit
    const sizeKb = Math.round(file.size / 1024);
    if (file.size > 200 * 1024) {
      setFileError(`File is too large (${sizeKb} KB). Maximum allowed size is 200 KB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedFile({
        name: file.name,
        sizeKb,
        dataUrl
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!title.trim()) {
      setTitleError('Document Title is required.');
      hasError = true;
    } else {
      setTitleError('');
    }

    if (!selectedFile || !selectedFile.dataUrl) {
      setFileError('PDF File is required. Please choose a PDF.');
      hasError = true;
    }

    if (hasError) return;

    await onSave({
      title_en: title.trim(),
      title_np: titleNp.trim() || title.trim(),
      description_en: description.trim(),
      file_name: selectedFile!.name,
      file_data: selectedFile!.dataUrl,
      file_size_kb: selectedFile!.sizeKb,
      status
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm animate-in fade-in duration-100 max-w-2xl mx-auto"
    >
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {initialData?.id ? 'Edit Document' : 'Upload Document'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Attach official notifications, reports, and downloadable resources.
        </p>
      </div>

      <div className="space-y-4">
        {/* Document Title * */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (titleError) setTitleError('');
            }}
            placeholder="e.g., Annual School Calendar 2083"
            className={`w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition ${
              titleError
                ? 'border-red-500 ring-1 ring-red-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-[#1E40AF]'
            }`}
          />
          {titleError && (
            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{titleError}</span>
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief overview of the document content or guidelines..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
          />
        </div>

        {/* PDF File * */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            PDF File <span className="text-red-500">*</span>
          </label>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 cursor-pointer w-fit"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{selectedFile ? 'Change PDF' : 'Choose PDF'}</span>
              </button>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-x-2">
                <span className="font-semibold text-slate-600 dark:text-slate-300">PDF only</span>
                <span>•</span>
                <span>Maximum 200 KB</span>
              </div>
            </div>

            {/* Selected file info */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400">Selected:</div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                      {selectedFile.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {selectedFile.sizeKb} KB
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {fileError && (
              <p className="text-[11px] text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>{fileError}</span>
              </p>
            )}
          </div>
        </div>

        {/* Publication */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Publication
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full sm:w-60 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-[#1E40AF]"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>
      </div>

      {/* Actions (Requirement 13 & 20: Cancel, Upload Document) */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-[#1E40AF] hover:bg-[#1D4ED8] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <span>{initialData?.id ? 'Save Changes' : 'Upload Document'}</span>
          )}
        </button>
      </div>
    </form>
  );
};
