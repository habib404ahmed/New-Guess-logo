import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StageHeader } from '../../components/stage';
import { Button, Particles, Countdown } from '../../components/shared';
import { useStorage } from '../../hooks/useStorage';
import { getGameSettings } from '../../utils/settings';
import { FiImage, FiSettings, FiCheckCircle, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const DEFAULT_TIMER_SECONDS = 30;

export const LogoChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { logos, loading } = useStorage();
  const gameSettings = getGameSettings();
  const timerDuration = gameSettings.logoTimerDuration || 30;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);

  const currentLogo = logos[currentIndex];

  // Timer countdown hook logic
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Reset timer & state when question changes
  const resetQuestionState = useCallback(() => {
    setIsRevealed(false);
    setTimeLeft(DEFAULT_TIMER_SECONDS);
    setIsTimerRunning(true);
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < logos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetQuestionState();
    } else {
      // Completed all questions -> Navigate to celebration screen
      navigate('/thank-you');
    }
  }, [currentIndex, logos.length, navigate, resetQuestionState]);

  const handleToggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  // Keyboard shortcut listener for live host control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleToggleReveal();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        navigate('/home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextQuestion, handleToggleReveal, navigate]);

  // Safeguard: Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center text-cyan-400 font-mono text-lg">
        Loading Logo Arena...
      </div>
    );
  }

  // Safeguard: Empty Deck
  if (logos.length === 0) {
    return (
      <div className="relative min-h-screen w-full bg-[#050811] flex flex-col items-center justify-center p-6 stage-grid ambient-bg">
        <Particles count={15} />
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 max-w-lg text-center backdrop-blur-xl z-10 shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <FiImage className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black uppercase text-slate-100">No Logos Available</h2>
          <p className="text-slate-400 text-sm">
            You need to add logos in the Admin Panel before launching the live stage challenge.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="glass" onClick={() => navigate('/home')}>
              Back to Home
            </Button>
            <Button variant="neon-blue" leftIcon={<FiSettings />} onClick={() => navigate('/admin')}>
              Open Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050811] flex flex-col justify-between p-6 overflow-hidden stage-grid ambient-bg select-none">
      {/* Background Particles */}
      <Particles count={25} />

      {/* Lighting Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[170px] pointer-events-none" />

      {/* Countdown Stage Overlay */}
      <Countdown
        active={showCountdown}
        onComplete={() => {
          setShowCountdown(false);
          setIsTimerRunning(true);
        }}
      />

      {/* TOP STAGE BAR */}
      <StageHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={logos.length}
        timeLeft={timeLeft}
        totalTime={timerDuration}
        categoryName="🏢 GUESS THE LOGO"
      />

      {/* CENTER STAGE: TWO-COLUMN LAYOUT (LEFT 65%: LOGO CARD, RIGHT 35%: ANSWER CARD & VERTICAL BUTTONS) */}
      <main className="flex-1 flex items-center justify-center my-auto py-6 z-10 w-full max-w-7xl mx-auto">
        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-[60px]">
          
          {/* LEFT SIDE (65% DESKTOP) - LOGO CARD */}
          <div className="w-full lg:w-[65%] flex justify-center items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLogo.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.15 }}
                className="w-full flex justify-center"
              >
                <div className="relative w-full max-w-2xl h-[360px] sm:h-[450px] bg-slate-900/70 border-2 border-cyan-500/40 rounded-3xl p-8 flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden group">
                  <img
                    src={currentLogo.imageData}
                    alt="Guess the logo"
                    className={`max-h-full max-w-full object-contain transition-all duration-500 ${
                      isRevealed
                        ? 'scale-105 drop-shadow-[0_0_35px_rgba(0,240,255,0.6)]'
                        : 'drop-shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    }`}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE (35% DESKTOP) - CONTROL PANEL (ANSWER CARD + VERTICAL BUTTONS) */}
          <div className="w-full lg:w-[35%] flex flex-col justify-center items-center lg:items-stretch gap-[20px] shrink-0">
            {/* ANSWER CARD (FADES IN WHEN REVEALED) */}
            <div className="min-h-[140px] w-full max-w-[320px] lg:w-[320px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full p-6 rounded-3xl bg-slate-900/80 border-2 border-cyan-400/80 shadow-[0_0_45px_rgba(0,240,255,0.35)] backdrop-blur-xl space-y-2 text-center"
                  >
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-white text-xs font-black tracking-widest uppercase">
                      <FiCheckCircle className="w-4 h-4 text-cyan-400" />
                      <span>✓ ANSWER</span>
                    </div>

                    <div className="pt-1">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-cyan-400 drop-shadow-[0_0_30px_rgba(0,240,255,0.7)] break-words">
                        {currentLogo.name}
                      </h2>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* REVEAL ANSWER BUTTON */}
            <Button
              variant={isRevealed ? 'neon-purple' : 'neon-blue'}
              size="lg"
              leftIcon={isRevealed ? <FiEyeOff className="w-6 h-6" /> : <FiEye className="w-6 h-6" />}
              onClick={handleToggleReveal}
              className="w-full max-w-[320px] lg:w-[320px] h-[72px] font-black uppercase text-lg shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-300 cursor-pointer"
            >
              {isRevealed ? 'Hide Answer' : 'Reveal Answer'}
            </Button>

            {/* FINISH STAGE / NEXT QUESTION BUTTON */}
            <Button
              variant="host-stage"
              size="lg"
              rightIcon={<FiArrowRight className="w-6 h-6 fill-current" />}
              onClick={handleNextQuestion}
              className="w-full max-w-[320px] lg:w-[320px] h-[72px] font-black uppercase text-lg shadow-[0_0_35px_rgba(0,240,255,0.5)] transition-all duration-300 cursor-pointer"
            >
              {currentIndex < logos.length - 1 ? 'Next Question' : 'Finish Stage'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LogoChallengePage;
