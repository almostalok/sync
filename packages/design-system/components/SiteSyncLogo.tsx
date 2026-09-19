'use client';

import React from 'react';

interface SiteSyncLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SiteSyncLogo: React.FC<SiteSyncLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none font-mono ${className}`}>
      {/* Precision Technical Glyph */}
      <div
        className={`${iconSizes[size]} relative shrink-0 bg-slate-950 border-[1.5px] border-slate-900 shadow-[2px_2px_0px_#0f172a] flex items-center justify-center overflow-hidden`}
        title="SiteSync // Planning → Reality Engine"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Subtle Grid Reticle */}
          <line x1="0" y1="16" x2="32" y2="16" stroke="#334155" strokeWidth="0.75" strokeDasharray="2 2" />
          <line x1="16" y1="0" x2="16" y2="32" stroke="#334155" strokeWidth="0.75" strokeDasharray="2 2" />

          {/* Top-Left Sync Bracket (Plan / Baseline) */}
          <path
            d="M6 14V6H14"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="square"
          />
          {/* Bottom-Right Sync Bracket (Reality / Field) */}
          <path
            d="M26 18V26H18"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="square"
          />

          {/* Dual Synchronous Pulse Nodes */}
          <rect x="9" y="13" width="5" height="5" fill="#ffffff" />
          <rect x="18" y="14" width="5" height="5" fill="#f59e0b" />

          {/* Core Telemetry Link Line */}
          <path
            d="M14 15.5H18"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeLinecap="square"
          />
        </svg>
      </div>

      {/* Brand Wordmark & Technical Subtitle */}
      <div>
        <div className="flex items-center gap-2 leading-none">
          <span className={`${titleSizes[size]} font-black tracking-wider text-slate-950 uppercase font-mono`}>
            SITESYNC
          </span>
          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-amber-300 text-slate-950 border border-slate-900 shadow-[1px_1px_0px_#000]">
            V2.4
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-600 font-mono tracking-normal block mt-0.5 uppercase">
            {'// PLANNING → REALITY_INTEL'}
          </span>
        )}
      </div>
    </div>
  );
};
