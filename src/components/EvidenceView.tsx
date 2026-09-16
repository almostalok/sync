'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  SearchCheck, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  UserCheck,
  Search
} from 'lucide-react';

export const EvidenceView: React.FC = () => {
  const { state, selectEvent, setActiveView } = useProject();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = state.events.filter(e => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      e.description.toLowerCase().includes(q) ||
      e.sourceText.toLowerCase().includes(q) ||
      e.reportFileName.toLowerCase().includes(q) ||
      (e.match?.activityCode || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Evidence Provenance & Traceability
            </span>
            <span className="text-xs text-slate-400">Section 9 & FR-09 Compliance</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Immutable Audit Trail of Source Field Evidence to Schedule Activities
          </h2>
        </div>

        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence text, report, or activity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Evidence Provenance Cards */}
      <div className="space-y-4">
        {filteredEvents.map(ev => {
          const match = state.matches.get(ev.id) || ev.match;
          const targetActivity = state.activities.find(a => a.id === match?.activityId);
          const decision = match?.decision || 'UNMATCHED';
          const conf = match ? (match.confidence * 100).toFixed(1) : (ev.extractionConfidence * 100).toFixed(1);

          return (
            <div key={ev.id} className="glass-card rounded-2xl p-5 space-y-4 border border-slate-800">
              {/* Top Banner: Status & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                    {ev.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200">{ev.description}</h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    decision === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    decision === 'AUTO_LINKED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                    decision === 'PENDING_REVIEW' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {decision === 'ACCEPTED' ? 'VERIFIED' : decision} ({conf}%)
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono text-[11px]">{ev.eventDate}</span>
                </div>
              </div>

              {/* Provenance 3-Tier Step Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Raw Document Provenance */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>1. Field Source Excerpt</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#080d18] border border-slate-800/80 italic text-slate-300 text-[11px] leading-relaxed">
                    "{ev.sourceText}"
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <div>Document: <strong className="text-slate-200">{ev.reportFileName}</strong> (Page {ev.sourcePage || 1})</div>
                    <div>Character Offset: <span className="font-mono text-cyan-400">[{ev.characterStart ?? 0}..{ev.characterEnd ?? 0}]</span></div>
                  </div>
                </div>

                {/* Step 2: AI Multi-Signal Synthesis */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    <span>2. AI 7-Signal Evidence</span>
                  </div>

                  {match?.signals ? (
                    <div className="space-y-1 text-[10px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Semantic Match:</span>
                        <span className="text-cyan-300 font-mono">{(match.signals.semanticScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Discipline Compatibility:</span>
                        <span className="text-emerald-300 font-mono">{(match.signals.disciplineScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Location Spatial Match:</span>
                        <span className="text-amber-300 font-mono">{(match.signals.locationScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Temporal Proximity:</span>
                        <span className="text-pink-300 font-mono">{(match.signals.temporalScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No multi-signal calculation available.</p>
                  )}

                  <div className="text-[10px] text-slate-400 bg-slate-950/60 p-1.5 rounded border border-slate-800 truncate">
                    Normalized: <span className="text-slate-200">{ev.normalizedDescription}</span>
                  </div>
                </div>

                {/* Step 3: Verified Schedule Target */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>3. Verified Schedule Impact</span>
                  </div>

                  {targetActivity ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-cyan-300">{targetActivity.activityCode}</span>
                        <span className="text-[10px] font-bold text-emerald-400">Actual: {targetActivity.actualProgress}%</span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{targetActivity.name}</p>
                      <div className="text-[10px] text-slate-500">
                        WBS: {targetActivity.wbsPath}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-500 italic text-[11px]">
                      Unmatched (No schedule modification)
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 border-t border-slate-800 pt-1 flex justify-between">
                    <span>Audit Status: Active</span>
                    <button
                      onClick={() => {
                        selectEvent(ev.id);
                        setActiveView('review');
                      }}
                      className="text-cyan-400 hover:underline font-semibold"
                    >
                      Review Decision →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
