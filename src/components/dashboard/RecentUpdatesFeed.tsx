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
      time: '12:15',
      discipline: Discipline.MECHANICAL,
      activityCode: 'MEC-EQP-012',
      activityName: 'Compressor foundation anchor bolt verification',
      progress: 60,
      status: 'REVIEW_REQUIRED',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 5,
      quotedText: 'Anchor bolts positioning checked against civil baseline. 60% torqued.',
    },
    {
      id: 'UPD-04',
      time: '11:00',
      discipline: Discipline.ELECTRICAL,
      activityCode: 'ELE-CAB-205',
      activityName: 'Substation control cable trenching',
      progress: 40,
      status: 'VERIFIED',
      verifiedBy: 'Er. R. Borah (Planner)',
      documentName: 'DPR-2026-09-16.pdf',
      pageNumber: 6,
      quotedText: 'Cable trenching excavated 120m out of 300m total run.',
    },
  ];

  const items = updates || defaultUpdates;

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] font-mono">
      <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
        <div>
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
            {'// RECENT_VERIFIED_FIELD_INGESTIONS'}
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
            Chronological audit feed of daily field reports parsed into schedule activities
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((upd) => {
          const isVerified = upd.status === 'VERIFIED';

          return (
            <div
              key={upd.id}
              className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-stone-100 px-1 border border-slate-300">[{upd.time}]</span>
                  <span className="font-mono text-[10px] font-bold text-slate-900 uppercase">
                    DISC: {upd.discipline}
                  </span>
                  <span className="text-slate-400">|</span>
                  <button
                    onClick={() => onSelectActivity && onSelectActivity(upd.activityCode)}
                    className="font-mono font-bold text-slate-950 underline hover:bg-amber-100"
                  >
                    [{upd.activityCode}]
                  </button>
                  <span className="text-slate-900 font-bold truncate uppercase">{upd.activityName}</span>
                </div>

                {upd.quotedText && (
                  <p className="text-[11px] text-slate-700 italic pl-2 border-l-2 border-slate-900 font-sans">
                    &quot;{upd.quotedText}&quot;
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                  <span>SRC: [{upd.documentName}]</span>
                  {upd.pageNumber && <span>· PG_{upd.pageNumber}</span>}
                  {upd.verifiedBy && <span>· AUTH: {upd.verifiedBy}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-black text-slate-950">{upd.progress}%</div>
                  <span
                    className={`inline-block px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      isVerified
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                        : 'bg-amber-300 text-black border-slate-900'
                    }`}
                  >
                    [{isVerified ? 'VERIFIED' : 'ACTION_REQ'}]
                  </span>
                </div>

                {!isVerified && onOpenReview && (
                  <button
                    onClick={() => onOpenReview(upd.id)}
                    className="p-1 rounded-none border border-slate-900 hover:bg-stone-200 text-slate-900 active:translate-x-[1px] active:translate-y-[1px]"
                    title="Review item"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
