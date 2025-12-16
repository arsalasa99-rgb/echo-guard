import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'alert' | 'success';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'light',
  onClick 
}) => {
  let bgClass = 'bg-white/40 border-white/40 text-slate-800';
  
  if (variant === 'dark') {
    bgClass = 'bg-slate-900/60 border-white/10 text-white';
  } else if (variant === 'alert') {
    bgClass = 'bg-red-500/20 border-red-500/30 text-red-900';
  } else if (variant === 'success') {
    bgClass = 'bg-emerald-500/20 border-emerald-500/30 text-emerald-900';
  }

  return (
    <div 
      onClick={onClick}
      className={`
        backdrop-blur-xl shadow-lg rounded-3xl border
        transition-all duration-300 ease-out
        ${bgClass}
        ${onClick ? 'active:scale-95 cursor-pointer hover:shadow-xl' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};