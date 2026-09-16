'use client';

import React, { useState, useEffect } from 'react';
import { HistoricalQualityReportDTO, ProjectClosureStatus } from '@sitesync/types';
import { 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Database, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProjectClosed?: () => void;
}

export const ProjectClosureModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProjectClosed,
}) => {
  const [report, setReport] = useState<HistoricalQualityReportDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closedSuccess, setClosedSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/projects/PROJ-OIL-2026-01/closure-report');
        const json = await res.json();
        if (json.success) {
          setReport(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch closure report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen]);

  const handleCloseProject = async () => {
    setClosing(true);
    try {
      const res = await fetch('/api/v1/projects/PROJ-OIL-2026-01/close', {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setClosedSuccess(true);
        if (onProjectClosed) onProjectClosed();
      }
    } catch (err) {
      console.error('Failed to initiate project closure:', err);
    } finally {
      setClosing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0d131f] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Institutional Memory Ingestion
              </span>
              <span className="text-xs font-mono text-slate-400">PROJ-OIL-2026-01</span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mt-1">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Project Closure & Data Quality Gate</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {closedSuccess ? (
          <div className="p-6 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-200">
              Institutional Memory Extraction Complete
            </h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Verified completed tasks have been normalized and committed to the Oil India organizational intelligence repository with complete backward evidence lineage.
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition"
              >
                Return to Intelligence View
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Project closure evaluates all completed schedule activities and field reports against strict institutional memory quality gates before promoting records to organizational benchmarks.
            </p>

            {/* Quality Report Breakdown */}
            {report && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                  <span>HISTORICAL DATA QUALITY REPORT</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    Status: {report.closureStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Completed Activities</span>
                    <span className="font-mono font-bold text-slate-200">{report.activitiesCompleted}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-emerald-400 font-semibold">Eligible for History</span>
                    <span className="font-mono font-bold text-emerald-400">{report.eligibleForHistory}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Missing Actual Start</span>
                    <span className="font-mono text-slate-400">{report.missingActualStart}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Missing Actual End</span>
                    <span className="font-mono text-slate-400">{report.missingActualEnd}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Missing Quantities</span>
                    <span className="font-mono text-slate-400">{report.missingQuantity}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                    <span className="text-amber-400">Undocumented Delays</span>
                    <span className="font-mono text-amber-300">{report.unknownDelayCause}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 italic">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Unverified or incomplete activities will be classified as INSUFFICIENT_HISTORY and excluded from duration statistics.
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseProject}
                disabled={closing}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{closing ? 'Extracting Memory...' : 'Close Project & Ingest Memory'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
