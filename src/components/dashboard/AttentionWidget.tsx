'use client';

import React from 'react';
import { AttentionRequiredDTO } from '@sitesync/types';
import { AlertTriangle, FileQuestion, ArrowRight, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';

interface AttentionWidgetProps {
  attention: AttentionRequiredDTO;
  onOpenReviewQueue?: () => void;
  onOpenUnmatchedQueue?: () => void;
}

export const AttentionWidget: React.FC<AttentionWidgetProps> = ({
  attention,
  onOpenReviewQueue,
  onOpenUnmatchedQueue,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Review Required Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-amber-500/20 p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Review Required Queue
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {attention.totalReviewCount} Pending
            </span>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            Field execution updates requiring human verification prior to updating authoritative schedule baselines:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-rose-500/20 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-rose-400">High Priority</div>
              <div className="text-lg font-black text-white font-mono">{attention.priorityBreakdown.high}</div>
              <div className="text-[9px] text-slate-400">Critical / Low Conf</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-amber-500/20 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-amber-400">Medium Priority</div>
              <div className="text-lg font-black text-white font-mono">{attention.priorityBreakdown.medium}</div>
              <div className="text-[9px] text-slate-400">Ambiguous Top-2</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-700/50 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Low Priority</div>
              <div className="text-lg font-black text-white font-mono">{attention.priorityBreakdown.low}</div>
              <div className="text-[9px] text-slate-400">Routine Non-critical</div>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReviewQueue}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95 mt-2"
        >
          <span>Open Review Workstation ({attention.totalReviewCount})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Unmatched Events Card */}
      <div className="rounded-2xl bg-slate-900/90 border border-purple-500/20 p-5 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/15 text-purple-400">
                <FileQuestion className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Unmatched Field Events
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {attention.unmatchedCount} Events
            </span>
          </div>

          <p className="text-xs text-slate-300/90 leading-relaxed">
            Reported activities with no acceptable match candidate in the imported schedule:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-purple-300 truncate">Potential New</div>
              <div className="text-lg font-black text-white font-mono">{attention.unmatchedBreakdown.potentialNewActivities}</div>
              <div className="text-[9px] text-slate-400">Extra-scope work</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-purple-300 truncate">Insufficient Info</div>
              <div className="text-lg font-black text-white font-mono">{attention.unmatchedBreakdown.insufficientInformation}</div>
              <div className="text-[9px] text-slate-400">Missing details</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-0.5">
              <div className="text-[10px] uppercase font-bold text-purple-300 truncate">Out of Scope</div>
              <div className="text-lg font-black text-white font-mono">{attention.unmatchedBreakdown.outOfScope}</div>
              <div className="text-[9px] text-slate-400">Excluded packages</div>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenUnmatchedQueue || onOpenReviewQueue}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-semibold text-xs transition active:scale-95 mt-2"
        >
          <span>Triage Unmatched Events ({attention.unmatchedCount})</span>
          <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>
    </div>
  );
};
