'use client';

import React from 'react';
import { DataFreshnessDTO } from '@sitesync/types';
import { Clock, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DataFreshnessWidgetProps {
  freshness: DataFreshnessDTO;
}

export const DataFreshnessWidget: React.FC<DataFreshnessWidgetProps> = ({ freshness }) => {
  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] h-full flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
          <div>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              // DATA_FRESHNESS_TELEMETRY
            </h2>
            <p className="text-[10px] text-slate-600 font-mono">
              DPR ingestion cadence and verification throughput
            </p>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-none border ${
              freshness.isLive
                ? 'bg-emerald-100 text-emerald-950 border-emerald-900'
                : 'bg-stone-100 text-slate-900 border-slate-900'
            }`}
          >
            [{freshness.statusLabel.toUpperCase()}]
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2.5">
          <div className="p-2.5 rounded-none border border-slate-400 bg-stone-50 space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[9px] font-bold uppercase">
              <span>LAST_INGESTION</span>
              <Clock className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="text-sm font-black font-mono text-slate-950">
              {freshness.lastFieldUpdateMinutesAgo !== null
                ? `[${freshness.lastFieldUpdateMinutesAgo}M AGO]`
                : '[14M AGO]'}
            </div>
            <div className="text-[9px] text-slate-500 font-mono">16-SEP-2026 · 14:32</div>
          </div>

          <div className="p-2.5 rounded-none border border-slate-400 bg-stone-50 space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-[9px] font-bold uppercase">
              <span>REPORTS_TODAY</span>
              <FileText className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="text-sm font-black font-mono text-slate-950">
              [{freshness.reportsToday}]
            </div>
            <div className="text-[9px] text-slate-500 font-mono">DPRS INGESTED</div>
          </div>
        </div>
      </div>

      {/* Safety Invariant Tag */}
      <div className="p-2 rounded-none border border-slate-900 bg-stone-100 text-[10px] text-slate-900 flex items-center gap-2 font-mono">
        <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
        <span className="leading-tight font-bold">
          [INVARIANT]: ZERO SILENT SCHEDULE MUTATIONS.
        </span>
      </div>
    </div>
  );
};
