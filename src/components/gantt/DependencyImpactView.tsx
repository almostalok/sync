'use client';

import React from 'react';
import { DependencyGraphDTO } from '@sitesync/types';
import {
  GitBranch,
  X,
  AlertTriangle,
  AlertOctagon,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface DependencyImpactViewProps {
  graph: DependencyGraphDTO;
  onClose: () => void;
  onSelectActivity?: (activityCode: string) => void;
}

export const DependencyImpactView: React.FC<DependencyImpactViewProps> = ({
  graph,
  onClose,
  onSelectActivity,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <GitBranch className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {graph.activityCode}
              </span>
              <span className="text-xs uppercase font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {graph.discipline}
              </span>
              {graph.isCritical && (
                <span className="text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                  Critical Path
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-white">{graph.activityName}</h3>
            <p className="text-xs text-slate-400">
              Interactive Dependency Graph &amp; Multi-level Delay Propagation Intelligence
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend / Methodology Warning Notice */}
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs text-purple-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Deterministic Impact Rule: </strong>
            <span>
              Confirmed delay on this node (<strong className="text-rose-400">+{graph.confirmedDelayDays} days</strong>) propagates through Finish-to-Start (FS) links minus float/lag. Potential impacts indicate schedule exposure risks, not authoritative baseline alterations until field confirmation.
            </span>
          </div>
        </div>

        {/* 3-Tier Visual Flow: Predecessors -> Target Activity -> Successors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Tier 1: Upstream Predecessors */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                1. Upstream Predecessors ({graph.predecessors.length})
              </span>
            </div>

            <div className="space-y-2">
              {graph.predecessors.map((p) => (
                <div
                  key={p.activityId}
                  onClick={() => onSelectActivity && onSelectActivity(p.activityCode)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-cyan-400">{p.activityCode}</span>
                    <span className="font-mono text-[10px] text-slate-400">{p.dependencyType}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-500">Status: {p.status}</div>
                </div>
              ))}

              {graph.predecessors.length === 0 && (
                <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs italic">
                  No upstream schedule predecessors (Start Node)
                </div>
              )}
            </div>
          </div>

          {/* Tier 2: Selected Focus Node */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400 uppercase tracking-wider text-[11px]">
                2. Target Activity Focus
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-b from-cyan-950/80 to-slate-950 border-2 border-cyan-500 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-cyan-300 text-sm">{graph.activityCode}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  graph.confirmedDelayDays > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {graph.confirmedDelayDays > 0 ? `+${graph.confirmedDelayDays}d Delay` : 'On Schedule'}
                </span>
              </div>

              <div className="text-sm font-bold text-white leading-snug">{graph.activityName}</div>

              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800 pt-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discipline:</span>
                  <span>{graph.discipline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Critical Path:</span>
                  <span className={graph.isCritical ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                    {graph.isCritical ? 'YES' : 'NO'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier 3: Direct Downstream Successors */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
                3. Direct Successors ({graph.directSuccessors.length})
              </span>
            </div>

            <div className="space-y-2">
              {graph.directSuccessors.map((s) => (
                <div
                  key={s.activityId}
                  onClick={() => onSelectActivity && onSelectActivity(s.activityCode)}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-purple-400">{s.activityCode}</span>
                    <span className="text-[10px] font-mono text-slate-400">{s.dependencyType} (lag: {s.lag}d)</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium truncate">{s.name}</div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className={s.isCritical ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                      {s.isCritical ? 'Critical Path' : 'Non-critical'}
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      +{s.potentialStartDelayDays}d Risk Exposure
                    </span>
                  </div>
                </div>
              ))}

              {graph.directSuccessors.length === 0 && (
                <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-500 text-xs italic">
                  No downstream schedule successors (End Milestone)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Multi-tier Downstream Cascade Tree */}
        {graph.downstreamCascade.length > 0 && (
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">
                Multi-Tier Downstream Cascade Path ({graph.downstreamCascade.length} affected activities)
              </span>
              <span className="text-[11px] text-slate-400">Breadth-First Propagation Analysis</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {graph.downstreamCascade.map((c, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      Tier {c.depth}
                    </span>
                    <span className="font-mono text-purple-300 font-bold">{c.activityCode}</span>
                    <span className="text-slate-300 truncate max-w-sm">{c.name}</span>
                    {c.isCritical && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Critical
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-500 text-[11px]">{c.path.join(' → ')}</span>
                    <span className="text-amber-400 font-bold">+{c.potentialStartDelayDays}d potential delay</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
          >
            Close Graph View
          </button>
        </div>
      </div>
    </div>
  );
};
