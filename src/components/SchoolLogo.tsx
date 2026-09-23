import React from 'react';

interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  theme?: 'dark' | 'light';
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  theme = 'dark',
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    hero: 'h-24',
  }[size];

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0e2b4d]';
  const subtextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-Fidelity Official Emblem SVG */}
      <div className={`relative shrink-0 ${sizeClasses} aspect-[1.15/1]`}>
        <svg
          viewBox="0 0 220 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <clipPath id="colinaTriangleClipInner">
              <path d="M 98 16 C 105 5, 115 5, 122 16 L 205 166 C 212 178, 204 190, 190 190 L 30 190 C 16 190, 8 178, 15 166 Z" />
            </clipPath>
            <linearGradient id="colinaNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#163963" />
              <stop offset="100%" stopColor="#0a223f" />
            </linearGradient>
            <linearGradient id="colinaGreenGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2ca024" />
              <stop offset="100%" stopColor="#48c83a" />
            </linearGradient>
          </defs>

          {/* Base shape with clip */}
          <g clipPath="url(#colinaTriangleClipInner)">
            {/* Right/Top Navy Region */}
            <rect x="0" y="0" width="220" height="200" fill="url(#colinaNavyGrad)" />

            {/* Left Lush Green Region */}
            <path
              d="M 0 200 L 0 85 C 32 75, 68 100, 102 136 C 132 168, 142 188, 148 200 Z"
              fill="url(#colinaGreenGrad)"
            />

            {/* Stylized White Human Figure / Runner in center */}
            {/* Circular Head */}
            <circle cx="114" cy="76" r="14" fill="#FFFFFF" />

            {/* Curved White Arm Sweeping Outwards */}
            <path
              d="M 64 78 C 88 86, 114 110, 128 148 C 120 136, 100 112, 70 98 Z"
              fill="#FFFFFF"
            />

            {/* Dynamic White Arched Body / Crossed Legs Arc */}
            <path
              d="M 42 190 C 72 165, 106 120, 134 78 C 140 92, 144 126, 150 190 C 140 156, 132 132, 120 118 C 98 145, 68 178, 42 190 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Crisp border stroke */}
          <path
            d="M 98 16 C 105 5, 115 5, 122 16 L 205 166 C 212 178, 204 190, 190 190 L 30 190 C 16 190, 8 178, 15 166 Z"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none text-left">
          <span className={`text-[10px] md:text-xs font-semibold tracking-wider ${subtextColor} uppercase font-sans`}>
            Colegio Campestre
          </span>
          <div className={`flex items-baseline text-base md:text-xl font-black tracking-tight ${textColor} font-sans`}>
            <span>La Col</span>
            <span className="relative inline-flex flex-col items-center">
              {/* Vibrant green dot of the 'i' */}
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#38b438] absolute -top-1 md:-top-1.5 ring-2 ring-emerald-500/30 animate-pulse"></span>
              <span className="mt-1">ı</span>
            </span>
            <span>na</span>
          </div>
        </div>
      )}
    </div>
  );
};
