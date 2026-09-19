'use client';

import React from 'react';
import { DataFreshnessDTO } from '@sitesync/types';
import { Clock, FileText, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../../../packages/design-system/components/StatusBadge';

interface DataFreshnessWidgetProps {
  freshness: DataFreshnessDTO;
}

export const DataFreshnessWidget: React.FC<DataFreshnessWidgetProps> = ({ freshness }) => {
  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-4 shadow-[2px_2px_0px_#0f172a] h-full flex flex-col justify-between font-mono border-t-4 border-t-emerald-600">
      <div>
        <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-600 border border-slate-900 inline-block animate-pulse"></span>
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                {'// DATA_FRESHNESS_TELEMETRY'}
              </h2>
            </div>
            <p className="text-[10px] text-slate-600 font-mono">
              DPR ingestion cadence and verification throughput
            </p>
          </div>
          <StatusBadge
            status={freshness.isLive ? 'verified' : 'neutral'}
            label={freshness.statusLabel.toUpperCase()}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3">
          <div className="p-2.5 rounded-none border border-slate-400 bg-emerald-50/40 space-y-1">
            <div className="flex items-center justify-between text-emerald-950 text-[9px] font-bold uppercase">
              <span>LAST_INGESTION</span>
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-base font-black font-mono text-emerald-950 tabular-nums">
              {freshness.lastFieldUpdateMinutesAgo !== null
                ? `[${freshness.lastFieldUpdateMinutesAgo}M AGO]`
                : '[14M AGO]'}
            </div>
            <div className="text-[9px] text-emerald-800 font-mono">16-SEP-2026 · 14:32</div>
          </div>

          <div className="p-2.5 rounded-none border border-slate-400 bg-blue-50/40 space-y-1">
            <div className="flex items-center justify-between text-blue-950 text-[9px] font-bold uppercase">
              <span>REPORTS_TODAY</span>
              <FileText className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="text-base font-black font-mono text-blue-950 tabular-nums">
              [{freshness.reportsToday}]
            </div>
            <div className="text-[9px] text-blue-800 font-mono">DPRS INGESTED</div>
          </div>
        </div>
      </div>

      {/* Safety Invariant Tag */}
      <div className="p-2 rounded-none border-[1.5px] border-slate-900 bg-amber-100 text-[10px] text-slate-950 flex items-center gap-2 font-mono shadow-[1px_1px_0px_#000]">
        <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
        <span className="leading-tight font-bold">
          [SAFETY_INVARIANT]: ZERO SILENT SCHEDULE MUTATIONS ALLOWED.
        </span>
      </div>
    </div>
  );
};
