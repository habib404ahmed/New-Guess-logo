import React, { useState } from 'react';
import { AdminSidebar, LogoManager, MovieManager, type AdminTab } from '../../components/admin';
import { Card, CardHeader, CardBody, Badge, Button } from '../../components/shared';
import { useStorage } from '../../hooks/useStorage';
import { FiImage, FiFilm, FiCheckSquare, FiClock, FiUpload, FiDatabase } from 'react-icons/fi';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { logos, movies, refresh, setLogos, setMovies } = useStorage();

  const totalLogos = logos.length;
  const totalMovies = movies.length;
  const readyQuestions = totalLogos + totalMovies;

  const latestLogoTime = logos.reduce((max, item) => Math.max(max, item.createdAt || 0), 0);
  const latestMovieTime = movies.reduce((max, item) => Math.max(max, item.createdAt || 0), 0);
  const lastSavedTimestamp = Math.max(latestLogoTime, latestMovieTime);

  const formattedLastSaved = lastSavedTimestamp > 0
    ? new Date(lastSavedTimestamp).toLocaleString()
    : 'No items saved yet';

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        logoCount={totalLogos}
        movieCount={totalMovies}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-950/80">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 uppercase">
              {activeTab === 'dashboard' && 'Event Control Dashboard'}
              {activeTab === 'logos' && 'Logo Challenge Manager'}
              {activeTab === 'movies' && 'Movie Challenge Manager'}
              {activeTab === 'settings' && 'Event Settings'}
            </h1>
            <Badge variant="blue" className="text-[10px]">Cloud Active</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <FiDatabase className="text-cyan-400" /> Storage: Cloudinary & Cloud Sync
            </span>
            <Button size="sm" variant="glass" onClick={refresh}>
              Sync Data
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Dashboard Intro */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-100">Welcome to Host Admin</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Manage all challenge questions offline. Changes save directly to browser storage.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="neon-blue" size="md" leftIcon={<FiUpload />} onClick={() => setActiveTab('logos')}>
                    Upload Logos
                  </Button>
                  <Button variant="neon-purple" size="md" leftIcon={<FiUpload />} onClick={() => setActiveTab('movies')}>
                    Upload Movies
                  </Button>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" className="border-cyan-500/20">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FiImage className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Logos Loaded</p>
                      <h3 className="text-2xl font-black text-slate-100">{totalLogos}</h3>
                    </div>
                  </CardBody>
                </Card>

                <Card variant="glass" className="border-purple-500/20">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <FiFilm className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Movies Loaded</p>
                      <h3 className="text-2xl font-black text-slate-100">{totalMovies}</h3>
                    </div>
                  </CardBody>
                </Card>

                <Card variant="glass" className="border-emerald-500/20">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <FiCheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Questions</p>
                      <h3 className="text-2xl font-black text-slate-100">{readyQuestions}</h3>
                    </div>
                  </CardBody>
                </Card>

                <Card variant="glass" className="border-amber-500/20">
                  <CardBody className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <FiClock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Last Sync</p>
                      <h3 className="text-xs font-mono text-slate-200 mt-1 truncate max-w-[140px]" title={formattedLastSaved}>
                        {formattedLastSaved}
                      </h3>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Status Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card variant="solid" hoverEffect={false} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                      <FiImage className="text-cyan-400" /> Logo Manager Status
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-slate-400 mb-4">
                      Import logo images from your local folder, rename entries, delete, or search questions.
                    </p>
                    <Button variant="neon-blue" size="sm" onClick={() => setActiveTab('logos')}>
                      Open Logo Manager
                    </Button>
                  </CardBody>
                </Card>

                <Card variant="solid" hoverEffect={false} className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                      <FiFilm className="text-purple-400" /> Movie Manager Status
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-sm text-slate-400 mb-4">
                      Import video clips, enter movie titles, dialogues, and optional hints for stage projection.
                    </p>
                    <Button variant="neon-purple" size="sm" onClick={() => setActiveTab('movies')}>
                      Open Movie Manager
                    </Button>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {/* LOGO MANAGER TAB */}
          {activeTab === 'logos' && (
            <LogoManager logos={logos} setLogos={setLogos} onRefresh={refresh} />
          )}

          {/* MOVIE MANAGER TAB */}
          {activeTab === 'movies' && (
            <MovieManager movies={movies} setMovies={setMovies} onRefresh={refresh} />
          )}

          {activeTab === 'settings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-slate-100">Event Settings</h2>
              <p className="text-sm text-slate-400 mt-1">Configure timer durations and manual stage preferences.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;

