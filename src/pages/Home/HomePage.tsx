import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, Badge, Particles } from '../../components/shared';
import { useStorage } from '../../hooks/useStorage';
import { FiPlay, FiSettings, FiArrowLeft, FiImage, FiFilm, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { logos, movies, loading } = useStorage();

  return (
    <div className="relative min-h-screen w-full bg-[#050811] flex flex-col items-center justify-between p-6 sm:p-10 overflow-x-hidden stage-grid ambient-bg">
      {/* Background Particles */}
      <Particles count={20} />

      {/* Lighting Gradients */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl flex items-center justify-between z-10"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-extrabold text-slate-300 hover:text-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl backdrop-blur-md transition-all shadow-md"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>MAIN MENU</span>
        </button>

        <div className="flex items-center gap-3">
          <Badge variant="blue" className="px-3 py-1 text-xs md:text-sm font-black tracking-widest">
            GAME MODE SELECT
          </Badge>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-cyan-400 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl backdrop-blur-md transition-all shadow-md"
          >
            <FiSettings className="w-4 h-4" />
            <span>ADMIN PANEL</span>
          </button>
        </div>
      </motion.header>

      {/* Main Game Mode Grid */}
      <main className="w-full max-w-6xl my-auto py-8 z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]">
            CHOOSE YOUR ARENA
          </h1>
          <p className="text-slate-400 text-base md:text-xl font-semibold mt-3 tracking-wide">
            Select a game mode to launch on the projector stage
          </p>
        </motion.div>

        {/* TWO GAME CARDS ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          {/* Card 1: Guess The Logo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex"
          >
            <Card
              variant="neon-blue"
              hoverEffect={true}
              glow="blue"
              className="flex-1 flex flex-col justify-between p-8 md:p-10 border-2 border-cyan-500/30 hover:border-cyan-400 rounded-3xl bg-slate-900/70 backdrop-blur-xl group shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_50px_rgba(0,240,255,0.35)] transition-all duration-300"
            >
              <div>
                {/* Large Illustration Icon */}
                <div className="w-24 h-24 md:w-28 md:h-28 mb-8 rounded-3xl bg-gradient-to-br from-cyan-400/20 via-blue-600/30 to-slate-900 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.3)] transition-all duration-300">
                  <FiImage className="w-12 h-12 md:w-14 md:h-14 stroke-[1.5]" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge variant="blue" className="px-3 py-1 font-bold">MODE 01</Badge>
                  <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    {loading ? (
                      'Loading...'
                    ) : logos.length > 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <FiCheckCircle /> {logos.length} Logos Ready
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <FiAlertCircle /> 0 Logos (Add in Admin)
                      </span>
                    )}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                  🏢 Guess The Logo
                </h2>

                <p className="text-slate-300 text-base md:text-lg mt-4 leading-relaxed font-medium">
                  Test team brand recognition! Reveal high-resolution brand logos on stage step-by-step with customizable answer timer controls.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-800/80">
                <Button
                  variant="neon-blue"
                  size="lg"
                  rightIcon={<FiPlay className="w-5 h-5 fill-current" />}
                  onClick={() => navigate('/play/logo')}
                  className="w-full text-lg py-4 font-black tracking-wider uppercase shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                >
                  PLAY LOGO GAME
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Card 2: Guess The Movie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex"
          >
            <Card
              variant="neon-purple"
              hoverEffect={true}
              glow="purple"
              className="flex-1 flex flex-col justify-between p-8 md:p-10 border-2 border-purple-500/30 hover:border-purple-400 rounded-3xl bg-slate-900/70 backdrop-blur-xl group shadow-[0_0_30px_rgba(157,78,221,0.15)] hover:shadow-[0_0_50px_rgba(157,78,221,0.35)] transition-all duration-300"
            >
              <div>
                {/* Large Illustration Icon */}
                <div className="w-24 h-24 md:w-28 md:h-28 mb-8 rounded-3xl bg-gradient-to-br from-purple-400/20 via-pink-600/30 to-slate-900 border-2 border-purple-400/40 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:border-purple-300 shadow-[0_0_25px_rgba(157,78,221,0.3)] transition-all duration-300">
                  <FiFilm className="w-12 h-12 md:w-14 md:h-14 stroke-[1.5]" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <Badge variant="purple" className="px-3 py-1 font-bold">MODE 02</Badge>
                  <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    {loading ? (
                      'Loading...'
                    ) : movies.length > 0 ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <FiCheckCircle /> {movies.length} Movies Ready
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <FiAlertCircle /> 0 Movies (Add in Admin)
                      </span>
                    )}
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-slate-100 uppercase tracking-tight group-hover:text-purple-300 transition-colors">
                  🎬 Guess The Movie
                </h2>

                <p className="text-slate-300 text-base md:text-lg mt-4 leading-relaxed font-medium">
                  Challenge the audience with iconic video clips and famous movie dialogues. Features full video replay, optional text hints, and instant reveal.
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-slate-800/80">
                <Button
                  variant="neon-purple"
                  size="lg"
                  rightIcon={<FiPlay className="w-5 h-5 fill-current" />}
                  onClick={() => navigate('/play/movie')}
                  className="w-full text-lg py-4 font-black tracking-wider uppercase shadow-[0_0_25px_rgba(157,78,221,0.4)]"
                >
                  PLAY MOVIE GAME
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-7xl flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-widest pt-4 border-t border-slate-800/60 z-10">
        <span>🎮 EVENT HOST CONTROL PANEL</span>
        <span>OFFLINE DATABASE CONNECTED</span>
      </footer>
    </div>
  );
};

export default HomePage;
