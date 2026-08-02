import React from 'react';

export const H1: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`text-4xl md:text-6xl font-black tracking-tight text-slate-100 ${className}`}>{children}</h1>
);

export const H2: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`text-2xl md:text-4xl font-extrabold tracking-tight text-slate-100 ${className}`}>{children}</h2>
);

export const H3: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-xl md:text-2xl font-bold text-slate-200 ${className}`}>{children}</h3>
);

export const StageTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`text-5xl md:text-7xl font-black tracking-widest uppercase bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.4)] ${className}`}>
    {children}
  </h1>
);

export const NeonText: React.FC<{ children: React.ReactNode; color?: 'blue' | 'purple' | 'cyan' | 'pink'; className?: string }> = ({
  children,
  color = 'blue',
  className = '',
}) => {
  const glowClasses = {
    blue: 'text-cyan-400 text-glow-blue',
    purple: 'text-purple-400 text-glow-purple',
    cyan: 'text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]',
    pink: 'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]',
  };

  return <span className={`font-extrabold ${glowClasses[color]} ${className}`}>{children}</span>;
};

export const Subtitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-lg md:text-xl text-slate-400 font-medium tracking-wide ${className}`}>{children}</p>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'blue' | 'purple' | 'green' | 'amber'; className?: string }> = ({
  children,
  variant = 'blue',
  className = '',
}) => {
  const variantStyles = {
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase border ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-2 py-1 text-xs font-mono font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-md shadow-inner">
    {children}
  </kbd>
);
