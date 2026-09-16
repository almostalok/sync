'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Layers, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Check, 
  X, 
  Filter,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

  // Filter events
  const reviewEvents = state.events.filter(e => {
    const decision = e.match?.decision;
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

  const handleAccept = () => {
    if (!currentEvent || !currentMatch) return;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
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
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
    selectAlternativeCandidate(currentEvent.id, currentMatch.id, altActId);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner with Safety Principle */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Planner Verification Workstation
            </span>
            <span className="text-xs text-slate-400">Human-In-The-Loop Schedule Safety</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Review AI Match Suggestions Before Writing Schedule Progress
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setFilterMode('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'PENDING' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Verification ({state.events.filter(e => e.match?.decision === 'PENDING_REVIEW').length})
          </button>
          <button
            onClick={() => setFilterMode('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'ALL' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Events ({state.events.length})
          </button>
          <button
            onClick={() => setFilterMode('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterMode === 'VERIFIED' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified / Linked ({state.events.filter(e => e.match?.decision === 'ACCEPTED' || e.match?.decision === 'AUTO_LINKED').length})
          </button>
        </div>
      </div>

      {/* Main Review Station Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Event Selector List */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Queue Items</span>
            <span className="text-xs text-slate-500">{reviewEvents.length} items</span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {reviewEvents.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-300">Review Queue Empty</h4>
                <p className="text-xs text-slate-500">All field events have been verified or safely classified.</p>
              </div>
            ) : (
              reviewEvents.map(ev => {
                const match = state.matches.get(ev.id) || ev.match;
                const isSelected = ev.id === currentEvent?.id;
                const conf = match ? Math.round(match.confidence * 100) : Math.round(ev.extractionConfidence * 100);
                const decision = match?.decision || 'PENDING_REVIEW';

                return (
                  <div
                    key={ev.id}
                    onClick={() => {
                      setSelectedEventId(ev.id);
                      selectEvent(ev.id);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition border space-y-1.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950'
                        : 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-200 truncate">{ev.description}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        decision === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        decision === 'AUTO_LINKED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        decision === 'PENDING_REVIEW' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {conf}% {decision === 'ACCEPTED' ? 'VERIFIED' : decision.slice(0, 7)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 italic truncate">
                      "{ev.sourceText}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{ev.reportFileName}</span>
                      <span>Target: <strong className="text-slate-300">{match?.activityCode || 'None'}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 cols: Dual Column Deep Verification Station */}
        {currentEvent && (
          <div className="lg:col-span-8 glass-card rounded-2xl p-5 space-y-5">
            {/* Header with Calibrated Confidence & Decision Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Selected Event</span>
                <h3 className="text-base font-bold text-white">{currentEvent.description}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Source: {currentEvent.reportFileName} (Page {currentEvent.sourcePage || 1})</span>
                  <span>•</span>
                  <span>Date: {currentEvent.eventDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Calibrated Confidence</div>
                  <div className={`text-xl font-black ${
                    (currentMatch?.confidence || 0) >= 0.90 ? 'text-cyan-400' :
                    (currentMatch?.confidence || 0) >= 0.70 ? 'text-amber-400' : 'text-slate-400'
                  }`}>
                    {currentMatch ? `${(currentMatch.confidence * 100).toFixed(1)}%` : `${(currentEvent.extractionConfidence * 100).toFixed(1)}%`}
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  currentMatch?.decision === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' :
                  currentMatch?.decision === 'AUTO_LINKED' ? 'bg-cyan-950 text-cyan-300 border-cyan-600' :
                  currentMatch?.decision === 'PENDING_REVIEW' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                  'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {currentMatch?.decision || 'PENDING_REVIEW'}
                </div>
              </div>
            </div>

            {/* Split Screen: Left (Source Field Evidence) vs Right (AI Candidate Activity) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Source Evidence */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Source Field Evidence Excerpt</span>
                </div>

                {/* Highlighted text snippet */}
                <div className="p-3 rounded-lg bg-[#080d18] border border-cyan-900/40 text-xs leading-relaxed space-y-2">
                  <p className="text-slate-300 italic">
                    "{currentEvent.sourceText}"
                  </p>
                  <div className="text-[10px] text-cyan-400 font-mono flex justify-between border-t border-slate-800 pt-1.5">
                    <span>Offset: [{currentEvent.characterStart ?? 0}..{currentEvent.characterEnd ?? 0}]</span>
                    <span>Confidence: {(currentEvent.extractionConfidence * 100).toFixed(0)}%</span>
                  </div>
                </div>

                {/* Extracted Entity Signals */}
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Normalized Term</span>
                    <span className="font-mono text-cyan-300">{currentEvent.normalizedDescription}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Reported Progress</span>
                    <span className="font-bold text-emerald-400">{currentEvent.progress !== undefined ? `${currentEvent.progress}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Detected Discipline</span>
                    <span className="text-amber-300">{currentEvent.discipline || 'General'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Detected Location</span>
                    <span className="text-slate-300">{currentEvent.location || 'Site Area'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Candidate Activity & 7 Signals */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>7-Signal Hybrid Match Breakdown</span>
                </div>

                {/* Target Matched Activity Details */}
                <div className="p-3 rounded-lg bg-[#080d18] border border-purple-900/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300">{currentMatch?.activityCode || 'No Target'}</span>
                    <span className="text-[10px] text-slate-400">{currentMatch?.signals ? '7-Signal Match' : 'Unmatched'}</span>
                  </div>
                  <p className="font-semibold text-slate-200">{currentMatch?.activityName}</p>
                </div>

                {/* 7 Signals Bars */}
                {currentMatch?.signals && (
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      { label: 'Semantic (40%)', val: currentMatch.signals.semanticScore, color: 'from-cyan-500 to-blue-500' },
                      { label: 'Discipline (15%)', val: currentMatch.signals.disciplineScore, color: 'from-emerald-500 to-teal-500' },
                      { label: 'Location (10%)', val: currentMatch.signals.locationScore, color: 'from-purple-500 to-indigo-500' },
                      { label: 'WBS Context (10%)', val: currentMatch.signals.wbsScore, color: 'from-amber-500 to-orange-500' },
                      { label: 'Temporal Window (10%)', val: currentMatch.signals.temporalScore, color: 'from-pink-500 to-rose-500' },
                      { label: 'Dependency Check (10%)', val: currentMatch.signals.dependencyScore, color: 'from-blue-500 to-cyan-500' },
                      { label: 'Entity / Equipment (5%)', val: currentMatch.signals.entityScore, color: 'from-lime-500 to-emerald-500' },
                    ].map(sig => (
                      <div key={sig.label} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>{sig.label}</span>
                          <span className="font-mono text-slate-300">{(sig.val * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full bg-gradient-to-r ${sig.color}`}
                            style={{ width: `${Math.min(100, sig.val * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Alternative Candidates List */}
            {currentMatch?.candidates && currentMatch.candidates.length > 1 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top-K Candidate Alternatives</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentMatch.candidates.slice(1, 4).map(cand => (
                    <div
                      key={cand.activityId}
                      className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="truncate">
                        <span className="font-mono font-bold text-cyan-300 block">{cand.activityCode}</span>
                        <span className="text-slate-300 truncate block text-[11px]">{cand.activityName}</span>
                        <span className="text-[10px] text-slate-500">Confidence: {(cand.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <button
                        onClick={() => handleSelectAlt(cand.activityId)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-500/60 text-cyan-300 text-[10px] font-semibold shrink-0"
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-700/60 text-rose-300 text-xs font-bold transition"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={handleMarkUnmatched}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Mark Unmatched</span>
                </button>
              </div>

              <button
                onClick={handleAccept}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Verify & Accept Match (Update Schedule)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
