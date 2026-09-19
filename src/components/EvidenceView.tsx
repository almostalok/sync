'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  UserCheck,
  Search,
  ExternalLink,
  Layers
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
    <div className="space-y-5 pb-16 font-mono">
      {/* Top Header */}
      <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-blue-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 border border-slate-900 inline-block"></span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-slate-900 border border-slate-900">
              [EVIDENCE_PROVENANCE_&amp;_AUDIT_CHAIN]
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              {'// DPR_TRACEABILITY_CHAIN'}
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
            IMMUTABLE AUDIT TRAIL OF FIELD EVIDENCE TO AUTHORITATIVE SCHEDULE ACTIVITIES
          </h1>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Every progress update in SiteSync is linked to verifiable source excerpts with document page numbers and character offsets.
          </p>
        </div>

        <div className="relative w-80 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="FILTER_BY_EVIDENCE, REPORT, CODE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-xs font-mono text-slate-950 placeholder:text-slate-500 focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
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

          const cardBorder = 
            decision === 'ACCEPTED' ? 'border-l-[5px] border-l-emerald-600' :
            decision === 'PENDING_REVIEW' ? 'border-l-[5px] border-l-amber-500' :
            'border-l-[5px] border-l-purple-600';

          return (
            <div key={ev.id} className={`bg-white rounded-none border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] ${cardBorder}`}>
              {/* Top Banner: Status & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-slate-900 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-black text-slate-950 bg-stone-200 px-2 py-0.5 rounded-none border border-slate-900">
                    [{ev.id}]
                  </span>
                  <h4 className="text-xs font-black text-slate-950 uppercase">{ev.description}</h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-wider border ${
                    decision === 'ACCEPTED' ? 'bg-emerald-200 text-emerald-950 border-emerald-700' :
                    decision === 'AUTO_LINKED' ? 'bg-blue-200 text-blue-950 border-blue-700' :
                    decision === 'PENDING_REVIEW' ? 'bg-amber-300 text-black border-slate-900' :
                    'bg-purple-200 text-purple-950 border-purple-700'
                  }`}>
                    [{decision === 'ACCEPTED' ? 'VERIFIED' : decision.replace(/_/g, ' ')} : {conf}%]
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-600 font-mono text-[10px]">DATE: [{ev.eventDate}]</span>
                </div>
              </div>

              {/* Provenance 3-Tier Step Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Step 1: Raw Document Provenance */}
                <div className="p-3 rounded-none border-[1.5px] border-amber-600 bg-amber-50/30 space-y-2 text-xs border-l-4 border-l-amber-500">
                  <div className="flex items-center gap-2 font-black text-slate-950 text-[10px] uppercase tracking-wider border-b border-amber-300 pb-1">
                    <FileText className="w-3.5 h-3.5 text-amber-800" />
                    <span>01 // FIELD_SOURCE_EXCERPT</span>
                  </div>

                  <div className="p-2.5 rounded-none bg-white border border-slate-900 italic text-slate-900 text-[11px] leading-relaxed font-sans">
                    &quot;{ev.sourceText}&quot;
                  </div>

                  <div className="text-[10px] text-slate-700 space-y-0.5 font-mono">
                    <div>DOC: <strong className="text-slate-950">[{ev.reportFileName}]</strong> (PG_{ev.sourcePage || 1})</div>
                    <div>CHAR_RANGE: <span className="font-mono text-slate-900 font-bold">[{ev.characterStart ?? 0}..{ev.characterEnd ?? 0}]</span></div>
                  </div>
                </div>

                {/* Step 2: Multi-Signal Synthesis */}
                <div className="p-3 rounded-none border-[1.5px] border-blue-600 bg-blue-50/30 space-y-2 text-xs border-l-4 border-l-blue-500">
                  <div className="flex items-center gap-2 font-black text-slate-950 text-[10px] uppercase tracking-wider border-b border-blue-300 pb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                    <span>02 // MULTI_SIGNAL_CALIBRATION</span>
                  </div>

                  {match?.signals ? (
                    <div className="space-y-1 text-[10px] font-mono">
                      <div className="flex justify-between text-slate-700">
                        <span>SEMANTIC_ALIGNMENT:</span>
                        <span className="text-slate-950 font-bold">{(match.signals.semanticScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>DISCIPLINE_MATCH:</span>
                        <span className="text-slate-950 font-bold">{(match.signals.disciplineScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>LOCATION_SPATIAL:</span>
                        <span className="text-slate-950 font-bold">{(match.signals.locationScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>TEMPORAL_WINDOW:</span>
                        <span className="text-slate-950 font-bold">{(match.signals.temporalScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No multi-signal calculation available.</p>
                  )}

                  <div className="text-[10px] text-slate-900 bg-white p-1.5 rounded-none border border-slate-900 truncate">
                    NORMALIZED: <strong className="uppercase">{ev.normalizedDescription}</strong>
                  </div>
                </div>

                {/* Step 3: Verified Schedule Target */}
                <div className="p-3 rounded-none border-[1.5px] border-emerald-600 bg-emerald-50/30 space-y-2 text-xs flex flex-col justify-between border-l-4 border-l-emerald-500">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-black text-slate-950 text-[10px] uppercase tracking-wider border-b border-emerald-300 pb-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                      <span>03 // SCHEDULE_TARGET_NODE</span>
                    </div>

                    {targetActivity ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-blue-900">[{targetActivity.activityCode}]</span>
                          <span className="text-[10px] font-bold text-slate-950 font-mono bg-white px-1 border border-slate-400">ACTUAL: {targetActivity.actualProgress}%</span>
                        </div>
                        <p className="text-[11px] text-slate-950 font-bold uppercase truncate">{targetActivity.name}</p>
                        <div className="text-[9px] text-slate-600 font-mono truncate">
                          WBS: {targetActivity.wbsPath}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 text-center text-slate-500 italic text-[10px]">
                        UNMATCHED (NO SCHEDULE MUTATION)
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-slate-700 border-t border-emerald-200 pt-2 flex justify-between items-center font-mono">
                    <span className="font-bold">[AUDIT_LOGGED]</span>
                    <button
                      onClick={() => {
                        selectEvent(ev.id);
                        setActiveView('review');
                      }}
                      className="px-2 py-0.5 bg-black hover:bg-slate-800 text-white font-bold text-[9px] uppercase shadow-[1px_1px_0px_#000]"
                    >
                      [REVIEW_QUEUE →]
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
