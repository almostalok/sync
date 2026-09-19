'use client';

import React from 'react';
import { AttentionRequiredDTO } from '@sitesync/types';
import { AlertTriangle, FileQuestion, ArrowRight } from 'lucide-react';

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
      <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between border-t-4 border-t-amber-500">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 border border-slate-900 bg-amber-400 text-black">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                  {'// REVIEW_REQUIRED_QUEUE'}
                </h2>
                <span className="text-[10px] text-slate-600 font-mono">
                  Field DPR extractions awaiting planner sign-off
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-black bg-amber-400 text-black border border-slate-900 shadow-[1px_1px_0px_#000]">
              [{attention.totalReviewCount} PENDING]
            </span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Deterministic matching flagged {attention.totalReviewCount} DPR progress claims requiring authoritative schedule sign-off before baseline recalculation:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
            <button
              type="button"
              onClick={onOpenReviewQueue}
              className="p-2 border-[1.5px] border-rose-800 bg-rose-50 hover:bg-rose-100 text-center space-y-0.5 transition active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="text-[9px] uppercase font-bold text-rose-950">HIGH_PRIO</div>
              <div className="text-lg font-black text-rose-950 font-mono tabular-nums">[{attention.priorityBreakdown.high}]</div>
              <div className="text-[9px] text-rose-800 font-sans">Critical Path</div>
            </button>

            <button
              type="button"
              onClick={onOpenReviewQueue}
              className="p-2 border-[1.5px] border-amber-800 bg-amber-50 hover:bg-amber-100 text-center space-y-0.5 transition active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="text-[9px] uppercase font-bold text-amber-950">MED_PRIO</div>
              <div className="text-lg font-black text-amber-950 font-mono tabular-nums">[{attention.priorityBreakdown.medium}]</div>
              <div className="text-[9px] text-amber-800 font-sans">Multi-Candidate</div>
            </button>

            <button
              type="button"
              onClick={onOpenReviewQueue}
              className="p-2 border-[1.5px] border-slate-700 bg-stone-100 hover:bg-stone-200 text-center space-y-0.5 transition active:translate-x-[1px] active:translate-y-[1px]"
            >
              <div className="text-[9px] uppercase font-bold text-slate-900">LOW_PRIO</div>
              <div className="text-lg font-black text-slate-950 font-mono tabular-nums">[{attention.priorityBreakdown.low}]</div>
              <div className="text-[9px] text-slate-600 font-sans">Routine Works</div>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onOpenReviewQueue}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-none bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
          >
            <span>[OPEN_REVIEW_WORKSTATION: {attention.totalReviewCount}_ITEMS]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Unmatched Events Card */}
      <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] flex flex-col justify-between border-t-4 border-t-purple-600">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 border border-slate-900 bg-purple-200 text-purple-950">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                  {'// UNMATCHED_FIELD_EVENTS'}
                </h2>
                <span className="text-[10px] text-slate-600 font-mono">
                  Field activities without authoritative baseline WBS map
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-none text-[10px] font-mono font-black bg-purple-200 text-purple-950 border border-slate-900 shadow-[1px_1px_0px_#000]">
              [{attention.unmatchedCount} UNLINKED]
            </span>
          </div>

          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Reported DPR activities that cannot be correlated to existing baseline WBS activities (possible new scope or contractor out-of-sequence work):
          </p>

          <div className="p-3 border-[1.5px] border-purple-300 bg-purple-50/50 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between font-bold text-slate-950">
              <span className="text-[11px]">POTENTIAL_SCOPE_ADDITIONS:</span>
              <span className="font-mono font-black text-purple-950 text-sm tabular-nums">[{attention.unmatchedCount}]</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[9px] bg-amber-100 text-amber-950 border border-amber-400 px-1.5 py-0.5 font-bold">
                OUT_OF_SEQUENCE: 9
              </span>
              <span className="text-[9px] bg-rose-100 text-rose-950 border border-rose-400 px-1.5 py-0.5 font-bold">
                NEW_SCOPE: 6
              </span>
              <span className="text-[9px] bg-blue-100 text-blue-950 border border-blue-400 px-1.5 py-0.5 font-bold">
                CODE_MISMATCH: 3
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={onOpenUnmatchedQueue}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-none bg-stone-100 hover:bg-stone-200 text-slate-950 font-bold text-xs uppercase tracking-wider border-[1.5px] border-slate-900 shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition"
          >
            <span>[TRIAGE_UNMATCHED_EVENTS: {attention.unmatchedCount}]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
