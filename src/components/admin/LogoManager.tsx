import React, { useState, useRef } from 'react';
import { Button, Input, SearchInput, Dialog, ToastContainer, type ToastMessage } from '../shared';
import { saveLogo, deleteLogo } from '../../storage/db';
import type { LogoItem } from '../../types';
import { generateId } from '../../utils/helpers';
import { FiUploadCloud, FiTrash2, FiEdit2, FiEye, FiFolderPlus, FiPlus, FiCheck, FiX, FiImage } from 'react-icons/fi';

export interface LogoManagerProps {
  logos: LogoItem[];
  onRefresh: () => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ logos, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<LogoItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = { id: generateId(), type, title, description };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to read File as Base64 data URL
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process files (single, multi, or folder)
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (fileArray.length === 0) {
      addToast('error', 'No Image Files Selected', 'Please select PNG, JPG, WEBP, or SVG image files.');
      return;
    }

    setIsProcessing(true);
    let importedCount = 0;

    try {
      for (const file of fileArray) {
        const dataUrl = await readFileAsDataURL(file);
        // Extract clean name from filename (e.g. google_logo.png -> Google Logo)
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanName = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const newLogo: LogoItem = {
          id: generateId(),
          name: cleanName,
          imageData: dataUrl,
          createdAt: Date.now(),
        };

        await saveLogo(newLogo);
        importedCount++;
      }

      addToast('success', 'Logos Imported Successfully', `Added ${importedCount} logo(s) to IndexedDB.`);
      onRefresh();
    } catch (err) {
      console.error('Failed to import logos:', err);
      addToast('error', 'Import Failed', 'An error occurred while saving logos to IndexedDB.');
    } finally {
      setIsProcessing(false);
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
    setEditingName(logo.name);
  };

  const saveRename = async (logo: LogoItem) => {
    if (!editingName.trim()) {
      addToast('error', 'Name Required', 'Logo name cannot be empty.');
      return;
    }

    try {
      const updated: LogoItem = { ...logo, name: editingName.trim() };
      await saveLogo(updated);
      addToast('success', 'Logo Renamed', `Updated to "${editingName.trim()}"`);
      setEditingId(null);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Rename Failed', 'Could not update logo name.');
    }
  };

  // Delete Logo
  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteLogo(id);
      addToast('info', 'Logo Deleted', `Removed "${name}" from IndexedDB.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Delete Failed', 'Could not remove logo.');
    }
  };

  // Filtered Logos
  const filteredLogos = logos.filter((logo) =>
    logo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions & Import Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiImage className="text-cyan-400" /> Logo Deck Manager ({logos.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Import individual logo images or entire image folders. Stored 100% offline in IndexedDB.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="hidden"
          />
          {/* Folder Input */}
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
            leftIcon={<FiPlus />}
            isLoading={isProcessing}
            onClick={() => fileInputRef.current?.click()}
          >
            Add Logo Files
          </Button>

          <Button
            variant="glass"
            size="sm"
            leftIcon={<FiFolderPlus className="text-cyan-400" />}
            isLoading={isProcessing}
            onClick={() => folderInputRef.current?.click()}
          >
            Import Logo Folder
          </Button>
        </div>
      </div>

      {/* Interactive Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <FiUploadCloud className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold text-slate-200">
          Drag & Drop Logo Images or Folder Here
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Supports PNG, JPG, WEBP, SVG files. Instant Base64 offline conversion.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <SearchInput
            placeholder="Search logos by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0">
          Showing {filteredLogos.length} of {logos.length} logos
        </span>
      </div>

      {/* Logo Grid */}
      {filteredLogos.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
          <FiImage className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No Logos Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'No logos match your search query.' : 'Click "Add Logo Files" or drop a folder above to populate the logo deck.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredLogos.map((logo) => (
            <div
              key={logo.id}
              className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-3 flex flex-col justify-between group transition-all duration-200"
            >
              {/* Image Preview Box */}
              <div
                onClick={() => setPreviewLogo(logo)}
                className="w-full h-36 rounded-xl bg-slate-950/80 border border-slate-800/60 p-2 flex items-center justify-center relative overflow-hidden cursor-pointer group-hover:border-cyan-500/30"
              >
                <img
                  src={logo.imageData}
                  alt={logo.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <FiEye className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              {/* Title & Rename Input */}
              <div className="mt-3">
                {editingId === logo.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      size={1}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="py-1 text-xs"
                      autoFocus
                    />
                    <button
                      onClick={() => saveRename(logo)}
                      className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg"
                    >
                      <FiCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-200 truncate flex-1" title={logo.name}>
                      {logo.name}
                    </h4>
                    <button
                      onClick={() => startEditing(logo)}
                      className="p-1 text-slate-500 hover:text-cyan-400 rounded transition-colors"
                      title="Rename Logo"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(logo.id, logo.name)}
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

      {/* High Res Preview Dialog */}
      <Dialog
        isOpen={!!previewLogo}
        onClose={() => setPreviewLogo(null)}
        title={previewLogo?.name || 'Logo Preview'}
        maxWidth="lg"
      >
        {previewLogo && (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800">
            <img
              src={previewLogo.imageData}
              alt={previewLogo.name}
              className="max-h-[60vh] max-w-full object-contain drop-shadow-[0_0_25px_rgba(0,240,255,0.3)]"
            />
            <div className="mt-4 flex items-center justify-between w-full pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
              <span>ID: {previewLogo.id}</span>
              <span>Added: {new Date(previewLogo.createdAt).toLocaleString()}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
