import React from 'react';
import { motion } from 'framer-motion';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'purple' | 'amber' | 'dynamic';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  const getGradient = () => {
    if (color === 'purple') return 'from-purple-600 to-indigo-500 shadow-[0_0_15px_rgba(157,78,221,0.5)]';
    if (color === 'amber') return 'from-amber-500 to-rose-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    if (color === 'dynamic') {
      if (clampedProgress > 50) return 'from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(0,240,255,0.5)]';
      if (clampedProgress > 25) return 'from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      return 'from-rose-500 to-red-600 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse';
    }
    return 'from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(0,240,255,0.5)]';
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-300">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-mono">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-900/80 border border-slate-800 rounded-full overflow-hidden p-0.5 ${heightClasses[size]}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-300`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ ease: 'easeOut', duration: 0.4 }}
        />
      </div>
    </div>
  );
};
