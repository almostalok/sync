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
  Mic, 
  BookOpen, 
  AlertOctagon,
  X
} from 'lucide-react';

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
      'Interactive WBS hierarchy from L1 Project level down to L5/L6 Task level',
      'Shows Critical Path flags, predecessor/successor dependencies, and baseline dates',
      'Read-only baseline: AI can never silently modify schedule dates without planner review.'
    ]
  },
  {
    step: 3,
    title: '3. Unstructured Daily Progress Report',
    subtitle: 'Ingesting DPR-2026-0916-034',
    targetView: 'reports',
    script: '"Now the field submits Daily Progress Report DPR-034. It contains free-text descriptions, Hindi/Hinglish phrasing, vendor delays, and safety observations."',
    details: [
      'Multi-format ingestion: PDF, Word, Excel, scanned image documents, audio recordings',
      'Preserves original verbatim text with exact character and page locator offsets',
      'Zero hallucination: only extracted statements with unambiguous source text are processed.'
    ]
  },
  {
    step: 4,
    title: '4. AI Event Extraction & Normalization',
    subtitle: 'Extracting Execution Events',
    targetView: 'reports',
    script: '"SiteSync extracts concrete events from the report: 45 cubic meters excavated, rain stoppage for 3 hours, and steel reinforcement delivery delayed by 1 day."',
    details: [
      'Resolves ambiguous terminology, site slang, and Hinglish code-switching',
      'Negation handling: statements like \\"Pour has NOT commenced\\" are recognized and never logged as progress',
      'Quantities, equipment tags, and work locations are structured and normalized.'
    ]
  },
  {
    step: 5,
    title: '5. 7-Signal Hybrid Matcher',
    subtitle: 'Deterministic + Semantic Hybrid Matching',
    targetView: 'review',
    script: '"The extracted field event is matched against the 100+ baseline schedule activities using our 7-signal hybrid matching engine."',
    details: [
      'Signals: Exact Code, Semantic Similarity, WBS Hierarchy, Discipline, Work Type, Location, Predecessor/Temporal Sequence',
      'Confidence calibration: Match produces 94% confidence for CIV-EXC-042 with explainable signal breakdown',
      'Rule 3 enforced: Only matches > 90% confidence with consistent dates are auto-linked; all others require human review.'
    ]
  },
  {
    step: 6,
    title: '6. Human-in-the-Loop Review Queue',
    subtitle: 'Planner Verification & Conflict Resolution',
    targetView: 'review',
    script: '"Events with lower confidence or potential scope mismatches enter the Review Queue. The planner reviews evidence side-by-side and accepts, reassigns, or rejects the match."',
    details: [
      'Dual-pane verification: Extracted Field Event on the left, Proposed Schedule Activity on the right',
      'Planner actions: Accept Match, Reassign to Different Activity, or Reject (Non-Event / Duplicate)',
      'Immutable audit entry created for every human decision.'
    ]
  },
  {
    step: 7,
    title: '7. Backward Traceability & Evidence Chain',
    subtitle: 'Cryptographic Audit Lineage',
    targetView: 'evidence',
    script: '"Every progress number in SiteSync is backward-traceable to the exact daily report, page, paragraph, and supervisor timestamp that reported it."',
    details: [
      'Complete provenance trail: Document ID → Page/Line → Quoted Statement → Extracted Event → Matched Activity → Verified Progress',
      'Enterprise accountability: Planners, auditors, and management can inspect supporting evidence in one click',
      'Satisfies Oil India audit compliance requirements.'
    ]
  },
  {
    step: 8,
    title: '8. Downstream Delay Propagation & Risk',
    subtitle: 'Schedule Slippage & Float Erosion',
    targetView: 'risks',
    script: '"When foundation excavation slips by 2 days, SiteSync propagates that delay through the dependency graph to alert planners of downstream piping and mechanical risks."',
    details: [
      'Topological dependency analysis: detects eroded total float across successor activities',
      'Early warning radar: flags at-risk milestones before they cause contract liquidated damages',
      'Calculates cascading impact on Compressor Package Mechanical Erection.'
    ]
  },
  {
    step: 9,
    title: '9. Multilingual Voice Reporting',
    subtitle: 'Field Supervisor Speech-to-Reality Capture',
    targetView: 'voice',
    script: '"SiteSync enables field supervisors to report site progress via natural voice notes in Hinglish, English, or Hindi from noisy job sites."',
    details: [
      'Live speech transcription with acoustic word alignment and timestamp confidence',
      'Domain-adapted NLP handles technical construction vocabulary and self-correction slips',
      'Feeds the identical deterministic matching engine with complete audio SHA-256 provenance.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg p-5 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Demo Walkthrough</span>
              <h3 className="text-base font-bold text-slate-900">SiteSync Operational Evaluation Script</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Step {currentStep.step} of {DEMO_STEPS.length}</span>
            <span className="text-slate-900 font-semibold">{currentStep.subtitle}</span>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {DEMO_STEPS.map((s, idx) => (
              <div
                key={idx}
                onClick={() => jumpToStep(idx)}
                className={`h-1.5 rounded-full cursor-pointer transition-colors ${
                  idx === currentStepIdx
                    ? 'bg-slate-900'
                    : idx < currentStepIdx
                    ? 'bg-emerald-600'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Step Content Box */}
        <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
              {currentStep.targetView.toUpperCase()} VIEW ACTIVE
            </span>
            <h4 className="text-sm font-bold text-slate-900 pt-1">{currentStep.title}</h4>
          </div>

          {/* Script Quote */}
          <div className="p-3 rounded bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed italic space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block not-italic">Spoken Script</span>
            <p>&ldquo;{currentStep.script}&rdquo;</p>
          </div>

          {/* Key Execution Bullet Points */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Technical Highlights</span>
            <ul className="space-y-1 text-xs text-slate-700">
              {currentStep.details.map((d, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 text-xs font-semibold transition"
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
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              Explore Screen
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs"
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
