import React from 'react';
import { ProgressBar, Badge, Kbd } from '../shared';
import { formatTime } from '../../utils/helpers';
import { FiClock, FiHelpCircle } from 'react-icons/fi';

export interface StageHeaderProps {
  currentQuestion: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime: number;
  categoryName?: string;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  timeLeft,
  totalTime,
  categoryName = 'LOGO CHALLENGE',
}) => {
  const progressPercent = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
  const overallQuestionPercent = totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;

  return (
    <header className="w-full max-w-7xl mx-auto space-y-3 z-20">
      {/* Top Row: Meta Badges, Question Counter & Digital Clock */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
        {/* Left: Category & Question Number */}
        <div className="flex items-center gap-4">
          <Badge variant="blue" className="px-3 py-1 text-sm font-black tracking-widest">
            {categoryName}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">QUESTION</span>
            <span className="text-xl font-black font-mono text-cyan-400">
              {String(currentQuestion).padStart(2, '0')}{' '}
              <span className="text-slate-500 text-sm">/ {String(totalQuestions).padStart(2, '0')}</span>
            </span>
          </div>
        </div>

        {/* Center: Stage Shortcut Helper */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 font-medium bg-slate-950/60 px-4 py-1.5 rounded-full border border-slate-800">
          <FiHelpCircle className="text-cyan-400" />
          <span>Host Hotkeys:</span>
          <span><Kbd>Space</Kbd> Next</span>
          <span><Kbd>R</Kbd> Reveal</span>
          <span><Kbd>Esc</Kbd> Exit</span>
        </div>

        {/* Right: Digital Timer */}
        <div className="flex items-center gap-3 bg-slate-950 px-5 py-2 rounded-xl border border-slate-800 shadow-inner">
          <FiClock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`} />
          <span className={`font-mono text-2xl font-black tracking-widest ${
            timeLeft <= 5 ? 'text-rose-400 animate-pulse text-glow-pink' : 'text-slate-100 text-glow-blue'
          }`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-1">
        <ProgressBar
          progress={progressPercent}
          color="dynamic"
          size="sm"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400 px-1">
          <span>Overall Stage Progress: {Math.round(overallQuestionPercent)}%</span>
          <span>{timeLeft}s remaining</span>
        </div>
      </div>
    </header>
  );
};
