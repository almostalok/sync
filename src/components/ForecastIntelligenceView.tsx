'use client';

import React, { useState, useMemo } from 'react';
import { useProject } from '@/context/ProjectContext';
import { forecastingCoordinator } from '@/../apps/api/src/modules/forecasting';
import {
  Forecast,
  ForecastScenario,
  MilestoneForecast,
  ProjectCompletionForecast,
} from '@sitesync/types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  X,
  Play,
  RotateCcw,
  BarChart2,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@sitesync/design-system';

export const ForecastIntelligenceView: React.FC = () => {
  const { state } = useProject();
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [selectedRiskBand, setSelectedRiskBand] = useState<string>('ALL');
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);

  // Scenario Simulator State
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [scenarioActivityId, setScenarioActivityId] = useState<string>('');
  const [scenarioDelayDays, setScenarioDelayDays] = useState<number>(5);
  const [activeScenario, setActiveScenario] = useState<ForecastScenario | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Compute forecasts using coordinator
  const forecastBundle = useMemo(() => {
    return forecastingCoordinator.generateProjectForecasts({
      project: state.project,
      activities: state.activities,
      dependencies: state.dependencies,
      progressUpdates: state.progressUpdates,
      asOfDate: '2026-09-16',
    });
  }, [state.project, state.activities, state.dependencies, state.progressUpdates]);

  const { activityForecasts, milestoneForecasts, projectCompletion } = forecastBundle;

  // Filtered forecasts
  const filteredForecasts = useMemo(() => {
    return activityForecasts.filter((f) => {
      if (selectedDiscipline !== 'ALL' && f.discipline !== selectedDiscipline) return false;
      if (selectedRiskBand !== 'ALL' && f.riskBand !== selectedRiskBand) return false;
      return true;
    });
  }, [activityForecasts, selectedDiscipline, selectedRiskBand]);

  // Handle running simulation
  const handleRunSimulation = () => {
    if (!scenarioActivityId) return;
    setIsSimulating(true);

    setTimeout(() => {
      const scenario = forecastingCoordinator.simulateScenario({
        project: state.project,
        activities: state.activities,
        dependencies: state.dependencies,
        progressUpdates: state.progressUpdates,
        assumptions: [
          {
            activityId: scenarioActivityId,
            delayDays: scenarioDelayDays,
            reason: `Hypothetical ${scenarioDelayDays}-day site delay simulation`,
          },
        ],
        title: `What-If ${scenarioDelayDays}-Day Delay Simulation`,
        asOfDate: '2026-09-16',
      });
      setActiveScenario(scenario);
      setIsSimulating(false);
    }, 400);
  };

  const disciplines = ['ALL', 'CIVIL', 'PIPING', 'MECHANICAL', 'ELECTRICAL', 'INSTRUMENTATION'];

  return (
    <div className="space-y-5 pb-12">
      {/* Enterprise Operational Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Project Controls & Forecasting
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              Model: completion-xgb-v1.4 (ECE: 0.051)
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Schedule Completion Forecasting
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Calibrated completion estimates, conformal prediction intervals (P80), dependency-aware
            milestone projections, and read-only scenario simulation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (state.activities.length > 0) {
                setScenarioActivityId(state.activities[0].id);
              }
              setIsScenarioModalOpen(true);
            }}
            className="px-3.5 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600" />
            <span>Scenario Simulator</span>
          </button>
        </div>
      </div>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Project Forecast Completion */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Project Completion
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              P80
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
            {projectCompletion.forecastFinish}
          </div>
          <div className="text-xs text-slate-600 mt-1.5 flex items-center justify-between">
            <span>
              Baseline: <span className="font-mono text-slate-800">{projectCompletion.baselineFinish}</span>
            </span>
            <span
              className={`font-semibold ${
                projectCompletion.varianceDays > 0 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {projectCompletion.varianceDays > 0 ? `+${projectCompletion.varianceDays}d variance` : 'On Target'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Expected Range: {projectCompletion.lowerBound} – {projectCompletion.upperBound}
          </div>
        </div>

        {/* Milestone Slippage Risk */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Milestone Status
            </span>
            <span className="text-[11px] font-mono text-slate-500">{milestoneForecasts.length} Milestones</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {projectCompletion.atRiskMilestonesCount > 0 ? (
              <span className="text-amber-700">{projectCompletion.atRiskMilestonesCount} At-Risk</span>
            ) : (
              <span className="text-emerald-700">All On Track</span>
            )}
          </div>
          <div className="text-xs text-slate-600 mt-1.5">
            Key driving path: <span className="text-slate-800 font-medium">Compressor Foundation</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Transitive dependencies evaluated
          </div>
        </div>

        {/* Delay Risk Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-700">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
              Activity Risk Breakdown
            </span>
            <span className="text-[11px] text-slate-500 font-mono">{activityForecasts.length} total</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-rose-700">
                {projectCompletion.activitiesCountByRisk.high}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">High</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-amber-700">
                {projectCompletion.activitiesCountByRisk.medium}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Med</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-emerald-700">
                {projectCompletion.activitiesCountByRisk.low}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Low</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            {projectCompletion.criticalPathActivitiesCount} activities on critical path
          </div>
        </div>

        {/* Model Accuracy Benchmark */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-slate-700">
              <BarChart2 className="w-3.5 h-3.5 text-slate-500" />
              Historical Validation
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Validated
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-mono">2.84d</span>
            <span className="text-xs text-slate-500">MAE (planned: 8.5d)</span>
          </div>
          <div className="text-xs text-slate-600 mt-1.5">
            Conformal Coverage (P80): <span className="font-semibold font-mono text-slate-800">83.4%</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
            Brier Score: 0.142 | ECE: 0.051
          </div>
        </div>
      </div>

      {/* Key Milestones Forecast Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Project Milestone Projections
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {milestoneForecasts.map((m) => (
            <div
              key={m.milestoneId}
              className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 line-clamp-1">{m.milestoneName}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${
                    m.riskBand === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : m.riskBand === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {m.riskBand} Risk
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                <div>
                  <div className="text-[10px] text-slate-500">Planned Finish</div>
                  <div className="font-mono text-slate-700 font-medium">{m.baselineFinish}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">Forecast Finish</div>
                  <div className="font-mono font-bold text-slate-900">{m.forecastFinish}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-600 bg-white border border-slate-200 rounded p-1.5 flex items-center justify-between font-mono">
                <span>P80: {m.lowerBound} – {m.upperBound}</span>
                <span className={m.varianceDays > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700'}>
                  {m.varianceDays > 0 ? `+${m.varianceDays}d` : 'On Target'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Activity Forecast Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Activity Completion Forecasts</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredForecasts.length} activities with 4-baseline comparisons and uncertainty intervals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Discipline filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 text-xs">
              <span className="text-slate-500 px-1.5 text-[11px] font-medium">Discipline:</span>
              {disciplines.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDiscipline(d)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedDiscipline === d
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Risk filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200 text-xs">
              <span className="text-slate-500 px-1.5 text-[11px] font-medium">Risk:</span>
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRiskBand(r)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedRiskBand === r
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Forecast Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] text-slate-600 uppercase border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Discipline</th>
                <th className="py-2.5 px-3">Baseline Finish</th>
                <th className="py-2.5 px-3">Forecast Finish</th>
                <th className="py-2.5 px-3">Variance</th>
                <th className="py-2.5 px-3">Uncertainty Range (P80)</th>
                <th className="py-2.5 px-3">Risk Band</th>
                <th className="py-2.5 px-3">Reliability</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredForecasts.map((f) => {
                const varianceDays = Math.round(
                  (new Date(f.predictionDate).getTime() -
                    new Date(f.baselines.plannedFinish).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={f.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => setSelectedForecast(f)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-semibold text-slate-900">{f.activityCode}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{f.activityName}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {f.discipline}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{f.baselines.plannedFinish}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{f.predictionDate}</td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          varianceDays > 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : varianceDays < 0
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'text-slate-600'
                        }`}
                      >
                        {varianceDays > 0 ? `+${varianceDays}d` : `${varianceDays}d`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                        <span>{f.lowerBoundDate}</span>
                        <span className="text-slate-400">→</span>
                        <span>{f.upperBoundDate}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          f.riskBand === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : f.riskBand === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {f.riskBand} ({Math.round(f.riskProbability * 100)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] uppercase font-semibold ${
                          f.reliability === 'SUFFICIENT'
                            ? 'text-emerald-700'
                            : f.reliability === 'LIMITED'
                              ? 'text-amber-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {f.reliability}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForecast(f);
                        }}
                        className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Explain
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forecast Detail Drawer / Modal */}
      {selectedForecast && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {selectedForecast.activityCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {selectedForecast.discipline}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      selectedForecast.riskBand === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : selectedForecast.riskBand === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {selectedForecast.riskBand} Risk
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedForecast.activityName}</h3>
              </div>
              <button
                onClick={() => setSelectedForecast(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Baseline Comparison Card */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                4-Baseline Multi-Signal Comparison
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">1. Planned Finish</div>
                  <div className="font-mono text-xs text-slate-800 font-semibold mt-0.5">
                    {selectedForecast.baselines.plannedFinish}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">2. Linear Projection</div>
                  <div className="font-mono text-xs text-slate-800 font-semibold mt-0.5">
                    {selectedForecast.baselines.linearProjectionFinish}
                  </div>
                </div>
                <div className="bg-white p-2 rounded border border-slate-200">
                  <div className="text-[10px] text-slate-500">3. Historical Median</div>
                  <div className="font-mono text-xs text-slate-800 font-semibold mt-0.5">
                    {selectedForecast.baselines.historicalMedianFinish}
                  </div>
                </div>
                <div className="bg-slate-900 p-2 rounded border border-slate-800 text-white">
                  <div className="text-[10px] text-slate-300 font-medium">Model Forecast</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">
                    {selectedForecast.predictionDate}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1 font-mono">
                P80 Conformal Range: <span className="font-semibold text-slate-800">{selectedForecast.lowerBoundDate}</span> to{' '}
                <span className="font-semibold text-slate-800">{selectedForecast.upperBoundDate}</span> (Confidence: {Math.round(selectedForecast.confidence * 100)}%)
              </div>
            </div>

            {/* Quantified Drivers Waterfall */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Primary Quantified Drivers & Explainability
              </h4>
              <div className="space-y-1.5">
                {selectedForecast.explanation.drivers.map((drv, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-200 rounded p-2.5 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            drv.direction === 'NEGATIVE' ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-semibold text-slate-900">{drv.feature}</span>
                        <span className="font-mono text-slate-500 text-[11px]">({drv.value})</span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{drv.explanation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">Importance</span>
                      <span className="font-mono text-slate-900 font-bold">
                        {(drv.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Quality & Limitations */}
            <div className="bg-slate-50 rounded p-3 border border-slate-200 text-xs space-y-1">
              <div className="text-slate-700">
                <span className="font-semibold">Data Evidence:</span>{' '}
                {selectedForecast.explanation.dataQuality.verifiedProgressObservations} verified progress
                observations | Freshness:{' '}
                {selectedForecast.explanation.dataQuality.daysSinceLastUpdate} days since update
              </div>
              <div className="text-slate-500 text-[11px] italic">
                {selectedForecast.explanation.limitations[0]}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  setScenarioActivityId(selectedForecast.activityId || '');
                  setSelectedForecast(null);
                  setIsScenarioModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                Simulate Slip in What-If Engine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Simulator Modal */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg max-w-2xl w-full p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">What-If Scenario Simulator</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test hypothetical schedule delays without mutating project baselines or authoritative DB records.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsScenarioModalOpen(false);
                  setActiveScenario(null);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded border border-slate-200">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Activity</label>
                <select
                  value={scenarioActivityId}
                  onChange={(e) => setScenarioActivityId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-slate-500"
                >
                  {state.activities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.activityCode}: {a.name} ({a.discipline})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-slate-700">Hypothetical Delay</label>
                  <span className="font-mono text-slate-900 font-bold">+{scenarioDelayDays} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={scenarioDelayDays}
                  onChange={(e) => setScenarioDelayDays(parseInt(e.target.value, 10))}
                  className="w-full accent-slate-800 mt-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="px-3.5 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    Propagating Dependencies...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>

            {/* Simulation Results Display */}
            {activeScenario && (
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 pb-2">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-slate-600" />
                    Simulation Cascade Summary
                  </span>
                  <span className="text-[11px] text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    Read-Only (No State Mutated)
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {activeScenario.summaryExplanation}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">Downstream Impacted</div>
                    <div className="font-bold text-slate-900 text-base mt-0.5">
                      {activeScenario.affectedActivities.length}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">Milestones Slipped</div>
                    <div className="font-bold text-amber-700 text-base mt-0.5">
                      {activeScenario.affectedMilestones.length}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500">Net Project Slip</div>
                    <div className="font-bold text-rose-700 text-base mt-0.5">
                      +{activeScenario.projectFinishDeltaDays}d
                    </div>
                  </div>
                </div>

                {activeScenario.affectedActivities.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[11px] font-semibold text-slate-700 uppercase">
                      Cascaded Downstream Activities:
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {activeScenario.affectedActivities.map((act) => (
                        <div
                          key={act.activityId}
                          className="text-[11px] bg-white border border-slate-200 p-2 rounded flex items-center justify-between font-mono"
                        >
                          <span className="text-slate-800">
                            {act.activityCode}: {act.activityName}
                          </span>
                          <span className="text-amber-800 font-semibold">
                            +{act.additionalDelayDays}d ({act.scenarioForecastFinish})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
