'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  X, 
  Filter,
  Search,
  RotateCcw,
  CheckCheck
} from 'lucide-react';

export const ReviewQueueView: React.FC = () => {
  const { 
    state, 
    selectEvent, 
    acceptMatch, 
    rejectMatch, 
    selectAlternativeCandidate, 
    markUnmatched 
  } = useProject();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    state.selectedEventId || state.events[0]?.id || ''
  );
  const [filterMode, setFilterMode] = useState<'PENDING' | 'ALL' | 'VERIFIED'>('PENDING');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('ALL');

  // Filter events
  const reviewEvents = state.events.filter(e => {
    const decision = e.match?.decision;
    if (disciplineFilter !== 'ALL' && e.discipline !== disciplineFilter) return false;

    if (filterMode === 'PENDING') {
      return decision === 'PENDING_REVIEW' || (e.match?.confidence && e.match.confidence >= 0.70 && e.match.confidence < 0.90 && decision !== 'ACCEPTED');
    }
    if (filterMode === 'VERIFIED') {
      return decision === 'ACCEPTED' || decision === 'AUTO_LINKED';
    }
    return true;
  });

  const currentEvent = state.events.find(e => e.id === selectedEventId) || reviewEvents[0] || state.events[0];
  const currentMatch = currentEvent ? state.matches.get(currentEvent.id) || currentEvent.match : undefined;
  const currentReport = currentEvent ? state.fieldReports.find(r => r.id === currentEvent.fieldReportId) : undefined;
  const targetActivity = currentMatch ? state.activities.find(a => a.id === currentMatch.activityId) : undefined;

  const handleAccept = () => {
    if (!currentEvent || !currentMatch) return;
    acceptMatch(currentEvent.id, currentMatch.id);
  };

  const handleReject = () => {
    if (!currentEvent || !currentMatch) return;
    rejectMatch(currentEvent.id, currentMatch.id);
  };

  const handleMarkUnmatched = () => {
    if (!currentEvent || !currentMatch) return;
    markUnmatched(currentEvent.id, currentMatch.id);
  };

  const handleSelectAlt = (altActId: string) => {
    if (!currentEvent || !currentMatch) return;
    selectAlternativeCandidate(currentEvent.id, currentMatch.id, altActId);
  };

  return (
    <div className="space-y-5 pb-16 font-mono">
      {/* Top Banner with Safety Principle */}
      <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-none text-[9px] font-bold tracking-widest uppercase bg-amber-300 text-black border border-slate-900">
              [PLANNER_VERIFICATION_QUEUE]
            </span>
            <span className="text-[10px] text-slate-600 font-mono">{'// HUMAN_IN_THE_LOOP_CONTROL'}</span>
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
            VERIFY FIELD-TO-SCHEDULE MATCH PROPOSALS PRIOR TO WRITE-BACK
          </h1>
          <p className="text-xs text-slate-700 font-sans">
            Review candidate linkages, source quotes, and commit verified actuals into authoritative schedule float calculations.
          </p>
        </div>

        {/* Filter Mode Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center bg-stone-100 p-0.5 border border-slate-900 text-xs">
            {(['PENDING', 'VERIFIED', 'ALL'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-none text-[10px] font-bold tracking-wider uppercase transition ${
                  filterMode === mode
                    ? 'bg-black text-white shadow-[1px_1px_0px_#000]'
                    : 'text-slate-800 hover:bg-stone-200'
                }`}
              >
                {mode === 'PENDING' ? `[PENDING: ${state.events.filter(e => e.match?.decision === 'PENDING_REVIEW').length}]` : `[${mode}]`}
              </button>
            ))}
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-none border-[1.5px] border-slate-900 bg-white py-1 px-2.5 text-xs font-mono text-slate-900 font-bold uppercase focus:outline-none focus:bg-amber-50"
          >
            <option value="ALL">ALL_DISCIPLINES</option>
            <option value="CIVIL">CIVIL</option>
            <option value="PIPING">PIPING</option>
            <option value="MECHANICAL">MECHANICAL</option>
            <option value="ELECTRICAL">ELECTRICAL</option>
          </select>
        </div>
      </div>

      {/* Main Review Queue Workspace: Left Queue List vs Right Match Review Item */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Work Items Queue */}
        <div className="lg:col-span-4 bg-white rounded-none border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
              <span className="text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                {`// QUEUE_ITEMS [${reviewEvents.length}]`}
              </span>
              <span className="text-[9px] text-slate-600 font-bold uppercase">[RANK: AMBIGUITY]</span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {reviewEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  {'// NO ITEMS MATCHING CURRENT FILTER CRITERIA'}
                </div>
              ) : (
                reviewEvents.map(evt => {
                  const m = state.matches.get(evt.id) || evt.match;
                  const isSelected = evt.id === currentEvent?.id;
                  const conf = m ? (m.confidence * 100).toFixed(0) : (evt.extractionConfidence * 100).toFixed(0);

                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        selectEvent(evt.id);
                      }}
                      className={`p-2.5 rounded-none border cursor-pointer transition text-xs space-y-1.5 font-mono ${
                        isSelected
                          ? 'bg-amber-100/70 border-slate-900 shadow-[2px_2px_0px_#0f172a]'
                          : 'bg-white border-slate-300 hover:border-slate-900 hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-black text-slate-950">[{evt.id}]</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold border ${
                            Number(conf) >= 90
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                              : Number(conf) >= 70
                              ? 'bg-amber-100 text-amber-950 border-amber-900'
                              : 'bg-red-100 text-red-950 border-red-900'
                          }`}>
                            [{conf}% MATCH]
                          </span>
                          <span className="text-[9px] uppercase font-bold text-slate-700 font-mono">
                            {evt.discipline}
                          </span>
                        </div>
                      </div>

                      <div className="font-bold text-slate-900 truncate" title={evt.description}>
                        {evt.description}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                        <span className="truncate font-mono">{m?.activityCode || '// NO_CANDIDATE'}</span>
                        <span className="font-mono text-[9px]">{evt.eventDate}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-2 border-t-[1.5px] border-slate-900 text-[10px] text-slate-700 flex items-center justify-between font-mono">
            <span>VERIFIED: <strong className="text-slate-950 font-bold">[{state.events.filter(e => e.match?.decision === 'ACCEPTED').length}]</strong></span>
            <span>UNMATCHED: <strong className="text-slate-950 font-bold">[{state.events.filter(e => e.match?.decision === 'UNMATCHED').length}]</strong></span>
          </div>
        </div>

        {/* Right Column: Detailed Match Verification Inspector */}
        <div className="lg:col-span-8 bg-white rounded-none border-[1.5px] border-slate-900 p-5 space-y-5 shadow-[2px_2px_0px_#0f172a] font-mono">
          {currentEvent && currentMatch ? (
            <div className="space-y-5">
              {/* Header: Item Identity & Decision Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white bg-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                      [{currentEvent.id}]
                    </span>
                    <span className="text-xs font-bold uppercase text-slate-800 font-mono">
                      DISC: {currentEvent.discipline}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-xs text-slate-600 font-mono">{currentEvent.eventDate}</span>
                  </div>
                  <h2 className="text-sm md:text-base font-black text-slate-950 uppercase mt-1">
                    {currentEvent.description}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider border-[1.5px] ${
                    currentMatch.decision === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                      : currentMatch.decision === 'AUTO_LINKED'
                      ? 'bg-blue-100 text-blue-950 border-blue-900'
                      : currentMatch.decision === 'REJECTED'
                      ? 'bg-red-100 text-red-950 border-red-900'
                      : 'bg-amber-200 text-amber-950 border-amber-900'
                  }`}>
                    [{currentMatch.decision.replace(/_/g, ' ')}]
                  </span>
                </div>
              </div>

              {/* 1. What Did The Field Say? (Field Source Evidence) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-900" />
                    <span>01 // FIELD_REPORT_SOURCE_EVIDENCE</span>
                  </span>
                  <span className="font-mono text-slate-600 text-[10px]">
                    [{currentEvent.reportFileName}] · PG_{currentEvent.sourcePage || 1}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-slate-400 text-xs text-slate-950 leading-relaxed font-mono">
                  <blockquote className="border-l-2 border-slate-900 pl-3 italic text-slate-800">
                    &quot;{currentEvent.sourceText}&quot;
                  </blockquote>
                </div>
              </div>

              {/* 2. What Did The System Understand? (Extracted Event Parameters) */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  02 // EXTRACTED_PARAMETERS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 border border-slate-300 bg-white">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">STATUS:</span>
                    <strong className="text-slate-950 uppercase">{currentEvent.status}</strong>
                  </div>
                  <div className="p-2 border border-slate-300 bg-white">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">DISCIPLINE:</span>
                    <strong className="text-slate-950 uppercase">{currentEvent.discipline || 'GENERAL'}</strong>
                  </div>
                  <div className="p-2 border border-slate-300 bg-white">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">LOCATION:</span>
                    <strong className="text-slate-950 truncate block uppercase">{currentEvent.location || 'TERMINAL_AREA'}</strong>
                  </div>
                  <div className="p-2 border border-slate-300 bg-white">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">PROGRESS:</span>
                    <strong className="text-slate-950 font-black">{currentEvent.progress || 0}%</strong>
                  </div>
                </div>
              </div>

              {/* 3. Proposed Schedule Activity & Match Calibration */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                  03 // PROPOSED_SCHEDULE_ACTIVITY_LINK
                </span>
                <div className="p-3.5 border-[1.5px] border-slate-900 bg-amber-50/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-950 text-sm">
                          [{currentMatch.activityCode}]
                        </span>
                        <span className="font-bold text-slate-900 text-xs uppercase">
                          {currentMatch.activityName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        PLAN_DUR: {targetActivity?.plannedDuration || 8}D · PLAN_FINISH: {targetActivity?.plannedFinish || '18-Sep-2026'}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-lg font-black font-mono text-slate-950">
                        [{(currentMatch.confidence * 100).toFixed(1)}%]
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700">
                        MATCH_CONFIDENCE
                      </span>
                    </div>
                  </div>

                  {/* 7-Signal Calibration Breakdown */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-700 block mb-1">
                      {'// SIGNAL_BREAKDOWN:'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-mono">
                      <div className="p-1.5 bg-white border border-slate-300 flex justify-between">
                        <span className="text-slate-600">SEMANTIC:</span>
                        <strong className="text-slate-950">{((currentMatch.signals?.semanticScore || 0.92) * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-300 flex justify-between">
                        <span className="text-slate-600">DISCIPLINE:</span>
                        <strong className="text-slate-950">{((currentMatch.signals?.disciplineScore || 1.0) * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-300 flex justify-between">
                        <span className="text-slate-600">LOCATION:</span>
                        <strong className="text-slate-950">{((currentMatch.signals?.locationScore || 0.85) * 100).toFixed(0)}%</strong>
                      </div>
                      <div className="p-1.5 bg-white border border-slate-300 flex justify-between">
                        <span className="text-slate-600">TEMPORAL:</span>
                        <strong className="text-slate-950">{((currentMatch.signals?.temporalScore || 0.90) * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Activity Candidates */}
              {currentMatch.candidates && currentMatch.candidates.length > 1 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                    04 // ALTERNATIVE_CANDIDATES
                  </span>
                  <div className="space-y-1.5">
                    {currentMatch.candidates.slice(1, 4).map((alt) => (
                      <div
                        key={alt.activityId}
                        className="p-2 border border-slate-300 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs transition"
                      >
                        <div className="truncate pr-2">
                          <span className="font-mono font-bold text-slate-950 mr-2">[{alt.activityCode}]</span>
                          <span className="text-slate-800 uppercase">{alt.activityName}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono text-slate-700 font-bold">{(alt.finalScore * 100).toFixed(1)}%</span>
                          <button
                            onClick={() => handleSelectAlt(alt.activityId)}
                            className="px-2 py-0.5 rounded-none border border-slate-900 bg-white hover:bg-stone-200 text-slate-950 font-bold text-[10px] uppercase active:translate-x-[1px] active:translate-y-[1px]"
                          >
                            [SWITCH_CANDIDATE]
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Decision Buttons */}
              <div className="pt-3 border-t-[1.5px] border-slate-900 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-red-800 bg-white hover:bg-red-50 text-red-950 font-bold text-xs uppercase shadow-[2px_2px_0px_#991b1b] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>[REJECT_MATCH]</span>
                  </button>

                  <button
                    onClick={handleMarkUnmatched}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-100 hover:bg-stone-200 text-slate-900 font-bold text-xs uppercase shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>[NEW_SCOPE_UNMATCHED]</span>
                  </button>
                </div>

                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-black hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-400" />
                  <span>[VERIFY_&_COMMIT_SCHEDULE]</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 uppercase">{'// NO_ITEM_SELECTED'}</div>
              <div className="text-[11px] text-slate-600">Select an item from the queue to review evidence and confirm linkage.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
