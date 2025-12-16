import React from 'react';

export const Logo: React.FC<{ size?: number; className?: string }> = ({ size = 64, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#064E3B" />
          <stop offset="1" stopColor="#022C22" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="20" y1="40" x2="60" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ADE80" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
      </defs>
      
      {/* Shield Base */}
      <path 
        d="M50 98C50 98 90 82 90 30V12L50 2L10 12V30C10 82 50 98 50 98Z" 
        fill="url(#shieldGrad)" 
        stroke="#FCD34D" 
        strokeWidth="2"
      />
      
      {/* Shine Effect */}
      <path 
        d="M50 98C50 98 88 82 88 30V13L50 4V98Z" 
        fill="white" 
        fillOpacity="0.1" 
      />

      {/* Wifi Signal (Blue/Cyan) */}
      <path d="M35 50C35 50 42 42 58 42C74 42 81 50 81 50" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
      <path d="M40 60C40 60 45 54 58 54C71 54 76 60 76 60" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.8"/>
      <path d="M48 70C48 70 52 66 58 66C64 66 68 70 68 70" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
      <circle cx="58" cy="80" r="4" fill="#38BDF8" />

      {/* Leaf (Green) - wrapping bottom left */}
      <path 
        d="M10 50C10 50 8 70 25 85C25 85 45 92 50 98C50 98 48 80 35 65C35 65 25 50 10 50Z" 
        fill="url(#leafGrad)" 
        stroke="white" 
        strokeWidth="1"
      />
      <path d="M15 55C15 55 25 65 35 65" stroke="#064E3B" strokeWidth="1" strokeOpacity="0.3" />
    </svg>
  );
};