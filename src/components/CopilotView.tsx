'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  CopilotResponse,
  CopilotCitation,
  CopilotCalculation,
  GroundingStatus,
} from '@/types/domain';
import { copilotService } from '../../apps/api/src/modules/copilot';
import {
  Search,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  AlertTriangle,
  Calculator,
  Database,
  Layers,
  Info,
  Calendar,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { StatusBadge } from '@sitesync/design-system';

interface IntelligenceRecord {
  id: string;
  query: string;
  answer: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  groundingStatus?: GroundingStatus;
  citations?: CopilotCitation[];
  calculations?: CopilotCalculation[];
  suggestedActions?: string[];
  warnings?: string[];
  latencyMs?: number;
}

export const CopilotView: React.FC = () => {
  const { state, setActiveView } = useProject();
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<CopilotCitation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic suggested questions based on real live state
  const [suggestedQuestions, setSuggestedQuestions] = useState<{ question: string; category: string }[]>([]);

  useEffect(() => {
    const questions = copilotService.generateSuggestedQuestions({
      activities: state.activities,
      reports: state.fieldReports,
      events: state.events,
      risks: state.risks,
      historicalOutcomes: state.historicalOutcomes,
    });
    setSuggestedQuestions(questions);
  }, [state.activities, state.fieldReports, state.events, state.risks, state.historicalOutcomes]);

  // Assessment History
  const [history, setHistory] = useState<IntelligenceRecord[]>([
    {
      id: 'REC-INIT',
      query: 'Project Overview & Current Reality',
      answer: `The **${state.project.name}** is currently at **${state.project.actualProgress}% verified progress** against a planned baseline of **${state.project.plannedProgress}%**.

### Key Observations
* **Critical Path Status**: Civil foundation activities for Compressor C-201 are nearing completion, while mechanical installation is pending receipt of foundation inspection sign-off.
* **Review Queue**: Multiple field report events extracted from recent daily progress reports require planner verification before progress is locked into authoritative baselines.
* **Downstream Dependencies**: Piping package spool fabrication is directly dependent on compressor package anchoring clearance.`,
      timestamp: 'Today, 09:30 AM',
      confidence: 1.0,
      groundingStatus: 'GROUNDED',
      intent: 'PROJECT_OVERVIEW',
      citations: [
        {
          sourceType: 'SCHEDULE',
          sourceId: state.project.id,
          title: `Project Baseline: ${state.project.name}`,
          excerpt: `Actual Progress: ${state.project.actualProgress}% | Planned: ${state.project.plannedProgress}% | Data Snapshot: v182`,
          relevanceScore: 1.0,
        },
      ],
      suggestedActions: [
        'Why is compressor foundation work delayed?',
        'What changed today?',
        'Which updates still need planner review?',
        'How long did similar foundation activities take in previous projects?',
      ],
    },
  ]);

  const [activeRecordId, setActiveRecordId] = useState<string>('REC-INIT');
  const activeRecord = history.find((h) => h.id === activeRecordId) || history[0];

  const handleRunQuery = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isProcessing) return;

    setIsProcessing(true);
    setInputQuery('');

    try {
      const response: CopilotResponse = await copilotService.query(
        {
          projectId: state.project.id,
          userId: 'lead-planner',
          question: q,
        },
        {
          project: state.project,
          activities: state.activities,
          dependencies: state.dependencies,
          reports: state.fieldReports,
          events: state.events,
          risks: state.risks,
          historicalOutcomes: state.historicalOutcomes,
        }
      );

      const newRecord: IntelligenceRecord = {
        id: `REC-${Date.now()}`,
        query: q,
        answer: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        confidence: response.confidence,
        groundingStatus: response.groundingStatus,
        citations: response.citations,
        calculations: response.calculations,
        suggestedActions: response.suggestedActions,
        warnings: response.warnings,
        latencyMs: response.latencyMs,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setActiveRecordId(newRecord.id);
    } catch (err: any) {
      const errorRecord: IntelligenceRecord = {
        id: `ERR-${Date.now()}`,
        query: q,
        answer: `**Grounding Error**: The system was unable to retrieve sufficient verified project data to answer this query (${err.message || 'Scope mismatch'}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.0,
        groundingStatus: 'INSUFFICIENT',
        warnings: ['Retrieval failure or out-of-scope question.'],
      };
      setHistory((prev) => [errorRecord, ...prev]);
      setActiveRecordId(errorRecord.id);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 font-mono">
      {/* Enterprise Top Bar */}
      <div className="bg-white border-[1.5px] border-slate-900 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-stone-100 px-1 border border-slate-300">
              [GROUNDED_SCHEDULE_INTELLIGENCE]
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-[10px] text-slate-600 font-mono">
              LEVEL_1_VERIFIED_GROUNDING // ZERO_HALLUCINATION_POLICY
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black text-slate-950 tracking-tight uppercase">
            PROJECT EXECUTION REASONING & EVIDENCE DOSSIER
          </h1>
          <p className="text-xs text-slate-700 mt-0.5 font-sans">
            Contextual project analysis strictly grounded in authoritative schedule baselines, daily field reports (DPRs), and Oil India historical memory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs text-slate-900 bg-stone-100 border border-slate-900 px-2.5 py-1 rounded-none flex items-center gap-1.5 font-bold uppercase text-[10px]">
            <ShieldCheck className="w-4 h-4 text-slate-900" />
            <span>
              [STRICT_READ_ONLY]
            </span>
          </div>
          <div className="text-xs text-slate-900 bg-stone-100 border border-slate-900 px-2 py-1 rounded-none font-mono text-[10px] font-bold">
            [V182_SNAPSHOT]
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Query & Inquiries Navigation, Right Intelligence Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Query Controller & Suggested Inquiries */}
        <div className="lg:col-span-4 space-y-4 font-mono">
          {/* Query Input Box */}
          <div className="bg-white border-[1.5px] border-slate-900 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] space-y-3">
            <label className="text-[10px] font-bold text-slate-950 uppercase tracking-wider block">
              // TERMINAL_QUERY_INPUT:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="> Enter query regarding delays, DPRs, float, or benchmarks..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunQuery();
                }}
                disabled={isProcessing}
                className="w-full pl-3 pr-8 py-2 rounded-none border-[1.5px] border-slate-900 text-xs text-slate-950 font-mono placeholder-slate-400 focus:outline-none focus:bg-amber-50/50 disabled:bg-stone-100"
              />
              {inputQuery && (
                <button
                  onClick={() => setInputQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-950"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => handleRunQuery()}
              disabled={!inputQuery.trim() || isProcessing}
              className="w-full py-2 rounded-none bg-black hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              {isProcessing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>[EVALUATING_PROJECT_EVIDENCE...]</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>[EXECUTE_QUERY]</span>
                </>
              )}
            </button>
          </div>

          {/* Suggested Operational Inquiries */}
          <div className="bg-white border-[1.5px] border-slate-900 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                // STANDARD_OPERATIONAL_INQUIRIES
              </span>
              <span className="text-[9px] text-slate-600 font-mono font-bold">[GROUNDED]</span>
            </div>

            <div className="space-y-1.5">
              {suggestedQuestions.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunQuery(sq.question)}
                  disabled={isProcessing}
                  className="w-full text-left p-2 rounded-none border border-slate-300 hover:border-slate-900 hover:bg-stone-100 text-xs text-slate-900 transition flex items-start justify-between gap-2 group font-mono active:translate-x-[1px] active:translate-y-[1px]"
                >
                  <span className="leading-snug text-[11px]">&gt; {sq.question}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-950 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Query Dossiers */}
          <div className="bg-white border-[1.5px] border-slate-900 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                // ASSESSMENT_HISTORY
              </span>
              <span className="text-[9px] text-slate-600 font-mono font-bold">[{history.length} RECORDS]</span>
            </div>

            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {history.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setActiveRecordId(rec.id)}
                  className={`w-full text-left p-2 rounded-none text-xs transition flex flex-col justify-between border font-mono ${
                    activeRecordId === rec.id
                      ? 'bg-amber-100/70 border-slate-900 text-slate-950 font-bold shadow-[1px_1px_0px_#000]'
                      : 'bg-white border-slate-300 hover:border-slate-900 hover:bg-stone-50 text-slate-700'
                  }`}
                >
                  <div className="truncate uppercase text-[11px] font-bold">{rec.query}</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">[{rec.timestamp}]</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Current Intelligence Assessment Dossier */}
        <div className="lg:col-span-8 space-y-4 font-mono">
          <div className="bg-white border-[1.5px] border-slate-900 rounded-none p-5 shadow-[2px_2px_0px_#0f172a] space-y-5">
            {/* Dossier Header */}
            <div className="border-b-[1.5px] border-slate-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider block">
                  // CURRENT_ANALYTICAL_DOSSIER
                </span>
                <h2 className="text-sm md:text-base font-black text-slate-950 uppercase mt-0.5">
                  {activeRecord.query}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeRecord.groundingStatus === 'GROUNDED' && (
                  <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase bg-emerald-100 text-emerald-950 border border-emerald-900 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-950" />
                    <span>[GROUNDED]</span>
                  </span>
                )}
                {activeRecord.groundingStatus === 'PARTIAL' && (
                  <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase bg-amber-200 text-amber-950 border border-amber-900 flex items-center gap-1 font-mono">
                    <AlertTriangle className="w-3 h-3 text-amber-950" />
                    <span>[PARTIAL_EVIDENCE]</span>
                  </span>
                )}
                {activeRecord.groundingStatus === 'INSUFFICIENT' && (
                  <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase bg-stone-100 text-slate-900 border border-slate-900 flex items-center gap-1 font-mono">
                    <Info className="w-3 h-3" />
                    <span>[INSUFFICIENT_DATA]</span>
                  </span>
                )}

                {activeRecord.confidence !== undefined && (
                  <span className="text-[10px] font-mono font-bold text-slate-950 bg-stone-100 px-1.5 py-0.5 border border-slate-900">
                    [CONF: {(activeRecord.confidence * 100).toFixed(0)}%]
                  </span>
                )}
                {activeRecord.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono text-slate-600">
                    [{activeRecord.latencyMs}ms]
                  </span>
                )}
              </div>
            </div>

            {/* Assessment Text Output */}
            <div className="text-xs text-slate-900 leading-relaxed space-y-3 font-mono">
              {activeRecord.answer.split('\n\n').map((para, pIdx) => {
                if (para.startsWith('### ')) {
                  return (
                    <h3 key={pIdx} className="font-bold text-xs uppercase tracking-wider text-slate-950 pt-2 border-b border-slate-900 pb-1">
                      // {para.replace('### ', '')}
                    </h3>
                  );
                }
                if (para.startsWith('#### ')) {
                  return (
                    <h4 key={pIdx} className="font-bold text-xs uppercase text-slate-900 pt-1">
                      {para.replace('#### ', '')}
                    </h4>
                  );
                }
                if (para.startsWith('* ')) {
                  return (
                    <ul key={pIdx} className="list-disc pl-5 space-y-1">
                      {para.split('\n').map((li, lIdx) => (
                        <li key={lIdx} className="text-slate-800">
                          {li.replace('* ', '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={pIdx} className="text-slate-800 font-sans">
                    {para}
                  </p>
                );
              })}
            </div>

            {/* Deterministic System Calculations */}
            {activeRecord.calculations && activeRecord.calculations.length > 0 && (
              <div className="pt-3 border-t-[1.5px] border-slate-900 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-slate-900" />
                  <span>// DETERMINISTIC_CALCULATIONS</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecord.calculations.map((calc, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-none bg-stone-50 border border-slate-900 text-xs space-y-1 shadow-[1px_1px_0px_#000]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-950 uppercase">{calc.name}</span>
                        <span className="font-mono font-black text-slate-950 text-xs bg-white px-1 border border-slate-400">
                          {calc.value} {calc.unit || ''}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-700 font-mono bg-white px-1.5 py-0.5 border border-slate-300">
                        {calc.formula}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Source Evidence & Citations */}
            {activeRecord.citations && activeRecord.citations.length > 0 && (
              <div className="pt-3 border-t-[1.5px] border-slate-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-900" />
                    <span>// SOURCE_EVIDENCE_LINEAGE [{activeRecord.citations.length}]</span>
                  </span>
                  <span className="text-[9px] text-slate-600 uppercase font-bold">[SELECT_DRAWER]</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeRecord.citations.map((cit, citIdx) => (
                    <button
                      key={citIdx}
                      onClick={() => setSelectedCitation(cit)}
                      className="p-2.5 rounded-none bg-stone-50 hover:bg-stone-100 border border-slate-900 text-left transition space-y-1 shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-950 uppercase truncate max-w-[200px]">
                          {cit.title}
                        </span>
                        {cit.locator?.page && (
                          <span className="text-[9px] text-slate-700 font-mono font-bold">PG_{cit.locator.page}</span>
                        )}
                      </div>
                      {cit.excerpt && (
                        <p className="text-[10px] text-slate-700 line-clamp-2 italic leading-relaxed font-sans">
                          "{cit.excerpt}"
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[9px] text-slate-600 font-mono pt-1 border-t border-slate-300">
                        <span>[{cit.sourceType}] · {cit.sourceId}</span>
                        <span className="text-slate-950 font-bold uppercase underline flex items-center gap-0.5">
                          [INSPECT] <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Follow-up Actions */}
            {activeRecord.suggestedActions && activeRecord.suggestedActions.length > 0 && (
              <div className="pt-3 border-t-[1.5px] border-slate-900 space-y-2">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  // FOLLOW_UP_OPERATIONAL_INQUIRIES:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeRecord.suggestedActions.map((act, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => handleRunQuery(act)}
                      className="px-2 py-1 rounded-none bg-stone-100 hover:bg-stone-200 border border-slate-900 text-slate-950 text-xs font-bold uppercase transition active:translate-x-[1px] active:translate-y-[1px]"
                    >
                      &gt; {act}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings if any */}
            {activeRecord.warnings && activeRecord.warnings.length > 0 && (
              <div className="p-2.5 rounded-none bg-amber-100 border border-amber-900 text-xs text-amber-950 flex items-center gap-2 font-mono">
                <AlertTriangle className="w-4 h-4 text-amber-950 shrink-0" />
                <span className="font-bold">[{activeRecord.warnings[0]}]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Source Drawer */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 font-mono">
          <div className="w-full max-w-md bg-white border-l-[2px] border-slate-900 h-full p-6 flex flex-col justify-between shadow-[4px_4px_0px_#000] overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b-[1.5px] border-slate-900">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-900" />
                  <h3 className="font-black text-slate-950 text-xs uppercase">// SOURCE_EVIDENCE_DOSSIER</h3>
                </div>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="p-1 border border-slate-900 hover:bg-stone-100 text-slate-900"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Source Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">SOURCE_TYPE:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded-none bg-stone-100 border border-slate-900 text-slate-950 font-mono font-bold text-[10px]">
                      [{selectedCitation.sourceType}]
                    </span>
                    <span className="text-slate-700 font-mono font-bold">{selectedCitation.sourceId}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">TITLE:</span>
                  <p className="font-bold uppercase text-slate-950 mt-0.5">{selectedCitation.title}</p>
                </div>

                {selectedCitation.discipline && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">DISCIPLINE:</span>
                    <p className="text-slate-900 uppercase font-bold mt-0.5">{selectedCitation.discipline}</p>
                  </div>
                )}

                {selectedCitation.locator && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">DOCUMENT_LOCATOR:</span>
                    <div className="mt-1 p-2 rounded-none bg-stone-50 border border-slate-400 font-mono text-[10px] text-slate-900 space-y-0.5">
                      {selectedCitation.locator.page && <div>PAGE: {selectedCitation.locator.page}</div>}
                      {selectedCitation.locator.line && <div>LINE: {selectedCitation.locator.line}</div>}
                      {selectedCitation.locator.sheet && <div>SHEET: {selectedCitation.locator.sheet}</div>}
                      {selectedCitation.locator.cell && <div>CELL: {selectedCitation.locator.cell}</div>}
                    </div>
                  </div>
                )}

                {selectedCitation.excerpt && (
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">PRIMARY_EVIDENCE_EXCERPT:</span>
                    <div className="mt-1 p-3 rounded-none bg-stone-50 border border-slate-900 text-slate-950 italic text-[11px] leading-relaxed font-sans">
                      "{selectedCitation.excerpt}"
                    </div>
                  </div>
                )}

                {selectedCitation.verifiedBy && (
                  <div className="p-2.5 rounded-none bg-emerald-100 border border-emerald-900 text-emerald-950 text-[10px] space-y-1 font-mono">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
                      <span>[AUDIT_TRAIL_VERIFIED]</span>
                    </div>
                    <div>VERIFIER: {selectedCitation.verifiedBy}</div>
                    {selectedCitation.verifiedAt && <div>TIMESTAMP: {selectedCitation.verifiedAt}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t-[1.5px] border-slate-900 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCitation(null);
                  setActiveView('review');
                }}
                className="flex-1 py-2 rounded-none bg-black hover:bg-slate-800 text-white font-bold uppercase text-xs border border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] text-center"
              >
                [INSPECT_REVIEW_QUEUE]
              </button>
              <button
                onClick={() => {
                  setSelectedCitation(null);
                  setActiveView('gantt');
                }}
                className="flex-1 py-2 rounded-none border border-slate-900 bg-stone-100 hover:bg-stone-200 text-slate-950 font-bold uppercase text-xs shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] text-center"
              >
                [SCHEDULE_VIEW]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
