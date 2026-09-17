'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { traceDownstreamCascade } from '@/lib/schedule/graphEngine';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  GitBranch, 
  Layers, 
  ShieldAlert, 
  CheckCircle2,
  Compass
} from 'lucide-react';

export const RiskRadarView: React.FC = () => {
  const { state, selectActivity, setActiveView } = useProject();
  const [selectedRiskActivityId, setSelectedRiskActivityId] = useState<string>('CIV-EXC-042');

  const highRisks = state.risks.filter(r => r.severity === 'HIGH');
  const mediumRisks = state.risks.filter(r => r.severity === 'MEDIUM');

  // Compute downstream cascade for the selected activity
  const cascade = traceDownstreamCascade(selectedRiskActivityId, state.activities, state.dependencies);

  return (
    <div className="space-y-5 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-50 text-red-800 border border-red-200">
              Schedule Risk Radar &amp; Controls
            </span>
            <span className="text-xs text-slate-500 font-medium">{state.risks.length} Active Risk Signals</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
            Real-time Schedule Slippage, Stale Activities &amp; Downstream Impact
          </h1>
          <p className="text-xs text-slate-600">
            Deterministic CPM float analysis detects schedule delay propagation across interdependent engineering packages.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-red-300 bg-red-50 text-red-900 font-bold font-mono">
            <AlertOctagon className="w-3.5 h-3.5 text-red-700" />
            <span>{highRisks.length} High Severity</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-amber-300 bg-amber-50 text-amber-900 font-bold font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>{state.staleActivities.length} Stale Updates</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Risk Signals vs Right Cascade Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 cols: Active Risk Signals List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Critical Slippages ({state.risks.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Ranked by Float Lag</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {state.risks.map(risk => {
                const isSelected = risk.activityId === selectedRiskActivityId;
                return (
                  <div
                    key={risk.id}
                    onClick={() => {
                      setSelectedRiskActivityId(risk.activityId);
                      selectActivity(risk.activityId);
                    }}
                    className={`p-3 rounded cursor-pointer transition border space-y-1.5 text-xs ${
                      isSelected
                        ? 'bg-red-50/60 border-red-600 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-xs text-blue-700">{risk.activityCode}</span>
                        <span className="text-xs font-semibold text-slate-900 truncate">{risk.activityName}</span>
                      </div>

                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 uppercase border ${
                        risk.severity === 'HIGH'
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {risk.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {risk.impactDescription}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Discipline: <strong className="text-slate-700 uppercase font-mono">{risk.discipline}</strong></span>
                      <span className="text-red-700 font-bold font-mono">Lag: +{risk.varianceDays}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Downstream Cascade Propagation Analyzer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Critical Path Propagation</span>
                <h3 className="text-base font-bold text-slate-900">
                  Downstream Impact of {cascade?.sourceActivityName || 'Selected Activity'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-bold bg-red-50 border border-red-300 text-red-900 font-mono">
                +{cascade?.sourceDelayDays || 4} Days Initial Delay
              </span>
            </div>

            {cascade && cascade.affectedActivities.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  When <strong>{cascade.sourceActivityName}</strong> slips by <strong>+{cascade.sourceDelayDays} days</strong>, the CPM network calculation propagates delay to the following successor activities:
                </p>

                <div className="space-y-2">
                  {cascade.affectedActivities.map((aff, idx) => (
                    <div
                      key={aff.activityId}
                      className="p-3 rounded border border-slate-200 bg-slate-50 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-[10px] font-bold font-mono text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-blue-700">{aff.activityCode}</span>
                          <span className="font-semibold text-slate-900">{aff.name}</span>
                        </div>
                        <span className="text-[10px] font-bold font-mono text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                          +{aff.delayDays}d Cascade
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pl-7 font-mono">
                        <span>Original Planned: <span className="text-slate-700">{aff.plannedStart}</span></span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>Projected Start: <strong className="text-red-700">{aff.newProjectedStart}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center justify-between">
                  <span>Need analytical assessment on schedule compression options?</span>
                  <button
                    onClick={() => setActiveView('copilot')}
                    className="px-3 py-1 rounded bg-[#0f2744] hover:bg-[#1a365d] text-white font-semibold text-xs transition shadow-sm"
                  >
                    Project Intelligence →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-800">No Critical Downstream Cascades</h4>
                <p className="text-xs text-slate-500">This activity does not push immediate successor milestones.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
