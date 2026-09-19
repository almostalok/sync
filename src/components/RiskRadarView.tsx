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
    <div className="space-y-5 pb-16 font-mono">
      {/* Top Banner */}
      <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-rose-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-600 border border-slate-900 inline-block"></span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold tracking-wider uppercase bg-stone-100 text-slate-900 border border-slate-900">
              [CRITICAL_FLOAT_RADAR]
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              [{state.risks.length} ACTIVE_RISK_SIGNALS]
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
            REAL-TIME SCHEDULE SLIPPAGE &amp; DOWNSTREAM IMPACT CASCADE
          </h1>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Deterministic CPM float analysis detects schedule delay propagation across interdependent engineering packages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-rose-800 bg-rose-50 text-rose-950 font-black font-mono shadow-[1px_1px_0px_#9f1239]">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />
            <span>[{highRisks.length} CRITICAL/HIGH]</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-none border-[1.5px] border-amber-800 bg-amber-50 text-amber-950 font-black font-mono shadow-[1px_1px_0px_#b45309]">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>[{state.staleActivities.length} STALE_DPR]</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Risk Signals vs Right Cascade Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5 cols: Active Risk Signals List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] border-t-4 border-t-rose-600">
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
              <span className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                {'// FLAGGED_SLIPPAGES'} ({state.risks.length})
              </span>
              <span className="text-[10px] text-slate-700 font-bold uppercase font-mono">[RANK: FLOAT_LAG]</span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {state.risks.map(risk => {
                const isSelected = risk.activityId === selectedRiskActivityId;
                const riskBorder = risk.severity === 'HIGH' ? 'border-l-[5px] border-l-rose-600 bg-rose-50/20' : 'border-l-[5px] border-l-amber-500 bg-amber-50/20';

                return (
                  <div
                    key={risk.id}
                    onClick={() => {
                      setSelectedRiskActivityId(risk.activityId);
                      selectActivity(risk.activityId);
                    }}
                    className={`p-3 rounded-none cursor-pointer transition border-[1.5px] space-y-1.5 text-xs font-mono shadow-[1px_1px_0px_#0f172a] ${riskBorder} ${
                      isSelected
                        ? 'border-slate-950 shadow-[2px_2px_0px_#000] ring-2 ring-black'
                        : 'border-slate-300 hover:border-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-black text-xs text-blue-900">[{risk.activityCode}]</span>
                        <span className="text-xs font-bold text-slate-950 uppercase truncate font-sans">{risk.activityName}</span>
                      </div>

                      <span className={`px-1.5 py-0.2 rounded-none text-[9px] font-black shrink-0 uppercase border ${
                        risk.severity === 'HIGH'
                          ? 'bg-rose-200 text-rose-950 border-rose-600'
                          : 'bg-amber-200 text-amber-950 border-amber-600'
                      }`}>
                        [{risk.severity}]
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-800 leading-relaxed font-sans">
                      {risk.impactDescription}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-700 pt-1 border-t border-slate-200 font-mono">
                      <span>DISC: <strong className="text-slate-950 uppercase font-mono">[{risk.discipline}]</strong></span>
                      <span className="text-rose-700 font-black font-mono">FLOAT_LAG: +{risk.varianceDays}D</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 7 cols: Downstream Cascade Propagation Analyzer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-5 space-y-4 shadow-[2px_2px_0px_#0f172a] border-t-4 border-t-slate-900 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-slate-900 pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                  {'// CPM_NETWORK_PROPAGATION:'}
                </span>
                <h3 className="text-sm md:text-base font-black text-slate-950 uppercase font-mono">
                  DOWNSTREAM IMPACT OF [{cascade?.sourceActivityName || 'SELECTED_ACTIVITY'}]
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-none text-xs font-black bg-rose-200 border border-rose-700 text-rose-950 font-mono shadow-[1px_1px_0px_#000]">
                +{cascade?.sourceDelayDays || 4}D INITIAL_DELAY
              </span>
            </div>

            {cascade && cascade.affectedActivities.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  When <strong>{cascade.sourceActivityName}</strong> slips by <strong>+{cascade.sourceDelayDays} days</strong>, CPM calculation propagates delay to the following successor activities:
                </p>

                <div className="space-y-2">
                  {cascade.affectedActivities.map((aff, idx) => (
                    <div
                      key={aff.activityId}
                      className="p-3 rounded-none border-[1.5px] border-slate-300 bg-stone-50 space-y-1.5 text-xs font-mono border-l-4 border-l-rose-500 shadow-[1px_1px_0px_#0f172a]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-none bg-black text-white flex items-center justify-center text-[10px] font-black font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-mono font-black text-blue-900">[{aff.activityCode}]</span>
                          <span className="font-bold text-slate-950 uppercase font-sans">{aff.name}</span>
                        </div>
                        <span className="text-[10px] font-black font-mono text-rose-950 bg-rose-100 px-2 py-0.5 rounded-none border border-rose-400">
                          +{aff.delayDays}D CASCADE
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-700 pl-7 font-mono">
                        <span>PLAN: <span className="text-slate-950 font-bold">{aff.plannedStart}</span></span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span>PROJECTED: <strong className="text-rose-700 font-bold">{aff.newProjectedStart}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-none border-[1.5px] border-slate-900 bg-amber-50 text-xs text-slate-900 flex items-center justify-between font-mono shadow-[1px_1px_0px_#0f172a]">
                  <span className="font-bold text-[11px]">SCHEDULE COMPRESSION RECOMMENDATIONS?</span>
                  <button
                    onClick={() => setActiveView('copilot')}
                    className="px-3 py-1 rounded-none bg-black hover:bg-slate-800 text-white font-bold text-xs uppercase transition shadow-[1px_1px_0px_#000]"
                  >
                    [PROJECT_DOSSIER →]
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 space-y-2 font-mono">
                <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-black text-slate-900 uppercase">NO_CRITICAL_DOWNSTREAM_CASCADES</h4>
                <p className="text-[11px] text-slate-600 font-sans">This activity does not push immediate successor milestones.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
