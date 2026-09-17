'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useProject } from '@/context/ProjectContext';
import { 
  Play, 
  RotateCcw, 
  FastForward, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  Activity as ActivityIcon, 
  HelpCircle, 
  Clock, 
  Sparkles, 
  Mic, 
  Sliders, 
  ExternalLink,
  ChevronRight,
  BarChart3,
  Cpu,
  Search,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { queryGroundedCopilot } from '@/lib/ai/copilotEngine';
import { traceDownstreamCascade } from '@/lib/schedule/graphEngine';

type DemoState = 
  | 'DEMO_RESET'
  | 'SCHEDULE_READY'
  | 'REPORT_SUBMITTED'
  | 'REPORT_PROCESSED'
  | 'MATCH_READY'
  | 'REVIEW_READY'
  | 'MATCH_ACCEPTED'
  | 'PROGRESS_UPDATED'
  | 'INTELLIGENCE_REFRESHED'
  | 'COPILOT_READY';

interface LogEntry {
  id: string;
  time: string;
  event: string;
  detail: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'EXECUTION';
}

export default function DemoPage() {
  const { state, resetDemoScenario } = useProject();

  const [demoState, setDemoState] = useState<DemoState>('SCHEDULE_READY');
  const [activeTab, setActiveTab] = useState<'interactive' | 'trace' | 'copilot' | 'historical'>('interactive');
  const [copilotQuestion, setCopilotQuestion] = useState<'supported' | 'unsupported'>('supported');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotAnswer, setCopilotAnswer] = useState<any>(null);
  const [isVoiceFallbackActive, setIsVoiceFallbackActive] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([
    {
      id: 'log-0',
      time: '00:00:01',
      event: 'SYSTEM_INITIALIZED',
      detail: 'SiteSync Engine active. Canonical project seeded with DEMO_SEED=42.',
      type: 'INFO',
    },
    {
      id: 'log-1',
      time: '00:00:02',
      event: 'BASELINE_SCHEDULE_LOADED',
      detail: 'Indexed 1,000 WBS activities and 5,000+ dependencies.',
      type: 'INFO',
    },
  ]);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionLogs]);

  const addLog = (event: string, detail: string, type: LogEntry['type'] = 'INFO') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    setExecutionLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        time: timeStr,
        event,
        detail,
        type,
      }
    ]);
  };

  const handleReset = () => {
    resetDemoScenario();
    setDemoState('SCHEDULE_READY');
    setCopilotAnswer(null);
    setExecutionLogs([
      {
        id: `log-${Date.now()}`,
        time: new Date().toTimeString().split(' ')[0],
        event: 'DEMO_RESET_EXECUTED',
        detail: 'Restored deterministic Golden Project (Compressor Station Expansion, DEMO_SEED=42). Target MECH-L5-042 reset to NOT_STARTED.',
        type: 'WARNING',
      }
    ]);
  };

  const executeNextStep = () => {
    switch (demoState) {
      case 'DEMO_RESET':
      case 'SCHEDULE_READY':
        setDemoState('REPORT_SUBMITTED');
        addLog('FIELD_REPORT_INGESTED', 'DPR-2026-09-16.pdf received from Civil/Mechanical supervisor (1,482 chars).', 'INFO');
        break;

      case 'REPORT_SUBMITTED':
        setDemoState('REPORT_PROCESSED');
        addLog('AI_EXTRACTION_COMPLETED', 'Extracted event: "Foundation grouting for compressor C-201 completed today at the north equipment area." (Status: COMPLETED).', 'SUCCESS');
        break;

      case 'REPORT_PROCESSED':
        setDemoState('MATCH_READY');
        addLog('HYBRID_MATCH_CALCULATED', 'Evaluated 7 independent signals. Top candidate MECH-L5-042 (Score: 94%, Margin: 0.26 over CIV-L5-117).', 'SUCCESS');
        break;

      case 'MATCH_READY':
        setDemoState('REVIEW_READY');
        addLog('REVIEW_ITEM_ENQUEUED', 'rev-case-golden-042 routed to Planner Workstation. Dual-column evidence prepared.', 'INFO');
        break;

      case 'REVIEW_READY':
        setDemoState('MATCH_ACCEPTED');
        addLog('MATCH_ACCEPTED_BY_PLANNER', 'Planner lead approved linkage to MECH-L5-042. Decision recorded in immutable audit ledger.', 'SUCCESS');
        break;

      case 'MATCH_ACCEPTED':
        setDemoState('PROGRESS_UPDATED');
        addLog('ACTUAL_PROGRESS_MUTATED', 'Domain service updated MECH-L5-042: Status=COMPLETED, Actual Finish=16-Sep-2026, Variance=0 days.', 'EXECUTION');
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        break;

      case 'PROGRESS_UPDATED':
        setDemoState('INTELLIGENCE_REFRESHED');
        addLog('DOWNSTREAM_CASCADE_EVALUATED', 'Triggered CPM graph cascade. Predecessor satisfied for MEC-SKD-201 (Compressor Skid Placement). Risk radar refreshed.', 'INFO');
        break;

      case 'INTELLIGENCE_REFRESHED':
        setDemoState('COPILOT_READY');
        addLog('COPILOT_GROUNDED_READY', 'Knowledge graph and RAG indices synchronized with newly verified state. Ready for grounded Q&A.', 'SUCCESS');
        break;

      case 'COPILOT_READY':
        handleReset();
        break;
    }
  };

  const handleAskCopilot = (type: 'supported' | 'unsupported') => {
    setCopilotQuestion(type);
    setCopilotLoading(true);

    setTimeout(() => {
      const q = type === 'supported' 
        ? 'Why is the compressor package currently at risk?'
        : 'What did the supervisor say about a turbine failure last month?';

      const resp = queryGroundedCopilot(q, {
        project: state.project,
        activities: state.activities,
        dependencies: state.dependencies,
        reports: state.fieldReports,
        events: state.events,
        risks: state.risks,
        historicalOutcomes: state.historicalOutcomes,
        reviewQueueCount: 3,
      });

      setCopilotAnswer(resp);
      setCopilotLoading(false);

      if (type === 'supported') {
        addLog('COPILOT_QUERY_ANSWERED', 'Grounded response generated with citations to DPR-2026-09-16 and schedule graph.', 'INFO');
      } else {
        addLog('COPILOT_GROUNDING_REFUSAL', 'Refused unsupported query: Insufficient evidence in project records. Zero hallucinated data.', 'WARNING');
      }
    }, 400);
  };

  const getStepNumber = (s: DemoState): number => {
    const map: Record<DemoState, number> = {
      DEMO_RESET: 1,
      SCHEDULE_READY: 1,
      REPORT_SUBMITTED: 2,
      REPORT_PROCESSED: 3,
      MATCH_READY: 4,
      REVIEW_READY: 5,
      MATCH_ACCEPTED: 6,
      PROGRESS_UPDATED: 7,
      INTELLIGENCE_REFRESHED: 8,
      COPILOT_READY: 9,
    };
    return map[s];
  };

  const cascade = traceDownstreamCascade('MECH-L5-042', state.activities, state.dependencies);

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Demo Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            SS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">SiteSync — SIH Live Demonstration Studio</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PROD-READY STAGE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Golden Demo Pipeline: <span className="text-cyan-300 font-medium">Compressor Station Expansion</span> • <span className="text-amber-400/90 font-mono text-[11px]">SYNTHETIC DATASET (DEMO_SEED=42)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVoiceFallbackActive(!isVoiceFallbackActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isVoiceFallbackActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title="Toggle synthetic recorded voice stream fallback for presentation stability"
          >
            <Mic className="w-3.5 h-3.5" />
            {isVoiceFallbackActive ? 'Voice Fallback: ACTIVE' : 'Voice Mode: LIVE'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Reset Golden Demo
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-lg shadow-cyan-900/30 transition-all"
          >
            Open Command Center
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* State Machine Stepper */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">SIH Core Pipeline Sequence</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">Step {getStepNumber(demoState)} of 9</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={executeNextStep}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-900/40 transition-all"
              >
                {demoState === 'COPILOT_READY' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" /> Restart Demonstration
                  </>
                ) : (
                  <>
                    <FastForward className="w-3.5 h-3.5" /> Advance Pipeline Step
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stepper Dots */}
          <div className="grid grid-cols-9 gap-2">
            {[
              { num: 1, label: 'Schedule' },
              { num: 2, label: 'DPR Ingest' },
              { num: 3, label: 'Extraction' },
              { num: 4, label: '7-Signal Match' },
              { num: 5, label: 'Human Review' },
              { num: 6, label: 'State Mutation' },
              { num: 7, label: 'Schedule Variance' },
              { num: 8, label: 'Forecast' },
              { num: 9, label: 'Grounded Copilot' },
            ].map((step) => {
              const activeNum = getStepNumber(demoState);
              const isPast = step.num < activeNum;
              const isCurrent = step.num === activeNum;

              return (
                <div key={step.num} className="flex flex-col items-center gap-1.5 text-center">
                  <div
                    className={`w-full h-2 rounded-full transition-all ${
                      isPast
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : isCurrent
                        ? 'bg-cyan-400 animate-pulse ring-2 ring-cyan-400/40'
                        : 'bg-slate-800'
                    }`}
                  />
                  <span className={`text-[11px] font-medium truncate w-full ${isCurrent ? 'text-cyan-300 font-bold' : isPast ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {step.num}. {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Scene Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Transformation Canvas (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex border-b border-slate-800 space-x-6 text-sm">
              <button
                onClick={() => setActiveTab('interactive')}
                className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'interactive'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" /> Live Transformation Stage
              </button>

              <button
                onClick={() => setActiveTab('trace')}
                className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'trace'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ActivityIcon className="w-4 h-4" /> Event Trace & Architecture
              </button>

              <button
                onClick={() => setActiveTab('copilot')}
                className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'copilot'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Grounded Copilot Q&A
              </button>

              <button
                onClick={() => setActiveTab('historical')}
                className={`pb-2.5 font-medium flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'historical'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" /> 24-Sample Historical Memory
              </button>
            </div>

            {/* TAB 1: INTERACTIVE TRANSFORMATION STAGE */}
            {activeTab === 'interactive' && (
              <div className="space-y-6">
                {/* 1. Planned vs Reality Comparison Card */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Golden Scenario Subject</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      WBS 1.1.2 Mechanical Erection
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Planned Schedule Card */}
                    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Planned Schedule Baseline</span>
                        <span className="font-mono text-cyan-400 font-bold">MECH-L5-042</span>
                      </div>
                      <div className="text-base font-semibold text-slate-100">
                        Compressor Foundation Grouting
                      </div>
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Discipline: <span className="text-slate-200">MECHANICAL</span></div>
                        <div>Planned Start: <span className="text-slate-200">2026-09-14</span> • Finish: <span className="text-slate-200">2026-09-16</span></div>
                        <div>Critical Path: <span className="text-rose-400 font-bold">YES (0 Days Float)</span></div>
                      </div>
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Initial Baseline State:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">NOT_STARTED</span>
                      </div>
                    </div>

                    {/* Field Reality Card */}
                    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Supervisor Field Input</span>
                        <span className="text-amber-400 font-mono text-[11px]">DPR-2026-09-16 (PDF)</span>
                      </div>
                      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs italic text-slate-300 font-serif leading-relaxed">
                        “Foundation grouting for compressor C-201 completed today at the north equipment area.”
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-400/90">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Crucial Fact: Zero activity ID mentioned in raw report</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Language: Non-standard site terminology, passive voice, informal phrasing.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Pipeline Transformation Progression */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Transformation Pipeline Output</span>
                    <span className="text-xs text-slate-400 font-mono">Status: {demoState}</span>
                  </div>

                  {/* Stage 1: AI Extraction */}
                  <div className={`p-4 rounded-xl border transition-all ${getStepNumber(demoState) >= 3 ? 'bg-slate-900/80 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60 opacity-60'}`}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="flex items-center gap-2 text-cyan-400">
                        <Cpu className="w-4 h-4" /> 1. AI Canonical Event Extraction
                      </span>
                      {getStepNumber(demoState) >= 3 && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Extracted</span>}
                    </div>
                    {getStepNumber(demoState) >= 3 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase">Discipline</span>
                          <span className="font-semibold text-slate-200">MECHANICAL</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase">Activity Type</span>
                          <span className="font-semibold text-slate-200">Foundation Grouting</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase">Equipment</span>
                          <span className="font-semibold text-slate-200">Compressor C-201</span>
                        </div>
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase">Reported Status</span>
                          <span className="font-semibold text-emerald-400">COMPLETED (100%)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Waiting for extraction trigger...</div>
                    )}
                  </div>

                  {/* Stage 2: 7-Signal Matching & Confidence */}
                  <div className={`p-4 rounded-xl border transition-all ${getStepNumber(demoState) >= 4 ? 'bg-slate-900/80 border-cyan-500/40' : 'bg-slate-950/40 border-slate-800/60 opacity-60'}`}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="flex items-center gap-2 text-cyan-400">
                        <TrendingUp className="w-4 h-4" /> 2. 7-Signal Hybrid Activity Matching
                      </span>
                      {getStepNumber(demoState) >= 4 && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Evaluated</span>}
                    </div>

                    {getStepNumber(demoState) >= 4 ? (
                      <div className="space-y-2.5">
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-cyan-500/40 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-cyan-400">#1 MECH-L5-042</span>
                              <span className="text-xs text-slate-200 font-medium">Compressor Foundation Grouting</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">RECOMMENDED</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Semantic 96% • Discipline 100% • Location 100% • WBS 90% • Temporal 90% • Entity 92%
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-bold text-emerald-400">0.94</div>
                            <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                          </div>
                        </div>

                        {/* Alternative candidates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                            <div>
                              <div className="font-medium text-slate-300">#2 CIV-L5-117 (Concrete Repair)</div>
                              <span className="text-[10px] text-slate-500">Discipline conflict: CIVIL</span>
                            </div>
                            <span className="font-mono text-slate-400 font-bold">0.68</span>
                          </div>

                          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                            <div>
                              <div className="font-medium text-slate-300">#3 MECH-L6-091 (Base Plate Prep)</div>
                              <span className="text-[10px] text-slate-500">Partial work scope</span>
                            </div>
                            <span className="font-mono text-slate-400 font-bold">0.53</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Waiting for hybrid matching evaluation...</div>
                    )}
                  </div>

                  {/* Stage 3: Human Verification & Progress Mutation */}
                  <div className={`p-4 rounded-xl border transition-all ${getStepNumber(demoState) >= 6 ? 'bg-slate-900/80 border-emerald-500/40' : 'bg-slate-950/40 border-slate-800/60 opacity-60'}`}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span className="flex items-center gap-2 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" /> 3. Human Verification & Authoritative State Mutation
                      </span>
                      {getStepNumber(demoState) >= 6 && <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Mutated</span>}
                    </div>

                    {getStepNumber(demoState) >= 6 ? (
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Authoritative State Transition on <strong className="text-slate-200">MECH-L5-042</strong>:</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">VERIFIED & PERSISTED</span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Previous Status</span>
                            <span className="text-slate-400 line-through">NOT_STARTED</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/40">
                            <span className="text-emerald-400 text-[10px] block">Verified Status</span>
                            <span className="text-emerald-300 font-bold">COMPLETED</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Actual Finish</span>
                            <span className="text-slate-200 font-semibold">16 Sep 2026</span>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-500 text-[10px] block">Schedule Variance</span>
                            <span className="text-emerald-400 font-bold">0 Days (On Time)</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                          <span>Verified by: <strong className="text-slate-300">planner-lead-01</strong></span>
                          <span>Evidence: <strong className="text-slate-300">DPR-2026-09-16 (Page 2)</strong></span>
                          <span>Audit ID: <strong className="font-mono text-cyan-400">aud-tx-88192</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 italic">Awaiting planner verification click...</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ARCHITECTURE & EVENT TRACE */}
            {activeTab === 'trace' && (
              <div className="space-y-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">End-to-End Correlation Trace</h3>
                      <p className="text-xs text-slate-400">Traceable audit path from raw field ingestion to downstream intelligence</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      corr-id: sih26122-c201-grout
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { step: 'INGESTION', desc: 'DPR-2026-09-16.pdf SHA256 checksum calculated & quarantined', time: '14:32:11' },
                      { step: 'CANONICAL_EVENT', desc: 'Normalized into ExtractedEvent #evt-case-golden-042', time: '14:32:12' },
                      { step: 'HYBRID_MATCH', desc: '7-signal ranker matched MECH-L5-042 (Score: 0.94)', time: '14:32:13' },
                      { step: 'REVIEW_GATE', desc: 'Evaluated safety policy. Enqueued for planner confirmation', time: '14:32:13' },
                      { step: 'HUMAN_VERIFICATION', desc: 'Planner accepted match with DPR page 2 citation', time: '14:32:38' },
                      { step: 'SCHEDULE_MUTATION', desc: 'ScheduleSyncService set MECH-L5-042 status=COMPLETED', time: '14:32:39' },
                      { step: 'DEPENDENCY_CASCADE', desc: 'CPM forward pass propagated float release to MEC-SKD-201', time: '14:32:40' },
                      { step: 'PREDICTIVE_FORECAST', desc: 'Model completion-xgb-v1.4 updated completion envelope', time: '14:32:41' },
                      { step: 'KNOWLEDGE_RAG', desc: 'Project Copilot embedded verified actual progress update', time: '14:32:42' },
                    ].map((t, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 font-bold">{idx + 1}. {t.step}</span>
                          <span className="text-slate-300 font-sans text-xs">{t.desc}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{t.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Downstream Impact Demonstration */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-100">Schedule Dependency Impact Traced</h3>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">PREDECESSOR</span>
                      <span>MECH-L5-042 (Compressor Foundation Grouting) — COMPLETED</span>
                    </div>
                    <div className="pl-6 text-slate-500">↓ (Finish-to-Start + 1 day curing lag)</div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">SUCCESSOR #1</span>
                      <span>MEC-SKD-201 (Compressor Skid Unloading & Placement) — Planned 10-Oct-2026</span>
                    </div>
                    <div className="pl-6 text-slate-500">↓ (Finish-to-Start + 1 day lag)</div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">SUCCESSOR #2</span>
                      <span>MEC-ALN-202 (Shaft Precision Alignment) — Planned 16-Oct-2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GROUNDED COPILOT Q&A */}
            {activeTab === 'copilot' && (
              <div className="space-y-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">Grounded Project Copilot Demonstration</h3>
                    <p className="text-xs text-slate-400">Strictly answers with verified project evidence and explicitly refuses unsupported questions</p>
                  </div>

                  {/* Question selector buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAskCopilot('supported')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        copilotQuestion === 'supported' && copilotAnswer
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-cyan-400 mb-1">Scenario A: Grounded Evidence Query</div>
                      <div className="text-xs font-medium">“Why is the compressor package currently at risk?”</div>
                    </button>

                    <button
                      onClick={() => handleAskCopilot('unsupported')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        copilotQuestion === 'unsupported' && copilotAnswer
                          ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-rose-400 mb-1">Scenario B: Unsupported Refusal Test</div>
                      <div className="text-xs font-medium">“What did the supervisor say about a turbine failure last month?”</div>
                    </button>
                  </div>

                  {/* Copilot Response Display */}
                  {copilotLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                      Retrieving project evidence and validating grounding bounds...
                    </div>
                  ) : copilotAnswer ? (
                    <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                        <span className="text-slate-400">Intent: <strong className="text-cyan-400">{copilotAnswer.intent}</strong></span>
                        <span className="text-slate-400">Confidence: <strong className="text-emerald-400">{(copilotAnswer.confidence * 100).toFixed(0)}%</strong></span>
                      </div>

                      <div className="text-xs leading-relaxed text-slate-200 whitespace-pre-line">
                        {copilotAnswer.answer}
                      </div>

                      {copilotAnswer.evidence?.length > 0 && (
                        <div className="pt-3 border-t border-slate-800 space-y-1.5">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Grounded Evidence Citations:</span>
                          {copilotAnswer.evidence.map((ev: any, idx: number) => (
                            <div key={idx} className="p-2 rounded bg-slate-950 text-xs border border-slate-800 flex items-center justify-between">
                              <span className="text-cyan-300 font-medium">{ev.title}</span>
                              <span className="text-[11px] text-slate-400">{ev.sourceReport || ev.type}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Click either question above to test grounded answer generation vs strict hallucination refusal.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: HISTORICAL INTELLIGENCE */}
            {activeTab === 'historical' && (
              <div className="space-y-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">Institutional Memory Benchmark</h3>
                      <p className="text-xs text-slate-400">Completed activity sample data from past operational assets</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30">
                      Sample Size: 24 Completed Activities
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block">Median Duration</span>
                      <span className="text-xl font-bold text-cyan-400">3.0 Days</span>
                      <span className="text-[10px] text-slate-500 block">Historical benchmark</span>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block">P25 Duration</span>
                      <span className="text-xl font-bold text-emerald-400">3.0 Days</span>
                      <span className="text-[10px] text-slate-500 block">Optimistic quartile</span>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                      <span className="text-xs text-slate-400 block">P75 Duration</span>
                      <span className="text-xl font-bold text-amber-400">4.0 Days</span>
                      <span className="text-[10px] text-slate-500 block">Conservative quartile</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                    <div className="text-slate-300 font-semibold">Institutional Lesson Learned:</div>
                    <p className="text-slate-400 leading-relaxed italic">
                      “Pre-qualify epoxy grout batches 14 days ahead of scheduled pour. Ensure concrete foundation surface is dry-cured (&gt;48h dry) before headbox pouring to maintain 100% bearing contact area.”
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1">
                      Historical Source: <strong>Bhogpara Gas Compression Plant (OIL-BOG-2024)</strong> • Mechanical Inspection Records
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Observability & Event Log */}
          <div className="space-y-6">
            {/* Live Metrics Header */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live Operational Metrics</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Schedule Activities</span>
                  <span className="text-base font-bold text-slate-100">{state.activities.length}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Dependencies</span>
                  <span className="text-base font-bold text-slate-100">{state.dependencies.length}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Field Reports</span>
                  <span className="text-base font-bold text-slate-100">{state.fieldReports.length}</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Risk Signals</span>
                  <span className="text-base font-bold text-amber-400">{state.risks.length}</span>
                </div>
              </div>
            </div>

            {/* Observability Log Window (Section 51) */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Demo Execution Log</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Live Async Stream</span>
              </div>

              <div className="h-96 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
                {executionLogs.map((log) => {
                  const badgeColor = 
                    log.type === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                    log.type === 'EXECUTION' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                    log.type === 'WARNING' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                    'text-slate-400 bg-slate-800/60 border-slate-700/60';

                  return (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.2 rounded border font-semibold ${badgeColor}`}>
                          {log.event}
                        </span>
                        <span className="text-slate-500">{log.time}</span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs leading-relaxed">
                        {log.detail}
                      </p>
                    </div>
                  );
                })}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
