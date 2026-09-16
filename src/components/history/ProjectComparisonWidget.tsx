'use client';

import React from 'react';
import { ProjectComparisonDTO, ProjectComparisonItemDTO } from '@sitesync/types';
import { 
  Building2, 
  Layers, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  MapPin,
  BarChart2
} from 'lucide-react';

interface Props {
  data: ProjectComparisonDTO | null;
  loading: boolean;
}

export const ProjectComparisonWidget: React.FC<Props> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="glass-card rounded-2xl border border-slate-800 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-900 rounded" />
        <div className="h-48 bg-slate-900/60 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-5 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            Cross-Project Historical Performance Matrix
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Comparative execution benchmarks across completed Oil India capital infrastructure facilities.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-3.5">Project Code & Facility</th>
              <th className="py-3 px-3">Location</th>
              <th className="py-3 px-3 text-center">Completed Tasks</th>
              <th className="py-3 px-3 text-center">Avg Duration</th>
              <th className="py-3 px-3 text-center">Median Variance</th>
              <th className="py-3 px-3 text-center">Delay Rate</th>
              <th className="py-3 px-3">Dominant Delay Cause</th>
              <th className="py-3 px-3">Discipline Mix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data.projects.map((proj) => (
              <tr key={proj.projectId} className="hover:bg-slate-900/60 transition">
                <td className="py-3 px-3.5">
                  <div className="font-bold text-slate-100">{proj.projectName}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{proj.projectCode}</div>
                </td>

                <td className="py-3 px-3 text-slate-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{proj.location}</span>
                  </div>
                </td>

                <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                  {proj.completedActivities}
                </td>

                <td className="py-3 px-3 text-center font-mono text-cyan-300">
                  {proj.averageDurationDays}d
                </td>

                <td className="py-3 px-3 text-center font-mono font-bold">
                  <span
                    className={
                      proj.medianVarianceDays > 0
                        ? 'text-rose-400'
                        : proj.medianVarianceDays < 0
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }
                  >
                    {proj.medianVarianceDays > 0 ? `+${proj.medianVarianceDays}` : proj.medianVarianceDays}d
                  </span>
                </td>

                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          proj.delayRatePercentage > 30 ? 'bg-rose-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${proj.delayRatePercentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-slate-300">
                      {proj.delayRatePercentage}%
                    </span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {proj.topDelayCause}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(proj.disciplineMix).map(([disc, count]) => (
                      <span
                        key={disc}
                        className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-mono"
                      >
                        {disc[0]}:{count}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
