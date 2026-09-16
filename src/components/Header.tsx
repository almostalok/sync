'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  Activity as ActivityIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  FileText, 
  Flame, 
  Mic, 
  Play, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  BarChart3
} from 'lucide-react';

export const Header: React.FC<{ onOpenDemoModal: () => void }> = ({ onOpenDemoModal }) => {
  const { state, setActiveView, resetDemoScenario } = useProject();
  const [isResetting, setIsResetting] = useState(false);

  const pendingReviewCount = state.events.filter(
    e => e.match?.decision === 'PENDING_REVIEW' || (e.match?.confidence && e.match.confidence >= 0.70 && e.match.confidence < 0.90 && e.match.decision !== 'ACCEPTED')
  ).length;

  const highRisksCount = state.risks.filter(r => r.severity === 'HIGH').length;

  const handleReset = () => {
    setIsResetting(true);
    resetDemoScenario();
    setTimeout(() => setIsResetting(false), 500);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0a0f1d]/90 backdrop-blur-md px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Logo & Project Meta */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#0b1120] rounded-[11px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SiteSync
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                SIH26122 • OIL
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Planning → Reality Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 truncate max-w-[280px] sm:max-w-md">
              <span>{state.project.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{state.project.location}</span>
            </p>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div className="hidden xl:flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 rounded-xl px-3 py-1.5">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
            <span className="text-[11px] text-slate-400 font-medium">Actual Progress</span>
            <span className="text-xs font-bold text-emerald-400">{state.project.actualProgress}%</span>
            <span className="text-[10px] text-slate-500">(Plan: {state.project.plannedProgress}%)</span>
          </div>

          <div className="flex items-center gap-2 border-r border-slate-800 pr-3">
            <span className="text-[11px] text-slate-400 font-medium">Schedule Variance</span>
            <span className="text-xs font-bold text-rose-400">+{state.scheduleMetrics.overallScheduleVarianceDays}d</span>
          </div>

          <button 
            onClick={() => setActiveView('review')}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Review Queue:</span>
            <span className="bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.2 rounded-full font-bold text-[11px]">
              {pendingReviewCount}
            </span>
          </button>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Demo Script Walkthrough Button */}
          <button
            onClick={onOpenDemoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/25 transition transform active:scale-95"
            title="Open SIH Acceptance Test Walkthrough"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Demo Script</span>
          </button>

          {/* Voice Memo Trigger */}
          <button
            onClick={() => setActiveView('voice')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-medium transition"
            title="Supervisor Voice Field Report"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Voice</span>
          </button>

          {/* Grounded Copilot */}
          <button
            onClick={() => setActiveView('copilot')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/50 text-purple-200 text-xs font-medium transition"
            title="Evidence-Grounded AI Copilot"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Copilot</span>
          </button>

          {/* Reset Demo State */}
          <button
            onClick={handleReset}
            disabled={isResetting}
            className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-slate-200 transition"
            title="Reset Project to Initial Baseline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <div className="w-6 h-6 rounded-full bg-cyan-900/80 border border-cyan-500/50 flex items-center justify-center text-[10px] font-bold text-cyan-300">
              PB
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-[11px] font-medium text-slate-200 leading-none">P. Borah</div>
              <div className="text-[9px] text-cyan-400 leading-tight">Project Planner</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
