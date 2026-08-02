import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'neon-blue' | 'neon-purple';
  hoverEffect?: boolean;
  glow?: 'blue' | 'purple' | 'none';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'glass',
  hoverEffect = true,
  glow = 'none',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    glass: 'glass-card border-slate-800/80',
    solid: 'bg-slate-900 border border-slate-800',
    'neon-blue': 'glass-card border-cyan-500/40 glow-blue',
    'neon-purple': 'glass-card border-purple-500/40 glow-purple',
  };

  const glowStyles = {
    blue: 'glow-blue',
    purple: 'glow-purple',
    none: '',
  };

  const hoverClasses = hoverEffect ? 'glass-card-hover cursor-pointer' : '';

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-6 relative overflow-hidden ${variantStyles[variant]} ${glowStyles[glow]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-4 border-b border-slate-800/60 pb-3 ${className}`}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between ${className}`}>{children}</div>
);
