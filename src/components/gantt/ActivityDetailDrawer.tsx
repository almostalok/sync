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
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-slate-300 shadow-2xl flex flex-col justify-between overflow-hidden">
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#0f2744] text-white">
              {activity.activityCode}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-slate-200 text-slate-700">
              {activity.discipline}
            </span>
            {activity.isCritical && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-900 border border-red-300">
                Critical Path
              </span>
            )}
            {activity.isStale && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Stale (&gt;48h)
              </span>
            )}
          </div>

          <h2 className="text-base font-bold text-slate-900 leading-tight">
            {activity.name}
          </h2>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {activity.wbsPath}
            </span>
            {activity.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {activity.location}
                </span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
        {/* Progress & Variance Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Verified Progress</div>
            <div className="text-lg font-bold font-mono text-emerald-800">{activity.actualProgress}%</div>
            <div className="text-[10px] text-slate-500">Plan: {activity.plannedProgress}%</div>
          </div>

          <div className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Start Variance</div>
            <div className={`text-lg font-bold font-mono ${activity.startVarianceDays > 0 ? 'text-amber-800' : 'text-slate-800'}`}>
              {activity.startVarianceDays > 0 ? `+${activity.startVarianceDays}d` : `${activity.startVarianceDays}d`}
            </div>
            <div className="text-[10px] text-slate-500">vs Baseline Start</div>
          </div>

          <div className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Finish Variance</div>
            <div className={`text-lg font-bold font-mono ${activity.endVarianceDays > 0 ? 'text-red-800' : 'text-slate-800'}`}>
              {activity.endVarianceDays > 0 ? `+${activity.endVarianceDays}d` : `${activity.endVarianceDays}d`}
            </div>
            <div className="text-[10px] text-slate-500">vs Baseline Finish</div>
          </div>

          <div className="p-2.5 rounded border border-slate-200 bg-slate-50 space-y-0.5">
            <div className="text-[10px] uppercase font-bold text-slate-500">Duration Variance</div>
            <div className="text-lg font-bold font-mono text-slate-900">{activity.durationVarianceDays}d</div>
            <div className="text-[10px] text-slate-500">{activity.isCritical ? 'Zero Float (Critical)' : 'Buffer remaining'}</div>
          </div>
        </div>

        {/* Schedule Baseline vs Actuals Table */}
        <div className="p-3.5 rounded border border-slate-200 bg-white space-y-2">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Schedule Dates & Milestones</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Planned Baseline</span>
              <div className="text-slate-700">Start: <strong>{activity.plannedStart}</strong></div>
              <div className="text-slate-700">Finish: <strong>{activity.plannedEnd}</strong></div>
              <div className="text-slate-500 text-[11px]">Duration: {activity.plannedDuration} days</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Verified Actuals</span>
              <div className="text-emerald-800">Start: <strong>{activity.actualStart || 'Not started'}</strong></div>
              <div className="text-emerald-800">Finish: <strong>{activity.actualEnd || 'In progress'}</strong></div>
              <div className="text-slate-500 text-[11px]">
                {activity.actualDuration ? `${activity.actualDuration} days elapsed` : 'Active'}
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Provenance Records */}
        <div className="space-y-2">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Supporting Field Evidence ({activity.evidenceChain?.length || 0})</span>
            </span>
          </div>

          {activity.evidenceChain && activity.evidenceChain.length > 0 ? (
            <div className="space-y-2">
              {activity.evidenceChain.map((ev, idx) => (
                <div key={idx} className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-blue-700">{ev.sourceLocator}</span>
                    <span className="text-slate-500 font-mono">{ev.reportedDate}</span>
                  </div>
                  <p className="text-slate-700 italic border-l-2 border-slate-300 pl-2 text-[11px]">
                    “{ev.quotedText}”
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Verified by: {ev.verifiedBy}</span>
                    <span className="font-mono font-bold text-slate-600">Reported: {ev.progressPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded border border-slate-200 bg-slate-50 text-slate-500 text-xs">
              No verified DPR evidence linked to this activity yet.
            </div>
          )}
        </div>

        {/* Dependencies (Predecessors & Successors) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Predecessors */}
          <div className="p-3 rounded border border-slate-200 bg-white space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Predecessors</span>
              <span className="font-mono">{activity.predecessors.length}</span>
            </div>
            {activity.predecessors.length > 0 ? (
              <div className="space-y-1.5">
                {activity.predecessors.map((p) => (
                  <div
                    key={p.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(p.activityId)}
                    className="p-1.5 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate pr-1">
                      <div className="font-mono font-bold text-blue-700">{p.activityCode}</div>
                      <div className="text-slate-600 truncate">{p.activityName}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{p.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">No predecessors (Root node)</div>
            )}
          </div>

          {/* Successors */}
          <div className="p-3 rounded border border-slate-200 bg-white space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
              <span>Successors</span>
              <span className="font-mono">{activity.successors.length}</span>
            </div>
            {activity.successors.length > 0 ? (
              <div className="space-y-1.5">
                {activity.successors.map((s) => (
                  <div
                    key={s.activityId}
                    onClick={() => onSelectActivity && onSelectActivity(s.activityId)}
                    className="p-1.5 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate pr-1">
                      <div className="font-mono font-bold text-blue-700">{s.activityCode}</div>
                      <div className="text-slate-600 truncate">{s.activityName}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{s.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-[11px]">No successors (Terminal node)</div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded border border-slate-300 hover:bg-white text-slate-700 font-semibold text-xs transition"
        >
          Close Drawer
        </button>

        {onOpenDependencyGraph && (
          <button
            onClick={() => onOpenDependencyGraph(activity.activityCode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0f2744] hover:bg-[#1a365d] text-white font-semibold text-xs shadow-sm transition"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Trace Dependency Network</span>
          </button>
        )}
      </div>
    </div>
  );
};
