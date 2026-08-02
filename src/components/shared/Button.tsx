import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export type ButtonVariant = 'neon-blue' | 'neon-purple' | 'glass' | 'danger' | 'ghost' | 'host-stage';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'neon-blue',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wider rounded-xl transition-all duration-300 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
    xl: 'px-10 py-5 text-xl font-extrabold gap-3.5 tracking-widest uppercase rounded-2xl',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    'neon-blue': 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 glow-blue shadow-[0_0_20px_rgba(0,240,255,0.4)] focus:ring-cyan-400 border border-cyan-300',
    'neon-purple': 'bg-purple-600 text-white hover:bg-purple-500 glow-purple shadow-[0_0_20px_rgba(157,78,221,0.4)] focus:ring-purple-400 border border-purple-400',
    'glass': 'bg-slate-900/60 backdrop-blur-md text-slate-100 border border-slate-700/60 hover:bg-slate-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] focus:ring-cyan-500',
    'danger': 'bg-rose-600 text-white hover:bg-rose-500 glow-pink shadow-[0_0_20px_rgba(244,63,94,0.4)] focus:ring-rose-400 border border-rose-400',
    'ghost': 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800/50 focus:ring-slate-400',
    'host-stage': 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black hover:from-cyan-400 hover:to-purple-500 shadow-[0_0_30px_rgba(0,240,255,0.5)] border-2 border-cyan-200 uppercase tracking-widest scale-105',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon ? (
        <span className="inline-flex shrink-0">{leftIcon}</span>
      ) : null}

      <span>{children}</span>

      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0">{rightIcon}</span>
      )}
    </motion.button>
  );
};
