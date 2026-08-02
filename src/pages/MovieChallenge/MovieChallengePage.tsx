import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StageHeader, StageControls } from '../../components/stage';
import { Button, Particles, Countdown } from '../../components/shared';
import { useStorage } from '../../hooks/useStorage';
import { getGameSettings } from '../../utils/settings';
import { FiFilm, FiRotateCcw, FiCheckCircle, FiSettings, FiVolume2, FiMessageSquare, FiHelpCircle } from 'react-icons/fi';

export const MovieChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { movies, loading } = useStorage();
  const gameSettings = getGameSettings();
  const timerDuration = gameSettings.movieTimerDuration || 30;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentMovie = movies[currentIndex];

  // Replay video clip manually from host action
  const handleReplayClip = useCallback(async () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      try {
        await videoRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Replay video playback error:', err);
      }
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Reset state when switching questions - ENSURE VIDEO IS PAUSED AT 0.00
  const resetQuestionState = useCallback(() => {
    setIsRevealed(false);
    setTimeLeft(timerDuration);
    setIsTimerRunning(false);
    setShowCountdown(true);
    setIsPlaying(false);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [timerDuration]);

  useEffect(() => {
    if (currentMovie) {
      resetQuestionState();
    }
  }, [currentIndex, currentMovie, resetQuestionState]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < movies.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/thank-you');
    }
  }, [currentIndex, movies.length, navigate]);

  const handlePrevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleToggleReveal = useCallback(() => {
    setIsRevealed((prev) => !prev);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleToggleReveal();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        handleReplayClip();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        navigate('/home');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextQuestion, handleReplayClip, handleToggleReveal, navigate]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center text-purple-400 font-mono text-lg">
        Loading Movie Arena...
      </div>
    );
  }

  // Safeguard: Empty Deck
  if (movies.length === 0) {
    return (
      <div className="relative min-h-screen w-full bg-[#050811] flex flex-col items-center justify-center p-6 stage-grid ambient-bg">
        <Particles count={15} />
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-10 max-w-lg text-center backdrop-blur-xl z-10 shadow-2xl space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-purple-400">
            <FiFilm className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black uppercase text-slate-100">No Movies Available</h2>
          <p className="text-slate-400 text-sm">
            You need to add movie clips in the Admin Panel before launching the live stage challenge.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Button variant="glass" onClick={() => navigate('/home')}>
              Back to Home
            </Button>
            <Button variant="neon-purple" leftIcon={<FiSettings />} onClick={() => navigate('/admin')}>
              Open Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#02050e] flex flex-col justify-between p-6 overflow-hidden stage-grid ambient-bg select-none">
      <Particles count={25} />

      {/* Lighting Spotlight */}
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/15 rounded-full blur-[180px] pointer-events-none" />

      {/* Countdown Stage Overlay - Video plays ONLY AFTER countdown finishes */}
      <Countdown
        active={showCountdown}
        onComplete={async () => {
          setShowCountdown(false);
          setIsTimerRunning(true);
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            try {
              await videoRef.current.play();
              setIsPlaying(true);
            } catch (err) {
              console.log('Video play after countdown error:', err);
            }
          }
        }}
      />

      {/* TOP STAGE BAR */}
      <StageHeader
        currentQuestion={currentIndex + 1}
        totalQuestions={movies.length}
        timeLeft={timeLeft}
        totalTime={timerDuration}
        categoryName="🎬 GUESS THE MOVIE"
      />

      {/* CENTER STAGE: 2-COLUMN LAYOUT (LEFT 65%: VIDEO CARD, RIGHT 35%: CONTROL STACK) */}
      <main className="flex-1 flex items-center justify-center my-auto py-6 z-10 w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMovie.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-[40px]"
          >
            {/* LEFT COLUMN: ADAPTIVE 16:9 VIDEO CARD (65% DESKTOP) */}
            <div className="w-full lg:w-[65%] flex flex-col items-center">
              <div className="relative w-full aspect-video bg-slate-950 rounded-3xl border-2 border-[#00d9ff]/40 hover:border-[#00d9ff]/70 shadow-[0_0_40px_rgba(0,217,255,0.2)] overflow-hidden group flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentMovie.videoData}
                  controls={false}
                  preload="auto"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.pause();
                      videoRef.current.currentTime = 0;
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full h-full object-contain bg-slate-950 rounded-3xl"
                />

                {/* Status Badge Overlay */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur-md text-xs font-mono font-bold text-purple-300">
                  <FiVolume2 className="text-[#00d9ff] animate-pulse" />
                  <span>{isPlaying ? 'PLAYING CLIP' : 'CLIP PAUSED / ENDED'}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: VERTICAL CONTROL STACK (35% DESKTOP) */}
            <div className="w-full lg:w-[35%] flex flex-col justify-start items-stretch gap-6">
              {/* 1. DIALOGUE CARD */}
              <div className="w-full p-5 sm:p-6 rounded-3xl bg-slate-900/80 border-2 border-purple-500/30 backdrop-blur-xl shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                <div className="text-xs font-bold uppercase tracking-widest text-[#00d9ff] flex items-center gap-2 mb-2">
                  <FiMessageSquare className="w-4 h-4 text-[#00d9ff]" />
                  <span>MOVIE DIALOGUE</span>
                </div>
                <blockquote className="text-base sm:text-lg font-semibold italic text-slate-100 leading-relaxed">
                  "{currentMovie.dialogue}"
                </blockquote>
              </div>

              {/* 2. HINT CARD (ALWAYS SHOWN - NO BLANK SPACE) */}
              <div className="w-full p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-[0_0_25px_rgba(139,92,246,0.15)]">
                <div className="text-xs font-bold uppercase tracking-widest text-purple-400 flex items-center gap-2 mb-1.5">
                  <FiHelpCircle className="w-4 h-4 text-purple-400" />
                  <span>HOST HINT</span>
                </div>
                {currentMovie.hint ? (
                  <p className="text-xs sm:text-sm font-mono text-purple-200">
                    {currentMovie.hint}
                  </p>
                ) : (
                  <p className="text-xs font-mono italic text-slate-500">
                    No Hint Available
                  </p>
                )}
              </div>

              {/* 3. REPLAY BUTTON */}
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReplayClip}
                className="w-full h-[64px] rounded-[18px] bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(192,38,211,0.4)] hover:shadow-[0_0_35px_rgba(192,38,211,0.6)] transition-all duration-300 cursor-pointer border border-purple-300/40"
              >
                <FiRotateCcw className="w-5 h-5" />
                <span>Replay Video Clip</span>
              </motion.button>

              {/* 4. ANSWER CARD */}
              <div className="min-h-[110px] w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isRevealed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="w-full p-5 sm:p-6 rounded-3xl bg-slate-900/80 border-2 border-purple-500/50 shadow-[0_0_45px_rgba(139,92,246,0.4)] backdrop-blur-xl text-center space-y-1.5"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-white text-xs font-black tracking-widest uppercase">
                        <FiCheckCircle className="w-4 h-4 text-purple-400" />
                        <span>MOVIE ANSWER</span>
                      </div>

                      <div className="pt-1">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.8)] break-words">
                          {currentMovie.title}
                        </h2>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM STAGE CONTROLS */}
      <StageControls
        isRevealed={isRevealed}
        onToggleReveal={handleToggleReveal}
        onNextQuestion={handleNextQuestion}
        onPrevQuestion={handlePrevQuestion}
        onExit={() => navigate('/home')}
        hasNext={currentIndex < movies.length - 1}
        hasPrev={currentIndex > 0}
      />
    </div>
  );
};

export default MovieChallengePage;
