'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  FileText, 
  CalendarRange, 
  Cpu, 
  CheckSquare, 
  Sparkles, 
  Mic, 
  BookOpen, 
  AlertOctagon,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoStep {
  step: number;
  title: string;
  subtitle: string;
  targetView: 'dashboard' | 'gantt' | 'reports' | 'review' | 'evidence' | 'risks' | 'copilot' | 'history' | 'voice' | 'benchmark';
  script: string;
  details: string[];
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: '1. Opening: Planning vs Reality',
    subtitle: 'Connecting Planned Schedule with Field Reality',
    targetView: 'dashboard',
    script: '"The project schedule knows what was planned. The field knows what actually happened. SiteSync connects those two worlds without silently corrupting project schedules."',
    details: [
      'Project: Compressor Station Expansion (Oil India Limited)',
      'Baseline schedule: 100+ L5/L6 activities across Civil, Piping, Mechanical, Electrical, Instrumentation, HSE',
      'Unified Command Center displays live planned vs actual progress and schedule slippage in days.'
    ]
  },
  {
    step: 2,
    title: '2. Planned Schedule Inspection',
    subtitle: 'Inspecting CIV-EXC-042 Baseline',
    targetView: 'gantt',
    script: '"Here is the planned schedule baseline. Activity CIV-EXC-042 (Compressor Foundation Excavation) is planned from 10-Sep to 18-Sep on the Critical Path."',
    details: [
      'Interactive Gantt chart showing planned baseline vs verified actual execution',
      'Predecessor / Successor graph linking to PCC (CIV-PCC-043) and Reinforcement (CIV-REB-044)',
      'Critical path markers indicate bottleneck milestones.'
    ]
  },
  {
    step: 3,
    title: '3. Ingest Messy Field Report',
    subtitle: 'Unstructured DPR-2026-09-16.pdf',
    targetView: 'reports',
    script: '"Site supervisors submit messy reports: \'Comp foundation excavation is approx 80% complete. North side completed today. PCC preparation expected tomorrow.\'"',
    details: [
      'Supports PDFs, Excel spreadsheets, site diaries, and voice memos',
      'Normalizer maps domain jargon: comp → compressor, fdn → foundation, exctn → excavation, approx → approximately, 80% → 0.80',
      'Extracts granular execution events with exact character offsets.'
    ]
  },
  {
    step: 4,
    title: '4. 7-Signal AI Hybrid Matching',
    subtitle: 'Multi-Signal Semantic & Spatial Alignment',
    targetView: 'review',
    script: '"SiteSync evaluates 7 independent signals: Semantic (40%), Discipline (15%), Location (10%), WBS (10%), Temporal (10%), Dependency (10%), Entity (5%). Top match CIV-EXC-042 scores 94% confidence."',
    details: [
      'Confidence calibration prevents forced linkages',
      'High confidence (≥90%) auto-links with evidence provenance',
      'Medium confidence (70-89%) enters Human Review Queue to prevent schedule corruption.'
    ]
  },
  {
    step: 5,
    title: '5. Evidence Provenance Deep Dive',
    subtitle: 'Why Did SiteSync Match This Activity?',
    targetView: 'evidence',
    script: '"SiteSync is 100% explainable. It exposes source report, page 1, character offsets [104..154], and exact mathematical breakdown of all 7 signals."',
    details: [
      'Preserves original verbatim field text without LLM hallucinations',
      'Audit log tracks who, what, when, before, and after states',
      'Compliance with SIH26122 security and audit requirements.'
    ]
  },
  {
    step: 6,
    title: '6. Human Verification & Review',
    subtitle: 'Planner Verification Workstation',
    targetView: 'review',
    script: '"SiteSync does not pretend uncertainty is certainty. Medium-confidence matches are sent to the planner. With 1-click verification, the planner accepts the match and updates actual progress."',
    details: [
      'Dual-column split layout: Source Evidence on left, AI Candidates on right',
      'Planner can Accept, Reject, Re-assign Alternative Candidate, or Mark Unmatched',
      '1-click verification writes verified progress and updates Gantt reactive state.'
    ]
  },
  {
    step: 7,
    title: '7. Schedule Slippage & Downstream Cascades',
    subtitle: 'CPM Delay Propagation',
    targetView: 'risks',
    script: '"When Compressor Foundation Excavation lags by +4 days, SiteSync traces the critical path cascade to PCC, Reinforcement, Formwork, and Heavy Concrete."',
    details: [
      'Live CPM forward/backward pass recalculates variance in days',
      'Downstream impact simulator projects new milestone dates',
      'Stale activity detector flags tasks with zero progress past start date.'
    ]
  },
  {
    step: 8,
    title: '8. Grounded AI Copilot',
    subtitle: 'Evidence-First Conversational Intelligence',
    targetView: 'copilot',
    script: '"Ask Copilot: \'Why is the project delayed?\' It synthesizes schedule graph, DPR citations, and variance metrics without inventing facts."',
    details: [
      'Zero hallucination: only cites verified database and DPR evidence',
      'Answers queries on delays, today\'s DPR, review items, and historical lessons',
      'Includes clickable citation links and suggested action pills.'
    ]
  },
  {
    step: 9,
    title: '9. Supervisor Voice Reporting',
    subtitle: 'Hands-Free Speech-to-Schedule Ingestion',
    targetView: 'voice',
    script: '"Supervisors in the field simply speak: \'Compressor foundation excavation is eighty-five percent complete.\' SiteSync transcribes, matches, and prompts 1-click confirmation."',
    details: [
      'Speech-to-text pipeline feeds directly into 7-signal hybrid matcher',
      'Displays instant confidence preview on mobile / web interface',
      'Single confirmation submits report into project intelligence stream.'
    ]
  },
  {
    step: 10,
    title: '10. Scientific Benchmark & Closing',
    subtitle: '4-Baseline Comparison & 0 False Auto-Links',
    targetView: 'benchmark',
    script: '"SiteSync achieves high Top-1 accuracy and a 0% False Auto-Link Rate on held-out synthetic test sets. It bridges what was planned and what actually happened."',
    details: [
      'Compares Exact String vs Fuzzy vs Embedding-only vs SiteSync Hybrid',
      'Evaluates performance across 7 difficulty levels (L1 Exact to L7 Unmatched)',
      'Conclusion: SiteSync empowers planners without replacing human judgement.'
    ]
  }
];

export const DemoScriptModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { setActiveView } = useProject();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setActiveView(DEMO_STEPS[nextIdx].targetView);
    } else {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      setActiveView(DEMO_STEPS[prevIdx].targetView);
    }
  };

  const jumpToStep = (idx: number) => {
    setCurrentStepIdx(idx);
    setActiveView(DEMO_STEPS[idx].targetView);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Play className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Smart India Hackathon 2026 • SIH26122</span>
              <h3 className="text-base font-bold text-white">SiteSync Official Demo Walkthrough</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-medium">
            <span>Step {currentStep.step} of {DEMO_STEPS.length}</span>
            <span className="text-cyan-400 font-semibold">{currentStep.subtitle}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {DEMO_STEPS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => jumpToStep(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-all ${
                  idx === currentStepIdx
                    ? 'bg-cyan-400 shadow-sm shadow-cyan-400'
                    : idx < currentStepIdx
                    ? 'bg-emerald-500'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Step Content Box */}
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              {currentStep.targetView.toUpperCase()} VIEW ACTIVE
            </span>
            <h4 className="text-base font-bold text-white pt-1">{currentStep.title}</h4>
          </div>

          {/* Script Quote */}
          <div className="p-3.5 rounded-xl bg-[#080d18] border border-cyan-900/40 text-xs text-cyan-200 leading-relaxed italic space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 block not-italic">Spoken Script</span>
            <p>{currentStep.script}</p>
          </div>

          {/* Key Execution Bullet Points */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Technical Highlights</span>
            <ul className="space-y-1 text-xs text-slate-300">
              {currentStep.details.map((d, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveView(currentStep.targetView);
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Explore Screen Directly
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition transform active:scale-95"
            >
              <span>{currentStepIdx === DEMO_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
