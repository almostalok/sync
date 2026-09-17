'use client';

import React from 'react';
import { DelayCause, HistoricalOutcomeDTO } from '@sitesync/types';
import { 
  X, 
  Building2, 
  Layers, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  MapPin, 
  GitCommit
} from 'lucide-react';

interface Props {
  record: HistoricalOutcomeDTO | null;
  onClose: () => void;
}

export const HistoricalRecordDetailDrawer: React.FC<Props> = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50">
      <div className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 overflow-y-auto space-y-5 shadow-xl flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {record.projectId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {record.discipline}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified History</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {record.activityName}
              </h3>
              <div className="text-xs font-mono text-slate-500">
                {record.activityCode} • {record.wbsPath}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Project & Location Context */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Project Facility</div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{record.projectName}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">Location / Site</div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{record.location}</span>
              </div>
            </div>
          </div>

          {/* Planned vs Actual Duration & Timeline */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Execution Schedule & Variance
              </span>
              <span
                className={`font-mono font-bold ${
                  record.scheduleVariance > 0
                    ? 'text-rose-700'
                    : record.scheduleVariance < 0
                    ? 'text-emerald-700'
                    : 'text-slate-600'
                }`}
              >
                Variance: {record.scheduleVariance > 0 ? `+${record.scheduleVariance}` : record.scheduleVariance} days
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Planned */}
              <div className="space-y-1 p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Baseline Plan</div>
                <div className="font-mono text-slate-700">
                  {record.plannedStart} → {record.plannedEnd}
                </div>
                <div className="text-sm font-bold font-mono text-slate-900">
                  {record.plannedDuration} days
                </div>
              </div>

              {/* Actual */}
              <div className="space-y-1 p-2.5 rounded bg-white border border-slate-200">
                <div className="text-[10px] font-bold text-slate-700 uppercase">Verified Actual</div>
                <div className="font-mono text-slate-900 font-semibold">
                  {record.actualStart} → {record.actualEnd}
                </div>
                <div className="text-sm font-bold font-mono text-slate-900">
                  {record.actualDuration} days
                </div>
              </div>
            </div>
          </div>

          {/* Productivity Metric (if available) */}
          {record.productivityMetric && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Verified Productivity</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Qty: {record.actualQuantity} {record.quantityUnit}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900">
                {record.productivityMetric} {record.productivityUnit}
              </div>
            </div>
          )}

          {/* Delay Cause & Root-Cause Statement */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Documented Delay Root-Cause
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {record.delayCause}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-2.5 rounded border border-slate-200">
              &ldquo;{record.evidenceQuotedText}&rdquo;
            </p>
          </div>

          {/* Backward Evidence Chain & Lineage */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <GitCommit className="w-4 h-4 text-slate-600" />
              <span>Backward Data Lineage & Audit Trail</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Historical Outcome Record</div>
                  <div className="text-[10px] font-mono text-slate-500">{record.id}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Verified Schedule Activity</div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {record.activityCode} (100% Verified Progress)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">Field Evidence Citation</div>
                  <div className="text-[10px] font-mono text-slate-600">
                    {record.evidenceSourceDocument} ({record.evidenceReference})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Metadata */}
          <div className="p-3 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5 text-slate-500 font-mono">
            <div>Data Quality Status: <strong className="text-emerald-700">VERIFIED_COMPLETE</strong></div>
            <div>Start Verified: True | End Verified: True | Planner Review: True</div>
            <div>Institutional Ingestion Timestamp: {String(record.createdAt)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
