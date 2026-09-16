'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { traceDownstreamCascade } from '@/lib/schedule/graphEngine';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Flame, 
  GitBranch, 
  Layers, 
  ShieldAlert, 
  Sliders, 
  TrendingDown, 
  Zap 
} from 'lucide-react';

export const RiskRadarView: React.FC = () => {
  const { state, selectActivity, setActiveView } = useProject();
  const [selectedRiskActivityId, setSelectedRiskActivityId] = useState<string>('CIV-EXC-042');

  const highRisks = state.risks.filter(r => r.severity === 'HIGH');
  const mediumRisks = state.risks.filter(r => r.severity === 'MEDIUM');

  // Compute downstream cascade for the selected activity
  const cascade = traceDownstreamCascade(selectedRiskActivityId, state.activities, state.dependencies);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Schedule Risk Radar & Cascade Analyzer
            </span>
            <span className="text-xs text-slate-400">{state.risks.length} Active Risk Signals</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Real-time Schedule Slippage, Stale Activities & Downstream Impact
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-rose-400 font-bold bg-rose-950/60 px-2.5 py-1.5 rounded-xl border border-rose-800">
            <Flame className="w-4 h-4" />
            <span>{highRisks.length} High Severity</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1.5 rounded-xl border border-amber-800">
            <Clock className="w-4 h-4" />
            <span>{state.staleActivities.length} Stale Updates</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Risk Signals vs Right Cascade Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 cols: Active Risk Signals List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Critical Slippages</span>
              <span className="text-xs text-slate-500">{state.risks.length} signals</span>
            </div>

            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {state.risks.map(risk => {
                const isSelected = risk.activityId === selectedRiskActivityId;
                return (
                  <div
                    key={risk.id}
                    onClick={() => {
                      setSelectedRiskActivityId(risk.activityId);
                      selectActivity(risk.activityId);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer transition border space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-rose-500/80 shadow-md shadow-rose-950'
                        : 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-xs text-rose-300">{risk.activityCode}</span>
                        <span className="text-xs font-semibold text-slate-200 truncate">{risk.activityName}</span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        risk.severity === 'HIGH' ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {risk.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {risk.impactDescription}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>Discipline: <strong>{risk.discipline}</strong></span>
                      <span className="text-rose-400 font-bold">Lag: +{risk.varianceDays} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Downstream Cascade Propagation Analyzer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400">Dependency Cascade Simulation</span>
                <h3 className="text-base font-bold text-white">
                  Downstream Impact of {cascade?.sourceActivityName || 'Selected Activity'}
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950/80 border border-rose-700 text-rose-300">
                +{cascade?.sourceDelayDays || 4} Days Initial Delay
              </span>
            </div>

            {cascade && cascade.affectedActivities.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  When <strong>{cascade.sourceActivityName}</strong> slips by <strong>+{cascade.sourceDelayDays} days</strong>, the CPM critical path calculation propagates delay to the following successor activities:
                </p>

                <div className="space-y-2.5">
                  {cascade.affectedActivities.map((aff, idx) => (
                    <div
                      key={aff.activityId}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-rose-400">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-bold text-xs text-cyan-300">{aff.activityCode}</span>
                          <span className="text-xs font-semibold text-slate-200">{aff.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                          +{aff.delayDays}d Cascade
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pl-7">
                        <span>Original Planned Start: <span className="text-slate-300">{aff.plannedStart}</span></span>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-400" />
                        <span>Projected Start: <strong className="text-rose-400">{aff.newProjectedStart}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-slate-300 flex items-center justify-between">
                  <span>Want recommendations on how to compress schedule?</span>
                  <button
                    onClick={() => setActiveView('copilot')}
                    className="px-3 py-1 rounded-lg bg-purple-900/80 hover:bg-purple-800 text-purple-200 font-semibold text-[11px] transition"
                  >
                    Ask Copilot →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <ShieldAlert className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200">No Critical Downstream Cascades</h4>
                <p className="text-xs text-slate-500">This activity does not push immediate successor milestones.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
