'use client';

import React, { useState } from 'react';
import { RiskDTO, RiskOverviewDTO, RiskSeverity, RiskType } from '@sitesync/types';
import { 
  ShieldAlert, 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  FileText, 
  Layers, 
  ChevronRight,
  Info,
  X,
  CheckCircle2,
} from 'lucide-react';


interface RiskOverviewWidgetProps {
  riskOverview: RiskOverviewDTO;
  onSelectActivity?: (activityId: string) => void;
}

export const RiskOverviewWidget: React.FC<RiskOverviewWidgetProps> = ({
  riskOverview,
  onSelectActivity,
}) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskDTO | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredRisks = filterSeverity === 'ALL'
    ? riskOverview.risks
    : riskOverview.risks.filter((r) => r.severity === filterSeverity);

  const getSeverityBadge = (sev: RiskSeverity) => {
    switch (sev) {
      case RiskSeverity.CRITICAL:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            CRITICAL
          </span>
        );
      case RiskSeverity.HIGH:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/40">
            HIGH
          </span>
        );
      case RiskSeverity.MEDIUM:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
            MEDIUM
          </span>
        );
      case RiskSeverity.LOW:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
            LOW
          </span>
        );
    }
  };

  const getRiskTypeLabel = (type: RiskType) => {
    switch (type) {
      case RiskType.SCHEDULE_DELAY:
        return 'Schedule Delay';
      case RiskType.PROGRESS_LAG:
        return 'Progress Deficit';
      case RiskType.STALE_UPDATE:
        return 'Stale Update (>48h)';
      case RiskType.DEPENDENCY_BLOCK:
        return 'Dependency Block';
      case RiskType.LOW_CONFIDENCE_MATCH:
        return 'Low Confidence Match';
      case RiskType.MISSING_UPDATE:
        return 'Missing Update';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Deterministic Risk Intelligence Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Explainable schedule delays, dependency blocks, and progress deficits
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filterSeverity === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({riskOverview.summary.total})
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filterSeverity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            Critical ({riskOverview.summary.critical})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filterSeverity === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-orange-400'
            }`}
          >
            High ({riskOverview.summary.high})
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition ${
              filterSeverity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            Medium ({riskOverview.summary.medium})
          </button>
        </div>
      </div>

      {/* Risk Items List */}
      <div className="space-y-2.5">
        {filteredRisks.slice(0, 6).map((risk) => (
          <div
            key={risk.id}
            onClick={() => setSelectedRisk(risk)}
            className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {getSeverityBadge(risk.severity)}
                <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {risk.activityCode}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {getRiskTypeLabel(risk.riskType)}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs font-bold text-white truncate max-w-md">
                  {risk.activityName}
                </span>
              </div>

              <div className="text-xs text-slate-300/90 line-clamp-1">
                {risk.trigger}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                <span>Impact: <strong className="text-slate-200">{risk.explanation.affectedDownstreamCount} downstream activities</strong></span>
                <span>•</span>
                <span>Score: <strong className="text-cyan-300 font-mono">{risk.score}/100</strong></span>
                <span>•</span>
                <span>Evidence: <strong className="text-slate-300">{risk.evidenceSources[0]?.documentName || 'Schedule'}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <span className="text-xs font-semibold text-cyan-400 group-hover:translate-x-0.5 transition flex items-center gap-1">
                Inspect Risk
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}

        {filteredRisks.length === 0 && (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-200">No active {filterSeverity.toLowerCase()} risks detected</div>
            <div className="text-xs text-slate-500">All evaluated deterministic criteria are within acceptable thresholds.</div>
          </div>
        )}
      </div>

      {/* Risk Detail Modal / Drawer */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getSeverityBadge(selectedRisk.severity)}
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedRisk.activityCode}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {getRiskTypeLabel(selectedRisk.riskType)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{selectedRisk.activityName}</h3>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Structured 5-Question Explainability */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-300 uppercase tracking-wider text-[10px]">1. What Happened?</span>
                <p className="text-slate-200 text-sm">{selectedRisk.explanation.whatHappened}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">2. Why Does It Matter?</span>
                <p className="text-slate-200 text-sm">{selectedRisk.explanation.whyItMatters}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px]">3. What Evidence Supports It?</span>
                <p className="text-slate-200">{selectedRisk.explanation.evidence}</p>
                {selectedRisk.evidenceSources.map((ev, idx) => (
                  <div key={idx} className="mt-2 p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <strong className="text-cyan-400">{ev.documentName}</strong> ({ev.pageOrLocation}): &quot;{ev.excerpt}&quot;
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px]">4. What Is Affected?</span>
                <p className="text-slate-200">
                  <strong className="text-white">{selectedRisk.explanation.affectedDownstreamCount}</strong> downstream successor activities are potentially impacted by this delay.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-cyan-500/20 space-y-1">
                <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">5. Recommended Action for Planner</span>
                <p className="text-slate-100 font-medium">{selectedRisk.explanation.recommendedAction}</p>
              </div>
            </div>

            {/* Explainable Score Breakdown */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Explainable Risk Factors Breakdown</span>
                <span className="font-mono font-bold text-cyan-400">Total Score: {selectedRisk.score} / 100</span>
              </div>
              <div className="space-y-1.5">
                {selectedRisk.factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">{f.label} ({String(f.value)})</span>
                    <span className="font-mono font-semibold text-slate-200">+{f.impactScore} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {onSelectActivity && (
                <button
                  onClick={() => {
                    const actId = selectedRisk.activityId;
                    setSelectedRisk(null);
                    onSelectActivity(actId);
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition active:scale-95"
                >
                  Locate in Gantt View
                </button>
              )}
              <button
                onClick={() => setSelectedRisk(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
