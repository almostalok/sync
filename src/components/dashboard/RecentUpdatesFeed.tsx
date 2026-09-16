'use client';

import React from 'react';
import { Discipline } from '@sitesync/types';
import { Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';

export interface FieldUpdateItem {
  id: string;
  time: string;
  discipline: Discipline | string;
  activityCode: string;
  activityName: string;
  progress: number;
  status: 'VERIFIED' | 'REVIEW_REQUIRED';
  verifiedBy?: string;
  documentName: string;
  pageNumber?: number;
  quotedText?: string;
}

interface RecentUpdatesFeedProps {
  updates?: FieldUpdateItem[];
  onSelectActivity?: (activityCode: string) => void;
  onOpenReview?: (updateId: string) => void;
}

export const RecentUpdatesFeed: React.FC<RecentUpdatesFeedProps> = ({
  updates,
  onSelectActivity,
  onOpenReview,
}) => {
  const defaultUpdates: FieldUpdateItem[] = [
    {
      id: 'UPD-01',
      time: '14:32',
      discipline: Discipline.CIVIL,
      activityCode: 'CIV-EXC-042',
      activityName: 'Compressor foundation excavation',
      progress: 85,
      status: 'VERIFIED',
      verifiedBy: 'Er. R. Borah (Planner)',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 4,
      quotedText: 'Compressor foundation excavation completed approximately 85%.',
    },
    {
      id: 'UPD-02',
      time: '13:58',
      discipline: Discipline.PIPING,
      activityCode: 'PIP-FAB-101',
      activityName: 'Header pipe spool fabrication',
      progress: 100,
      status: 'VERIFIED',
      verifiedBy: 'Er. R. Borah (Planner)',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 3,
      quotedText: 'Header pipe spool cutting and fabrication 100% completed.',
    },
    {
      id: 'UPD-03',
      time: '12:41',
      discipline: Discipline.ELECTRICAL,
      activityCode: 'ELE-CBL-005',
      activityName: 'Cable trench excavation',
      progress: 40,
      status: 'REVIEW_REQUIRED',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 2,
      quotedText: 'Substation cable trench work initiated by electrical contractor.',
    },
    {
      id: 'UPD-04',
      time: '11:15',
      discipline: Discipline.MECHANICAL,
      activityCode: 'MEC-EQP-201',
      activityName: 'Suction scrubber nozzle alignment',
      progress: 50,
      status: 'VERIFIED',
      verifiedBy: 'Er. R. Borah (Planner)',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 5,
      quotedText: 'Suction scrubber skid placed on foundation, nozzle alignment underway.',
    },
  ];

  const items = updates && updates.length > 0 ? updates : defaultUpdates;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Clock className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Recent Field Updates
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Live chronological stream of DPR extractions and planner verifications
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Real-time Feed
        </span>
      </div>

      <div className="space-y-2.5 pt-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-slate-400 font-bold">{item.time}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-slate-800 text-slate-300">
                  {item.discipline}
                </span>
                <span className="font-mono font-semibold text-cyan-400 cursor-pointer hover:underline" onClick={() => onSelectActivity && onSelectActivity(item.activityCode)}>
                  {item.activityCode}
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-semibold text-white truncate max-w-sm">
                  {item.activityName}
                </span>
              </div>

              {item.quotedText && (
                <div className="text-[11px] text-slate-400 italic line-clamp-1 pl-1 border-l-2 border-slate-700">
                  &quot;{item.quotedText}&quot;
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span>Source: <strong className="text-slate-400">{item.documentName} {item.pageNumber ? `(P. ${item.pageNumber})` : ''}</strong></span>
                {item.verifiedBy && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.verifiedBy}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <div className="text-right">
                <div className="text-base font-black font-mono text-emerald-400">{item.progress}%</div>
                <div className="text-[10px] text-slate-400">
                  {item.status === 'VERIFIED' ? 'Verified' : 'Review Req.'}
                </div>
              </div>

              {item.status === 'REVIEW_REQUIRED' ? (
                <button
                  onClick={() => onOpenReview && onOpenReview(item.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-[11px] transition"
                >
                  Verify
                </button>
              ) : (
                <button
                  onClick={() => onSelectActivity && onSelectActivity(item.activityCode)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition"
                  title="Inspect Activity Details"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
