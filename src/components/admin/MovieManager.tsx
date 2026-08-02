import React, { useState, useRef } from 'react';
import { Button, Input, Textarea, SearchInput, Dialog, ToastContainer, type ToastMessage } from '../shared';
import { saveMovie, deleteMovie } from '../../storage/db';
import type { MovieItem } from '../../types';
import { generateId } from '../../utils/helpers';
import { FiFilm, FiPlus, FiFolderPlus, FiTrash2, FiEdit2, FiEye, FiArrowUp, FiArrowDown, FiVideo, FiUploadCloud } from 'react-icons/fi';

export interface MovieManagerProps {
  movies: MovieItem[];
  onRefresh: () => void;
}

export const MovieManager: React.FC<MovieManagerProps> = ({ movies, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewMovie, setPreviewMovie] = useState<MovieItem | null>(null);
  const [editingMovie, setEditingMovie] = useState<MovieItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State for Add / Edit Modal
  const [title, setTitle] = useState('');
  const [dialogue, setDialogue] = useState('');
  const [hint, setHint] = useState('');
  const [selectedVideoData, setSelectedVideoData] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const formVideoInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const newToast: ToastMessage = { id: generateId(), type, title, description };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Quick Batch Import (Folder or Multi Video Files)
  const processBatchVideos = async (files: FileList | File[]) => {
    const videoFiles = Array.from(files).filter((file) => file.type.startsWith('video/'));
    if (videoFiles.length === 0) {
      addToast('error', 'No Video Files Selected', 'Please select MP4, WEBM, or MOV video files.');
      return;
    }

    setIsProcessing(true);
    let importedCount = 0;

    try {
      for (const file of videoFiles) {
        const videoData = await readFileAsDataURL(file);
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const cleanTitle = nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

        const newMovie: MovieItem = {
          id: generateId(),
          title: cleanTitle,
          videoData,
          dialogue: `Guess the iconic movie for clip: "${cleanTitle}"`,
          hint: 'Listen closely to the dialogue!',
          createdAt: Date.now() + importedCount,
        };

        await saveMovie(newMovie);
        importedCount++;
      }

      addToast('success', 'Movies Imported Successfully', `Added ${importedCount} movie video(s) to IndexedDB.`);
      onRefresh();
    } catch (err) {
      console.error('Failed to import video files:', err);
      addToast('error', 'Import Failed', 'An error occurred while saving videos to IndexedDB.');
    } finally {
      setIsProcessing(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processBatchVideos(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processBatchVideos(e.dataTransfer.files);
    }
  };

  // Form Video Selection
  const handleFormVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('video/')) {
        addToast('error', 'Invalid File', 'Please select a valid MP4 or WEBM video file.');
        return;
      }
      try {
        setIsProcessing(true);
        const dataUrl = await readFileAsDataURL(file);
        setSelectedVideoData(dataUrl);
        setSelectedFileName(file.name);
        if (!title) {
          const clean = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[-_]/g, ' ');
          setTitle(clean.replace(/\b\w/g, (c) => c.toUpperCase()));
        }
      } catch (err) {
        console.error(err);
        addToast('error', 'Video Read Error', 'Failed to load video file.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Open Form Modal for Create
  const openCreateModal = () => {
    setEditingMovie(null);
    setTitle('');
    setDialogue('');
    setHint('');
    setSelectedVideoData('');
    setSelectedFileName('');
    setIsAddDialogOpen(true);
  };

  // Open Form Modal for Edit
  const openEditModal = (movie: MovieItem) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setDialogue(movie.dialogue);
    setHint(movie.hint || '');
    setSelectedVideoData(movie.videoData);
    setSelectedFileName('Existing Video Clip');
    setIsAddDialogOpen(true);
  };

  // Save Form (Create or Edit)
  const handleSaveMovieForm = async () => {
    if (!title.trim()) {
      addToast('error', 'Movie Title Required', 'Please enter a movie title.');
      return;
    }
    if (!selectedVideoData) {
      addToast('error', 'Video Required', 'Please select a video file for this movie entry.');
      return;
    }

    try {
      setIsProcessing(true);
      const movieItem: MovieItem = {
        id: editingMovie ? editingMovie.id : generateId(),
        title: title.trim(),
        dialogue: dialogue.trim() || 'Guess the movie from the clip!',
        hint: hint.trim() || undefined,
        videoData: selectedVideoData,
        createdAt: editingMovie ? editingMovie.createdAt : Date.now(),
      };

      await saveMovie(movieItem);
      addToast('success', editingMovie ? 'Movie Updated' : 'Movie Created', `Saved "${movieItem.title}"`);
      setIsAddDialogOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Save Failed', 'Could not save movie entry to IndexedDB.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete Movie
  const handleDelete = async (id: string, titleStr: string) => {
    try {
      await deleteMovie(id);
      addToast('info', 'Movie Deleted', `Removed "${titleStr}" from IndexedDB.`);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Delete Failed', 'Could not remove movie.');
    }
  };

  // Reorder Movie items in IndexedDB (swap createdAt timestamps)
  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= movies.length) return;

    try {
      const current = { ...movies[index] };
      const target = { ...movies[targetIndex] };

      const tempCreated = current.createdAt;
      current.createdAt = target.createdAt;
      target.createdAt = tempCreated;

      await saveMovie(current);
      await saveMovie(target);
      onRefresh();
    } catch (err) {
      console.error(err);
      addToast('error', 'Reorder Failed', 'Could not swap movie order.');
    }
  };

  // Filtered Movies
  const filteredMovies = movies.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.dialogue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Header Actions & Import Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FiFilm className="text-purple-400" /> Movie Deck Manager ({movies.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Import movie clips, configure dialogues and hints. Stored 100% offline in IndexedDB.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleBatchFileChange}
            accept="video/*"
            multiple
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleBatchFileChange}
            {...({ webkitdirectory: '', directory: '', multiple: true } as unknown as React.InputHTMLAttributes<HTMLInputElement>)}
            className="hidden"
          />

          <Button
            variant="neon-purple"
            size="sm"
            leftIcon={<FiPlus />}
            onClick={openCreateModal}
          >
            Add Movie Entry
          </Button>

          <Button
            variant="glass"
            size="sm"
            leftIcon={<FiFolderPlus className="text-purple-400" />}
            isLoading={isProcessing}
            onClick={() => folderInputRef.current?.click()}
          >
            Import Video Folder
          </Button>
        </div>
      </div>

      {/* Drag & Drop Area for Quick Video Import */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onClick={() => videoInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
            : 'border-slate-800 hover:border-purple-500/50 bg-slate-900/40 hover:bg-slate-900/80'
        }`}
      >
        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <FiUploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-bold text-slate-200">
          Drag & Drop Video Clips or Folder Here
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Supports MP4, WEBM, MOV video formats.
        </p>
      </div>

      {/* Search & Counter */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <SearchInput
            placeholder="Search movies by title or dialogue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 shrink-0">
          Showing {filteredMovies.length} of {movies.length} movies
        </span>
      </div>

      {/* Movie List Grid */}
      {filteredMovies.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center">
          <FiFilm className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No Movies Found</h4>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery ? 'No movies match your search.' : 'Click "Add Movie Entry" or drop a video folder to populate the movie deck.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMovies.map((movie, idx) => (
            <div
              key={movie.id}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200"
            >
              {/* Reorder Buttons & Index */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-8 h-8 rounded-xl bg-slate-800 font-mono text-xs font-bold flex items-center justify-center text-purple-400">
                  #{idx + 1}
                </span>
                <div className="flex flex-col gap-0.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleReorder(idx, 'up')}
                    className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400"
                    title="Move Up"
                  >
                    <FiArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === movies.length - 1}
                    onClick={() => handleReorder(idx, 'down')}
                    className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:hover:text-slate-400"
                    title="Move Down"
                  >
                    <FiArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Thumbnail / Preview Play Trigger */}
              <div
                onClick={() => setPreviewMovie(movie)}
                className="w-32 h-20 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden shrink-0 cursor-pointer group"
              >
                <video src={movie.videoData} className="w-full h-full object-cover" muted />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center group-hover:bg-slate-950/40 transition-colors">
                  <FiEye className="w-6 h-6 text-purple-400" />
                </div>
              </div>

              {/* Info Details */}
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-slate-100 truncate">{movie.title}</h4>
                <p className="text-xs text-purple-300 italic mt-0.5 line-clamp-1">
                  "{movie.dialogue}"
                </p>
                {movie.hint && (
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Hint: {movie.hint}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="glass"
                  leftIcon={<FiEye />}
                  onClick={() => setPreviewMovie(movie)}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="glass"
                  leftIcon={<FiEdit2 />}
                  onClick={() => openEditModal(movie)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<FiTrash2 />}
                  onClick={() => handleDelete(movie.id, movie.title)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Movie Entry Dialog */}
      <Dialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        title={editingMovie ? 'Edit Movie Entry' : 'Add Movie Entry'}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <Input
            label="Movie Title"
            placeholder="e.g. Om Shanti Om, Interstellar..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            label="Dialogue Text (Spoken on Stage)"
            placeholder="e.g. Kehte hain agar kisi cheez ko dil se chaho..."
            value={dialogue}
            onChange={(e) => setDialogue(e.target.value)}
          />

          <Input
            label="Optional Hint (Host Clue)"
            placeholder="e.g. Released in 2007, Directed by Farah Khan"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
          />

          {/* Video File Picker */}
          <div>
            <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase block mb-1.5">
              Video Clip File
            </label>
            <input
              type="file"
              ref={formVideoInputRef}
              accept="video/*"
              onChange={handleFormVideoSelect}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="glass"
                size="sm"
                leftIcon={<FiVideo className="text-purple-400" />}
                onClick={() => formVideoInputRef.current?.click()}
                isLoading={isProcessing}
              >
                Choose Video File
              </Button>
              {selectedFileName && (
                <span className="text-xs text-purple-300 font-mono truncate max-w-xs">
                  {selectedFileName}
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="neon-purple" size="sm" onClick={handleSaveMovieForm} isLoading={isProcessing}>
              Save Movie Entry
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Video Preview Modal */}
      <Dialog
        isOpen={!!previewMovie}
        onClose={() => setPreviewMovie(null)}
        title={previewMovie?.title || 'Video Preview'}
        maxWidth="xl"
      >
        {previewMovie && (
          <div className="space-y-4">
            <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <video
                src={previewMovie.videoData}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <h4 className="text-lg font-bold text-slate-100">{previewMovie.title}</h4>
              <p className="text-sm text-purple-300 italic">"{previewMovie.dialogue}"</p>
              {previewMovie.hint && (
                <p className="text-xs text-slate-400 font-mono">Hint: {previewMovie.hint}</p>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
