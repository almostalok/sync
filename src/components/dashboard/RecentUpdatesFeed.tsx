'use client';

import React from 'react';
import { Discipline } from '@sitesync/types';
import { Clock, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { StatusBadge } from '../../../packages/design-system/components/StatusBadge';

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
  const [selectedDiscipline, setSelectedDiscipline] = React.useState<string>('ALL');

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

  const items = (updates || defaultUpdates).filter(
    (item) => selectedDiscipline === 'ALL' || item.discipline === selectedDiscipline
  );

  const getDisciplineTheme = (disc: Discipline | string) => {
    switch (disc) {
      case Discipline.CIVIL:
        return {
          border: 'border-l-[4px] border-l-amber-500 bg-amber-50/20',
          badge: 'bg-amber-100 text-amber-950 border-amber-500',
          bar: 'bg-amber-500',
        };
      case Discipline.PIPING:
        return {
          border: 'border-l-[4px] border-l-sky-500 bg-sky-50/20',
          badge: 'bg-sky-100 text-sky-950 border-sky-500',
          bar: 'bg-sky-500',
        };
      case Discipline.MECHANICAL:
        return {
          border: 'border-l-[4px] border-l-purple-500 bg-purple-50/20',
          badge: 'bg-purple-100 text-purple-950 border-purple-500',
          bar: 'bg-purple-500',
        };
      case Discipline.ELECTRICAL:
        return {
          border: 'border-l-[4px] border-l-yellow-500 bg-yellow-50/20',
          badge: 'bg-yellow-100 text-yellow-950 border-yellow-500',
          bar: 'bg-yellow-500',
        };
      default:
        return {
          border: 'border-l-[4px] border-l-slate-400 bg-stone-50/30',
          badge: 'bg-stone-100 text-slate-900 border-slate-400',
          bar: 'bg-slate-500',
        };
    }
  };

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3.5 shadow-[2px_2px_0px_#0f172a] font-mono border-t-4 border-t-blue-600">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b-[1.5px] border-slate-900 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 border border-slate-900 inline-block"></span>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// RECENT_VERIFIED_FIELD_INGESTIONS'}
            </h2>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            Chronological audit feed of daily field reports parsed into schedule activities
          </p>
        </div>

        {/* Discipline Filter Tabs */}
        <div className="flex items-center gap-1 text-xs">
          {['ALL', Discipline.CIVIL, Discipline.PIPING, Discipline.MECHANICAL, Discipline.ELECTRICAL].map((disc) => (
            <button
              key={disc}
              onClick={() => setSelectedDiscipline(disc)}
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase transition border ${
                selectedDiscipline === disc
                  ? 'bg-black text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-stone-100 text-slate-800 border-slate-300 hover:bg-stone-200'
              }`}
            >
              [{disc}]
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((upd) => {
          const isVerified = upd.status === 'VERIFIED';
          const theme = getDisciplineTheme(upd.discipline);

          return (
            <div
              key={upd.id}
              className={`p-3 rounded-none border border-slate-300 ${theme.border} hover:border-slate-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono shadow-[1px_1px_0px_#0f172a]`}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-stone-100 px-1.5 py-0.5 border border-slate-300">
                    [{upd.time}]
                  </span>
                  <span className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.5 border ${theme.badge}`}>
                    {upd.discipline}
                  </span>
                  <span className="text-slate-400">|</span>
                  <button
                    onClick={() => onSelectActivity && onSelectActivity(upd.activityCode)}
                    className="font-mono font-bold text-slate-950 underline hover:bg-amber-100 px-1"
                  >
                    [{upd.activityCode}]
                  </button>
                  <span className="text-slate-900 font-bold truncate uppercase font-sans">{upd.activityName}</span>
                </div>

                {upd.quotedText && (
                  <p className="text-[11px] text-slate-700 italic pl-2.5 border-l-2 border-slate-900 font-sans bg-white/70 py-0.5">
                    &quot;{upd.quotedText}&quot;
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 font-mono">
                  <span className="font-bold">SRC: [{upd.documentName}]</span>
                  {upd.pageNumber && <span>· PG_{upd.pageNumber}</span>}
                  {upd.verifiedBy && <span>· AUTH: {upd.verifiedBy}</span>}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-14 h-1.5 bg-stone-200 border border-slate-900 overflow-hidden">
                      <div
                        className={`h-full ${theme.bar}`}
                        style={{ width: `${upd.progress}%` }}
                      />
                    </div>
                    <span className="font-mono font-black text-slate-950 tabular-nums text-xs">
                      {upd.progress}%
                    </span>
                  </div>
                  <div>
                    <StatusBadge
                      status={isVerified ? 'verified' : 'warning'}
                      label={isVerified ? 'VERIFIED' : 'ACTION_REQ'}
                      size="sm"
                    />
                  </div>
                </div>

                {!isVerified && onOpenReview && (
                  <button
                    onClick={() => onOpenReview(upd.id)}
                    className="px-2 py-1 rounded-none border border-slate-900 bg-amber-300 hover:bg-amber-400 text-black font-bold text-[10px] uppercase flex items-center gap-1 shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                    title="Review item"
                  >
                    <span>[REVIEW]</span>
                    <ArrowRight className="w-3 h-3" />
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
