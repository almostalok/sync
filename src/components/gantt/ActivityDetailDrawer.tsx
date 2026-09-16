'use client';

import React from 'react';
import { ActivityDetailDTO, ActivityStatus, DependencyType } from '@sitesync/types';
import {
  X,
  Calendar,
  Clock,
  Layers,
  FileText,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin,
  History,
} from 'lucide-react';

interface ActivityDetailDrawerProps {
  activity: ActivityDetailDTO;
  onClose: () => void;
  onOpenDependencyGraph?: (activityId: string) => void;
  onSelectActivity?: (activityId: string) => void;
}

export const ActivityDetailDrawer: React.FC<ActivityDetailDrawerProps> = ({
  activity,
  onClose,
  onOpenDependencyGraph,
  onSelectActivity,
}) => {
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              {activity.activityCode}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-slate-800 text-slate-300">
              {activity.discipline}
            </span>
            {activity.isCritical && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Critical Path
              </span>
            )}
            {activity.isStale && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Stale (&gt;48h)
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-white leading-tight">
            {activity.name}
          </h2>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              {activity.wbsPath}
            </span>
            {activity.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {activity.location}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
        {/* Progress & Variance Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Progress</div>
            <div className="text-xl font-black font-mono text-emerald-400">{activity.actualProgress}%</div>
            <div className="text-[10px] text-slate-500">Plan: {activity.plannedProgress}%</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Start Variance</div>
            <div className={`text-xl font-black font-mono ${activity.startVarianceDays > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activity.startVarianceDays > 0 ? `+${activity.startVarianceDays}d` : `${activity.startVarianceDays}d`}
            </div>
            <div className="text-[10px] text-slate-500">vs Planned Start</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Planned Duration</div>
            <div className="text-xl font-black font-mono text-cyan-300">{activity.plannedDuration}d</div>
            <div className="text-[10px] text-slate-500">Baseline Workdays</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
            <div className="text-sm font-bold font-mono text-white mt-1">{activity.status}</div>
            <div className="text-[10px] text-slate-500">Execution State</div>
          </div>
        </div>

        {/* Schedule Baseline vs Actuals */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Timeline Dates &amp; Milestone Reconciliation</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1 text-slate-300 font-mono">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Planned Window</span>
              <span>{activity.plannedStart} → {activity.plannedEnd}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Actual Window</span>
              <span className="text-emerald-400">
                {activity.actualStart || 'Not Started'} → {activity.actualEnd || 'In Progress'}
              </span>
            </div>
          </div>
        </div>

        {/* Verified Evidence Chain */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Verified DPR Evidence Chain</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              First-class Evidence
            </span>
          </div>

          {activity.evidenceChain.map((ev) => (
            <div key={ev.evidenceId} className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono font-bold text-emerald-400">{ev.sourceLocator}</span>
                <span className="text-slate-400 font-mono">{ev.reportedDate.slice(0, 10)}</span>
              </div>
              <p className="text-slate-200 italic bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                &quot;{ev.quotedText}&quot;
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Verified by: <strong className="text-slate-300">{ev.verifiedBy}</strong></span>
                <span className="font-mono font-bold text-emerald-400">{ev.progressPercentage}% Progress Verified</span>
              </div>
            </div>
          ))}
        </div>

        {/* Dependencies (Predecessors & Successors) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <span>Dependency Network ({activity.predecessors.length} In / {activity.successors.length} Out)</span>
            </div>
            {onOpenDependencyGraph && (
              <button
                onClick={() => onOpenDependencyGraph(activity.activityCode)}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Interactive Graph</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Predecessors */}
          {activity.predecessors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Predecessors (Upstream)</span>
              <div className="space-y-1">
                {activity.predecessors.map((p) => (
                  <div
                    key={p.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(p.activityCode)}
                    className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-cyan-400">{p.activityCode}</span>
                      <span className="text-slate-300 truncate max-w-xs">{p.activityName}</span>
                    </div>
                    <span className="font-mono text-emerald-400">{p.actualProgress}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Successors */}
          {activity.successors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">Successors (Downstream Impact)</span>
              <div className="space-y-1">
                {activity.successors.map((s) => (
                  <div
                    key={s.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(s.activityCode)}
                    className="p-2 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-purple-400">{s.activityCode}</span>
                      <span className="text-slate-300 truncate max-w-xs">{s.activityName}</span>
                      {s.isCritical && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Critical
                        </span>
                      )}
                    </div>
                    {s.potentialStartDelayDays > 0 ? (
                      <span className="font-mono text-rose-400 font-bold">+{s.potentialStartDelayDays}d Risk</span>
                    ) : (
                      <span className="text-slate-500 font-mono">0d lag</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
        {onOpenDependencyGraph && (
          <button
            onClick={() => onOpenDependencyGraph(activity.activityCode)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-200 font-bold text-xs shadow-md transition active:scale-95"
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>Trace Cascade Delay</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
