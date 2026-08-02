import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button, Particles, Badge, NeonText } from '../../components/shared';
import { FiAward, FiPlay, FiHome, FiSettings, FiStar } from 'react-icons/fi';

export const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();

  const fireConfetti = () => {
    // Left burst
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: ['#00f0ff', '#9d4edd', '#06b6d4', '#f43f5e', '#f59e0b'],
    });
    // Right burst
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: ['#00f0ff', '#9d4edd', '#06b6d4', '#f43f5e', '#f59e0b'],
    });
  };

  useEffect(() => {
    fireConfetti();
    const interval = setInterval(() => {
      fireConfetti();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#050811] flex flex-col items-center justify-between p-6 sm:p-10 overflow-hidden stage-grid ambient-bg select-none">
      {/* Background Particles */}
      <Particles count={35} />

      {/* Ambient Lighting Spotlights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-cyan-500/15 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[170px] pointer-events-none" />

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl flex items-center justify-between z-10"
      >
        <Badge variant="blue" className="px-4 py-1.5 text-sm font-black tracking-widest">
          <FiAward className="inline mr-1.5 w-4 h-4 text-cyan-400" />
          FRESHERS 2026 EVENT COMPLETE
        </Badge>
        <Button variant="glass" size="sm" leftIcon={<FiStar />} onClick={fireConfetti}>
          Celebrate Again 🎉
        </Button>
      </motion.header>

      {/* Main Celebration Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center z-10 my-auto py-8 max-w-4xl">
        {/* Animated Trophy Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-28 h-28 sm:w-36 sm:h-36 mb-8 rounded-full bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 p-1 shadow-[0_0_60px_rgba(0,240,255,0.6)] flex items-center justify-center"
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-cyan-400">
            <FiAward className="w-16 h-16 sm:w-20 sm:h-20 animate-pulse" />
          </div>
        </motion.div>

        {/* GIANT "THANK YOU" TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl sm:text-8xl md:text-9xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 drop-shadow-[0_0_50px_rgba(0,240,255,0.6)]"
        >
          THANK YOU
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-xl sm:text-3xl md:text-4xl font-extrabold tracking-wide text-slate-200"
        >
          Hope you enjoyed the{' '}
          <NeonText color="blue" className="text-glow-blue">
            Freshers Challenge Arena
          </NeonText>
        </motion.p>

        {/* HOST ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            variant="host-stage"
            size="xl"
            rightIcon={<FiPlay className="w-6 h-6 fill-current text-slate-950" />}
            onClick={() => navigate('/home')}
            className="px-10 py-5 text-xl font-black rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.6)]"
          >
            PLAY AGAIN
          </Button>

          <Button
            variant="glass"
            size="xl"
            leftIcon={<FiHome className="w-6 h-6" />}
            onClick={() => navigate('/')}
            className="px-8 py-5 text-lg font-bold rounded-2xl"
          >
            Main Menu
          </Button>

          <Button
            variant="glass"
            size="xl"
            leftIcon={<FiSettings className="w-6 h-6" />}
            onClick={() => navigate('/admin')}
            className="px-8 py-5 text-lg font-bold rounded-2xl"
          >
            Admin Panel
          </Button>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="w-full max-w-4xl text-center text-xs font-semibold uppercase tracking-widest text-slate-500 border-t border-slate-800/60 pt-4 z-10"
      >
        <span>🎉 FRESHERS COLLEGE EVENT 2026 • LIVE STAGE ARENA</span>
      </motion.footer>
    </div>
  );
};

export default ThankYouPage;
