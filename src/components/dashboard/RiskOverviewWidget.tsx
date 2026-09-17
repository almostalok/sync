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
          <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-red-100 text-red-950 border border-red-800">
            [CRITICAL]
          </span>
        );
      case RiskSeverity.HIGH:
        return (
          <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-200 text-amber-950 border border-amber-800">
            [HIGH]
          </span>
        );
      case RiskSeverity.MEDIUM:
        return (
          <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-slate-900 border border-slate-600">
            [MEDIUM]
          </span>
        );
      case RiskSeverity.LOW:
        return (
          <span className="px-1.5 py-0.2 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-slate-700 border border-slate-400">
            [LOW]
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-slate-900 pb-2.5">
        <div>
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
            // FLOAT_&_DEPENDENCY_RISK_REGISTER
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
            Automated float consumption and critical path slippage tracking
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', RiskSeverity.CRITICAL, RiskSeverity.HIGH, RiskSeverity.MEDIUM].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase transition border ${
                filterSeverity === sev
                  ? 'bg-black text-white border-black shadow-[1px_1px_0px_#000]'
                  : 'bg-stone-100 text-slate-800 border-slate-300 hover:bg-stone-200'
              }`}
            >
              [{sev}]
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded-none border border-red-800 bg-red-50 text-center">
          <div className="text-[9px] uppercase font-bold text-red-950 font-mono">CRITICAL_RISKS</div>
          <div className="text-base font-black text-red-950 font-mono">[{riskOverview.summary?.critical ?? 0}]</div>
        </div>
        <div className="p-2 rounded-none border border-amber-800 bg-amber-50 text-center">
          <div className="text-[9px] uppercase font-bold text-amber-950 font-mono">HIGH_RISKS</div>
          <div className="text-base font-black text-amber-950 font-mono">[{riskOverview.summary?.high ?? 0}]</div>
        </div>
        <div className="p-2 rounded-none border border-slate-400 bg-stone-100 text-center">
          <div className="text-[9px] uppercase font-bold text-slate-700 font-mono">MEDIUM_RISKS</div>
          <div className="text-base font-black text-slate-900 font-mono">[{riskOverview.summary?.medium ?? 0}]</div>
        </div>
        <div className="p-2 rounded-none border border-slate-900 bg-white text-center">
          <div className="text-[9px] uppercase font-bold text-slate-900 font-mono">TOTAL_FLAGGED</div>
          <div className="text-base font-black text-slate-950 font-mono">[{riskOverview.summary?.total ?? riskOverview.risks.length}]</div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="overflow-x-auto border-[1.5px] border-slate-900 rounded-none shadow-[1px_1px_0px_#0f172a]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-stone-100 border-b-[1.5px] border-slate-900 text-slate-900 text-[10px] uppercase font-bold">
            <tr>
              <th className="py-2 px-3 border-r border-slate-300">SEVERITY</th>
              <th className="py-2 px-3 border-r border-slate-300">TRIGGER_DESCRIPTION</th>
              <th className="py-2 px-3 border-r border-slate-300">TARGET_NODE</th>
              <th className="py-2 px-3 border-r border-slate-300">SCORE</th>
              <th className="py-2 px-3 border-r border-slate-300">DOWNSTREAM_IMPACT</th>
              <th className="py-2 px-3 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredRisks.map((risk) => (
              <tr key={risk.id} className="hover:bg-amber-50/50 transition">
                <td className="py-2 px-3 whitespace-nowrap border-r border-slate-200">
                  {getSeverityBadge(risk.severity)}
                </td>
                <td className="py-2 px-3 border-r border-slate-200">
                  <div className="font-bold text-slate-950 uppercase">{risk.trigger}</div>
                  <div className="text-[10px] text-slate-600 font-mono">[{risk.id}] · TYPE: {risk.riskType}</div>
                </td>
                <td className="py-2 px-3 border-r border-slate-200">
                  <button
                    onClick={() => onSelectActivity && onSelectActivity(risk.activityId)}
                    className="font-mono font-bold text-slate-950 underline hover:bg-amber-100"
                  >
                    [{risk.activityCode}]
                  </button>
                  <div className="text-[10px] text-slate-600 truncate max-w-[220px] uppercase font-sans">{risk.activityName}</div>
                </td>
                <td className="py-2 px-3 font-mono font-black text-red-700 border-r border-slate-200">
                  [{risk.score}/100]
                </td>
                <td className="py-2 px-3 text-slate-700 border-r border-slate-200">
                  <span className="font-bold text-slate-950 font-mono">[{risk.explanation.affectedDownstreamCount}]</span> NODES
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => setSelectedRisk(risk)}
                    className="text-slate-950 hover:bg-stone-200 border border-slate-900 px-2 py-0.5 font-bold text-[10px] uppercase active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    [INSPECT]
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Detail Modal / Drawer */}
      {selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 font-mono">
          <div className="bg-white rounded-none border-[2px] border-slate-900 shadow-[4px_4px_0px_#000] max-w-xl w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedRisk.severity)}
                <span className="font-black text-xs uppercase text-slate-950">[{selectedRisk.trigger}]</span>
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
                  // CAUSALITY_AND_IMPACT_ANALYSIS:
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
                  <div className="font-mono font-bold text-red-700">[SCORE: {selectedRisk.score}/100]</div>
                  <div className="text-[10px] text-slate-600 font-mono">[{selectedRisk.explanation.affectedDownstreamCount} Downstream Nodes]</div>
                </div>
              </div>

              {selectedRisk.explanation.recommendedAction && (
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-600 block mb-1">
                    // OPERATIONAL_MITIGATION_STRATEGY:
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
                className="px-3 py-1.5 rounded-none bg-black hover:bg-slate-800 text-white font-bold uppercase text-xs border border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
