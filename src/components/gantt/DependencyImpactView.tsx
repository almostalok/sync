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
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white border border-slate-300 rounded-lg p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-slate-100 text-slate-700">
                <GitBranch className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold text-white bg-[#0f2744] px-2 py-0.5 rounded">
                {graph.activityCode}
              </span>
              <span className="text-xs uppercase font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {graph.discipline}
              </span>
              {graph.isCritical && (
                <span className="text-[10px] font-bold uppercase bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded">
                  Critical Path
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{graph.activityName}</h3>
            <p className="text-xs text-slate-500">
              Dependency Network &amp; Multi-level Delay Propagation Intelligence
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Tier Dependency Propagation Chain */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Predecessors */}
          <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Predecessors</span>
              <span className="text-xs font-mono font-bold text-slate-500">{graph.predecessors.length}</span>
            </div>

            {graph.predecessors.length > 0 ? (
              <div className="space-y-2">
                {graph.predecessors.map((p) => (
                  <div
                    key={p.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(p.activityCode)}
                    className="p-2.5 rounded bg-white border border-slate-200 hover:border-slate-400 cursor-pointer space-y-1 text-xs transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700">{p.activityCode}</span>
                      <span className="text-[10px] font-mono text-slate-500">{p.dependencyType}</span>
                    </div>
                    <div className="text-slate-800 font-medium truncate">{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Variance: {p.varianceDays > 0 ? `+${p.varianceDays}d` : `${p.varianceDays}d`}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Root Node (No Predecessors)</div>
            )}
          </div>

          {/* Column 2: Current Focus Node */}
          <div className="p-4 rounded border-2 border-blue-600 bg-blue-50/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="text-xs font-bold text-blue-900 uppercase">Active Focus Node</span>
                <span className="text-xs font-mono font-bold text-blue-800">In Scope</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="font-mono font-bold text-slate-900 text-sm">{graph.activityCode}</div>
                <div className="text-slate-800 font-medium">{graph.activityName}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-white border border-blue-200">
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Variance</span>
                    <strong className="text-slate-900">{graph.varianceDays > 0 ? `+${graph.varianceDays}d` : `${graph.varianceDays}d`}</strong>
                  </div>
                  <div className="p-2 rounded bg-white border border-blue-200">
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Confirmed Delay</span>
                    <strong className="text-red-700">+{graph.confirmedDelayDays} Days</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded bg-white border border-blue-200 text-[11px] text-blue-950 font-medium">
              Delay Status: {graph.confirmedDelayDays > 0 ? `${graph.confirmedDelayDays}d delay propagating` : 'Float intact'}
            </div>
          </div>

          {/* Column 3: Direct Successors & Cascade Impact */}
          <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase">Direct Successors</span>
              <span className="text-xs font-mono font-bold text-slate-500">{graph.directSuccessors.length}</span>
            </div>

            {graph.directSuccessors.length > 0 ? (
              <div className="space-y-2">
                {graph.directSuccessors.map((s) => (
                  <div
                    key={s.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(s.activityCode)}
                    className="p-2.5 rounded bg-white border border-slate-200 hover:border-slate-400 cursor-pointer space-y-1 text-xs transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-700">{s.activityCode}</span>
                      <span className="text-[10px] font-mono text-slate-500">{s.dependencyType}</span>
                    </div>
                    <div className="text-slate-800 font-medium truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {s.isCritical ? <span className="text-red-700 font-bold">Critical Path</span> : 'Non-critical'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">Terminal Node (No Successors)</div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
