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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
      {/* 1. Review Required Card */}
      <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 border border-slate-900 bg-amber-300 text-black">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                {'// REVIEW_REQUIRED_QUEUE'}
              </h2>
            </div>
            <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold bg-amber-300 text-black border border-slate-900">
              [{attention.totalReviewCount} PENDING]
            </span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Field execution updates requiring planner verification prior to updating authoritative schedule baselines:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
            <div className="p-2 border border-red-800 bg-red-100 text-center space-y-0.5">
              <div className="text-[9px] uppercase font-bold text-red-950">HIGH_PRIO</div>
              <div className="text-base font-black text-red-950 font-mono">[{attention.priorityBreakdown.high}]</div>
              <div className="text-[9px] text-red-800 font-sans">Critical Path</div>
            </div>

            <div className="p-2 border border-amber-800 bg-amber-100 text-center space-y-0.5">
              <div className="text-[9px] uppercase font-bold text-amber-950">MED_PRIO</div>
              <div className="text-base font-black text-amber-950 font-mono">[{attention.priorityBreakdown.medium}]</div>
              <div className="text-[9px] text-amber-800 font-sans">Ambiguous Match</div>
            </div>

            <div className="p-2 border border-slate-400 bg-stone-100 text-center space-y-0.5">
              <div className="text-[9px] uppercase font-bold text-slate-800">LOW_PRIO</div>
              <div className="text-base font-black text-slate-950 font-mono">[{attention.priorityBreakdown.low}]</div>
              <div className="text-[9px] text-slate-600 font-sans">Routine Works</div>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenReviewQueue}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-none bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition mt-2"
        >
          <span>[OPEN_REVIEW_WORKSTATION: {attention.totalReviewCount}]</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Unmatched Events Card */}
      <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 border border-slate-900 bg-stone-200 text-slate-950">
                <FileQuestion className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                {'// UNMATCHED_FIELD_EVENTS'}
              </h2>
            </div>
            <span className="px-1.5 py-0.5 rounded-none text-[10px] font-mono font-bold bg-stone-200 text-slate-950 border border-slate-900">
              [{attention.unmatchedCount} UNLINKED]
            </span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Reported field activities that cannot be correlated to existing baseline WBS activities (possible new scope or contractor out-of-sequence work):
          </p>

          <div className="p-2.5 border border-slate-400 bg-stone-50 space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between font-bold text-slate-950">
              <span>POTENTIAL_SCOPE_ADDITIONS:</span>
              <span className="font-mono font-black">[{attention.unmatchedCount}]</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 text-[10px] border-t border-slate-200 pt-1">
              <span>RESOLUTION:</span>
              <span>MANUAL WBS LINKING / CHANGE ORDER</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenUnmatchedQueue}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-none border-[1.5px] border-slate-900 bg-stone-100 hover:bg-stone-200 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition mt-2"
        >
          <span>[INSPECT_UNMATCHED_EVENTS]</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
