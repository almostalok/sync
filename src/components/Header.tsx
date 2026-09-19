'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  Building2, 
  Play, 
  RotateCcw, 
  ChevronDown, 
  AlertTriangle, 
  Layers
} from 'lucide-react';
import { SiteSyncLogo } from '../../packages/design-system/components/SiteSyncLogo';

export const Header: React.FC<{ onOpenDemoModal: () => void }> = ({ onOpenDemoModal }) => {
  const { state, setActiveView, resetDemoScenario } = useProject();
  const [isResetting, setIsResetting] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const pendingReviewCount = state.events.filter(
    e => e.match?.decision === 'PENDING_REVIEW' || (e.match?.confidence && e.match.confidence >= 0.70 && e.match.confidence < 0.90 && e.match.decision !== 'ACCEPTED')
  ).length;

  const handleReset = () => {
    setIsResetting(true);
    resetDemoScenario();
    setTimeout(() => setIsResetting(false), 400);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-[2px] border-slate-900 bg-white px-4 lg:px-6 py-2.5 font-mono shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Project Selector */}
        <div className="flex items-center gap-4">
          {/* SiteSync Cool Minimalist Logo */}
          <div 
            className="cursor-pointer group" 
            onClick={() => setActiveView('dashboard')}
          >
            <SiteSyncLogo size="md" showSubtitle={true} />
          </div>

          <div className="h-7 w-[1.5px] bg-slate-900 hidden sm:block" />

          {/* Prominent Project Selector */}
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 hover:bg-white text-left transition shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-900 shrink-0" />
              <div className="max-w-[200px] lg:max-w-xs truncate font-mono">
                <div className="text-xs font-bold text-slate-950 uppercase truncate leading-tight">
                  {state.project.name}
                </div>
                <div className="text-[10px] text-slate-600 font-mono leading-tight">
                  [{state.project.id}] · DULIAJAN_GT
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {projectDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-84 bg-white border-[1.5px] border-slate-900 rounded-none shadow-[3px_3px_0px_#0f172a] z-50 py-1 text-xs font-mono">
                <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-900 bg-stone-100">
                  {'// SELECT_ACTIVE_PROJECT'}
                </div>
                <div className="px-3 py-2 bg-amber-50/80 border-l-[3px] border-slate-900 cursor-pointer">
                  <div className="font-bold text-slate-950 uppercase">{state.project.name}</div>
                  <div className="text-[10px] text-slate-600 font-mono">[CSE-2026-001] · OIL INDIA LTD · ACTIVE</div>
                </div>
                <div className="px-3 py-2 hover:bg-stone-50 text-slate-700 cursor-pointer border-t border-slate-200">
                  <div className="font-medium text-slate-900 uppercase">Numaligarh Refinery Phase 2 Piping</div>
                  <div className="text-[10px] text-slate-500 font-mono">[NRP-2025-084] · ARCHIVED_BASELINE</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Middle: Operational Ticker */}
        <div className="hidden xl:flex items-center gap-3 border-[1.5px] border-slate-900 bg-stone-50 px-3.5 py-1 text-xs text-slate-900 shadow-[2px_2px_0px_#0f172a]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 uppercase text-[10px] font-bold">PROGRESS:</span>
            <strong className="text-slate-950 font-mono font-bold">{state.project.actualProgress}%</strong>
            <span className="text-slate-500 text-[10px] font-mono">[PLAN: {state.project.plannedProgress}%]</span>
          </div>

          <span className="text-slate-400 font-bold">|</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600 uppercase text-[10px] font-bold">VARIANCE:</span>
            <strong className="text-rose-700 font-mono font-bold bg-rose-100 px-1 border border-rose-300">
              +{state.scheduleMetrics.overallScheduleVarianceDays}D
            </strong>
          </div>

          <span className="text-slate-400 font-bold">|</span>

          <button
            onClick={() => setActiveView('review')}
            className="flex items-center gap-1.5 text-slate-900 font-bold hover:bg-amber-100 px-1 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-[10px] uppercase font-bold">REVIEW_QUEUE:</span>
            <span className="bg-amber-300 text-black px-1.5 py-0.2 border border-slate-900 font-mono font-black text-[10px]">
              [{pendingReviewCount}]
            </span>
          </button>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Demo Script Walkthrough */}
          <button
            onClick={onOpenDemoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            title="Open Presentation Script Walkthrough"
          >
            <Play className="w-3 h-3 fill-white" />
            <span className="hidden sm:inline">[DEMO_RUN]</span>
          </button>

          {/* Reset Baseline */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="p-1.5 rounded-none border-[1.5px] border-slate-900 bg-white hover:bg-stone-100 text-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
            title="Reset Project State to Baseline"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-rose-600' : ''}`} />
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l-[1.5px] border-slate-900">
            <div className="w-7 h-7 rounded-none border border-slate-900 bg-stone-200 text-slate-900 flex items-center justify-center font-black text-xs font-mono">
              PB
            </div>
            <div className="hidden md:block text-left text-xs font-mono leading-tight">
              <div className="font-bold text-slate-950 uppercase">P. Borah</div>
              <div className="text-[10px] text-slate-600 font-bold uppercase">PLNR_DIR</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
