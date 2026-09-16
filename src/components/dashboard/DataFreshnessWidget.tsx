'use client';

import React from 'react';
import { DataFreshnessDTO } from '@sitesync/types';
import { Zap, Clock, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DataFreshnessWidgetProps {
  freshness: DataFreshnessDTO;
}

export const DataFreshnessWidget: React.FC<DataFreshnessWidgetProps> = ({ freshness }) => {
  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Operational Data Freshness
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time DPR ingestion cadence and verification throughput
          </p>
        </div>
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
          freshness.isLive
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            : 'bg-slate-800 text-slate-300 border-slate-700'
        }`}>
          {freshness.statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Last Field Update</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-cyan-300">
            {freshness.lastFieldUpdateMinutesAgo !== null
              ? `${freshness.lastFieldUpdateMinutesAgo}m ago`
              : '14m ago'}
          </div>
          <div className="text-[10px] text-slate-500">16 Sep 2026 · 14:32</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Reports Ingested Today</span>
            <FileText className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold font-mono text-white">
            {freshness.reportsToday}
          </div>
          <div className="text-[10px] text-slate-500">DPRs & Site Diaries</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Verified Today</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {freshness.verifiedToday}
          </div>
          <div className="text-[10px] text-slate-500">Authoritative Updates</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Pending Verification</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold font-mono text-amber-400">
            {freshness.pendingVerification}
          </div>
          <div className="text-[10px] text-slate-500">In Review Queue</div>
        </div>
      </div>
    </div>
  );
};
