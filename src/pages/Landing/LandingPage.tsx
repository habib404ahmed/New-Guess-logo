import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Particles } from '../../components/shared';
import { FiSettings, FiAward, FiArrowRight, FiImage, FiFilm, FiActivity, FiZap } from 'react-icons/fi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Sequenced Game Power-On Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-[#02050e] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* HUD LASER SCANLINE */}
      <div className="animate-scanline pointer-events-none z-30 opacity-60" />

      {/* HUD BRACKET CORNERS WITH DIGITAL INDICATORS */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#00d9ff] pointer-events-none z-40 drop-shadow-[0_0_10px_#00d9ff] flex items-center justify-center">
        <span className="w-2 h-2 bg-[#00d9ff] rounded-full animate-ping" />
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#00d9ff] pointer-events-none z-40 drop-shadow-[0_0_10px_#00d9ff]" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#00d9ff] pointer-events-none z-40 drop-shadow-[0_0_10px_#00d9ff]" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#00d9ff] pointer-events-none z-40 drop-shadow-[0_0_10px_#00d9ff]" />

      {/* CYBER GRID FLOOR WITH PARALLAX */}
      <div className="absolute inset-0 cyber-grid-floor opacity-60 pointer-events-none z-0" />

      {/* FLOATING STARS & ELECTRIC PARTICLES */}
      <Particles count={55} />

      {/* DRIFTING FOG & SMOKE LAYERS */}
      <div className="absolute top-1/3 left-10 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] animate-fog pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[700px] h-[350px] bg-purple-600/15 rounded-full blur-[170px] animate-fog pointer-events-none z-0" />

      {/* LAYERED AMBIENT ARENA SPOTLIGHTS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] bg-[#00d9ff]/15 rounded-full blur-[200px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[750px] h-[750px] bg-[#c026d3]/20 rounded-full blur-[210px] pointer-events-none z-0" />
      <div className="absolute top-10 right-1/4 w-[650px] h-[650px] bg-[#3b82f6]/15 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* ROTATING ENERGY RINGS */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[800px] h-[800px] border border-[#00d9ff]/15 rounded-full pointer-events-none border-dashed z-0"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[1000px] h-[1000px] border border-[#c026d3]/15 rounded-full pointer-events-none border-dashed z-0"
      />

      {/* BACKGROUND ARENA LIGHT STREAKS & LASERS */}
      <div className="absolute top-0 left-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-[#00d9ff]/20 to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 right-1/3 w-0.5 h-full bg-gradient-to-b from-transparent via-[#c026d3]/20 to-transparent pointer-events-none z-0" />

      {/* FLOATING HOLOGRAPHIC GEOMETRY */}
      <motion.div
        animate={{ rotate: 360, y: [-15, 15, -15] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 left-16 w-24 h-24 border-2 border-[#00d9ff]/30 rounded-2xl pointer-events-none hidden lg:block backdrop-blur-md shadow-[0_0_30px_rgba(0,217,255,0.2)] z-10"
      />
      <motion.div
        animate={{ rotate: -360, y: [15, -15, 15] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-32 right-20 w-28 h-28 border-2 border-[#c026d3]/30 rounded-full pointer-events-none hidden lg:block backdrop-blur-md shadow-[0_0_30px_rgba(192,38,211,0.2)] z-10"
      />

      {/* TOP HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-7xl flex items-center justify-between z-40 relative pt-2"
      >
        {/* Top Left Premium Glass Badge */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/70 border border-[#00d9ff]/40 backdrop-blur-xl shadow-[0_0_25px_rgba(0,217,255,0.25)]">
          <div className="p-1.5 rounded-xl bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/30">
            <FiAward className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">FRESHERS ORIENTATION</span>
            <span className="text-sm font-black text-slate-100 tracking-wider font-mono">2026 ARENA</span>
          </div>
        </div>

        {/* Top Right Admin Cyber Button */}
        <button
          onClick={() => navigate('/admin')}
          className="group flex items-center gap-3 px-6 py-3 text-xs font-extrabold text-slate-200 hover:text-[#00d9ff] bg-slate-950/80 hover:bg-slate-900 border border-[#00d9ff]/30 hover:border-[#00d9ff] rounded-2xl backdrop-blur-xl transition-all duration-300 shadow-[0_0_25px_rgba(0,217,255,0.2)] hover:shadow-[0_0_40px_rgba(0,217,255,0.5)] cursor-pointer"
          title="Open Host Admin Panel"
        >
          <FiSettings className="w-4 h-4 text-[#00d9ff] group-hover:rotate-180 transition-transform duration-700" />
          <span className="tracking-widest uppercase">ADMIN PANEL</span>
        </button>
      </motion.header>

      {/* CENTER HERO PANEL */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center text-center z-30 my-auto py-6 w-full max-w-5xl"
      >
        {/* HUGE HOLOGRAPHIC GLASS PANEL BEHIND TITLE */}
        <div className="relative w-full p-8 sm:p-12 md:p-16 rounded-[40px] bg-slate-950/50 border-2 border-[#00d9ff]/40 backdrop-blur-2xl shadow-[0_0_90px_rgba(0,217,255,0.2),inset_0_0_50px_rgba(124,58,237,0.15)] flex flex-col items-center text-center overflow-hidden">
          
          {/* Internal Reflection Streak */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#00d9ff]/10 via-transparent to-[#c026d3]/10 pointer-events-none" />

          {/* TOP FLOATING HOLOGRAM BADGE */}
          <motion.div variants={itemVariants} className="mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-950/90 border-2 border-[#00d9ff]/60 text-[#00d9ff] text-xs sm:text-sm font-extrabold uppercase tracking-widest shadow-[0_0_30px_rgba(0,217,255,0.5)] backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d9ff] animate-ping" />
              <span>⚡ LIVE EVENT • Freshers Orientation 2026</span>
            </div>
          </motion.div>

          {/* GIGANTIC 3D AAA GAME LOGO TITLE */}
          <motion.div variants={itemVariants} className="animate-title-breath my-2">
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black uppercase tracking-tight leading-none animate-shine drop-shadow-[0_15px_45px_rgba(0,217,255,0.7)] select-none">
              Freshers
            </h1>
            <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-widest text-slate-100 drop-shadow-[0_0_35px_rgba(192,38,211,0.9)] mt-2">
              CHALLENGE ARENA
            </span>
          </motion.div>

          {/* GAME MODES (FUTURISTIC GLOWING CARDS) */}
          <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950/80 border border-[#00d9ff]/50 text-[#00d9ff] text-xs sm:text-sm font-extrabold tracking-widest uppercase shadow-[0_0_25px_rgba(0,217,255,0.3)] hover:shadow-[0_0_35px_rgba(0,217,255,0.6)] hover:border-[#00d9ff] transition-all duration-300 backdrop-blur-md">
              <div className="p-1.5 rounded-xl bg-[#00d9ff]/20 text-[#00d9ff]">
                <FiImage className="w-4 h-4" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#00d9ff] animate-pulse" />
              <span>◉ LOGO CHALLENGE</span>
            </div>

            <div className="group flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-950/80 border border-[#c026d3]/50 text-[#c026d3] text-xs sm:text-sm font-extrabold tracking-widest uppercase shadow-[0_0_25px_rgba(192,38,211,0.3)] hover:shadow-[0_0_35px_rgba(192,38,211,0.6)] hover:border-[#c026d3] transition-all duration-300 backdrop-blur-md">
              <div className="p-1.5 rounded-xl bg-[#c026d3]/20 text-[#c026d3]">
                <FiFilm className="w-4 h-4" />
              </div>
              <span className="w-2 h-2 rounded-full bg-[#c026d3] animate-pulse" />
              <span>◉ MOVIE CHALLENGE</span>
            </div>
          </motion.div>

          {/* HERO START MISSION BUTTON */}
          <motion.div variants={itemVariants} className="mt-12 w-full flex justify-center">
            <motion.button
              onClick={() => navigate('/home')}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-full max-w-[420px] h-[90px] rounded-3xl bg-gradient-to-r from-[#00d9ff] via-[#7c3aed] to-[#c026d3] text-white font-black text-2xl sm:text-3xl tracking-widest uppercase flex items-center justify-center gap-4 shadow-[0_0_60px_rgba(0,217,255,0.7)] hover:shadow-[0_0_95px_rgba(0,217,255,1)] border-2 border-white/80 transition-all duration-300 cursor-pointer overflow-hidden group"
            >
              {/* Animated Light Streak Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

              {/* Sparkle energy icons */}
              <FiZap className="w-6 h-6 text-yellow-300 animate-bounce" />

              <span className="drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)]">START EVENT</span>

              {/* Continuously Bouncing Arrow */}
              <motion.div
                animate={{ x: [0, 8, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/50 shadow-inner group-hover:bg-white group-hover:text-slate-950 transition-colors"
              >
                <FiArrowRight className="w-7 h-7 stroke-[3]" />
              </motion.div>
            </motion.button>
          </motion.div>

          {/* BOTTOM INSTRUCTION */}
          <motion.p
            variants={itemVariants}
            className="mt-10 text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#00d9ff] text-glow-cyan flex items-center justify-center gap-2"
          >
            <FiActivity className="w-4 h-4 text-[#00d9ff] animate-pulse" />
            <span>🎮 Choose your challenge and begin the event</span>
          </motion.p>
        </div>
      </motion.main>

      {/* FOOTER */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="z-30 text-center text-xs font-semibold uppercase tracking-widest text-slate-400 flex flex-col sm:flex-row items-center gap-3 border-t border-slate-800/80 pt-4 w-full max-w-5xl justify-between"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00d9ff]" />
          PROJECTOR LED ARENA MODE
        </span>
        <span>⚡ MANUAL HOST CONTROLS</span>
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          100% OFFLINE READY
        </span>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
