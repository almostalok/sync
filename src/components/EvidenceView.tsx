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
    <div className="space-y-5 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
              Evidence Provenance &amp; Traceability
            </span>
            <span className="text-xs text-slate-500 font-medium">Audit Compliance • DPR Traceability Chain</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
            Immutable Audit Trail of Source Field Evidence to Schedule Activities
          </h1>
          <p className="text-xs text-slate-600">
            Every progress update in SiteSync is linked to verifiable source excerpts with document page numbers and character offsets.
          </p>
        </div>

        <div className="relative w-72 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evidence, report, or activity..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
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
            <div key={ev.id} className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-sm">
              {/* Top Banner: Status & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {ev.id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{ev.description}</h4>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${
                    decision === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                    decision === 'AUTO_LINKED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                    decision === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                    'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    {decision === 'ACCEPTED' ? 'VERIFIED' : decision.replace(/_/g, ' ')} ({conf}%)
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-mono text-[11px]">{ev.eventDate}</span>
                </div>
              </div>

              {/* Provenance 3-Tier Step Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Raw Document Provenance */}
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>1. Field Source Excerpt</span>
                  </div>

                  <div className="p-2.5 rounded bg-white border border-slate-200 italic text-slate-700 text-[11px] leading-relaxed">
                    “{ev.sourceText}”
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Document: <strong className="text-slate-800">{ev.reportFileName}</strong> (Page {ev.sourcePage || 1})</div>
                    <div>Character Range: <span className="font-mono text-slate-700">[{ev.characterStart ?? 0}..{ev.characterEnd ?? 0}]</span></div>
                  </div>
                </div>

                {/* Step 2: Multi-Signal Synthesis */}
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                    <span>2. Multi-Signal Calibration</span>
                  </div>

                  {match?.signals ? (
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-600">
                        <span>Semantic Match:</span>
                        <span className="text-slate-900 font-mono font-bold">{(match.signals.semanticScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Discipline Compatibility:</span>
                        <span className="text-slate-900 font-mono font-bold">{(match.signals.disciplineScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Location Spatial Match:</span>
                        <span className="text-slate-900 font-mono font-bold">{(match.signals.locationScore * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Temporal Proximity:</span>
                        <span className="text-slate-900 font-mono font-bold">{(match.signals.temporalScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No multi-signal calculation available.</p>
                  )}

                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200 truncate">
                    Normalized: <span className="text-slate-800 font-medium">{ev.normalizedDescription}</span>
                  </div>
                </div>

                {/* Step 3: Verified Schedule Target */}
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50 space-y-2 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>3. Schedule Activity Target</span>
                    </div>

                    {targetActivity ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{targetActivity.activityCode}</span>
                          <span className="text-[11px] font-bold text-slate-800 font-mono">Actual: {targetActivity.actualProgress}%</span>
                        </div>
                        <p className="text-[11px] text-slate-800 font-medium line-clamp-2">{targetActivity.name}</p>
                        <div className="text-[10px] text-slate-500 truncate">
                          WBS: {targetActivity.wbsPath}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-slate-400 italic text-[11px]">
                        Unmatched (No schedule modification)
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span>Audit Status: Logged</span>
                    <button
                      onClick={() => {
                        selectEvent(ev.id);
                        setActiveView('review');
                      }}
                      className="text-blue-700 hover:underline font-semibold"
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
