import React, { useState, useRef } from 'react';
import { Button, SearchInput, Dialog, ToastContainer, type ToastMessage } from '../shared';
import { saveLogo, deleteLogo, saveLogosOrder } from '../../storage/db';
import type { LogoItem } from '../../types';
import { generateId } from '../../utils/helpers';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { FiImage, FiFolderPlus, FiTrash2, FiEdit2, FiEye, FiArrowUp, FiArrowDown, FiUploadCloud, FiCheck, FiX, FiLoader } from 'react-icons/fi';

export interface LogoManagerProps {
  logos: LogoItem[];
  setLogos?: React.Dispatch<React.SetStateAction<LogoItem[]>>;
  onRefresh: () => Promise<void> | void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ logos, setLogos, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<LogoItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = { id: generateId(), type, title, description };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Process files: Upload directly to Cloudinary -> Save Metadata to Database
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(
      (file) => file.type.startsWith('image/') || /\.(png|jpe?g|webp|svg|gif|bmp|ico)$/i.test(file.name)
    );
    if (fileArray.length === 0) {
      addToast('error', 'No Image Files Selected', 'Please select PNG, JPG, WEBP, or SVG image files.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    let importedCount = 0;
    let failedCount = 0;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        setUploadStatusText(`Uploading ${i + 1}/${fileArray.length}: "${file.name}" to Cloudinary...`);

        try {
          // 1. Upload file to Cloudinary -> get permanent secure_url
          const secureUrl = await uploadToCloudinary(file, {
            onProgress: (percent) => {
              const totalPercent = Math.round(((i + percent / 100) / fileArray.length) * 100);
              setUploadProgress(totalPercent);
            },
          });

          // 2. Save metadata + secure_url to Database
          const newLogo: LogoItem = {
            id: generateId(),
            title: cleanName,
            name: cleanName,
            imageData: secureUrl,
            imageUrl: secureUrl,
            order: logos.length + importedCount,
            createdAt: Date.now() + i,
          };

          await saveLogo(newLogo);

          if (setLogos) {
            setLogos((prev) => {
              const exists = prev.some((l) => l.id === newLogo.id);
              return exists ? prev.map((l) => (l.id === newLogo.id ? newLogo : l)) : [...prev, newLogo];
            });
          }

          importedCount++;
        } catch (uploadErr) {
          console.error(`Failed to upload ${file.name} to Cloudinary:`, uploadErr);
          failedCount++;
        }
      }

      if (importedCount > 0) {
        onRefresh();
        addToast(
          'success',
          'Cloudinary Upload Complete',
          `Successfully uploaded ${importedCount} logo(s) to Cloudinary & Database.`
        );
      }

      if (failedCount > 0) {
        addToast('error', 'Upload Errors Encountered', `${failedCount} file(s) failed to upload to Cloudinary.`);
      }
    } catch (err) {
      console.error('Failed processing logo uploads:', err);
      addToast('error', 'Upload Failed', 'An error occurred during Cloudinary upload.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Rename Logo
  const startEditing = (logo: LogoItem) => {
    setEditingId(logo.id);
    setEditingName(logo.title || logo.name || '');
  };

  const saveRename = async (logo: LogoItem) => {
    if (!editingName.trim()) {
      addToast('error', 'Name Required', 'Logo name cannot be empty.');
      return;
    }

    try {
      const logoTitle = editingName.trim();
      const updated: LogoItem = {
        ...logo,
        title: logoTitle,
        name: logoTitle,
      };

      await saveLogo(updated);

      if (setLogos) {
        setLogos((prev) => prev.map((l) => (l.id === logo.id ? updated : l)));
      }

      addToast('success', 'Logo Renamed', `Updated to "${logoTitle}" in Database.`);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Rename Failed', 'Could not update logo name.');
    }
  };

  // Delete Logo from Database
  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteLogo(id);
      if (setLogos) {
        setLogos((prev) => prev.filter((l) => l.id !== id));
      }
      addToast('info', 'Logo Deleted', `Removed "${name}" from Database.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Delete Failed', 'Could not remove logo.');
    }
  };

  // Reorder Logo items in Database
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= logos.length) return;

    try {
      const reordered = [...logos];
      const temp = reordered[index];
      reordered[index] = reordered[targetIndex];
      reordered[targetIndex] = temp;

      if (setLogos) setLogos(reordered);
      await saveLogosOrder(reordered);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Reorder Failed', 'Could not save new logo order.');
    }
  };

  // Filtered Logos
  const filteredLogos = logos.filter((logo) =>
    (logo.title || logo.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions & Cloudinary Upload Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiImage className="text-cyan-400" /> Logo Deck Manager ({logos.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Images stored permanently in <span className="text-cyan-300 font-mono font-bold">Cloudinary</span> • Metadata saved in <span className="text-purple-300 font-mono font-bold">MongoDB Atlas</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFileChange}
            {...({ webkitdirectory: '', directory: '', multiple: true } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
            className="hidden"
          />

          <Button
            variant="neon-blue"
            size="sm"
            leftIcon={isUploading ? <FiLoader className="animate-spin" /> : <FiUploadCloud />}
            isLoading={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Logo Files
          </Button>

          <Button
            variant="glass"
            size="sm"
            leftIcon={<FiFolderPlus className="text-cyan-400" />}
            isLoading={isUploading}
            onClick={() => folderInputRef.current?.click()}
          >
            Upload Image Folder
          </Button>
        </div>
      </div>

      {/* Realtime Progress Bar Banner */}
      {isUploading && (
        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-2xl p-4 space-y-2 backdrop-blur-xl shadow-[0_0_25px_rgba(6,182,212,0.25)]">
          <div className="flex justify-between text-xs font-mono text-cyan-300">
            <span>{uploadStatusText}</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <FiUploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-bold text-slate-200">
          Drag & Drop Images Here to Upload Directly to Cloudinary
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Supports PNG, JPG, WEBP, SVG images (<span className="font-mono text-cyan-400">vjqnrvyr</span>).
        </p>
      </div>

      {/* Search & Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <SearchInput
            placeholder="Search logos by brand name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0">
          Showing {filteredLogos.length} of {logos.length} logos
        </span>
      </div>

      {/* Logos Grid */}
      {filteredLogos.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
          <FiImage className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No Logos Available</h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'No logos match your search.' : 'Click "Upload Logo Files" or drop images to upload to Cloudinary & Database.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredLogos.map((logo, idx) => (
            <div
              key={logo.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 group relative"
            >
              {/* Index Badge */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                <span className="px-2 py-0.5 rounded-lg bg-slate-950/80 border border-slate-800 backdrop-blur-md font-mono text-[10px] font-bold text-cyan-400">
                  #{idx + 1}
                </span>
              </div>

              {/* Reorder Buttons */}
              <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-950/80 border border-slate-800 backdrop-blur-md rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  disabled={idx === 0}
                  onClick={() => handleReorder(idx, 'up')}
                  className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400"
                  title="Move Up"
                >
                  <FiArrowUp className="w-3 h-3" />
                </button>
                <button
                  disabled={idx === logos.length - 1}
                  onClick={() => handleReorder(idx, 'down')}
                  className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400"
                  title="Move Down"
                >
                  <FiArrowDown className="w-3 h-3" />
                </button>
              </div>

              {/* Image Preview Thumbnail */}
              <div
                onClick={() => setPreviewLogo(logo)}
                className="w-full aspect-square bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center p-3 relative overflow-hidden cursor-pointer mb-3"
              >
                <img
                  src={logo.imageData || logo.imageUrl}
                  alt={logo.title || logo.name}
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <FiEye className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              {/* Editable Name & Controls */}
              <div className="space-y-2">
                {editingId === logo.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(logo);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                    />
                    <button
                      onClick={() => saveRename(logo)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Save"
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:text-slate-300"
                      title="Cancel"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-200 truncate flex-1" title={logo.title || logo.name}>
                      {logo.title || logo.name}
                    </h4>
                    <button
                      onClick={() => startEditing(logo)}
                      className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors"
                      title="Rename Logo"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(logo.id, logo.title || logo.name || '')}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                      title="Delete Logo"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog
        isOpen={!!previewLogo}
        onClose={() => setPreviewLogo(null)}
        title={previewLogo?.title || previewLogo?.name || 'Logo Preview'}
        maxWidth="md"
      >
        {previewLogo && (
          <div className="space-y-4 text-center">
            <div className="w-full aspect-square max-h-[50vh] bg-slate-950 rounded-2xl border border-slate-800 p-8 flex items-center justify-center mx-auto shadow-2xl">
              <img
                src={previewLogo.imageData || previewLogo.imageUrl}
                alt={previewLogo.title || previewLogo.name}
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
              />
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <h4 className="text-lg font-bold text-slate-100">{previewLogo.title || previewLogo.name}</h4>
              <p className="text-xs font-mono text-cyan-400 mt-1 truncate" title={previewLogo.imageData || previewLogo.imageUrl}>
                Cloudinary CDN: {previewLogo.imageData || previewLogo.imageUrl}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
