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
import { StatusBadge } from '../../../packages/design-system/components/StatusBadge';

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
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRisks = riskOverview.risks.filter((r) => {
    const matchesSev = filterSeverity === 'ALL' || r.severity === filterSeverity;
    const matchesQuery = !searchQuery.trim() || 
      r.trigger.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.activityCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.riskType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSev && matchesQuery;
  });

  const getSeverityVariant = (sev: RiskSeverity) => {
    switch (sev) {
      case RiskSeverity.CRITICAL:
        return 'critical';
      case RiskSeverity.HIGH:
        return 'warning';
      case RiskSeverity.MEDIUM:
        return 'neutral';
      case RiskSeverity.LOW:
        return 'verified';
      default:
        return 'neutral';
    }
  };

  const getSeverityRowBorder = (sev: RiskSeverity) => {
    switch (sev) {
      case RiskSeverity.CRITICAL:
        return 'border-l-[5px] border-l-rose-600 bg-rose-50/30 hover:bg-rose-100/50';
      case RiskSeverity.HIGH:
        return 'border-l-[5px] border-l-amber-500 bg-amber-50/30 hover:bg-amber-100/50';
      case RiskSeverity.MEDIUM:
        return 'border-l-[5px] border-l-blue-600 bg-blue-50/20 hover:bg-blue-100/40';
      default:
        return 'border-l-[5px] border-l-slate-400 hover:bg-stone-100/50';
    }
  };

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3.5 shadow-[2px_2px_0px_#0f172a] font-mono border-t-4 border-t-rose-600">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-slate-900 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-600 border border-slate-900 inline-block"></span>
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// FLOAT_&_DEPENDENCY_RISK_REGISTER'}
            </h2>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            Automated float consumption and critical path slippage tracking · {filteredRisks.length} of {riskOverview.risks.length} risks shown
          </p>
        </div>

        {/* Search Bar + Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER_BY_CODE_OR_TRIGGER..."
            className="px-2 py-1 text-[10px] font-mono border-[1.5px] border-slate-900 bg-stone-50 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:outline-none w-52 shadow-[1px_1px_0px_#0f172a]"
          />
          <div className="flex items-center gap-1 text-xs">
            {['ALL', RiskSeverity.CRITICAL, RiskSeverity.HIGH, RiskSeverity.MEDIUM].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-1 rounded-none text-[10px] font-mono font-bold uppercase transition border-[1.5px] ${
                  filterSeverity === sev
                    ? 'bg-black text-white border-black shadow-[1.5px_1.5px_0px_#000]'
                    : 'bg-stone-100 text-slate-800 border-slate-900 hover:bg-stone-200'
                }`}
              >
                [{sev}]
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Summary KPI Cards (Click to filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setFilterSeverity(filterSeverity === RiskSeverity.CRITICAL ? 'ALL' : RiskSeverity.CRITICAL)}
          className={`p-2.5 rounded-none border-[1.5px] text-left transition ${
            filterSeverity === RiskSeverity.CRITICAL
              ? 'border-rose-900 bg-rose-200 shadow-[2px_2px_0px_#9f1239]'
              : 'border-rose-700 bg-rose-50 hover:bg-rose-100/70'
          } border-t-4 border-t-rose-600`}
        >
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-rose-950 font-mono">
            <span>CRITICAL_RISKS</span>
            <span className="text-[8px] bg-rose-700 text-white px-1">IMMEDIATE</span>
          </div>
          <div className="text-xl font-black text-rose-950 font-mono tabular-nums mt-1">
            [{riskOverview.summary?.critical ?? 0}]
          </div>
          <div className="text-[9px] text-rose-800 font-sans mt-0.5">Critical path blocked</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity(filterSeverity === RiskSeverity.HIGH ? 'ALL' : RiskSeverity.HIGH)}
          className={`p-2.5 rounded-none border-[1.5px] text-left transition ${
            filterSeverity === RiskSeverity.HIGH
              ? 'border-amber-900 bg-amber-200 shadow-[2px_2px_0px_#b45309]'
              : 'border-amber-600 bg-amber-50 hover:bg-amber-100/70'
          } border-t-4 border-t-amber-500`}
        >
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-amber-950 font-mono">
            <span>HIGH_RISKS</span>
            <span className="text-[8px] bg-amber-600 text-white px-1">FLOAT_LOSS</span>
          </div>
          <div className="text-xl font-black text-amber-950 font-mono tabular-nums mt-1">
            [{riskOverview.summary?.high ?? 0}]
          </div>
          <div className="text-[9px] text-amber-800 font-sans mt-0.5">Buffer &lt; 5 days</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity(filterSeverity === RiskSeverity.MEDIUM ? 'ALL' : RiskSeverity.MEDIUM)}
          className={`p-2.5 rounded-none border-[1.5px] text-left transition ${
            filterSeverity === RiskSeverity.MEDIUM
              ? 'border-blue-900 bg-blue-200 shadow-[2px_2px_0px_#1e40af]'
              : 'border-blue-600 bg-blue-50 hover:bg-blue-100/70'
          } border-t-4 border-t-blue-500`}
        >
          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-blue-950 font-mono">
            <span>MEDIUM_RISKS</span>
            <span className="text-[8px] bg-blue-600 text-white px-1">WATCHLIST</span>
          </div>
          <div className="text-xl font-black text-blue-950 font-mono tabular-nums mt-1">
            [{riskOverview.summary?.medium ?? 0}]
          </div>
          <div className="text-[9px] text-blue-800 font-sans mt-0.5">Pacing divergence</div>
        </button>

        <button
          type="button"
          onClick={() => setFilterSeverity('ALL')}
          className={`p-2.5 rounded-none border-[1.5px] text-left transition ${
            filterSeverity === 'ALL'
              ? 'border-slate-950 bg-slate-900 text-white shadow-[2px_2px_0px_#000]'
              : 'border-slate-900 bg-white text-slate-950 hover:bg-stone-100'
          } border-t-4 border-t-slate-900`}
        >
          <div className="flex items-center justify-between text-[9px] uppercase font-bold font-mono">
            <span>TOTAL_FLAGGED</span>
            <span className={`text-[8px] px-1 ${filterSeverity === 'ALL' ? 'bg-white text-black' : 'bg-black text-white'}`}>
              ALL
            </span>
          </div>
          <div className="text-xl font-black font-mono tabular-nums mt-1">
            [{riskOverview.summary?.total ?? riskOverview.risks.length}]
          </div>
          <div className={`text-[9px] font-sans mt-0.5 ${filterSeverity === 'ALL' ? 'text-slate-300' : 'text-slate-600'}`}>
            Live risk register
          </div>
        </button>
      </div>

      {/* Risk Register Table with High-Density UX */}
      <div className="overflow-x-auto border-[1.5px] border-slate-900 rounded-none shadow-[2px_2px_0px_#0f172a]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-stone-100 border-b-[1.5px] border-slate-900 text-slate-900 text-[10px] uppercase font-bold">
            <tr>
              <th className="py-2.5 px-3 border-r border-slate-300">SEVERITY</th>
              <th className="py-2.5 px-3 border-r border-slate-300">TRIGGER_DESCRIPTION</th>
              <th className="py-2.5 px-3 border-r border-slate-300">TARGET_NODE</th>
              <th className="py-2.5 px-3 border-r border-slate-300 min-w-[130px]">RISK_SCORE</th>
              <th className="py-2.5 px-3 border-r border-slate-300">DOWNSTREAM_IMPACT</th>
              <th className="py-2.5 px-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRisks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 font-mono text-xs">
                  NO_RISKS_MATCHING_CRITERIA: [{filterSeverity}] {searchQuery && `"${searchQuery}"`}
                </td>
              </tr>
            ) : (
              filteredRisks.map((risk) => {
                const scoreColor = 
                  risk.score >= 80 ? 'bg-rose-600' :
                  risk.score >= 50 ? 'bg-amber-500' : 'bg-blue-600';

                return (
                  <tr key={risk.id} className={`${getSeverityRowBorder(risk.severity)} transition`}>
                    <td className="py-2.5 px-3 whitespace-nowrap border-r border-slate-200">
                      <StatusBadge
                        status={getSeverityVariant(risk.severity)}
                        label={risk.severity}
                        size="sm"
                      />
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="font-bold text-slate-950 uppercase">{risk.trigger}</div>
                      <div className="text-[10px] text-slate-600 font-mono mt-0.5">
                        <span className="font-bold">[{risk.id}]</span> · <span className="bg-stone-200 px-1 py-0.2 border border-slate-300">{risk.riskType}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <button
                        onClick={() => onSelectActivity && onSelectActivity(risk.activityId)}
                        className="font-mono font-bold text-slate-950 hover:bg-amber-200 px-1 py-0.5 border border-transparent hover:border-slate-900 inline-flex items-center gap-1"
                        title="Jump to Gantt activity"
                      >
                        <span>[{risk.activityCode}]</span>
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                      </button>
                      <div className="text-[10px] text-slate-600 truncate max-w-[200px] font-sans">
                        {risk.activityName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="font-black text-slate-950 tabular-nums">[{risk.score}/100]</span>
                          <span className={`text-[8px] font-bold px-1 text-white ${scoreColor}`}>
                            {risk.score >= 80 ? 'CRITICAL' : risk.score >= 50 ? 'ELEVATED' : 'MODERATE'}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-stone-200 border border-slate-900 overflow-hidden">
                          <div
                            className={`h-full ${scoreColor}`}
                            style={{ width: `${Math.min(100, risk.score)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-950 px-1.5 py-0.5 bg-stone-100 border border-slate-900 text-[11px]">
                          {risk.explanation.affectedDownstreamCount}
                        </span>
                        <span className="text-[10px] text-slate-700 font-mono">
                          {risk.explanation.affectedDownstreamCount === 1 ? 'NODE_IMPACTED' : 'NODES_IMPACTED'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectActivity && onSelectActivity(risk.activityId)}
                          className="text-slate-900 bg-stone-100 hover:bg-stone-200 border border-slate-900 px-2 py-0.5 font-bold text-[10px] uppercase active:translate-x-[1px] active:translate-y-[1px]"
                          title="Open activity detail"
                        >
                          [GANTT]
                        </button>
                        <button
                          onClick={() => setSelectedRisk(risk)}
                          className="bg-black hover:bg-slate-800 text-white border border-black px-2 py-0.5 font-bold text-[10px] uppercase shadow-[1px_1px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                          title="View root cause analysis"
                        >
                          [INSPECT]
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Brutalist Risk Detail Modal */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 font-mono">
          <div className="bg-white rounded-none border-[2px] border-slate-900 shadow-[4px_4px_0px_#000] max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                <StatusBadge
                  status={getSeverityVariant(selectedRisk.severity)}
                  label={selectedRisk.severity}
                  size="sm"
                />
                <span className="font-black text-xs uppercase text-slate-950">
                  [{selectedRisk.trigger}]
                </span>
              </div>
              <button
                onClick={() => setSelectedRisk(null)}
                className="p-1 border border-slate-900 hover:bg-stone-100 text-slate-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">
                  {'// CAUSALITY_AND_IMPACT_ANALYSIS:'}
                </span>
                <p className="text-slate-900 leading-relaxed bg-stone-50 p-3 rounded-none border border-slate-400 font-sans">
                  {selectedRisk.explanation.whatHappened}
                </p>
                <p className="text-slate-700 text-[11px] mt-1 pl-1 font-sans">
                  {selectedRisk.explanation.whyItMatters}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border border-slate-400 bg-stone-50 space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">TARGET_NODE</span>
                  <div className="font-mono font-bold text-slate-950">[{selectedRisk.activityCode}]</div>
                  <div className="text-[10px] text-slate-600 font-sans truncate">{selectedRisk.activityName}</div>
                </div>

                <div className="p-2 border border-slate-400 bg-stone-50 space-y-0.5">
                  <span className="text-[9px] text-slate-500 uppercase font-bold">RISK_ASSESSMENT</span>
                  <div className="font-mono font-bold text-rose-700">[SCORE: {selectedRisk.score}/100]</div>
                  <div className="text-[10px] text-slate-600 font-mono">[{selectedRisk.explanation.affectedDownstreamCount} Downstream Nodes]</div>
                </div>
              </div>

              {selectedRisk.explanation.recommendedAction && (
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">
                    {'// OPERATIONAL_MITIGATION_STRATEGY:'}
                  </span>
                  <p className="text-slate-950 bg-amber-50 p-2.5 rounded-none border border-slate-900 text-xs font-sans">
                    {selectedRisk.explanation.recommendedAction}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t-[1.5px] border-slate-900">
              <button
                onClick={() => setSelectedRisk(null)}
                className="px-3 py-1.5 rounded-none border border-slate-900 hover:bg-stone-100 text-slate-900 font-bold uppercase text-xs"
              >
                [CLOSE]
              </button>
              <button
                onClick={() => {
                  const actId = selectedRisk.activityId;
                  setSelectedRisk(null);
                  if (onSelectActivity) onSelectActivity(actId);
                }}
                className="px-3 py-1.5 rounded-none bg-black hover:bg-slate-800 text-white font-bold uppercase text-xs border border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                [INSPECT_IN_GANTT]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
